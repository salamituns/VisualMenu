export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: string;
  category: string;
  image_url: string | null;
  dietary_info: string[];
  is_available: boolean;
  special_offer: Record<string, any> | null;
  order?: number;
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
  order?: number;
} 