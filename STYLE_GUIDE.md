# Reflect App Style Guide

A comprehensive design system and style guide for the Reflect journaling application.

## Table of Contents

1. [Design System Overview](#design-system-overview)
2. [Color System](#color-system)
3. [Typography](#typography)
4. [Spacing & Layout](#spacing--layout)
5. [Component Library](#component-library)
6. [Responsive Design](#responsive-design)
7. [Accessibility](#accessibility)
8. [Development Guidelines](#development-guidelines)

---

## Design System Overview

### Philosophy

Reflect is designed as a calming, private space for personal reflection and journaling. The design system emphasizes:

- **Tranquility**: Soft color palette promoting calm and focus
- **Accessibility**: WCAG 2.1 AA compliant for all users
- **Simplicity**: Clean, uncluttered interface reducing cognitive load
- **Privacy**: Subtle design elements that feel secure and personal

### Architecture

- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS v4 with CSS variables
- **Components**: shadcn/ui components built on Radix UI primitives
- **Theme System**: next-themes with light/dark mode support
- **Utilities**: class-variance-authority for component variants

---

## Color System

### Brand Colors

```css
/* Primary Brand Palette */
--color-lavender: #e8e9f3; /* Soft lavender background */
--color-gray-light: #cecece; /* Light gray borders/text */
--color-gray-medium: #5a5a5c; /* Medium gray text (WCAG AA) */
--color-dark-blue: #272635; /* Dark blue primary */
--color-sky-blue: #b1e5f2; /* Sky blue accent */
```

### Semantic Tokens

#### Light Theme

```css
--background: var(--color-lavender);
--foreground: var(--color-dark-blue);
--primary: var(--color-dark-blue);
--primary-foreground: oklch(0.95 0.01 280);
--secondary: var(--color-sky-blue);
--secondary-foreground: var(--color-dark-blue);
--accent: var(--color-sky-blue);
--muted: oklch(0.85 0.01 280);
--border: var(--color-gray-light);
```

#### Dark Theme

```css
--background: var(--color-dark-blue);
--foreground: var(--color-lavender);
--primary: var(--color-sky-blue);
--primary-foreground: var(--color-dark-blue);
--secondary: oklch(0.35 0.03 255);
--accent: var(--color-sky-blue);
--muted: oklch(0.3 0.02 255);
--border: oklch(0.4 0.03 255);
```

### Status Colors

```css
/* Success - Green variants */
--success: oklch(0.5 0.2 145); /* Light mode */
--success: oklch(0.7 0.18 145); /* Dark mode */

/* Warning - Orange variants */
--warning: oklch(0.75 0.15 85); /* Light mode */
--warning: oklch(0.8 0.18 85); /* Dark mode */

/* Destructive - Red variants */
--destructive: oklch(0.5 0.28 25); /* Light mode */
--destructive: oklch(0.65 0.22 25); /* Dark mode */

/* Info - Uses sky blue */
--info: var(--color-sky-blue);
```

### Usage Guidelines

- **Primary**: Use for main CTAs, focus states, and important UI elements
- **Secondary**: Use for secondary actions and subtle highlights
- **Accent**: Use sparingly for hover states and interactive feedback
- **Muted**: Use for less important text and subtle backgrounds
- **Status**: Use semantic colors consistently across error states, success messages, etc.

---

## Typography

### Font Stack

```css
/* Display & Headings */
--font-display: var(--font-parkinsans), var(--font-sans);
--font-heading: var(--font-parkinsans), var(--font-sans);

/* Body Text */
--font-body: var(--font-sans);
--font-sans: var(--font-inter), ui-sans-serif, system-ui, sans-serif;

/* Code & Monospace */
--font-mono: var(--font-jetbrains-mono), ui-monospace, 'SFMono-Regular';
```

### Type Scale

| Size | Token       | rem      | px   | Usage                |
| ---- | ----------- | -------- | ---- | -------------------- |
| xs   | `text-xs`   | 0.75rem  | 12px | Captions, labels     |
| sm   | `text-sm`   | 0.875rem | 14px | Small text, metadata |
| base | `text-base` | 1rem     | 16px | Body text            |
| lg   | `text-lg`   | 1.125rem | 18px | Large body text      |
| xl   | `text-xl`   | 1.25rem  | 20px | Small headings       |
| 2xl  | `text-2xl`  | 1.5rem   | 24px | Section headings     |
| 3xl  | `text-3xl`  | 1.875rem | 30px | Page headings        |
| 4xl  | `text-4xl`  | 2.25rem  | 36px | Display headings     |
| 5xl  | `text-5xl`  | 3rem     | 48px | Hero headings        |

### Line Heights

```css
--line-height-none: 1; /* Tight spacing for headings */
--line-height-tight: 1.25; /* Headings and titles */
--line-height-snug: 1.375; /* Short paragraphs */
--line-height-normal: 1.5; /* Body text (default) */
--line-height-relaxed: 1.625; /* Long-form content */
--line-height-loose: 2; /* Very spacious reading */
```

### Font Weights

```css
--font-weight-light: 300; /* Light emphasis */
--font-weight-normal: 400; /* Body text */
--font-weight-medium: 500; /* Subtle emphasis */
--font-weight-semibold: 600; /* Headings */
--font-weight-bold: 700; /* Strong emphasis */
```

### Usage Examples

```tsx
// Page heading
<h1 className="font-heading text-4xl font-semibold">Welcome to Reflect</h1>

// Section heading
<h2 className="font-heading text-2xl font-medium">Your Thoughts</h2>

// Body text
<p className="font-body text-base leading-relaxed">
  A space for your private reflections...
</p>

// Code snippet
<code className="font-mono text-sm bg-muted px-2 py-1 rounded">
  pnpm dev
</code>
```

---

## Spacing & Layout

### Spacing Scale

Based on a 4px base unit with consistent scaling:

| Class    | rem     | px   | Usage           |
| -------- | ------- | ---- | --------------- |
| `gap-1`  | 0.25rem | 4px  | Tight spacing   |
| `gap-2`  | 0.5rem  | 8px  | Small spacing   |
| `gap-3`  | 0.75rem | 12px | Default spacing |
| `gap-4`  | 1rem    | 16px | Medium spacing  |
| `gap-6`  | 1.5rem  | 24px | Large spacing   |
| `gap-8`  | 2rem    | 32px | Section spacing |
| `gap-12` | 3rem    | 48px | Page spacing    |

### Container System

Responsive containers with predefined max-widths:

```css
--container-xs: 20rem; /* 320px */
--container-sm: 24rem; /* 384px */
--container-md: 28rem; /* 448px */
--container-lg: 32rem; /* 512px */
--container-xl: 36rem; /* 576px */
--container-2xl: 42rem; /* 672px */
```

Usage:

```tsx
<div className="container mx-auto px-4">
  Content automatically sized for each breakpoint
</div>
```

### Layout Patterns

#### Single Column Layout

```tsx
<div className="container mx-auto max-w-2xl px-4 py-8">
  <main className="space-y-8">{/* Content */}</main>
</div>
```

#### Two Column Layout

```tsx
<div className="grid gap-8 lg:grid-cols-2">
  <main>{/* Primary content */}</main>
  <aside>{/* Secondary content */}</aside>
</div>
```

---

## Component Library

### Button

Primary interactive element with multiple variants and sizes.

#### Variants

```tsx
// Primary button
<Button variant="default">Save Entry</Button>

// Secondary action
<Button variant="outline">Cancel</Button>

// Destructive action
<Button variant="destructive">Delete</Button>

// Subtle action
<Button variant="ghost">Settings</Button>

// Link-style button
<Button variant="link">Learn More</Button>
```

#### Sizes

```tsx
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="icon"><Icon /></Button>
```

#### Implementation

Located at `src/components/ui/button.tsx`, built with:

- **Base**: Radix UI Slot for composition
- **Variants**: class-variance-authority for type-safe variants
- **Styling**: Tailwind utilities with CSS variables
- **Accessibility**: ARIA attributes and focus management

### JournalEntryInput

Specialized textarea component for journal writing with enhanced UX.

#### Features

- **Auto-resize**: Grows/shrinks with content using react-textarea-autosize
- **Character validation**: Minimum length validation with real-time feedback
- **Clear button**: Optional quick-clear functionality
- **Accessibility**: WCAG 2.1 AA compliant with screen reader support

#### Props

```tsx
interface JournalEntryInputProps {
  value?: string
  onChange?: (value: string) => void
  minLength?: number // Default: 20
  minRows?: number // Default: 3
  maxRows?: number // Default: 20
  showCharacterCount?: boolean // Default: true
  showClearButton?: boolean // Default: false
  showValidationErrors?: boolean // Default: false
  onValidationChange?: (isValid: boolean) => void
  onClear?: () => void
  size?: 'sm' | 'default' | 'lg'
  variant?: 'default' | 'filled' | 'ghost'
  error?: boolean
}
```

#### Usage Examples

```tsx
// Basic usage
<JournalEntryInput
  value={entry}
  onChange={setEntry}
  placeholder="Share what's on your mind..."
/>

// Full-featured
<JournalEntryInput
  value={entry}
  onChange={setEntry}
  onClear={() => setEntry('')}
  onValidationChange={setIsValid}
  showClearButton
  showValidationErrors={showErrors}
  minLength={50}
  size="lg"
  variant="filled"
/>
```

### Card

Container component for grouping related content.

```tsx
<Card>
  <CardHeader>
    <CardTitle>Reflection Summary</CardTitle>
    <CardDescription>AI-generated insights from your entry</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Your reflection content...</p>
  </CardContent>
  <CardFooter>
    <Button>Save</Button>
  </CardFooter>
</Card>
```

### Form Components

#### Input

```tsx
<Input type="text" placeholder="Enter text..." error={hasError} />
```

#### Label

```tsx
<Label htmlFor="email">Email Address</Label>
<Input id="email" type="email" />
```

#### Textarea

```tsx
<Textarea placeholder="Enter your thoughts..." rows={4} variant="filled" />
```

### Feedback Components

#### LoadingSpinner

```tsx
<LoadingSpinner size="lg" variant="primary" />
```

#### ErrorMessage

```tsx
<ErrorMessage message="Something went wrong" variant="filled" showIcon />
```

#### Feedback (Thumbs Up/Down)

```tsx
<Feedback
  onFeedback={(type) => handleFeedback(type)}
  selectedFeedback="positive"
  showLabels
/>
```

### Dialog

Accessible modal dialog for confirmations and complex interactions.

```tsx
<Dialog isOpen={isOpen} onClose={() => setIsOpen(false)}>
  <DialogHeader>
    <DialogTitle>Confirm Action</DialogTitle>
    <DialogDescription>Are you sure you want to continue?</DialogDescription>
  </DialogHeader>
  <DialogContent>{/* Dialog content */}</DialogContent>
  <DialogFooter>
    <Button variant="outline" onClick={() => setIsOpen(false)}>
      Cancel
    </Button>
    <Button onClick={handleConfirm}>Confirm</Button>
  </DialogFooter>
</Dialog>
```

---

## Responsive Design

### Breakpoint System

Custom breakpoints optimized for the Reflect app:

```css
--breakpoint-xs: 30rem; /* 480px - Small mobile */
--breakpoint-sm: 40rem; /* 640px - Mobile */
--breakpoint-md: 48rem; /* 768px - Tablet */
--breakpoint-lg: 64rem; /* 1024px - Desktop */
--breakpoint-xl: 80rem; /* 1280px - Large desktop */
--breakpoint-2xl: 96rem; /* 1536px - Extra large */
```

### Mobile-First Approach

All styles start mobile-first, then enhance at larger breakpoints:

```tsx
// Typography scaling
<h1 className="text-2xl xs:text-3xl lg:text-4xl">
  Responsive Heading
</h1>

// Layout changes
<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8">
  <div>Content 1</div>
  <div>Content 2</div>
</div>

// Spacing adjustments
<div className="p-4 xs:p-6 lg:p-8">
  Content with responsive padding
</div>
```

### Common Patterns

#### Responsive Grid

```tsx
<div className="xs:grid-cols-2 grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
  {items.map((item) => (
    <Item key={item.id} />
  ))}
</div>
```

#### Responsive Flexbox

```tsx
<div className="xs:flex-row xs:items-center xs:justify-between flex flex-col gap-4">
  <div>Primary content</div>
  <div>Secondary content</div>
</div>
```

#### Responsive Typography

```tsx
<p className="xs:text-base text-sm leading-relaxed lg:text-lg">
  Text that scales appropriately across devices
</p>
```

---

## Accessibility

### WCAG 2.1 AA Compliance

The Reflect app meets or exceeds WCAG 2.1 AA standards through:

#### Color Contrast

- **Text**: Minimum 4.5:1 contrast ratio
- **Interactive elements**: Enhanced contrast for better visibility
- **Status indicators**: Color + text/icon combinations

#### Focus Management

```css
/* Enhanced focus indicators */
.focus-enhanced:focus-visible {
  outline: none;
  ring: 2px solid hsl(var(--ring));
  ring-offset: 2px;
  transform: scale(1.02);
}
```

#### Keyboard Navigation

- All interactive elements are keyboard accessible
- Logical tab order throughout the application
- Skip links for main content and navigation
- Roving tabindex for complex widgets

#### Screen Reader Support

```tsx
// Proper labeling
<button aria-label="Clear journal entry">
  <ClearIcon />
</button>

// Live regions for dynamic content
<div aria-live="polite" aria-atomic="true">
  {statusMessage}
</div>

// Descriptive text for form validation
<Input
  aria-invalid={hasError}
  aria-describedby={hasError ? "error-message" : undefined}
/>
{hasError && (
  <div id="error-message" role="alert">
    {errorMessage}
  </div>
)}
```

### High Contrast Mode Support

```css
@media (prefers-contrast: high) {
  :root {
    --foreground: #000000;
    --background: #ffffff;
    --border: #000000;
  }

  .dark {
    --foreground: #ffffff;
    --background: #000000;
    --border: #ffffff;
  }
}
```

### Reduced Motion Support

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Development Guidelines

### Code Conventions

#### Component Structure

```tsx
'use client' // Only when needed

import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'
import { cn } from '@/lib/utils'

// Define variants using CVA
const componentVariants = cva('base-classes', {
  variants: {
    variant: {
      default: 'default-classes',
      // ... other variants
    },
    size: {
      default: 'default-size',
      // ... other sizes
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
  },
})

// Component with forwardRef for proper ref handling
const Component = React.forwardRef<HTMLElement, ComponentProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <element
        ref={ref}
        className={cn(componentVariants({ variant, size, className }))}
        {...props}
      />
    )
  }
)

Component.displayName = 'Component'

export { Component, componentVariants }
```

#### CSS Utilities

Always use the `cn()` utility for conditional classes:

```tsx
import { cn } from '@/lib/utils'
;<div
  className={cn(
    'base-classes',
    variant === 'primary' && 'primary-classes',
    isActive && 'active-classes',
    className
  )}
/>
```

#### TypeScript Patterns

```tsx
// Component props with variants
interface ComponentProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof componentVariants> {
  // Additional props
}

// Forwarded refs
const Component = React.forwardRef<HTMLElementType, ComponentProps>(
  (props, ref) => {
    // Implementation
  }
)
```

### Testing Guidelines

#### Unit Tests

- Located in `src/components/__tests__/`
- Use Vitest + @testing-library/react
- Include accessibility tests with axe-core

```tsx
import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { Component } from '../component'

test('renders without accessibility violations', async () => {
  const { container } = render(<Component />)
  const results = await axe(container)
  expect(results).toHaveNoViolations()
})
```

#### E2E Tests

- Located in `e2e/`
- Use Playwright for cross-browser testing
- Test responsive behavior at all breakpoints

```tsx
test('responsive behavior', async ({ page }) => {
  const breakpoints = [375, 480, 640, 768, 1024, 1280]

  for (const width of breakpoints) {
    await page.setViewportSize({ width, height: 800 })
    // Test behavior at this breakpoint
  }
})
```

### Theme Implementation

#### CSS Variables

Define semantic tokens in `globals.css`:

```css
:root {
  --new-semantic-color: light-value;
}

.dark {
  --new-semantic-color: dark-value;
}
```

#### Tailwind Configuration

Update `tailwind.config.ts` to expose new tokens:

```tsx
colors: {
  'new-color': 'var(--new-semantic-color)',
}
```

#### Component Usage

Always use semantic tokens, never hardcoded colors:

```tsx
// ✅ Correct
<div className="bg-background text-foreground" />

// ❌ Incorrect
<div className="bg-white text-black" />
```

---

## Conclusion

This style guide serves as the single source of truth for design and development decisions in the Reflect app. By following these guidelines, we ensure:

- **Consistency**: Unified visual language across all features
- **Accessibility**: Inclusive design for all users
- **Maintainability**: Systematic approach to component development
- **Scalability**: Flexible foundation for future growth

For questions or suggestions regarding this style guide, please refer to the development team or create an issue in the project repository.

---

_Last updated: [Current Date]_
_Version: 1.0.0_
