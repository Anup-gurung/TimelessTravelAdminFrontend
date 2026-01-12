const API_BASE_URL = "http://localhost:5000/api"

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
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Login failed")
      }

      // Store token in localStorage if present
      if (data.token) {
        localStorage.setItem("auth_token", data.token)
      }

      // Ensure we return success as true if we have a token
      return {
        ...data,
        success: true,
      }
    } catch (error) {
      console.error("Login error:", error)
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
