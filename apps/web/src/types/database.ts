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
      bancos_brasileiros: {
        Row: {
          codigo_compensacao: string
          created_at: string | null
          id: number
          nome_instituicao: string
          updated_at: string | null
        }
        Insert: {
          codigo_compensacao: string
          created_at?: string | null
          id?: number
          nome_instituicao: string
          updated_at?: string | null
        }
        Update: {
          codigo_compensacao?: string
          created_at?: string | null
          id?: number
          nome_instituicao?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      file_attachments: {
        Row: {
          category: string
          created_at: string | null
          file_name: string
          file_size: number
          file_type: string
          file_url: string
          id: string
          request_id: string
          uploaded_by: string
        }
        Insert: {
          category: string
          created_at?: string | null
          file_name: string
          file_size: number
          file_type: string
          file_url: string
          id?: string
          request_id: string
          uploaded_by: string
        }
        Update: {
          category?: string
          created_at?: string | null
          file_name?: string
          file_size?: number
          file_type?: string
          file_url?: string
          id?: string
          request_id?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "file_attachments_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "travel_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      form_drafts: {
        Row: {
          created_at: string | null
          current_page: number | null
          form_data: Json
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_page?: number | null
          form_data?: Json
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_page?: number | null
          form_data?: Json
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          id: string
          last_login: string | null
          metadata: Json | null
          name: string | null
          role: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id: string
          last_login?: string | null
          metadata?: Json | null
          name?: string | null
          role?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          last_login?: string | null
          metadata?: Json | null
          name?: string | null
          role?: string | null
        }
        Relationships: []
      }
      projetos: {
        Row: {
          centros_custo: Json
          created_at: string | null
          id: string
          nome: string
          updated_at: string | null
        }
        Insert: {
          centros_custo?: Json
          created_at?: string | null
          id?: string
          nome: string
          updated_at?: string | null
        }
        Update: {
          centros_custo?: Json
          created_at?: string | null
          id?: string
          nome?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      status_history: {
        Row: {
          changed_by: string
          comment: string | null
          created_at: string | null
          id: string
          new_status: string
          previous_status: string | null
          request_id: string
        }
        Insert: {
          changed_by: string
          comment?: string | null
          created_at?: string | null
          id?: string
          new_status: string
          previous_status?: string | null
          request_id: string
        }
        Update: {
          changed_by?: string
          comment?: string | null
          created_at?: string | null
          id?: string
          new_status?: string
          previous_status?: string | null
          request_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "status_history_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "travel_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      travel_requests: {
        Row: {
          accommodation_preferences: string | null
          additional_notes: string | null
          admin_notes: string | null
          bank_account: string | null
          bank_branch: string | null
          bank_name: string | null
          cost_center: string
          cost_center_manager: string
          created_at: string | null
          emergency_contact_email: string | null
          emergency_contact_name: string
          emergency_contact_phone: string
          expected_outcomes: string | null
          expense_types: Json | null
          has_time_restrictions: boolean | null
          id: string
          is_international: boolean | null
          need_accommodation: boolean | null
          passenger_birth_date: string
          passenger_cpf: string
          passenger_email: string
          passenger_name: string
          passenger_phone: string
          passenger_rg: string
          passport_expiry: string | null
          passport_issuing_country: string | null
          passport_number: string | null
          preferred_airlines: Json | null
          preferred_arrival_time: string | null
          preferred_departure_time: string | null
          project_name: string
          rejection_reason: string | null
          request_number: string | null
          requester_email: string
          requester_name: string
          reviewed_at: string | null
          reviewed_by: string | null
          seat_preference: string | null
          special_requests: string | null
          status: string | null
          submitted_at: string | null
          time_restrictions_details: string | null
          transport_details: string | null
          transport_type: string
          trip_destination: string
          trip_end_date: string
          trip_objective: string
          trip_origin: string
          trip_start_date: string
          updated_at: string | null
          user_id: string
          visa_information: string | null
          visa_required: boolean | null
        }
        Insert: {
          accommodation_preferences?: string | null
          additional_notes?: string | null
          admin_notes?: string | null
          bank_account?: string | null
          bank_branch?: string | null
          bank_name?: string | null
          cost_center: string
          cost_center_manager: string
          created_at?: string | null
          emergency_contact_email?: string | null
          emergency_contact_name: string
          emergency_contact_phone: string
          expected_outcomes?: string | null
          expense_types?: Json | null
          has_time_restrictions?: boolean | null
          id?: string
          is_international?: boolean | null
          need_accommodation?: boolean | null
          passenger_birth_date: string
          passenger_cpf: string
          passenger_email: string
          passenger_name: string
          passenger_phone: string
          passenger_rg: string
          passport_expiry?: string | null
          passport_issuing_country?: string | null
          passport_number?: string | null
          preferred_airlines?: Json | null
          preferred_arrival_time?: string | null
          preferred_departure_time?: string | null
          project_name: string
          rejection_reason?: string | null
          request_number?: string | null
          requester_email: string
          requester_name: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          seat_preference?: string | null
          special_requests?: string | null
          status?: string | null
          submitted_at?: string | null
          time_restrictions_details?: string | null
          transport_details?: string | null
          transport_type: string
          trip_destination: string
          trip_end_date: string
          trip_objective: string
          trip_origin: string
          trip_start_date: string
          updated_at?: string | null
          user_id: string
          visa_information?: string | null
          visa_required?: boolean | null
        }
        Update: {
          accommodation_preferences?: string | null
          additional_notes?: string | null
          admin_notes?: string | null
          bank_account?: string | null
          bank_branch?: string | null
          bank_name?: string | null
          cost_center?: string
          cost_center_manager?: string
          created_at?: string | null
          emergency_contact_email?: string | null
          emergency_contact_name?: string
          emergency_contact_phone?: string
          expected_outcomes?: string | null
          expense_types?: Json | null
          has_time_restrictions?: boolean | null
          id?: string
          is_international?: boolean | null
          need_accommodation?: boolean | null
          passenger_birth_date?: string
          passenger_cpf?: string
          passenger_email?: string
          passenger_name?: string
          passenger_phone?: string
          passenger_rg?: string
          passport_expiry?: string | null
          passport_issuing_country?: string | null
          passport_number?: string | null
          preferred_airlines?: Json | null
          preferred_arrival_time?: string | null
          preferred_departure_time?: string | null
          project_name?: string
          rejection_reason?: string | null
          request_number?: string | null
          requester_email?: string
          requester_name?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          seat_preference?: string | null
          special_requests?: string | null
          status?: string | null
          submitted_at?: string | null
          time_restrictions_details?: string | null
          transport_details?: string | null
          transport_type?: string
          trip_destination?: string
          trip_end_date?: string
          trip_objective?: string
          trip_origin?: string
          trip_start_date?: string
          updated_at?: string | null
          user_id?: string
          visa_information?: string | null
          visa_required?: boolean | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_request_number: {
        Args: Record<PropertyKey, never>
        Returns: string
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
    Enums: {},
  },
} as const

