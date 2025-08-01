# Responsive Design Patterns & Component Usage

## Table of Contents

- [Overview](#overview)
- [Breakpoint System](#breakpoint-system)
- [Component Patterns](#component-patterns)
- [Responsive Utilities](#responsive-utilities)
- [Best Practices](#best-practices)
- [Examples](#examples)

## Overview

The Reflect app uses **Tailwind CSS v4** with a mobile-first responsive design approach. The design system is built on CSS custom properties (CSS variables) for theming and uses the App Router architecture with TypeScript.

### Technology Stack

- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS v4 with CSS variables
- **Components**: shadcn/ui (Radix UI primitives)
- **Design Philosophy**: Mobile-first, progressive enhancement

## Breakpoint System

### Custom Breakpoints

The app defines custom breakpoints optimized for modern devices:

```css
/* Custom breakpoints defined in globals.css */
--breakpoint-xs: 30rem; /* 480px - Small mobile */
--breakpoint-sm: 40rem; /* 640px - Mobile */
--breakpoint-md: 48rem; /* 768px - Tablet */
--breakpoint-lg: 64rem; /* 1024px - Desktop */
--breakpoint-xl: 80rem; /* 1280px - Large desktop */
--breakpoint-2xl: 96rem; /* 1536px - Extra large */
```

### Container Utilities

Custom container sizes for consistent content width:

```css
--container-xs: 20rem; /* 320px */
--container-sm: 24rem; /* 384px */
--container-md: 28rem; /* 448px */
--container-lg: 32rem; /* 512px */
```

### Usage in Components

Apply responsive classes using Tailwind's prefix system:

```tsx
// Mobile-first approach
<div className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4">
  {/* Content adapts from full width on mobile to 1/4 width on large screens */}
</div>
```

## Component Patterns

### 1. Card Component Responsiveness

The Card component uses flexible layouts that adapt to container queries:

```tsx
// Card with responsive padding and layout
<Card className="w-full max-w-md">
  <CardHeader>
    <CardTitle>Responsive Card</CardTitle>
  </CardHeader>
  <CardContent>{/* Content automatically adapts */}</CardContent>
</Card>
```

**Key Features:**

- Uses `@container/card-header` for container queries
- Automatic grid layout adaptation: `grid-cols-[1fr_auto]` when actions are present
- Consistent padding across breakpoints: `px-6`, `py-6`

### 2. Button Component Sizing

Buttons provide multiple responsive sizes:

```tsx
// Size variants
<Button size="sm">Small</Button>      // h-8, compact spacing
<Button size="default">Default</Button> // h-9, standard spacing
<Button size="lg">Large</Button>      // h-10, generous spacing
<Button size="icon">Icon</Button>     // size-9, square aspect
```

### 3. Input Component Adaptability

Input components automatically adjust typography for mobile:

```tsx
<Input
  className="w-full" // Base mobile styling: text-base
  // Automatically becomes md:text-sm on larger screens
/>
```

## Responsive Utilities

### Typography Scale

Responsive typography using CSS custom properties:

```tsx
// Font sizes adapt smoothly across breakpoints
<h1 className="text-3xl md:text-5xl lg:text-7xl">Responsive Heading</h1>

// Available sizes: xs, sm, base, lg, xl, 2xl, 3xl, 4xl, 5xl, 6xl, 7xl, 8xl, 9xl
```

### Spacing System

Consistent spacing using design tokens:

```tsx
// Responsive spacing
<div className="p-4 md:p-6 lg:p-8">
  <div className="space-y-2 md:space-y-4">
    {/* Content with adaptive spacing */}
  </div>
</div>
```

### Border Radius

Adaptive border radius using CSS variables:

```tsx
<div className="rounded-sm">   {/* calc(var(--radius) - 4px) */}
<div className="rounded-md">   {/* calc(var(--radius) - 2px) */}
<div className="rounded-lg">   {/* var(--radius) - default */}
<div className="rounded-xl">   {/* calc(var(--radius) + 4px) */}
```

## Best Practices

### 1. Mobile-First Design

Always start with mobile styles and progressively enhance:

```tsx
// ✅ Good: Mobile-first approach
<div className="flex flex-col md:flex-row">
  <div className="w-full md:w-1/2">Content</div>
</div>

// ❌ Avoid: Desktop-first approach
<div className="flex flex-row md:flex-col">
  <div className="w-1/2 md:w-full">Content</div>
</div>
```

### 2. Container Queries

Use container queries for component-level responsiveness:

```tsx
// CardHeader uses container queries for internal layout
<CardHeader className="@container/card-header">
  {/* Layout adapts based on card width, not viewport */}
</CardHeader>
```

### 3. Flexible Layouts

Prefer flexbox and grid for adaptive layouts:

```tsx
// Adaptive grid that responds to available space
<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
  {items.map((item) => (
    <Card key={item.id}>{item.content}</Card>
  ))}
</div>
```

### 4. Touch-Friendly Interactions

Ensure adequate touch targets on mobile:

```tsx
// Buttons maintain minimum 44px touch target
<Button size="sm" className="min-h-[44px] sm:min-h-auto">
  Touch Friendly
</Button>
```

### 5. Data Attributes for Testing

Always include `data-testid` for reliable testing across breakpoints:

```tsx
<Button data-testid="submit-button" className="w-full sm:w-auto">
  Submit
</Button>
```

## Examples

### Responsive Navigation

```tsx
function Navigation() {
  return (
    <nav className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-8">
      <div className="w-full sm:w-auto">
        <Button
          variant="ghost"
          className="w-full justify-start sm:w-auto sm:justify-center"
        >
          Home
        </Button>
      </div>
    </nav>
  )
}
```

### Responsive Form Layout

```tsx
function ContactForm() {
  return (
    <form className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="first-name">First Name</Label>
          <Input id="first-name" className="w-full" />
        </div>
        <div>
          <Label htmlFor="last-name">Last Name</Label>
          <Input id="last-name" className="w-full" />
        </div>
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" className="w-full" />
      </div>
      <div className="flex flex-col gap-2 pt-4 sm:flex-row sm:gap-4">
        <Button type="submit" className="w-full sm:w-auto">
          Submit
        </Button>
        <Button type="button" variant="outline" className="w-full sm:w-auto">
          Cancel
        </Button>
      </div>
    </form>
  )
}
```

### Responsive Card Grid

```tsx
function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <Card key={product.id} className="h-full">
          <CardContent className="p-4">
            <img
              src={product.image}
              alt={product.name}
              className="mb-3 h-32 w-full rounded-md object-cover sm:h-40"
            />
            <h3 className="truncate text-sm font-semibold sm:text-base">
              {product.name}
            </h3>
            <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
              ${product.price}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
```

### Dark Mode Responsive Patterns

```tsx
function ThemedComponent() {
  return (
    <div className="bg-background border-border">
      {/* Colors automatically adapt to light/dark theme */}
      <Card className="hover:bg-accent/50 dark:hover:bg-accent/30">
        {/* Interaction states adapt to theme */}
        <Button
          variant="outline"
          className="dark:bg-input/30 dark:hover:bg-input/50"
        >
          Theme Aware Button
        </Button>
      </Card>
    </div>
  )
}
```

---

## Development Workflow

1. **Start Mobile**: Design and develop for mobile screens first
2. **Progressive Enhancement**: Add tablet and desktop styles using breakpoint prefixes
3. **Test Across Devices**: Use browser dev tools to test all breakpoints
4. **Container Queries**: Use `@container` queries for component-level responsiveness
5. **Accessibility**: Ensure touch targets and keyboard navigation work across all screen sizes

This documentation should be referenced when creating new components or modifying existing ones to ensure consistent responsive behavior across the Reflect application.
