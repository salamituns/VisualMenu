import { supabase } from './supabase'
import type { Database, Menu, Category, MenuItem } from '@/types/database'

export async function getMenus() {
  const { data, error } = await supabase
    .from('menus')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function createMenu(menu: Database['public']['Tables']['menus']['Insert']) {
  const { data, error } = await supabase
    .from('menus')
    .insert(menu)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateMenu(
  id: string,
  menu: Database['public']['Tables']['menus']['Update']
) {
  const { data, error } = await supabase
    .from('menus')
    .update(menu)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteMenu(id: string) {
  const { error } = await supabase
    .from('menus')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function getCategories(menuId: string) {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('menu_id', menuId)
    .order('display_order', { ascending: true })

  if (error) throw error
  return data
}

export async function createCategory(
  category: Database['public']['Tables']['categories']['Insert']
) {
  const { data, error } = await supabase
    .from('categories')
    .insert(category)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateCategory(
  id: string,
  category: Database['public']['Tables']['categories']['Update']
) {
  const { data, error } = await supabase
    .from('categories')
    .update(category)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteCategory(id: string) {
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function getMenuItems(categoryId: string) {
  const { data, error } = await supabase
    .from('menu_items')
    .select('*')
    .eq('category_id', categoryId)
    .order('display_order', { ascending: true })

  if (error) throw error
  return data
}

export async function createMenuItem(
  item: Database['public']['Tables']['menu_items']['Insert']
) {
  const { data, error } = await supabase
    .from('menu_items')
    .insert(item)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateMenuItem(
  id: string,
  item: Database['public']['Tables']['menu_items']['Update']
) {
  const { data, error } = await supabase
    .from('menu_items')
    .update(item)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteMenuItem(id: string) {
  const { error } = await supabase
    .from('menu_items')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// Helper function to get full menu structure
export async function getFullMenu(menuId: string) {
  const { data: categories, error: categoriesError } = await supabase
    .from('categories')
    .select(`
      *,
      menu_items (*)
    `)
    .eq('menu_id', menuId)
    .order('display_order', { ascending: true })

  if (categoriesError) throw categoriesError
  return categories
} 