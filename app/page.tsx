"use client"

import ImageGrid from "@/components/image-grid"
import UploadArea from "@/components/upload-area"
import { useBuildRoute } from "@/hooks/use-build-route"

export default function Home() {
  useBuildRoute()

  return (
    <div className="flex flex-1 flex-col p-4 gap-4">
      <UploadArea />
      <ImageGrid />
    </div>
  )
}
