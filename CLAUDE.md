# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

This project uses **pnpm** as the package manager.

### Core Commands

- `pnpm dev` - Start development server on http://localhost:3000
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm format` - Format code with Prettier
- `pnpm format:check` - Check code formatting

### Testing Commands

- `pnpm test` - Run unit tests with Vitest
- `pnpm test:ui` - Run unit tests with Vitest UI
- `pnpm test:coverage` - Run unit tests with coverage report
- `pnpm test:e2e` - Run Playwright end-to-end tests
- `pnpm test:e2e:ui` - Run e2e tests with Playwright UI
- `pnpm test:e2e:debug` - Debug e2e tests with Playwright

## Architecture Overview

This is a **Next.js 15** application with App Router using **TypeScript** and **Tailwind CSS**.

### Key Technologies Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4 with CSS variables for theming
- **UI Components**: shadcn/ui (Radix UI primitives)
- **State Management**: React useState/useReducer (no external state library)
- **Testing**: Vitest + @testing-library/react for unit tests, Playwright for e2e
- **Code Quality**: ESLint + Prettier + Husky + lint-staged

### Project Structure

```
src/
├── app/                # Next.js App Router (pages, layouts, globals)
├── components/         # React components
│   ├── ui/            # shadcn/ui components (Button, Card, Input, Label)
│   └── __tests__/     # Component unit tests
├── lib/               # Utility functions (cn helper for className merging)
└── test/              # Test setup files

e2e/                   # Playwright end-to-end tests
```

### Path Aliases

- `@/*` maps to `src/*` - use this for all internal imports

### Component Patterns

- UI components follow shadcn/ui patterns with Radix UI primitives
- Client components use `'use client'` directive
- Components include `data-testid` attributes for testing
- Styling uses Tailwind utility classes with the `cn()` helper for conditional classes

### Testing Strategy

- **Unit Tests**: Located in `src/components/__tests__/` using Vitest + @testing-library/react
- **E2E Tests**: Located in `e2e/` using Playwright, tests all major browsers
- Test files use descriptive `data-testid` attributes for reliable element selection
- Unit tests run in jsdom environment with test setup in `src/test/setup.ts`

### Code Quality Setup

- Pre-commit hooks automatically lint and format staged files
- ESLint extends Next.js configuration
- Prettier includes Tailwind plugin for class sorting
- TypeScript strict mode enabled for type safety

### Adding New UI Components

Use shadcn/ui CLI: `pnpm dlx shadcn@latest add [component-name]`

### Development Workflow

1. Run `pnpm dev` for development server
2. Make changes with TypeScript strict mode
3. Write tests for new components/features
4. Run `pnpm lint` and `pnpm format` before committing
5. Pre-commit hooks will automatically run linting and formatting
