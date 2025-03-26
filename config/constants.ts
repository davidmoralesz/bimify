export const defaultSettings: Settings = {
  maxWidth: 1920,
  maxHeight: 1080,
  quality: 80,
  suffix: "_minified",
  useWebP: false,
  maxFiles: 20,
}

export const tips: Tips = {
  maxDimension:
    "Maximum width or height in pixels. The aspect ratio is preserved.",
  maxWidth: "Maximum width in pixels. The aspect ratio is preserved.",
  maxHeight: "Maximum height in pixels. The aspect ratio is preserved.",
  quality:
    "Adjust the image quality. Higher values retain more detail, while lower values reduce file size.",
  suffix:
    "Easily customize the suffix that will be appended to your file names to keep them organized and distinguishable.",
  useWebP:
    "Enable this option to convert images to WebP format for better compression and quality.",
}

export const MIN_DIMENSION = 1
export const MAX_DIMENSION = 4000
export const MIN_QUALITY = 1
export const MAX_QUALITY = 95
export const PROCESSING_TIMEOUT = 30 * 1000
