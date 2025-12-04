export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      admin_keys: {
        Row: {
          created_at: string
          id: string
          key: string
          used_at: string | null
          used_by: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          used_at?: string | null
          used_by?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          used_at?: string | null
          used_by?: string | null
        }
        Relationships: []
      }
      colors: {
        Row: {
          category: string | null
          created_at: string
          hex_code: string | null
          id: string
          name: string
          scale: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          hex_code?: string | null
          id?: string
          name: string
          scale?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          hex_code?: string | null
          id?: string
          name?: string
          scale?: string | null
        }
        Relationships: []
      }
      dyeing_costs: {
        Row: {
          color_id: string
          cost: number
          created_at: string
          id: string
          product_id: string
          updated_at: string
        }
        Insert: {
          color_id: string
          cost: number
          created_at?: string
          id?: string
          product_id: string
          updated_at?: string
        }
        Update: {
          color_id?: string
          cost?: number
          created_at?: string
          id?: string
          product_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "dyeing_costs_color_id_fkey"
            columns: ["color_id"]
            isOneToOne: false
            referencedRelation: "colors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dyeing_costs_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_yarns: {
        Row: {
          created_at: string
          id: string
          product_id: string
          proportion: number
          yarn_type_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          proportion: number
          yarn_type_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          proportion?: number
          yarn_type_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_yarns_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_yarns_yarn_type_id_fkey"
            columns: ["yarn_type_id"]
            isOneToOne: false
            referencedRelation: "yarn_types"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          code: string
          composition: string | null
          created_at: string
          efficiency_factor: number
          id: string
          is_active: boolean
          name: string
          updated_at: string
          weaving_cost: number
          weight_gsm: number | null
          width_cm: number | null
          yield_m_kg: number | null
        }
        Insert: {
          code: string
          composition?: string | null
          created_at?: string
          efficiency_factor?: number
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
          weaving_cost?: number
          weight_gsm?: number | null
          width_cm?: number | null
          yield_m_kg?: number | null
        }
        Update: {
          code?: string
          composition?: string | null
          created_at?: string
          efficiency_factor?: number
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
          weaving_cost?: number
          weight_gsm?: number | null
          width_cm?: number | null
          yield_m_kg?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      quotes: {
        Row: {
          average_cost_per_kg: number
          created_at: string
          id: string
          product_id: string
          quote_data: Json | null
          total_kg: number
          total_value: number
          user_id: string | null
        }
        Insert: {
          average_cost_per_kg: number
          created_at?: string
          id?: string
          product_id: string
          quote_data?: Json | null
          total_kg: number
          total_value: number
          user_id?: string | null
        }
        Update: {
          average_cost_per_kg?: number
          created_at?: string
          id?: string
          product_id?: string
          quote_data?: Json | null
          total_kg?: number
          total_value?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quotes_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      yarn_prices: {
        Row: {
          created_at: string
          created_by: string | null
          effective_date: string
          id: string
          price: number
          yarn_type_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          effective_date?: string
          id?: string
          price: number
          yarn_type_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          effective_date?: string
          id?: string
          price?: number
          yarn_type_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "yarn_prices_yarn_type_id_fkey"
            columns: ["yarn_type_id"]
            isOneToOne: false
            referencedRelation: "yarn_types"
            referencedColumns: ["id"]
          },
        ]
      }
      yarn_types: {
        Row: {
          created_at: string
          id: string
          name: string
          unit: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          unit?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          unit?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      use_admin_key: {
        Args: { _key: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
