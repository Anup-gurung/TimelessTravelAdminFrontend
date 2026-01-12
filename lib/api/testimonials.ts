const API_BASE_URL = process.env.NEXT_PUBLIC_URL || "http://localhost:5000/api"

export interface Testimonial {
  _id?: string
  id?: string
  user_image: string
  username: string
  star_rating: number
  description: string
  approval_status: "pending" | "approved" | "rejected"
  created_at?: string
  createdAt?: string
  updatedAt?: string
}

export const testimonialsApi = {
  // Submit a new testimonial (public)
  submit: async (testimonialData: { username: string; star_rating: number; description: string }, imageFile?: File): Promise<Testimonial> => {
    try {
      const formData = new FormData()
      
      // Append testimonial data
      formData.append("username", testimonialData.username)
      formData.append("star_rating", testimonialData.star_rating.toString())
      formData.append("description", testimonialData.description)
      
      // Append image file if provided
      if (imageFile) {
        formData.append("user_image", imageFile)
      }

      const response = await fetch(`${API_BASE_URL}/testimonials/submit`, {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Submit testimonial error:", response.status, errorText)
        throw new Error(`Failed to submit testimonial: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error("Submit testimonial error:", error)
      throw error
    }
  },

  // Get approved testimonials (public)
  getApproved: async (): Promise<Testimonial[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/testimonials/approved`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Get approved testimonials error:", response.status, errorText)
        throw new Error(`Failed to fetch approved testimonials: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error("Get approved testimonials error:", error)
      throw error
    }
  },

  // Admin: Get all testimonials
  getAll: async (): Promise<Testimonial[]> => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      }
      
      if (token) {
        headers["Authorization"] = `Bearer ${token}`
      }

      const response = await fetch(`${API_BASE_URL}/testimonials/admin/all`, {
        method: "GET",
        headers,
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("API Error:", response.status, errorText)
        throw new Error(`Failed to fetch testimonials: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error("Get all testimonials error:", error)
      throw error
    }
  },

  // Admin: Get single testimonial by ID
  getById: async (id: string): Promise<Testimonial> => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      }
      
      if (token) {
        headers["Authorization"] = `Bearer ${token}`
      }

      const response = await fetch(`${API_BASE_URL}/testimonials/admin/${id}`, {
        method: "GET",
        headers,
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to fetch testimonial: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error("Get testimonial error:", error)
      throw error
    }
  },

  // Admin: Update testimonial status
  updateStatus: async (id: string, status: "approved" | "rejected"): Promise<Testimonial> => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      }
      
      if (token) {
        headers["Authorization"] = `Bearer ${token}`
      }

      const response = await fetch(`${API_BASE_URL}/testimonials/admin/${id}/status`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ approval_status: status }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Update status error:", response.status, errorText)
        throw new Error(`Failed to update testimonial status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error("Update testimonial status error:", error)
      throw error
    }
  },

  // Admin: Delete testimonial
  delete: async (id: string): Promise<void> => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      }
      
      if (token) {
        headers["Authorization"] = `Bearer ${token}`
      }

      const response = await fetch(`${API_BASE_URL}/testimonials/admin/${id}`, {
        method: "DELETE",
        headers,
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Delete testimonial error:", response.status, errorText)
        throw new Error(`Failed to delete testimonial: ${response.status}`)
      }
    } catch (error) {
      console.error("Delete testimonial error:", error)
      throw error
    }
  },
}
