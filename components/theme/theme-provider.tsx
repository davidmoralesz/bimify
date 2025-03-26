"use client"

import { ThemeProvider as NextThemesProvider } from "next-themes"
import { useEffect, useState } from "react"

export default function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  const [isClient, setIsClient] = useState(false)
  useEffect(() => setIsClient(true), [])

  return (
    <>
      {isClient && (
        <NextThemesProvider {...props}>{children}</NextThemesProvider>
      )}
    </>
  )
}
