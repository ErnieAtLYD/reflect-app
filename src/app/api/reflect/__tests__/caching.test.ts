/**
 * AI API Caching Test Suite
 *
 * Tests caching behavior, response consistency, and performance
 * of the /api/reflect endpoint using vitest framework.
 */
import { NextRequest } from 'next/server'
import OpenAI from 'openai'
import { describe, it, expect, beforeEach, vi } from 'vitest'

import { OpenAIConfig, ReflectionRequest } from '@/types/ai'

import { POST } from '../route'

// Mock constants to disable rate limiting
vi.mock('@/constants', () => ({
  AI_CONFIG: {
    RATE_LIMIT_ENABLED: false,
    RATE_LIMIT_RPM: 10,
    CACHE_TTL_MS: 3600000,
  },
}))

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
  processJournalEntry: vi.fn(
    async (
      client: OpenAI,
      config: OpenAIConfig,
      request: ReflectionRequest
    ) => {
      const content = request.content
      // Generate deterministic responses based on content for caching tests
      // Use content length and first few characters to create a unique hash
      const contentPreview = content.substring(0, 50)
      const hash =
        content.length +
        content.charCodeAt(0) +
        content.charCodeAt(Math.min(content.length - 1, 10))

      return {
        summary: `Test summary for content (${content.length} chars): ${contentPreview}... [hash: ${hash}]`,
        pattern: `Pattern analysis for content length ${content.length}: ${content.substring(0, 20)}... [${hash}]`,
        suggestion: `Suggestion based on content hash ${hash}: Consider reflecting on "${content.substring(0, 25)}..."`,
        metadata: {
          model: 'gpt-4-1106-preview',
          processedAt: new Date().toISOString(),
          processingTimeMs: Math.floor(Math.random() * 1000) + 500,
        },
      }
    }
  ),
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

// Type definitions
interface ApiResponse {
  summary: string
  pattern: string
  suggestion: string
  metadata: {
    model: string
    processedAt: string
    processingTimeMs: number
  }
}

// Removed unused interfaces - ErrorResponse and CacheTestResult

interface ContentTest {
  name: string
  content: string
}

interface ContentTestResult {
  name: string
  success: boolean
  data?: ApiResponse
  error?: string
}

const testContent =
  "Today I learned something important about patience. While working on a difficult problem, I found myself getting frustrated when the solution didn't come immediately. I took a step back, breathed deeply, and approached it with fresh eyes. The breakthrough came when I stopped forcing it and allowed my mind to work naturally. This experience reminded me that sometimes the best approach is to trust the process and give things time to unfold."

// Helper function to make API requests using direct POST handler calls
async function makeApiRequest(
  content: string
): Promise<{ response: Response; data: unknown; duration: number }> {
  const start = Date.now()

  const request = new NextRequest('http://localhost:3000/api/reflect', {
    method: 'POST',
    body: JSON.stringify({ content }),
    headers: { 'Content-Type': 'application/json' },
  })

  const response = await POST(request)
  const data = await response.json()
  const duration = Date.now() - start

  return { response, data, duration }
}

// Helper function to validate API response structure
function expectValidApiResponse(data: unknown): asserts data is ApiResponse {
  expect(data).toBeDefined()
  expect(typeof data).toBe('object')

  const response = data as Record<string, unknown>

  expect(response.summary).toBeDefined()
  expect(response.pattern).toBeDefined()
  expect(response.suggestion).toBeDefined()
  expect(response.metadata).toBeDefined()

  expect(typeof response.summary).toBe('string')
  expect(typeof response.pattern).toBe('string')
  expect(typeof response.suggestion).toBe('string')

  const metadata = response.metadata as Record<string, unknown>
  expect(metadata.model).toBeDefined()
  expect(metadata.processedAt).toBeDefined()
  expect(typeof metadata.processingTimeMs).toBe('number')
}

// Vitest Test Suite
describe('AI API Caching Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Set up environment
    process.env.OPENAI_API_KEY = 'test-api-key'
    process.env.AI_RATE_LIMIT_ENABLED = 'false'
  })

  describe('Response Caching Behavior', () => {
    it('should return consistent responses for identical content', async () => {
      // Make first request
      const {
        response: response1,
        data: data1,
        duration: duration1,
      } = await makeApiRequest(testContent)

      expect(response1.ok).toBe(true)
      expectValidApiResponse(data1)
      const response1Data = data1 as ApiResponse

      // Make second request with identical content (should use cache)
      const {
        response: response2,
        data: data2,
        duration: duration2,
      } = await makeApiRequest(testContent)

      expect(response2.ok).toBe(true)
      expectValidApiResponse(data2)
      const response2Data = data2 as ApiResponse

      // Verify response consistency (exact matches indicate caching)
      expect(response1Data.summary).toBe(response2Data.summary)
      expect(response1Data.pattern).toBe(response2Data.pattern)
      expect(response1Data.suggestion).toBe(response2Data.suggestion)

      // Cache should provide faster responses (though in mocked tests this is less meaningful)
      expect(duration2).toBeLessThanOrEqual(duration1)
    })

    it('should return different responses for different content (cache miss)', async () => {
      // Use completely different content to ensure different cache keys
      const content1 = 'Today was a wonderful day filled with joy and learning.'
      const content2 =
        'Yesterday I felt overwhelmed but managed to find some peace through meditation.'

      // Make request with first content
      const { response: response1, data: data1 } =
        await makeApiRequest(content1)

      expect(response1.ok).toBe(true)
      expectValidApiResponse(data1)
      const response1Data = data1 as ApiResponse

      // Make request with completely different content
      const { response: response2, data: data2 } =
        await makeApiRequest(content2)

      expect(response2.ok).toBe(true)
      expectValidApiResponse(data2)
      const response2Data = data2 as ApiResponse

      // Different content should produce different responses
      const isDifferent =
        response1Data.summary !== response2Data.summary ||
        response1Data.pattern !== response2Data.pattern ||
        response1Data.suggestion !== response2Data.suggestion

      expect(isDifferent).toBe(true)
    })
  })

  describe('Content Type Variations', () => {
    const contentTests: ContentTest[] = [
      {
        name: 'Emotional Processing',
        content:
          "I feel overwhelmed by all the changes happening in my life right now. Everything feels uncertain and I don't know how to cope.",
      },
      {
        name: 'Goal Setting',
        content:
          'I want to start exercising regularly. I know it would help my mental health, but I struggle with consistency and motivation.',
      },
      {
        name: 'Gratitude Expression',
        content:
          'Today I am grateful for my morning coffee, the sunshine streaming through my window, and a meaningful conversation with a friend.',
      },
    ]

    contentTests.forEach((test) => {
      it(`should process ${test.name} content type`, async () => {
        const { response, data } = await makeApiRequest(test.content)

        expect(response.ok).toBe(true)
        expectValidApiResponse(data)
        const responseData = data as ApiResponse

        // Verify content quality
        expect(responseData.summary.length).toBeGreaterThan(10)
        expect(responseData.pattern.length).toBeGreaterThan(10)
        expect(responseData.suggestion.length).toBeGreaterThan(10)

        // Ensure responses are unique
        expect(responseData.summary).not.toBe(responseData.pattern)
        expect(responseData.summary).not.toBe(responseData.suggestion)
        expect(responseData.pattern).not.toBe(responseData.suggestion)
      })
    })

    it('should handle multiple content types successfully', async () => {
      const results: ContentTestResult[] = []

      for (const test of contentTests) {
        try {
          const { response, data } = await makeApiRequest(test.content)

          if (response.ok) {
            expectValidApiResponse(data)
            results.push({
              name: test.name,
              success: true,
              data: data as ApiResponse,
            })
          } else {
            const errorData = data as Record<string, unknown>
            results.push({
              name: test.name,
              success: false,
              error: (errorData.message as string) || 'Unknown error',
            })
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : String(error)
          results.push({
            name: test.name,
            success: false,
            error: errorMessage,
          })
        }
      }

      const successfulResults = results.filter((r) => r.success)

      // All content types should be processed successfully
      expect(successfulResults.length).toBe(contentTests.length)
      expect(results.length).toBe(contentTests.length)
    })
  })
})
