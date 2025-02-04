export interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category_id: string | null;
  is_available: boolean;
  image_url?: string | null;
  image_path?: string | null;
  created_at: string;
  updated_at?: string | null;
}

export interface Category {
  id: string;
  name: string;
  description?: string | null;
  order_index: number;
  created_at: string;
  updated_at?: string | null;
}

export interface CreateMenuItemInput {
  name: string;
  description: string;
  price: number;
  category_id: string;
  image_url?: string;
  is_available?: boolean;
}

export interface UpdateMenuItemInput extends Partial<CreateMenuItemInput> {
  id: string;
}

export interface CreateCategoryInput {
  name: string;
  description?: string;
  order_index?: number;
}

export interface UpdateCategoryInput extends Partial<CreateCategoryInput> {
  id: string;
}

export interface DatabaseMenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  image_url: string | null;
  dietary_info: string[] | null;
  is_available: boolean;
  special_offer: Record<string, any> | null;
  order: number;
} 