/**
 * AI API Caching Test Suite
 *
 * Tests caching behavior, response consistency, and performance
 * of the /api/reflect endpoint using vitest framework.
 */
import { describe, it, expect, beforeEach } from 'vitest'

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

const API_BASE = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

const testContent =
  "Today I learned something important about patience. While working on a difficult problem, I found myself getting frustrated when the solution didn't come immediately. I took a step back, breathed deeply, and approached it with fresh eyes. The breakthrough came when I stopped forcing it and allowed my mind to work naturally. This experience reminded me that sometimes the best approach is to trust the process and give things time to unfold."

/**
 * Rate-aware delay between caching test requests
 */
async function rateLimitDelay(baseDelay = 2500): Promise<void> {
  const jitter = Math.random() * 500
  await new Promise((resolve) => setTimeout(resolve, baseDelay + jitter))
}

// Helper function to make API requests with rate limiting awareness
async function makeApiRequest(
  content: string,
  retryCount = 0
): Promise<{ response: Response; data: unknown; duration: number }> {
  const start = Date.now()

  const response = await fetch(`${API_BASE}/api/reflect`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  })

  const data = await response.json()
  const duration = Date.now() - start

  // If rate limited and we haven't retried too many times, wait and retry
  if (response.status === 429 && retryCount < 1) {
    const retryAfter =
      ((data as Record<string, unknown>).retryAfter as number) || 10
    console.log(
      `Caching test rate limited, waiting ${retryAfter + 2}s before retry`
    )

    await new Promise((resolve) => setTimeout(resolve, (retryAfter + 2) * 1000))
    return makeApiRequest(content, retryCount + 1)
  }

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
  let isServerRunning = false

  beforeEach(async () => {
    // Check if server is running before each test
    if (!isServerRunning) {
      try {
        const healthCheck = await fetch(`${API_BASE}/api/reflect`, {
          method: 'GET',
        })
        isServerRunning = healthCheck.status === 405
        if (!isServerRunning) {
          throw new Error('Server not responding correctly')
        }
      } catch {
        throw new Error(
          'Server not accessible. Make sure to run `pnpm dev` first.'
        )
      }
    }
  })

  describe('Response Caching Behavior', () => {
    it('should return consistent responses for identical content', async () => {
      // Make first request
      const {
        response: response1,
        data: data1,
        duration: duration1,
      } = await makeApiRequest(testContent)

      // Handle rate limiting and service unavailable gracefully
      if (response1.status === 429) {
        console.warn('Rate limited during caching test, skipping')
        const errorData = data1 as Record<string, unknown>
        expect(errorData.message).toBeDefined()
        expect(errorData.retryAfter).toBeDefined()
        return
      }

      if (response1.status === 503) {
        console.warn('AI service unavailable during caching test, skipping')
        const errorData = data1 as Record<string, unknown>
        expect(errorData.message).toBeDefined()
        return
      }

      expect(response1.ok).toBe(true)
      expectValidApiResponse(data1)
      const response1Data = data1 as ApiResponse

      // Wait before second request to allow cache to settle
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Make second request with identical content
      const {
        response: response2,
        data: data2,
        duration: duration2,
      } = await makeApiRequest(testContent)

      // Handle rate limiting gracefully
      if (response2.status === 429) {
        console.warn(
          'Rate limited during second request, skipping cache comparison'
        )
        const errorData = data2 as Record<string, unknown>
        expect(errorData.message).toBeDefined()
        return
      }

      expect(response2.ok).toBe(true)
      expectValidApiResponse(data2)
      const response2Data = data2 as ApiResponse

      // Verify response consistency (exact matches indicate caching)
      expect(response1Data.summary).toBe(response2Data.summary)
      expect(response1Data.pattern).toBe(response2Data.pattern)
      expect(response1Data.suggestion).toBe(response2Data.suggestion)

      // Log performance metrics for debugging
      console.log(
        `First request: ${duration1}ms, Second request: ${duration2}ms`
      )
      const speedup = duration1 / duration2
      console.log(`Speed improvement: ${speedup.toFixed(1)}x`)

      // Performance expectation (cached responses should be significantly faster)
      if (duration2 < duration1 / 5) {
        console.log('✅ Caching performance confirmed')
      } else {
        console.log('⚠️ Caching performance unclear - may still be working')
      }
    }, 20000) // 20 second timeout

    it('should return different responses for different content (cache miss)', async () => {
      // Make request with original content
      const { response: response1, data: data1 } =
        await makeApiRequest(testContent)

      if (response1.status === 429 || response1.status === 503) {
        console.warn('Service unavailable for cache miss test, skipping')
        return
      }

      expect(response1.ok).toBe(true)
      expectValidApiResponse(data1)
      const response1Data = data1 as ApiResponse

      // Make request with modified content
      const modifiedContent =
        testContent + ' This is additional content to test cache miss.'
      const { response: response2, data: data2 } =
        await makeApiRequest(modifiedContent)

      if (response2.status === 429 || response2.status === 503) {
        console.warn('Service unavailable for modified content test, skipping')
        return
      }

      expect(response2.ok).toBe(true)
      expectValidApiResponse(data2)
      const response2Data = data2 as ApiResponse

      // Different content should produce different responses
      const isDifferent =
        response1Data.summary !== response2Data.summary ||
        response1Data.pattern !== response2Data.pattern ||
        response1Data.suggestion !== response2Data.suggestion

      expect(isDifferent).toBe(true)
    }, 15000) // 15 second timeout
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

        // Handle rate limiting and service unavailable gracefully
        if (response.status === 429) {
          console.warn(`Rate limited for ${test.name}, skipping test`)
          const errorData = data as Record<string, unknown>
          expect(errorData.message).toBeDefined()
          return
        }

        if (response.status === 503) {
          console.warn(`AI service unavailable for ${test.name}, skipping test`)
          const errorData = data as Record<string, unknown>
          expect(errorData.message).toBeDefined()
          return
        }

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
      }, 12000) // 12 second timeout per test
    })

    it('should handle multiple content types successfully when API is available', async () => {
      const results: ContentTestResult[] = []
      let rateLimitedCount = 0
      let serviceUnavailableCount = 0

      for (const test of contentTests) {
        try {
          const { response, data } = await makeApiRequest(test.content)

          if (response.status === 429) {
            rateLimitedCount++
            results.push({
              name: test.name,
              success: false,
              error: 'Rate limited',
            })
          } else if (response.status === 503) {
            serviceUnavailableCount++
            results.push({
              name: test.name,
              success: false,
              error: 'Service unavailable',
            })
          } else if (response.ok) {
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

        // Rate-aware delay between requests
        await rateLimitDelay()
      }

      const successfulResults = results.filter((r) => r.success)
      const failedResults = results.filter((r) => !r.success)

      // If all failures are due to rate limiting or service unavailable, skip success rate check
      if (rateLimitedCount + serviceUnavailableCount >= failedResults.length) {
        console.warn(
          'All failures due to rate limiting or service unavailable - content variation test results inconclusive'
        )
        expect(results.length).toBe(contentTests.length)
        return
      }

      // Otherwise, expect some successful results
      expect(successfulResults.length).toBeGreaterThan(0)

      // Log results for debugging
      const successRate = (successfulResults.length / results.length) * 100
      console.log(`Content variation success rate: ${successRate.toFixed(1)}%`)
      console.log(
        `Rate limited: ${rateLimitedCount}, Service unavailable: ${serviceUnavailableCount}`
      )
    }, 60000) // 60 second timeout for full content test suite
  })
})
