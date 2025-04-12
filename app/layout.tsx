import DropZone from "@/components/drop-zone"
import Header from "@/components/header"
import SettingsSidebar from "@/components/settings-sidebar"
import ThemeProvider from "@/components/theme/theme-provider"
import { SidebarProvider } from "@/components/ui/sidebar"
import { FileUploadProvider } from "@/contexts/file-upload-context"
import { ImageProvider } from "@/contexts/image-context"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import type React from "react"
import { Toaster } from "sonner"
import "./globals.css"

const inter = Inter({
  variable: "--font-inter-sans",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Bimify | Image Optimization",
  description: "Local Image Compressor",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <ImageProvider>
            <FileUploadProvider>
              <SidebarProvider>
                <SettingsSidebar />
                <div className="flex w-full flex-col min-h-screen">
                  <Header />
                  <DropZone>
                    <main className="flex flex-1">{children}</main>
                  </DropZone>
                  <Toaster />
                </div>
              </SidebarProvider>
            </FileUploadProvider>
          </ImageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
