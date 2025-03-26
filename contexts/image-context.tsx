"use client"

import { defaultSettings } from "@/config/constants"
import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"

export interface OriginalImage {
  id: string
  file: File
  preview: string
}

export interface CompressedImage {
  id: string
  originalId: string
  file: File
  preview: string
  originalSize: number
  compressedSize: number
  settings: Settings
}

export interface ProcessedImageData {
  id: string
  file: File
  preview: string
  compressed?: {
    file: File
    preview: string
    originalSize: number
    compressedSize: number
  }
  compressionError?: boolean
}

interface ImageContextType {
  originalImages: OriginalImage[]
  compressedImages: CompressedImage[]
  setOriginalImages: React.Dispatch<React.SetStateAction<OriginalImage[]>>
  setCompressedImages: React.Dispatch<React.SetStateAction<CompressedImage[]>>
  settings: Settings
  setSettings: React.Dispatch<React.SetStateAction<Settings>>
  isCompressing: boolean
  setIsCompressing: React.Dispatch<React.SetStateAction<boolean>>
  processingQueue: string[]
  setProcessingQueue: React.Dispatch<React.SetStateAction<string[]>>
  compressionErrors: Record<string, boolean>
  setCompressionErrors: React.Dispatch<
    React.SetStateAction<Record<string, boolean>>
  >
}

const ImageContext = createContext<ImageContextType | undefined>(undefined)

export function ImageProvider({ children }: { children: React.ReactNode }) {
  const [originalImages, setOriginalImages] = useState<OriginalImage[]>([])
  const [compressedImages, setCompressedImages] = useState<CompressedImage[]>(
    []
  )
  const [isCompressing, setIsCompressing] = useState(false)
  const [processingQueue, setProcessingQueue] = useState<string[]>([])
  const [compressionErrors, setCompressionErrors] = useState<
    Record<string, boolean>
  >({})

  const [settings, setSettings] = useState<Settings>(() => {
    if (typeof window !== "undefined") {
      const savedSettings = localStorage.getItem("settings")
      return savedSettings ? JSON.parse(savedSettings) : defaultSettings
    } else {
      return defaultSettings
    }
  })

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("settings", JSON.stringify(settings))
    }
  }, [settings])

  return (
    <ImageContext.Provider
      value={{
        originalImages,
        compressedImages,
        setOriginalImages,
        setCompressedImages,
        settings,
        setSettings,
        isCompressing,
        setIsCompressing,
        processingQueue,
        setProcessingQueue,
        compressionErrors,
        setCompressionErrors,
      }}
    >
      {children}
    </ImageContext.Provider>
  )
}

export function useImageContext() {
  const context = useContext(ImageContext)
  if (context === undefined) {
    throw new Error("useImageContext must be used within an ImageProvider")
  }
  return context
}
