import { NextResponse } from "next/server"
import { createWorker } from "tesseract.js"

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Create worker and recognize text
    const worker = await createWorker()
    await worker.loadLanguage("eng")
    await worker.initialize("eng")

    const { data } = await worker.recognize(buffer)
    await worker.terminate()

    return NextResponse.json({
      text: data.text,
      confidence: data.confidence,
    })
  } catch (error) {
    console.error("OCR processing error:", error)
    return NextResponse.json({ error: "Failed to process document" }, { status: 500 })
  }
}

