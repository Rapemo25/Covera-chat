"use client"

import type React from "react"

import { useState } from "react"
import { Upload, X, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { toast } from "@/hooks/use-toast"
import { saveDocument } from "@/lib/db"
import { supabase } from "@/lib/supabase"

interface FileUploadProps {
  onExtractedText: (text: string) => void
  backendAvailable?: boolean
  backendUrl?: string
  userId?: string
}

export function FileUpload({ onExtractedText, backendAvailable = false, userId = "anonymous" }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [preview, setPreview] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    // Check if file is an image
    if (!selectedFile.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (JPEG, PNG, etc.)",
        variant: "destructive",
      })
      return
    }

    // Check file size (limit to 5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive",
      })
      return
    }

    setFile(selectedFile)

    // Create preview
    const reader = new FileReader()
    reader.onload = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(selectedFile)
  }

  const processFile = async () => {
    if (!file) return

    setIsProcessing(true)
    setProgress(10)

    try {
      const formData = new FormData()
      formData.append("file", file)

      setProgress(30)

      const response = await fetch("/api/ocr", {
        method: "POST",
        body: formData,
      })

      setProgress(70)

      if (!response.ok) {
        throw new Error("OCR processing failed")
      }

      const data = await response.json()
      setProgress(90)

      if (data.text) {
        // Save the document to Supabase if available
        if (backendAvailable && file) {
          try {
            // Upload file to Supabase Storage
            const fileExt = file.name.split(".").pop()
            const fileName = `${userId}/${Date.now()}.${fileExt}`

            // Upload to Supabase Storage
            const { data: uploadData, error: uploadError } = await supabase.storage
              .from("documents")
              .upload(fileName, file)

            if (uploadError) {
              console.warn("Failed to upload file to Supabase Storage:", uploadError)
            } else {
              // Get the public URL
              const { data: urlData } = supabase.storage.from("documents").getPublicUrl(fileName)

              // Save document metadata to database
              await saveDocument(userId, urlData.publicUrl, data.text)
            }
          } catch (error) {
            console.warn("Failed to store document in Supabase:", error)
            // Continue anyway - this is not critical for the user
          }
        }

        setProgress(100)

        onExtractedText(data.text)
        toast({
          title: "Document processed",
          description: `Extracted text with ${Math.round(data.confidence)}% confidence`,
        })
      } else {
        toast({
          title: "No text found",
          description: "The document appears to be blank or unreadable",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error processing file:", error)
      toast({
        title: "Processing failed",
        description: "Failed to extract text from the document",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
      setFile(null)
      setPreview(null)
      setProgress(0)
    }
  }

  const cancelUpload = () => {
    setFile(null)
    setPreview(null)
    setProgress(0)
  }

  return (
    <div className="w-full">
      {!file ? (
        <div className="relative">
          <input
            type="file"
            id="file-upload"
            className="sr-only"
            accept="image/*"
            onChange={handleFileChange}
            disabled={isProcessing}
          />
          <label htmlFor="file-upload" className="cursor-pointer text-gray-500 hover:text-primary transition-colors">
            <Upload className="h-5 w-5" />
            <span className="sr-only">Upload document</span>
          </label>
        </div>
      ) : (
        <div className="space-y-2">
          {preview && (
            <div className="relative w-full max-w-xs mx-auto">
              <img
                src={preview || "/placeholder.svg"}
                alt="Document preview"
                className="w-full h-auto max-h-40 object-contain rounded-md border border-gray-200"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-1 right-1 h-6 w-6"
                onClick={cancelUpload}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}

          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            <span className="text-sm truncate max-w-[150px]">{file.name}</span>
          </div>

          {isProcessing ? (
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Processing document...</span>
                <span>{progress}%</span>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="text-xs" onClick={cancelUpload}>
                Cancel
              </Button>
              <Button
                variant="default"
                size="sm"
                className="text-xs bg-primary text-primary-foreground"
                onClick={processFile}
              >
                Extract Text
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

