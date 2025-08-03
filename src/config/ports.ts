/**
 * Centralized port configuration for the Reflect App
 *
 * This file defines all ports used across different environments and services
 * to ensure consistency and avoid conflicts during development and testing.
 */

// Application Ports
export const PORTS = {
  // Next.js Development Server
  DEV: 3000,

  // Next.js Production Server (when run locally)
  PROD: 3001,

  // Next.js Development Server for E2E Testing (to avoid conflicts)
  E2E_DEV: 3002,

  // External AI Service (Ollama)
  OLLAMA: 11434,
} as const

// Environment-specific configurations
export const getBaseUrl = (port: number): string => `http://localhost:${port}`

// Default URLs for common scenarios
export const BASE_URLS = {
  DEV: getBaseUrl(PORTS.DEV),
  PROD: getBaseUrl(PORTS.PROD),
  E2E_DEV: getBaseUrl(PORTS.E2E_DEV),
  OLLAMA: getBaseUrl(PORTS.OLLAMA),
} as const

// Environment variable mappings
export const ENV_VARS = {
  // Next.js port (defaults to PORTS.DEV)
  PORT: 'PORT',

  // Playwright test base URL override
  PLAYWRIGHT_TEST_BASE_URL: 'PLAYWRIGHT_TEST_BASE_URL',

  // Ollama service URL override
  OLLAMA_BASE_URL: 'OLLAMA_BASE_URL',
} as const

/**
 * Get the appropriate port based on environment
 */
export function getPort(
  environment: 'dev' | 'prod' | 'e2e-dev' = 'dev'
): number {
  switch (environment) {
    case 'prod':
      return PORTS.PROD
    case 'e2e-dev':
      return PORTS.E2E_DEV
    case 'dev':
    default:
      return PORTS.DEV
  }
}

/**
 * Check if a port is available (for development use)
 */
export function isStandardPort(port: number): boolean {
  return (Object.values(PORTS) as number[]).includes(port)
}

// Type exports for TypeScript support
export type PortKey = keyof typeof PORTS
export type Environment = 'dev' | 'prod' | 'e2e-dev'
