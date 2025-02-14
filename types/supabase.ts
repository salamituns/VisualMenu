export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      menu_items: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          description: string
          price: number
          image_url: string | null
          category_id: string
          is_available: boolean
          dietary_info: string[]
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          name: string
          description: string
          price: number
          image_url?: string | null
          category_id: string
          is_available?: boolean
          dietary_info?: string[]
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string
          description?: string
          price?: number
          image_url?: string | null
          category_id?: string
          is_available?: boolean
          dietary_info?: string[]
        }
      }
      categories: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          description: string | null
          order_index: number
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          name: string
          description?: string | null
          order_index?: number
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string
          description?: string | null
          order_index?: number
        }
      }
      views: {
        Row: {
          id: string
          created_at: string
          page: string
          user_id: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          page: string
          user_id?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          page?: string
          user_id?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 