"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import { Pencil, Trash2, GripVertical, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { MenuItem } from "@/types/menu"
import Image from "next/image"

interface SortableMenuItemProps {
  item: MenuItem
  viewMode: 'grid' | 'list'
  isSelected: boolean
  imageLoading: boolean
  onSelect: (checked: boolean) => void
  onEdit: () => void
  onDelete: () => void
  onImageLoad: () => void
  onImageError: () => void
}

const PLACEHOLDER_IMAGE = '/placeholder.svg'

export function SortableMenuItem({
  item,
  viewMode,
  isSelected,
  imageLoading,
  onSelect,
  onEdit,
  onDelete,
  onImageLoad,
  onImageError,
}: SortableMenuItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const imageUrl = item.image_url || PLACEHOLDER_IMAGE

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        'relative overflow-hidden group',
        isDragging && 'shadow-lg',
        viewMode === 'grid' ? 'h-full' : ''
      )}
    >
      <div className="absolute top-2 left-2 z-10">
        <Checkbox
          checked={isSelected}
          onCheckedChange={onSelect}
          className="bg-white/90"
        />
      </div>
      
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 right-2 z-10 cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="h-5 w-5 text-gray-500 hover:text-gray-700" />
      </div>

      {viewMode === 'grid' ? (
        <>
          <div className="relative aspect-video">
            <Image
              src={item.image_url || PLACEHOLDER_IMAGE}
              alt={item.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-all"
              onLoad={onImageLoad}
              onError={(e) => {
                console.error('Image load error for:', item.image_url);
                e.currentTarget.src = PLACEHOLDER_IMAGE;
                onImageError();
              }}
              unoptimized={!item.image_url}
            />
            {imageLoading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
              </div>
            )}
          </div>
          <CardContent className="p-4">
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg truncate">{item.name}</h3>
                <p className="text-sm text-gray-500 line-clamp-2">{item.description}</p>
                <p className="mt-1 font-medium">${item.price.toFixed(2)}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onEdit}
                  className="h-8 w-8"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onDelete}
                  className="h-8 w-8 text-red-500 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </>
      ) : (
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative h-16 w-16 shrink-0">
              <Image
                src={item.image_url || PLACEHOLDER_IMAGE}
                alt={item.name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover rounded transition-all"
                onLoad={onImageLoad}
                onError={(e) => {
                  console.error('Image load error for:', item.image_url);
                  e.currentTarget.src = PLACEHOLDER_IMAGE;
                  onImageError();
                }}
                unoptimized={!item.image_url}
              />
              {imageLoading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">{item.name}</h3>
              <p className="text-sm text-gray-500 line-clamp-1">{item.description}</p>
              <p className="mt-1 font-medium">${item.price.toFixed(2)}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={onEdit}
                className="h-8 w-8"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onDelete}
                className="h-8 w-8 text-red-500 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
} 