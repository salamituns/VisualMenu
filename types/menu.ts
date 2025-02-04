export type DietaryType = 
  | 'vegetarian'
  | 'vegan'
  | 'gluten_free'
  | 'dairy_free'
  | 'nut_free'
  | 'halal'
  | 'kosher'

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  category_id?: string;
  image_url?: string | null;
  image_path?: string | null;
  is_available: boolean;
  dietary_info?: string[];
  created_at: string;
  updated_at: string;
  portion_sizes?: PortionSize[];
  customization_options?: CustomizationOption[];
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  order_index: number;
  created_at: string;
  updated_at: string;
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

export interface PortionSize {
  id: string;
  menu_item_id: string;
  name: string;
  price: number;
  is_default: boolean;
}

export interface CustomizationOption {
  id: string;
  menu_item_id: string;
  name: string;
  price_adjustment: number;
  max_selections: number;
  is_required: boolean;
  choices?: CustomizationChoice[];
}

export interface CustomizationChoice {
  id: string;
  option_id: string;
  name: string;
  price_adjustment: number;
  is_default: boolean;
}

export const DIETARY_LABELS: Record<DietaryType, string> = {
  vegetarian: 'Vegetarian',
  vegan: 'Vegan',
  gluten_free: 'Gluten Free',
  dairy_free: 'Dairy Free',
  nut_free: 'Nut Free',
  halal: 'Halal',
  kosher: 'Kosher',
}

export const DIETARY_ICONS: Record<DietaryType, string> = {
  vegetarian: '🥬',
  vegan: '🌱',
  gluten_free: '🌾',
  dairy_free: '🥛',
  nut_free: '🥜',
  halal: '🍖',
  kosher: '✡️',
} 