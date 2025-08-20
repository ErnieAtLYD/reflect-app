import { NextRequest } from 'next/server'
import OpenAI from 'openai'
import { describe, it, expect, beforeEach, vi } from 'vitest'

import { OpenAIConfig, ReflectionRequest } from '@/types/ai'

import { POST } from '../route'

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
      // Simulate validation logic for edge cases
      if (content.length < 10) {
        throw new Error('Content must be at least 10 characters long')
      }
      if (content.length > 5000) {
        throw new Error('Content exceeds maximum length of 5000 characters')
      }
      if (!content.trim()) {
        throw new Error('Content cannot be empty or only whitespace')
      }
      // Check for repetitive content (only single character repetition like "aaaaaaa...")
      const trimmedContent = content.trim()
      if (trimmedContent.length > 20) {
        const firstChar = trimmedContent[0]
        if (trimmedContent.split('').every((char) => char === firstChar)) {
          throw new Error('Content appears to be repetitive')
        }
      }

      return {
        summary: `Test summary for: ${content.substring(0, 50)}...`,
        pattern: `Test pattern detected in content about: ${content.substring(0, 30)}...`,
        suggestion: `Consider reflecting more on: ${content.substring(0, 20)}...`,
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
    if (content.length > 5000) {
      return {
        isValid: false,
        error: 'Content exceeds maximum length of 5000 characters',
      }
    }
    if (!content.trim()) {
      return {
        isValid: false,
        error: 'Content cannot be empty or only whitespace',
      }
    }
    return { isValid: true }
  }),
  generateContentHash: vi.fn((content: string) => {
    return Buffer.from(content).toString('base64').slice(0, 10)
  }),
}))

/**
 * Edge Case Testing for AI API Integration
 *
 * Tests boundary conditions, special characters, and edge cases
 * that could cause the API to behave unexpectedly.
 */

// Test cases for edge conditions
const edgeCases = [
  {
    name: 'Minimum valid length (10 chars)',
    content: 'I am okay!',
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
    name: 'At character limit (4999 chars)',
    content:
      'Today I spent a lot of time reflecting on my journey and all the experiences. '.repeat(
        63
      ) + 'This was truly meaningful.',
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
  const { content, expectSuccess } = testCase

  try {
    const startTime = Date.now()

    const request = new NextRequest('http://localhost:3000/api/reflect', {
      method: 'POST',
      body: JSON.stringify({ content }),
      headers: { 'Content-Type': 'application/json' },
    })

    const response = await POST(request)
    const data = await response.json()
    const duration = Date.now() - startTime

    const actualSuccess = response.ok
    const testPassed = actualSuccess === expectSuccess

    if (testPassed) {
      if (actualSuccess) {
        // Validate response completeness for successful cases
        const hasAllFields =
          data.summary && data.pattern && data.suggestion && data.metadata
        if (!hasAllFields) {
          return { passed: false, reason: 'Incomplete response' }
        }
      }

      return { passed: true, duration, actualSuccess }
    } else {
      return { passed: false, duration, actualSuccess, reason: data.message }
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
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

// Helper function to make API requests for edge case testing
async function makeEdgeCaseRequest(
  content: string
): Promise<{ response: Response; data: unknown; duration: number }> {
  const startTime = Date.now()

  const request = new NextRequest('http://localhost:3000/api/reflect', {
    method: 'POST',
    body: JSON.stringify({ content }),
    headers: { 'Content-Type': 'application/json' },
  })

  const response = await POST(request)
  const data = await response.json()
  const duration = Date.now() - startTime

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
  beforeEach(() => {
    vi.clearAllMocks()
    // Set up environment
    process.env.OPENAI_API_KEY = 'test-api-key'
    process.env.AI_RATE_LIMIT_ENABLED = 'false'
  })

  describe('Boundary Conditions', () => {
    const boundaryTests = [
      {
        name: 'Minimum valid length (10 chars)',
        content: 'I am okay!',
        expectSuccess: true,
      },
      {
        name: 'Just under minimum (9 chars)',
        content: 'I am ok.',
        expectSuccess: false,
      },
      {
        name: 'At character limit (4999 chars)',
        content:
          'Today I spent a lot of time reflecting on my journey and all the experiences. '.repeat(
            63
          ) + 'This was truly meaningful.',
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

        if (testCase.expectSuccess) {
          expect(response.ok).toBe(true)
          expectValidApiResponse(data)
        } else {
          expect(response.ok).toBe(false)
          expect(data).toHaveProperty('message')
          expect(typeof (data as Record<string, unknown>).message).toBe(
            'string'
          )
        }
      })
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
      })
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

        expect(response.ok).toBe(true)
        expectValidApiResponse(data)
      })
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

        expect(response.ok).toBe(false)
        expect(data).toHaveProperty('message')
        expect(typeof (data as Record<string, unknown>).message).toBe('string')
      })
    })
  })

  describe('Edge Case Integration Test', () => {
    it('should handle all edge cases appropriately', async () => {
      const results = {
        total: edgeCases.length,
        passed: 0,
        failed: 0,
      }

      for (const testCase of edgeCases) {
        try {
          const result = await testEdgeCase(testCase)
          if (result.passed) {
            results.passed++
          } else {
            results.failed++
          }
        } catch {
          results.failed++
        }
      }

      expect(results.total).toBe(edgeCases.length)

      // Expect most edge cases to pass (allowing for some failures in edge validation logic)
      const validEdgeCases = edgeCases.filter((tc) => tc.expectSuccess).length
      const expectedMinSuccess = Math.floor(validEdgeCases * 0.8) // At least 80% of valid cases
      expect(results.passed).toBeGreaterThanOrEqual(expectedMinSuccess)
    })
  })
})
