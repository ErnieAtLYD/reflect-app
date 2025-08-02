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
│   ├── ui/            # UI components (Button, Card, Input, Label, Textarea, LoadingSpinner, ErrorMessage, Feedback)
│   └── __tests__/     # Component unit tests
├── lib/               # Utility functions (cn helper for className merging)
└── test/              # Test setup files

e2e/                   # Playwright end-to-end tests
```

### Path Aliases

- `@/*` maps to `src/*` - use this for all internal imports

### Component Patterns

- UI components follow shadcn/ui patterns with class-variance-authority for variants
- Client components use `'use client'` directive
- Components include `data-testid` attributes for testing
- Styling uses Tailwind utility classes with the `cn()` helper for conditional classes
- All components support size and variant props for consistency
- Accessibility built-in with proper ARIA attributes and semantic HTML

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

### UI Components Library

#### Built-in Components

- **Button** - Multi-variant button with Radix primitives
- **Card** - Container component for content grouping
- **Input** - Form input with validation states
- **Label** - Form labels with proper associations
- **Textarea** - Multi-line text input with auto-resize and variants

#### Custom Components

- **LoadingSpinner** - Animated loading indicator with size/color variants
- **ErrorMessage** - Accessible error display with icons and variants
- **Feedback** - Thumbs up/down rating component for user feedback
- **Dialog** - Accessible modal dialog using @headlessui/react

#### Component Usage Examples

```tsx
// Textarea
<Textarea size="lg" variant="filled" placeholder="Enter your text..." />
<Textarea error={true} aria-describedby="error-message" />

// LoadingSpinner
<LoadingSpinner size="lg" variant="primary" aria-label="Loading content" />
<LoadingSpinner size="sm" variant="muted" />

// ErrorMessage
<ErrorMessage message="Something went wrong" variant="filled" />
<ErrorMessage title="Validation Error" size="lg" showIcon={false} />

// Feedback
<Feedback
  onFeedback={(type) => console.log(type)}
  selectedFeedback="positive"
  showLabels={true}
/>
<FeedbackButton feedbackType="positive" selected={true} />

// Dialog
<Dialog
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Confirmation"
  description="Are you sure you want to continue?"
  size="md"
>
  <div className="flex gap-4">
    <button onClick={handleConfirm}>Confirm</button>
    <button onClick={() => setIsOpen(false)}>Cancel</button>
  </div>
</Dialog>
```

### Accessibility Features

#### Built-in Accessibility Support

- **WCAG 2.1 AA compliance** - All components meet accessibility standards
- **Screen reader support** - Proper ARIA attributes and semantic HTML
- **Keyboard navigation** - Full keyboard accessibility for all interactive elements
- **Focus management** - Proper focus trapping and restoration in modals
- **High contrast** - Color combinations meet minimum contrast ratios
- **Reduced motion** - Respects user preferences for reduced motion

#### Accessibility Testing

- **Automated testing** - axe-core integration for accessibility violations
- **ESLint rules** - jsx-a11y plugin enforces accessibility best practices
- **Manual testing** - Guidelines for screen reader and keyboard testing

#### Using @headlessui/react

Components like Dialog use HeadlessUI for enhanced accessibility:

- Automatic focus management
- Keyboard event handling (Escape, Tab trapping)
- ARIA attribute management
- Screen reader announcements

#### Accessibility Testing Example

```tsx
import { testAccessibility } from '@/test/accessibility'

it('passes accessibility tests', async () => {
  await testAccessibility(<YourComponent />)
})
```

### Dark/Light Mode Implementation

This application features a comprehensive dark/light mode system using Tailwind CSS v4's native dark mode support and next-themes for state management.

#### Theme System Overview

The application supports three theme modes:

- **Light Mode** - Default light color scheme
- **Dark Mode** - Dark color scheme optimized for low-light viewing
- **System Mode** - Automatically follows the user's operating system preference

#### Theme Components

##### ThemeProvider

Wraps the entire application to provide theme context:

```tsx
import { ThemeProvider } from '@/components/theme-provider'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
```

##### ThemeToggle Components

Two theme toggle components are available:

**Basic ThemeToggle** - Simple light/dark toggle:

```tsx
import { ThemeToggle } from '@/components/ui/theme-toggle'
;<ThemeToggle />
```

**ThemeToggleAdvanced** - Cycles through all three modes:

```tsx
import { ThemeToggleAdvanced } from '@/components/ui/theme-toggle'
;<ThemeToggleAdvanced />
```

#### Creating Theme-Aware Components

Use Tailwind's `dark:` prefix for dark mode styles:

```tsx
// Basic dark mode styling
<div className="bg-white dark:bg-gray-900 text-black dark:text-white">
  Content adapts to theme
</div>

// Using CSS variables for consistent theming
<div className="bg-background text-foreground border border-border">
  Automatically theme-aware using CSS variables
</div>

// Conditional icons based on theme
const { theme } = useTheme()

return (
  <div>
    {theme === 'dark' ? (
      <MoonIcon className="w-4 h-4" />
    ) : (
      <SunIcon className="w-4 h-4" />
    )}
  </div>
)
```

#### CSS Variables for Theming

The application uses CSS variables defined in `globals.css` for consistent theming:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --border: 214.3 31.8% 91.4%;
  /* ... more variables */
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --border: 217.2 32.6% 17.5%;
  /* ... more variables */
}
```

#### Theme Hook Usage

Use the `useTheme` hook for programmatic theme control:

```tsx
import { useTheme } from 'next-themes'

function MyComponent() {
  const { theme, setTheme, themes } = useTheme()

  return (
    <div>
      <p>Current theme: {theme}</p>
      <button onClick={() => setTheme('light')}>Light</button>
      <button onClick={() => setTheme('dark')}>Dark</button>
      <button onClick={() => setTheme('system')}>System</button>
    </div>
  )
}
```

#### Theme-Aware Component Patterns

**Conditional Rendering Based on Theme:**

```tsx
const { theme } = useTheme()

return (
  <div className="p-4">
    {theme === 'dark' ? (
      <div className="rounded-lg bg-gray-800 p-4 text-white">
        Dark mode content
      </div>
    ) : (
      <div className="rounded-lg bg-white p-4 text-gray-900 shadow">
        Light mode content
      </div>
    )}
  </div>
)
```

**Using Tailwind Dark Mode Classes:**

```tsx
return (
  <div className="border border-gray-200 bg-white text-gray-900 shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:shadow-none">
    <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
      Title
    </h2>
    <p className="text-gray-600 dark:text-gray-300">
      Description text that adapts to theme
    </p>
  </div>
)
```

**Theme-Aware Icons:**

```tsx
import { Sun, Moon } from 'lucide-react'

function ThemeIcon() {
  return (
    <>
      <Sun className="h-4 w-4 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
      <Moon className="absolute h-4 w-4 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
    </>
  )
}
```

#### Testing Dark/Light Mode

Test components in both themes using the theme provider:

```tsx
import { render, screen } from '@testing-library/react'
import { ThemeProvider } from '@/components/theme-provider'

function renderWithTheme(component: React.ReactElement, theme = 'light') {
  return render(<ThemeProvider defaultTheme={theme}>{component}</ThemeProvider>)
}

// Test in light mode
renderWithTheme(<MyComponent />, 'light')

// Test in dark mode
renderWithTheme(<MyComponent />, 'dark')

// Test theme cycling
it('cycles through themes when clicked', async () => {
  const user = userEvent.setup()
  renderWithTheme(<ThemeToggleAdvanced />, 'light')

  const button = screen.getByTestId('theme-toggle-advanced')

  // Should start with Light theme
  expect(screen.getByText('Light')).toBeInTheDocument()

  // Click to cycle to Dark theme
  await user.click(button)
  await waitFor(() => {
    expect(screen.getByText('Dark')).toBeInTheDocument()
  })
})
```

#### Accessibility Considerations

- All theme toggle components include proper ARIA labels
- Color contrast ratios are maintained in both light and dark modes (minimum 4.5:1)
- Theme preferences are persisted using localStorage
- System theme preference is respected by default
- Focus indicators are visible in both themes

#### Best Practices

1. **Always test components in both light and dark modes**
2. **Use CSS variables for consistent theming across components**
3. **Ensure sufficient color contrast in both themes**
4. **Provide theme toggle accessibility with proper ARIA labels**
5. **Use the `dark:` prefix for dark-specific styles**
6. **Consider using `theme-system` for respecting user preferences**
7. **Test theme switching functionality with automated tests**

### Responsive Design System

This application features a comprehensive responsive design system with custom breakpoints optimized for the Reflect app's specific requirements.

#### Custom Breakpoints

The application uses the following custom breakpoints defined in `globals.css`:

- **Mobile** - Default (< 480px) - Base mobile experience
- **XS** - 480px+ (30rem) - Small mobile devices
- **SM** - 640px+ (40rem) - Mobile devices
- **MD** - 768px+ (48rem) - Tablet devices
- **LG** - 1024px+ (64rem) - Desktop devices
- **XL** - 1280px+ (80rem) - Large desktop
- **2XL** - 1536px+ (96rem) - Extra large screens

#### Breakpoint Configuration

**CSS Variables in `globals.css`:**

```css
@theme {
  --breakpoint-xs: 30rem; /* 480px */
  --breakpoint-sm: 40rem; /* 640px */
  --breakpoint-md: 48rem; /* 768px */
  --breakpoint-lg: 64rem; /* 1024px */
  --breakpoint-xl: 80rem; /* 1280px */
  --breakpoint-2xl: 96rem; /* 1536px */
}
```

**Tailwind Configuration:**

```js
// tailwind.config.ts
theme: {
  screens: {
    xs: 'var(--breakpoint-xs)',
    sm: 'var(--breakpoint-sm)',
    md: 'var(--breakpoint-md)',
    lg: 'var(--breakpoint-lg)',
    xl: 'var(--breakpoint-xl)',
    '2xl': 'var(--breakpoint-2xl)',
  }
}
```

#### Container System

The application includes a responsive container system with predefined max-widths:

- **XS containers** - 20rem (320px)
- **SM containers** - 24rem (384px)
- **MD containers** - 28rem (448px)
- **LG containers** - 32rem (512px)
- **XL containers** - 36rem (576px)
- **2XL containers** - 42rem (672px)

**Usage:**

```tsx
<div className="container mx-auto">
  Content automatically sized for each breakpoint
</div>
```

#### Responsive Design Patterns

**Mobile-First Approach:**

```tsx
// Base styles apply to mobile, then enhanced at larger breakpoints
<div className="xs:p-6 p-4 sm:p-8">
  <h1 className="xs:text-3xl text-2xl lg:text-4xl">Responsive Heading</h1>
</div>
```

**Grid Layouts:**

```tsx
// Responsive grid that adapts across all breakpoints
<div className="xs:grid-cols-2 grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
  <div>Item 1</div>
  <div>Item 2</div>
  // ...
</div>
```

**Flexible Spacing:**

```tsx
// Spacing that adapts to screen size
<div className="xs:space-y-6 space-y-4 sm:space-y-8">
  <section>Content</section>
  <section>Content</section>
</div>
```

**Typography Scaling:**

```tsx
// Text that scales appropriately
<p className="xs:text-base text-sm lg:text-lg">Responsive paragraph text</p>
```

#### Layout Examples

**Header Layout:**

```tsx
// Stacks on mobile, horizontal on larger screens
<header className="xs:flex-row xs:items-center xs:justify-between flex flex-col gap-4">
  <div>Brand/Logo</div>
  <nav>Navigation</nav>
</header>
```

**Two-Column Layout:**

```tsx
// Single column on mobile/tablet, two columns on desktop
<div className="grid gap-8 lg:grid-cols-2">
  <div>Main content</div>
  <div>Sidebar content</div>
</div>
```

#### Testing Responsive Behavior

**E2E Testing with Playwright:**

```ts
// Test at all breakpoints
const breakpoints = {
  mobile: 375,
  xs: 480,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
}

for (const [name, width] of Object.entries(breakpoints)) {
  await page.setViewportSize({ width, height: 800 })
  // Test responsive behavior
}
```

**Manual Testing:**

- Use browser dev tools to test all breakpoints
- Verify no horizontal overflow at any screen size
- Check touch interactions on mobile devices
- Test with real devices when possible

#### Responsive Component Guidelines

1. **Start with mobile-first design** - Base styles for smallest screens
2. **Use progressive enhancement** - Add complexity at larger breakpoints
3. **Test at all breakpoints** - Ensure smooth transitions between sizes
4. **Consider touch targets** - Ensure interactive elements are appropriately sized
5. **Optimize for performance** - Use responsive images and efficient layouts
6. **Maintain accessibility** - Ensure usability across all device types

#### Debugging Responsive Issues

**Breakpoint Indicators:**
The demo page includes visual indicators showing the current active breakpoint:

```tsx
<span className="bg-primary xs:block hidden rounded px-2 py-1 text-white sm:hidden">
  XS (480px+)
</span>
```

**Browser Dev Tools:**

- Use responsive design mode
- Test common device sizes
- Check for overflow issues
- Verify layout stability

This responsive system ensures optimal user experience across all device types while maintaining consistent design patterns throughout the application.

### Adding New UI Components

Use shadcn/ui CLI: `pnpm dlx shadcn@latest add [component-name]`

### Development Workflow

1. Run `pnpm dev` for development server
2. Make changes with TypeScript strict mode
3. Write tests for new components/features
4. Run `pnpm lint` and `pnpm format` before committing
5. Pre-commit hooks will automatically run linting and formatting
