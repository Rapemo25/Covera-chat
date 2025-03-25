import { NextResponse } from "next/server"

export async function GET() {
  const geminiAvailable = !!process.env.GOOGLE_API_KEY

  if (!geminiAvailable) {
    return NextResponse.json(
      {
        status: "error",
        message: "Gemini API key is not configured",
      },
      { status: 500 },
    )
  }

  return NextResponse.json({
    status: "success",
    model: "gemini",
    available: true,
  })
}

