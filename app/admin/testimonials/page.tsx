"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Star, Check, X, Trash2, Eye, Loader2 } from "lucide-react"
import { testimonialsApi, type Testimonial } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [selectedTestimonial, setSelectedTestimonial] = useState<Testimonial | null>(null)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all")
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  // Fetch testimonials on mount
  useEffect(() => {
    // Check if user is authenticated before fetching
    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null
    if (!token) {
      console.warn("No auth token found, redirecting to login")
      window.location.href = "/login"
      return
    }
    fetchTestimonials()
  }, [])

  const fetchTestimonials = async () => {
    try {
      setIsLoading(true)
      const data = await testimonialsApi.getAll()
      setTestimonials(Array.isArray(data) ? data : [])
    } catch (error: any) {
      console.error("Error fetching testimonials:", error)
      
      // If 401, redirect to login
      if (error?.message?.includes("401") || error?.message?.includes("No token")) {
        toast({
          title: "Session Expired",
          description: "Please log in again.",
          variant: "destructive",
        })
        setTimeout(() => {
          window.location.href = "/login"
        }, 1500)
        return
      }
      
      toast({
        title: "Error",
        description: "Failed to load testimonials. Please try again.",
        variant: "destructive",
      })
      setTestimonials([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleApprove = async (id: string) => {
    try {
      await testimonialsApi.updateStatus(id, "approved")
      setTestimonials(
        testimonials.map((testimonial) =>
          (testimonial._id || testimonial.id) === id ? { ...testimonial, approval_status: "approved" } : testimonial,
        ),
      )
      toast({
        title: "Success",
        description: "Testimonial approved successfully.",
      })
    } catch (error) {
      console.error("Error approving testimonial:", error)
      toast({
        title: "Error",
        description: "Failed to approve testimonial. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleReject = async (id: string) => {
    try {
      await testimonialsApi.updateStatus(id, "rejected")
      setTestimonials(
        testimonials.map((testimonial) =>
          (testimonial._id || testimonial.id) === id ? { ...testimonial, approval_status: "rejected" } : testimonial,
        ),
      )
      toast({
        title: "Success",
        description: "Testimonial rejected successfully.",
      })
    } catch (error) {
      console.error("Error rejecting testimonial:", error)
      toast({
        title: "Error",
        description: "Failed to reject testimonial. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this testimonial?")) {
      try {
        await testimonialsApi.delete(id)
        setTestimonials(testimonials.filter((testimonial) => (testimonial._id || testimonial.id) !== id))
        toast({
          title: "Success",
          description: "Testimonial deleted successfully.",
        })
      } catch (error) {
        console.error("Error deleting testimonial:", error)
        toast({
          title: "Error",
          description: "Failed to delete testimonial. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  const handleView = (testimonial: Testimonial) => {
    setSelectedTestimonial(testimonial)
    setIsViewOpen(true)
  }

  const filteredTestimonials =
    filter === "all" ? testimonials : (Array.isArray(testimonials) ? testimonials.filter((t) => t.approval_status === filter) : [])

  const getStatusBadge = (status: Testimonial["approval_status"]) => {
    switch (status) {
      case "approved":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Approved
          </Badge>
        )
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            Pending
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            Rejected
          </Badge>
        )
    }
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"}`}
          />
        ))}
      </div>
    )
  }

  const pendingCount = Array.isArray(testimonials) ? testimonials.filter((t) => t.approval_status === "pending").length : 0

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Testimonials</h1>
          <p className="text-muted-foreground mt-1">Manage customer reviews and feedback</p>
        </div>
        {pendingCount > 0 && (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 px-4 py-2 text-sm">
            {pendingCount} Pending Review{pendingCount !== 1 ? "s" : ""}
          </Badge>
        )}
      </div>

      <div className="flex gap-2">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          onClick={() => setFilter("all")}
          className="font-medium"
        >
          All ({Array.isArray(testimonials) ? testimonials.length : 0})
        </Button>
        <Button
          variant={filter === "pending" ? "default" : "outline"}
          onClick={() => setFilter("pending")}
          className="font-medium"
        >
          Pending ({Array.isArray(testimonials) ? testimonials.filter((t) => t.approval_status === "pending").length : 0})
        </Button>
        <Button
          variant={filter === "approved" ? "default" : "outline"}
          onClick={() => setFilter("approved")}
          className="font-medium"
        >
          Approved ({Array.isArray(testimonials) ? testimonials.filter((t) => t.approval_status === "approved").length : 0})
        </Button>
        <Button
          variant={filter === "rejected" ? "default" : "outline"}
          onClick={() => setFilter("rejected")}
          className="font-medium"
        >
          Rejected ({Array.isArray(testimonials) ? testimonials.filter((t) => t.approval_status === "rejected").length : 0})
        </Button>
      </div>

      <Card className="shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTestimonials.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12">
                  <p className="text-muted-foreground">No testimonials found for this filter</p>
                </TableCell>
              </TableRow>
            ) : (
              filteredTestimonials.map((testimonial) => {
                const testimonialId = testimonial._id || testimonial.id || ""
                const createdDate = testimonial.created_at || testimonial.createdAt || ""
                
                return (
                <TableRow key={testimonialId}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border-2 border-border">
                        <AvatarImage src={testimonial.user_image || "/placeholder.svg"} alt={testimonial.username} />
                        <AvatarFallback className="bg-primary/10 text-primary font-medium">
                          {testimonial.username
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-foreground">{testimonial.username}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{renderStars(testimonial.star_rating)}</TableCell>
                  <TableCell>
                    <p className="max-w-md text-sm text-muted-foreground line-clamp-2">{testimonial.description}</p>
                  </TableCell>
                  <TableCell>{getStatusBadge(testimonial.approval_status)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(createdDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleView(testimonial)} title="View details">
                        <Eye className="h-4 w-4" />
                      </Button>
                      {testimonial.approval_status !== "approved" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleApprove(testimonialId)}
                          className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          title="Approve"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      {testimonial.approval_status !== "rejected" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleReject(testimonialId)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          title="Reject"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(testimonialId)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )})
            )}
          </TableBody>
        </Table>
      </Card>

      {/* View Testimonial Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Testimonial Details</DialogTitle>
            <DialogDescription>Full review and user information</DialogDescription>
          </DialogHeader>
          {selectedTestimonial && (
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16 border-2 border-border">
                  <AvatarImage
                    src={selectedTestimonial.user_image || "/placeholder.svg"}
                    alt={selectedTestimonial.username}
                  />
                  <AvatarFallback className="bg-primary/10 text-primary font-medium text-lg">
                    {selectedTestimonial.username
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-foreground">{selectedTestimonial.username}</h3>
                  <div className="flex items-center gap-3 mt-2">
                    {renderStars(selectedTestimonial.star_rating)}
                    <span className="text-sm text-muted-foreground">{selectedTestimonial.star_rating}.0 out of 5</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Submitted on {new Date(selectedTestimonial.created_at || selectedTestimonial.createdAt || "").toLocaleDateString()}
                  </p>
                </div>
                {getStatusBadge(selectedTestimonial.approval_status)}
              </div>

              <div className="space-y-3 pt-4 border-t border-border">
                <Label className="text-sm font-medium text-muted-foreground">Review</Label>
                <p className="text-foreground leading-relaxed">{selectedTestimonial.description}</p>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                {selectedTestimonial.approval_status !== "approved" && (
                  <Button
                    onClick={() => {
                      handleApprove(selectedTestimonial._id || selectedTestimonial.id || "")
                      setIsViewOpen(false)
                    }}
                    className="gap-2 bg-green-600 hover:bg-green-700"
                  >
                    <Check className="h-4 w-4" />
                    Approve
                  </Button>
                )}
                {selectedTestimonial.approval_status !== "rejected" && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      handleReject(selectedTestimonial._id || selectedTestimonial.id || "")
                      setIsViewOpen(false)
                    }}
                    className="gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                    Reject
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => {
                    handleDelete(selectedTestimonial._id || selectedTestimonial.id || "")
                    setIsViewOpen(false)
                  }}
                  className="gap-2 text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <label className={className}>{children}</label>
}
