import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const userId = (formData.get("userId") as string) || "anonymous"

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Generate a unique file name
    const fileExt = file.name.split(".").pop()
    const fileName = `${userId}/${Date.now()}.${fileExt}`

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage.from("documents").upload(fileName, buffer)

    if (error) {
      console.error("Storage upload error:", error)
      return NextResponse.json({ error: "Failed to upload file" }, { status: 500 })
    }

    // Get the public URL
    const { data: urlData } = supabase.storage.from("documents").getPublicUrl(fileName)

    return NextResponse.json({
      success: true,
      filePath: fileName,
      publicUrl: urlData.publicUrl,
    })
  } catch (error) {
    console.error("Storage upload exception:", error)
    return NextResponse.json({ error: "Failed to process upload" }, { status: 500 })
  }
}

