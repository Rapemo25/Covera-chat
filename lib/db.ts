import { supabase, type ChatMessage } from "./supabase"

// Chat message functions
export async function saveChatMessage(message: Omit<ChatMessage, "id" | "created_at">) {
  try {
    const { data, error } = await supabase
      .from("chat_messages")
      .insert([
        {
          user_id: message.user_id,
          content: message.content,
          role: message.role,
          model_provider: message.model_provider,
        },
      ])
      .select()

    if (error) {
      console.error("Error saving chat message:", error)
      return null
    }

    return data?.[0] || null
  } catch (error) {
    console.error("Exception saving chat message:", error)
    return null
  }
}

export async function getChatHistory(userId: string) {
  try {
    const { data, error } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: true })

    if (error) {
      console.error("Error fetching chat history:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Exception fetching chat history:", error)
    return []
  }
}

// Document functions
export async function saveDocument(userId: string, filePath: string, extractedText: string) {
  try {
    const { data, error } = await supabase
      .from("user_documents")
      .insert([
        {
          user_id: userId,
          file_path: filePath,
          extracted_text: extractedText,
        },
      ])
      .select()

    if (error) {
      console.error("Error saving document:", error)
      return null
    }

    return data?.[0] || null
  } catch (error) {
    console.error("Exception saving document:", error)
    return null
  }
}

// Quote functions
export async function saveQuoteRequest(userId: string, quoteData: any) {
  try {
    const { data, error } = await supabase
      .from("insurance_quotes")
      .insert([
        {
          user_id: userId,
          quote_data: quoteData,
        },
      ])
      .select()

    if (error) {
      console.error("Error saving quote request:", error)
      return null
    }

    return data?.[0] || null
  } catch (error) {
    console.error("Exception saving quote request:", error)
    return null
  }
}

