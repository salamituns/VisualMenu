"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import { Pencil, Trash2, GripVertical } from "lucide-react"
import { cn } from "@/lib/utils"
import { MenuItem } from "@/types/menu"

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

export function SortableMenuItem({
  item,
  viewMode,
  isSelected,
  imageLoading,
  onSelect,
  onEdit,
  onDelete,
  onImageLoad,
  onImageError
}: SortableMenuItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative overflow-hidden hover:shadow-lg transition-shadow",
        isSelected && "ring-2 ring-primary",
        isDragging && "shadow-lg"
      )}
    >
      <div className="absolute top-2 left-2 z-10 flex items-center gap-2">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded"
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
        <Checkbox
          checked={isSelected}
          onCheckedChange={onSelect}
        />
      </div>

      {viewMode === 'grid' ? (
        <>
          <div className="relative aspect-video">
            {item.image_url ? (
              <>
                {imageLoading && (
                  <Skeleton className="absolute inset-0" />
                )}
                <img
                  src={item.image_url}
                  alt={item.name}
                  className={cn(
                    "w-full h-full object-cover",
                    imageLoading ? 'opacity-0' : 'opacity-100'
                  )}
                  onLoad={onImageLoad}
                  onError={onImageError}
                />
              </>
            ) : (
              <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                <span className="text-gray-400">No image</span>
              </div>
            )}
            {!item.is_available && (
              <Badge 
                variant="destructive" 
                className="absolute top-2 right-2"
              >
                Unavailable
              </Badge>
            )}
          </div>
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-semibold">{item.name}</h3>
                <p className="text-sm text-gray-500 line-clamp-2">{item.description}</p>
              </div>
              <div className="flex flex-col items-end">
                <span className="font-medium">${parseFloat(item.price).toFixed(2)}</span>
                {item.special_offer?.discount_price && (
                  <Badge variant="secondary" className="mt-1">
                    Special: ${parseFloat(item.special_offer.discount_price).toFixed(2)}
                  </Badge>
                )}
              </div>
            </div>
            {item.dietary_info && item.dietary_info.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {item.dietary_info.map((info, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {info}
                  </Badge>
                ))}
              </div>
            )}
            <div className="flex justify-end mt-4 space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onEdit}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onDelete}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </>
      ) : (
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="relative w-24 h-24 flex-shrink-0">
              {item.image_url ? (
                <>
                  {imageLoading && (
                    <Skeleton className="absolute inset-0" />
                  )}
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className={cn(
                      "w-full h-full object-cover rounded",
                      imageLoading ? 'opacity-0' : 'opacity-100'
                    )}
                    onLoad={onImageLoad}
                    onError={onImageError}
                  />
                </>
              ) : (
                <div className="w-full h-full bg-gray-100 rounded flex items-center justify-center">
                  <span className="text-gray-400 text-xs">No image</span>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold truncate">{item.name}</h3>
                  <p className="text-sm text-gray-500 line-clamp-1">{item.description}</p>
                  {item.dietary_info && item.dietary_info.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {item.dietary_info.map((info, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {info}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end ml-4">
                  <span className="font-medium whitespace-nowrap">${parseFloat(item.price).toFixed(2)}</span>
                  {item.special_offer?.discount_price && (
                    <Badge variant="secondary" className="mt-1">
                      Special: ${parseFloat(item.special_offer.discount_price).toFixed(2)}
                    </Badge>
                  )}
                  {!item.is_available && (
                    <Badge variant="destructive" className="mt-1">
                      Unavailable
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex justify-end mt-2 space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onEdit}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onDelete}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
} 