import { describe, it, expect, vi, beforeEach } from 'vitest'

import {
  createFeedback,
  FeedbackStorageError,
  sanitizeReflectionId,
  isValidReflectionId,
} from '../feedback-storage'
import { supabase } from '../supabase'

// Mock Supabase
vi.mock('../supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
    })),
  },
}))

describe('FeedbackStorageError', () => {
  it('creates validation error correctly', () => {
    const error = FeedbackStorageError.validation('Invalid data')

    expect(error.message).toBe('Invalid data')
    expect(error.code).toBe('VALIDATION_ERROR')
    expect(error.statusCode).toBe(400)
  })

  it('creates database error correctly', () => {
    const error = FeedbackStorageError.database('DB failed')

    expect(error.message).toBe('DB failed')
    expect(error.code).toBe('DATABASE_ERROR')
    expect(error.statusCode).toBe(500)
  })

  it('creates rate limit error correctly', () => {
    const error = FeedbackStorageError.rateLimit()

    expect(error.message).toBe('Too many requests. Please try again later.')
    expect(error.code).toBe('RATE_LIMIT')
    expect(error.statusCode).toBe(429)
  })
})

describe('createFeedback', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('creates feedback successfully', async () => {
    const mockResult = { feedback_id: 'test-feedback-id' }
    const mockInsert = vi.fn(() => ({
      select: vi.fn(() => ({
        single: vi.fn(() => Promise.resolve({ data: mockResult, error: null })),
      })),
    }))
    const mockFrom = vi.fn(() => ({ insert: mockInsert }))

    vi.mocked(supabase).from = mockFrom

    const feedbackData = {
      reflection_id: 'test-reflection-id',
      feedback_type: 'positive' as const,
      user_agent: 'Mozilla/5.0 Test Browser',
    }

    const result = await createFeedback(feedbackData)

    expect(result.success).toBe(true)
    expect(result.feedback_id).toBe('test-feedback-id')
    expect(mockFrom).toHaveBeenCalledWith('feedback')
    expect(mockInsert).toHaveBeenCalledWith({
      reflection_id: 'test-reflection-id',
      feedback_type: 'positive',
      user_agent: 'Mozilla/5.0 Test Browser',
    })
  })

  it('validates required fields', async () => {
    await expect(createFeedback({} as never)).rejects.toThrow(
      FeedbackStorageError
    )

    await expect(
      createFeedback({
        reflection_id: '',
        feedback_type: 'positive' as const,
      })
    ).rejects.toThrow(FeedbackStorageError)
  })

  it('validates feedback type', async () => {
    await expect(
      createFeedback({
        reflection_id: 'test-id',
        feedback_type: 'invalid' as never,
      })
    ).rejects.toThrow(FeedbackStorageError)
  })

  it('limits user agent length', async () => {
    const mockResult = { feedback_id: 'test-feedback-id' }
    const mockInsert = vi.fn(() => ({
      select: vi.fn(() => ({
        single: vi.fn(() => Promise.resolve({ data: mockResult, error: null })),
      })),
    }))
    const mockFrom = vi.fn(() => ({ insert: mockInsert }))

    vi.mocked(supabase).from = mockFrom

    const longUserAgent = 'a'.repeat(2000)
    const feedbackData = {
      reflection_id: 'test-reflection-id',
      feedback_type: 'positive' as const,
      user_agent: longUserAgent,
    }

    await createFeedback(feedbackData)

    const insertCall = mockInsert.mock.calls[0][0]
    expect(insertCall.user_agent).toHaveLength(1000)
  })

  it('handles database errors', async () => {
    const mockError = { message: 'Database connection failed' }
    const mockInsert = vi.fn(() => ({
      select: vi.fn(() => ({
        single: vi.fn(() => Promise.resolve({ data: null, error: mockError })),
      })),
    }))
    const mockFrom = vi.fn(() => ({ insert: mockInsert }))

    vi.mocked(supabase).from = mockFrom

    const feedbackData = {
      reflection_id: 'test-reflection-id',
      feedback_type: 'positive' as const,
    }

    await expect(createFeedback(feedbackData)).rejects.toThrow(
      FeedbackStorageError
    )
  })

  it('handles unexpected errors', async () => {
    const mockInsert = vi.fn(() => {
      throw new Error('Unexpected error')
    })
    const mockFrom = vi.fn(() => ({ insert: mockInsert }))

    vi.mocked(supabase).from = mockFrom

    const feedbackData = {
      reflection_id: 'test-reflection-id',
      feedback_type: 'positive' as const,
    }

    await expect(createFeedback(feedbackData)).rejects.toThrow(
      FeedbackStorageError
    )
  })
})

describe('sanitizeReflectionId', () => {
  it('removes invalid characters', () => {
    expect(sanitizeReflectionId('test@#$%id')).toBe('testid')
    expect(sanitizeReflectionId('test<script>id')).toBe('testscriptid')
  })

  it('preserves valid characters', () => {
    expect(sanitizeReflectionId('test_id-123')).toBe('test_id-123')
    expect(sanitizeReflectionId('TestId123')).toBe('TestId123')
  })

  it('limits length to 255 characters', () => {
    const longId = 'a'.repeat(300)
    expect(sanitizeReflectionId(longId)).toHaveLength(255)
  })
})

describe('isValidReflectionId', () => {
  it('validates string type', () => {
    expect(isValidReflectionId('valid-id')).toBe(true)
    expect(isValidReflectionId(123 as never)).toBe(false)
    expect(isValidReflectionId(null as never)).toBe(false)
    expect(isValidReflectionId(undefined as never)).toBe(false)
  })

  it('validates length', () => {
    expect(isValidReflectionId('')).toBe(false)
    expect(isValidReflectionId('a')).toBe(true)
    expect(isValidReflectionId('a'.repeat(255))).toBe(true)
    expect(isValidReflectionId('a'.repeat(256))).toBe(false)
  })
})
