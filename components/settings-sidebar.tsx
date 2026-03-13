"use client"

import { FileLimitDrawer } from "@/components/file-limit-drawer"
import HelpTooltip from "@/components/help-tooltip"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
} from "@/components/ui/sidebar"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import {
  MAX_DIMENSION,
  MAX_QUALITY,
  MIN_DIMENSION,
  MIN_QUALITY,
  tips,
} from "@/config/constants"
import { useImageCompressor } from "@/hooks/use-image-compressor"
import { useSettings } from "@/hooks/use-settings"
import { useSettingsChanged } from "@/hooks/use-settings-changed"
import { setRangeColor } from "@/lib/utils"
import { FolderDown, Loader2, RotateCcw, Settings, Trash } from "lucide-react"
import { useState } from "react"

export default function SettingsSidebar() {
  const {
    settings,
    isLoading,
    handleMaxWidthChange,
    handleMaxHeightChange,
    handleQualityChange,
    handleSuffixChange,
    handleUseWebPChange,
    handleResetSettings,
  } = useSettings()

  const settingsChanged = useSettingsChanged()

  const {
    originalImages,
    hasOriginalImages,
    hasUncompressedImages,
    isCompressing,
    removeAllImages,
    compressAllImages,
    downloadAllAsZip,
    hasCompressedImages,
  } = useImageCompressor()

  const [isLimitDrawerOpen, setIsLimitDrawerOpen] = useState(false)

  const isCompressionDisabled = !hasOriginalImages || isCompressing
  const isCompressionComplete = hasCompressedImages && !settingsChanged && !hasUncompressedImages
  const isCompressionEnabled = !isCompressionDisabled && !isCompressionComplete
  const isGridEmpty = !hasOriginalImages || isCompressing

  return (
    <>
      <Sidebar variant="inset" className="bg-muted border-r p-4">
        <SidebarContent className="bg-muted flex gap-4 p-4 md:p-0">
          <SidebarHeader className="p-0">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Settings</h2>
              <Button
                variant="outline"
                onClick={handleResetSettings}
                disabled={isLoading}
              >
                <RotateCcw className={isLoading ? "animate-spin" : ""} />
                Reset
              </Button>
            </div>
          </SidebarHeader>
          <SidebarGroup
            id="dimensions"
            className="border-sidebar-border bg-primary/5 flex flex-col gap-4 rounded-lg border p-4"
          >
            <div className="border-sidebar-border flex justify-between gap-2 border-b pb-2">
              <h3 className="text-sm font-semibold">Dimensions</h3>
              <HelpTooltip tip={tips.maxDimension} />
            </div>
            <div className="flex flex-col gap-4">
              <div className="flex justify-between gap-2">
                <Label htmlFor="maxWidth">Max Width</Label>
                <div className="relative ml-auto flex items-baseline gap-2">
                  <Input
                    id="maxWidth"
                    type="number"
                    max={MAX_DIMENSION}
                    min={MIN_DIMENSION}
                    value={settings.maxWidth}
                    onChange={handleMaxWidthChange}
                  />
                  <span className="text-foreground/70 pointer-events-none absolute right-2 top-1/2 ml-auto -translate-y-1/2 text-sm">
                    px
                  </span>
                </div>
              </div>
              <Slider
                id="maxWidth"
                step={1}
                max={MAX_DIMENSION}
                min={MIN_DIMENSION}
                value={[settings.maxWidth]}
                onValueChange={handleMaxWidthChange}
              />
            </div>
            <div className="flex flex-col gap-4">
              <div className="flex gap-2">
                <Label htmlFor="maxHeight">Max Height</Label>
                <div className="relative ml-auto flex items-baseline gap-2">
                  <Input
                    id="maxHeight"
                    type="number"
                    max={MAX_DIMENSION}
                    min={MIN_DIMENSION}
                    value={settings.maxHeight}
                    onChange={handleMaxHeightChange}
                  />
                  <span className="text-foreground/70 pointer-events-none absolute right-2 top-1/2 ml-auto -translate-y-1/2 text-sm">
                    px
                  </span>
                </div>
              </div>
              <Slider
                id="maxHeight"
                step={1}
                max={MAX_DIMENSION}
                min={MIN_DIMENSION}
                value={[settings.maxHeight]}
                onValueChange={handleMaxHeightChange}
              />
            </div>
          </SidebarGroup>
          <SidebarGroup
            id="quality"
            className="border-sidebar-border bg-primary/5 flex flex-col gap-4 rounded-lg border p-4"
          >
            <div className="border-sidebar-border flex justify-between gap-2 border-b pb-2">
              <h3 className="text-sm font-semibold">Quality</h3>
              <HelpTooltip tip={tips.quality} />
            </div>
            <div className="flex flex-col gap-4">
              <div className="flex gap-2">
                <Label htmlFor="quality">Quality</Label>
                <div className="relative ml-auto flex items-baseline gap-2">
                  <Input
                    id="quality"
                    type="number"
                    step={1}
                    max={MAX_QUALITY}
                    min={MIN_QUALITY}
                    value={settings.quality}
                    onChange={handleQualityChange}
                  />
                  <span className="text-foreground/70 pointer-events-none absolute right-2 top-1/2 ml-auto -translate-y-1/2 text-sm">
                    %
                  </span>
                </div>
              </div>
              <Slider
                id="quality"
                step={1}
                max={MAX_QUALITY}
                min={MIN_QUALITY}
                value={[settings.quality]}
                onValueChange={handleQualityChange}
                rangeColor={setRangeColor(settings.quality, "bg")}
                className="transition-colors"
              />
            </div>
          </SidebarGroup>
          <SidebarGroup
            id="format"
            className="border-sidebar-border bg-primary/5 flex flex-col gap-4 rounded-lg border p-4"
          >
            <div className="border-sidebar-border flex justify-between gap-2 border-b pb-2">
              <h3 className="inline text-sm font-semibold">Format</h3>
              <HelpTooltip tip={tips.suffix} />
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex text-clip">
                <Label htmlFor="suffix">Suffix</Label>
                <span className="text-foreground/70 ml-auto text-sm">
                  image<span className="italic">{settings.suffix}</span>
                  {settings.useWebP ? ".webp" : ".jpg"}
                </span>
              </div>
              <Input
                id="suffix"
                value={settings.suffix}
                onChange={handleSuffixChange}
              />
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between gap-2">
                <Switch
                  id="useWebP"
                  checked={settings.useWebP}
                  onCheckedChange={handleUseWebPChange}
                />
                <Label htmlFor="useWebP" className="mr-auto">
                  Convert to WebP
                </Label>
                <HelpTooltip tip={tips.useWebP} />
              </div>
            </div>
          </SidebarGroup>
          <SidebarGroup id="actions" className="grid grid-cols-2 gap-2 p-0">
            <Button
              variant="outline"
              disabled={isCompressionDisabled || isCompressionComplete}
              onClick={compressAllImages}
              className="col-span-2"
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
              {`${settingsChanged ? "Re-Compress" : "Compress"} Images`}
            </Button>
            <Button disabled={isGridEmpty} onClick={downloadAllAsZip}>
              {isCompressing ? (
                <Loader2 className="animate-spin" />
              ) : (
                <FolderDown />
              )}
              Download All
            </Button>
            <Button
              variant="destructive"
              onClick={removeAllImages}
              disabled={isGridEmpty}
            >
              {isCompressing ? <Loader2 className="animate-spin" /> : <Trash />}
              Delete All
            </Button>
          </SidebarGroup>
          {originalImages.length >= settings.maxFiles && (
            <SidebarGroup
              id="limits"
              className="border-amber-50/10 flex flex-col gap-4 rounded-lg border p-4 bg-amber-500/10"
            >
              <div className="border-sidebar-border flex justify-between gap-2 border-b pb-2">
                <h3 className="inline text-sm font-semibold">
                  Files Limit Reached
                </h3>
                <HelpTooltip tip="Maximum number of files that can be processed at once. Higher values may impact browser performance." />
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="maxFiles">Increase Limit</Label>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsLimitDrawerOpen(true)}
                    >
                      Adjust
                    </Button>
                  </div>
                </div>
              </div>
            </SidebarGroup>
          )}
        </SidebarContent>
      </Sidebar>
      <FileLimitDrawer
        open={isLimitDrawerOpen}
        onOpenChange={setIsLimitDrawerOpen}
      />
    </>
  )
}
