import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { EnvSetupGuide } from "./env-setup"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Covera Digital AI",
  description: "AI-powered insurance brokerage chat interface by Covera Digital",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <EnvSetupGuide />
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}



import './globals.css'