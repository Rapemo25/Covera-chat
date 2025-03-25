import { google } from "@ai-sdk/google"
import { streamText } from "ai"
import { saveChatMessage } from "@/lib/db"

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

// Check if Google API key is available
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY

export async function POST(req: Request) {
  if (!GOOGLE_API_KEY) {
    return new Response(JSON.stringify({ error: "Gemini API key not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }

  const { messages, userId } = await req.json()

  // Add insurance-specific system prompt
  const systemMessage = {
    role: "system",
    content:
      "You are Covera Digital AI, an insurance brokerage assistant. Help users with insurance quotes, policy information, claims processes, and general insurance questions. Be professional, accurate, and helpful. Do not provide specific pricing unless given clear parameters.",
  }

  // Save the user message to Supabase if userId is provided
  if (userId && messages.length > 0 && messages[messages.length - 1].role === "user") {
    try {
      const userMessage = messages[messages.length - 1]

      await saveChatMessage({
        user_id: userId,
        content: userMessage.content,
        role: "user",
        model_provider: "gemini",
      })
    } catch (error) {
      // Log but continue - this shouldn't block the chat functionality
      console.warn("Failed to save user message to Supabase:", error)
    }
  }

  // Use Gemini model
  const model = google("gemini-1.5-pro", { apiKey: GOOGLE_API_KEY })

  // Generate AI response
  const result = streamText({
    model,
    messages: [systemMessage, ...messages],
  })

  // Save the assistant's response to Supabase after getting it
  if (userId) {
    result.text
      .then(async (assistantResponse) => {
        try {
          await saveChatMessage({
            user_id: userId,
            content: assistantResponse,
            role: "assistant",
            model_provider: "gemini",
          })
        } catch (error) {
          // Just log the error - this is not critical
          console.warn("Failed to save assistant message to Supabase:", error)
        }
      })
      .catch((error) => {
        console.warn("Error processing assistant response:", error)
      })
  }

  return result.toDataStreamResponse()
}

