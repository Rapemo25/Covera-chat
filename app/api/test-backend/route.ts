import { NextResponse } from "next/server"

export async function GET() {
  const backendUrl = process.env.BACKEND_URL

  if (!backendUrl) {
    return NextResponse.json(
      {
        status: "error",
        message: "BACKEND_URL environment variable is not set",
      },
      { status: 500 },
    )
  }

  try {
    // Add a timeout to the fetch request
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)

    const response = await fetch(`${backendUrl}/health`, {
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (response.ok) {
      const data = await response.json()
      return NextResponse.json({
        status: "success",
        message: "Backend connection successful",
        data,
      })
    } else {
      return NextResponse.json(
        {
          status: "error",
          message: `Backend returned status ${response.status}`,
        },
        { status: response.status },
      )
    }
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: `Failed to connect to backend: ${error instanceof Error ? error.message : String(error)}`,
      },
      { status: 500 },
    )
  }
}

