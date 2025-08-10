/**
 * Rate Limiting Unit Tests for AI Reflection API Route
 *
 * Isolated tests for rate limiting functionality with controlled configuration
 */

import { NextRequest } from 'next/server'
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'

// Mock OpenAI to avoid actual API calls
vi.mock('@/lib/openai', () => ({
  getOpenAIConfig: vi.fn(() => ({
    apiKey: 'test-key',
    model: 'gpt-4-1106-preview',
    fallbackModel: 'gpt-3.5-turbo-1106',
    maxTokens: 500,
    temperature: 0.7,
    timeout: 5000,
  })),
  createOpenAIClient: vi.fn(() => ({})),
  processJournalEntry: vi.fn(async () => ({
    summary: 'Test summary',
    pattern: 'Test pattern',
    suggestion: 'Test suggestion',
    metadata: {
      model: 'gpt-4-1106-preview',
      processedAt: new Date().toISOString(),
      processingTimeMs: 100,
    },
  })),
  validateJournalContent: vi.fn(() => ({ isValid: true })),
  generateContentHash: vi.fn((content: string) => `hash-${content.length}`),
}))

// Mock constants with rate limiting enabled and low limits for testing
vi.mock('@/constants', () => ({
  AI_CONFIG: {
    RATE_LIMIT_ENABLED: true,
    RATE_LIMIT_RPM: 3, // Very low for testing
    CACHE_TTL_MS: 10000,
    RATE_LIMIT_WINDOW_MS: 60000, // 1 minute
    OPENAI_TIMEOUT_MS: 5000,
    OPENAI_API_KEY: 'test-key',
    OPENAI_MODEL: 'gpt-4-1106-preview',
    OPENAI_FALLBACK_MODEL: 'gpt-3.5-turbo-1106',
    OPENAI_MAX_TOKENS: 500,
    OPENAI_TEMPERATURE: 0.7,
  },
}))

describe('Rate Limiting Tests', () => {
  let POST: typeof import('../route').POST

  beforeEach(async () => {
    vi.clearAllMocks()
    process.env.OPENAI_API_KEY = 'test-api-key'
    vi.clearAllTimers()

    // Fresh import to reset internal state
    vi.resetModules()
    const routeModule = await import('../route')
    POST = routeModule.POST
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  const createRequest = (
    content = 'This is a valid test journal entry with sufficient content.',
    ip = '192.168.1.1'
  ) => {
    return new NextRequest('http://localhost:3000/api/reflect', {
      method: 'POST',
      body: JSON.stringify({ content }),
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': ip,
      },
    })
  }

  it('should allow requests within rate limit', async () => {
    const request = createRequest(
      'Test content for rate limit test',
      '10.0.0.1'
    )
    const response = await POST(request)

    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data).toHaveProperty('summary')
  })

  it('should enforce rate limit for same IP', async () => {
    const ip = '10.0.0.2'

    // Make requests up to the rate limit (3 requests)
    for (let i = 0; i < 3; i++) {
      const request = createRequest(`Test content ${i}`, ip)
      const response = await POST(request)
      expect(response.status).toBe(200)
    }

    // The 4th request should be rate limited
    const request = createRequest('Rate limited request', ip)
    const response = await POST(request)

    expect(response.status).toBe(429)
    const data = await response.json()
    expect(data.error).toBe('rate_limit')
    expect(data.message).toContain('Too many requests')
    expect(data).toHaveProperty('retryAfter')
  })

  it('should allow requests from different IPs', async () => {
    // Fill up rate limit for first IP
    for (let i = 0; i < 3; i++) {
      const request = createRequest(`Content ${i}`, '10.0.0.3')
      const response = await POST(request)
      expect(response.status).toBe(200)
    }

    // Request from different IP should still work
    const request = createRequest('Different IP request', '10.0.0.4')
    const response = await POST(request)
    expect(response.status).toBe(200)
  })

  it('should reset rate limit after time window', async () => {
    vi.useFakeTimers()
    const ip = '10.0.0.5'

    // Fill up rate limit
    for (let i = 0; i < 3; i++) {
      const request = createRequest(`Content ${i}`, ip)
      const response = await POST(request)
      expect(response.status).toBe(200)
    }

    // Next request should be rate limited
    let request = createRequest('Should be limited', ip)
    let response = await POST(request)
    expect(response.status).toBe(429)

    // Advance time past rate limit window
    vi.advanceTimersByTime(61000)

    // Need to create fresh POST instance after time advancement
    const freshRouteModule = await import('../route')

    // Request should now work again
    request = createRequest('Should work now', ip)
    response = await freshRouteModule.POST(request)
    expect(response.status).toBe(200)
  })

  it('should handle missing IP gracefully', async () => {
    const request = new NextRequest('http://localhost:3000/api/reflect', {
      method: 'POST',
      body: JSON.stringify({ content: 'Test content for missing IP' }),
      headers: { 'Content-Type': 'application/json' },
    })

    const response = await POST(request)
    expect(response.status).toBe(200) // Should work with fallback IP handling
  })

  it('should provide meaningful rate limit error responses', async () => {
    const ip = '10.0.0.6'

    // Fill rate limit
    for (let i = 0; i < 3; i++) {
      await POST(createRequest(`Content ${i}`, ip))
    }

    // Get rate limited response
    const response = await POST(createRequest('Rate limited', ip))
    const data = await response.json()

    expect(response.status).toBe(429)
    expect(data.error).toBe('rate_limit')
    expect(data.message).toContain('Too many requests')
    expect(typeof data.retryAfter).toBe('number')
    expect(data.retryAfter).toBeGreaterThan(0)
  })
})
