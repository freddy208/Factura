export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          company_name: string | null
          company_type: 'freelance' | 'pme' | 'agence' | null
          phone: string | null
          address: string | null
          logo_url: string | null
          plan: 'free' | 'pro'
          pro_activated_at: string | null
          invoice_count: number
          quote_count: number
          onboarding_done: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          company_name?: string | null
          company_type?: 'freelance' | 'pme' | 'agence' | null
          phone?: string | null
          address?: string | null
          logo_url?: string | null
          plan?: 'free' | 'pro'
          pro_activated_at?: string | null
          invoice_count?: number
          quote_count?: number
          onboarding_done?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          company_name?: string | null
          company_type?: 'freelance' | 'pme' | 'agence' | null
          phone?: string | null
          address?: string | null
          logo_url?: string | null
          plan?: 'free' | 'pro'
          pro_activated_at?: string | null
          invoice_count?: number
          quote_count?: number
          onboarding_done?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      clients: {
        Row: {
          id: string
          user_id: string
          name: string
          email: string | null
          phone: string | null
          company: string | null
          address: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          email?: string | null
          phone?: string | null
          company?: string | null
          address?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          email?: string | null
          phone?: string | null
          company?: string | null
          address?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      invoices: {
        Row: {
          id: string
          user_id: string
          client_id: string | null
          type: 'invoice' | 'quote'
          number: string
          status: 'draft' | 'sent' | 'paid' | 'cancelled' | 'accepted' | 'refused'
          issue_date: string
          due_date: string | null
          subtotal: number
          tax_rate: number
          tax_amount: number
          total: number
          notes: string | null
          currency: string
          converted_from: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          client_id?: string | null
          type: 'invoice' | 'quote'
          number: string
          status?: 'draft' | 'sent' | 'paid' | 'cancelled' | 'accepted' | 'refused'
          issue_date?: string
          due_date?: string | null
          subtotal?: number
          tax_rate?: number
          tax_amount?: number
          total?: number
          notes?: string | null
          currency?: string
          converted_from?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          client_id?: string | null
          type?: 'invoice' | 'quote'
          number?: string
          status?: 'draft' | 'sent' | 'paid' | 'cancelled' | 'accepted' | 'refused'
          issue_date?: string
          due_date?: string | null
          subtotal?: number
          tax_rate?: number
          tax_amount?: number
          total?: number
          notes?: string | null
          currency?: string
          converted_from?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      invoice_items: {
        Row: {
          id: string
          invoice_id: string
          description: string
          quantity: number
          unit_price: number
          total: number
          position: number
        }
        Insert: {
          id?: string
          invoice_id: string
          description: string
          quantity?: number
          unit_price?: number
          total?: number
          position?: number
        }
        Update: {
          id?: string
          invoice_id?: string
          description?: string
          quantity?: number
          unit_price?: number
          total?: number
          position?: number
        }
      }
      payment_requests: {
        Row: {
          id: string
          user_id: string
          amount: number | null
          currency: string
          payment_method: 'mtn' | 'orange' | 'autre' | null
          proof_description: string | null
          status: 'pending' | 'validated' | 'rejected'
          validated_by: string | null
          validated_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          amount?: number | null
          currency?: string
          payment_method?: 'mtn' | 'orange' | 'autre' | null
          proof_description?: string | null
          status?: 'pending' | 'validated' | 'rejected'
          validated_by?: string | null
          validated_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number | null
          currency?: string
          payment_method?: 'mtn' | 'orange' | 'autre' | null
          proof_description?: string | null
          status?: 'pending' | 'validated' | 'rejected'
          validated_by?: string | null
          validated_at?: string | null
          created_at?: string
        }
      }
    }
    Functions: {
      check_quota: {
        Args: { p_user_id: string; p_type: string }
        Returns: boolean
      }
      generate_invoice_number: {
        Args: { p_user_id: string; p_type: string }
        Returns: string
      }
    }
  }
}

// Helpers pratiques
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type InsertTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']

export type UpdateTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']

// Types directs
export type Profile = Tables<'profiles'>
export type Client = Tables<'clients'>
export type Invoice = Tables<'invoices'>
export type InvoiceItem = Tables<'invoice_items'>
export type PaymentRequest = Tables<'payment_requests'>