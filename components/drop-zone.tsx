"use client"

import type React from "react"

import { useFileUpload } from "@/contexts/file-upload-context"
import { Upload } from "lucide-react"

export default function DropZone({
  children,
}: {
  children: React.ReactNode
}) {
  const {
    isDragging,
    handleDrop,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
  } = useFileUpload()

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      className="relative flex flex-1"
    >
      {isDragging && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-10">
          <div className="flex animate-pulse flex-col size-full items-center justify-center gap-6 rounded-xl border-2 border-dashed border-primary/50 bg-primary/5 p-12">
            <Upload className="size-12 text-primary" />
            <h3 className="text-2xl font-medium">Drop images here</h3>
          </div>
        </div>
      )}
      {children}
    </div>
  )
}
