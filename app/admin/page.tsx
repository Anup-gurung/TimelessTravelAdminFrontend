"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Map, ImageIcon, MessageSquare } from "lucide-react"
import { itinerariesApi, galleryApi, testimonialsApi } from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDistanceToNow } from "date-fns"

interface Activity {
  id: string
  type: "itinerary" | "gallery" | "testimonial"
  title: string
  description: string
  timestamp: Date
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalItineraries: 0,
    galleryImages: 0,
    pendingTestimonials: 0,
  })
  const [recentActivities, setRecentActivities] = useState<Activity[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      setIsLoading(true)
      
      // Fetch all data in parallel
      const [itineraries, gallery, testimonials] = await Promise.all([
        itinerariesApi.getAll().catch(err => { console.error("Itineraries error:", err); return []; }),
        galleryApi.getAll().catch(err => { console.error("Gallery error:", err); return []; }),
        testimonialsApi.getAll().catch(err => { console.error("Testimonials error:", err); return []; }),
      ])

      console.log("Dashboard data:", { itineraries, gallery, testimonials })
      console.log("Gallery length:", gallery?.length, "Is array:", Array.isArray(gallery))

      // Handle both array response and object with data property
      const galleryCount = Array.isArray(gallery) 
        ? gallery.length 
        : (gallery && typeof gallery === 'object' && 'data' in gallery && Array.isArray((gallery as any).data))
          ? (gallery as any).data.length
          : 0

      const itinerariesCount = Array.isArray(itineraries)
        ? itineraries.length
        : (itineraries && typeof itineraries === 'object' && 'data' in itineraries && Array.isArray((itineraries as any).data))
          ? (itineraries as any).data.length
          : 0

      const testimonialsArray = Array.isArray(testimonials)
        ? testimonials
        : (testimonials && typeof testimonials === 'object' && 'data' in testimonials && Array.isArray((testimonials as any).data))
          ? (testimonials as any).data
          : []

      setStats({
        totalItineraries: itinerariesCount,
        galleryImages: galleryCount,
        pendingTestimonials: testimonialsArray.filter((t: any) => t.approval_status === "pending").length,
      })

      // Generate recent activities
      const activities: Activity[] = []

      // Add itinerary activities
      if (Array.isArray(itineraries)) {
        itineraries.slice(0, 5).forEach((item: any) => {
          if (item.createdAt) {
            activities.push({
              id: `itinerary-${item._id}`,
              type: "itinerary",
              title: "New itinerary added",
              description: `${item.title || "Unnamed itinerary"}`,
              timestamp: new Date(item.createdAt),
            })
          }
        })
      } else if (itineraries && typeof itineraries === 'object' && 'data' in itineraries && Array.isArray((itineraries as any).data)) {
        (itineraries as any).data.slice(0, 5).forEach((item: any) => {
          if (item.createdAt) {
            activities.push({
              id: `itinerary-${item._id}`,
              type: "itinerary",
              title: "New itinerary added",
              description: `${item.title || "Unnamed itinerary"}`,
              timestamp: new Date(item.createdAt),
            })
          }
        })
      }

      // Add gallery activities
      if (Array.isArray(gallery)) {
        gallery.slice(0, 5).forEach((item: any) => {
          if (item.createdAt) {
            activities.push({
              id: `gallery-${item._id}`,
              type: "gallery",
              title: "Gallery updated",
              description: `${item.place_name || "New image"} uploaded`,
              timestamp: new Date(item.createdAt),
            })
          }
        })
      } else if (gallery && typeof gallery === 'object' && 'data' in gallery && Array.isArray((gallery as any).data)) {
        (gallery as any).data.slice(0, 5).forEach((item: any) => {
          if (item.createdAt) {
            activities.push({
              id: `gallery-${item._id}`,
              type: "gallery",
              title: "Gallery updated",
              description: `${item.place_name || "New image"} uploaded`,
              timestamp: new Date(item.createdAt),
            })
          }
        })
      }

      // Add testimonial activities (approved ones)
      testimonialsArray
        .filter((t: any) => t.approval_status === "approved")
        .slice(0, 5)
        .forEach((item: any) => {
          const timestamp = item.updatedAt || item.createdAt
          if (timestamp) {
            activities.push({
              id: `testimonial-${item._id || item.id}`,
              type: "testimonial",
              title: "Testimonial approved",
              description: `${item.username || "User"} review`,
              timestamp: new Date(timestamp),
            })
          }
        })

      // Sort activities by most recent and take top 5
      const sortedActivities = activities
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, 5)

      setRecentActivities(sortedActivities)
    } catch (error) {
      console.error("Error fetching dashboard stats:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const statsCards = [
    {
      title: "Total Itineraries",
      value: stats.totalItineraries,
      icon: Map,
      description: "Active tour packages",
    },
    {
      title: "Gallery Images",
      value: stats.galleryImages,
      icon: ImageIcon,
      description: "Total uploaded images",
    },
    {
      title: "Pending Testimonials",
      value: stats.pendingTestimonials,
      icon: MessageSquare,
      description: "Awaiting approval",
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-black">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here's an overview of your tourism platform.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <>
            {[1, 2, 3].map((i) => (
              <Card key={i} className="border-black shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-5 w-5 rounded" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-9 w-16 mb-2" />
                  <Skeleton className="h-3 w-24" />
                </CardContent>
              </Card>
            ))}
          </>
        ) : (
          statsCards.map((stat) => (
            <Card key={stat.title} className="border-black shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
                <stat.icon className="h-5 w-5 text-black" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-semibold text-black">{stat.value}</div>
                <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-black shadow-sm">
          <CardHeader>
            <CardTitle className="text-black">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-start gap-4">
                    <Skeleton className="w-2 h-2 rounded-full mt-2" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentActivities.length > 0 ? (
              <div className="space-y-4">
                {recentActivities.map((activity) => {
                  const colorClass = 
                    activity.type === "itinerary" ? "bg-black" :
                    activity.type === "gallery" ? "bg-gray-600" :
                    "bg-gray-400"
                  
                  return (
                    <div key={activity.id} className="flex items-start gap-4">
                      <div className={`w-2 h-2 ${colorClass} rounded-full mt-2`}></div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium text-black">{activity.title}</p>
                        <p className="text-xs text-gray-500">
                          {activity.description} - {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No recent activities</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-black shadow-sm">
          <CardHeader>
            <CardTitle className="text-black">Quick Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Trekking Tours</span>
                <span className="text-sm font-medium text-black">8</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Walking Tours</span>
                <span className="text-sm font-medium text-black">10</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Adventure Tours</span>
                <span className="text-sm font-medium text-black">6</span>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-gray-300">
                <span className="text-sm text-gray-600">Average Rating</span>
                <span className="text-sm font-medium text-black">4.8 / 5.0</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
