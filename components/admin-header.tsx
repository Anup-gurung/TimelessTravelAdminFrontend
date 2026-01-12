"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { signOut, useSession } from "next-auth/react"
import { LogOut } from "lucide-react"

export function AdminHeader() {
  const { data: session } = useSession()

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" })
  }

  return (
    <header className="h-16 border-b border-border bg-card px-8 flex items-center justify-end">
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-medium text-foreground">
            {session?.user?.name || "Admin User"}
          </p>
          <p className="text-xs text-muted-foreground">
            {session?.user?.email || "admin@tourism.com"}
          </p>
        </div>
        <Avatar className="h-10 w-10 border-2 border-border">
          <AvatarImage src="/admin-interface.png" alt="Admin" />
          <AvatarFallback className="bg-primary text-primary-foreground">
            {session?.user?.name?.[0] || "A"}
          </AvatarFallback>
        </Avatar>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleLogout}
          className="ml-2"
          title="Logout"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  )
}
