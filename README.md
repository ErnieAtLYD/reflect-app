# Reflect App

A modern journaling application with AI-powered reflection capabilities. Built with Next.js, TypeScript, and OpenAI integration to provide users with meaningful insights into their journal entries.

## 🚀 Features

### Core Functionality

- **AI-Powered Journaling** - Get automated reflections, pattern detection, and actionable suggestions
- **Journal Entry Input** - Enhanced textarea with auto-resize, validation, and character counting
- **Real-time Feedback** - Instant validation and feedback on journal entries
- **Responsive Design** - Optimized experience across all devices and screen sizes
- **Dark/Light Mode** - Full theme support with system preference detection

### Technical Features

- **Next.js 15** with App Router
- **OpenAI Integration** - GPT-4 Turbo with GPT-3.5 Turbo fallback
- **TypeScript** for type safety
- **Tailwind CSS v4** with CSS variables for theming
- **shadcn/ui** for beautiful, accessible UI components
- **Rate Limiting & Caching** - Optimized AI API usage with cost reduction
- **Comprehensive Testing** - Unit tests with Vitest + E2E tests with Playwright
- **Code Quality** - ESLint, Prettier, Husky pre-commit hooks
- **Path aliases** (@/\*) configured
- **Vercel** deployment ready

### Architecture Philosophy

This application follows a **simplified, standard-first approach**:

- **Standard HTML** elements for accessibility (no over-engineered custom focus management)
- **Component simplicity** over complex abstractions
- **Testing reliability** with standard patterns
- **Maintainability** through clear, readable code

_Note: A comprehensive custom focus management system was removed in September 2025 to reduce complexity and improve maintainability._

## 📦 Package Manager

This project uses **pnpm** for faster, more efficient dependency management.

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- OpenAI API key (required for AI features)

### Installation

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local

# Add your OpenAI API key to .env.local
echo "OPENAI_API_KEY=your_openai_api_key_here" >> .env.local

# Start development server
pnpm dev
```

### Environment Setup

The application requires several environment variables for full functionality:

**Required:**

```bash
OPENAI_API_KEY=your_openai_api_key_here
```

**Optional (with defaults):**

```bash
# AI Model Configuration
OPENAI_MODEL=gpt-4-1106-preview
OPENAI_FALLBACK_MODEL=gpt-3.5-turbo-1106
OPENAI_MAX_TOKENS=500
OPENAI_TEMPERATURE=0.7

# Rate Limiting
AI_RATE_LIMIT_RPM=10

# Caching
AI_CACHE_TTL=3600
```

Get your OpenAI API key from: https://platform.openai.com/api-keys

### Available Scripts

```bash
# Development
pnpm dev              # Start development server
pnpm build            # Build for production
pnpm start            # Start production server

# Code Quality
pnpm lint             # Run ESLint
pnpm format           # Format code with Prettier
pnpm format:check     # Check code formatting

# Testing
pnpm test             # Run unit tests
pnpm test:ui          # Run tests with UI
pnpm test:coverage    # Run tests with coverage
pnpm test:e2e         # Run e2e tests
pnpm test:e2e:ui      # Run e2e tests with UI
pnpm test:e2e:debug   # Debug e2e tests
```

## 🧪 Testing

### Unit Tests

- **Vitest** for fast unit testing
- **@testing-library/react** for React component testing
- **jsdom** environment for DOM testing
- Test files: `**/__tests__/**/*.test.{ts,tsx}`

### E2E Tests

- **Playwright** for end-to-end testing
- Tests across Chrome, Firefox, and Safari
- Test files: `e2e/**/*.spec.ts`

## 🎨 UI Components

This application includes custom and **shadcn/ui** components:

### Custom Components

- **JournalEntryInput** - Enhanced textarea for journal writing with auto-resize, validation, and character counting
- **LoadingSpinner** - Animated loading indicators with size/color variants
- **ErrorMessage** - Accessible error display with icons and variants
- **Feedback** - Thumbs up/down rating component for user feedback
- **ThemeToggle** - Light/dark/system mode switching

### shadcn/ui Components

- Button, Card, Input, Label, Textarea, Dialog

Add more shadcn/ui components with:

```bash
pnpm dlx shadcn@latest add [component-name]
```

## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── reflect/           # AI processing endpoint
│   ├── components-demo/       # Component showcase page
│   └── page.tsx              # Main application page
├── components/
│   ├── ui/                   # UI components (buttons, inputs, etc.)
│   └── __tests__/           # Component unit tests
├── lib/
│   ├── openai.ts            # OpenAI service utilities
│   ├── ai-client.ts         # Client-side AI utilities
│   └── utils.ts             # General utilities
├── types/
│   └── ai.ts                # AI service type definitions
└── test/                    # Test setup and utilities

e2e/                         # Playwright end-to-end tests
.taskmaster/                 # Project task management
```

## 🔧 Configuration

- **ESLint**: Extends Next.js config
- **Prettier**: Includes Tailwind plugin for class sorting
- **Tailwind**: v4 with CSS variables for theming
- **TypeScript**: Strict mode enabled
- **Path Aliases**: `@/*` maps to `src/*`

## 🤖 AI Integration

The app uses OpenAI's API to provide intelligent reflections on journal entries:

### API Endpoint

- **POST** `/api/reflect` - Process journal entries with AI

### Features

- **Dual Model Support** - GPT-4 Turbo primary, GPT-3.5 Turbo fallback
- **Rate Limiting** - 10 requests/minute per IP (configurable)
- **Caching** - Reduces API costs for similar entries
- **Error Handling** - Comprehensive error types and recovery
- **Response Format** - Summary, pattern detection, actionable suggestions

### Client Usage

```typescript
import { aiClient } from '@/lib/ai-client'

const response = await aiClient.processEntry({
  content: 'Your journal entry here...',
})

console.log(response.summary) // Brief summary
console.log(response.pattern) // Detected pattern/theme
console.log(response.suggestion) // Actionable suggestion
```

## 🚀 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables:
   - `OPENAI_API_KEY` (required)
   - Other optional AI configuration variables
4. Deploy automatically

### Other Platforms

Works on any platform supporting Next.js. Ensure environment variables are configured properly.

## 🛡️ Code Quality

- **Pre-commit hooks** with Husky
- **Lint-staged** for staged file linting
- **ESLint** + **Prettier** integration
- **TypeScript** strict mode

## 📊 Performance

- **Next.js 15** performance optimizations
- **Static generation** where possible
- **Optimal bundle splitting**
- **Image optimization** built-in

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📝 License

MIT License - see LICENSE file for details.
