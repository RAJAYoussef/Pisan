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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      class_assignments: {
        Row: {
          class_id: string
          created_at: string
          due_date: string
          id: string
          kind: string
          member_ids: string[] | null
          skill_ids: string[]
          title: string
        }
        Insert: {
          class_id: string
          created_at?: string
          due_date: string
          id?: string
          kind?: string
          member_ids?: string[] | null
          skill_ids: string[]
          title: string
        }
        Update: {
          class_id?: string
          created_at?: string
          due_date?: string
          id?: string
          kind?: string
          member_ids?: string[] | null
          skill_ids?: string[]
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_assignments_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      class_members: {
        Row: {
          class_id: string
          id: string
          joined_at: string
          token_hash: string
        }
        Insert: {
          class_id: string
          id?: string
          joined_at?: string
          token_hash: string
        }
        Update: {
          class_id?: string
          id?: string
          joined_at?: string
          token_hash?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_members_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_members_token_hash_fkey"
            columns: ["token_hash"]
            isOneToOne: false
            referencedRelation: "learning_sessions"
            referencedColumns: ["token_hash"]
          },
        ]
      }
      classes: {
        Row: {
          country: string
          created_at: string
          grade: number
          id: string
          join_code: string
          leaderboard_enabled: boolean
          name: string
          teacher_id: string
          track: string | null
        }
        Insert: {
          country: string
          created_at?: string
          grade: number
          id?: string
          join_code: string
          leaderboard_enabled?: boolean
          name: string
          teacher_id: string
          track?: string | null
        }
        Update: {
          country?: string
          created_at?: string
          grade?: number
          id?: string
          join_code?: string
          leaderboard_enabled?: boolean
          name?: string
          teacher_id?: string
          track?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "classes_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      coach_global_usage: {
        Row: {
          count: number
          day: string
        }
        Insert: {
          count?: number
          day: string
        }
        Update: {
          count?: number
          day?: string
        }
        Relationships: []
      }
      fraction_learning_journal: {
        Row: {
          activity_id: string
          client_occurred_at: string | null
          event_id: string
          event_type: string
          evidence_status: string
          id: number
          payload: Json
          recorded_at: string
          skill_id: string
          token_hash: string
        }
        Insert: {
          activity_id: string
          client_occurred_at?: string | null
          event_id: string
          event_type: string
          evidence_status?: string
          id?: never
          payload?: Json
          recorded_at?: string
          skill_id: string
          token_hash: string
        }
        Update: {
          activity_id?: string
          client_occurred_at?: string | null
          event_id?: string
          event_type?: string
          evidence_status?: string
          id?: never
          payload?: Json
          recorded_at?: string
          skill_id?: string
          token_hash?: string
        }
        Relationships: [
          {
            foreignKeyName: "fraction_learning_journal_token_hash_fkey"
            columns: ["token_hash"]
            isOneToOne: false
            referencedRelation: "learning_sessions"
            referencedColumns: ["token_hash"]
          },
        ]
      }
      learning_sessions: {
        Row: {
          challenge_correct: boolean | null
          challenge_day: string | null
          class_join_attempts: string[]
          coach_count: number
          coach_date: string
          created_at: string
          dys_default: Json | null
          dys_updated_at: string | null
          freezes: number
          last_active_at: string
          partner: boolean
          profile: Json
          progress: Json
          streak_count: number
          streak_last_day: string | null
          timezone_changed_at: string | null
          token_hash: string
          usage_count: number
          usage_date: string
        }
        Insert: {
          challenge_correct?: boolean | null
          challenge_day?: string | null
          class_join_attempts?: string[]
          coach_count?: number
          coach_date?: string
          created_at?: string
          dys_default?: Json | null
          dys_updated_at?: string | null
          freezes?: number
          last_active_at?: string
          partner?: boolean
          profile?: Json
          progress?: Json
          streak_count?: number
          streak_last_day?: string | null
          timezone_changed_at?: string | null
          token_hash: string
          usage_count?: number
          usage_date?: string
        }
        Update: {
          challenge_correct?: boolean | null
          challenge_day?: string | null
          class_join_attempts?: string[]
          coach_count?: number
          coach_date?: string
          created_at?: string
          dys_default?: Json | null
          dys_updated_at?: string | null
          freezes?: number
          last_active_at?: string
          partner?: boolean
          profile?: Json
          progress?: Json
          streak_count?: number
          streak_last_day?: string | null
          timezone_changed_at?: string | null
          token_hash?: string
          usage_count?: number
          usage_date?: string
        }
        Relationships: []
      }
      partner_codes: {
        Row: {
          active: boolean | null
          code: string
          created_at: string | null
          school_name: string | null
        }
        Insert: {
          active?: boolean | null
          code: string
          created_at?: string | null
          school_name?: string | null
        }
        Update: {
          active?: boolean | null
          code?: string
          created_at?: string | null
          school_name?: string | null
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          count: number
          key: string
          window_start: string
        }
        Insert: {
          count: number
          key: string
          window_start: string
        }
        Update: {
          count?: number
          key?: string
          window_start?: string
        }
        Relationships: []
      }
      skill_runs: {
        Row: {
          missed: number[]
          ref: string
          step: number
          token_hash: string
          updated_at: string
        }
        Insert: {
          missed?: number[]
          ref: string
          step?: number
          token_hash: string
          updated_at?: string
        }
        Update: {
          missed?: number[]
          ref?: string
          step?: number
          token_hash?: string
          updated_at?: string
        }
        Relationships: []
      }
      teachers: {
        Row: {
          display_name: string
          id: string
          partner_code: string | null
          school_name: string
        }
        Insert: {
          display_name: string
          id: string
          partner_code?: string | null
          school_name: string
        }
        Update: {
          display_name?: string
          id?: string
          partner_code?: string | null
          school_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "teachers_partner_code_fkey"
            columns: ["partner_code"]
            isOneToOne: false
            referencedRelation: "partner_codes"
            referencedColumns: ["code"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      append_pisan_attempt: {
        Args: { p_attempt: Json; p_day: string; p_hash: string }
        Returns: Json
      }
      claim_pisan_challenge: {
        Args: { p_correct: boolean; p_day: string; p_hash: string }
        Returns: boolean
      }
      consume_pisan_coach: {
        Args: { p_hash: string; p_limit?: number }
        Returns: number
      }
      consume_pisan_coach_gated: {
        Args: { p_global: number; p_hash: string; p_limit: number }
        Returns: number
      }
      consume_pisan_exercise: { Args: { p_hash: string }; Returns: boolean }
      join_pisan_class: {
        Args: { p_code: string; p_hash: string }
        Returns: string
      }
      join_pisan_class_limited: {
        Args: { p_code: string; p_hash: string }
        Returns: Json
      }
      pisan_rate_limit: {
        Args: { p_key: string; p_limit: number; p_window_seconds: number }
        Returns: boolean
      }
      pisan_skill_check: {
        Args: {
          p_hash: string
          p_ok: boolean
          p_ref: string
          p_step: number
          p_total: number
        }
        Returns: Json
      }
      pisan_skill_result: {
        Args: { p_hash: string; p_ref: string }
        Returns: Json
      }
      record_pisan_streak: {
        Args: { p_day: string; p_hash: string }
        Returns: Json
      }
      refund_pisan_coach: { Args: { p_hash: string }; Returns: undefined }
      rekey_pisan_session: {
        Args: { p_new_hash: string; p_old_hash: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
