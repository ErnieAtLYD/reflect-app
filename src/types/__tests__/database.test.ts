import { describe, it, expect } from 'vitest'

import {
  isValidFeedbackType,
  validateFeedbackRequest,
  FEEDBACK_TYPES,
} from '../database'

describe('Database types validation', () => {
  describe('isValidFeedbackType', () => {
    it('validates positive feedback type', () => {
      expect(isValidFeedbackType('positive')).toBe(true)
    })

    it('validates negative feedback type', () => {
      expect(isValidFeedbackType('negative')).toBe(true)
    })

    it('rejects invalid feedback types', () => {
      expect(isValidFeedbackType('invalid')).toBe(false)
      expect(isValidFeedbackType('neutral')).toBe(false)
      expect(isValidFeedbackType('')).toBe(false)
      expect(isValidFeedbackType('POSITIVE')).toBe(false)
    })

    it('handles non-string inputs', () => {
      expect(isValidFeedbackType(123 as never)).toBe(false)
      expect(isValidFeedbackType(null as never)).toBe(false)
      expect(isValidFeedbackType(undefined as never)).toBe(false)
      expect(isValidFeedbackType({} as never)).toBe(false)
    })
  })

  describe('validateFeedbackRequest', () => {
    it('validates correct feedback request', () => {
      const validRequest = {
        reflection_id: 'test-reflection-id',
        feedback_type: 'positive',
      }

      expect(validateFeedbackRequest(validRequest)).toBe(true)
    })

    it('validates request with user agent', () => {
      const validRequest = {
        reflection_id: 'test-reflection-id',
        feedback_type: 'negative',
        user_agent: 'Mozilla/5.0 Test Browser',
      }

      expect(validateFeedbackRequest(validRequest)).toBe(true)
    })

    it('rejects null or non-object data', () => {
      expect(validateFeedbackRequest(null)).toBe(false)
      expect(validateFeedbackRequest(undefined)).toBe(false)
      expect(validateFeedbackRequest('string')).toBe(false)
      expect(validateFeedbackRequest(123)).toBe(false)
      expect(validateFeedbackRequest([])).toBe(false)
    })

    it('rejects missing reflection_id', () => {
      const invalidRequest = {
        feedback_type: 'positive',
      }

      expect(validateFeedbackRequest(invalidRequest)).toBe(false)
    })

    it('rejects empty reflection_id', () => {
      const invalidRequest = {
        reflection_id: '',
        feedback_type: 'positive',
      }

      expect(validateFeedbackRequest(invalidRequest)).toBe(false)
    })

    it('rejects non-string reflection_id', () => {
      const invalidRequest = {
        reflection_id: 123,
        feedback_type: 'positive',
      }

      expect(validateFeedbackRequest(invalidRequest)).toBe(false)
    })

    it('rejects missing feedback_type', () => {
      const invalidRequest = {
        reflection_id: 'test-reflection-id',
      }

      expect(validateFeedbackRequest(invalidRequest)).toBe(false)
    })

    it('rejects invalid feedback_type', () => {
      const invalidRequest = {
        reflection_id: 'test-reflection-id',
        feedback_type: 'invalid',
      }

      expect(validateFeedbackRequest(invalidRequest)).toBe(false)
    })

    it('rejects non-string user_agent when provided', () => {
      const invalidRequest = {
        reflection_id: 'test-reflection-id',
        feedback_type: 'positive',
        user_agent: 123,
      }

      expect(validateFeedbackRequest(invalidRequest)).toBe(false)
    })

    it('allows undefined user_agent', () => {
      const validRequest = {
        reflection_id: 'test-reflection-id',
        feedback_type: 'positive',
        user_agent: undefined,
      }

      expect(validateFeedbackRequest(validRequest)).toBe(true)
    })
  })

  describe('FEEDBACK_TYPES constant', () => {
    it('contains expected values', () => {
      expect(FEEDBACK_TYPES).toEqual(['positive', 'negative'])
    })

    it('is read-only at compile time', () => {
      // TypeScript should prevent modification, but arrays are mutable at runtime
      // This test just verifies the expected values exist
      expect(FEEDBACK_TYPES.length).toBe(2)
      expect(FEEDBACK_TYPES[0]).toBe('positive')
      expect(FEEDBACK_TYPES[1]).toBe('negative')
    })
  })
})
