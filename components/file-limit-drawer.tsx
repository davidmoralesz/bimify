"use client"

import { Button } from "@/components/ui/button"
import { Counter } from "@/components/ui/counter"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { useImageContext } from "@/contexts/image-context"
import { AlertTriangle } from "lucide-react"
import { useState } from "react"

interface FileLimitDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function FileLimitDrawer({ open, onOpenChange }: FileLimitDrawerProps) {
  const { settings, setSettings } = useImageContext()
  const [tempMaxFiles, setTempMaxFiles] = useState(settings.maxFiles)

  const fileOptions = [
    10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150,
  ]

  const handleSave = () => {
    setSettings((prev) => ({
      ...prev,
      maxFiles: tempMaxFiles,
    }))
    onOpenChange(false)
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm text-center">
          <DrawerHeader>
            <DrawerTitle>Adjust File Limit</DrawerTitle>
            <DrawerDescription>
              <div className="text-left mt-2 flex items-center gap-4 rounded-md bg-amber-500/10 border border-amber-500/20 p-3 text-amber-500/90">
                <AlertTriangle className="size-5 shrink-0" />
                <span className="text-sm">
                  This application runs locally in your browser. Setting a high
                  file limit may cause performance issues or browser freezing.
                </span>
              </div>
            </DrawerDescription>
          </DrawerHeader>
          <div className="p-4 pb-0">
            <div className="flex flex-col items-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Maximum number of files to process at once
              </p>
              <Counter
                value={tempMaxFiles}
                onChange={(value) => setTempMaxFiles(value as number)}
                options={fileOptions}
                className="py-6"
              />
              <p className="text-sm text-muted-foreground">
                {tempMaxFiles > 50
                  ? "High values may impact performance"
                  : "The recommended limit is between 10 and 50 files"}
              </p>
            </div>
          </div>
          <DrawerFooter>
            <Button onClick={handleSave}>Save Changes</Button>
            <DrawerClose asChild>
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
