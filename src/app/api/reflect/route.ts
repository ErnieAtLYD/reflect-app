/**
 * AI Reflection API Route
 *
 * Next.js API route for processing journal entries with OpenAI.
 * Provides summaries, patterns, and actionable suggestions for user reflection.
 *
 * POST /api/reflect
 * - Processes journal entry content
 * - Returns structured AI reflection response
 * - Includes rate limiting and caching
 */

import { NextRequest, NextResponse } from 'next/server'

import {
  getOpenAIConfig,
  createOpenAIClient,
  processJournalEntry,
  validateJournalContent,
  generateContentHash,
} from '@/lib/openai'
import type {
  ReflectionRequest,
  ReflectionResponse,
  ReflectionError,
  CacheEntry,
  RateLimitState,
} from '@/types/ai'

// In-memory stores (in production, consider Redis or other persistent storage)
const cache = new Map<string, CacheEntry>()
const rateLimitStore = new Map<string, RateLimitState>()

// Configuration
const RATE_LIMIT_RPM = parseInt(process.env.AI_RATE_LIMIT_RPM || '10', 10)
const CACHE_TTL_MS = parseInt(process.env.AI_CACHE_TTL || '3600', 10) * 1000 // Convert seconds to milliseconds
const RATE_LIMIT_WINDOW_MS = 60 * 1000 // 1 minute

/**
 * Handle POST requests to process journal entries
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<ReflectionResponse | ReflectionError>> {
  try {
    // Get client IP for rate limiting
    const clientIP = getClientIP(request)

    // Check rate limit
    const rateLimitResult = checkRateLimit(clientIP)
    if (!rateLimitResult.allowed) {
      return NextResponse.json<ReflectionError>(
        {
          error: 'rate_limit',
          message: 'Too many requests. Please try again later.',
          retryAfter: rateLimitResult.retryAfter,
        },
        { status: 429 }
      )
    }

    // Parse request body
    let body: ReflectionRequest
    try {
      body = await request.json()
    } catch (error) {
      return NextResponse.json<ReflectionError>(
        {
          error: 'validation',
          message: 'Invalid JSON in request body',
          details:
            error instanceof Error ? error.message : 'Unknown parsing error',
        },
        { status: 400 }
      )
    }

    // Validate request
    const validation = validateRequest(body)
    if (!validation.isValid) {
      return NextResponse.json<ReflectionError>(
        {
          error: 'validation',
          message: validation.error!,
        },
        { status: 400 }
      )
    }

    // Check cache
    const contentHash = generateContentHash(body.content)
    const cachedResponse = getCachedResponse(contentHash)
    if (cachedResponse) {
      return NextResponse.json<ReflectionResponse>(cachedResponse, {
        status: 200,
      })
    }

    // Process with OpenAI
    try {
      const config = getOpenAIConfig()
      const client = createOpenAIClient(config)
      const response = await processJournalEntry(client, config, body)

      // Cache the response
      setCachedResponse(contentHash, response)

      return NextResponse.json<ReflectionResponse>(response, { status: 200 })
    } catch (error) {
      console.error('OpenAI processing error:', error)

      // Handle specific OpenAI errors
      if (error instanceof Error) {
        // Content policy violation
        if (
          error.message.includes('content_filter') ||
          error.message.includes('policy')
        ) {
          return NextResponse.json<ReflectionError>(
            {
              error: 'content_policy',
              message:
                'Content violates usage policies. Please try with different content.',
            },
            { status: 400 }
          )
        }

        // Timeout
        if (
          error.message.includes('timeout') ||
          error.message.includes('TIMEOUT')
        ) {
          return NextResponse.json<ReflectionError>(
            {
              error: 'timeout',
              message: 'Request timed out. Please try again.',
              retryAfter: 30,
            },
            { status: 504 }
          )
        }

        // API errors (rate limit, quota exceeded, etc.)
        if (
          error.message.includes('rate') ||
          error.message.includes('quota') ||
          error.message.includes('billing')
        ) {
          return NextResponse.json<ReflectionError>(
            {
              error: 'api_error',
              message:
                'AI service temporarily unavailable. Please try again later.',
              retryAfter: 300,
            },
            { status: 503 }
          )
        }
      }

      // Generic error response
      return NextResponse.json<ReflectionError>(
        {
          error: 'internal_error',
          message: 'An unexpected error occurred. Please try again.',
          details:
            process.env.NODE_ENV === 'development'
              ? error?.toString()
              : undefined,
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('API route error:', error)

    return NextResponse.json<ReflectionError>(
      {
        error: 'internal_error',
        message: 'Internal server error',
        details:
          process.env.NODE_ENV === 'development'
            ? error?.toString()
            : undefined,
      },
      { status: 500 }
    )
  }
}

/**
 * Handle unsupported HTTP methods
 */
export async function GET(): Promise<NextResponse<ReflectionError>> {
  return NextResponse.json<ReflectionError>(
    {
      error: 'validation',
      message: 'Method not allowed. Use POST to process journal entries.',
    },
    { status: 405 }
  )
}

/**
 * Get client IP address for rate limiting
 */
function getClientIP(request: NextRequest): string {
  // Try various headers for IP address
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }

  const realIP = request.headers.get('x-real-ip')
  if (realIP) {
    return realIP
  }

  // Fallback to a default value
  return 'unknown'
}

/**
 * Check if request is within rate limits
 */
function checkRateLimit(clientIP: string): {
  allowed: boolean
  retryAfter?: number
} {
  const now = Date.now()
  const windowStart = now - RATE_LIMIT_WINDOW_MS

  // Get or create rate limit state for this IP
  let state = rateLimitStore.get(clientIP)
  if (!state) {
    state = { requests: [], lastReset: now }
    rateLimitStore.set(clientIP, state)
  }

  // Clean up old requests outside the window
  state.requests = state.requests.filter((timestamp) => timestamp > windowStart)

  // Check if within limit
  if (state.requests.length >= RATE_LIMIT_RPM) {
    const oldestRequest = Math.min(...state.requests)
    const retryAfter = Math.ceil(
      (oldestRequest + RATE_LIMIT_WINDOW_MS - now) / 1000
    )

    return { allowed: false, retryAfter }
  }

  // Add current request
  state.requests.push(now)
  rateLimitStore.set(clientIP, state)

  return { allowed: true }
}

/**
 * Validate request payload
 */
function validateRequest(body: unknown): { isValid: boolean; error?: string } {
  if (!body || typeof body !== 'object') {
    return { isValid: false, error: 'Request body must be a valid JSON object' }
  }

  const requestBody = body as Record<string, unknown>

  if (!requestBody.content) {
    return { isValid: false, error: 'Content field is required' }
  }

  // Validate journal content
  return validateJournalContent(requestBody.content as string)
}

/**
 * Get cached response if available and not expired
 */
function getCachedResponse(contentHash: string): ReflectionResponse | null {
  const entry = cache.get(contentHash)
  if (!entry) {
    return null
  }

  const now = Date.now()
  if (now - entry.createdAt > entry.ttl) {
    cache.delete(contentHash)
    return null
  }

  return entry.response
}

/**
 * Cache a response
 */
function setCachedResponse(
  contentHash: string,
  response: ReflectionResponse
): void {
  const entry: CacheEntry = {
    response,
    createdAt: Date.now(),
    ttl: CACHE_TTL_MS,
  }

  cache.set(contentHash, entry)

  // Simple cache cleanup - remove expired entries periodically
  if (cache.size > 1000) {
    // Prevent memory leaks
    const now = Date.now()
    for (const [key, value] of cache.entries()) {
      if (now - value.createdAt > value.ttl) {
        cache.delete(key)
      }
    }
  }
}

/**
 * Periodic cleanup for rate limiting store
 */
setInterval(() => {
  const now = Date.now()
  const windowStart = now - RATE_LIMIT_WINDOW_MS

  for (const [ip, state] of rateLimitStore.entries()) {
    state.requests = state.requests.filter(
      (timestamp) => timestamp > windowStart
    )

    // Remove empty entries
    if (
      state.requests.length === 0 &&
      now - state.lastReset > RATE_LIMIT_WINDOW_MS
    ) {
      rateLimitStore.delete(ip)
    }
  }
}, RATE_LIMIT_WINDOW_MS) // Clean up every minute
