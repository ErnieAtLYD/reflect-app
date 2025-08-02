# Production-Ready Next.js TypeScript Starter

A modern, production-ready Next.js starter template with TypeScript, excellent developer experience, and all the tools you need to build scalable applications.

## 🚀 Features

- **Next.js 15** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **shadcn/ui** for beautiful, accessible UI components
- **Vitest** + **@testing-library/react** for unit testing
- **Playwright** for end-to-end testing
- **ESLint** for code linting
- **Prettier** for code formatting
- **Husky** + **lint-staged** for git hooks
- **Path aliases** (@/\*) configured
- **Vercel** deployment ready

## 📦 Package Manager

This project uses **pnpm** for faster, more efficient dependency management.

## 🛠️ Getting Started

### Installation

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
```

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

This starter includes **shadcn/ui** components:

- Button
- Card
- Input
- Label

Add more components with:

```bash
pnpm dlx shadcn@latest add [component-name]
```

## 📁 Project Structure

```
src/
├── app/                # Next.js App Router
├── components/         # React components
│   ├── ui/            # shadcn/ui components
│   └── __tests__/     # Component tests
├── lib/               # Utility functions
└── test/              # Test setup

e2e/                   # Playwright tests
```

## 🔧 Configuration

- **ESLint**: Extends Next.js config
- **Prettier**: Includes Tailwind plugin for class sorting
- **Tailwind**: v4 with comprehensive theme configuration
  - Custom color palette with CSS variables
  - Extended font families (Parkinsans, Inter, JetBrains Mono)
  - Complete typography scale (sizes, weights, spacing)
  - Accessible color system with OKLCH values
- **TypeScript**: Strict mode enabled
- **Path Aliases**: `@/*` maps to `src/*`

## 🚀 Deployment

### Vercel (Recommended)

This project is optimized for Vercel deployment:

1. Push to GitHub
2. Import project in Vercel
3. Deploy automatically

### Other Platforms

The project includes a `vercel.json` for platform-specific settings, but works on any platform supporting Next.js.

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
