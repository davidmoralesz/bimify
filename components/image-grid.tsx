"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { useImageContext } from "@/contexts/image-context"
import { useImageCompressor } from "@/hooks/use-image-compressor"
import { formatFileSize } from "@/lib/utils"
import { Download, RefreshCw, Settings, Trash } from "lucide-react"
import Image from "next/image"
import { useSettingsChanged } from "../hooks/use-settings-changed"

export default function ImageGrid() {
  const {
    originalImages,
    compressedImages,
    processingQueue,
    compressionErrors,
  } = useImageContext()

  const settingsChanged = useSettingsChanged()

  const {
    hasOriginalImages,
    isCompressing,
    removeImage,
    downloadImage,
    compressSingleImage,
    hasCompressedImages,
    totalReduction,
  } = useImageCompressor()

  const isCompressionDisabled = !hasOriginalImages || isCompressing
  const isCompressionComplete = hasCompressedImages && !settingsChanged
  const isCompressionEnabled = !isCompressionDisabled && !isCompressionComplete

  if (!hasOriginalImages) return null

  return (
    <div className="flex flex-1 flex-col gap-2">
      {hasCompressedImages && (
        <div
          className={`mb-2 flex items-center justify-between rounded-lg border p-4 ${totalReduction.percentage >= 0 ? "border-green-500/20 bg-green-500/20" : "border-red-500/20 bg-red-500/20"}`}
        >
          <p className="text-sm">
            <span className="font-bold">Compression Complete:</span>
            &nbsp;{totalReduction.percentage >= 0
              ? "Reduced"
              : "Increased"}{" "}
            total size by&nbsp;
            <span className="font-bold">{totalReduction.percentage}%</span> (
            {totalReduction.original} → {totalReduction.compressed})
            {totalReduction.percentage <= 0 && (
              <span>. Consider lowering your compression settings.</span>
            )}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {originalImages.map((originalImage) => {
          const compressedImage = compressedImages.find(
            (img) => img.originalId === originalImage.id
          )

          const isProcessing = processingQueue.includes(originalImage.id)
          const hasError = compressionErrors[originalImage.id]

          const compressionPercentage = compressedImage
            ? Math.round(
                (1 -
                  compressedImage.compressedSize /
                    compressedImage.originalSize) *
                  100
              )
            : 0

          return (
            <Card
              key={originalImage.id}
              className="group relative gap-1 overflow-hidden p-0"
            >
              <CardContent className="bg-muted/50 p-0">
                <div className="flex gap-2">
                  {compressedImage ? (
                    <>
                      <div className="bg-primary/20 relative aspect-square h-20">
                        <Image
                          src={originalImage.preview || ""}
                          alt="Original image"
                          className="size-full object-contain"
                          quality={10}
                          fill={true}
                          priority
                        />
                      </div>
                      <div className="flex flex-col justify-center space-y-2 overflow-hidden px-2 text-xs">
                        <span className="truncate text-wrap">
                          {compressedImage.file.name}
                        </span>
                        <span
                          className={
                            compressionPercentage > 0 &&
                            compressionPercentage < 50
                              ? "text-green-200"
                              : compressionPercentage >= 50
                                ? "text-green-300"
                                : "text-red-300"
                          }
                        >
                          {`${compressionPercentage}% ${compressionPercentage >= 0 ? "smaller" : "larger"}`}
                        </span>
                      </div>
                    </>
                  ) : isProcessing ? (
                    <div className="flex flex-1 items-center justify-center p-4">
                      <div className="text-muted-foreground text-center text-sm">
                        {hasError ? (
                          <span className="text-red-400">
                            Compression failed
                          </span>
                        ) : (
                          <>
                            <RefreshCw className="mx-auto size-8 animate-spin" />
                            <p>Compressing...</p>
                          </>
                        )}
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="bg-primary/20 relative aspect-square h-20">
                        <Image
                          src={originalImage.preview || ""}
                          alt="Original image"
                          className="size-full object-contain"
                          quality={10}
                          fill={true}
                          priority
                        />
                      </div>
                      <div className="flex flex-col justify-center space-y-2 overflow-hidden px-2 text-xs">
                        <span className="truncate text-wrap">
                          {originalImage.file.name}
                        </span>
                        <span className="text-muted-foreground">
                          {formatFileSize(originalImage.file.size)}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
              <CardFooter className="from-muted absolute inset-0 flex flex-col items-end gap-2 rounded-lg bg-gradient-to-l to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                {compressedImage ? (
                  <Button
                    size="iconSm"
                    onClick={() => downloadImage(originalImage.id)}
                    disabled={isProcessing}
                  >
                    <Download />
                  </Button>
                ) : hasError ? (
                  <Button
                    variant="outline"
                    size="iconSm"
                    onClick={() => compressSingleImage(originalImage)}
                    disabled={isProcessing}
                  >
                    <RefreshCw />
                  </Button>
                ) : (
                  <>
                    <Button
                      size="iconSm"
                      onClick={() => compressSingleImage(originalImage)}
                      disabled={isProcessing}
                    >
                      <span className="relative">
                        {isCompressionEnabled && (
                          <Settings className="absolute animate-ping opacity-30" />
                        )}
                        <Settings
                          className={
                            isCompressionEnabled ? "animate-pulse" : ""
                          }
                        />
                      </span>
                    </Button>
                  </>
                )}
                <Button
                  variant="destructive"
                  size="iconSm"
                  onClick={() => removeImage(originalImage.id)}
                  disabled={isProcessing}
                >
                  <Trash />
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
