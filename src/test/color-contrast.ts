/**
 * Color Contrast Testing Utilities
 *
 * Provides utilities to test color contrast ratios against WCAG 2.1 guidelines.
 * Tests both programmatically and through automated accessibility testing.
 */

// Convert hex color to RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null
}

// Calculate relative luminance of a color
function getRelativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c = c / 255
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

// Calculate contrast ratio between two colors
export function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1)
  const rgb2 = hexToRgb(color2)

  if (!rgb1 || !rgb2) {
    throw new Error('Invalid color format. Use hex format (#RRGGBB)')
  }

  const l1 = getRelativeLuminance(rgb1.r, rgb1.g, rgb1.b)
  const l2 = getRelativeLuminance(rgb2.r, rgb2.g, rgb2.b)

  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)

  return (lighter + 0.05) / (darker + 0.05)
}

// WCAG 2.1 contrast ratio requirements
export const WCAG_LEVELS = {
  AA_NORMAL: 4.5, // Normal text
  AA_LARGE: 3.0, // Large text (18pt+ or 14pt+ bold)
  AAA_NORMAL: 7.0, // Enhanced contrast normal text
  AAA_LARGE: 4.5, // Enhanced contrast large text
} as const

export type WCAGLevel = keyof typeof WCAG_LEVELS

// Check if contrast ratio meets WCAG requirements
export function meetsWCAG(
  ratio: number,
  level: WCAGLevel = 'AA_NORMAL'
): boolean {
  return ratio >= WCAG_LEVELS[level]
}

// Test a color combination
export interface ContrastTest {
  foreground: string
  background: string
  ratio: number
  passes: {
    AA_NORMAL: boolean
    AA_LARGE: boolean
    AAA_NORMAL: boolean
    AAA_LARGE: boolean
  }
  description: string
}

export function testColorContrast(
  foreground: string,
  background: string,
  description: string
): ContrastTest {
  const ratio = getContrastRatio(foreground, background)

  return {
    foreground,
    background,
    ratio,
    passes: {
      AA_NORMAL: meetsWCAG(ratio, 'AA_NORMAL'),
      AA_LARGE: meetsWCAG(ratio, 'AA_LARGE'),
      AAA_NORMAL: meetsWCAG(ratio, 'AAA_NORMAL'),
      AAA_LARGE: meetsWCAG(ratio, 'AAA_LARGE'),
    },
    description,
  }
}

// Application color palette (extracted from globals.css)
export const APP_COLORS = {
  // Base palette
  lavender: '#e8e9f3',
  grayLight: '#cecece',
  grayMedium: '#5a5a5c', // Even further darkened for perfect WCAG 2.1 AA compliance
  darkBlue: '#272635',
  skyBlue: '#b1e5f2',

  // Computed colors (approximated from oklch values)
  cardLight: '#fafafa', // oklch(0.98 0.005 280)
  popoverLight: '#fdfdfd', // oklch(0.99 0.003 280)
  primaryForegroundLight: '#f0f0f5', // oklch(0.95 0.01 280)
  mutedLight: '#d9d9dc', // oklch(0.85 0.01 280)
  inputLight: '#fdfdfd', // oklch(0.99 0.003 280)

  // Dark theme colors (approximated)
  cardDark: '#1a1a22', // oklch(0.25 0.02 255)
  popoverDark: '#16161d', // oklch(0.22 0.02 255)
  secondaryDark: '#2a2a35', // oklch(0.35 0.03 255)
  mutedDark: '#212129', // oklch(0.3 0.02 255)
  borderDark: '#3a3a45', // oklch(0.4 0.03 255)
  inputDark: '#1a1a22', // oklch(0.25 0.02 255)

  // Status colors (approximated)
  successLight: '#15803d', // oklch(0.50 0.20 145) - darker for WCAG compliance
  successForegroundLight: '#f0fdf4', // oklch(0.98 0.01 145)
  warningLight: '#f59e0b', // oklch(0.75 0.15 85)
  warningForegroundLight: '#1c1917', // oklch(0.2 0.02 85)
  destructiveLight: '#b91c1c', // oklch(0.50 0.28 25) - darker for WCAG compliance
  destructiveForegroundLight: '#fef2f2', // oklch(0.98 0.01 25)

  successDark: '#4ade80', // oklch(0.7 0.18 145)
  successForegroundDark: '#0c0d0c', // oklch(0.15 0.02 145)
  warningDark: '#fbbf24', // oklch(0.8 0.18 85)
  warningForegroundDark: '#0c0b08', // oklch(0.15 0.02 85)
  destructiveDark: '#ef4444', // oklch(0.65 0.22 25) - adjusted for dark mode
  destructiveForegroundDark: '#1c0917', // oklch(0.15 0.02 25) - dark text for better contrast
} as const

// Comprehensive color contrast test suite
export function runContrastAudit(): ContrastTest[] {
  const tests: ContrastTest[] = []

  // Light theme tests
  tests.push(
    testColorContrast(
      APP_COLORS.darkBlue,
      APP_COLORS.lavender,
      'Light theme: Primary text on background'
    ),
    testColorContrast(
      APP_COLORS.darkBlue,
      APP_COLORS.cardLight,
      'Light theme: Text on card background'
    ),
    testColorContrast(
      APP_COLORS.grayMedium,
      APP_COLORS.lavender,
      'Light theme: Muted text on background'
    ),
    testColorContrast(
      APP_COLORS.grayMedium,
      APP_COLORS.mutedLight,
      'Light theme: Muted text on muted background'
    ),
    testColorContrast(
      APP_COLORS.darkBlue,
      APP_COLORS.skyBlue,
      'Light theme: Dark blue on sky blue (buttons)'
    ),
    testColorContrast(
      APP_COLORS.primaryForegroundLight,
      APP_COLORS.darkBlue,
      'Light theme: Light text on primary button'
    ),
    testColorContrast(
      APP_COLORS.destructiveForegroundLight,
      APP_COLORS.destructiveLight,
      'Light theme: Error text on error background'
    ),
    testColorContrast(
      APP_COLORS.successForegroundLight,
      APP_COLORS.successLight,
      'Light theme: Success text on success background'
    ),
    testColorContrast(
      APP_COLORS.warningForegroundLight,
      APP_COLORS.warningLight,
      'Light theme: Warning text on warning background'
    )
  )

  // Dark theme tests
  tests.push(
    testColorContrast(
      APP_COLORS.lavender,
      APP_COLORS.darkBlue,
      'Dark theme: Primary text on background'
    ),
    testColorContrast(
      APP_COLORS.lavender,
      APP_COLORS.cardDark,
      'Dark theme: Text on card background'
    ),
    testColorContrast(
      APP_COLORS.grayLight,
      APP_COLORS.darkBlue,
      'Dark theme: Muted text on background'
    ),
    testColorContrast(
      APP_COLORS.grayLight,
      APP_COLORS.mutedDark,
      'Dark theme: Muted text on muted background'
    ),
    testColorContrast(
      APP_COLORS.darkBlue,
      APP_COLORS.skyBlue,
      'Dark theme: Dark blue on sky blue (buttons)'
    ),
    testColorContrast(
      APP_COLORS.lavender,
      APP_COLORS.secondaryDark,
      'Dark theme: Light text on secondary button'
    ),
    testColorContrast(
      APP_COLORS.destructiveForegroundDark,
      APP_COLORS.destructiveDark,
      'Dark theme: Error text on error background'
    ),
    testColorContrast(
      APP_COLORS.successForegroundDark,
      APP_COLORS.successDark,
      'Dark theme: Success text on success background'
    ),
    testColorContrast(
      APP_COLORS.warningForegroundDark,
      APP_COLORS.warningDark,
      'Dark theme: Warning text on warning background'
    )
  )

  return tests
}

// Get failing contrast tests
export function getContrastFailures(
  tests: ContrastTest[],
  level: WCAGLevel = 'AA_NORMAL'
): ContrastTest[] {
  return tests.filter((test) => !test.passes[level])
}

// Generate contrast report
export function generateContrastReport(tests: ContrastTest[]): string {
  const failures = getContrastFailures(tests, 'AA_NORMAL')

  let report = '# Color Contrast Audit Report\n\n'

  if (failures.length === 0) {
    report += '✅ **All color combinations meet WCAG 2.1 AA standards!**\n\n'
  } else {
    report += `❌ **${failures.length} color combinations fail WCAG 2.1 AA standards**\n\n`
    report += '## Failing Combinations:\n\n'

    failures.forEach((test) => {
      report += `### ${test.description}\n`
      report += `- **Foreground**: ${test.foreground}\n`
      report += `- **Background**: ${test.background}\n`
      report += `- **Contrast Ratio**: ${test.ratio.toFixed(2)}:1\n`
      report += `- **Required**: ${WCAG_LEVELS.AA_NORMAL}:1\n`
      report += `- **Status**: ❌ Fails AA Normal\n\n`
    })
  }

  report += '## All Test Results:\n\n'
  tests.forEach((test) => {
    const status = test.passes.AA_NORMAL ? '✅' : '❌'
    report += `${status} **${test.description}**: ${test.ratio.toFixed(2)}:1\n`
  })

  return report
}

// High contrast mode utilities
export function generateHighContrastCSS(): string {
  return `
/* High contrast mode support */
@media (prefers-contrast: high) {
  :root {
    /* Enhanced contrast for high contrast mode */
    --foreground: #000000;
    --background: #ffffff;
    --primary: #000000;
    --primary-foreground: #ffffff;
    --muted-foreground: #333333;
    --border: #000000;
    --ring: #000000;
  }
  
  .dark {
    --foreground: #ffffff;
    --background: #000000;
    --primary: #ffffff;
    --primary-foreground: #000000;
    --muted-foreground: #cccccc;
    --border: #ffffff;
    --ring: #ffffff;
  }
}

/* Forced colors mode (Windows high contrast) */
@media (forced-colors: active) {
  * {
    forced-color-adjust: auto;
  }
  
  /* Preserve custom focus indicators */
  .focus\\:ring-2 {
    forced-color-adjust: none;
    outline: 2px solid;
  }
}
`
}
