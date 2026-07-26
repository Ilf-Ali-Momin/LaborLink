export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      applications: {
        Row: {
          created_at: string
          id: string
          listing_id: string
          message: string | null
          snapshot: Json
          status: Database["public"]["Enums"]["application_status"]
          student_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          listing_id: string
          message?: string | null
          snapshot?: Json
          status?: Database["public"]["Enums"]["application_status"]
          student_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          listing_id?: string
          message?: string | null
          snapshot?: Json
          status?: Database["public"]["Enums"]["application_status"]
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          expires_on: string | null
          id: string
          kind: string
          original_name: string
          storage_path: string
          student_id: string
          uploaded_at: string
        }
        Insert: {
          expires_on?: string | null
          id?: string
          kind: string
          original_name: string
          storage_path: string
          student_id: string
          uploaded_at?: string
        }
        Update: {
          expires_on?: string | null
          id?: string
          kind?: string
          original_name?: string
          storage_path?: string
          student_id?: string
          uploaded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      employer_members: {
        Row: {
          created_at: string
          employer_id: string
          member_role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          employer_id: string
          member_role?: string
          user_id: string
        }
        Update: {
          created_at?: string
          employer_id?: string
          member_role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "employer_members_employer_id_fkey"
            columns: ["employer_id"]
            isOneToOne: false
            referencedRelation: "employers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employer_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      employers: {
        Row: {
          city: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          name: string
          slug: string
          website: string | null
        }
        Insert: {
          city?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name: string
          slug: string
          website?: string | null
        }
        Update: {
          city?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name?: string
          slug?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employers_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      hour_entries: {
        Row: {
          created_at: string
          hours: number
          id: string
          note: string | null
          student_id: string
          worked_on: string
        }
        Insert: {
          created_at?: string
          hours: number
          id?: string
          note?: string | null
          student_id: string
          worked_on: string
        }
        Update: {
          created_at?: string
          hours?: number
          id?: string
          note?: string | null
          student_id?: string
          worked_on?: string
        }
        Relationships: [
          {
            foreignKeyName: "hour_entries_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      listings: {
        Row: {
          city: string | null
          created_at: string
          description: string
          employer_id: string
          hourly_wage_cents: number
          hours_per_week: number
          id: string
          published_at: string | null
          remote: boolean
          slug: string
          status: Database["public"]["Enums"]["listing_status"]
          title: string
          type: Database["public"]["Enums"]["listing_type"]
          updated_at: string
        }
        Insert: {
          city?: string | null
          created_at?: string
          description?: string
          employer_id: string
          hourly_wage_cents: number
          hours_per_week: number
          id?: string
          published_at?: string | null
          remote?: boolean
          slug: string
          status?: Database["public"]["Enums"]["listing_status"]
          title: string
          type: Database["public"]["Enums"]["listing_type"]
          updated_at?: string
        }
        Update: {
          city?: string | null
          created_at?: string
          description?: string
          employer_id?: string
          hourly_wage_cents?: number
          hours_per_week?: number
          id?: string
          published_at?: string | null
          remote?: boolean
          slug?: string
          status?: Database["public"]["Enums"]["listing_status"]
          title?: string
          type?: Database["public"]["Enums"]["listing_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "listings_employer_id_fkey"
            columns: ["employer_id"]
            isOneToOne: false
            referencedRelation: "employers"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          created_at?: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: []
      }
      student_profiles: {
        Row: {
          bio: string | null
          city: string | null
          degree_program: string | null
          first_name: string
          languages: string[]
          last_name: string
          semester: number | null
          university: string | null
          updated_at: string
          user_id: string
          work_auth: Database["public"]["Enums"]["work_auth_status"]
        }
        Insert: {
          bio?: string | null
          city?: string | null
          degree_program?: string | null
          first_name?: string
          languages?: string[]
          last_name?: string
          semester?: number | null
          university?: string | null
          updated_at?: string
          user_id: string
          work_auth?: Database["public"]["Enums"]["work_auth_status"]
        }
        Update: {
          bio?: string | null
          city?: string | null
          degree_program?: string | null
          first_name?: string
          languages?: string[]
          last_name?: string
          semester?: number | null
          university?: string | null
          updated_at?: string
          user_id?: string
          work_auth?: Database["public"]["Enums"]["work_auth_status"]
        }
        Relationships: [
          {
            foreignKeyName: "student_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          current_period_end: string | null
          employer_id: string
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          tier: string
          updated_at: string
        }
        Insert: {
          current_period_end?: string | null
          employer_id: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          tier?: string
          updated_at?: string
        }
        Update: {
          current_period_end?: string | null
          employer_id?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          tier?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_employer_id_fkey"
            columns: ["employer_id"]
            isOneToOne: true
            referencedRelation: "employers"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      application_status:
        | "submitted"
        | "in_review"
        | "interview"
        | "offer"
        | "hired"
        | "rejected"
        | "withdrawn"
      listing_status: "draft" | "active" | "closed"
      listing_type: "werkstudent" | "minijob" | "kurzfristig"
      user_role: "student" | "employer"
      work_auth_status:
        | "eu_citizen"
        | "permit_verified"
        | "permit_pending"
        | "unknown"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      application_status: [
        "submitted",
        "in_review",
        "interview",
        "offer",
        "hired",
        "rejected",
        "withdrawn",
      ],
      listing_status: ["draft", "active", "closed"],
      listing_type: ["werkstudent", "minijob", "kurzfristig"],
      user_role: ["student", "employer"],
      work_auth_status: [
        "eu_citizen",
        "permit_verified",
        "permit_pending",
        "unknown",
      ],
    },
  },
} as const

