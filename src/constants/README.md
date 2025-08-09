# Constants Directory

This directory centralizes all application configuration constants for better maintainability and consistency.

## Structure

### `/src/constants/ai.ts`

Contains all AI service-related configuration including:

- **OpenAI Configuration**: API models, tokens, temperature, timeout settings
- **Rate Limiting**: Request limits, window settings, enable/disable flags
- **Caching**: TTL and cache-related settings

#### Key Features

- **Environment Variable Integration**: Automatically reads from `process.env` with sensible defaults
- **Type Safety**: All constants are strongly typed with `as const` assertions
- **Centralized Defaults**: Default values defined in clear constant objects
- **Documentation**: Each section is clearly documented with purpose and usage

#### Usage Example

```typescript
import { AI_CONFIG } from '@/constants'

// Access configuration values
const timeout = AI_CONFIG.OPENAI_TIMEOUT_MS
const rateLimitEnabled = AI_CONFIG.RATE_LIMIT_ENABLED
```

## Benefits of Centralized Constants

1. **Single Source of Truth**: All configuration in one place
2. **Better Maintainability**: Easy to find and update configuration
3. **Consistency**: Eliminates duplicate environment variable parsing
4. **Type Safety**: Strong typing prevents configuration errors
5. **Testability**: Easy to mock and test different configurations
6. **Documentation**: Clear understanding of all available options

## Environment Variables

All constants automatically read from environment variables with fallback defaults:

| Variable                | Default              | Description                     |
| ----------------------- | -------------------- | ------------------------------- |
| `OPENAI_API_KEY`        | -                    | OpenAI API key (required)       |
| `OPENAI_MODEL`          | `gpt-4-1106-preview` | Primary OpenAI model            |
| `OPENAI_FALLBACK_MODEL` | `gpt-3.5-turbo-1106` | Fallback model                  |
| `OPENAI_MAX_TOKENS`     | `500`                | Maximum tokens per request      |
| `OPENAI_TEMPERATURE`    | `0.7`                | Model temperature setting       |
| `OPENAI_TIMEOUT_MS`     | `30000`              | Request timeout in milliseconds |
| `AI_RATE_LIMIT_ENABLED` | `true`               | Enable/disable rate limiting    |
| `AI_RATE_LIMIT_RPM`     | `10`                 | Requests per minute limit       |
| `AI_CACHE_TTL`          | `3600`               | Cache TTL in seconds            |

## Migration Notes

This refactoring moved constants from:

- `src/app/api/reflect/route.ts` → `src/constants/ai.ts`
- `src/lib/openai.ts` → `src/constants/ai.ts` (environment parsing)

All functionality remains the same, but configuration is now centralized and more maintainable.
