import { supabase } from '@/lib/supabase'
import type {
  CreateFeedbackRequest,
  CreateFeedbackResponse,
  FeedbackInsert,
} from '@/types/database'
import { validateFeedbackRequest } from '@/types/database'

export class FeedbackStorageError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message)
    this.name = 'FeedbackStorageError'
  }

  static validation(message: string): FeedbackStorageError {
    return new FeedbackStorageError(message, 'VALIDATION_ERROR', 400)
  }

  static database(message: string): FeedbackStorageError {
    return new FeedbackStorageError(message, 'DATABASE_ERROR', 500)
  }

  static rateLimit(): FeedbackStorageError {
    return new FeedbackStorageError(
      'Too many requests. Please try again later.',
      'RATE_LIMIT',
      429
    )
  }
}

export async function createFeedback(
  data: CreateFeedbackRequest
): Promise<CreateFeedbackResponse> {
  try {
    // Check if Supabase is properly configured (skip in test environment)
    if (
      process.env.NODE_ENV !== 'test' &&
      (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY)
    ) {
      throw FeedbackStorageError.database(
        'Database configuration is missing. Feedback cannot be stored.'
      )
    }

    // Validate input data
    if (!validateFeedbackRequest(data)) {
      throw FeedbackStorageError.validation(
        'Invalid feedback data. Required: reflection_id, feedback_type.'
      )
    }

    // Prepare data for insertion
    const feedbackData: FeedbackInsert = {
      reflection_id: data.reflection_id.trim(),
      feedback_type: data.feedback_type,
      user_agent: data.user_agent?.substring(0, 1000) || null, // Limit user agent length
    }

    // Insert feedback into database
    const { data: result, error } = await supabase
      .from('feedback')
      .insert(feedbackData)
      .select('feedback_id')
      .single()

    if (error) {
      console.error('Database error creating feedback:', error)
      throw FeedbackStorageError.database(
        'Failed to store feedback. Please try again.'
      )
    }

    return {
      success: true,
      feedback_id: result.feedback_id,
    }
  } catch (error) {
    // Re-throw known errors
    if (error instanceof FeedbackStorageError) {
      throw error
    }

    // Handle unexpected errors
    console.error('Unexpected error creating feedback:', error)
    throw FeedbackStorageError.database(
      'An unexpected error occurred. Please try again.'
    )
  }
}

// Utility function to sanitize reflection_id (ensure it's safe for storage)
export function sanitizeReflectionId(id: string): string {
  return id.replace(/[^\w\-_]/g, '').substring(0, 255)
}

// Utility function to check if reflection_id format is valid
export function isValidReflectionId(id: string): boolean {
  return typeof id === 'string' && id.length > 0 && id.length <= 255
}
