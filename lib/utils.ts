import { PROCESSING_TIMEOUT } from "@/config/constants"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function processImage(
  file: File
): Promise<ProcessedImageData | null> {
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
}

export const compressImage = async (
  file: File,
  options: CompressImageOptions
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image()

    const timeout = setTimeout(() => {
      reject(new Error("Image processing timed out"))
    }, PROCESSING_TIMEOUT)

    img.onload = () => {
      clearTimeout(timeout)

      if (img.width > 8000 || img.height > 8000) {
        reject(new Error("Image dimensions too large"))
        return
      }

      let width = img.width
      let height = img.height

      if (width > options.maxWidth || height > options.maxHeight) {
        const ratio = Math.min(
          options.maxWidth / width,
          options.maxHeight / height
        )
        width = Math.floor(width * ratio)
        height = Math.floor(height * ratio)
      }

      const canvas = document.createElement("canvas")
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext("2d")

      if (!ctx) {
        reject(new Error("Could not get canvas context"))
        return
      }

      if (options.outputType === "image/jpeg") {
        ctx.fillStyle = "white"
        ctx.fillRect(0, 0, width, height)
      }

      ctx.drawImage(img, 0, 0, width, height)

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Canvas toBlob failed"))
            return
          }
          // Never return a result larger than the original
          if (blob.size >= file.size) {
            resolve(file.slice(0, file.size, file.type))
          } else {
            resolve(blob)
          }
        },
        options.outputType,
        options.quality
      )
    }

    img.onerror = () => {
      clearTimeout(timeout)
      reject(new Error("Error loading image"))
    }

    img.crossOrigin = "anonymous"
    img.src = URL.createObjectURL(file)
  })
}

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes"

  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

export const setRangeColor = (
  value: number,
  type: "text" | "bg",
  max: number = 100,
  min: number = 1
) => {
  const normalizedValue = ((value - min) / (max - min)) * 100

  const textColors = {
    low: "text-green-200",
    medium: "text-green-300",
    high: "text-yellow-200",
    critical: "text-red-400",
  }

  const bgColors = {
    low: "bg-green-200",
    medium: "bg-green-300",
    high: "bg-yellow-200",
    critical: "bg-red-400",
  }

  const colors = type === "text" ? textColors : bgColors

  return normalizedValue < 50
    ? colors.low
    : normalizedValue <= 80
      ? colors.medium
      : normalizedValue <= 90
        ? colors.high
        : colors.critical
}

export const getEffectiveOutputType = (
  requestedType: string,
  quality: number
): string => {
  if (requestedType === "image/png" && quality < 1) {
    return "image/webp"
  }
  return requestedType
}