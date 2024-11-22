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
      appointments: {
        Row: {
          id: string
          created_at: string
          user_id: string
          service_id: string
          appointment_time: string
          status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
          queue_number: number
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          service_id: string
          appointment_time: string
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled'
          queue_number?: number
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          service_id?: string
          appointment_time?: string
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled'
          queue_number?: number
        }
      }
      services: {
        Row: {
          id: string
          name: string
          description: string
          duration: number
          price: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          duration: number
          price: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          duration?: number
          price?: number
          created_at?: string
        }
      }
      users: {
        Row: {
          id: string
          created_at: string
          email: string
          name: string
          phone: string
          preferences: Json
        }
        Insert: {
          id?: string
          created_at?: string
          email: string
          name: string
          phone: string
          preferences?: Json
        }
        Update: {
          id?: string
          created_at?: string
          email?: string
          name?: string
          phone?: string
          preferences?: Json
        }
      }
    }
  }
}