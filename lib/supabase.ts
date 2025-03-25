import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database tables
export type ChatMessage = {
  id: string
  user_id: string
  content: string
  role: "user" | "assistant"
  model_provider: string
  created_at: string
}

export type InsuranceQuote = {
  id: string
  user_id: string
  quote_data: any
  created_at: string
}

export type UserDocument = {
  id: string
  user_id: string
  file_path: string
  extracted_text: string
  created_at: string
}

