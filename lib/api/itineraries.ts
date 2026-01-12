const API_BASE_URL = process.env.NEXT_PUBLIC_URL || "http://localhost:5000/api"

export interface DayItinerary {
  _id?: string
  day_number: number
  title?: string
  description: string
  location?: string
  images: string[]
}

export interface PricingTier {
  min_pax: number
  max_pax: number | null
  price_per_person: number
  label: string
}

export interface Itinerary {
  _id?: string
  title: string
  short_desc?: string
  long_desc?: string
  location: string
  difficulty: "Easy" | "Medium" | "Hard"
  price: number
  pricing_tiers?: PricingTier[]
  category: "Culture" | "Festival"
  tour_type?: "Trekking" | "Walking" | "Adventure" | null
  start_date: string
  end_date: string
  status?: "Draft" | "Published"
  is_cover_img: boolean
  cover_image_url: string
  itinerary_days?: DayItinerary[]
  createdAt?: string
  updatedAt?: string
}

export const itinerariesApi = {
  // Get all itineraries
  getAll: async (): Promise<Itinerary[]> => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      }
      
      if (token) {
        headers["Authorization"] = `Bearer ${token}`
      }

      const response = await fetch(`${API_BASE_URL}/itineraries`, {
        method: "GET",
        headers,
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("API Error:", response.status, errorText)
        throw new Error(`Failed to fetch itineraries: ${response.status} ${errorText}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error("Get itineraries error:", error)
      throw error
    }
  },

  // Get single itinerary by ID
  getById: async (id: string): Promise<Itinerary> => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      }
      
      if (token) {
        headers["Authorization"] = `Bearer ${token}`
      }

      const response = await fetch(`${API_BASE_URL}/itineraries/${id}`, {
        method: "GET",
        headers,
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to fetch itinerary: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error("Get itinerary error:", error)
      throw error
    }
  },

  // Create new itinerary
  create: async (itineraryData: Partial<Itinerary>, coverImageFile?: File): Promise<Itinerary> => {
    try {
      const formData = new FormData()
      const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null

      // Append cover image if provided
      if (coverImageFile) {
        formData.append("cover_image", coverImageFile)
      }

      // Append other fields
      Object.keys(itineraryData).forEach((key) => {
        const value = itineraryData[key as keyof Itinerary]
        // Skip itinerary_days as they have their own endpoints
        if (value !== undefined && value !== null && key !== "cover_image_url" && key !== "itinerary_days") {
          formData.append(key, typeof value === "object" ? JSON.stringify(value) : String(value))
        }
      })

      const headers: HeadersInit = {}
      if (token) {
        headers["Authorization"] = `Bearer ${token}`
      }

      const response = await fetch(`${API_BASE_URL}/itineraries`, {
        method: "POST",
        headers,
        body: formData,
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Create itinerary error:", response.status, errorText)
        try {
          const errorData = JSON.parse(errorText)
          throw new Error(errorData.message || `Failed to create itinerary: ${response.status}`)
        } catch (e) {
          throw new Error(`Failed to create itinerary: ${response.status} - ${errorText}`)
        }
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error("Create itinerary error:", error)
      throw error
    }
  },

  // Update itinerary
  update: async (id: string, itineraryData: Partial<Itinerary>, coverImageFile?: File): Promise<Itinerary> => {
    try {
      const formData = new FormData()
      const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null

      // Append cover image if provided
      if (coverImageFile) {
        formData.append("cover_image", coverImageFile)
      }

      // Append other fields
      Object.keys(itineraryData).forEach((key) => {
        const value = itineraryData[key as keyof Itinerary]
        // Skip itinerary_days as they have their own endpoints
        if (value !== undefined && value !== null && key !== "cover_image_url" && key !== "_id" && key !== "itinerary_days") {
          formData.append(key, typeof value === "object" ? JSON.stringify(value) : String(value))
        }
      })

      const headers: HeadersInit = {}
      if (token) {
        headers["Authorization"] = `Bearer ${token}`
      }

      const response = await fetch(`${API_BASE_URL}/itineraries/${id}`, {
        method: "PUT",
        headers,
        body: formData,
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Update itinerary error:", response.status, errorText)
        try {
          const errorData = JSON.parse(errorText)
          throw new Error(errorData.message || `Failed to update itinerary: ${response.status}`)
        } catch (e) {
          throw new Error(`Failed to update itinerary: ${response.status} - ${errorText}`)
        }
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error("Update itinerary error:", error)
      throw error
    }
  },

  // Delete itinerary
  delete: async (id: string): Promise<void> => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null
      const headers: HeadersInit = {}
      
      if (token) {
        headers["Authorization"] = `Bearer ${token}`
      }

      const response = await fetch(`${API_BASE_URL}/itineraries/${id}`, {
        method: "DELETE",
        headers,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Failed to delete itinerary" }))
        throw new Error(errorData.message || "Failed to delete itinerary")
      }
    } catch (error) {
      console.error("Delete itinerary error:", error)
      throw error
    }
  },

  // Add day to itinerary
  addDay: async (itineraryId: string, dayData: Partial<DayItinerary>, imageFiles?: File[]): Promise<Itinerary> => {
    try {
      const formData = new FormData()
      const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null

      // Append images if provided
      if (imageFiles && imageFiles.length > 0) {
        imageFiles.forEach((file) => {
          formData.append("images", file)
        })
      }

      // Append day data (including images array if no files provided)
      Object.keys(dayData).forEach((key) => {
        const value = dayData[key as keyof DayItinerary]
        if (value !== undefined && value !== null) {
          // Include images array if no separate image files are provided
          if (key === "images" && (!imageFiles || imageFiles.length === 0)) {
            formData.append(key, JSON.stringify(value))
          } else if (key !== "images") {
            formData.append(key, typeof value === "object" ? JSON.stringify(value) : String(value))
          }
        }
      })

      const headers: HeadersInit = {}
      if (token) {
        headers["Authorization"] = `Bearer ${token}`
      }

      const response = await fetch(`${API_BASE_URL}/itineraries/${itineraryId}/days`, {
        method: "POST",
        headers,
        body: formData,
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Add day error response:", response.status, errorText)
        try {
          const errorData = JSON.parse(errorText)
          throw new Error(errorData.message || `Failed to add day: ${response.status}`)
        } catch (e) {
          throw new Error(`Failed to add day: ${response.status} - ${errorText}`)
        }
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error("Add day error:", error)
      throw error
    }
  },

  // Update day in itinerary
  updateDay: async (itineraryId: string, dayId: string, dayData: Partial<DayItinerary>, imageFiles?: File[]): Promise<Itinerary> => {
    try {
      const formData = new FormData()
      const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null

      console.log("Updating day with data:", dayData)

      // Append images if provided
      if (imageFiles && imageFiles.length > 0) {
        imageFiles.forEach((file) => {
          formData.append("images", file)
        })
      }

      // Ensure required fields are present
      if (dayData.day_number !== undefined) {
        formData.append("day_number", String(dayData.day_number))
      }
      if (dayData.description !== undefined) {
        formData.append("description", dayData.description)
      }
      if (dayData.title !== undefined && dayData.title !== null) {
        formData.append("title", dayData.title)
      }
      if (dayData.location !== undefined && dayData.location !== null) {
        formData.append("location", dayData.location)
      }

      // Handle images
      if (dayData.images && (!imageFiles || imageFiles.length === 0)) {
        formData.append("images", JSON.stringify(dayData.images))
      }

      // Log formData contents for debugging
      console.log("FormData entries:")
      for (const pair of formData.entries()) {
        console.log(pair[0], pair[1])
      }

      const headers: HeadersInit = {}
      if (token) {
        headers["Authorization"] = `Bearer ${token}`
      }

      const response = await fetch(`${API_BASE_URL}/itineraries/${itineraryId}/days/${dayId}`, {
        method: "PUT",
        headers,
        body: formData,
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Update day error response:", response.status, errorText)
        try {
          const errorData = JSON.parse(errorText)
          throw new Error(errorData.message || `Failed to update day: ${response.status}`)
        } catch (e) {
          throw new Error(`Failed to update day: ${response.status} - ${errorText}`)
        }
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error("Update day error:", error)
      throw error
    }
  },

  // Remove day from itinerary
  removeDay: async (itineraryId: string, dayId: string): Promise<Itinerary> => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null
      const headers: HeadersInit = {}
      
      if (token) {
        headers["Authorization"] = `Bearer ${token}`
      }

      const response = await fetch(`${API_BASE_URL}/itineraries/${itineraryId}/days/${dayId}`, {
        method: "DELETE",
        headers,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Failed to remove day" }))
        throw new Error(errorData.message || "Failed to remove day")
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error("Remove day error:", error)
      throw error
    }
  },

  // Reorder days
  reorderDays: async (itineraryId: string, days: DayItinerary[]): Promise<Itinerary> => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      }
      
      if (token) {
        headers["Authorization"] = `Bearer ${token}`
      }

      const response = await fetch(`${API_BASE_URL}/itineraries/${itineraryId}/days/reorder`, {
        method: "PUT",
        headers,
        body: JSON.stringify({ days }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Failed to reorder days" }))
        throw new Error(errorData.message || "Failed to reorder days")
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error("Reorder days error:", error)
      throw error
    }
  },
}
