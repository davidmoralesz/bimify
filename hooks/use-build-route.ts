"use client"

import { defaultSettings } from "@/config/constants"
import { useImageContext } from "@/contexts/image-context"
import { useEffect, useState } from "react"

export function useBuildRoute() {
  const [operationLimit, setOperationLimit] = useState(0)
  const { setSettings } = useImageContext()

  useEffect(() => {
    async function fetchBuildRoute() {
      try {
        const res = await fetch("/api/build")

        if (res.ok) {
          const text = await res.text()
          const maxFileCount = Number(text.trim())

          if (!isNaN(maxFileCount) && maxFileCount > 0) {
            setOperationLimit(maxFileCount)

            // Update settings.maxFiles with the new value
            setSettings((prev) => ({
              ...prev,
              maxFiles: maxFileCount,
            }))

            console.log(
              `[SUCCESS] Fetched MAX_FILE_COUNT = ${maxFileCount} from BUILD_CONFIG`
            )
          } else {
            // If the value is invalid, use the default
            setSettings((prev) => ({
              ...prev,
              maxFiles: defaultSettings.maxFiles,
            }))

            console.log(
              `[WARNING] Invalid MAX_FILE_COUNT from BUILD_CONFIG, using default: ${defaultSettings.maxFiles}`
            )
          }
        } else {
          // If the fetch fails, use the default
          setSettings((prev) => ({
            ...prev,
            maxFiles: defaultSettings.maxFiles,
          }))

          console.error(
            "[ERROR] Failed to fetch MAX_FILE_COUNT from BUILD_CONFIG, using default"
          )
        }
      } catch (error) {
        // If there's an error, use the default
        setSettings((prev) => ({
          ...prev,
          maxFiles: defaultSettings.maxFiles,
        }))

        console.error(
          "[ERROR] Failed to fetch from BUILD_CONFIG, using default"
        )
      }
    }

    fetchBuildRoute()
  }, [setSettings])

  return { operationLimit }
}
