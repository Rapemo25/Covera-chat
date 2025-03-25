"use client"

import { useEffect } from "react"
import { toast } from "@/hooks/use-toast"

export function EnvSetupGuide() {
  useEffect(() => {
    // Check if the environment variable is set
    if (!process.env.NEXT_PUBLIC_BACKEND_URL) {
      toast({
        title: "Backend Configuration",
        description: "Create a .env.local file with NEXT_PUBLIC_BACKEND_URL to connect to your Python backend.",
        duration: 10000,
      })
    }
  }, [])

  return null
}

