import { NextRequest, NextResponse } from 'next/server'

import { createFeedback, FeedbackStorageError } from '@/lib/feedback-storage'
import type {
  CreateFeedbackRequest,
  CreateFeedbackResponse,
} from '@/types/database'

// Simple rate limiting using Map (in-memory)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT_WINDOW_MS = 60 * 1000 // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 5 // 5 requests per minute per IP

function getRateLimitKey(ip: string): string {
  return `feedback:${ip}`
}

function checkRateLimit(ip: string): boolean {
  const key = getRateLimitKey(ip)
  const now = Date.now()
  const windowStart = now - RATE_LIMIT_WINDOW_MS

  // Clean up old entries
  for (const [rateLimitKey, data] of rateLimitMap.entries()) {
    if (data.resetTime < windowStart) {
      rateLimitMap.delete(rateLimitKey)
    }
  }

  // Check current IP
  const current = rateLimitMap.get(key)
  if (!current) {
    rateLimitMap.set(key, { count: 1, resetTime: now })
    return true
  }

  if (current.resetTime < windowStart) {
    rateLimitMap.set(key, { count: 1, resetTime: now })
    return true
  }

  if (current.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false
  }

  current.count++
  return true
}

function getClientIP(request: NextRequest): string {
  // Try various headers to get the real IP
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const cfConnectingIp = request.headers.get('cf-connecting-ip')

  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  if (realIp) {
    return realIp.trim()
  }
  if (cfConnectingIp) {
    return cfConnectingIp.trim()
  }

  // NextRequest doesn't have ip property, use a fallback
  return 'unknown'
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Get client IP for rate limiting
    const clientIP = getClientIP(request)

    // Check rate limit
    if (!checkRateLimit(clientIP)) {
      const response: CreateFeedbackResponse = {
        success: false,
        error: 'Too many requests. Please try again later.',
      }
      return NextResponse.json(response, { status: 429 })
    }

    // Parse request body
    let body: unknown
    try {
      body = await request.json()
    } catch {
      const response: CreateFeedbackResponse = {
        success: false,
        error: 'Invalid JSON in request body.',
      }
      return NextResponse.json(response, { status: 400 })
    }

    // Get user agent from request headers (using request directly)
    const userAgent = request.headers.get('user-agent')

    // Add user agent to request data
    const feedbackData: CreateFeedbackRequest = {
      ...(body as CreateFeedbackRequest),
      user_agent: userAgent || undefined,
    }

    // Create feedback
    const result = await createFeedback(feedbackData)

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('Error in feedback API route:', error)

    if (error instanceof FeedbackStorageError) {
      const response: CreateFeedbackResponse = {
        success: false,
        error: error.message,
      }
      return NextResponse.json(response, { status: error.statusCode })
    }

    // Generic error response
    const response: CreateFeedbackResponse = {
      success: false,
      error: 'Internal server error. Please try again later.',
    }
    return NextResponse.json(response, { status: 500 })
  }
}

// Handle unsupported methods
export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to submit feedback.' },
    { status: 405 }
  )
}

export async function PUT(): Promise<NextResponse> {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to submit feedback.' },
    { status: 405 }
  )
}

export async function DELETE(): Promise<NextResponse> {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to submit feedback.' },
    { status: 405 }
  )
}
