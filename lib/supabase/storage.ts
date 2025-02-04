import { createClient } from '@/lib/supabase/client'
import { v4 as uuidv4 } from 'uuid'

const MENU_ITEMS_BUCKET = 'menu-images'

export async function uploadMenuItemImage(file: File) {
  const supabase = createClient()
  
  try {
    // Create unique file path
    const fileExt = file.name.split('.').pop()
    const filePath = `${uuidv4()}.${fileExt}`

    // Upload the file
    const { error: uploadError, data } = await supabase.storage
      .from(MENU_ITEMS_BUCKET)
      .upload(filePath, file)

    if (uploadError) throw uploadError

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(MENU_ITEMS_BUCKET)
      .getPublicUrl(filePath)

    return {
      path: filePath,
      url: publicUrl,
    }
  } catch (error) {
    console.error('Error uploading image:', error)
    throw error
  }
}

export async function deleteMenuItemImage(filePath: string) {
  const supabase = createClient()
  
  try {
    const { error } = await supabase.storage
      .from(MENU_ITEMS_BUCKET)
      .remove([filePath])

    if (error) throw error
  } catch (error) {
    console.error('Error deleting image:', error)
    throw error
  }
} 