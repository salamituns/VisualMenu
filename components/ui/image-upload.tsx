"use client"

import * as React from "react"
import { useDropzone } from "react-dropzone"
import { toast } from "sonner"
import { Image as ImageIcon, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { uploadMenuItemImage } from "@/lib/supabase/storage"

interface ImageUploadProps {
  value?: string
  onChange?: (value: { url: string; path: string } | null) => void
  onRemove?: () => void
  className?: string
  disabled?: boolean
}

export function ImageUpload({
  value,
  onChange,
  onRemove,
  className,
  disabled,
}: ImageUploadProps) {
  const [preview, setPreview] = React.useState<string | null>(value || null)
  const [isLoading, setIsLoading] = React.useState(false)

  const onDrop = React.useCallback(
    async (acceptedFiles: File[]) => {
      if (disabled) return

      const file = acceptedFiles[0]

      if (!file) {
        toast.error("Please upload an image file")
        return
      }

      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file")
        return
      }

      setIsLoading(true)

      try {
        // Upload to Supabase Storage
        const result = await uploadMenuItemImage(file)
        setPreview(result.url)

        // Call onChange with both URL and path
        if (onChange) {
          onChange(result)
        }
      } catch (error) {
        toast.error("Error uploading image")
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    },
    [disabled, onChange]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif"],
    },
    maxFiles: 1,
    disabled: disabled || isLoading,
  })

  // Cleanup preview URL on unmount
  React.useEffect(() => {
    return () => {
      if (preview && preview.startsWith("blob:")) {
        URL.revokeObjectURL(preview)
      }
    }
  }, [preview])

  return (
    <div className={cn("space-y-4 w-full", className)}>
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-4 hover:bg-accent/50 transition cursor-pointer",
          isDragActive && "border-primary",
          (disabled || isLoading) && "opacity-50 cursor-default hover:bg-transparent"
        )}
      >
        <input {...getInputProps()} />
        {preview ? (
          <div className="relative aspect-square w-full overflow-hidden rounded-lg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="Upload preview"
              className="object-cover w-full h-full"
            />
            {!disabled && onRemove && (
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2"
                onClick={(e) => {
                  e.stopPropagation()
                  setPreview(null)
                  onRemove()
                }}
                disabled={isLoading}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 py-4">
            <ImageIcon className="h-8 w-8 text-muted-foreground" />
            <div className="text-sm text-muted-foreground text-center">
              {isLoading ? (
                <span>Uploading...</span>
              ) : isDragActive ? (
                <span>Drop the image here</span>
              ) : (
                <span>
                  Drag and drop an image here, or click to select
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 