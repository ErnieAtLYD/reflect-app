/**
 * AI Service Configuration Constants
 *
 * Centralized configuration for OpenAI API and related AI services
 */

// OpenAI API Configuration
export const OPENAI_DEFAULTS = {
  MODEL: 'gpt-4-1106-preview',
  FALLBACK_MODEL: 'gpt-3.5-turbo-1106',
  MAX_TOKENS: 500,
  TEMPERATURE: 0.7,
  TIMEOUT_MS: 30000,
} as const

// Rate Limiting Configuration
export const RATE_LIMIT_DEFAULTS = {
  ENABLED: true,
  REQUESTS_PER_MINUTE: 10,
  WINDOW_MS: 60 * 1000, // 1 minute
} as const

// Caching Configuration
export const CACHE_DEFAULTS = {
  TTL_SECONDS: 3600, // 1 hour
} as const

// Environment variable getters with defaults
export const AI_CONFIG = {
  // OpenAI Configuration
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  OPENAI_MODEL: process.env.OPENAI_MODEL || OPENAI_DEFAULTS.MODEL,
  OPENAI_FALLBACK_MODEL:
    process.env.OPENAI_FALLBACK_MODEL || OPENAI_DEFAULTS.FALLBACK_MODEL,
  OPENAI_MAX_TOKENS: parseInt(
    process.env.OPENAI_MAX_TOKENS || String(OPENAI_DEFAULTS.MAX_TOKENS),
    10
  ),
  OPENAI_TEMPERATURE: parseFloat(
    process.env.OPENAI_TEMPERATURE || String(OPENAI_DEFAULTS.TEMPERATURE)
  ),
  OPENAI_TIMEOUT_MS: parseInt(
    process.env.OPENAI_TIMEOUT_MS || String(OPENAI_DEFAULTS.TIMEOUT_MS),
    10
  ),

  // Rate Limiting Configuration
  RATE_LIMIT_ENABLED: process.env.AI_RATE_LIMIT_ENABLED !== 'false',
  RATE_LIMIT_RPM: parseInt(
    process.env.AI_RATE_LIMIT_RPM ||
      String(RATE_LIMIT_DEFAULTS.REQUESTS_PER_MINUTE),
    10
  ),
  RATE_LIMIT_WINDOW_MS: RATE_LIMIT_DEFAULTS.WINDOW_MS,

  // Caching Configuration
  CACHE_TTL_MS:
    parseInt(
      process.env.AI_CACHE_TTL || String(CACHE_DEFAULTS.TTL_SECONDS),
      10
    ) * 1000,
} as const
