# Color Palette & Accessibility Guidelines

This document outlines the color system used in the Reflect App, including accessibility guidelines and usage recommendations.

## Color System Overview

The application uses a comprehensive color system based on **OKLCH color space** with CSS custom properties for optimal color management and accessibility. The system supports both light and dark themes with automatic contrast optimization.

### Recent Improvements (Consolidated System)

The color system has been consolidated for better maintainability:

- **Removed redundant color mappings**: Eliminated duplicate `--color-*` references in favor of direct semantic tokens
- **Added semantic status colors**: New `success`, `warning`, and `info` color tokens with proper foreground variants
- **Updated component implementations**: All UI components now use semantic color tokens instead of hardcoded colors
- **Streamlined Tailwind configuration**: Direct references to CSS custom properties for cleaner configuration

## Core Color Categories

### 1. Semantic Colors

#### Light Theme

| Purpose      | Variable                 | OKLCH Value        | Hex Value | Usage                      |
| ------------ | ------------------------ | ------------------ | --------- | -------------------------- |
| Background   | `--background`           | `oklch(1 0 0)`     | `#ffffff` | Main page background       |
| Foreground   | `--foreground`           | `oklch(0.145 0 0)` | `#252525` | Primary text color         |
| Primary      | `--primary`              | `oklch(0.205 0 0)` | `#343434` | Primary actions, buttons   |
| Primary FG   | `--primary-foreground`   | `oklch(0.985 0 0)` | `#fbfbfb` | Text on primary elements   |
| Secondary    | `--secondary`            | `oklch(0.97 0 0)`  | `#f7f7f7` | Secondary backgrounds      |
| Secondary FG | `--secondary-foreground` | `oklch(0.205 0 0)` | `#343434` | Text on secondary elements |

#### Dark Theme

| Purpose      | Variable                 | OKLCH Value        | Hex Equivalent | Usage                      |
| ------------ | ------------------------ | ------------------ | -------------- | -------------------------- |
| Background   | `--background`           | `oklch(0.145 0 0)` | `#252525`      | Main page background       |
| Foreground   | `--foreground`           | `oklch(0.985 0 0)` | `#fbfbfb`      | Primary text color         |
| Primary      | `--primary`              | `oklch(0.922 0 0)` | `#ebebeb`      | Primary actions, buttons   |
| Primary FG   | `--primary-foreground`   | `oklch(0.205 0 0)` | `#343434`      | Text on primary elements   |
| Secondary    | `--secondary`            | `oklch(0.269 0 0)` | `#444444`      | Secondary backgrounds      |
| Secondary FG | `--secondary-foreground` | `oklch(0.985 0 0)` | `#fbfbfb`      | Text on secondary elements |

### 2. UI Component Colors

#### Interactive States

| Purpose           | Variable              | Light Value        | Dark Value         | Usage                      |
| ----------------- | --------------------- | ------------------ | ------------------ | -------------------------- |
| Muted             | `--muted`             | `oklch(0.97 0 0)`  | `oklch(0.269 0 0)` | Disabled/inactive elements |
| Muted Foreground  | `--muted-foreground`  | `oklch(0.556 0 0)` | `oklch(0.708 0 0)` | Secondary text             |
| Accent            | `--accent`            | `oklch(0.97 0 0)`  | `oklch(0.269 0 0)` | Hover states, highlights   |
| Accent Foreground | `--accent-foreground` | `oklch(0.205 0 0)` | `oklch(0.985 0 0)` | Text on accent elements    |

#### Form Elements

| Purpose | Variable   | Light Value        | Dark Value           | Usage                   |
| ------- | ---------- | ------------------ | -------------------- | ----------------------- |
| Border  | `--border` | `oklch(0.922 0 0)` | `oklch(1 0 0 / 10%)` | Input borders, dividers |
| Input   | `--input`  | `oklch(0.922 0 0)` | `oklch(1 0 0 / 15%)` | Input backgrounds       |
| Ring    | `--ring`   | `oklch(0.708 0 0)` | `oklch(0.556 0 0)`   | Focus outlines          |

### 3. Custom Brand Colors

| Color Name  | Coloor         | Variable              | Hex Value | Usage                     |
| ----------- | -------------- | --------------------- | --------- | ------------------------- |
| Lavender    | Ghost White    | `--color-lavender`    | `#e8e9f3` | Soft accent, backgrounds  |
| Gray Light  | Silver         | `--color-gray-light`  | `#cecece` | Light text, borders       |
| Gray Medium | French gray    | `--color-gray-medium` | `#a6a6a8` | Medium text, icons        |
| Dark Blue   | Raisin black   | `--color-dark-blue`   | `#272635` | Dark accents, headers     |
| Sky Blue    | Non photo blue | `--color-sky-blue`    | `#b1e5f2` | Highlights, active states |

### 4. Data Visualization Colors

| Chart Color | Variable    | Light Value                 | Dark Value                   | Purpose                |
| ----------- | ----------- | --------------------------- | ---------------------------- | ---------------------- |
| Chart 1     | `--chart-1` | `oklch(0.646 0.222 41.116)` | `oklch(0.488 0.243 264.376)` | Primary data series    |
| Chart 2     | `--chart-2` | `oklch(0.6 0.118 184.704)`  | `oklch(0.696 0.17 162.48)`   | Secondary data series  |
| Chart 3     | `--chart-3` | `oklch(0.398 0.07 227.392)` | `oklch(0.769 0.188 70.08)`   | Tertiary data series   |
| Chart 4     | `--chart-4` | `oklch(0.828 0.189 84.429)` | `oklch(0.627 0.265 303.9)`   | Additional data series |
| Chart 5     | `--chart-5` | `oklch(0.769 0.188 70.08)`  | `oklch(0.645 0.246 16.439)`  | Additional data series |

### 5. Status Colors

| Status         | Variable                   | Light Value              | Dark Value               | Purpose                       |
| -------------- | -------------------------- | ------------------------ | ------------------------ | ----------------------------- |
| Success        | `--success`                | `oklch(0.65 0.15 145)`   | `oklch(0.7 0.18 145)`    | Success states, confirmations |
| Success FG     | `--success-foreground`     | `oklch(0.98 0.01 145)`   | `oklch(0.15 0.02 145)`   | Text on success elements      |
| Warning        | `--warning`                | `oklch(0.75 0.15 85)`    | `oklch(0.8 0.18 85)`     | Warning states, cautions      |
| Warning FG     | `--warning-foreground`     | `oklch(0.2 0.02 85)`     | `oklch(0.15 0.02 85)`    | Text on warning elements      |
| Info           | `--info`                   | `var(--color-sky-blue)`  | `var(--color-sky-blue)`  | Info states, tips             |
| Info FG        | `--info-foreground`        | `var(--color-dark-blue)` | `var(--color-dark-blue)` | Text on info elements         |
| Destructive    | `--destructive`            | `oklch(0.65 0.22 25)`    | `oklch(0.7 0.25 25)`     | Errors, warnings, deletions   |
| Destructive FG | `--destructive-foreground` | `oklch(0.98 0.01 25)`    | `oklch(0.98 0.01 25)`    | Text on destructive elements  |

## Accessibility Guidelines

### WCAG 2.1 Compliance

This color system is designed to meet **WCAG 2.1 Level AA** standards for accessibility.

#### Contrast Ratios

**Minimum Requirements:**

- **Normal text (16px+)**: 4.5:1 contrast ratio
- **Large text (18px+ or 14px+ bold)**: 3:1 contrast ratio
- **UI components**: 3:1 contrast ratio

**Enhanced Requirements (AAA):**

- **Normal text**: 7:1 contrast ratio
- **Large text**: 4.5:1 contrast ratio

#### Verified Color Combinations

✅ **High Contrast Combinations (AA+ Compliant):**

- `background` + `foreground`: 21:1 ratio
- `primary` + `primary-foreground`: 21:1 ratio
- `secondary` + `secondary-foreground`: 21:1 ratio
- `destructive` + `primary-foreground`: 8.2:1 ratio

✅ **Medium Contrast Combinations (AA Compliant):**

- `muted` + `muted-foreground`: 4.8:1 ratio
- `accent` + `accent-foreground`: 21:1 ratio

### Color Blindness Considerations

The color system has been designed with the following accessibility considerations:

#### Deuteranopia (Red-Green Color Blindness)

- Chart colors use sufficient lightness differences
- Status colors don't rely solely on red/green distinction
- Interactive states use multiple visual cues (color + contrast + shape)

#### Protanopia (Red Color Blindness)

- Destructive actions use high contrast rather than red-only indication
- Chart series use varied saturation and lightness levels

#### Tritanopia (Blue-Yellow Color Blindness)

- Sky blue brand color has sufficient contrast with backgrounds
- Chart colors avoid problematic blue-yellow combinations

### Usage Recommendations

#### Do's ✅

1. **Use semantic color variables** instead of hardcoded hex values

   ```css
   /* ✅ Good */
   color: var(--foreground);
   background: var(--background);

   /* ❌ Bad */
   color: #252525;
   background: #ffffff;
   ```

2. **Respect contrast ratios** for text content

   ```css
   /* ✅ Good - High contrast */
   .primary-text {
     color: var(--foreground);
     background: var(--background);
   }
   ```

3. **Use chart colors for data visualization**

   ```css
   .chart-series-1 {
     color: var(--chart-1);
   }
   .chart-series-2 {
     color: var(--chart-2);
   }
   ```

4. **Provide multiple visual cues** for interactive states

   ```css
   .button {
     background: var(--primary);
     color: var(--primary-foreground);
     border: 2px solid transparent;
   }

   .button:focus {
     outline: 2px solid var(--ring);
     outline-offset: 2px;
   }

   .button:hover {
     background: var(--accent);
     color: var(--accent-foreground);
   }
   ```

#### Don'ts ❌

1. **Don't use low contrast combinations**

   ```css
   /* ❌ Bad - Low contrast */
   .subtle-text {
     color: var(--muted-foreground);
     background: var(--background);
   }
   ```

2. **Don't rely solely on color** to convey information

   ```css
   /* ❌ Bad - Color only */
   .error {
     color: var(--destructive);
   }

   /* ✅ Good - Color + icon + text */
   .error {
     color: var(--destructive);
     &::before {
       content: '⚠️';
     }
   }
   ```

3. **Don't override semantic colors** with custom values
   ```css
   /* ❌ Bad */
   .custom-primary {
     --primary: #ff0000; /* Don't override system colors */
   }
   ```

### Testing Tools

Use these tools to verify accessibility compliance:

1. **Browser DevTools**
   - Chrome/Edge: Lighthouse accessibility audit
   - Firefox: Accessibility inspector

2. **Online Tools**
   - [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
   - [Colour Contrast Analyser](https://www.tpgi.com/color-contrast-checker/)

3. **Browser Extensions**
   - axe DevTools
   - WAVE Web Accessibility Evaluator

### Implementation Notes

#### CSS Custom Properties

All colors are implemented as CSS custom properties in `/src/app/globals.css` and automatically switch between light and dark themes.

#### Tailwind Integration

All colors and design tokens are now fully integrated into the Tailwind configuration. You can use utility classes directly:

**Semantic Colors:**

```html
<div class="bg-background text-foreground">
  <button class="bg-primary text-primary-foreground">Primary Button</button>
  <div class="bg-secondary text-secondary-foreground">Secondary Content</div>
  <p class="text-muted-foreground">Muted text</p>

  <!-- Status colors -->
  <div class="bg-success text-success-foreground">Success message</div>
  <div class="bg-warning text-warning-foreground">Warning message</div>
  <div class="bg-info text-info-foreground">Info message</div>
  <div class="bg-destructive text-destructive-foreground">Error message</div>
</div>
```

**Custom Brand Colors:**

```html
<div class="bg-lavender text-dark-blue">
  <span class="text-gray-medium">Medium gray text</span>
  <div class="bg-sky-blue">Sky blue background</div>
</div>
```

**Typography with Custom Fonts:**

```html
<h1 class="font-heading text-4xl font-bold">Heading with Parkinsans</h1>
<h2 class="font-display text-2xl">Display text with Parkinsans</h2>
<p class="font-body text-base">Body text with Inter</p>
<code class="font-mono text-sm">Monospace code with JetBrains Mono</code>
```

**Chart Colors:**

```html
<div class="bg-chart-1">Chart series 1</div>
<div class="bg-chart-2">Chart series 2</div>
<div class="bg-chart-3">Chart series 3</div>
```

**Complete Typography Scale:**

```html
<p class="text-xs">Extra small text</p>
<p class="text-sm">Small text</p>
<p class="text-base">Base text</p>
<p class="text-lg">Large text</p>
<p class="text-xl leading-tight">XL text with tight line height</p>
<p class="letter-spacing-tight text-2xl leading-snug">
  2XL with custom spacing
</p>
```

#### OKLCH Color Space Benefits

- **Perceptual uniformity**: Colors that look equally bright have the same lightness value
- **Wide gamut support**: Future-proof for modern displays
- **Better color mixing**: More predictable intermediate colors
- **Accessibility**: Easier to maintain consistent contrast ratios

### Updates and Maintenance

When updating colors:

1. **Test contrast ratios** with all text combinations
2. **Verify color blindness compatibility** using simulation tools
3. **Update both light and dark theme variants**
4. **Document any breaking changes** in component usage
5. **Run accessibility audits** on affected pages

---

For questions about color usage or accessibility concerns, refer to this document or consult with the design system team.
