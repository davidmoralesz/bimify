"use client"

import type React from "react"

import { FileLimitDrawer } from "@/components/file-limit-drawer"
import { defaultSettings } from "@/config/constants"
import { useImageContext, type OriginalImage } from "@/contexts/image-context"
import { createContext, useContext, useRef, useState } from "react"
import { toast } from "sonner"

interface FileUploadContextType {
  isUploading: boolean
  isDragging: boolean
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>
  handleDrop: (e: React.DragEvent) => Promise<void>
  handleDragEnter: (e: React.DragEvent) => void
  handleDragLeave: (e: React.DragEvent) => void
  handleDragOver: (e: React.DragEvent) => void
  fileInputRef: React.RefObject<HTMLInputElement>
}

const FileUploadContext = createContext<FileUploadContextType | undefined>(
  undefined
)

export function FileUploadProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [isUploading, setIsUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [isLimitDrawerOpen, setIsLimitDrawerOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dragCounter = useRef(0)
  const uploadingRef = useRef(false)

  const { originalImages, setOriginalImages, settings } = useImageContext()
  const maxFiles = settings?.maxFiles || defaultSettings.maxFiles

  const showFileLimitToast = (totalFiles: number) => {
    toast(
      <div className="flex flex-col gap-2">
        <p>
          File limit reached: {maxFiles} maximum.
          <br />
          {totalFiles - maxFiles} file(s) will be ignored.
        </p>
        <button
          onClick={() => setIsLimitDrawerOpen(true)}
          className="bg-primary text-primary-foreground hover:bg-primary/90 rounded px-3 py-1.5 text-xs font-medium"
        >
          Increase Limit
        </button>
      </div>,
      {
        duration: 5000,
      }
    )
  }

  const processFiles = async (files: File[]) => {
    if (uploadingRef.current) return []

    uploadingRef.current = true
    setIsUploading(true)

    try {
      const totalFiles = originalImages.length + files.length
      if (totalFiles > maxFiles) {
        showFileLimitToast(totalFiles)
      }

      const remainingSlots = Math.max(0, maxFiles - originalImages.length)
      const filesToAdd = files.slice(0, remainingSlots)

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

      return newImages
    } catch (error) {
      console.error("Error processing files:", error)
      return []
    } finally {
      uploadingRef.current = false
      setIsUploading(false)
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return

    try {
      const files = Array.from(e.target.files)
      const newImages = await processFiles(files)

      if (newImages.length > 0) {
        setOriginalImages((prev) => [...prev, ...newImages])
        console.log(
          "Files processed:",
          newImages.length,
          "Total images:",
          originalImages.length + newImages.length
        )
        toast.success(`Added ${newImages.length} image(s)`)
      }
    } catch (error) {
      console.error("Error processing files:", error)
      toast.error("Error processing files")
    } finally {
      setTimeout(() => {
        if (fileInputRef.current) fileInputRef.current.value = ""
      }, 10)
    }
  }

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    dragCounter.current++

    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true)
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    dragCounter.current--

    if (dragCounter.current === 0) {
      setIsDragging(false)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    setIsDragging(false)
    dragCounter.current = 0

    if (!e.dataTransfer.files?.length) return

    try {
      const files = Array.from(e.dataTransfer.files)
      const newImages = await processFiles(files)

      if (newImages.length > 0) {
        setOriginalImages((prev) => [...prev, ...newImages])
        console.log(
          "Files dropped:",
          newImages.length,
          "Total images:",
          originalImages.length + newImages.length
        )
        toast.success(`Added ${newImages.length} image(s)`)
      }
    } catch (error) {
      console.error("Error processing dropped files:", error)
      toast.error("Error processing files")
    }
  }

  return (
    <>
      <FileUploadContext.Provider
        value={{
          isUploading,
          isDragging,
          handleFileChange,
          handleDrop,
          handleDragEnter,
          handleDragLeave,
          handleDragOver,
          fileInputRef: fileInputRef as React.RefObject<HTMLInputElement>,
        }}
      >
        {children}
      </FileUploadContext.Provider>
      <FileLimitDrawer
        open={isLimitDrawerOpen}
        onOpenChange={setIsLimitDrawerOpen}
      />
    </>
  )
}

export function useFileUpload() {
  const context = useContext(FileUploadContext)
  if (context === undefined) {
    throw new Error("useFileUpload must be used within a FileUploadProvider")
  }
  return context
}
