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
      action_items: {
        Row: {
          assignee: string
          created_at: string
          due_date: string | null
          id: string
          meeting_minutes_id: string | null
          priority: string
          status: string
          task: string
          updated_at: string
        }
        Insert: {
          assignee: string
          created_at?: string
          due_date?: string | null
          id?: string
          meeting_minutes_id?: string | null
          priority?: string
          status?: string
          task: string
          updated_at?: string
        }
        Update: {
          assignee?: string
          created_at?: string
          due_date?: string | null
          id?: string
          meeting_minutes_id?: string | null
          priority?: string
          status?: string
          task?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "action_items_meeting_minutes_id_fkey"
            columns: ["meeting_minutes_id"]
            isOneToOne: false
            referencedRelation: "meeting_minutes"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_sales_reports: {
        Row: {
          card_amex: number | null
          card_master: number | null
          card_visa: number | null
          cash: number | null
          created_at: string
          date: string
          feelo: number | null
          gift_card_redemptions: number | null
          gift_cards: number | null
          id: string
          mintpay: number | null
          online_transfer: number | null
          products: number | null
          services: number | null
          thyaga: number | null
          time: string
          unionpay: number | null
          updated_at: string
        }
        Insert: {
          card_amex?: number | null
          card_master?: number | null
          card_visa?: number | null
          cash?: number | null
          created_at?: string
          date: string
          feelo?: number | null
          gift_card_redemptions?: number | null
          gift_cards?: number | null
          id?: string
          mintpay?: number | null
          online_transfer?: number | null
          products?: number | null
          services?: number | null
          thyaga?: number | null
          time: string
          unionpay?: number | null
          updated_at?: string
        }
        Update: {
          card_amex?: number | null
          card_master?: number | null
          card_visa?: number | null
          cash?: number | null
          created_at?: string
          date?: string
          feelo?: number | null
          gift_card_redemptions?: number | null
          gift_cards?: number | null
          id?: string
          mintpay?: number | null
          online_transfer?: number | null
          products?: number | null
          services?: number | null
          thyaga?: number | null
          time?: string
          unionpay?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      job_applications: {
        Row: {
          applicant_id: string | null
          cover_letter: string | null
          created_at: string | null
          id: string
          job_id: string | null
          status: string
        }
        Insert: {
          applicant_id?: string | null
          cover_letter?: string | null
          created_at?: string | null
          id?: string
          job_id?: string | null
          status?: string
        }
        Update: {
          applicant_id?: string | null
          cover_letter?: string | null
          created_at?: string | null
          id?: string
          job_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_applications_applicant_id_fkey"
            columns: ["applicant_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          accommodation: string
          company: string
          created_at: string | null
          description: string
          employer_id: string | null
          gender: string
          id: string
          is_featured: boolean | null
          location: string
          requirements: string | null
          salary: string
          status: string
          title: string
          type: string
          updated_at: string | null
          vacancies: number
        }
        Insert: {
          accommodation: string
          company: string
          created_at?: string | null
          description: string
          employer_id?: string | null
          gender: string
          id?: string
          is_featured?: boolean | null
          location: string
          requirements?: string | null
          salary: string
          status?: string
          title: string
          type: string
          updated_at?: string | null
          vacancies?: number
        }
        Update: {
          accommodation?: string
          company?: string
          created_at?: string | null
          description?: string
          employer_id?: string | null
          gender?: string
          id?: string
          is_featured?: boolean | null
          location?: string
          requirements?: string | null
          salary?: string
          status?: string
          title?: string
          type?: string
          updated_at?: string | null
          vacancies?: number
        }
        Relationships: [
          {
            foreignKeyName: "jobs_employer_id_fkey"
            columns: ["employer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      meeting_minutes: {
        Row: {
          attendees: string[] | null
          created_at: string
          duration: string | null
          id: string
          meeting_date: string
          next_meeting_agenda: string | null
          next_meeting_date: string | null
          notes: string | null
          updated_at: string
        }
        Insert: {
          attendees?: string[] | null
          created_at?: string
          duration?: string | null
          id?: string
          meeting_date: string
          next_meeting_agenda?: string | null
          next_meeting_date?: string | null
          notes?: string | null
          updated_at?: string
        }
        Update: {
          attendees?: string[] | null
          created_at?: string
          duration?: string | null
          id?: string
          meeting_date?: string
          next_meeting_agenda?: string | null
          next_meeting_date?: string | null
          notes?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          is_approved: boolean | null
          role: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          is_approved?: boolean | null
          role?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          is_approved?: boolean | null
          role?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      social_posts: {
        Row: {
          content: string
          created_at: string
          date: string
          id: number
          media: string | null
          platform: string
          status: string
          time: string
          type: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          date: string
          id?: number
          media?: string | null
          platform: string
          status?: string
          time: string
          type: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          date?: string
          id?: number
          media?: string | null
          platform?: string
          status?: string
          time?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      staff: {
        Row: {
          created_at: string
          department: string
          designation: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          department: string
          designation: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          department?: string
          designation?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      staff_attendance: {
        Row: {
          attendance_status: string
          created_at: string
          daily_sales: number | null
          date: string
          id: string
          is_bni_day: boolean | null
          staff_name: string
          updated_at: string
        }
        Insert: {
          attendance_status?: string
          created_at?: string
          daily_sales?: number | null
          date: string
          id?: string
          is_bni_day?: boolean | null
          staff_name: string
          updated_at?: string
        }
        Update: {
          attendance_status?: string
          created_at?: string
          daily_sales?: number | null
          date?: string
          id?: string
          is_bni_day?: boolean | null
          staff_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      team_notes: {
        Row: {
          author: string
          created_at: string
          id: string
          item_id: string
          item_type: string
          text: string
          updated_at: string
        }
        Insert: {
          author: string
          created_at?: string
          id?: string
          item_id: string
          item_type: string
          text: string
          updated_at?: string
        }
        Update: {
          author?: string
          created_at?: string
          id?: string
          item_id?: string
          item_type?: string
          text?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "manager" | "staff" | "viewer"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "manager", "staff", "viewer"],
    },
  },
} as const
