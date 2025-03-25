"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Car, Home, ChevronRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function QuoteForm() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    type: "",
    coverageLevel: "",
    zipCode: "",
    // Auto specific
    vehicleYear: "",
    vehicleMake: "",
    vehicleModel: "",
    // Home specific
    homeType: "",
    homeYear: "",
    squareFeet: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleTypeSelect = (type: string) => {
    setFormData((prev) => ({ ...prev, type }))
    setStep(2)
  }

  const handleCoverageSelect = (coverageLevel: string) => {
    setFormData((prev) => ({ ...prev, coverageLevel }))
    setStep(3)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Store form data in session storage for the comparison page
      sessionStorage.setItem("quoteFormData", JSON.stringify(formData))

      // Save the quote request to Supabase via Python backend
      await fetch("http://localhost:8000/api/quotes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: "anonymous", // In a real app, use the actual user ID
          quote_data: formData,
        }),
      })

      // Navigate to the comparison page
      router.push("/quote-comparison")
    } catch (error) {
      console.error("Error submitting quote form:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold text-center mb-6">Get Insurance Quotes</h1>

      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-lg font-medium">What type of insurance do you need?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card
              className={`cursor-pointer hover:border-primary transition-colors ${formData.type === "auto" ? "border-primary" : ""}`}
              onClick={() => handleTypeSelect("auto")}
            >
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <Car className="mr-2 h-5 w-5 text-primary" />
                  Auto Insurance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Coverage for your vehicle including liability, collision, and comprehensive protection.
                </CardDescription>
              </CardContent>
              <CardFooter className="pt-0">
                <Button variant="ghost" size="sm" className="ml-auto">
                  Select <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>

            <Card
              className={`cursor-pointer hover:border-primary transition-colors ${formData.type === "home" ? "border-primary" : ""}`}
              onClick={() => handleTypeSelect("home")}
            >
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <Home className="mr-2 h-5 w-5 text-primary" />
                  Home Insurance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Protection for your home, personal property, and liability coverage for your residence.
                </CardDescription>
              </CardContent>
              <CardFooter className="pt-0">
                <Button variant="ghost" size="sm" className="ml-auto">
                  Select <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <Button variant="ghost" className="mb-2" onClick={() => setStep(1)}>
            ← Back
          </Button>

          <h2 className="text-lg font-medium">Select your coverage level</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card
              className={`cursor-pointer hover:border-primary transition-colors ${formData.coverageLevel === "basic" ? "border-primary" : ""}`}
              onClick={() => handleCoverageSelect("basic")}
            >
              <CardHeader>
                <CardTitle>Basic</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Essential coverage that meets state minimum requirements at the lowest cost.
                </CardDescription>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" size="sm" className="ml-auto">
                  Select <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>

            <Card
              className={`cursor-pointer hover:border-primary transition-colors ${formData.coverageLevel === "standard" ? "border-primary" : ""}`}
              onClick={() => handleCoverageSelect("standard")}
            >
              <CardHeader>
                <CardTitle>Standard</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>Balanced coverage with higher limits and additional protections.</CardDescription>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" size="sm" className="ml-auto">
                  Select <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>

            <Card
              className={`cursor-pointer hover:border-primary transition-colors ${formData.coverageLevel === "premium" ? "border-primary" : ""}`}
              onClick={() => handleCoverageSelect("premium")}
            >
              <CardHeader>
                <CardTitle>Premium</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Comprehensive coverage with maximum protection and lowest deductibles.
                </CardDescription>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" size="sm" className="ml-auto">
                  Select <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      )}

      {step === 3 && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <Button variant="ghost" type="button" className="mb-2" onClick={() => setStep(2)}>
            ← Back
          </Button>

          <Card>
            <CardHeader>
              <CardTitle>{formData.type === "auto" ? "Auto Insurance Details" : "Home Insurance Details"}</CardTitle>
              <CardDescription>Please provide the following information to get accurate quotes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="zipCode">Zip Code</Label>
                  <Input
                    id="zipCode"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    placeholder="Enter zip code"
                    required
                  />
                </div>

                {formData.type === "auto" ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="vehicleYear">Vehicle Year</Label>
                      <Select
                        onValueChange={(value) => handleSelectChange("vehicleYear", value)}
                        value={formData.vehicleYear}
                      >
                        <SelectTrigger id="vehicleYear">
                          <SelectValue placeholder="Select year" />
                        </SelectTrigger>
                        <SelectContent>
                          {[...Array(25)].map((_, i) => (
                            <SelectItem key={i} value={(new Date().getFullYear() - i).toString()}>
                              {new Date().getFullYear() - i}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="vehicleMake">Vehicle Make</Label>
                      <Select
                        onValueChange={(value) => handleSelectChange("vehicleMake", value)}
                        value={formData.vehicleMake}
                      >
                        <SelectTrigger id="vehicleMake">
                          <SelectValue placeholder="Select make" />
                        </SelectTrigger>
                        <SelectContent>
                          {["Toyota", "Honda", "Ford", "Chevrolet", "Nissan", "BMW", "Mercedes", "Audi", "Tesla"].map(
                            (make) => (
                              <SelectItem key={make} value={make.toLowerCase()}>
                                {make}
                              </SelectItem>
                            ),
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="vehicleModel">Vehicle Model</Label>
                      <Input
                        id="vehicleModel"
                        name="vehicleModel"
                        value={formData.vehicleModel}
                        onChange={handleInputChange}
                        placeholder="Enter model"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="homeType">Home Type</Label>
                      <Select
                        onValueChange={(value) => handleSelectChange("homeType", value)}
                        value={formData.homeType}
                      >
                        <SelectTrigger id="homeType">
                          <SelectValue placeholder="Select home type" />
                        </SelectTrigger>
                        <SelectContent>
                          {["Single Family", "Condo", "Townhouse", "Multi-Family", "Mobile Home"].map((type) => (
                            <SelectItem key={type} value={type.toLowerCase().replace(" ", "-")}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="homeYear">Year Built</Label>
                      <Select
                        onValueChange={(value) => handleSelectChange("homeYear", value)}
                        value={formData.homeYear}
                      >
                        <SelectTrigger id="homeYear">
                          <SelectValue placeholder="Select year" />
                        </SelectTrigger>
                        <SelectContent>
                          {[...Array(12)].map((_, i) => {
                            const decade = Math.floor((new Date().getFullYear() - i * 10) / 10) * 10
                            return (
                              <SelectItem key={i} value={decade.toString()}>
                                {decade}s or newer
                              </SelectItem>
                            )
                          })}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="squareFeet">Square Feet</Label>
                      <Input
                        id="squareFeet"
                        name="squareFeet"
                        value={formData.squareFeet}
                        onChange={handleInputChange}
                        placeholder="Enter square footage"
                      />
                    </div>
                  </>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button
                type="submit"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Getting Quotes...
                  </>
                ) : (
                  "Compare Quotes"
                )}
              </Button>
            </CardFooter>
          </Card>
        </form>
      )}
    </div>
  )
}

