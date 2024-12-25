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
      stacks: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          user_id: string
          name: string
          description: string | null
          is_public: boolean
          metadata: Json | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id: string
          name: string
          description?: string | null
          is_public?: boolean
          metadata?: Json | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id?: string
          name?: string
          description?: string | null
          is_public?: boolean
          metadata?: Json | null
        }
      }
      stack_items: {
        Row: {
          id: string
          created_at: string
          stack_id: string
          type: 'supplement' | 'food' | 'routine' | 'other'
          name: string
          description: string | null
          dosage: string | null
          frequency: string | null
          timing: string | null
          metadata: Json | null
          image_url: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          stack_id: string
          type: 'supplement' | 'food' | 'routine' | 'other'
          name: string
          description?: string | null
          dosage?: string | null
          frequency?: string | null
          timing?: string | null
          metadata?: Json | null
          image_url?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          stack_id?: string
          type?: 'supplement' | 'food' | 'routine' | 'other'
          name?: string
          description?: string | null
          dosage?: string | null
          frequency?: string | null
          timing?: string | null
          metadata?: Json | null
          image_url?: string | null
        }
      }
      daily_logs: {
        Row: {
          id: string
          created_at: string
          user_id: string
          date: string
          mood: number
          energy: number
          focus: number
          stress: number
          sleep_quality: number
          notes: string | null
          metrics: Json | null
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          date: string
          mood: number
          energy: number
          focus: number
          stress: number
          sleep_quality: number
          notes?: string | null
          metrics?: Json | null
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          date?: string
          mood?: number
          energy?: number
          focus?: number
          stress?: number
          sleep_quality?: number
          notes?: string | null
          metrics?: Json | null
        }
      }
      user_profiles: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          username: string
          full_name: string | null
          avatar_url: string | null
          bio: string | null
          settings: Json | null
        }
        Insert: {
          id: string
          created_at?: string
          updated_at?: string
          username: string
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          settings?: Json | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          username?: string
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          settings?: Json | null
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