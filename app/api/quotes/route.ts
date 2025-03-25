import { NextResponse } from "next/server"

// Mock insurance companies data
const insurers = [
  {
    id: "insurer-1",
    name: "SafeGuard Insurance",
    logo: "/placeholder.svg?height=40&width=120",
    rating: 4.7,
    reviewCount: 1243,
    established: 1985,
  },
  {
    id: "insurer-2",
    name: "Pinnacle Protection",
    logo: "/placeholder.svg?height=40&width=120",
    rating: 4.5,
    reviewCount: 987,
    established: 1992,
  },
  {
    id: "insurer-3",
    name: "Liberty Shield",
    logo: "/placeholder.svg?height=40&width=120",
    rating: 4.8,
    reviewCount: 1567,
    established: 1978,
  },
  {
    id: "insurer-4",
    name: "Horizon Assurance",
    logo: "/placeholder.svg?height=40&width=120",
    rating: 4.3,
    reviewCount: 756,
    established: 2001,
  },
  {
    id: "insurer-5",
    name: "Atlas Coverage",
    logo: "/placeholder.svg?height=40&width=120",
    rating: 4.6,
    reviewCount: 1102,
    established: 1990,
  },
]

// Generate a random quote with some variation based on input parameters
function generateQuote(insurer, quoteData) {
  // Base premium calculation with some randomization
  const basePremium = quoteData.type === "auto" ? 800 + Math.random() * 400 : 1200 + Math.random() * 600

  // Adjust based on coverage level
  const coverageMultiplier =
    quoteData.coverageLevel === "basic" ? 0.8 : quoteData.coverageLevel === "standard" ? 1.0 : 1.3 // premium

  // Calculate final premium
  const premium = Math.round(basePremium * coverageMultiplier)

  // Generate coverage details based on type and level
  let coverageDetails = []

  if (quoteData.type === "auto") {
    coverageDetails = [
      {
        name: "Liability",
        value:
          quoteData.coverageLevel === "basic"
            ? "$25,000/$50,000"
            : quoteData.coverageLevel === "standard"
              ? "$50,000/$100,000"
              : "$100,000/$300,000",
      },
      {
        name: "Property Damage",
        value:
          quoteData.coverageLevel === "basic"
            ? "$10,000"
            : quoteData.coverageLevel === "standard"
              ? "$25,000"
              : "$50,000",
      },
      {
        name: "Collision Deductible",
        value:
          quoteData.coverageLevel === "basic" ? "$1,000" : quoteData.coverageLevel === "standard" ? "$500" : "$250",
      },
      {
        name: "Comprehensive Deductible",
        value:
          quoteData.coverageLevel === "basic" ? "$1,000" : quoteData.coverageLevel === "standard" ? "$500" : "$250",
      },
      {
        name: "Uninsured Motorist",
        value:
          quoteData.coverageLevel === "basic"
            ? "Not Included"
            : quoteData.coverageLevel === "standard"
              ? "Included"
              : "Included",
      },
      {
        name: "Roadside Assistance",
        value:
          quoteData.coverageLevel === "basic"
            ? "Not Included"
            : quoteData.coverageLevel === "standard"
              ? "Not Included"
              : "Included",
      },
    ]
  } else {
    // Home insurance
    coverageDetails = [
      {
        name: "Dwelling Coverage",
        value:
          quoteData.coverageLevel === "basic"
            ? "$200,000"
            : quoteData.coverageLevel === "standard"
              ? "$300,000"
              : "$500,000",
      },
      {
        name: "Personal Property",
        value:
          quoteData.coverageLevel === "basic"
            ? "$100,000"
            : quoteData.coverageLevel === "standard"
              ? "$150,000"
              : "$250,000",
      },
      {
        name: "Liability",
        value:
          quoteData.coverageLevel === "basic"
            ? "$100,000"
            : quoteData.coverageLevel === "standard"
              ? "$300,000"
              : "$500,000",
      },
      {
        name: "Deductible",
        value:
          quoteData.coverageLevel === "basic" ? "$2,000" : quoteData.coverageLevel === "standard" ? "$1,000" : "$500",
      },
      {
        name: "Water Damage",
        value:
          quoteData.coverageLevel === "basic"
            ? "Limited"
            : quoteData.coverageLevel === "standard"
              ? "Standard"
              : "Enhanced",
      },
      {
        name: "Replacement Cost",
        value:
          quoteData.coverageLevel === "basic"
            ? "Actual Cash Value"
            : quoteData.coverageLevel === "standard"
              ? "Replacement Cost"
              : "Extended Replacement Cost",
      },
    ]
  }

  // Add some unique features for each insurer
  const uniqueFeatures = []

  if (insurer.id === "insurer-1") {
    uniqueFeatures.push("24/7 Claims Service")
    uniqueFeatures.push("Accident Forgiveness")
  } else if (insurer.id === "insurer-2") {
    uniqueFeatures.push("Vanishing Deductible")
    uniqueFeatures.push("New Car Replacement")
  } else if (insurer.id === "insurer-3") {
    uniqueFeatures.push("Bundle Discount")
    uniqueFeatures.push("Safe Driver Rewards")
  } else if (insurer.id === "insurer-4") {
    uniqueFeatures.push("Mobile App Claims")
    uniqueFeatures.push("Paperless Discount")
  } else {
    uniqueFeatures.push("Loyalty Rewards")
    uniqueFeatures.push("Multi-Policy Discount")
  }

  if (quoteData.coverageLevel === "premium") {
    uniqueFeatures.push(quoteData.type === "auto" ? "Gap Coverage" : "Identity Theft Protection")
  }

  // Calculate a random discount between 5-15%
  const discountPercent = Math.floor(5 + Math.random() * 10)
  const discountAmount = Math.round((premium * discountPercent) / 100)
  const finalPremium = premium - discountAmount

  return {
    insurerId: insurer.id,
    insurerName: insurer.name,
    insurerLogo: insurer.logo,
    rating: insurer.rating,
    reviewCount: insurer.reviewCount,
    premium: premium,
    discountPercent: discountPercent,
    discountAmount: discountAmount,
    finalPremium: finalPremium,
    coverageDetails: coverageDetails,
    uniqueFeatures: uniqueFeatures,
    paymentOptions: ["Monthly", "Quarterly", "Annually"],
    estimatedSavings: Math.round(Math.random() * 200 + 100), // Random savings amount
    quoteId: `QT-${Math.floor(Math.random() * 1000000)}`,
    quoteExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
  }
}

export async function POST(req: Request) {
  try {
    const quoteData = await req.json()

    // Validate required fields
    if (!quoteData.type || !quoteData.coverageLevel) {
      return NextResponse.json({ error: "Missing required quote parameters" }, { status: 400 })
    }

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Generate quotes from multiple insurers
    const quotes = insurers.map((insurer) => generateQuote(insurer, quoteData))

    // Sort quotes by final premium (lowest first)
    quotes.sort((a, b) => a.finalPremium - b.finalPremium)

    return NextResponse.json({
      quotes,
      requestId: `REQ-${Math.floor(Math.random() * 1000000)}`,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Quote generation error:", error)
    return NextResponse.json({ error: "Failed to generate quotes" }, { status: 500 })
  }
}

