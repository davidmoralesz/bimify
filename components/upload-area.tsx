"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useFileUpload } from "@/contexts/file-upload-context"
import { useImageCompressor } from "@/hooks/use-image-compressor"
import { Loader2, Upload } from "lucide-react"

export default function UploadArea() {
  const { isUploading, handleFileChange, fileInputRef } = useFileUpload()
  const { hasOriginalImages } = useImageCompressor()

  return (
    <Card
      className={`bg-primary/5 flex px-0 py-4 shadow-none ${
        hasOriginalImages ? "max-h-16 h-16" : "h-full"
      } w-full flex-1 items-center justify-center rounded-lg transition-all ${
        !isUploading ? "hover:bg-primary/10 cursor-pointer" : ""
      }`}
      onClick={() => !isUploading && fileInputRef.current?.click()}
    >
      {!hasOriginalImages && (
        <CardContent className="text-center">
          <Input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/*"
            multiple
            disabled={isUploading}
          />

          {isUploading ? (
            <>
              <Loader2 className="mx-auto mb-4 size-6 animate-spin" />
              <h3 className="mb-2 font-medium">Processing images...</h3>
              <p className="mb-4 text-sm">This may take a moment</p>
            </>
          ) : (
            <>
              <Upload className="mx-auto mb-4 size-6" />
              <h3 className="mb-2 font-medium">Drop images here</h3>
              <p className="mb-4 text-sm">or click to browse</p>
              <Button variant="outline">Select Images</Button>
            </>
          )}
        </CardContent>
      )}
      {hasOriginalImages && (
        <CardContent className="flex w-full items-center justify-between gap-2 text-center px-4">
          <Input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/*"
            multiple
            disabled={isUploading}
          />

          {isUploading ? (
            <>
              <Loader2 className="size-5 animate-spin" />
              <h3 className="mr-auto text-sm font-medium">
                Processing images...
              </h3>
            </>
          ) : (
            <>
              <Upload className="size-5" />
              <h3 className="mr-auto text-sm font-medium">
                Drop images here or click to browse
              </h3>
              <Button variant="outline">Select Images</Button>
            </>
          )}
        </CardContent>
      )}
    </Card>
  )
}
