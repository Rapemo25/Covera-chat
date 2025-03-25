"use client"

import type React from "react"

import { useChat } from "ai/react"
import { useState, useEffect, useRef } from "react"
import { Send, Menu, X, User, MessageSquare, FileText, BarChart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useMobile } from "@/hooks/use-mobile"
import { FileUpload } from "@/components/file-upload"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useRouter } from "next/navigation"
import { getChatHistory } from "@/lib/db"
import { supabase } from "@/lib/supabase"
import { checkBackendAvailability, analyzePolicyDocument } from "@/lib/api"

// Backend URL with fallback to direct API if Python backend is unavailable
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || ""

export default function InsuranceBrokerageChat() {
  const router = useRouter()
  const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages } = useChat()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const isMobile = useMobile()
  const [showOcrUpload, setShowOcrUpload] = useState(false)
  const [userId, setUserId] = useState("anonymous") // In a real app, this would come from authentication
  const [supabaseReady, setSupabaseReady] = useState(false)
  const [backendAvailable, setBackendAvailable] = useState(false) // Default to false until confirmed
  const [pythonBackendAvailable, setPythonBackendAvailable] = useState(false)

  // Auto-close sidebar on mobile
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false)
    } else {
      setSidebarOpen(true)
    }
  }, [isMobile])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Check if Supabase is available
  useEffect(() => {
    const checkSupabaseConnection = async () => {
      try {
        // Simple query to check if Supabase is connected
        const { data, error } = await supabase.from("chat_messages").select("count").limit(1)

        if (error) {
          console.warn("Supabase connection error:", error)
          setSupabaseReady(false)
        } else {
          setSupabaseReady(true)
          // Now that we know Supabase is available, fetch chat history
          fetchChatHistory()
        }
      } catch (error) {
        console.warn("Supabase connection exception:", error)
        setSupabaseReady(false)
      }
    }

    checkSupabaseConnection()
  }, [userId])

  // Add this effect to check Python backend availability
  useEffect(() => {
    const checkPythonBackend = async () => {
      const isAvailable = await checkBackendAvailability()
      setPythonBackendAvailable(isAvailable)
    }

    checkPythonBackend()
  }, [])

  // Fetch chat history function
  const fetchChatHistory = async () => {
    if (!supabaseReady) return

    try {
      const chatHistory = await getChatHistory(userId)

      if (chatHistory && chatHistory.length > 0) {
        // Convert the chat history to the format expected by useChat
        const formattedMessages = chatHistory.map((msg) => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
        }))

        setMessages(formattedMessages)
      }
    } catch (error) {
      console.warn("Error fetching chat history:", error)
    }
  }

  // Format timestamp
  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    }).format(date)
  }

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (input.trim()) {
      // Pass userId for storage in the API route
      const data = { userId }
      handleSubmit(e, { data })
    }
  }

  const handleExtractedText = (text: string) => {
    // Add a system message with the extracted text
    const userMsg = {
      id: Date.now().toString(),
      role: "user" as const,
      content: "I uploaded a document for OCR processing.",
    }

    const assistantMsg = {
      id: (Date.now() + 1).toString(),
      role: "assistant" as const,
      content: `I've extracted the following text from your document:\n\n${text}\n\nHow would you like me to help with this information?`,
    }

    setMessages([...messages, userMsg, assistantMsg])

    // Hide OCR upload after processing
    setShowOcrUpload(false)
  }

  const navigateToQuotes = () => {
    router.push("/get-quotes")
  }

  // You can then use both Supabase and Python backend as needed
  // For example, for advanced document analysis:
  const analyzeDocument = async (documentId: string) => {
    if (pythonBackendAvailable) {
      try {
        const analysis = await analyzePolicyDocument(documentId)
        // Use the analysis results
        console.log("Policy analysis:", analysis)
      } catch (error) {
        console.error("Error analyzing document:", error)
      }
    } else {
      // Fallback to simpler analysis using just Supabase
      // ...
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } fixed md:relative z-10 w-64 h-full bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out`}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h1 className="text-xl font-semibold text-gray-800">Covera Digital AI</h1>
          {isMobile && (
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>

        <div className="p-4">
          <h2 className="text-sm font-medium text-gray-500 mb-2">Recent Conversations</h2>
          <div className="space-y-2">
            {["Auto Insurance Quote", "Home Policy Review", "Claims Support"].map((chat, index) => (
              <div key={index} className="flex items-center p-2 rounded-md hover:bg-gray-100 cursor-pointer">
                <MessageSquare className="h-4 w-4 mr-2 text-gray-500" />
                <span className="text-sm text-gray-700">{chat}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-gray-200">
          <h2 className="text-sm font-medium text-gray-500 mb-2">Tools</h2>
          <div className="space-y-2">
            <div
              className="flex items-center p-2 rounded-md hover:bg-gray-100 cursor-pointer"
              onClick={navigateToQuotes}
            >
              <BarChart className="h-4 w-4 mr-2 text-primary" />
              <span className="text-sm text-gray-700">Compare Insurance Quotes</span>
            </div>
            <div
              className="flex items-center p-2 rounded-md hover:bg-gray-100 cursor-pointer"
              onClick={() => setShowOcrUpload(true)}
            >
              <FileText className="h-4 w-4 mr-2 text-primary" />
              <span className="text-sm text-gray-700">OCR Document Scanner</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between p-4 bg-white border-b border-gray-200 border-t-4 border-t-primary">
          {isMobile && (
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
          )}
          <div className="flex items-center">
            <Avatar className="h-8 w-8 mr-2">
              <AvatarImage src="/placeholder.svg?height=32&width=32" alt="Agent" />
              <AvatarFallback>AI</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-sm font-medium">Covera Assistant</h2>
              <p className="text-xs text-gray-500">Powered by Gemini</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={navigateToQuotes}>
              <BarChart className="h-4 w-4 mr-2" />
              Get Quotes
            </Button>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
              <MessageSquare className="h-12 w-12 text-orange-300 mb-2" />
              <h3 className="text-lg font-medium text-gray-700">Welcome to Covera Digital AI</h3>
              <p className="text-sm text-gray-500 max-w-md mt-1">
                Ask questions about policies, claims, or get quotes for your insurance needs.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 max-w-2xl">
                <div className="bg-white p-6 rounded-lg border border-gray-200 flex flex-col items-center text-center">
                  <BarChart className="h-8 w-8 text-primary mb-2" />
                  <p className="text-sm text-gray-700 font-medium">Compare Insurance Quotes</p>
                  <p className="text-xs text-gray-500 max-w-md mt-1 mb-4">
                    Get and compare quotes from multiple insurance providers.
                  </p>
                  <Button variant="outline" size="sm" onClick={navigateToQuotes}>
                    <BarChart className="h-4 w-4 mr-2" />
                    Get Quotes
                  </Button>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200 flex flex-col items-center text-center">
                  <FileText className="h-8 w-8 text-primary mb-2" />
                  <p className="text-sm text-gray-700 font-medium">OCR Document Processing</p>
                  <p className="text-xs text-gray-500 max-w-md mt-1 mb-4">
                    Upload insurance documents to extract and analyze text automatically.
                  </p>
                  <Button variant="outline" size="sm" onClick={() => setShowOcrUpload(true)}>
                    <FileText className="h-4 w-4 mr-2" />
                    Scan Document
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            messages.map((message) => {
              const isUser = message.role === "user"
              const timestamp = new Date()

              return (
                <div key={message.id} className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
                  {!isUser && (
                    <Avatar className="h-8 w-8 mr-2 mt-1">
                      <AvatarImage src="/placeholder.svg?height=32&width=32" alt="Agent" />
                      <AvatarFallback>AI</AvatarFallback>
                    </Avatar>
                  )}

                  <div className={`max-w-[75%]`}>
                    <div
                      className={`p-3 rounded-lg ${
                        isUser ? "bg-primary text-primary-foreground" : "bg-white text-gray-800 border border-gray-200"
                      }`}
                    >
                      {message.content.split("\n").map((text, i) => (
                        <p key={i} className={i > 0 ? "mt-2" : ""}>
                          {text}
                        </p>
                      ))}
                    </div>
                    <div className={`text-xs text-gray-500 mt-1 ${isUser ? "text-right" : "text-left"}`}>
                      {formatTime(timestamp)}
                    </div>
                  </div>

                  {isUser && (
                    <Avatar className="h-8 w-8 ml-2 mt-1">
                      <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
                      <AvatarFallback>
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              )
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* OCR Upload Area */}
        {showOcrUpload && (
          <div className="p-4 bg-gray-100 border-t border-gray-200">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium text-gray-700">Document Scanner</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowOcrUpload(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="bg-white p-4 rounded-md border border-gray-200">
              <FileUpload
                onExtractedText={handleExtractedText}
                backendAvailable={supabaseReady}
                backendUrl=""
                userId={userId}
              />
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-gray-200">
          <form onSubmit={onSubmit} className="flex space-x-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-gray-500 hover:text-primary"
                    onClick={() => setShowOcrUpload(!showOcrUpload)}
                  >
                    <FileText className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Scan document with OCR</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Input
              value={input}
              onChange={handleInputChange}
              placeholder="Type your message..."
              className="flex-1"
              disabled={isLoading}
            />
            <Button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Send className="h-4 w-4 mr-2" />
              Send
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}

