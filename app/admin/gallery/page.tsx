"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Trash2, X } from "lucide-react"
import { galleryApi, type GalleryImage } from "@/lib/api"

export default function GalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>([])
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null)
  const [formData, setFormData] = useState<Partial<GalleryImage>>({})
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>("")

  // Fetch all gallery images on component mount
  useEffect(() => {
    fetchGalleryImages()
  }, [])

  const fetchGalleryImages = async () => {
    try {
      setIsLoading(true)
      const data: any = await galleryApi.getAll()
      console.log("Gallery API response:", data)
      // Handle different response formats
      const imageArray = Array.isArray(data) ? data : (data?.data || data?.gallery || [])
      console.log("Processed images array:", imageArray)
      setImages(imageArray)
    } catch (err) {
      console.error("Failed to fetch gallery images:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch gallery images")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAdd = () => {
    setFormData({})
    setImageFile(null)
    setImagePreview("")
    setIsAddOpen(true)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this image?")) {
      try {
        await galleryApi.delete(id)
        await fetchGalleryImages()
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to delete image")
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!imageFile) {
      setError("Please select an image file")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      await galleryApi.create(formData, imageFile)
      await fetchGalleryImages()
      setIsAddOpen(false)
      setFormData({})
      setImageFile(null)
      setImagePreview("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload image")
    } finally {
      setIsLoading(false)
    }
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
          <h1 className="text-3xl font-semibold text-foreground">Gallery</h1>
          <p className="text-muted-foreground mt-1">Manage your tourism images and photos</p>
        </div>
        <Button onClick={handleAdd} className="gap-2">
          <Plus className="h-4 w-4" />
          Upload Image
        </Button>
      </div>

      {isLoading && images.length === 0 ? (
        <Card className="shadow-sm">
          <CardContent className="flex items-center justify-center py-16">
            <p className="text-muted-foreground">Loading gallery...</p>
          </CardContent>
        </Card>
      ) : images.length === 0 ? (
        <Card className="shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Plus className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">No images yet</h3>
            <p className="text-muted-foreground text-center mb-6">Start building your gallery by uploading images</p>
            <Button onClick={handleAdd} className="gap-2">
              <Plus className="h-4 w-4" />
              Upload First Image
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {images.map((image) => (
            <Card key={image._id} className="group relative overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="aspect-square cursor-pointer" onClick={() => setSelectedImage(image)}>
                <img
                  src={image.image_url || "/placeholder.svg"}
                  alt={image.place_name || "Gallery image"}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{image.place_name || "Untitled"}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {image.createdAt ? new Date(image.createdAt).toLocaleDateString() : ""}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => image._id && handleDelete(image._id)}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive flex-shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Image Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload New Image</DialogTitle>
            <DialogDescription>Add a new image to your tourism gallery</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="image">Image File</Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                required
                className="cursor-pointer"
              />
              <p className="text-xs text-muted-foreground">Choose an image file from your computer</p>
            </div>

            {imagePreview && (
              <div className="space-y-2">
                <Label>Preview</Label>
                <div className="relative aspect-video rounded-lg overflow-hidden border border-border">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="place_name">Place Name (Optional)</Label>
              <Input
                id="place_name"
                value={formData.place_name || ""}
                onChange={(e) => setFormData({ ...formData, place_name: e.target.value })}
                placeholder="e.g., Bali Beach, Mount Fuji"
              />
              <p className="text-xs text-muted-foreground">Add a location or description for this image</p>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsAddOpen(false)
                  setFormData({})
                  setImageFile(null)
                  setImagePreview("")
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading || !imageFile}>
                {isLoading ? "Uploading..." : "Upload Image"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Image Dialog */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl p-0">
          <VisuallyHidden>
            <DialogTitle>View Gallery Image</DialogTitle>
          </VisuallyHidden>
          {selectedImage && (
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 z-10 bg-background/80 backdrop-blur-sm hover:bg-background"
              >
                <X className="h-4 w-4" />
              </Button>
              <img
                src={selectedImage.image_url || "/placeholder.svg"}
                alt={selectedImage.place_name || "Gallery image"}
                className="w-full max-h-[80vh] object-contain"
              />
              {selectedImage.place_name && (
                <div className="p-6 bg-background border-t border-border">
                  <h3 className="text-xl font-semibold text-foreground">{selectedImage.place_name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Uploaded on {selectedImage.createdAt ? new Date(selectedImage.createdAt).toLocaleDateString() : ""}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
