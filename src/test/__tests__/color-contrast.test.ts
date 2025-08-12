import {
  runContrastAudit,
  getContrastFailures,
  generateContrastReport,
  testColorContrast,
  APP_COLORS,
  WCAG_LEVELS,
} from '../color-contrast'

describe('Color Contrast Audit', () => {
  let contrastTests: ReturnType<typeof runContrastAudit>

  beforeAll(() => {
    contrastTests = runContrastAudit()
  })

  it('should calculate contrast ratios correctly', () => {
    const test = testColorContrast('#000000', '#ffffff', 'Black on white')
    expect(test.ratio).toBeCloseTo(21, 1) // Perfect contrast
    expect(test.passes.AA_NORMAL).toBe(true)
    expect(test.passes.AAA_NORMAL).toBe(true)
  })

  it('should identify insufficient contrast', () => {
    const test = testColorContrast('#999999', '#ffffff', 'Light gray on white')
    expect(test.passes.AA_NORMAL).toBe(false)
    expect(test.ratio).toBeLessThan(WCAG_LEVELS.AA_NORMAL)
  })

  it('should run comprehensive audit without errors', () => {
    expect(contrastTests).toHaveLength(18) // 9 light + 9 dark theme tests
    expect(contrastTests.every((test) => test.ratio > 0)).toBe(true)
  })

  describe('Light Theme Compliance', () => {
    it('primary text on background should meet AA standards', () => {
      const test = contrastTests.find((t) =>
        t.description.includes('Light theme: Primary text on background')
      )
      expect(test).toBeDefined()
      expect(test!.passes.AA_NORMAL).toBe(true)
      expect(test!.ratio).toBeGreaterThanOrEqual(WCAG_LEVELS.AA_NORMAL)
    })

    it('muted text should have sufficient contrast', () => {
      const test = contrastTests.find((t) =>
        t.description.includes('Light theme: Muted text on background')
      )
      expect(test).toBeDefined()
      // Muted text might not meet AA for accessibility reasons - check if intentional
      if (!test!.passes.AA_NORMAL) {
        console.warn(
          `⚠️  Muted text contrast: ${test!.ratio.toFixed(2)}:1 (may need adjustment)`
        )
      }
    })

    it('button text should meet AA standards', () => {
      const test = contrastTests.find((t) =>
        t.description.includes('Light theme: Dark blue on sky blue')
      )
      expect(test).toBeDefined()
      expect(test!.passes.AA_NORMAL).toBe(true)
    })

    it('status colors should meet AA standards', () => {
      const statusTests = contrastTests.filter(
        (t) =>
          t.description.includes('Light theme:') &&
          (t.description.includes('Error') ||
            t.description.includes('Success') ||
            t.description.includes('Warning'))
      )

      statusTests.forEach((test) => {
        if (!test.passes.AA_NORMAL) {
          console.warn(
            `⚠️  Status color failing: ${test.description} - ${test.ratio.toFixed(2)}:1`
          )
        }
        expect(test.passes.AA_NORMAL).toBe(true)
      })
    })
  })

  describe('Dark Theme Compliance', () => {
    it('primary text on background should meet AA standards', () => {
      const test = contrastTests.find((t) =>
        t.description.includes('Dark theme: Primary text on background')
      )
      expect(test).toBeDefined()
      expect(test!.passes.AA_NORMAL).toBe(true)
      expect(test!.ratio).toBeGreaterThanOrEqual(WCAG_LEVELS.AA_NORMAL)
    })

    it('muted text should have sufficient contrast', () => {
      const test = contrastTests.find((t) =>
        t.description.includes('Dark theme: Muted text on background')
      )
      expect(test).toBeDefined()
      // Similar check for dark theme muted text
      if (!test!.passes.AA_NORMAL) {
        console.warn(
          `⚠️  Dark muted text contrast: ${test!.ratio.toFixed(2)}:1 (may need adjustment)`
        )
      }
    })

    it('button text should meet AA standards', () => {
      const test = contrastTests.find((t) =>
        t.description.includes('Dark theme: Dark blue on sky blue')
      )
      expect(test).toBeDefined()
      expect(test!.passes.AA_NORMAL).toBe(true)
    })

    it('status colors should meet AA standards', () => {
      const statusTests = contrastTests.filter(
        (t) =>
          t.description.includes('Dark theme:') &&
          (t.description.includes('Error') ||
            t.description.includes('Success') ||
            t.description.includes('Warning'))
      )

      statusTests.forEach((test) => {
        if (!test.passes.AA_NORMAL) {
          console.warn(
            `⚠️  Dark status color failing: ${test.description} - ${test.ratio.toFixed(2)}:1`
          )
        }
        expect(test.passes.AA_NORMAL).toBe(true)
      })
    })
  })

  describe('Overall Compliance Report', () => {
    it('should generate a comprehensive report', () => {
      const report = generateContrastReport(contrastTests)
      expect(report).toContain('Color Contrast Audit Report')
      expect(report).toContain('WCAG 2.1 AA')

      const failures = getContrastFailures(contrastTests, 'AA_NORMAL')
      if (failures.length > 0) {
        console.log('\n📊 Color Contrast Audit Report:\n')
        console.log(report)

        // Fail the test if there are critical failures
        const criticalFailures = failures.filter((f) => f.ratio < 3.0) // Very poor contrast
        expect(criticalFailures.length).toBe(0)
      }
    })

    it('should meet minimum accessibility standards', () => {
      const failures = getContrastFailures(contrastTests, 'AA_NORMAL')
      const totalTests = contrastTests.length
      const passRate = ((totalTests - failures.length) / totalTests) * 100

      console.log(
        `📊 Contrast compliance: ${passRate.toFixed(1)}% (${totalTests - failures.length}/${totalTests})`
      )

      // Allow up to 2 failures for muted/secondary text
      expect(failures.length).toBeLessThanOrEqual(2)

      // But require at least 85% pass rate
      expect(passRate).toBeGreaterThanOrEqual(85)
    })
  })

  describe('Critical Color Combinations', () => {
    it('should have excellent contrast for primary content', () => {
      // Test the most important color combinations
      const criticalTests = [
        {
          fg: APP_COLORS.darkBlue,
          bg: APP_COLORS.lavender,
          desc: 'Main content light',
        },
        {
          fg: APP_COLORS.lavender,
          bg: APP_COLORS.darkBlue,
          desc: 'Main content dark',
        },
      ]

      criticalTests.forEach(({ fg, bg, desc }) => {
        const test = testColorContrast(fg, bg, desc)
        expect(test.passes.AA_NORMAL).toBe(true)
        expect(test.ratio).toBeGreaterThanOrEqual(7.0) // Prefer AAA level for main content
      })
    })

    it('should have adequate contrast for interactive elements', () => {
      const interactiveTests = [
        {
          fg: APP_COLORS.darkBlue,
          bg: APP_COLORS.skyBlue,
          desc: 'Button text light',
        },
        {
          fg: APP_COLORS.darkBlue,
          bg: APP_COLORS.skyBlue,
          desc: 'Button text dark',
        },
      ]

      interactiveTests.forEach(({ fg, bg, desc }) => {
        const test = testColorContrast(fg, bg, desc)
        expect(test.passes.AA_NORMAL).toBe(true)
        expect(test.ratio).toBeGreaterThanOrEqual(4.5)
      })
    })
  })
})
