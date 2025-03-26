"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"

interface ThemeToggleProps {
  float?: boolean
}

export function ThemeToggle({ float }: ThemeToggleProps) {
  const { setTheme } = useTheme()

  const handleThemeChange = () => {
    setTheme((currentTheme) => (currentTheme === "light" ? "dark" : "light"))
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={handleThemeChange}
      className={`${float ? "absolute right-4 top-4" : ""}`}
    >
      <Sun className="rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
