"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Map, ImageIcon, MessageSquare, LogOut } from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Itineraries", href: "/admin/itineraries", icon: Map },
  { name: "Gallery", href: "/admin/gallery", icon: ImageIcon },
  { name: "Testimonials", href: "/admin/testimonials", icon: MessageSquare },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = () => {
    router.push("/login")
  }

  return (
    <div className="flex h-full w-64 flex-col bg-black border-r border-gray-800">
      {/* Logo & Brand */}
      <div className="flex h-16 items-center px-6 border-b border-gray-800">
        <div>
          <h1 className="text-lg font-semibold text-white">Tourism Admin</h1>
          <p className="text-xs text-gray-400">Management Portal</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive ? "bg-gray-800 text-white" : "text-gray-400 hover:bg-gray-900 hover:text-white",
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="border-t border-gray-800 p-4">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-gray-400 hover:text-white hover:bg-gray-900"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5" />
          Logout
        </Button>
      </div>
    </div>
  )
}
