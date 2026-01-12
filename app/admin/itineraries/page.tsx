"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Plus, Pencil, Trash2, Eye, Calendar, MapPin, X, Upload } from "lucide-react"
import { Card } from "@/components/ui/card"
import { ImagePlus } from "lucide-react"
import { itinerariesApi, type Itinerary, type DayItinerary, type PricingTier } from "@/lib/api"

export default function ItinerariesPage() {
  const { data: session, status } = useSession()
  const [itineraries, setItineraries] = useState<Itinerary[]>([])
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [isDayEditOpen, setIsDayEditOpen] = useState(false)
  const [selectedItinerary, setSelectedItinerary] = useState<Itinerary | null>(null)
  const [selectedDay, setSelectedDay] = useState<DayItinerary | null>(null)
  const [formData, setFormData] = useState<Partial<Itinerary>>({})
  const [dayFormData, setDayFormData] = useState<Partial<DayItinerary>>({})
  const [imageDialogOpen, setImageDialogOpen] = useState(false)
  const [currentDayIndex, setCurrentDayIndex] = useState<number | null>(null)
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null)
  const [coverImagePreview, setCoverImagePreview] = useState<string>("")
  const [dayImageFile, setDayImageFile] = useState<File | null>(null)
  const [dayImagePreview, setDayImagePreview] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>("")

  // // Store token in localStorage when session is available
  // useEffect(() => {
  //   if (session?.token) {
  //     localStorage.setItem("auth_token", session.token as string)
  //   }
  // }, [session])

  // Fetch all itineraries on component mount
  useEffect(() => {
    if (status === "authenticated") {
      fetchItineraries()
    }
  }, [status])

  const fetchItineraries = async () => {
    try {
      setIsLoading(true)
      const data = await itinerariesApi.getAll()
      setItineraries(data)
    } catch (err: any) {
      // If 401, redirect to login
      if (err?.message?.includes("401") || err?.message?.includes("No token")) {
        setError("Session expired. Redirecting to login...")
        setTimeout(() => {
          window.location.href = "/login"
        }, 1500)
        return
      }
      setError(err instanceof Error ? err.message : "Failed to fetch itineraries")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAdd = () => {
    setFormData({
      difficulty: "Easy",
      is_cover_img: false,
      price: 1500,
      pricing_tiers: [
        { min_pax: 1, max_pax: 1, price_per_person: 1500, label: "Solo Traveler" },
        { min_pax: 2, max_pax: 2, price_per_person: 1200, label: "2 Persons" },
        { min_pax: 3, max_pax: 5, price_per_person: 1120, label: "3-5 Persons" },
        { min_pax: 6, max_pax: 9, price_per_person: 1040, label: "6-9 Persons" },
        { min_pax: 10, max_pax: null, price_per_person: 1000, label: "10+ Persons" },
      ],
      itinerary_days: [],
    })
    setCoverImageFile(null)
    setCoverImagePreview("")
    setIsAddOpen(true)
  }

  const handleEdit = (itinerary: Itinerary) => {
    setSelectedItinerary(itinerary)
    setFormData(itinerary)
    setCoverImagePreview(itinerary.cover_image_url || "")
    setCoverImageFile(null)
    setIsEditOpen(true)
  }

  const handleView = (itinerary: Itinerary) => {
    setSelectedItinerary(itinerary)
    setIsViewOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this itinerary?")) {
      try {
        await itinerariesApi.delete(id)
        await fetchItineraries()
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to delete itinerary")
      }
    }
  }

  const handleEditDay = (day: DayItinerary) => {
    if (!selectedItinerary?._id) return
    setSelectedDay(day)
    setDayFormData(day)
    setIsDayEditOpen(true)
  }

  const handleDeleteDay = async (dayId: string) => {
    if (!selectedItinerary?._id) return
    if (confirm("Are you sure you want to delete this day?")) {
      try {
        await itinerariesApi.removeDay(selectedItinerary._id, dayId)
        // Refresh the itinerary data
        const updatedItinerary = await itinerariesApi.getById(selectedItinerary._id)
        setSelectedItinerary(updatedItinerary)
        await fetchItineraries()
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to delete day")
      }
    }
  }

  const handleSaveDayEdit = async () => {
    if (!selectedItinerary?._id || !selectedDay?._id) {
      console.error("Missing required IDs:", { itineraryId: selectedItinerary?._id, dayId: selectedDay?._id })
      return
    }
    
    console.log("Saving day edit with data:", dayFormData)
    
    try {
      setIsLoading(true)
      setError("")
      const result = await itinerariesApi.updateDay(selectedItinerary._id, selectedDay._id, dayFormData)
      console.log("Day update successful:", result)
      
      // Refresh the itinerary data
      const updatedItinerary = await itinerariesApi.getById(selectedItinerary._id)
      setSelectedItinerary(updatedItinerary)
      await fetchItineraries()
      
      setIsDayEditOpen(false)
      setDayFormData({})
      setSelectedDay(null)
    } catch (err) {
      console.error("Day edit error:", err)
      setError(err instanceof Error ? err.message : "Failed to update day")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setCoverImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setCoverImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDayImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setDayImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setDayImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      let itineraryId: string | undefined

      if (isEditOpen && selectedItinerary?._id) {
        // Update existing itinerary
        const updatedItinerary = await itinerariesApi.update(
          selectedItinerary._id,
          formData,
          coverImageFile || undefined
        )
        itineraryId = updatedItinerary._id
        setIsEditOpen(false)
      } else {
        // Create new itinerary
        const newItinerary = await itinerariesApi.create(formData, coverImageFile || undefined)
        itineraryId = newItinerary._id
        
        // Add days if any were created
        if (itineraryId && formData.itinerary_days && formData.itinerary_days.length > 0) {
          for (const day of formData.itinerary_days) {
            try {
              await itinerariesApi.addDay(itineraryId, day)
            } catch (dayError) {
              console.error("Failed to add day:", dayError)
              // Continue adding other days even if one fails
            }
          }
        }
        
        setIsAddOpen(false)
      }

      setFormData({})
      setCoverImageFile(null)
      setCoverImagePreview("")
      await fetchItineraries()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save itinerary")
    } finally {
      setIsLoading(false)
    }
  }

  const addDay = () => {
    const currentDays = formData.itinerary_days || []
    const newDay: DayItinerary = {
      day_number: currentDays.length + 1,
      title: "",
      description: "",
      location: "",
      images: [],
    }
    setFormData({ ...formData, itinerary_days: [...currentDays, newDay] })
  }

  const removeDay = (dayIndex: number) => {
    const currentDays = [...(formData.itinerary_days || [])]
    const updatedDays = currentDays
      .filter((_, index) => index !== dayIndex)
      .map((day, index) => ({
        ...day,
        day_number: index + 1,
      }))
    setFormData({ ...formData, itinerary_days: updatedDays })
  }

  const updateDay = (dayIndex: number, field: keyof DayItinerary, value: any) => {
    const currentDays = [...(formData.itinerary_days || [])]
    currentDays[dayIndex] = { ...currentDays[dayIndex], [field]: value }
    setFormData({ ...formData, itinerary_days: currentDays })
  }

  const addImageToDay = () => {
    if (currentDayIndex !== null && dayImagePreview) {
      const currentDays = [...(formData.itinerary_days || [])]
      currentDays[currentDayIndex].images = [...currentDays[currentDayIndex].images, dayImagePreview]
      setFormData({ ...formData, itinerary_days: currentDays })
      setImageDialogOpen(false)
      setDayImageFile(null)
      setDayImagePreview("")
    }
  }

  const removeImageFromDay = (dayIndex: number, imageIndex: number) => {
    const currentDays = [...(formData.itinerary_days || [])]
    currentDays[dayIndex].images = currentDays[dayIndex].images.filter((_: any, index: number) => index !== imageIndex)
    setFormData({ ...formData, itinerary_days: currentDays })
  }

  const removeImageFromDayEdit = (imageIndex: number) => {
    const currentImages = [...(dayFormData.images || [])]
    setDayFormData({ ...dayFormData, images: currentImages.filter((_, index) => index !== imageIndex) })
  }

  const addImageToDayEdit = (imageUrl: string) => {
    const currentImages = [...(dayFormData.images || [])]
    setDayFormData({ ...dayFormData, images: [...currentImages, imageUrl] })
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-black">Itineraries</h1>
          <p className="text-gray-600 mt-1">Manage your tour packages and itineraries</p>
        </div>
        <Button onClick={handleAdd} className="gap-2 bg-black text-white hover:bg-gray-800">
          <Plus className="h-4 w-4" />
          Add Itinerary
        </Button>
      </div>

      <Card className="border-black shadow-sm">
        {isLoading && itineraries.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : (
          <Table>
          <TableHeader>
            <TableRow className="border-black hover:bg-gray-50">
              <TableHead className="text-black font-semibold">Image</TableHead>
              <TableHead className="text-black font-semibold">Title</TableHead>
              <TableHead className="text-black font-semibold">Location</TableHead>
              <TableHead className="text-black font-semibold">Category</TableHead>
              <TableHead className="text-black font-semibold">Tour Type</TableHead>
              <TableHead className="text-black font-semibold">Difficulty</TableHead>
              <TableHead className="text-black font-semibold">Price</TableHead>
              <TableHead className="text-black font-semibold">Duration</TableHead>
              <TableHead className="text-black font-semibold">Status</TableHead>
              <TableHead className="text-right text-black font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {itineraries.map((itinerary) => (
              <TableRow key={itinerary._id} className="border-gray-300 hover:bg-gray-50">
                <TableCell>
                  <img
                    src={itinerary.cover_image_url || "/placeholder.svg"}
                    alt={itinerary.title}
                    className="w-16 h-16 rounded border border-gray-300 object-cover grayscale"
                  />
                </TableCell>
                <TableCell className="font-medium text-black">{itinerary.title}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <MapPin className="h-3.5 w-3.5" />
                    {itinerary.location}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="border-black text-black">
                    {itinerary.category}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="border-gray-400 text-gray-700">
                    {itinerary.tour_type || "N/A"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="border-black text-black">
                    {itinerary.difficulty}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium text-black">${itinerary.price}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5 text-sm text-gray-600">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(itinerary.start_date).toLocaleDateString()}
                  </div>
                </TableCell>
                <TableCell>
                  {itinerary.is_cover_img && (
                    <Badge variant="outline" className="border-black text-black bg-gray-100">
                      Cover
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleView(itinerary)}
                      className="hover:bg-gray-100"
                    >
                      <Eye className="h-4 w-4 text-black" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(itinerary)}
                      className="hover:bg-gray-100"
                    >
                      <Pencil className="h-4 w-4 text-black" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => itinerary._id && handleDelete(itinerary._id)}
                      className="hover:bg-gray-100"
                    >
                      <Trash2 className="h-4 w-4 text-black" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        )}
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog
        open={isAddOpen || isEditOpen}
        onOpenChange={(open) => {
          setIsAddOpen(false)
          setIsEditOpen(false)
          if (!open) setFormData({})
        }}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto border-black">
          <DialogHeader>
            <DialogTitle className="text-2xl text-black">
              {isEditOpen ? "Edit Itinerary" : "Add New Itinerary"}
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              {isEditOpen ? "Update the itinerary details below" : "Fill in the details to create a new itinerary"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-black border-b border-black pb-2">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="title" className="text-black font-medium">
                    Title
                  </Label>
                  <Input
                    id="title"
                    value={formData.title || ""}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    className="border-black focus-visible:ring-black"
                  />
                </div>

                <div className="col-span-2 space-y-2">
                  <Label htmlFor="short_desc" className="text-black font-medium">
                    Short Description
                  </Label>
                  <Input
                    id="short_desc"
                    value={formData.short_desc || ""}
                    onChange={(e) => setFormData({ ...formData, short_desc: e.target.value })}
                    required
                    className="border-black focus-visible:ring-black"
                  />
                </div>

                <div className="col-span-2 space-y-2">
                  <Label htmlFor="long_desc" className="text-black font-medium">
                    Long Description
                  </Label>
                  <Textarea
                    id="long_desc"
                    rows={4}
                    value={formData.long_desc || ""}
                    onChange={(e) => setFormData({ ...formData, long_desc: e.target.value })}
                    required
                    className="border-black focus-visible:ring-black"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location" className="text-black font-medium">
                    Location
                  </Label>
                  <Input
                    id="location"
                    value={formData.location || ""}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    required
                    className="border-black focus-visible:ring-black"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price" className="text-black font-medium">
                    Base Tour Cost ($)
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price || ""}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    required
                    className="border-black focus-visible:ring-black"
                  />
                  <p className="text-xs text-gray-500">Base price for the tour package</p>
                </div>
              </div>
            </div>

            {/* Pricing Tiers Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-black border-b border-black pb-2">Pricing Tiers</h3>
              <p className="text-sm text-gray-600">Set different prices based on group size</p>
              <div className="space-y-3">
                {formData.pricing_tiers?.map((tier, index) => (
                  <div key={index} className="grid grid-cols-12 gap-3 items-end p-4 border border-gray-300 rounded">
                    <div className="col-span-3 space-y-2">
                      <Label className="text-black font-medium text-xs">Label</Label>
                      <Input
                        value={tier.label}
                        onChange={(e) => {
                          const newTiers = [...(formData.pricing_tiers || [])]
                          newTiers[index] = { ...newTiers[index], label: e.target.value }
                          setFormData({ ...formData, pricing_tiers: newTiers })
                        }}
                        placeholder="e.g., Solo Traveler"
                        className="border-black focus-visible:ring-black"
                      />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label className="text-black font-medium text-xs">Min Pax</Label>
                      <Input
                        type="number"
                        value={tier.min_pax}
                        onChange={(e) => {
                          const newTiers = [...(formData.pricing_tiers || [])]
                          newTiers[index] = { ...newTiers[index], min_pax: Number(e.target.value) }
                          setFormData({ ...formData, pricing_tiers: newTiers })
                        }}
                        className="border-black focus-visible:ring-black"
                      />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label className="text-black font-medium text-xs">Max Pax</Label>
                      <Input
                        type="number"
                        value={tier.max_pax ?? ""}
                        onChange={(e) => {
                          const newTiers = [...(formData.pricing_tiers || [])]
                          newTiers[index] = { ...newTiers[index], max_pax: e.target.value ? Number(e.target.value) : null }
                          setFormData({ ...formData, pricing_tiers: newTiers })
                        }}
                        placeholder="Leave empty for 10+"
                        className="border-black focus-visible:ring-black"
                      />
                    </div>
                    <div className="col-span-3 space-y-2">
                      <Label className="text-black font-medium text-xs">Price per Person ($)</Label>
                      <Input
                        type="number"
                        value={tier.price_per_person}
                        onChange={(e) => {
                          const newTiers = [...(formData.pricing_tiers || [])]
                          newTiers[index] = { ...newTiers[index], price_per_person: Number(e.target.value) }
                          setFormData({ ...formData, pricing_tiers: newTiers })
                        }}
                        className="border-black focus-visible:ring-black"
                      />
                    </div>
                    <div className="col-span-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          const newTiers = (formData.pricing_tiers || []).filter((_, i) => i !== index)
                          setFormData({ ...formData, pricing_tiers: newTiers })
                        }}
                        className="hover:bg-gray-100"
                      >
                        <Trash2 className="h-4 w-4 text-black" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <Button
                type="button"
                onClick={() => {
                  const newTier: PricingTier = {
                    min_pax: 1,
                    max_pax: 1,
                    price_per_person: 0,
                    label: "New Tier",
                  }
                  setFormData({ ...formData, pricing_tiers: [...(formData.pricing_tiers || []), newTier] })
                }}
                variant="outline"
                size="sm"
                className="gap-2 border-black text-black hover:bg-gray-100"
              >
                <Plus className="h-4 w-4" />
                Add Pricing Tier
              </Button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">

                <div className="space-y-2">
                  <Label htmlFor="difficulty" className="text-black font-medium">
                    Difficulty
                  </Label>
                  <Select
                    value={formData.difficulty}
                    onValueChange={(value) =>
                      setFormData({ ...formData, difficulty: value as Itinerary["difficulty"] })
                    }
                  >
                    <SelectTrigger className="border-black focus:ring-black">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="border-black">
                      <SelectItem value="Easy">Easy</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category" className="text-black font-medium">
                    Category
                  </Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value as Itinerary["category"], tour_type: null })}
                    disabled={!!formData.tour_type}
                  >
                    <SelectTrigger className="border-black focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="border-black">
                      <SelectItem value="Culture">Culture</SelectItem>
                      <SelectItem value="Festival">Festival</SelectItem>
                    </SelectContent>
                  </Select>
                  {formData.tour_type && (
                    <p className="text-xs text-gray-500">Disabled because Tour Type is selected</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tour_type" className="text-black font-medium">
                    Tour Type
                  </Label>
                  <Select
                    value={formData.tour_type ?? ""}
                    onValueChange={(value) => setFormData({ ...formData, tour_type: value as Itinerary["tour_type"], category: undefined })}
                    disabled={!!formData.category}
                  >
                    <SelectTrigger className="border-black focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed">
                      <SelectValue placeholder="Select tour type" />
                    </SelectTrigger>
                    <SelectContent className="border-black">
                      <SelectItem value="Trekking">Trekking</SelectItem>
                      <SelectItem value="Walking">Walking</SelectItem>
                      <SelectItem value="Adventure">Adventure</SelectItem>
                    </SelectContent>
                  </Select>
                  {formData.category && (
                    <p className="text-xs text-gray-500">Disabled because Category is selected</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="start_date" className="text-black font-medium">
                    Start Date
                  </Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date || ""}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    required
                    className="border-black focus-visible:ring-black"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end_date" className="text-black font-medium">
                    End Date
                  </Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date || ""}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    required
                    className="border-black focus-visible:ring-black"
                  />
                </div>

                <div className="col-span-2 space-y-2">
                  <Label htmlFor="cover_image" className="text-black font-medium">
                    Cover Image
                  </Label>
                  <div className="flex items-center gap-4">
                    <Input
                      id="cover_image"
                      type="file"
                      accept="image/*"
                      onChange={handleCoverImageChange}
                      className="border-black focus-visible:ring-black"
                    />
                    {coverImagePreview && (
                      <img
                        src={coverImagePreview}
                        alt="Cover preview"
                        className="w-16 h-16 rounded border border-gray-300 object-cover"
                      />
                    )}
                  </div>
                  <p className="text-xs text-gray-500">Upload an image file for the cover</p>
                </div>

                <div className="col-span-2 flex items-center justify-between rounded border border-black p-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="is_cover_img" className="text-base text-black font-medium">
                      Set as Cover Image
                    </Label>
                    <p className="text-sm text-gray-600">Display this itinerary as a featured tour</p>
                  </div>
                  <Switch
                    id="is_cover_img"
                    checked={formData.is_cover_img}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_cover_img: checked })}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-black pb-2">
                <h3 className="text-lg font-semibold text-black">Day-wise Itinerary</h3>
                <Button
                  type="button"
                  onClick={addDay}
                  variant="outline"
                  size="sm"
                  className="gap-2 border-black text-black hover:bg-gray-100 bg-transparent"
                >
                  <Plus className="h-4 w-4" />
                  Add Day
                </Button>
              </div>

              {formData.itinerary_days && formData.itinerary_days.length > 0 ? (
                <div className="space-y-4">
                  {formData.itinerary_days.map((day, dayIndex) => (
                    <Card key={dayIndex} className="border-black p-6 space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-black bg-white">
                            <span className="text-sm font-bold text-black">{day.day_number}</span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-black">Day {day.day_number}</h4>
                            <p className="text-sm text-gray-600">{day.location || "Location not set"}</p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeDay(dayIndex)}
                          className="hover:bg-gray-100"
                        >
                          <X className="h-4 w-4 text-black" />
                        </Button>
                      </div>

                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-black font-medium">Day Title</Label>
                            <Input
                              value={day.title || ""}
                              onChange={(e) => updateDay(dayIndex, "title", e.target.value)}
                              placeholder="e.g., Arrival in Kathmandu"
                              className="border-black focus-visible:ring-black"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label className="text-black font-medium">Location</Label>
                            <Input
                              value={day.location || ""}
                              onChange={(e) => updateDay(dayIndex, "location", e.target.value)}
                              placeholder="e.g., Kathmandu, Nepal"
                              className="border-black focus-visible:ring-black"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-black font-medium">Description</Label>
                          <Textarea
                            rows={3}
                            value={day.description || ""}
                            onChange={(e) => updateDay(dayIndex, "description", e.target.value)}
                            placeholder="Describe the activities and highlights for this day"
                            className="border-black focus-visible:ring-black"
                          />
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Label className="text-black font-medium">Images</Label>
                            <span className="text-sm text-gray-500">{day.images.length} image(s)</span>
                          </div>

                          {/* Image Grid */}
                          {day.images.length > 0 && (
                            <div className="grid grid-cols-4 gap-2">
                              {day.images.map((imageUrl, imageIndex) => (
                                <div
                                  key={imageIndex}
                                  className="group relative aspect-square overflow-hidden rounded border border-gray-300"
                                >
                                  <img
                                    src={imageUrl || "/placeholder.svg"}
                                    alt={`Day ${day.day_number} - Image ${imageIndex + 1}`}
                                    className="h-full w-full object-cover grayscale group-hover:grayscale-0 transition-all"
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeImageFromDay(dayIndex, imageIndex)}
                                    className="absolute top-0.5 right-0.5 h-6 w-6 bg-white/90 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <X className="h-3 w-3 text-black" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Add Image Button */}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setImageDialogOpen(true)
                              setCurrentDayIndex(dayIndex)
                            }}
                            className="w-full mt-2 border-gray-300 hover:bg-gray-50 h-9"
                          >
                            <ImagePlus className="h-4 w-4 mr-2" />
                            Add Image ({day.images.length})
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="border-dashed border-2 border-gray-300 p-8 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="rounded-full bg-gray-100 p-4">
                      <Calendar className="h-8 w-8 text-gray-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-black">No days added yet</h4>
                      <p className="text-sm text-gray-600 mt-1">Click "Add Day" to start building your itinerary</p>
                    </div>
                  </div>
                </Card>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-300">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsAddOpen(false)
                  setIsEditOpen(false)
                  setFormData({})
                  setCoverImageFile(null)
                  setCoverImagePreview("")
                }}
                className="border-black text-black hover:bg-gray-100"
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-black text-white hover:bg-gray-800" disabled={isLoading}>
                {isLoading ? "Saving..." : isEditOpen ? "Update" : "Create"} Itinerary
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto border-black">
          <DialogHeader>
            <DialogTitle className="text-2xl text-black">Itinerary Details</DialogTitle>
          </DialogHeader>
          {selectedItinerary && (
            <div className="space-y-6">
              <img
                src={selectedItinerary.cover_image_url || "/placeholder.svg"}
                alt={selectedItinerary.title}
                className="w-full h-64 object-cover rounded border border-black grayscale"
              />
              <div className="space-y-4">
                <div>
                  <h3 className="text-2xl font-semibold text-black">{selectedItinerary.title}</h3>
                  <p className="text-gray-600 mt-1">{selectedItinerary.short_desc}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 py-4 border-y border-black">
                  <div>
                    <p className="text-sm text-gray-600">Location</p>
                    <p className="font-medium text-black">{selectedItinerary.location}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Price</p>
                    <p className="font-medium text-black">${selectedItinerary.price}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Difficulty</p>
                    <Badge variant="outline" className="border-black text-black">
                      {selectedItinerary.difficulty}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Category</p>
                    <Badge variant="outline" className="border-black text-black">
                      {selectedItinerary.category}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Tour Type</p>
                    <Badge variant="outline" className="border-gray-400 text-gray-700">
                      {selectedItinerary.tour_type || "N/A"}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Duration</p>
                    <p className="font-medium text-black">
                      {new Date(selectedItinerary.start_date).toLocaleDateString()} to{" "}
                      {new Date(selectedItinerary.end_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-2">Full Description</p>
                  <p className="text-black leading-relaxed">{selectedItinerary.long_desc}</p>
                </div>

                {selectedItinerary.pricing_tiers && selectedItinerary.pricing_tiers.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-lg font-semibold text-black border-b border-black pb-2">
                      Pricing Tiers
                    </h4>
                    <div className="grid grid-cols-1 gap-2">
                      {selectedItinerary.pricing_tiers.map((tier, index) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded border border-gray-300">
                          <div className="flex items-center gap-3">
                            <div className="text-sm font-medium text-black">{tier.label}</div>
                            <div className="text-xs text-gray-600">
                              ({tier.min_pax} {tier.max_pax ? `- ${tier.max_pax}` : '+'} pax)
                            </div>
                          </div>
                          <div className="text-lg font-semibold text-black">${tier.price_per_person}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedItinerary.itinerary_days && selectedItinerary.itinerary_days.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-black border-b border-black pb-2">
                      Day-by-Day Itinerary
                    </h4>
                    <div className="space-y-4">
                      {selectedItinerary.itinerary_days.map((day: DayItinerary, index: number) => (
                        <Card key={day._id || `day-${index}`} className="border-black p-5 space-y-3">
                          <div className="flex items-baseline justify-between">
                            <div className="flex items-baseline gap-2">
                              <h5 className="text-base font-semibold text-black">Day {day.day_number}</h5>
                              {day.title && <span className="text-black">- {day.title}</span>}
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditDay(day)}
                                className="hover:bg-gray-100 h-8 w-8"
                              >
                                <Pencil className="h-3.5 w-3.5 text-black" />
                              </Button>
                              {day._id && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteDay(day._id!)}
                                  className="hover:bg-gray-100 h-8 w-8"
                                >
                                  <Trash2 className="h-3.5 w-3.5 text-black" />
                                </Button>
                              )}
                            </div>
                          </div>
                          {day.location && (
                            <div className="flex items-center gap-1.5 text-sm text-gray-600">
                              <MapPin className="h-3.5 w-3.5" />
                              {day.location}
                            </div>
                          )}
                          <p className="text-gray-700 text-sm leading-relaxed">{day.description}</p>
                          {day.images.length > 0 && (
                            <div className="grid grid-cols-4 gap-2 pt-2">
                              {day.images.map((image: any, idx: number) => (
                                <img
                                  key={idx}
                                  src={image || "/placeholder.svg"}
                                  alt={`Day ${day.day_number} - Image ${idx + 1}`}
                                  className="w-full h-16 object-cover rounded border border-gray-300 grayscale"
                                />
                              ))}
                            </div>
                          )}
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Image Dialog */}
      <Dialog open={imageDialogOpen} onOpenChange={(open) => {
        setImageDialogOpen(open)
        if (!open) {
          setDayImageFile(null)
          setDayImagePreview("")
          setCurrentDayIndex(null)
        }
      }}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto border-black">
          <DialogHeader>
            <DialogTitle className="text-2xl text-black">Add Image</DialogTitle>
            <DialogDescription className="text-gray-600">
              Choose an image file from your computer
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (isDayEditOpen && dayImagePreview) {
                addImageToDayEdit(dayImagePreview)
                setImageDialogOpen(false)
                setDayImageFile(null)
                setDayImagePreview("")
              } else {
                addImageToDay()
              }
            }}
            className="space-y-6"
          >
            <div className="space-y-4">
              <Label htmlFor="dayImage" className="text-black font-medium">
                Image File
              </Label>
              <Input
                id="dayImage"
                type="file"
                accept="image/*"
                onChange={handleDayImageChange}
                required
                className="border-black focus-visible:ring-black"
              />
              {dayImagePreview && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">Preview:</p>
                  <img
                    src={dayImagePreview}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded border border-gray-300"
                  />
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-300">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setImageDialogOpen(false)
                  setDayImageFile(null)
                  setDayImagePreview("")
                  setCurrentDayIndex(null)
                }}
                className="border-black text-black hover:bg-gray-100"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-black text-white hover:bg-gray-800"
                disabled={!dayImageFile}
              >
                Add Image
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Day Edit Dialog */}
      <Dialog open={isDayEditOpen} onOpenChange={(open) => {
        setIsDayEditOpen(open)
        if (!open) {
          setDayFormData({})
          setSelectedDay(null)
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto border-black">
          <DialogHeader>
            <DialogTitle className="text-2xl text-black">Edit Day {selectedDay?.day_number}</DialogTitle>
            <DialogDescription className="text-gray-600">
              Update the day details below
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-black font-medium">Day Title</Label>
                <Input
                  value={dayFormData.title || ""}
                  onChange={(e) => setDayFormData({ ...dayFormData, title: e.target.value })}
                  placeholder="e.g., Arrival in Kathmandu"
                  className="border-black focus-visible:ring-black"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-black font-medium">Location</Label>
                <Input
                  value={dayFormData.location || ""}
                  onChange={(e) => setDayFormData({ ...dayFormData, location: e.target.value })}
                  placeholder="e.g., Kathmandu, Nepal"
                  className="border-black focus-visible:ring-black"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-black font-medium">Description</Label>
              <Textarea
                rows={4}
                value={dayFormData.description || ""}
                onChange={(e) => setDayFormData({ ...dayFormData, description: e.target.value })}
                placeholder="Describe the activities and highlights for this day"
                className="border-black focus-visible:ring-black"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-black font-medium">Images</Label>
                <span className="text-sm text-gray-500">{(dayFormData.images || []).length} image(s)</span>
              </div>

              {/* Image Grid */}
              {dayFormData.images && dayFormData.images.length > 0 && (
                <div className="grid grid-cols-4 gap-2">
                  {dayFormData.images.map((imageUrl, imageIndex) => (
                    <div
                      key={imageIndex}
                      className="group relative aspect-square overflow-hidden rounded border border-gray-300"
                    >
                      <img
                        src={imageUrl || "/placeholder.svg"}
                        alt={`Image ${imageIndex + 1}`}
                        className="h-full w-full object-cover grayscale group-hover:grayscale-0 transition-all"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeImageFromDayEdit(imageIndex)}
                        className="absolute top-0.5 right-0.5 h-6 w-6 bg-white/90 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3 text-black" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Image Button */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setImageDialogOpen(true)
                }}
                className="w-full mt-2 border-gray-300 hover:bg-gray-50 h-9"
              >
                <ImagePlus className="h-4 w-4 mr-2" />
                Add Image ({(dayFormData.images || []).length})
              </Button>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-300">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsDayEditOpen(false)
                  setDayFormData({})
                  setSelectedDay(null)
                }}
                className="border-black text-black hover:bg-gray-100"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSaveDayEdit}
                className="bg-black text-white hover:bg-gray-800"
                disabled={isLoading}
              >
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
