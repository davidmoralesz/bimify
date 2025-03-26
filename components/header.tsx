"use client"

import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useImageCompressor } from "@/hooks/use-image-compressor"
import { useSettingsChanged } from "@/hooks/use-settings-changed"
import { FolderDown, Loader2, Settings, Trash } from "lucide-react"

export default function Header() {
  const settingsChanged = useSettingsChanged()

  const {
    hasOriginalImages,
    isCompressing,
    removeAllImages,
    compressAllImages,
    downloadAllAsZip,
    hasCompressedImages,
  } = useImageCompressor()

  const isCompressionDisabled = !hasOriginalImages || isCompressing
  const isCompressionComplete = hasCompressedImages && !settingsChanged
  const isCompressionEnabled = !isCompressionDisabled && !isCompressionComplete
  const isGridEmpty = !hasOriginalImages || isCompressing

  return (
    <header className="sticky top-0 z-10 bg-background/80 border-b border-sidebar-border backdrop-blur-sm p-4 mb-0 flex w-full items-center justify-end gap-2">
      <h1 className="text-foreground mr-auto text-xl font-semibold">
        Minify Images
      </h1>
      <div id="header-actions" className="space-x-2">
        <SidebarTrigger />
        <Button
          variant="outline"
          size="icon"
          disabled={isCompressionDisabled || isCompressionComplete}
          onClick={compressAllImages}
        >
          {isCompressing ? (
            <Loader2 className="animate-spin" />
          ) : (
            <span className="relative">
              {isCompressionEnabled && (
                <Settings className="absolute animate-ping opacity-30" />
              )}
              <Settings
                className={isCompressionEnabled ? "animate-pulse" : ""}
              />
            </span>
          )}
        </Button>
        <Button size="icon" disabled={isGridEmpty} onClick={downloadAllAsZip}>
          {isCompressing ? (
            <Loader2 className="animate-spin" />
          ) : (
            <FolderDown />
          )}
        </Button>
        <Button
          variant="destructive"
          size="icon"
          onClick={removeAllImages}
          disabled={isGridEmpty}
        >
          {isCompressing ? <Loader2 className="animate-spin" /> : <Trash />}
        </Button>
      </div>
    </header>
  )
}
