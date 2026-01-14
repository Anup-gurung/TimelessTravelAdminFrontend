import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("🔑 authorize() called")
        console.log("📋 Credentials received:", { email: credentials?.email, hasPassword: !!credentials?.password })
        
        if (!credentials?.email || !credentials?.password) {
          console.error("❌ Missing credentials")
          throw new Error("Email and password are required")
        }

        try {
          // Call your backend API
          const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://timelesstravelbackend.onrender.com/api"
          const loginUrl = `${API_URL}/auth/login`
          console.log("🌐 API_URL:", API_URL)
          console.log("🎯 Attempting login to:", loginUrl)
          
          const response = await fetch(loginUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            mode: "cors",
            credentials: "omit",
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          })

          console.log("📡 Response status:", response.status)
          console.log("📡 Response ok:", response.ok)

          const data = await response.json()
          console.log("📦 Response data:", data)

          if (!response.ok) {
            console.error("❌ Login failed:", data.message)
            throw new Error(data.message || "Login failed")
          }

          // Return user object if authentication is successful
          if (data.token) {
            console.log("✅ Authentication successful, returning user object")
            const user = {
              id: data.user?.id || data.id || "1",
              email: data.user?.email || credentials.email,
              name: data.user?.name || data.name,
              token: data.token,
            }
            console.log("👤 User object:", user)
            return user
          }

          console.warn("⚠️ No token in response, returning null")
          return null
        } catch (error) {
          console.error("💥 Auth error:", error)
          if (error instanceof Error) {
            console.error("💥 Error message:", error.message)
            console.error("💥 Error stack:", error.stack)
          }
          throw new Error(error instanceof Error ? error.message : "Authentication failed")
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Add custom fields to JWT token
      if (user) {
        token.id = user.id
        token.token = (user as any).token
      }
      return token
    },
    async session({ session, token }) {
      // Add custom fields to session
      if (session.user) {
        (session.user as any).id = token.id
        ;(session as any).token = token.token
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET || "your-secret-key-change-this-in-production",
}
