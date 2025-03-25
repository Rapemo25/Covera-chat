import { type NextRequest, NextResponse } from "next/server"
import { getChatHistory } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    const userId = params.userId

    if (!userId) {
      return NextResponse.json({ success: false, error: "User ID is required" }, { status: 400 })
    }

    const chatHistory = await getChatHistory(userId)

    return NextResponse.json({
      success: true,
      data: chatHistory,
    })
  } catch (error) {
    console.error("Error fetching chat history:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch chat history" }, { status: 500 })
  }
}

