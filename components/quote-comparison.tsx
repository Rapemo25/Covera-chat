"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Star, Check, X, Download, Phone, Loader2, Shield, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/hooks/use-toast"

interface QuoteFormData {
  type: string
  coverageLevel: string
  zipCode: string
  vehicleYear?: string
  vehicleMake?: string
  vehicleModel?: string
  homeType?: string
  homeYear?: string
  squareFeet?: string
}

interface CoverageDetail {
  name: string
  value: string
}

interface Quote {
  insurerId: string
  insurerName: string
  insurerLogo: string
  rating: number
  reviewCount: number
  premium: number
  discountPercent: number
  discountAmount: number
  finalPremium: number
  coverageDetails: CoverageDetail[]
  uniqueFeatures: string[]
  paymentOptions: string[]
  estimatedSavings: number
  quoteId: string
  quoteExpiry: string
}

interface QuoteResponse {
  quotes: Quote[]
  requestId: string
  timestamp: string
}

export function QuoteComparison() {
  const router = useRouter()
  const [formData, setFormData] = useState<QuoteFormData | null>(null)
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedQuotes, setSelectedQuotes] = useState<string[]>([])
  const [expandedQuotes, setExpandedQuotes] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    // Retrieve form data from session storage
    const storedData = sessionStorage.getItem("quoteFormData")
    if (storedData) {
      const parsedData = JSON.parse(storedData)
      setFormData(parsedData)
      fetchQuotes(parsedData)
    } else {
      setError("No quote request data found")
      setIsLoading(false)
    }
  }, [])

  const fetchQuotes = async (data: QuoteFormData) => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/quotes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Failed to fetch quotes")
      }

      const quoteData: QuoteResponse = await response.json()
      setQuotes(quoteData.quotes)

      // Auto-select the top 3 quotes
      setSelectedQuotes(quoteData.quotes.slice(0, 3).map((q) => q.insurerId))

      // Expand the first quote
      if (quoteData.quotes.length > 0) {
        setExpandedQuotes([quoteData.quotes[0].insurerId])
      }
    } catch (err) {
      setError("Failed to fetch insurance quotes. Please try again.")
      console.error("Error fetching quotes:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleQuoteSelection = (insurerId: string) => {
    setSelectedQuotes((prev) => {
      if (prev.includes(insurerId)) {
        return prev.filter((id) => id !== insurerId)
      } else {
        // Limit to 3 selections
        if (prev.length >= 3) {
          toast({
            title: "Selection limit reached",
            description: "You can compare up to 3 quotes at a time",
            variant: "destructive",
          })
          return prev
        }
        return [...prev, insurerId]
      }
    })
  }

  const toggleQuoteExpansion = (insurerId: string) => {
    setExpandedQuotes((prev) => {
      if (prev.includes(insurerId)) {
        return prev.filter((id) => id !== insurerId)
      } else {
        return [...prev, insurerId]
      }
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const handleContactAgent = (insurerName: string) => {
    toast({
      title: "Agent Contact Request Sent",
      description: `A ${insurerName} agent will contact you shortly.`,
    })
  }

  const handlePurchase = (insurerName: string) => {
    toast({
      title: "Proceeding to Purchase",
      description: `You're being redirected to complete your ${insurerName} policy purchase.`,
    })
  }

  const handleSaveQuote = (insurerName: string) => {
    toast({
      title: "Quote Saved",
      description: `Your ${insurerName} quote has been saved to your account.`,
    })
  }

  const handleShareQuote = (insurerName: string) => {
    toast({
      title: "Share Quote",
      description: `Share link for your ${insurerName} quote has been copied to clipboard.`,
    })
  }

  const getStarRating = (rating: number) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${i < Math.floor(rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
          />
        ))}
        <span className="ml-1 text-sm text-gray-600">{rating.toFixed(1)}</span>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
        <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
        <h2 className="text-xl font-semibold mb-2">Fetching Insurance Quotes</h2>
        <p className="text-gray-500 text-center max-w-md mb-6">
          We're comparing rates from multiple insurers to find you the best coverage options.
        </p>
        <div className="w-full max-w-md bg-gray-100 rounded-full h-2.5 mb-4">
          <div className="bg-primary h-2.5 rounded-full animate-pulse" style={{ width: "70%" }}></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
        <div className="bg-red-100 text-red-800 p-4 rounded-md mb-4">
          <p>{error}</p>
        </div>
        <Button onClick={() => router.push("/")} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Return to Home
        </Button>
      </div>
    )
  }

  const selectedQuoteData = quotes.filter((quote) => selectedQuotes.includes(quote.insurerId))

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => router.push("/")} className="mr-2">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Compare Insurance Quotes</h1>
      </div>

      <div className="bg-gray-50 p-4 rounded-md mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <Badge variant="outline" className="bg-white">
              {formData?.type === "auto" ? "Auto Insurance" : "Home Insurance"}
            </Badge>
          </div>
          <div>
            <span className="text-sm text-gray-500 mr-1">Coverage Level:</span>
            <span className="font-medium capitalize">{formData?.coverageLevel}</span>
          </div>
          {formData?.type === "auto" && formData.vehicleMake && formData.vehicleYear && (
            <div>
              <span className="text-sm text-gray-500 mr-1">Vehicle:</span>
              <span className="font-medium capitalize">
                {formData.vehicleYear} {formData.vehicleMake} {formData.vehicleModel}
              </span>
            </div>
          )}
          {formData?.type === "home" && formData.homeType && (
            <div>
              <span className="text-sm text-gray-500 mr-1">Property:</span>
              <span className="font-medium capitalize">{formData.homeType?.replace("-", " ")}</span>
            </div>
          )}
          {formData?.zipCode && (
            <div>
              <span className="text-sm text-gray-500 mr-1">Location:</span>
              <span className="font-medium">{formData.zipCode}</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Quote List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Available Quotes</CardTitle>
              <CardDescription>Select up to 3 quotes to compare</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <ul className="divide-y">
                {quotes.map((quote) => (
                  <li key={quote.insurerId} className="p-4 hover:bg-gray-50">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mr-2">
                        <input
                          type="checkbox"
                          checked={selectedQuotes.includes(quote.insurerId)}
                          onChange={() => toggleQuoteSelection(quote.insurerId)}
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex justify-between">
                          <p className="font-medium text-gray-900">{quote.insurerName}</p>
                          <p className="font-bold text-primary">{formatCurrency(quote.finalPremium)}</p>
                        </div>
                        <div className="mt-1 flex items-center">
                          {getStarRating(quote.rating)}
                          <span className="ml-1 text-xs text-gray-500">({quote.reviewCount})</span>
                        </div>
                        <div className="mt-1">
                          <Badge variant="secondary" className="text-xs">
                            Save {formatCurrency(quote.discountAmount)} ({quote.discountPercent}% off)
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Comparison Area */}
        <div className="lg:col-span-3">
          {selectedQuoteData.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 rounded-md p-8 text-center">
              <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select quotes to compare</h3>
              <p className="text-gray-500 mb-4">
                Choose up to 3 insurance quotes from the list to see a detailed comparison.
              </p>
            </div>
          ) : (
            <Card>
              <CardHeader>
                <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
                  <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="coverage">Coverage Details</TabsTrigger>
                    <TabsTrigger value="features">Features</TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardHeader>
              <CardContent>
                <TabsContent value="overview" className="mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {selectedQuoteData.map((quote) => (
                      <Card key={quote.insurerId} className="border-2 hover:border-primary transition-colors">
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-lg">{quote.insurerName}</CardTitle>
                              <div className="mt-1">{getStarRating(quote.rating)}</div>
                            </div>
                            {quote === selectedQuoteData[0] && (
                              <Badge className="bg-primary text-primary-foreground">Best Value</Badge>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent className="pb-2">
                          <div className="mb-4">
                            <p className="text-3xl font-bold text-primary">{formatCurrency(quote.finalPremium)}</p>
                            <p className="text-sm text-gray-500">
                              per {formData?.type === "auto" ? "vehicle" : "property"} / year
                            </p>
                            <div className="mt-1 flex items-center">
                              <DollarSign className="h-4 w-4 text-green-600" />
                              <span className="text-sm text-green-600">{quote.discountPercent}% discount applied</span>
                            </div>
                          </div>

                          <Separator className="my-3" />

                          <div className="space-y-2">
                            <h4 className="font-medium text-sm">Key Coverage</h4>
                            <ul className="space-y-1">
                              {quote.coverageDetails.slice(0, 3).map((detail, idx) => (
                                <li key={idx} className="flex justify-between text-sm">
                                  <span className="text-gray-500">{detail.name}:</span>
                                  <span className="font-medium">{detail.value}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </CardContent>
                        <CardFooter className="flex flex-col space-y-2">
                          <Button
                            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                            onClick={() => handlePurchase(quote.insurerName)}
                          >
                            Purchase Policy
                          </Button>
                          <div className="flex space-x-2 w-full">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={() => handleContactAgent(quote.insurerName)}
                            >
                              <Phone className="h-4 w-4 mr-1" />
                              Contact
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={() => handleSaveQuote(quote.insurerName)}
                            >
                              <Download className="h-4 w-4 mr-1" />
                              Save
                            </Button>
                          </div>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="coverage" className="mt-0">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="text-left p-3 border-b">Coverage</th>
                          {selectedQuoteData.map((quote) => (
                            <th key={quote.insurerId} className="text-left p-3 border-b">
                              {quote.insurerName}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {selectedQuoteData[0]?.coverageDetails.map((detail, idx) => (
                          <tr key={idx} className="border-b hover:bg-gray-50">
                            <td className="p-3 font-medium">{detail.name}</td>
                            {selectedQuoteData.map((quote) => (
                              <td key={quote.insurerId} className="p-3">
                                {quote.coverageDetails[idx]?.value}
                              </td>
                            ))}
                          </tr>
                        ))}
                        <tr className="bg-gray-50 font-bold">
                          <td className="p-3">Annual Premium</td>
                          {selectedQuoteData.map((quote) => (
                            <td key={quote.insurerId} className="p-3 text-primary">
                              {formatCurrency(quote.finalPremium)}
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </TabsContent>

                <TabsContent value="features" className="mt-0">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="text-left p-3 border-b">Feature</th>
                          {selectedQuoteData.map((quote) => (
                            <th key={quote.insurerId} className="text-left p-3 border-b">
                              {quote.insurerName}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {/* Combine all unique features */}
                        {Array.from(new Set(selectedQuoteData.flatMap((q) => q.uniqueFeatures))).map((feature, idx) => (
                          <tr key={idx} className="border-b hover:bg-gray-50">
                            <td className="p-3 font-medium">{feature}</td>
                            {selectedQuoteData.map((quote) => (
                              <td key={quote.insurerId} className="p-3">
                                {quote.uniqueFeatures.includes(feature) ? (
                                  <Check className="h-5 w-5 text-green-500" />
                                ) : (
                                  <X className="h-5 w-5 text-red-500" />
                                )}
                              </td>
                            ))}
                          </tr>
                        ))}
                        <tr className="border-b hover:bg-gray-50">
                          <td className="p-3 font-medium">Payment Options</td>
                          {selectedQuoteData.map((quote) => (
                            <td key={quote.insurerId} className="p-3">
                              {quote.paymentOptions.join(", ")}
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </TabsContent>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

