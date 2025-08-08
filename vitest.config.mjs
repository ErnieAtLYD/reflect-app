import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
    exclude: ['**/node_modules/**', '**/e2e/**'],
    // Configure for API integration tests to avoid rate limiting
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true, // Run API tests sequentially to respect rate limits
      },
    },
    // Longer timeouts for API integration tests
    testTimeout: 30000, // 30 seconds default
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
})
