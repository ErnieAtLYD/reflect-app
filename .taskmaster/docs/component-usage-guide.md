# Component Usage Guide

## Table of Contents

- [Overview](#overview)
- [UI Components](#ui-components)
- [Development Patterns](#development-patterns)
- [Testing Guidelines](#testing-guidelines)
- [Performance Considerations](#performance-considerations)

## Overview

This guide covers the proper usage of components in the Reflect app, which uses **shadcn/ui** components built on **Radix UI** primitives with **Tailwind CSS** styling.

### Component Architecture

- **Base Components**: Located in `src/components/ui/`
- **Composed Components**: Located in `src/components/`
- **Path Alias**: Use `@/components/*` for all imports
- **Styling**: Tailwind utilities with `cn()` helper for conditional classes

## UI Components

### Button Component (`@/components/ui/button`)

The Button component provides consistent styling and behavior across the application.

#### Basic Usage

```tsx
import { Button } from '@/components/ui/button'

// Default button
<Button>Click me</Button>

// With variant
<Button variant="outline">Outline Button</Button>
<Button variant="destructive">Delete</Button>
<Button variant="ghost">Ghost Button</Button>
<Button variant="link">Link Button</Button>
```

#### Size Variants

```tsx
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="icon">🏠</Button>
```

#### Advanced Usage

```tsx
// As child (renders as different element)
<Button asChild>
  <Link href="/dashboard">Go to Dashboard</Link>
</Button>

// With custom styling
<Button
  variant="outline"
  size="lg"
  className="w-full md:w-auto"
  data-testid="submit-btn"
>
  Submit Form
</Button>

// Icon button with proper accessibility
<Button size="icon" aria-label="Close dialog">
  <X className="h-4 w-4" />
</Button>
```

#### Button Best Practices

- Always include `data-testid` for testing
- Use `aria-label` for icon-only buttons
- Prefer semantic variants (`destructive` for delete actions)
- Use `asChild` when wrapping other interactive elements

### Card Component (`@/components/ui/card`)

Card components create consistent content containers with automatic layout management.

#### Basic Structure

```tsx
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardAction,
} from '@/components/ui/card'
;<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Optional description</CardDescription>
    <CardAction>
      <Button size="sm">Action</Button>
    </CardAction>
  </CardHeader>
  <CardContent>
    <p>Main card content goes here</p>
  </CardContent>
  <CardFooter>
    <Button>Footer Action</Button>
  </CardFooter>
</Card>
```

#### Responsive Card Usage

```tsx
// Responsive card with flexible width
<Card className="w-full max-w-md mx-auto">
  <CardHeader>
    <CardTitle>Responsive Card</CardTitle>
  </CardHeader>
  <CardContent className="space-y-4">
    {/* Content automatically adapts */}
  </CardContent>
</Card>

// Grid of cards
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {items.map(item => (
    <Card key={item.id} className="h-full">
      <CardContent className="p-4">
        {item.content}
      </CardContent>
    </Card>
  ))}
</div>
```

#### Card Best Practices

- Use `CardAction` for header-level actions (aligns automatically)
- Include `data-testid` on interactive cards
- Use consistent padding: `CardContent` includes `px-6` by default
- For equal height cards in grids, use `h-full` class

### Input Components (`@/components/ui/input`, `@/components/ui/label`)

Form input components with consistent styling and accessibility.

#### Basic Form Pattern

```tsx
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
;<div className="space-y-2">
  <Label htmlFor="email">Email Address</Label>
  <Input
    id="email"
    type="email"
    placeholder="Enter your email"
    data-testid="email-input"
  />
</div>
```

#### Form Layout Patterns

```tsx
// Responsive form grid
<form className="space-y-4">
  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
    <div>
      <Label htmlFor="first-name">First Name</Label>
      <Input id="first-name" required />
    </div>
    <div>
      <Label htmlFor="last-name">Last Name</Label>
      <Input id="last-name" required />
    </div>
  </div>

  <div>
    <Label htmlFor="full-width">Full Width Field</Label>
    <Input id="full-width" className="w-full" />
  </div>
</form>
```

#### Input Best Practices

- Always pair inputs with labels using `htmlFor` and `id`
- Include `type` attribute for semantic inputs
- Use `placeholder` for helpful hints, not essential information
- Add `required` attribute for form validation
- Include `data-testid` for testing form interactions

## Development Patterns

### Component Composition Pattern

```tsx
// Prefer composition over complex prop APIs
function UserCard({ user }: { user: User }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{user.name}</CardTitle>
        <CardDescription>{user.role}</CardDescription>
        <CardAction>
          <Button size="sm" variant="outline">
            Edit
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-4">
          <Avatar src={user.avatar} alt={user.name} />
          <div>
            <p className="text-muted-foreground text-sm">{user.email}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
```

### Conditional Styling with `cn()`

```tsx
import { cn } from '@/lib/utils'

function DynamicButton({
  isActive,
  size = 'default',
  className,
}: {
  isActive: boolean
  size?: 'sm' | 'default' | 'lg'
  className?: string
}) {
  return (
    <Button
      variant={isActive ? 'default' : 'outline'}
      size={size}
      className={cn(
        'transition-all duration-200',
        isActive && 'ring-primary/20 ring-2',
        className
      )}
    >
      Toggle Button
    </Button>
  )
}
```

### Client Component Pattern

```tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function InteractiveCounter() {
  const [count, setCount] = useState(0)

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Interactive Counter</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-center">
        <div className="text-4xl font-bold" data-testid="count-display">
          {count}
        </div>
        <div className="flex justify-center space-x-2">
          <Button
            onClick={() => setCount((c) => c - 1)}
            variant="outline"
            data-testid="decrement-btn"
          >
            -1
          </Button>
          <Button
            onClick={() => setCount(0)}
            variant="secondary"
            data-testid="reset-btn"
          >
            Reset
          </Button>
          <Button
            onClick={() => setCount((c) => c + 1)}
            data-testid="increment-btn"
          >
            +1
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
```

## Testing Guidelines

### Component Testing with data-testid

```tsx
// Component with proper test attributes
function SubmitForm() {
  return (
    <Card data-testid="submit-form">
      <CardHeader>
        <CardTitle>Submit Form</CardTitle>
      </CardHeader>
      <CardContent>
        <form>
          <Input data-testid="form-input" placeholder="Enter value" />
          <Button type="submit" data-testid="submit-button" className="mt-4">
            Submit
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
```

### Testing Best Practices

- Use descriptive `data-testid` values
- Test component behavior, not implementation details
- Include test IDs for all interactive elements
- Test responsive behavior across breakpoints
- Verify accessibility attributes

### Example Test File Structure

```tsx
// src/components/__tests__/submit-form.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { SubmitForm } from '../submit-form'

describe('SubmitForm', () => {
  it('renders form elements correctly', () => {
    render(<SubmitForm />)

    expect(screen.getByTestId('submit-form')).toBeInTheDocument()
    expect(screen.getByTestId('form-input')).toBeInTheDocument()
    expect(screen.getByTestId('submit-button')).toBeInTheDocument()
  })

  it('handles form submission', () => {
    render(<SubmitForm />)

    const input = screen.getByTestId('form-input')
    const button = screen.getByTestId('submit-button')

    fireEvent.change(input, { target: { value: 'test value' } })
    fireEvent.click(button)

    // Assert expected behavior
  })
})
```

## Performance Considerations

### Code Splitting

```tsx
// Lazy load heavy components
import { lazy, Suspense } from 'react'
import { Card, CardContent } from '@/components/ui/card'

const HeavyChart = lazy(() => import('./heavy-chart'))

function Dashboard() {
  return (
    <Card>
      <CardContent>
        <Suspense fallback={<div>Loading chart...</div>}>
          <HeavyChart />
        </Suspense>
      </CardContent>
    </Card>
  )
}
```

### Memoization for Expensive Components

```tsx
import { memo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

// Memoize component that renders large lists
export const ExpensiveList = memo(function ExpensiveList({
  items,
}: {
  items: Item[]
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Large Dataset ({items.length} items)</CardTitle>
      </CardHeader>
      <CardContent>
        {items.map((item) => (
          <div key={item.id} className="border-b py-2 last:border-b-0">
            {item.name}
          </div>
        ))}
      </CardContent>
    </Card>
  )
})
```

### Optimizing Bundle Size

- Import only needed components: `import { Button } from '@/components/ui/button'`
- Avoid importing entire component libraries
- Use dynamic imports for heavy components
- Leverage Next.js automatic code splitting

---

## Quick Reference

### Common Import Patterns

```tsx
// UI Components
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

// Utilities
import { cn } from '@/lib/utils'

// React hooks (for client components)
import { useState, useEffect } from 'react'
```

### Essential Classes to Remember

- `w-full` - Full width
- `max-w-md` - Constrained max width
- `space-y-4` - Vertical spacing between children
- `grid grid-cols-1 md:grid-cols-2` - Responsive grid
- `data-testid="element-name"` - Testing identifier

### When to Use Each Component

- **Button**: All interactive actions, navigation
- **Card**: Content containers, data display, forms
- **Input + Label**: Form fields, user input
- **Custom Components**: Complex business logic, reusable patterns

This guide should serve as your primary reference when building components in the Reflect application.
