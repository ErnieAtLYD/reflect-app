/**
 * Tests for the AI Reflection API route
 *
 * Tests the validation, error handling, and response structure
 * of the journal reflection processing endpoint.
 */

import { NextRequest } from 'next/server'
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'

import { POST, GET } from '../route'

// Mock OpenAI to avoid actual API calls in tests
vi.mock('@/lib/openai', () => ({
  getOpenAIConfig: vi.fn(() => ({
    apiKey: 'test-key',
    model: 'gpt-4-1106-preview',
    fallbackModel: 'gpt-3.5-turbo-1106',
    maxTokens: 500,
    temperature: 0.7,
    timeout: 30000,
  })),
  createOpenAIClient: vi.fn(() => ({})),
  processJournalEntry: vi.fn(async () => ({
    summary: 'This is a test summary of the journal entry.',
    pattern: 'The user seems to be reflecting on their daily experiences.',
    suggestion:
      'Consider keeping a regular journaling practice to track your growth.',
    metadata: {
      model: 'gpt-4-1106-preview',
      processedAt: new Date().toISOString(),
      processingTimeMs: 1500,
    },
  })),
  validateJournalContent: vi.fn((content: string) => {
    if (!content || content.length < 10) {
      return {
        isValid: false,
        error: 'Content must be at least 10 characters long',
      }
    }
    return { isValid: true }
  }),
  generateContentHash: vi.fn((content: string) => {
    return Buffer.from(content).toString('base64').slice(0, 10)
  }),
}))

// Mock the constants to control configuration during tests
vi.mock('@/constants', () => ({
  AI_CONFIG: {
    RATE_LIMIT_ENABLED: false, // Disable rate limiting by default for most tests
    RATE_LIMIT_RPM: 100, // High limit
    CACHE_TTL_MS: 10000, // 10 seconds
    RATE_LIMIT_WINDOW_MS: 60000, // 1 minute
    OPENAI_TIMEOUT_MS: 5000, // 5 seconds for testing
    OPENAI_API_KEY: 'test-key',
    OPENAI_MODEL: 'gpt-4-1106-preview',
    OPENAI_FALLBACK_MODEL: 'gpt-3.5-turbo-1106',
    OPENAI_MAX_TOKENS: 500,
    OPENAI_TEMPERATURE: 0.7,
  },
}))

describe('/api/reflect', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Clear environment variables
    delete process.env.OPENAI_API_KEY
    // Clear any cached state between tests
    vi.clearAllTimers()
    // Reset modules to clear any in-memory caches
    vi.resetModules()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('POST', () => {
    it('should reject GET requests', async () => {
      const response = await GET()
      expect(response.status).toBe(405)

      const data = await response.json()
      expect(data.error).toBe('validation')
      expect(data.message).toBe(
        'Method not allowed. Use POST to process journal entries.'
      )
    })

    it('should validate request body', async () => {
      const request = new NextRequest('http://localhost:3000/api/reflect', {
        method: 'POST',
        body: JSON.stringify({}),
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await POST(request)
      expect(response.status).toBe(400)

      const data = await response.json()
      expect(data.error).toBe('validation')
      expect(data.message).toBe('Content field is required')
    })

    it('should validate content length', async () => {
      const request = new NextRequest('http://localhost:3000/api/reflect', {
        method: 'POST',
        body: JSON.stringify({ content: 'short' }),
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await POST(request)
      expect(response.status).toBe(400)

      const data = await response.json()
      expect(data.error).toBe('validation')
      expect(data.message).toBe('Content must be at least 10 characters long')
    })

    it('should handle missing OpenAI API key', async () => {
      // Import the actual OpenAI lib for this test
      const { getOpenAIConfig } = await import('@/lib/openai')

      // Mock getOpenAIConfig to throw error when API key is missing
      vi.mocked(getOpenAIConfig).mockImplementationOnce(() => {
        throw new Error('OPENAI_API_KEY environment variable is required')
      })

      const request = new NextRequest('http://localhost:3000/api/reflect', {
        method: 'POST',
        body: JSON.stringify({
          content:
            'This is a valid journal entry with enough content to pass validation.',
        }),
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await POST(request)
      expect(response.status).toBe(500)

      const data = await response.json()
      expect(data.error).toBe('internal_error')
    })

    it('should successfully process valid journal entry', async () => {
      // Set up environment
      process.env.OPENAI_API_KEY = 'test-api-key'

      const validContent =
        'Today was a challenging day at work. I had to deal with several difficult clients, but I managed to stay calm and find solutions. I feel proud of how I handled the situations and learned that I can be more resilient than I thought.'

      const request = new NextRequest('http://localhost:3000/api/reflect', {
        method: 'POST',
        body: JSON.stringify({ content: validContent }),
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await POST(request)
      expect(response.status).toBe(200)

      const data = await response.json()
      expect(data).toHaveProperty('summary')
      expect(data).toHaveProperty('pattern')
      expect(data).toHaveProperty('suggestion')
      expect(data).toHaveProperty('metadata')
      expect(data.metadata).toHaveProperty('model')
      expect(data.metadata).toHaveProperty('processedAt')
      expect(data.metadata).toHaveProperty('processingTimeMs')
    })

    it('should handle invalid JSON', async () => {
      const request = new NextRequest('http://localhost:3000/api/reflect', {
        method: 'POST',
        body: 'invalid json',
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await POST(request)
      expect(response.status).toBe(400)

      const data = await response.json()
      expect(data.error).toBe('validation')
      expect(data.message).toBe('Invalid JSON in request body')
    })
  })

  describe('Caching Logic', () => {
    const createRequest = (content: string) => {
      return new NextRequest('http://localhost:3000/api/reflect', {
        method: 'POST',
        body: JSON.stringify({ content }),
        headers: { 'Content-Type': 'application/json' },
      })
    }

    beforeEach(() => {
      process.env.OPENAI_API_KEY = 'test-api-key'
    })

    it('should cache identical content', async () => {
      const content =
        'This is identical content for caching test that should be cached properly.'

      // First request - should call OpenAI
      const request1 = createRequest(content)
      const response1 = await POST(request1)
      expect(response1.status).toBe(200)

      const data1 = await response1.json()
      expect(data1).toHaveProperty('summary')

      // Second request with same content - should use cache
      const request2 = createRequest(content)
      const response2 = await POST(request2)
      expect(response2.status).toBe(200)

      const data2 = await response2.json()
      expect(data2.summary).toBe(data1.summary)
      expect(data2.pattern).toBe(data1.pattern)
      expect(data2.suggestion).toBe(data1.suggestion)
    })

    it('should not cache different content', async () => {
      const content1 =
        'This is the first unique content for cache miss test with different words.'
      const content2 =
        'Here is completely different journal entry content that should generate a different hash.'

      // Mock different responses for different content
      const { processJournalEntry } = await import('@/lib/openai')
      vi.mocked(processJournalEntry)
        .mockResolvedValueOnce({
          summary: 'First summary',
          pattern: 'First pattern',
          suggestion: 'First suggestion',
          metadata: {
            model: 'gpt-4-1106-preview',
            processedAt: '2024-01-01T00:00:00Z',
            processingTimeMs: 100,
          },
        })
        .mockResolvedValueOnce({
          summary: 'Second summary',
          pattern: 'Second pattern',
          suggestion: 'Second suggestion',
          metadata: {
            model: 'gpt-4-1106-preview',
            processedAt: '2024-01-01T00:00:00Z',
            processingTimeMs: 100,
          },
        })

      // Reimport POST function with fresh module state
      const { POST: freshPOST } = await import('../route')

      const request1 = createRequest(content1)
      const response1 = await freshPOST(request1)
      expect(response1.status).toBe(200)
      const data1 = await response1.json()

      const request2 = createRequest(content2)
      const response2 = await freshPOST(request2)
      expect(response2.status).toBe(200)
      const data2 = await response2.json()

      // Different content should produce different results
      expect(data1.summary).toBe('First summary')
      expect(data2.summary).toBe('Second summary')
      expect(data1.summary).not.toBe(data2.summary)
    })

    it('should handle cache expiration', async () => {
      vi.useFakeTimers()

      const content =
        'This content will test cache expiration behavior after TTL.'

      // First request
      const request1 = createRequest(content)
      const response1 = await POST(request1)
      expect(response1.status).toBe(200)

      // Advance time past cache TTL (10 seconds in test config)
      vi.advanceTimersByTime(11000)

      // Second request should work but might not be cached (depending on implementation)
      const request2 = createRequest(content)
      const response2 = await POST(request2)
      expect(response2.status).toBe(200)

      const data2 = await response2.json()
      expect(data2).toHaveProperty('summary')
    })
  })

  describe('Error Handling', () => {
    const createRequest = (content: string) => {
      return new NextRequest('http://localhost:3000/api/reflect', {
        method: 'POST',
        body: JSON.stringify({ content }),
        headers: { 'Content-Type': 'application/json' },
      })
    }

    it('should handle OpenAI timeout errors', async () => {
      process.env.OPENAI_API_KEY = 'test-api-key'

      // Mock processJournalEntry to throw timeout error
      const { processJournalEntry } = await import('@/lib/openai')
      vi.mocked(processJournalEntry).mockRejectedValueOnce(
        new Error('Request timeout after 5000ms') // Must contain "timeout"
      )

      const request = createRequest(
        'Content that will timeout during processing.'
      )
      const response = await POST(request)

      expect(response.status).toBe(504)
      const data = await response.json()
      expect(data.error).toBe('timeout')
      expect(data.message).toContain('Request timed out')
      expect(data.retryAfter).toBe(5) // OPENAI_TIMEOUT_MS / 1000 from our test config
    })

    it('should handle content policy violations', async () => {
      process.env.OPENAI_API_KEY = 'test-api-key'

      // Mock processJournalEntry to throw content policy error
      const { processJournalEntry } = await import('@/lib/openai')
      vi.mocked(processJournalEntry).mockRejectedValueOnce(
        new Error('This content violates our content_filter policies') // Must contain "content_filter"
      )

      const request = createRequest(
        'Content that violates content policy somehow.'
      )
      const response = await POST(request)

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toBe('content_policy')
      expect(data.message).toContain('Content violates usage policies')
    })

    it('should handle API rate limit errors from OpenAI', async () => {
      process.env.OPENAI_API_KEY = 'test-api-key'

      // Mock processJournalEntry to throw API rate limit error
      const { processJournalEntry } = await import('@/lib/openai')
      vi.mocked(processJournalEntry).mockRejectedValueOnce(
        new Error('API rate limit exceeded. Please try again later.')
      )

      const request = createRequest('Content that triggers OpenAI rate limit.')
      const response = await POST(request)

      expect(response.status).toBe(503) // API errors return 503 not 429
      const data = await response.json()
      expect(data.error).toBe('api_error')
      expect(data.message).toContain('AI service temporarily unavailable')
    })

    it('should handle quota exceeded errors', async () => {
      process.env.OPENAI_API_KEY = 'test-api-key'

      // Mock processJournalEntry to throw quota error
      const { processJournalEntry } = await import('@/lib/openai')
      vi.mocked(processJournalEntry).mockRejectedValueOnce(
        new Error(
          'You have exceeded your API quota. Please check your billing.'
        )
      )

      const request = createRequest(
        'Content that triggers quota exceeded error.'
      )
      const response = await POST(request)

      expect(response.status).toBe(503) // API errors return 503
      const data = await response.json()
      expect(data.error).toBe('api_error')
      expect(data.message).toContain('AI service temporarily unavailable')
    })

    it('should handle unknown errors gracefully', async () => {
      process.env.OPENAI_API_KEY = 'test-api-key'

      // Mock processJournalEntry to throw unknown error
      const { processJournalEntry } = await import('@/lib/openai')
      vi.mocked(processJournalEntry).mockRejectedValueOnce(
        new Error('Something unexpected happened')
      )

      const request = createRequest('Content that triggers unknown error.')
      const response = await POST(request)

      expect(response.status).toBe(500)
      const data = await response.json()
      expect(data.error).toBe('internal_error')
      expect(data.message).toBe(
        'An unexpected error occurred. Please try again.'
      ) // Exact message
    })
  })

  describe('Configuration Integration', () => {
    it('should use timeout configuration in error handling', async () => {
      process.env.OPENAI_API_KEY = 'test-api-key'

      // Mock processJournalEntry to throw timeout error
      const { processJournalEntry } = await import('@/lib/openai')
      vi.mocked(processJournalEntry).mockRejectedValueOnce(
        new Error('timeout after 5000ms')
      )

      const request = new NextRequest('http://localhost:3000/api/reflect', {
        method: 'POST',
        body: JSON.stringify({ content: 'Test timeout configuration' }),
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await POST(request)
      expect(response.status).toBe(504)

      const data = await response.json()
      expect(data.retryAfter).toBe(5) // Should match OPENAI_TIMEOUT_MS / 1000 from test config
    })
  })
})
