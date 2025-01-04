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
          name: string
          price: number
          description: string | null
          category_id: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          price: number
          description?: string | null
          category_id?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          price?: number
          description?: string | null
          category_id?: string | null
          created_at?: string
          updated_at?: string | null
        }
      }
      orders: {
        Row: {
          id: string
          menu_item_id: string
          quantity: number
          created_at: string
          updated_at: string | null
          menu_item?: {
            name: string
            price: number
          } | null
        }
        Insert: {
          id?: string
          menu_item_id: string
          quantity: number
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          menu_item_id?: string
          quantity?: number
          created_at?: string
          updated_at?: string | null
        }
      }
      customers: {
        Row: {
          id: string
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string | null
        }
      }
    }
  }
} 