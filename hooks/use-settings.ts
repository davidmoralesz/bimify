import { defaultSettings } from "@/config/constants"
import { useImageContext } from "@/contexts/image-context"
import { useEffect, useState, type ChangeEvent } from "react"

export function useSettings() {
  const [isLoading, setIsLoading] = useState(false)
  const { settings, setSettings } = useImageContext()

  useEffect(() => {
    if (typeof window !== "undefined")
      localStorage.setItem("settings", JSON.stringify(settings))
  }, [settings])

  const updateSetting = <T extends keyof Settings>(
    key: T,
    value: Settings[T] | number[] | ChangeEvent<HTMLInputElement>
  ) => {
    setSettings((prevSettings) => ({
      ...prevSettings,
      [key]:
        typeof value === "object" && "target" in value
          ? /* Handle Input Change */
            value.target.value
          : Array.isArray(value)
            ? /* Handle Value Change */
              value[0]
            : /* Handle Direct Assignment */
              value,
    }))
  }

  const handleMaxWidthChange = (
    value: number[] | ChangeEvent<HTMLInputElement>
  ) => updateSetting("maxWidth", value)
  const handleMaxHeightChange = (
    value: number[] | ChangeEvent<HTMLInputElement>
  ) => updateSetting("maxHeight", value)
  const handleQualityChange = (
    value: number[] | ChangeEvent<HTMLInputElement>
  ) => updateSetting("quality", value)
  const handleSuffixChange = (value: ChangeEvent<HTMLInputElement>) =>
    updateSetting("suffix", value)
  const handleUseWebPChange = (value: boolean) =>
    updateSetting("useWebP", value)
  const handleMaxFilesChange = (
    value: number[] | ChangeEvent<HTMLInputElement>
  ) => updateSetting("maxWidth", value)
  const handleResetSettings = () => {
    setIsLoading(true)
    setSettings(defaultSettings)
    setTimeout(() => setIsLoading(false), 1000)
  }

  return {
    settings,
    isLoading,
    handleMaxWidthChange,
    handleMaxHeightChange,
    handleQualityChange,
    handleSuffixChange,
    handleUseWebPChange,
    handleMaxFilesChange,
    handleResetSettings,
  }
}
