const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://timelesstravelbackend.onrender.com/api"

export interface LoginCredentials {
  email: string
  password: string
}

export interface LoginResponse {
  success: boolean
  token?: string
  user?: {
    id: string
    email: string
    name?: string
  }
  message?: string
}

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    console.log("🔐 authApi.login called")
    console.log("🌐 API_BASE_URL:", API_BASE_URL)
    console.log("📧 Login credentials:", { email: credentials.email })
    
    try {
      const loginUrl = `${API_BASE_URL}/auth/login`
      console.log("🎯 Fetching:", loginUrl)
      
      const response = await fetch(loginUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        mode: "cors",
        credentials: "omit",
        body: JSON.stringify(credentials),
      })

      console.log("📡 Response status:", response.status)
      console.log("📡 Response headers:", Object.fromEntries(response.headers.entries()))

      const data = await response.json()
      console.log("📦 Response data:", data)

      if (!response.ok) {
        console.error("❌ Login failed:", data.message)
        throw new Error(data.message || "Login failed")
      }

      // Store token in localStorage if present
      if (data.token) {
        console.log("💾 Storing token in localStorage")
        localStorage.setItem("auth_token", data.token)
      } else {
        console.warn("⚠️ No token received from server")
      }

      // Ensure we return success as true if we have a token
      const result = {
        ...data,
        success: true,
      }
      console.log("✅ Login successful, returning:", result)
      return result
    } catch (error) {
      console.error("💥 Login error:", error)
      if (error instanceof Error) {
        console.error("💥 Error name:", error.name)
        console.error("💥 Error message:", error.message)
      }
      throw error
    }
  },

  logout: () => {
    localStorage.removeItem("auth_token")
  },

  getToken: () => {
    return localStorage.getItem("auth_token")
  },

  isAuthenticated: () => {
    return !!localStorage.getItem("auth_token")
  },
}
