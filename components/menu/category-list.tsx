'use client'

import { useState } from 'react'
import { Category } from '@/types/menu'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/ui/icons'
import { CategoryDialog } from '@/components/menu/category-dialog'
import {
  DragEndEvent,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  MouseSensor,
  TouchSensor,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Trash } from 'lucide-react'
import { useRouter } from 'next/navigation'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { SortableItem } from './sortable-item'

interface CategoryListProps {
  categories: Category[]
  isLoading: boolean
}

interface SortableCategoryProps {
  category: Category
  onEdit: (category: Category) => void
}

function SortableCategory({ category, onEdit }: SortableCategoryProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <Card
        className={cn(
          'cursor-move transition-colors',
          isDragging && 'border-primary bg-muted'
        )}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div className="space-y-1">
            <CardTitle>{category.name}</CardTitle>
            {category.description && (
              <p className="text-sm text-muted-foreground">
                {category.description}
              </p>
            )}
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(category)}
              className="cursor-pointer"
            >
              <Icons.edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              {...listeners}
              className="cursor-grab"
            >
              <Icons.grip className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
      </Card>
    </div>
  )
}

export function CategoryList({ categories, isLoading }: CategoryListProps) {
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const queryClient = useQueryClient()
  const supabase = createClient()
  const router = useRouter()
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null)

  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor)
  )

  const updateOrder = async (sortedCategories: Category[]) => {
    try {
      const updates = sortedCategories.map((category, index) => ({
        id: category.id,
        order_index: index,
      }))

      const { error } = await supabase
        .from("categories")
        .upsert(updates)

      if (error) throw error

      queryClient.setQueryData(["categories"], sortedCategories)
    } catch (error) {
      console.error("Error updating category order:", error)
      toast.error("Failed to update category order")
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id) return

    const oldIndex = categories.findIndex((cat) => cat.id === active.id)
    const newIndex = categories.findIndex((cat) => cat.id === over.id)

    const sortedCategories = arrayMove(categories, oldIndex, newIndex)
    updateOrder(sortedCategories)
  }

  const handleDelete = async () => {
    if (!categoryToDelete) return

    try {
      const { error } = await supabase
        .from("categories")
        .delete()
        .eq("id", categoryToDelete.id)

      if (error) throw error

      toast.success("Category deleted successfully")
      router.refresh()
    } catch (error) {
      console.error("Error deleting category:", error)
      toast.error("Failed to delete category")
    } finally {
      setCategoryToDelete(null)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-24 rounded-lg border bg-muted/10 p-4 animate-pulse"
          />
        ))}
      </div>
    )
  }

  if (categories.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No categories</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Add your first category to organize your menu
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={categories}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-4">
            {categories.map((category) => (
              <SortableItem key={category.id} id={category.id}>
                <div className="flex items-center justify-between rounded-lg border bg-card p-4">
                  <div>
                    <h3 className="font-medium">{category.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {category.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setCategoryToDelete(category)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                    <Button onClick={() => setEditingCategory(category)}>
                      Edit
                    </Button>
                  </div>
                </div>
              </SortableItem>
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <CategoryDialog
        open={!!editingCategory}
        onOpenChange={() => setEditingCategory(null)}
        category={editingCategory}
      />

      <AlertDialog open={!!categoryToDelete} onOpenChange={() => setCategoryToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the category
              and all menu items associated with it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
} 