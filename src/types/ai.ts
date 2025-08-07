/**
 * TypeScript type definitions for AI service integration
 *
 * Defines the request/response structure for journal entry processing
 * using OpenAI's API to generate reflections, summaries, and insights.
 */

/**
 * Request payload for journal reflection processing
 */
export interface ReflectionRequest {
  /**
   * The journal entry content to be processed
   * Must be a non-empty string with meaningful content
   */
  content: string

  /**
   * Optional user preferences for the reflection
   */
  preferences?: {
    /**
     * Preferred tone for the AI response
     * @default "supportive"
     */
    tone?: 'supportive' | 'analytical' | 'encouraging' | 'gentle'

    /**
     * Focus areas for the reflection
     */
    focusAreas?: (
      | 'emotions'
      | 'patterns'
      | 'growth'
      | 'relationships'
      | 'goals'
    )[]
  }
}

/**
 * Successful response from journal reflection processing
 */
export interface ReflectionResponse {
  /**
   * Brief summary of the journal entry (1-2 sentences)
   */
  summary: string

  /**
   * Detected pattern, theme, or insight from the entry
   */
  pattern: string

  /**
   * Gentle, actionable suggestion or prompt for the user
   */
  suggestion: string

  /**
   * Metadata about the AI processing
   */
  metadata: {
    /**
     * OpenAI model used for processing
     */
    model: string

    /**
     * Processing timestamp
     */
    processedAt: string

    /**
     * Estimated processing time in milliseconds
     */
    processingTimeMs: number
  }
}

/**
 * Error response from AI service
 */
export interface ReflectionError {
  /**
   * Error type for client handling
   */
  error:
    | 'validation'
    | 'rate_limit'
    | 'api_error'
    | 'timeout'
    | 'content_policy'
    | 'internal_error'

  /**
   * Human-readable error message
   */
  message: string

  /**
   * Optional additional details for debugging
   */
  details?: string

  /**
   * Retry information for recoverable errors
   */
  retryAfter?: number
}

/**
 * Configuration for OpenAI service
 */
export interface OpenAIConfig {
  apiKey: string
  model: string
  fallbackModel: string
  maxTokens: number
  temperature: number
  timeout: number
}

/**
 * Rate limiting configuration
 */
export interface RateLimitConfig {
  /**
   * Requests per minute limit
   */
  rpm: number

  /**
   * Time window for rate limiting in milliseconds
   */
  windowMs: number
}

/**
 * Cache entry structure
 */
export interface CacheEntry {
  /**
   * Cached response data
   */
  response: ReflectionResponse

  /**
   * Cache entry creation timestamp
   */
  createdAt: number

  /**
   * Cache TTL in milliseconds
   */
  ttl: number
}

/**
 * Internal rate limiting state
 */
export interface RateLimitState {
  /**
   * Request timestamps for tracking
   */
  requests: number[]

  /**
   * Last reset timestamp
   */
  lastReset: number
}

/**
 * Prompt template configuration for AI requests
 */
export interface PromptTemplate {
  /**
   * System message for AI context
   */
  systemMessage: string

  /**
   * User message template with placeholders
   */
  userMessageTemplate: string
}
