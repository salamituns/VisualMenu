export interface Menu {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  restaurant_id: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  description: string | null;
  menu_id: string;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category_id: string;
  image_url: string | null;
  is_available: boolean;
  display_order: number;
  allergens: string[] | null;
  dietary_info: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface Database {
  public: {
    Tables: {
      menus: {
        Row: Menu;
        Insert: Omit<Menu, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Menu, 'id' | 'created_at' | 'updated_at'>>;
      };
      categories: {
        Row: Category;
        Insert: Omit<Category, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Category, 'id' | 'created_at' | 'updated_at'>>;
      };
      menu_items: {
        Row: MenuItem;
        Insert: Omit<MenuItem, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<MenuItem, 'id' | 'created_at' | 'updated_at'>>;
      };
    };
  };
} 