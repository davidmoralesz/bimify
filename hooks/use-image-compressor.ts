"use client"

import {
  useImageContext,
  type CompressedImage,
  type OriginalImage,
} from "@/contexts/image-context"
import { compressImage, formatFileSize, getEffectiveOutputType } from "@/lib/utils"
import JSZip from "jszip"
import { useCallback, useRef } from "react"
import { toast } from "sonner"

export function useImageCompressor() {
  const {
    originalImages,
    compressedImages,
    setCompressedImages,
    settings,
    isCompressing,
    setIsCompressing,
    processingQueue,
    setProcessingQueue,
    compressionErrors,
    setCompressionErrors,
    setOriginalImages,
  } = useImageContext()

  const isCompressingRef = useRef(false)
  const compressedImagesRef = useRef(compressedImages)
  compressedImagesRef.current = compressedImages

  // Track which images are currently being processed
  const processingImagesRef = useRef<Set<string>>(new Set())

  // Track which images have been processed in this session
  const processedImagesRef = useRef<Set<string>>(new Set())

  // Track toast IDs to prevent duplicate toasts
  const toastIdsRef = useRef<Record<string, string>>({})

  // Derived state
  const hasOriginalImages = originalImages.length > 0
  const hasCompressedImages = compressedImages.length > 0
  const hasUncompressedImages = originalImages.some(
    (img) => !compressedImages.find((c) => c.originalId === img.id)
  )

  // Helper function to show toast only once per operation
  const showToastOnce = useCallback(
    (key: string, message: string, type: "success" | "error" = "success") => {
      // If we already have a toast for this operation, dismiss it
      if (toastIdsRef.current[key]) {
        toast.dismiss(toastIdsRef.current[key])
      }

      // Show the new toast and store its ID
      const toastId =
        type === "success"
          ? toast.success(message, { id: `${key}-${Date.now()}` })
          : toast.error(message, { id: `${key}-${Date.now()}` })

      toastIdsRef.current[key] = toastId as string

      // Clean up after 3 seconds
      setTimeout(() => {
        delete toastIdsRef.current[key]
      }, 3000)
    },
    []
  )

  // Compress a single image
  const compressSingleImage = useCallback(
    async (image: OriginalImage) => {
      // Skip if this image is already being processed
      if (processingImagesRef.current.has(image.id)) {
        console.log(`[SKIP] Already processing: ${image.file.name}`)
        return null
      }

      // Skip if this image has already been processed (unless we're manually recompressing)
      if (processedImagesRef.current.has(image.id) && !isCompressingRef.current) {
        console.log(`[SKIP] Already processed: ${image.file.name}`)
        return null
      }

      // Mark this image as being processed
      processingImagesRef.current.add(image.id)

      try {
        // Add to processing queue state for UI feedback
        setProcessingQueue((prev) => {
          if (prev.includes(image.id)) return prev
          return [...prev, image.id]
        })

        // Determine output format
        let outputType = image.file.type

        if (settings.useWebP) {
          outputType = "image/webp"
        } else {
          outputType = getEffectiveOutputType(image.file.type, settings.quality / 100)
        }

        // Compress the image
        const compressedBlob = await compressImage(image.file, {
          maxWidth: settings.maxWidth,
          maxHeight: settings.maxHeight,
          quality: settings.quality / 100,
          outputType: outputType,
        })

        // Determine file extension
        let extension = "jpg"
        switch (outputType) {
          case "image/png":
            extension = "png"
            break
          case "image/gif":
            extension = "gif"
            break
          case "image/webp":
            extension = "webp"
            break
          default:
            extension = "jpg"
            break
        }

        // Create filename
        const baseName = image.file.name.replace(/\.[^/.]+$/, "") || "image"
        const newFileName = `${baseName}${settings.suffix}.${extension}`

        // Create file from blob
        const compressedFile = new File([compressedBlob], newFileName, {
          type: outputType,
        })

        // Create compressed image object
        const compressedImage: CompressedImage = {
          id: `${image.id}-compressed-${Date.now()}`,
          originalId: image.id,
          file: compressedFile,
          preview: URL.createObjectURL(compressedBlob),
          originalSize: image.file.size,
          compressedSize: compressedFile.size,
          settings: { ...settings },
        }

        // Remove any previous compressed version of this image
        setCompressedImages((prev) => {
          const filtered = prev.filter((img) => img.originalId !== image.id)
          return [...filtered, compressedImage]
        })

        // Remove from error tracking if it was previously errored
        if (compressionErrors[image.id]) {
          setCompressionErrors((prev) => {
            const newErrors = { ...prev }
            delete newErrors[image.id]
            return newErrors
          })
        }

        // Mark this image as processed
        processedImagesRef.current.add(image.id)

        console.log(
          `Compressed ${image.file.name}: Original: ${formatFileSize(image.file.size)}, Compressed: ${formatFileSize(compressedFile.size)}`
        )

        return compressedImage
      } catch (error) {
        console.error(`Error compressing ${image.file.name}:`, error)

        // Track the error
        setCompressionErrors((prev) => ({
          ...prev,
          [image.id]: true,
        }))

        return null
      } finally {
        // Remove from processing queue
        setProcessingQueue((prev) => prev.filter((id) => id !== image.id))

        // Remove from processing images ref
        processingImagesRef.current.delete(image.id)
      }
    },
    [
      settings,
      setCompressedImages,
      setProcessingQueue,
      compressionErrors,
      setCompressionErrors,
      showToastOnce,
    ]
  )

  // Compress all images (manual trigger)
  const compressAllImages = useCallback(async () => {
    if (!originalImages.length) return

    // Skip if already compressing
    if (isCompressingRef.current) return

    isCompressingRef.current = true
    setIsCompressing(true)

    // Clear processed images ref to allow re-compression with new settings
    processedImagesRef.current = new Set(
      compressedImagesRef.current.map((c) => c.originalId)
    )

    try {
      // Process images in batches to avoid UI freezing
      const batchSize = 2
      let processedCount = 0

      for (let i = 0; i < originalImages.length; i += batchSize) {
        const batch = originalImages.slice(i, i + batchSize)

        // Filter out images that are already being processed
        const unprocessedBatch = batch.filter(
          (img) => !processingImagesRef.current.has(img.id)
        )

        if (unprocessedBatch.length === 0) continue

        // Process this batch
        const results = await Promise.all(
          unprocessedBatch.map(compressSingleImage)
        )

        // Count successful compressions
        processedCount += results.filter(Boolean).length

        // If we're not on the last batch, give the UI a chance to breathe
        if (i + batchSize < originalImages.length) {
          await new Promise((resolve) => setTimeout(resolve, 50))
        }
      }

      if (processedCount > 0) {
        showToastOnce(
          "compress-all",
          `${processedCount} image(s) compressed successfully`
        )
      }
    } catch (error) {
      console.error("Error in compression process:", error)
      showToastOnce("compress-all-error", "Error compressing images", "error")
    } finally {
      isCompressingRef.current = false
      setIsCompressing(false)
    }
  }, [
    originalImages,
    compressSingleImage,
    setIsCompressing,
    showToastOnce,
  ])

  // Remove an image
  const removeImage = useCallback(
    (id: string) => {
      // Skip if this image is being processed
      if (processingImagesRef.current.has(id)) {
        showToastOnce(
          "remove-error",
          "Cannot remove an image that is being processed",
          "error"
        )
        return
      }

      // Remove from original images
      setOriginalImages((prev) => prev.filter((img) => img.id !== id))

      // Remove any compressed versions
      setCompressedImages((prev) => prev.filter((img) => img.originalId !== id))

      // Remove from error tracking
      if (compressionErrors[id]) {
        setCompressionErrors((prev) => {
          const newErrors = { ...prev }
          delete newErrors[id]
          return newErrors
        })
      }

      // Remove from processed images ref
      processedImagesRef.current.delete(id)
    },
    [
      setOriginalImages,
      setCompressedImages,
      compressionErrors,
      setCompressionErrors,
      showToastOnce,
    ]
  )

  const removeAllImages = useCallback(() => {
    // Skip if any images are being processed
    if (processingQueue.length > 0 || isCompressingRef.current) {
      showToastOnce(
        "remove-all-error",
        "Cannot remove images while processing",
        "error"
      )
      return
    }

    setOriginalImages([])
    setCompressedImages([])
    setCompressionErrors({})
    processingImagesRef.current.clear()
    processedImagesRef.current.clear()

    showToastOnce("remove-all", "All images removed")
  }, [
    setOriginalImages,
    setCompressedImages,
    setCompressionErrors,
    processingQueue,
    showToastOnce,
  ])

  // Download a single image
  const downloadImage = useCallback(
    (imageId: string) => {
      // First check if there's a compressed version
      const compressedImage = compressedImages.find(
        (img) => img.originalId === imageId
      )

      if (compressedImage) {
        const link = document.createElement("a")
        link.href = compressedImage.preview
        link.download = compressedImage.file.name
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        showToastOnce(
          `download-${imageId}`,
          `Downloaded ${compressedImage.file.name}`
        )
        return
      }

      // If no compressed version, download the original
      const originalImage = originalImages.find((img) => img.id === imageId)
      if (originalImage) {
        const link = document.createElement("a")
        link.href = originalImage.preview
        link.download = originalImage.file.name
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        showToastOnce(
          `download-${imageId}`,
          `Downloaded ${originalImage.file.name}`
        )
        return
      }

      showToastOnce("download-error", "Image not found", "error")
    },
    [compressedImages, originalImages, showToastOnce]
  )

  // Download all images as a ZIP file
  const downloadAllAsZip = useCallback(async () => {
    if (!originalImages.length && !compressedImages.length) {
      showToastOnce("download-all-error", "No images to download", "error")
      return
    }

    if (isCompressingRef.current) {
      showToastOnce(
        "download-all-error",
        "Please wait for compression to complete",
        "error"
      )
      return
    }

    isCompressingRef.current = true
    setIsCompressing(true)
    const loadingToastId = toast.loading("Creating ZIP file...")

    try {
      const zip = new JSZip()

      // If we have compressed images, use those
      if (compressedImages.length > 0) {
        compressedImages.forEach((imageData) => {
          zip.file(imageData.file.name, imageData.file)
        })
      } else {
        // Otherwise use original images
        originalImages.forEach((imageData) => {
          zip.file(imageData.file.name, imageData.file)
        })
      }

      const content = await zip.generateAsync({ type: "blob" })
      const link = document.createElement("a")
      link.href = URL.createObjectURL(content)
      link.download = "images.zip"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast.dismiss(loadingToastId)
      showToastOnce("download-all", "ZIP file downloaded successfully")
    } catch (error) {
      console.error("Error creating zip file:", error)
      toast.dismiss(loadingToastId)
      showToastOnce("download-all-error", "Error creating ZIP file", "error")
    } finally {
      isCompressingRef.current = false
      setIsCompressing(false)
    }
  }, [
    originalImages,
    compressedImages,
    setIsCompressing,
    showToastOnce,
  ])

  // Calculate total reduction
  const calculateTotalReduction = useCallback(() => {
    if (!compressedImages.length)
      return { percentage: 0, original: 0, compressed: 0 }

    const totalOriginal = compressedImages.reduce(
      (sum, img) => sum + img.originalSize,
      0
    )
    const totalCompressed = compressedImages.reduce(
      (sum, img) => sum + img.compressedSize,
      0
    )

    const reduction = totalOriginal - totalCompressed
    const percentage = Math.round((reduction / totalOriginal) * 100)

    return {
      percentage,
      original: formatFileSize(totalOriginal),
      compressed: formatFileSize(totalCompressed),
    }
  }, [compressedImages])

  const totalReduction = calculateTotalReduction()

  return {
    originalImages,
    compressedImages,
    hasOriginalImages,
    hasCompressedImages,
    hasUncompressedImages,
    isCompressing,
    processingQueue,
    compressionErrors,
    totalReduction,
    compressSingleImage,
    compressAllImages,
    removeImage,
    removeAllImages,
    downloadImage,
    downloadAllAsZip,
  }
}