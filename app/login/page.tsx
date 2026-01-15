// "use client"

// import type React from "react"

// import { useState } from "react"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { useRouter } from "next/navigation"
// import { signIn } from "next-auth/react"

// export default function LoginPage() {
//   const router = useRouter()
//   const [email, setEmail] = useState("")
//   const [password, setPassword] = useState("")
//   const [isLoading, setIsLoading] = useState(false)
//   const [error, setError] = useState("")
//   const [success, setSuccess] = useState("")

//   const handleLogin = async (e: React.FormEvent) => {
//     e.preventDefault()
//     setIsLoading(true)
//     setError("")
//     setSuccess("")

//     console.log("🔐 Login attempt started")
//     console.log("📧 Email:", email)
//     console.log("🌐 API URL from env:", process.env.NEXT_PUBLIC_API_URL)

//     try {
//       console.log("🚀 Calling signIn with credentials...")
//       const result = await signIn("credentials", {
//         email,
//         password,
//         redirect: false,
//       })

//       console.log("📥 SignIn result:", result)

//       if (result?.error) {
//         console.error("❌ Login error:", result.error)
//         setError(result.error)
//       } else if (result?.ok) {
//         console.log("✅ Login successful!")
//         setSuccess("Login successful! Redirecting...")
//         setTimeout(() => {
//           router.push("/admin")
//           router.refresh()
//         }, 1000)
//       }
//     } catch (err) {
//       console.error("💥 Exception during login:", err)
//       setError(err instanceof Error ? err.message : "An error occurred during login")
//     } finally {
//       setIsLoading(false)
//       console.log("🏁 Login attempt finished")
//     }
//   }

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-white px-4">
//       <Card className="w-full max-w-md border-black">
//         <CardHeader className="space-y-6 text-center pb-8">
//           <div>
//             <CardTitle className="text-3xl font-semibold text-black">Tourism Admin</CardTitle>
//             <CardDescription className="text-gray-600 mt-3 text-base">
//               Sign in to manage your tourism platform
//             </CardDescription>
//           </div>
//         </CardHeader>
//         <CardContent>
//           <form onSubmit={handleLogin} className="space-y-5">
//             {error && (
//               <div className="p-3 bg-red-50 border border-red-200 rounded-md">
//                 <p className="text-sm text-red-600">{error}</p>
//               </div>
//             )}
//             {success && (
//               <div className="p-3 bg-green-50 border border-green-200 rounded-md">
//                 <p className="text-sm text-green-600">{success}</p>
//               </div>
//             )}
//             <div className="space-y-2">
//               <Label htmlFor="email" className="text-black font-medium">
//                 Email
//               </Label>
//               <Input
//                 id="email"
//                 type="email"
//                 placeholder="admin@tourism.com"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 required
//                 className="h-11 border-black focus-visible:ring-black"
//               />
//             </div>
//             <div className="space-y-2">
//               <Label htmlFor="password" className="text-black font-medium">
//                 Password
//               </Label>
//               <Input
//                 id="password"
//                 type="password"
//                 placeholder="••••••••"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 required
//                 className="h-11 border-black focus-visible:ring-black"
//               />
//             </div>
//             <Button
//               type="submit"
//               className="w-full h-11 font-medium bg-black text-white hover:bg-gray-800"
//               disabled={isLoading}
//             >
//               {isLoading ? "Signing in..." : "Sign In"}
//             </Button>
//           </form>
//         </CardContent>
//       </Card>
//     </div>
//   )
// }



"use client"

import type React from "react"
import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const callbackUrl = searchParams.get("callbackUrl") || "/admin"  // ✅ read from URL

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl, // ✅ IMPORTANT: updates next-auth callback-url cookie too
      })

      if (result?.error) {
        setError(result.error)
        return
      }

      if (result?.ok) {
        setSuccess("Login successful! Redirecting...")

        // ✅ Use the returned URL if available, else fallback
        const destination = result?.url || callbackUrl

        router.replace(destination) // replace is better than push here
        router.refresh()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred during login")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <Card className="w-full max-w-md border-black">
        <CardHeader className="space-y-6 text-center pb-8">
          <div>
            <CardTitle className="text-3xl font-semibold text-black">Tourism Admin</CardTitle>
            <CardDescription className="text-gray-600 mt-3 text-base">
              Sign in to manage your tourism platform
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
            {success && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-600">{success}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-black font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@tourism.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 border-black focus-visible:ring-black"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-black font-medium">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11 border-black focus-visible:ring-black"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-11 font-medium bg-black text-white hover:bg-gray-800"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
