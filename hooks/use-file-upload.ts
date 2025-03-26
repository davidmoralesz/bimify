"use client"

import { useImageContext, type OriginalImage } from "@/contexts/image-context"
import type React from "react"
import type { RefObject } from "react"
import { toast } from "sonner"

interface UseFileUploadProps {
  fileInputRef: RefObject<HTMLInputElement>
  setIsLoading: (isLoading: boolean) => void
  maxFiles: number
}

export function useFileUpload({
  fileInputRef,
  setIsLoading,
  maxFiles,
}: UseFileUploadProps) {
  const { originalImages, setOriginalImages } = useImageContext()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return

    setIsLoading(true)

    try {
      const files = Array.from(e.target.files)

      const totalFiles = originalImages.length + files.length
      if (totalFiles > maxFiles)
        toast(
          `You can only process up to ${maxFiles} files at once. Only the first ${maxFiles - originalImages.length} files will be added.`
        )

      const remainingSlots = Math.max(0, maxFiles - originalImages.length)
      const filesToAdd = Array.from(files).slice(0, remainingSlots)

      const batchSize = 3
      const newImages: OriginalImage[] = []

      for (let i = 0; i < filesToAdd.length; i += batchSize) {
        const batch = filesToAdd.slice(i, i + batchSize)

        const batchResults = await Promise.all(
          batch.map(async (file) => {
            try {
              if (!file.type.startsWith("image/")) {
                console.error("Not an image file:", file.name)
                return null
              }

              return {
                id: crypto.randomUUID(),
                file,
                preview: URL.createObjectURL(file),
              }
            } catch (error) {
              console.error("Error processing image:", file.name, error)
              return null
            }
          })
        )

        const validBatchImages = batchResults.filter(
          (img): img is OriginalImage => img !== null
        )

        newImages.push(...validBatchImages)

        if (i + batchSize < filesToAdd.length) {
          await new Promise((resolve) => setTimeout(resolve, 10))
        }
      }

      setOriginalImages([...originalImages, ...newImages])
      console.log(
        "Files processed:",
        newImages.length,
        "Total images:",
        [...originalImages, ...newImages].length
      )
    } catch (error) {
      console.error("Error processing files:", error)
    } finally {
      setTimeout(() => {
        if (fileInputRef.current) fileInputRef.current.value = ""
      }, 10)
      setIsLoading(false)
    }
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!e.dataTransfer.files?.length) return

    setIsLoading(true)

    try {
      const files = Array.from(e.dataTransfer.files)
      const totalFiles = originalImages.length + files.length
      if (totalFiles > maxFiles) {
        toast(
          `You can only process up to ${maxFiles} files at once. Only the first ${maxFiles - originalImages.length} files will be added.`
        )
      }

      const remainingSlots = Math.max(0, maxFiles - originalImages.length)
      const filesToAdd = Array.from(files).slice(0, remainingSlots)

      const batchSize = 3
      const newImages: OriginalImage[] = []

      for (let i = 0; i < filesToAdd.length; i += batchSize) {
        const batch = filesToAdd.slice(i, i + batchSize)

        const batchResults = await Promise.all(
          batch.map(async (file) => {
            try {
              if (!file.type.startsWith("image/")) {
                console.error("Not an image file:", file.name)
                return null
              }

              return {
                id: crypto.randomUUID(),
                file,
                preview: URL.createObjectURL(file),
              }
            } catch (error) {
              console.error("Error processing image:", file.name, error)
              return null
            }
          })
        )

        const validBatchImages = batchResults.filter(
          (img): img is OriginalImage => img !== null
        )

        newImages.push(...validBatchImages)

        if (i + batchSize < filesToAdd.length) {
          await new Promise((resolve) => setTimeout(resolve, 10))
        }
      }

      setOriginalImages([...originalImages, ...newImages])
      console.log(
        "Files dropped:",
        newImages.length,
        "Total images:",
        [...originalImages, ...newImages].length
      )
    } catch (error) {
      console.error("Error processing dropped files:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDragOver = (e: React.DragEvent) => e.preventDefault()

  return {
    handleFileChange,
    handleDrop,
    handleDragOver,
  }
}
