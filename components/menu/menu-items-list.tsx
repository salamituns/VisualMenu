import { useState } from "react"
import { Trash } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { MenuItem } from "@/types/menu"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
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

interface MenuItemsListProps {
  items: MenuItem[]
  onEdit: (item: MenuItem) => void
}

export function MenuItemsList({ items, onEdit }: MenuItemsListProps) {
  const router = useRouter()
  const supabase = createClient()
  const [itemToDelete, setItemToDelete] = useState<MenuItem | null>(null)

  const handleDelete = async () => {
    if (!itemToDelete) return

    try {
      const { error } = await supabase
        .from("menu_items")
        .delete()
        .eq("id", itemToDelete.id)

      if (error) throw error

      toast.success("Menu item deleted successfully")
      router.refresh()
    } catch (error) {
      console.error("Error deleting menu item:", error)
      toast.error("Failed to delete menu item")
    } finally {
      setItemToDelete(null)
    }
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div
          key={item.id}
          className="flex items-center justify-between rounded-lg border p-4"
        >
          <div>
            <h3 className="font-medium">{item.name}</h3>
            <p className="text-sm text-muted-foreground">{item.description}</p>
            <p className="text-sm font-medium">₦{item.price}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setItemToDelete(item)}
            >
              <Trash className="h-4 w-4" />
            </Button>
            <Button onClick={() => onEdit(item)}>Edit</Button>
          </div>
        </div>
      ))}

      <AlertDialog open={!!itemToDelete} onOpenChange={() => setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the menu
              item.
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
    </div>
  )
} 