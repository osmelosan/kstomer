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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      agent_logs: {
        Row: {
          agent_name: string
          cost_usd: number | null
          created_at: string
          duration_ms: number | null
          error_message: string | null
          id: string
          input: Json | null
          output: Json | null
          status: string
          tokens_input: number | null
          tokens_output: number | null
          trigger_type: string
        }
        Insert: {
          agent_name: string
          cost_usd?: number | null
          created_at?: string
          duration_ms?: number | null
          error_message?: string | null
          id?: string
          input?: Json | null
          output?: Json | null
          status: string
          tokens_input?: number | null
          tokens_output?: number | null
          trigger_type: string
        }
        Update: {
          agent_name?: string
          cost_usd?: number | null
          created_at?: string
          duration_ms?: number | null
          error_message?: string | null
          id?: string
          input?: Json | null
          output?: Json | null
          status?: string
          tokens_input?: number | null
          tokens_output?: number | null
          trigger_type?: string
        }
        Relationships: []
      }
      ai_insight_cache: {
        Row: {
          content: Json
          feature: string
          generated_at: string
          id: string
          scope_id: string
          user_id: string
        }
        Insert: {
          content: Json
          feature: string
          generated_at?: string
          id?: string
          scope_id?: string
          user_id: string
        }
        Update: {
          content?: Json
          feature?: string
          generated_at?: string
          id?: string
          scope_id?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_insights: {
        Row: {
          contact_id: string
          content: string
          created_at: string
          id: string
          insight_type: Database["public"]["Enums"]["ai_insight_type"]
          model_used: string | null
          organization_id: string
          score: number | null
        }
        Insert: {
          contact_id: string
          content: string
          created_at?: string
          id?: string
          insight_type: Database["public"]["Enums"]["ai_insight_type"]
          model_used?: string | null
          organization_id: string
          score?: number | null
        }
        Update: {
          contact_id?: string
          content?: string
          created_at?: string
          id?: string
          insight_type?: Database["public"]["Enums"]["ai_insight_type"]
          model_used?: string | null
          organization_id?: string
          score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_insights_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_insights_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_prompt_cache: {
        Row: {
          cache_key: string
          cached_content: string
          contact_id: string | null
          expires_at: string | null
          generated_at: string
          id: string
          organization_id: string
        }
        Insert: {
          cache_key: string
          cached_content: string
          contact_id?: string | null
          expires_at?: string | null
          generated_at?: string
          id?: string
          organization_id: string
        }
        Update: {
          cache_key?: string
          cached_content?: string
          contact_id?: string | null
          expires_at?: string | null
          generated_at?: string
          id?: string
          organization_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_prompt_cache_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_prompt_cache_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_notes: {
        Row: {
          contact_id: string
          created_at: string
          id: string
          note_text: string
          organization_id: string
          updated_at: string
        }
        Insert: {
          contact_id: string
          created_at?: string
          id?: string
          note_text: string
          organization_id: string
          updated_at?: string
        }
        Update: {
          contact_id?: string
          created_at?: string
          id?: string
          note_text?: string
          organization_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_notes_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_notes_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          archived_at: string | null
          company_name: string | null
          confidence_level: number | null
          contact_name: string
          created_at: string
          created_by_user_id: string
          email: string | null
          first_name: string
          id: string
          last_contact_date: string | null
          last_name: string | null
          notes_count: number
          organization_id: string
          owner_user_id: string
          phone: string | null
          renewal_date: string | null
          stage: Database["public"]["Enums"]["contact_stage"]
          updated_at: string
        }
        Insert: {
          archived_at?: string | null
          company_name?: string | null
          confidence_level?: number | null
          contact_name: string
          created_at?: string
          created_by_user_id: string
          email?: string | null
          first_name: string
          id?: string
          last_contact_date?: string | null
          last_name?: string | null
          notes_count?: number
          organization_id: string
          owner_user_id: string
          phone?: string | null
          renewal_date?: string | null
          stage?: Database["public"]["Enums"]["contact_stage"]
          updated_at?: string
        }
        Update: {
          archived_at?: string | null
          company_name?: string | null
          confidence_level?: number | null
          contact_name?: string
          created_at?: string
          created_by_user_id?: string
          email?: string | null
          first_name?: string
          id?: string
          last_contact_date?: string | null
          last_name?: string | null
          notes_count?: number
          organization_id?: string
          owner_user_id?: string
          phone?: string | null
          renewal_date?: string | null
          stage?: Database["public"]["Enums"]["contact_stage"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contacts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          contact_id: string | null
          created_at: string
          id: string
          organization_id: string
          read_at: string | null
          reminder_id: string | null
          trigger_offset_days: number | null
          type: string
          user_id: string
        }
        Insert: {
          contact_id?: string | null
          created_at?: string
          id?: string
          organization_id: string
          read_at?: string | null
          reminder_id?: string | null
          trigger_offset_days?: number | null
          type?: string
          user_id: string
        }
        Update: {
          contact_id?: string | null
          created_at?: string
          id?: string
          organization_id?: string
          read_at?: string | null
          reminder_id?: string | null
          trigger_offset_days?: number | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_reminder_id_fkey"
            columns: ["reminder_id"]
            isOneToOne: false
            referencedRelation: "reminders"
            referencedColumns: ["id"]
          },
        ]
      }
      nuki_access_grants: {
        Row: {
          allowed_from: string | null
          allowed_until: string | null
          contact_id: string | null
          created_at: string
          created_by_user_id: string | null
          id: string
          name: string
          nuki_auth_id: string | null
          organization_id: string
          smartlock_id: string
          smartlock_name: string | null
          status: string
          type: string
          updated_at: string
        }
        Insert: {
          allowed_from?: string | null
          allowed_until?: string | null
          contact_id?: string | null
          created_at?: string
          created_by_user_id?: string | null
          id?: string
          name: string
          nuki_auth_id?: string | null
          organization_id: string
          smartlock_id: string
          smartlock_name?: string | null
          status?: string
          type: string
          updated_at?: string
        }
        Update: {
          allowed_from?: string | null
          allowed_until?: string | null
          contact_id?: string | null
          created_at?: string
          created_by_user_id?: string | null
          id?: string
          name?: string
          nuki_auth_id?: string | null
          organization_id?: string
          smartlock_id?: string
          smartlock_name?: string | null
          status?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "nuki_access_grants_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nuki_access_grants_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      nuki_connections: {
        Row: {
          api_token_encrypted: string
          connected_at: string
          created_at: string
          id: string
          organization_id: string
          token_last4: string | null
          updated_at: string
        }
        Insert: {
          api_token_encrypted: string
          connected_at?: string
          created_at?: string
          id?: string
          organization_id: string
          token_last4?: string | null
          updated_at?: string
        }
        Update: {
          api_token_encrypted?: string
          connected_at?: string
          created_at?: string
          id?: string
          organization_id?: string
          token_last4?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "nuki_connections_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          address: string | null
          archived_at: string | null
          city: string | null
          country: string | null
          created_at: string
          description: string | null
          id: string
          is_test: boolean
          name: string
          owner_id: string
          postal_code: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          archived_at?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_test?: boolean
          name: string
          owner_id: string
          postal_code?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          archived_at?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_test?: boolean
          name?: string
          owner_id?: string
          postal_code?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          onboarding_completed: boolean
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          onboarding_completed?: boolean
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          onboarding_completed?: boolean
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      reminders: {
        Row: {
          contact_id: string
          id: string
          is_active: boolean
          organization_id: string
          reminder_date: string
          sent_at: string | null
          trigger_offset_days: number
        }
        Insert: {
          contact_id: string
          id?: string
          is_active?: boolean
          organization_id: string
          reminder_date: string
          sent_at?: string | null
          trigger_offset_days: number
        }
        Update: {
          contact_id?: string
          id?: string
          is_active?: boolean
          organization_id?: string
          reminder_date?: string
          sent_at?: string | null
          trigger_offset_days?: number
        }
        Relationships: [
          {
            foreignKeyName: "reminders_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reminders_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      reseller_contact_history: {
        Row: {
          contact_id: string
          ended_at: string | null
          id: string
          organization_id: string
          reseller_id: string
          started_at: string
        }
        Insert: {
          contact_id: string
          ended_at?: string | null
          id?: string
          organization_id: string
          reseller_id: string
          started_at: string
        }
        Update: {
          contact_id?: string
          ended_at?: string | null
          id?: string
          organization_id?: string
          reseller_id?: string
          started_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reseller_contact_history_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reseller_contact_history_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reseller_contact_history_reseller_id_fkey"
            columns: ["reseller_id"]
            isOneToOne: false
            referencedRelation: "resellers"
            referencedColumns: ["id"]
          },
        ]
      }
      reseller_contacts: {
        Row: {
          contact_id: string
          id: string
          organization_id: string
          reseller_id: string
        }
        Insert: {
          contact_id: string
          id?: string
          organization_id: string
          reseller_id: string
        }
        Update: {
          contact_id?: string
          id?: string
          organization_id?: string
          reseller_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reseller_contacts_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: true
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reseller_contacts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reseller_contacts_reseller_id_fkey"
            columns: ["reseller_id"]
            isOneToOne: false
            referencedRelation: "resellers"
            referencedColumns: ["id"]
          },
        ]
      }
      reseller_notes: {
        Row: {
          created_at: string
          id: string
          note_text: string
          organization_id: string
          reseller_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          note_text: string
          organization_id: string
          reseller_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          note_text?: string
          organization_id?: string
          reseller_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reseller_notes_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reseller_notes_reseller_id_fkey"
            columns: ["reseller_id"]
            isOneToOne: false
            referencedRelation: "resellers"
            referencedColumns: ["id"]
          },
        ]
      }
      resellers: {
        Row: {
          archived_at: string | null
          company: string | null
          confidence_level: number | null
          created_at: string
          created_by_user_id: string
          email: string | null
          id: string
          name: string
          organization_id: string
          owner_user_id: string
          phone: string | null
        }
        Insert: {
          archived_at?: string | null
          company?: string | null
          confidence_level?: number | null
          created_at?: string
          created_by_user_id: string
          email?: string | null
          id?: string
          name: string
          organization_id: string
          owner_user_id: string
          phone?: string | null
        }
        Update: {
          archived_at?: string | null
          company?: string | null
          confidence_level?: number | null
          created_at?: string
          created_by_user_id?: string
          email?: string | null
          id?: string
          name?: string
          organization_id?: string
          owner_user_id?: string
          phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "resellers_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      stage_history: {
        Row: {
          changed_at: string
          changed_by_user_id: string | null
          contact_id: string
          from_stage: Database["public"]["Enums"]["contact_stage"] | null
          id: string
          organization_id: string
          to_stage: Database["public"]["Enums"]["contact_stage"]
        }
        Insert: {
          changed_at?: string
          changed_by_user_id?: string | null
          contact_id: string
          from_stage?: Database["public"]["Enums"]["contact_stage"] | null
          id?: string
          organization_id: string
          to_stage: Database["public"]["Enums"]["contact_stage"]
        }
        Update: {
          changed_at?: string
          changed_by_user_id?: string | null
          contact_id?: string
          from_stage?: Database["public"]["Enums"]["contact_stage"] | null
          id?: string
          organization_id?: string
          to_stage?: Database["public"]["Enums"]["contact_stage"]
        }
        Relationships: [
          {
            foreignKeyName: "stage_history_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stage_history_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_details: {
        Row: {
          contact_id: string
          deal_value: number | null
          id: string
          mrr: number | null
          organization_id: string
          plan_name: string | null
          subscription_start_date: string | null
          updated_at: string
        }
        Insert: {
          contact_id: string
          deal_value?: number | null
          id?: string
          mrr?: number | null
          organization_id: string
          plan_name?: string | null
          subscription_start_date?: string | null
          updated_at?: string
        }
        Update: {
          contact_id?: string
          deal_value?: number | null
          id?: string
          mrr?: number | null
          organization_id?: string
          plan_name?: string | null
          subscription_start_date?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscription_details_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: true
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscription_details_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          environment: string
          id: string
          price_id: string
          product_id: string
          status: string
          stripe_customer_id: string
          stripe_subscription_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          environment?: string
          id?: string
          price_id: string
          product_id: string
          status?: string
          stripe_customer_id: string
          stripe_subscription_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          environment?: string
          id?: string
          price_id?: string
          product_id?: string
          status?: string
          stripe_customer_id?: string
          stripe_subscription_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          contact: string | null
          created_at: string
          due_date: string
          id: string
          priority: string
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          contact?: string | null
          created_at?: string
          due_date?: string
          id?: string
          priority?: string
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          contact?: string | null
          created_at?: string
          due_date?: string
          id?: string
          priority?: string
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
          role: Database["public"]["Enums"]["app_role"]
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_active_subscription: {
        Args: { check_env?: string; user_uuid: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      ai_insight_type: "score" | "summary" | "suggested_action"
      app_role: "admin" | "tester" | "user"
      contact_stage:
        | "new_lead"
        | "contacted"
        | "proposal"
        | "active"
        | "at_risk"
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
      ai_insight_type: ["score", "summary", "suggested_action"],
      app_role: ["admin", "tester", "user"],
      contact_stage: ["new_lead", "contacted", "proposal", "active", "at_risk"],
    },
  },
} as const
