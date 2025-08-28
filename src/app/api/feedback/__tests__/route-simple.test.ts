import { NextRequest } from 'next/server'
import { describe, it, expect, beforeAll, vi } from 'vitest'

// Mock environment variables before importing modules
beforeAll(() => {
  process.env.SUPABASE_URL = 'https://test.supabase.co'
  process.env.SUPABASE_ANON_KEY = 'test-key'
})

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: null, error: null })),
        })),
      })),
    })),
  },
}))

import { GET, PUT, DELETE } from '../route'

describe('/api/feedback route - simple tests', () => {
  describe('Unsupported methods', () => {
    it('returns 405 for GET', async () => {
      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(405)
      expect(data.error).toBe(
        'Method not allowed. Use POST to submit feedback.'
      )
    })

    it('returns 405 for PUT', async () => {
      const response = await PUT()
      const data = await response.json()

      expect(response.status).toBe(405)
      expect(data.error).toBe(
        'Method not allowed. Use POST to submit feedback.'
      )
    })

    it('returns 405 for DELETE', async () => {
      const response = await DELETE()
      const data = await response.json()

      expect(response.status).toBe(405)
      expect(data.error).toBe(
        'Method not allowed. Use POST to submit feedback.'
      )
    })
  })

  describe('POST validation', () => {
    it('handles invalid JSON', async () => {
      const request = new NextRequest('http://localhost/api/feedback', {
        method: 'POST',
        body: 'invalid json',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const { POST } = await import('../route')
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Invalid JSON in request body.')
    })
  })
})

// Basic validation test for database types
describe('Database validation', () => {
  it('validates feedback request structure', async () => {
    const { validateFeedbackRequest } = await import('@/types/database')

    expect(
      validateFeedbackRequest({
        reflection_id: 'test-id',
        feedback_type: 'positive',
      })
    ).toBe(true)

    expect(
      validateFeedbackRequest({
        reflection_id: '',
        feedback_type: 'positive',
      })
    ).toBe(false)

    expect(
      validateFeedbackRequest({
        reflection_id: 'test-id',
        feedback_type: 'invalid',
      })
    ).toBe(false)
  })
})
