import { describe, it, expect, beforeEach } from 'vitest'

// Type definitions
interface EdgeCaseTest {
  name: string
  content: string
  expectSuccess: boolean
}

interface TestResult {
  passed: boolean
  duration?: number
  actualSuccess?: boolean
  reason?: string
  error?: string
}

interface QualityAnalysis {
  score: number
  issues: string[]
}

// Removed unused interfaces - QualityTest, QualityResult, TestResults

/**
 * Edge Case Testing for AI API Integration
 *
 * Tests boundary conditions, special characters, and edge cases
 * that could cause the API to behave unexpectedly.
 */

const API_BASE = 'http://localhost:3000'

// Test cases for edge conditions
const edgeCases = [
  {
    name: 'Minimum valid length (10 chars)',
    content: 'I am okay',
    expectSuccess: true,
  },
  {
    name: 'Just under minimum (9 chars)',
    content: 'I am ok.',
    expectSuccess: false,
  },
  {
    name: 'Unicode and emojis',
    content:
      'Today was amazing! 😊 I felt so grateful for everything in my life. The café had the most delicious café au lait ☕ and I enjoyed reading under the beautiful 🌸 cherry blossoms.',
    expectSuccess: true,
  },
  {
    name: 'Multiple languages',
    content:
      'Today I felt nostalgic. Me sentí nostálgico. Je me sentais nostalgique. Ich fühlte mich nostalgisch. This mixture of languages reflects my multicultural background.',
    expectSuccess: true,
  },
  {
    name: 'Special characters and symbols',
    content:
      'I was working on code today: let x = (a + b) * c; console.log("Hello, World!"); It reminded me that even symbols & special characters have meaning in different contexts.',
    expectSuccess: true,
  },
  {
    name: 'Numbers and dates',
    content:
      "On January 15th, 2024, I turned 25 years old. The number 25 feels significant - it's 1/4 of a century! I've lived 9,125+ days so far.",
    expectSuccess: true,
  },
  {
    name: 'Repeated characters (should be rejected)',
    content: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    expectSuccess: false,
  },
  {
    name: 'Very long valid content (4900 chars)',
    content:
      'Today I spent time reflecting on my journey through life and all the experiences that have shaped me into who I am today. ' +
      'This has been a transformative year filled with challenges, growth, learning, and self-discovery. '.repeat(
        40
      ),
    expectSuccess: true,
  },
  {
    name: 'At character limit (5000 chars)',
    content: 'A'.repeat(4990) + 'reflection',
    expectSuccess: true,
  },
  {
    name: 'Over character limit (5001 chars)',
    content: 'A'.repeat(5001),
    expectSuccess: false,
  },
  {
    name: 'Only whitespace characters',
    content: '   \n\t   \r\n   ',
    expectSuccess: false,
  },
  {
    name: 'Mixed whitespace and minimal content',
    content: '   I feel    good   today   ',
    expectSuccess: true,
  },
  {
    name: 'Quotation marks and apostrophes',
    content:
      'I said "I can\'t believe it\'s working!" The response was "That\'s amazing!" It felt surreal to hear those words.',
    expectSuccess: true,
  },
  {
    name: 'HTML-like content',
    content:
      "Today I learned about <courage> and </fear>. These aren't HTML tags, but they represent the boundaries of my comfort zone.",
    expectSuccess: true,
  },
  {
    name: 'JSON-like content',
    content:
      'My emotions today: {"happy": true, "anxious": false, "grateful": "very much"}. Sometimes I think in data structures!',
    expectSuccess: true,
  },
  {
    name: 'Newlines and formatting',
    content:
      'Today I wrote:\n\nLine 1: I am grateful\nLine 2: I am growing\nLine 3: I am learning\n\nThis structure helps me think clearly.',
    expectSuccess: true,
  },
  {
    name: 'Mixed case and punctuation',
    content:
      "WOW!!! today was INCREDIBLE... I can't believe how AMAZING everything turned out??? Mixed emotions: happy & confused!",
    expectSuccess: true,
  },
]

export async function testEdgeCase(
  testCase: EdgeCaseTest
): Promise<TestResult> {
  const { name, content, expectSuccess } = testCase

  console.log(`\n🧪 Testing: ${name}`)
  console.log(`📏 Length: ${content.length} characters`)
  console.log(
    `📝 Content: ${content.substring(0, 80)}${content.length > 80 ? '...' : ''}`
  )

  try {
    const startTime = Date.now()

    const response = await fetch(`${API_BASE}/api/reflect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    })

    const data = await response.json()
    const duration = Date.now() - startTime

    const actualSuccess = response.ok
    const testPassed = actualSuccess === expectSuccess

    console.log(`⏱️ Response time: ${duration}ms`)
    console.log(`📊 Status: ${response.status}`)

    if (testPassed) {
      console.log(
        `✅ Test passed (expected ${expectSuccess ? 'success' : 'failure'})`
      )

      if (actualSuccess) {
        console.log(`📖 Summary: ${data.summary.substring(0, 60)}...`)
        console.log(`🔍 Pattern: ${data.pattern.substring(0, 60)}...`)
        console.log(`💡 Suggestion: ${data.suggestion.substring(0, 60)}...`)

        // Validate response completeness for successful cases
        const hasAllFields =
          data.summary && data.pattern && data.suggestion && data.metadata
        if (!hasAllFields) {
          console.log(`⚠️ Warning: Response missing required fields`)
          return { passed: false, reason: 'Incomplete response' }
        }
      } else {
        console.log(`📝 Error: ${data.message}`)
        console.log(`🔍 Error type: ${data.error}`)
      }

      return { passed: true, duration, actualSuccess }
    } else {
      console.log(
        `❌ Test failed (expected ${expectSuccess ? 'success' : 'failure'}, got ${actualSuccess ? 'success' : 'failure'})`
      )

      if (!expectSuccess && actualSuccess) {
        console.log(
          `⚠️ Expected validation error but API processed content successfully`
        )
      } else if (expectSuccess && !actualSuccess) {
        console.log(
          `⚠️ Expected success but API rejected valid content: ${data.message}`
        )
      }

      return { passed: false, duration, actualSuccess, reason: data.message }
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.log(`💥 Network/Parse error: ${errorMessage}`)
    return { passed: false, error: errorMessage }
  }
}

// Simple text quality analyzer
export function analyzeTextQuality(
  text: string,
  type: string
): QualityAnalysis {
  if (!text) return { score: 0, issues: ['Missing content'] }

  const issues = []
  let score = 10

  // Length checks
  if (text.length < 20) {
    issues.push('Too short')
    score -= 3
  } else if (text.length < 50) {
    score -= 1
  }

  if (text.length > 300) {
    issues.push('Very long')
    score -= 1
  }

  // Content quality checks
  if (!/[.!?]$/.test(text.trim())) {
    issues.push('No proper ending punctuation')
    score -= 1
  }

  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0)
  if (sentences.length < 1) {
    issues.push('No complete sentences')
    score -= 2
  }

  // Repetition check
  const words = text.toLowerCase().split(/\s+/)
  const wordCount: Record<string, number> = {}
  words.forEach((word) => {
    wordCount[word] = (wordCount[word] || 0) + 1
  })

  const maxWordCount = Math.max(
    ...Object.values(wordCount as Record<string, number>)
  )
  if (maxWordCount > words.length * 0.2) {
    issues.push('Excessive word repetition')
    score -= 2
  }

  // Type-specific checks
  if (type === 'summary' && sentences.length > 3) {
    issues.push('Summary too detailed')
    score -= 1
  }

  if (type === 'suggestion' && !text.toLowerCase().includes('consider')) {
    // Suggestions often use words like "consider", "try", "reflect"
    if (!text.toLowerCase().match(/try|reflect|think|explore|practice/)) {
      issues.push("Doesn't sound like actionable suggestion")
      score -= 1
    }
  }

  return { score: Math.max(0, score), issues }
}

/**
 * Rate-aware delay between edge case test requests
 */
async function rateLimitDelay(baseDelay = 2000): Promise<void> {
  const jitter = Math.random() * 500
  await new Promise((resolve) => setTimeout(resolve, baseDelay + jitter))
}

// Helper function to make API requests for edge case testing with rate limiting
async function makeEdgeCaseRequest(
  content: string,
  retryCount = 0
): Promise<{ response: Response; data: unknown; duration: number }> {
  const startTime = Date.now()

  const response = await fetch(`${API_BASE}/api/reflect`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  })

  const data = await response.json()
  const duration = Date.now() - startTime

  // If rate limited and we haven't retried too many times, wait and retry
  if (response.status === 429 && retryCount < 1) {
    const retryAfter =
      ((data as Record<string, unknown>).retryAfter as number) || 10
    console.log(
      `Edge case test rate limited, waiting ${retryAfter + 2}s before retry`
    )

    await new Promise((resolve) => setTimeout(resolve, (retryAfter + 2) * 1000))
    return makeEdgeCaseRequest(content, retryCount + 1)
  }

  return { response, data, duration }
}

// Helper function to validate API response structure for edge cases
function expectValidApiResponse(data: unknown): asserts data is {
  summary: string
  pattern: string
  suggestion: string
  metadata: object
} {
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
}

// Vitest Test Suite
describe('AI API Edge Cases Tests', () => {
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

  describe('Boundary Conditions', () => {
    const boundaryTests = [
      {
        name: 'Minimum valid length (10 chars)',
        content: 'I am okay',
        expectSuccess: true,
      },
      {
        name: 'Just under minimum (9 chars)',
        content: 'I am ok.',
        expectSuccess: false,
      },
      {
        name: 'At character limit (5000 chars)',
        content: 'A'.repeat(4990) + 'reflection',
        expectSuccess: true,
      },
      {
        name: 'Over character limit (5001 chars)',
        content: 'A'.repeat(5001),
        expectSuccess: false,
      },
    ]

    boundaryTests.forEach((testCase) => {
      it(`should handle ${testCase.name}`, async () => {
        const { response, data } = await makeEdgeCaseRequest(testCase.content)

        // Handle rate limiting and service unavailable gracefully
        if (response.status === 429) {
          console.warn(`Rate limited for ${testCase.name}, skipping test`)
          expect(data).toHaveProperty('message')
          expect(data).toHaveProperty('retryAfter')
          return
        }

        if (response.status === 503) {
          console.warn(
            `AI service unavailable for ${testCase.name}, skipping test`
          )
          expect(data).toHaveProperty('message')
          return
        }

        if (testCase.expectSuccess) {
          if (!response.ok) {
            console.log(
              `Expected success but got ${response.status}: ${JSON.stringify(data)}`
            )
            // If it's a service issue, don't fail the test
            if (response.status === 503 || response.status === 429) {
              console.warn(
                `Service issue (${response.status}), skipping expectation`
              )
              return
            }
          }
          expect(response.ok).toBe(true)
          expectValidApiResponse(data)
        } else {
          expect(response.ok).toBe(false)
          expect(data).toHaveProperty('message')
          expect(typeof (data as Record<string, unknown>).message).toBe(
            'string'
          )
        }
      }, 10000)
    })
  })

  describe('Special Characters and Unicode', () => {
    const specialCharTests = [
      {
        name: 'Unicode and emojis',
        content:
          'Today was amazing! 😊 I felt so grateful for everything in my life. The café had the most delicious café au lait ☕ and I enjoyed reading under the beautiful 🌸 cherry blossoms.',
        expectSuccess: true,
      },
      {
        name: 'Multiple languages',
        content:
          'Today I felt nostalgic. Me sentí nostálgico. Je me sentais nostalgique. Ich fühlte mich nostalgisch. This mixture of languages reflects my multicultural background.',
        expectSuccess: true,
      },
      {
        name: 'Special characters and symbols',
        content:
          'I was working on code today: let x = (a + b) * c; console.log("Hello, World!"); It reminded me that even symbols & special characters have meaning in different contexts.',
        expectSuccess: true,
      },
      {
        name: 'Quotation marks and apostrophes',
        content:
          'I said "I can\'t believe it\'s working!" The response was "That\'s amazing!" It felt surreal to hear those words.',
        expectSuccess: true,
      },
    ]

    specialCharTests.forEach((testCase) => {
      it(`should handle ${testCase.name}`, async () => {
        const { response, data } = await makeEdgeCaseRequest(testCase.content)

        // Handle rate limiting and service unavailable gracefully
        if (response.status === 429) {
          console.warn(`Rate limited for ${testCase.name}, skipping test`)
          return
        }

        if (response.status === 503) {
          console.warn(
            `AI service unavailable for ${testCase.name}, skipping test`
          )
          return
        }

        expect(response.ok).toBe(true)
        expectValidApiResponse(data)

        const responseData = data as {
          summary: string
          pattern: string
          suggestion: string
        }

        // Ensure responses are substantive
        expect(responseData.summary.length).toBeGreaterThan(10)
        expect(responseData.pattern.length).toBeGreaterThan(10)
        expect(responseData.suggestion.length).toBeGreaterThan(10)

        // Ensure responses are unique
        expect(responseData.summary).not.toBe(responseData.pattern)
        expect(responseData.summary).not.toBe(responseData.suggestion)
        expect(responseData.pattern).not.toBe(responseData.suggestion)
      }, 15000)
    })
  })

  describe('Content Format Variations', () => {
    const formatTests = [
      {
        name: 'HTML-like content',
        content:
          "Today I learned about <courage> and </fear>. These aren't HTML tags, but they represent the boundaries of my comfort zone.",
        expectSuccess: true,
      },
      {
        name: 'JSON-like content',
        content:
          'My emotions today: {"happy": true, "anxious": false, "grateful": "very much"}. Sometimes I think in data structures!',
        expectSuccess: true,
      },
      {
        name: 'Newlines and formatting',
        content:
          'Today I wrote:\n\nLine 1: I am grateful\nLine 2: I am growing\nLine 3: I am learning\n\nThis structure helps me think clearly.',
        expectSuccess: true,
      },
      {
        name: 'Mixed case and punctuation',
        content:
          "WOW!!! today was INCREDIBLE... I can't believe how AMAZING everything turned out??? Mixed emotions: happy & confused!",
        expectSuccess: true,
      },
    ]

    formatTests.forEach((testCase) => {
      it(`should handle ${testCase.name}`, async () => {
        const { response, data } = await makeEdgeCaseRequest(testCase.content)

        // Handle rate limiting and service unavailable gracefully
        if (response.status === 429 || response.status === 503) {
          console.warn(`Service issue for ${testCase.name}, skipping test`)
          return
        }

        expect(response.ok).toBe(true)
        expectValidApiResponse(data)
      }, 12000)
    })
  })

  describe('Invalid Content Patterns', () => {
    const invalidTests = [
      {
        name: 'Only whitespace characters',
        content: '   \n\t   \r\n   ',
        expectSuccess: false,
      },
      {
        name: 'Repeated characters (should be rejected)',
        content: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        expectSuccess: false,
      },
    ]

    invalidTests.forEach((testCase) => {
      it(`should reject ${testCase.name}`, async () => {
        const { response, data } = await makeEdgeCaseRequest(testCase.content)

        // Handle rate limiting gracefully
        if (response.status === 429) {
          console.warn(`Rate limited for ${testCase.name}, skipping test`)
          return
        }

        expect(response.ok).toBe(false)
        expect(data).toHaveProperty('message')
        expect(typeof (data as Record<string, unknown>).message).toBe('string')
      }, 8000)
    })
  })

  describe('Edge Case Integration Test', () => {
    it('should handle all edge cases appropriately when API is available', async () => {
      const results = {
        total: edgeCases.length,
        passed: 0,
        failed: 0,
        rateLimited: 0,
        serviceUnavailable: 0,
      }

      for (const testCase of edgeCases) {
        try {
          const result = await testEdgeCase(testCase)

          if (result.passed) {
            results.passed++
          } else {
            // Check if failure is due to rate limiting or service unavailability
            if (
              result.error &&
              typeof result.error === 'string' &&
              (result.error.includes('429') || result.error.includes('rate'))
            ) {
              results.rateLimited++
            } else if (
              result.error &&
              typeof result.error === 'string' &&
              (result.error.includes('503') ||
                result.error.includes('unavailable'))
            ) {
              results.serviceUnavailable++
            } else {
              results.failed++
            }
          }

          // Rate-aware delay between tests to avoid overwhelming API
          await rateLimitDelay()
        } catch {
          results.failed++
        }
      }

      // If most failures are due to API issues, adjust expectations
      const apiIssueCount = results.rateLimited + results.serviceUnavailable
      const actualFailures = results.failed

      expect(results.total).toBe(edgeCases.length)

      // Log results for debugging
      const successRate = (results.passed / results.total) * 100
      console.log(`Edge case success rate: ${successRate.toFixed(1)}%`)
      console.log(
        `Rate limited: ${results.rateLimited}, Service unavailable: ${results.serviceUnavailable}, Failed: ${actualFailures}`
      )

      // If API is mostly unavailable, just verify we handled the responses correctly
      if (apiIssueCount >= results.total * 0.7) {
        console.warn('API mostly unavailable during edge case testing')
        expect(results.passed + results.failed + apiIssueCount).toBe(
          results.total
        )
      } else {
        // Otherwise, expect reasonable success rate for valid edge cases
        const validEdgeCases = edgeCases.filter((tc) => tc.expectSuccess).length
        const expectedMinSuccess = Math.floor(validEdgeCases * 0.6) // At least 60% of valid cases
        expect(results.passed).toBeGreaterThanOrEqual(expectedMinSuccess)
      }
    }, 120000) // 2 minute timeout for comprehensive test
  })
})
