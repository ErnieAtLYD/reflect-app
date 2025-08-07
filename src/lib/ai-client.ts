/**
 * Client-side utilities for interacting with the AI Reflection API
 *
 * Provides a type-safe interface for making requests to the reflection
 * endpoint and handling responses and errors appropriately.
 */

import type {
  ReflectionRequest,
  ReflectionResponse,
  ReflectionError,
} from '@/types/ai'

/**
 * Client for interacting with the AI reflection API
 */
export class AIReflectionClient {
  private baseUrl: string

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl
  }

  /**
   * Process a journal entry and get AI reflection
   */
  async processEntry(request: ReflectionRequest): Promise<ReflectionResponse> {
    const response = await fetch(`${this.baseUrl}/api/reflect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      const error: ReflectionError = await response.json()
      throw new AIReflectionError(error, response.status)
    }

    return response.json()
  }
}

/**
 * Custom error class for AI reflection API errors
 */
export class AIReflectionError extends Error {
  public readonly error: ReflectionError['error']
  public readonly statusCode: number
  public readonly details?: string
  public readonly retryAfter?: number

  constructor(errorData: ReflectionError, statusCode: number) {
    super(errorData.message)
    this.name = 'AIReflectionError'
    this.error = errorData.error
    this.statusCode = statusCode
    this.details = errorData.details
    this.retryAfter = errorData.retryAfter
  }

  /**
   * Check if this is a retryable error
   */
  isRetryable(): boolean {
    return (
      this.error === 'timeout' ||
      this.error === 'api_error' ||
      this.error === 'internal_error'
    )
  }

  /**
   * Check if this is a rate limit error
   */
  isRateLimited(): boolean {
    return this.error === 'rate_limit'
  }

  /**
   * Check if this is a content policy violation
   */
  isContentPolicyViolation(): boolean {
    return this.error === 'content_policy'
  }
}

/**
 * Default client instance
 */
export const aiClient = new AIReflectionClient()

/**
 * Example usage function
 */
export async function exampleUsage() {
  try {
    const response = await aiClient.processEntry({
      content:
        "Today I had a breakthrough at work. I finally understood a complex problem that I've been struggling with for weeks. The solution came to me during my morning walk, and I felt a surge of confidence and accomplishment. It reminded me that sometimes stepping away from a problem is the best way to solve it.",
      preferences: {
        tone: 'supportive',
        focusAreas: ['growth', 'patterns'],
      },
    })

    console.log('AI Reflection Response:')
    console.log('Summary:', response.summary)
    console.log('Pattern:', response.pattern)
    console.log('Suggestion:', response.suggestion)
    console.log('Processed with:', response.metadata.model)

    return response
  } catch (error) {
    if (error instanceof AIReflectionError) {
      console.error(`AI Reflection Error (${error.error}):`, error.message)

      if (error.isRateLimited() && error.retryAfter) {
        console.log(`Rate limited. Retry after ${error.retryAfter} seconds.`)
      } else if (error.isRetryable()) {
        console.log('This error is retryable. You may try again.')
      } else if (error.isContentPolicyViolation()) {
        console.log(
          'Content violates usage policies. Please modify your entry.'
        )
      }
    } else {
      console.error('Unexpected error:', error)
    }
    throw error
  }
}

/**
 * Utility to format AI response for display
 */
export function formatReflectionResponse(response: ReflectionResponse): string {
  return `
## Your Reflection

**Summary:** ${response.summary}

**Pattern Noticed:** ${response.pattern}

**Suggestion:** ${response.suggestion}

---
*Processed by ${response.metadata.model} in ${response.metadata.processingTimeMs}ms*
  `.trim()
}

/**
 * Utility to validate content before sending to API
 */
export function validateContent(content: string): {
  isValid: boolean
  error?: string
} {
  if (!content || typeof content !== 'string') {
    return { isValid: false, error: 'Content is required and must be a string' }
  }

  const trimmed = content.trim()
  if (trimmed.length === 0) {
    return { isValid: false, error: 'Content cannot be empty' }
  }

  if (trimmed.length < 10) {
    return {
      isValid: false,
      error: 'Content must be at least 10 characters long',
    }
  }

  if (trimmed.length > 5000) {
    return {
      isValid: false,
      error: 'Content must be less than 5000 characters',
    }
  }

  return { isValid: true }
}
