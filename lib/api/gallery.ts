const API_BASE_URL = process.env.NEXT_PUBLIC_URL || "http://localhost:5000/api"

export interface GalleryImage {
  _id?: string
  image_url: string
  place_name?: string
  createdAt?: string
  updatedAt?: string
}

export const galleryApi = {
  // Get all gallery entries
  getAll: async (): Promise<GalleryImage[]> => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      }
      
      if (token) {
        headers["Authorization"] = `Bearer ${token}`
      }

      const response = await fetch(`${API_BASE_URL}/gallery`, {
        method: "GET",
        headers,
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("API Error:", response.status, errorText)
        throw new Error(`Failed to fetch gallery: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error("Get gallery error:", error)
      throw error
    }
  },

  // Get single gallery entry by ID
  getById: async (id: string): Promise<GalleryImage> => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      }
      
      if (token) {
        headers["Authorization"] = `Bearer ${token}`
      }

      const response = await fetch(`${API_BASE_URL}/gallery/${id}`, {
        method: "GET",
        headers,
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to fetch gallery entry: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error("Get gallery entry error:", error)
      throw error
    }
  },

  // Create new gallery entry with image upload
  create: async (galleryData: Partial<GalleryImage>, imageFile: File): Promise<GalleryImage> => {
    try {
      const formData = new FormData()
      const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null

      // Append image file
      formData.append("image", imageFile)

      // Append place_name (required by backend)
      formData.append("place_name", galleryData.place_name || "")

      const headers: HeadersInit = {}
      if (token) {
        headers["Authorization"] = `Bearer ${token}`
      }

      const response = await fetch(`${API_BASE_URL}/gallery`, {
        method: "POST",
        headers,
        body: formData,
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Create gallery entry error:", response.status, errorText)
        try {
          const errorData = JSON.parse(errorText)
          throw new Error(errorData.message || `Failed to create gallery entry: ${response.status}`)
        } catch (e) {
          throw new Error(`Failed to create gallery entry: ${response.status} - ${errorText}`)
        }
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error("Create gallery entry error:", error)
      throw error
    }
  },

  // Update gallery entry
  update: async (id: string, galleryData: Partial<GalleryImage>, imageFile?: File): Promise<GalleryImage> => {
    try {
      const formData = new FormData()
      const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null

      // Append image file if provided
      if (imageFile) {
        formData.append("image", imageFile)
      }

      // Append other fields if provided
      if (galleryData.place_name) {
        formData.append("place_name", galleryData.place_name)
      }

      const headers: HeadersInit = {}
      if (token) {
        headers["Authorization"] = `Bearer ${token}`
      }

      const response = await fetch(`${API_BASE_URL}/gallery/${id}`, {
        method: "PUT",
        headers,
        body: formData,
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Update gallery entry error:", response.status, errorText)
        try {
          const errorData = JSON.parse(errorText)
          throw new Error(errorData.message || `Failed to update gallery entry: ${response.status}`)
        } catch (e) {
          throw new Error(`Failed to update gallery entry: ${response.status} - ${errorText}`)
        }
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error("Update gallery entry error:", error)
      throw error
    }
  },

  // Delete gallery entry
  delete: async (id: string): Promise<void> => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null
      const headers: HeadersInit = {}
      
      if (token) {
        headers["Authorization"] = `Bearer ${token}`
      }

      const response = await fetch(`${API_BASE_URL}/gallery/${id}`, {
        method: "DELETE",
        headers,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Failed to delete gallery entry" }))
        throw new Error(errorData.message || "Failed to delete gallery entry")
      }
    } catch (error) {
      console.error("Delete gallery entry error:", error)
      throw error
    }
  },
}
