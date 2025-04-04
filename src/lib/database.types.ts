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
      companies: {
        Row: {
          created_at: string | null
          domain: string
          id: number
          last_scraped_at: string | null
          name: string
          pages_scraped_count: number | null
        }
        Insert: {
          created_at?: string | null
          domain: string
          id?: never
          last_scraped_at?: string | null
          name: string
          pages_scraped_count?: number | null
        }
        Update: {
          created_at?: string | null
          domain?: string
          id?: never
          last_scraped_at?: string | null
          name?: string
          pages_scraped_count?: number | null
        }
        Relationships: []
      }
      company_insights: {
        Row: {
          company_id: number
          id: number
          key_differentiators: string[] | null
          known_customers: string[] | null
          linkedin_url: string | null
          llm_model_used: string | null
          mission: string | null
          offering_labels: string[] | null
          partnerships: string[] | null
          pricing_overview: string | null
          processed_at: string | null
          service_offerings: Json | null
          source_page_ids: number[] | null
          tagline: string | null
          target_audience: string | null
          technology_overview: string | null
          x_url: string | null
        }
        Insert: {
          company_id: number
          id?: never
          key_differentiators?: string[] | null
          known_customers?: string[] | null
          linkedin_url?: string | null
          llm_model_used?: string | null
          mission?: string | null
          offering_labels?: string[] | null
          partnerships?: string[] | null
          pricing_overview?: string | null
          processed_at?: string | null
          service_offerings?: Json | null
          source_page_ids?: number[] | null
          tagline?: string | null
          target_audience?: string | null
          technology_overview?: string | null
          x_url?: string | null
        }
        Update: {
          company_id?: number
          id?: never
          key_differentiators?: string[] | null
          known_customers?: string[] | null
          linkedin_url?: string | null
          llm_model_used?: string | null
          mission?: string | null
          offering_labels?: string[] | null
          partnerships?: string[] | null
          pricing_overview?: string | null
          processed_at?: string | null
          service_offerings?: Json | null
          source_page_ids?: number[] | null
          tagline?: string | null
          target_audience?: string | null
          technology_overview?: string | null
          x_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_insights_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      pages: {
        Row: {
          company_id: number
          crawl_date: string | null
          depth: number
          id: number
          parsed_text: string | null
          raw_html: string | null
          title: string | null
          url: string
        }
        Insert: {
          company_id: number
          crawl_date?: string | null
          depth?: number
          id?: never
          parsed_text?: string | null
          raw_html?: string | null
          title?: string | null
          url: string
        }
        Update: {
          company_id?: number
          crawl_date?: string | null
          depth?: number
          id?: never
          parsed_text?: string | null
          raw_html?: string | null
          title?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "pages_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          is_admin: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          is_admin?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_admin?: boolean
          updated_at?: string
        }
        Relationships: []
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
