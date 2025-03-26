"use client"

import { useImageContext } from "@/contexts/image-context"
import { useSettings } from "@/hooks/use-settings"
import { useEffect, useState } from "react"

export function useSettingsChanged() {
  const { settings } = useSettings()
  const { compressedImages } = useImageContext()
  const [settingsChanged, setSettingsChanged] = useState(false)

  useEffect(() => {
    if (compressedImages.length === 0) {
      setSettingsChanged(false)
      return
    }

    const hasChangedSettings = compressedImages.some(
      ({ settings: imageSettings }) =>
        Object.entries(settings).some(
          ([key, value]) =>
            imageSettings[key as keyof typeof imageSettings] !== value
        )
    )

    setSettingsChanged(hasChangedSettings)
  }, [settings, compressedImages])

  return settingsChanged
}
