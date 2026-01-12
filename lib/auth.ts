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
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required")
        }

        try {
          // Call your backend API
          const API_URL = process.env.NEXT_PUBLIC_URL || "http://localhost:5000/api"
          const response = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          })

          const data = await response.json()

          if (!response.ok) {
            throw new Error(data.message || "Login failed")
          }

          // Return user object if authentication is successful
          if (data.token) {
            return {
              id: data.user?.id || data.id || "1",
              email: data.user?.email || credentials.email,
              name: data.user?.name || data.name,
              token: data.token,
            }
          }

          return null
        } catch (error) {
          console.error("Auth error:", error)
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
