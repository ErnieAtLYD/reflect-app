/**
 * Tests for the AI Reflection API route
 *
 * Tests the validation, error handling, and response structure
 * of the journal reflection processing endpoint.
 */

import { NextRequest } from 'next/server'
import { describe, it, expect, beforeEach, vi } from 'vitest'

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

describe('/api/reflect', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Clear environment variables
    delete process.env.OPENAI_API_KEY
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
})
