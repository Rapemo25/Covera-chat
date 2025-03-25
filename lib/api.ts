// API utility functions for the Python backend

// Get the backend URL from environment variables or use production URL
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://your-backend-url.railway.app"  // Update this with your deployed backend URL

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

// Chat message handling
export async function sendChatMessage(message: string, userId?: string): Promise<any> {
  if (!BACKEND_URL) {
    throw new Error("Backend URL not configured")
  }

  const response = await fetch(`${BACKEND_URL}/api/chat/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ 
      message,
      user_id: userId 
    }),
  })

  if (!response.ok) {
    throw new Error(`Backend returned status ${response.status}`)
  }

  return response.json()
}

// Get chat history
export async function getChatHistory(userId: string): Promise<any> {
  if (!BACKEND_URL) {
    throw new Error("Backend URL not configured")
  }

  const response = await fetch(`${BACKEND_URL}/api/chat/history/${userId}`)

  if (!response.ok) {
    throw new Error(`Backend returned status ${response.status}`)
  }

  return response.json()
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

// Get insurance quotes
export async function getInsuranceQuotes(formData: any): Promise<any> {
  if (!BACKEND_URL) {
    throw new Error("Backend URL not configured")
  }

  const response = await fetch(`${BACKEND_URL}/api/quotes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  })

  if (!response.ok) {
    throw new Error(`Backend returned status ${response.status}`)
  }

  return response.json()
}
