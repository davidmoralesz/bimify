type ProcessedImageData = {
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

type CompressionSettings = {
  maxWidth: number
  maxHeight: number
  quality: number
  suffix: string
}

type CompressImageOptions = {
  maxWidth: number
  maxHeight: number
  quality: number
  outputType: string
}
