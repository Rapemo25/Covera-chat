// API utility functions for the Python backend

// Get the backend URL from environment variables
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || ""

// Check if the backend is available
export async function checkBackendAvailability(): Promise<boolean> {
  if (!BACKEND_URL) return false

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 3000)

    const response = await fetch(`${BACKEND_URL}/health`, {
      signal: controller.signal,
    })

    clearTimeout(timeoutId)
    return response.ok
  } catch (error) {
    console.warn("Backend unavailable:", error)
    return false
  }
}

// Advanced policy analysis using the Python backend
export async function analyzePolicyDocument(documentId: string): Promise<any> {
  if (!BACKEND_URL) {
    throw new Error("Backend URL not configured")
  }

  const response = await fetch(`${BACKEND_URL}/api/analyze/policy`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ document_id: documentId }),
  })

  if (!response.ok) {
    throw new Error(`Backend returned status ${response.status}`)
  }

  return response.json()
}

// Other Python backend-specific functions can be added here

