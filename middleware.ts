import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    // Custom middleware logic can go here if needed
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        // Return true if the user has a valid token
        return !!token
      },
    },
    pages: {
      signIn: "/login",
    },
  }
)

// Protect all routes under /admin
export const config = {
  matcher: ["/admin/:path*"],
}
