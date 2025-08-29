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
      feedback: {
        Row: {
          feedback_id: string
          reflection_id: string
          feedback_type: 'positive' | 'negative'
          user_agent: string | null
          created_at: string
        }
        Insert: {
          feedback_id?: string
          reflection_id: string
          feedback_type: 'positive' | 'negative'
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          feedback_id?: string
          reflection_id?: string
          feedback_type?: 'positive' | 'negative'
          user_agent?: string | null
          created_at?: string
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

// Convenience types for feedback operations
export type Feedback = Database['public']['Tables']['feedback']['Row']
export type FeedbackInsert = Database['public']['Tables']['feedback']['Insert']
export type FeedbackUpdate = Database['public']['Tables']['feedback']['Update']

// Feedback type enum for validation
export const FEEDBACK_TYPES = ['positive', 'negative'] as const
export type FeedbackType = (typeof FEEDBACK_TYPES)[number]

// Request/response types for API
export interface CreateFeedbackRequest {
  reflection_id: string
  feedback_type: FeedbackType
  user_agent?: string
}

export interface CreateFeedbackResponse {
  success: boolean
  feedback_id?: string
  error?: string
}

// Validation functions
export function isValidFeedbackType(type: string): type is FeedbackType {
  return FEEDBACK_TYPES.includes(type as FeedbackType)
}

export function validateFeedbackRequest(
  data: unknown
): data is CreateFeedbackRequest {
  if (typeof data !== 'object' || data === null) return false

  const req = data as Record<string, unknown>

  return (
    typeof req.reflection_id === 'string' &&
    req.reflection_id.length > 0 &&
    typeof req.feedback_type === 'string' &&
    isValidFeedbackType(req.feedback_type) &&
    (req.user_agent === undefined || typeof req.user_agent === 'string')
  )
}
