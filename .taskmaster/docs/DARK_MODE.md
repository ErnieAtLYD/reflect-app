# Dark Mode Implementation Guide

This document provides comprehensive guidance for implementing and using dark mode in the Reflect App.

## Overview

The Reflect App implements a complete dark/light mode system using:

- **next-themes** for theme management and persistence
- **Tailwind CSS v4** with custom dark mode variants
- Automatic system preference detection
- SSR-safe hydration

## Theme Provider Setup

The theme system is already configured and integrated into the app:

```tsx
// src/components/theme-provider.tsx
import { ThemeProvider as NextThemesProvider } from 'next-themes'

export function ThemeProvider({ children, ...props }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  )
}
```

The provider is integrated in `src/app/layout.tsx` and wraps the entire application.

## Theme Toggle Components

### Basic Toggle (Icon Only)

```tsx
import { ThemeToggle } from '@/components/ui/theme-toggle'

// Simple toggle between light and dark
;<ThemeToggle />
```

### Advanced Toggle (with Labels)

```tsx
import { ThemeToggleAdvanced } from '@/components/ui/theme-toggle'

// Cycles through light, dark, and system with labels
;<ThemeToggleAdvanced />
```

## Using Themes in Components

### Accessing Theme State

```tsx
'use client'

import { useTheme } from 'next-themes'

function MyComponent() {
  const { theme, setTheme } = useTheme()

  return (
    <div>
      <p>Current theme: {theme}</p>
      <button onClick={() => setTheme('dark')}>Dark</button>
      <button onClick={() => setTheme('light')}>Light</button>
      <button onClick={() => setTheme('system')}>System</button>
    </div>
  )
}
```

### Handling SSR/Hydration

Always handle mounted state when using theme information:

```tsx
'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

function ThemeAwareComponent() {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div>Loading...</div> // Or your loading state
  }

  return <div>Current theme: {theme}</div>
}
```

## Styling with Dark Mode

### Using Tailwind Dark Mode Classes

The app uses Tailwind's class-based dark mode strategy with a custom variant:

```css
/* In globals.css */
@custom-variant dark (&:is(.dark *));
```

Apply dark mode styles using the `dark:` prefix:

```tsx
// Basic dark mode styling
<div className="bg-white dark:bg-gray-900 text-black dark:text-white">
  Content that adapts to theme
</div>

// Using theme color variables (recommended)
<div className="bg-background text-foreground">
  Content using semantic color tokens
</div>
```

### Color System

The app uses semantic color tokens that automatically adapt to themes:

#### Primary Colors

- `bg-background` / `text-foreground` - Main background and text
- `bg-card` / `text-card-foreground` - Card backgrounds
- `bg-primary` / `text-primary-foreground` - Primary actions

#### Interactive Colors

- `bg-secondary` / `text-secondary-foreground` - Secondary elements
- `bg-muted` / `text-muted-foreground` - Subdued content
- `bg-accent` / `text-accent-foreground` - Hover states

#### State Colors

- `text-destructive` - Errors and warnings
- `border-input` - Form field borders
- `ring-ring` - Focus indicators

### Component Examples

#### Button with Dark Mode Support

```tsx
// Button component already includes dark mode variants
<Button variant="outline">
  {/* Automatically handles dark mode styling */}
</Button>
```

#### Custom Component with Dark Mode

```tsx
function CustomCard({ children }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 text-gray-900 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100">
      {children}
    </div>
  )
}
```

## Component Dark Mode Support

All UI components include comprehensive dark mode support:

### Form Components

- **Input**: `dark:bg-input/30` background, proper focus states
- **Textarea**: Dark variants for all visual states
- **Label**: Uses semantic color tokens

### Feedback Components

- **Button**: Dark hover states and proper contrast
- **ErrorMessage**: `dark:border-destructive/40` and `dark:bg-destructive/10`
- **LoadingSpinner**: Uses theme-aware color tokens
- **Feedback**: Green/red states with dark mode variants

### Layout Components

- **Card**: Uses semantic `bg-card` and `text-card-foreground` tokens

## Best Practices

### 1. Use Semantic Color Tokens

**Preferred:**

```tsx
<div className="bg-background text-foreground border-border">
```

**Avoid:**

```tsx
<div className="bg-white dark:bg-black text-black dark:text-white">
```

### 2. Test Both Themes

Always test components in both light and dark modes:

```tsx
// Use theme toggle during development
<ThemeToggle />
```

### 3. Ensure Proper Contrast

All colors meet WCAG contrast requirements:

- Normal text: minimum 4.5:1 contrast ratio
- Large text: minimum 3:1 contrast ratio

### 4. Handle Loading States

Use skeleton loading or fallbacks during hydration:

```tsx
if (!mounted) {
  return <Button variant="outline" size="icon" disabled />
}
```

### 5. Avoid Theme-Specific Logic

Let CSS handle theme switching instead of JavaScript:

**Preferred:**

```tsx
<div className="bg-white dark:bg-gray-900">
```

**Avoid:**

```tsx
<div className={theme === 'dark' ? 'bg-gray-900' : 'bg-white'}>
```

## Testing Dark Mode

### Manual Testing

1. Use the theme toggle components to switch between modes
2. Test all interactive states (hover, focus, disabled)
3. Verify content remains readable in both themes
4. Check that system preference detection works

### Automated Testing

```tsx
// Test theme switching in component tests
import { render } from '@testing-library/react'
import { ThemeProvider } from '@/components/theme-provider'

describe('Component dark mode', () => {
  it('renders correctly in dark mode', () => {
    render(
      <ThemeProvider defaultTheme="dark">
        <YourComponent />
      </ThemeProvider>
    )
    // Test dark mode styling
  })
})
```

### Browser DevTools

Use browser DevTools to simulate system preferences:

1. Open DevTools → Rendering tab
2. Set "Emulate CSS media feature prefers-color-scheme"
3. Switch between light/dark to test system detection

## Troubleshooting

### Common Issues

**Hydration Mismatch:**

- Always use `mounted` state before rendering theme-dependent content
- Use `suppressHydrationWarning` on html element (already configured)

**Flash of Wrong Theme:**

- next-themes handles this automatically with proper script injection
- Ensure ThemeProvider wraps your app correctly

**Colors Not Updating:**

- Check that you're using CSS variables instead of hard-coded colors
- Verify the dark mode classes are applied to the html element

### Debugging

```tsx
// Debug current theme state
function ThemeDebug() {
  const { theme, resolvedTheme, systemTheme } = useTheme()

  return (
    <div>
      <p>Theme: {theme}</p>
      <p>Resolved: {resolvedTheme}</p>
      <p>System: {systemTheme}</p>
    </div>
  )
}
```

## Migration Guide

If adding dark mode to existing components:

1. **Replace hard-coded colors** with semantic tokens
2. **Add dark mode variants** where needed
3. **Test thoroughly** in both themes
4. **Update component documentation** with dark mode examples

## Further Reading

- [next-themes Documentation](https://github.com/pacocoursey/next-themes)
- [Tailwind CSS Dark Mode](https://tailwindcss.com/docs/dark-mode)
- [WCAG Color Contrast Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)
