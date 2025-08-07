#!/usr/bin/env node

/**
 * Edge Case Testing for AI API Integration
 *
 * Tests boundary conditions, special characters, and edge cases
 * that could cause the API to behave unexpectedly.
 */

const API_BASE = 'http://localhost:3000'

// Test cases for edge conditions
const edgeCases = [
  {
    name: 'Minimum valid length (10 chars)',
    content: 'I am okay',
    expectSuccess: true,
  },
  {
    name: 'Just under minimum (9 chars)',
    content: 'I am ok.',
    expectSuccess: false,
  },
  {
    name: 'Unicode and emojis',
    content:
      'Today was amazing! 😊 I felt so grateful for everything in my life. The café had the most delicious café au lait ☕ and I enjoyed reading under the beautiful 🌸 cherry blossoms.',
    expectSuccess: true,
  },
  {
    name: 'Multiple languages',
    content:
      'Today I felt nostalgic. Me sentí nostálgico. Je me sentais nostalgique. Ich fühlte mich nostalgisch. This mixture of languages reflects my multicultural background.',
    expectSuccess: true,
  },
  {
    name: 'Special characters and symbols',
    content:
      'I was working on code today: let x = (a + b) * c; console.log("Hello, World!"); It reminded me that even symbols & special characters have meaning in different contexts.',
    expectSuccess: true,
  },
  {
    name: 'Numbers and dates',
    content:
      "On January 15th, 2024, I turned 25 years old. The number 25 feels significant - it's 1/4 of a century! I've lived 9,125+ days so far.",
    expectSuccess: true,
  },
  {
    name: 'Repeated characters (should be rejected)',
    content: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    expectSuccess: false,
  },
  {
    name: 'Very long valid content (4900 chars)',
    content:
      'Today I spent time reflecting on my journey through life and all the experiences that have shaped me into who I am today. ' +
      'This has been a transformative year filled with challenges, growth, learning, and self-discovery. '.repeat(
        40
      ),
    expectSuccess: true,
  },
  {
    name: 'At character limit (5000 chars)',
    content: 'A'.repeat(4990) + 'reflection',
    expectSuccess: true,
  },
  {
    name: 'Over character limit (5001 chars)',
    content: 'A'.repeat(5001),
    expectSuccess: false,
  },
  {
    name: 'Only whitespace characters',
    content: '   \n\t   \r\n   ',
    expectSuccess: false,
  },
  {
    name: 'Mixed whitespace and minimal content',
    content: '   I feel    good   today   ',
    expectSuccess: true,
  },
  {
    name: 'Quotation marks and apostrophes',
    content:
      'I said "I can\'t believe it\'s working!" The response was "That\'s amazing!" It felt surreal to hear those words.',
    expectSuccess: true,
  },
  {
    name: 'HTML-like content',
    content:
      "Today I learned about <courage> and </fear>. These aren't HTML tags, but they represent the boundaries of my comfort zone.",
    expectSuccess: true,
  },
  {
    name: 'JSON-like content',
    content:
      'My emotions today: {"happy": true, "anxious": false, "grateful": "very much"}. Sometimes I think in data structures!',
    expectSuccess: true,
  },
  {
    name: 'Newlines and formatting',
    content:
      'Today I wrote:\n\nLine 1: I am grateful\nLine 2: I am growing\nLine 3: I am learning\n\nThis structure helps me think clearly.',
    expectSuccess: true,
  },
  {
    name: 'Mixed case and punctuation',
    content:
      "WOW!!! today was INCREDIBLE... I can't believe how AMAZING everything turned out??? Mixed emotions: happy & confused!",
    expectSuccess: true,
  },
]

async function testEdgeCase(testCase) {
  const { name, content, expectSuccess } = testCase

  console.log(`\n🧪 Testing: ${name}`)
  console.log(`📏 Length: ${content.length} characters`)
  console.log(
    `📝 Content: ${content.substring(0, 80)}${content.length > 80 ? '...' : ''}`
  )

  try {
    const startTime = Date.now()

    const response = await fetch(`${API_BASE}/api/reflect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    })

    const data = await response.json()
    const duration = Date.now() - startTime

    const actualSuccess = response.ok
    const testPassed = actualSuccess === expectSuccess

    console.log(`⏱️ Response time: ${duration}ms`)
    console.log(`📊 Status: ${response.status}`)

    if (testPassed) {
      console.log(
        `✅ Test passed (expected ${expectSuccess ? 'success' : 'failure'})`
      )

      if (actualSuccess) {
        console.log(`📖 Summary: ${data.summary.substring(0, 60)}...`)
        console.log(`🔍 Pattern: ${data.pattern.substring(0, 60)}...`)
        console.log(`💡 Suggestion: ${data.suggestion.substring(0, 60)}...`)

        // Validate response completeness for successful cases
        const hasAllFields =
          data.summary && data.pattern && data.suggestion && data.metadata
        if (!hasAllFields) {
          console.log(`⚠️ Warning: Response missing required fields`)
          return { passed: false, reason: 'Incomplete response' }
        }
      } else {
        console.log(`📝 Error: ${data.message}`)
        console.log(`🔍 Error type: ${data.error}`)
      }

      return { passed: true, duration, actualSuccess }
    } else {
      console.log(
        `❌ Test failed (expected ${expectSuccess ? 'success' : 'failure'}, got ${actualSuccess ? 'success' : 'failure'})`
      )

      if (!expectSuccess && actualSuccess) {
        console.log(
          `⚠️ Expected validation error but API processed content successfully`
        )
      } else if (expectSuccess && !actualSuccess) {
        console.log(
          `⚠️ Expected success but API rejected valid content: ${data.message}`
        )
      }

      return { passed: false, duration, actualSuccess, reason: data.message }
    }
  } catch (error) {
    console.log(`💥 Network/Parse error: ${error.message}`)
    return { passed: false, error: error.message }
  }
}

// Test response quality for edge cases
async function testResponseQuality() {
  console.log('\n🎯 Testing Response Quality for Complex Cases')
  console.log('============================================')

  const qualityTests = [
    {
      name: 'Technical journal entry',
      content:
        "Today I debugged a complex algorithm that was causing memory leaks in our application. The solution involved optimizing our data structures and implementing proper garbage collection. I learned that sometimes the most elegant code isn't always the most performant.",
    },
    {
      name: 'Creative expression',
      content:
        "I painted today and lost myself in the colors. Blue melted into purple, purple danced with yellow, and yellow sang with red. Each brushstroke felt like a word in a language I'm still learning to speak. Art is my meditation.",
    },
    {
      name: 'Philosophical reflection',
      content:
        "I've been contemplating the nature of time and how our perception of it changes with age. When I was younger, summers felt endless. Now, months pass like days. Is time accelerating, or am I just more aware of its passage?",
    },
  ]

  const results = []

  for (const test of qualityTests) {
    console.log(`\n🧪 Testing: ${test.name}`)

    try {
      const response = await fetch(`${API_BASE}/api/reflect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: test.content }),
      })

      const data = await response.json()

      if (response.ok) {
        console.log('✅ Response generated successfully')

        // Analyze response quality
        const summaryQuality = analyzeTextQuality(data.summary, 'summary')
        const patternQuality = analyzeTextQuality(data.pattern, 'pattern')
        const suggestionQuality = analyzeTextQuality(
          data.suggestion,
          'suggestion'
        )

        console.log(`📊 Summary quality: ${summaryQuality.score}/10`)
        console.log(`🔍 Pattern quality: ${patternQuality.score}/10`)
        console.log(`💡 Suggestion quality: ${suggestionQuality.score}/10`)

        const avgQuality =
          (summaryQuality.score +
            patternQuality.score +
            suggestionQuality.score) /
          3
        console.log(`📈 Overall quality: ${avgQuality.toFixed(1)}/10`)

        results.push({
          name: test.name,
          success: true,
          quality: avgQuality,
          data,
        })
      } else {
        console.log(`❌ Failed: ${data.message}`)
        results.push({ name: test.name, success: false })
      }
    } catch (error) {
      console.log(`💥 Error: ${error.message}`)
      results.push({ name: test.name, success: false, error: error.message })
    }

    await new Promise((resolve) => setTimeout(resolve, 1000))
  }

  return results
}

// Simple text quality analyzer
function analyzeTextQuality(text, type) {
  if (!text) return { score: 0, issues: ['Missing content'] }

  const issues = []
  let score = 10

  // Length checks
  if (text.length < 20) {
    issues.push('Too short')
    score -= 3
  } else if (text.length < 50) {
    score -= 1
  }

  if (text.length > 300) {
    issues.push('Very long')
    score -= 1
  }

  // Content quality checks
  if (!/[.!?]$/.test(text.trim())) {
    issues.push('No proper ending punctuation')
    score -= 1
  }

  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0)
  if (sentences.length < 1) {
    issues.push('No complete sentences')
    score -= 2
  }

  // Repetition check
  const words = text.toLowerCase().split(/\s+/)
  const wordCount = {}
  words.forEach((word) => {
    wordCount[word] = (wordCount[word] || 0) + 1
  })

  const maxWordCount = Math.max(...Object.values(wordCount))
  if (maxWordCount > words.length * 0.2) {
    issues.push('Excessive word repetition')
    score -= 2
  }

  // Type-specific checks
  if (type === 'summary' && sentences.length > 3) {
    issues.push('Summary too detailed')
    score -= 1
  }

  if (type === 'suggestion' && !text.toLowerCase().includes('consider')) {
    // Suggestions often use words like "consider", "try", "reflect"
    if (!text.toLowerCase().match(/try|reflect|think|explore|practice/)) {
      issues.push("Doesn't sound like actionable suggestion")
      score -= 1
    }
  }

  return { score: Math.max(0, score), issues }
}

// Main test runner
async function runEdgeCaseTests() {
  console.log('🚀 Starting Edge Case Testing')
  console.log('===============================')

  try {
    // Server health check
    const healthCheck = await fetch(`${API_BASE}/api/reflect`, {
      method: 'GET',
    })
    if (healthCheck.status !== 405) {
      throw new Error('Server not accessible')
    }
    console.log('✅ Server is running')

    const results = {
      total: edgeCases.length,
      passed: 0,
      failed: 0,
      errors: [],
    }

    // Test all edge cases
    console.log(`\n🧪 Running ${edgeCases.length} edge case tests`)
    console.log('='.repeat(50))

    for (const testCase of edgeCases) {
      const result = await testEdgeCase(testCase)

      if (result.passed) {
        results.passed++
      } else {
        results.failed++
        results.errors.push({
          test: testCase.name,
          reason: result.reason || result.error,
        })
      }

      // Small delay between tests
      await new Promise((resolve) => setTimeout(resolve, 300))
    }

    // Test response quality
    const qualityResults = await testResponseQuality()

    // Final report
    console.log('\n' + '='.repeat(60))
    console.log('📊 EDGE CASE TEST RESULTS')
    console.log('='.repeat(60))

    console.log(`✅ Passed tests: ${results.passed}/${results.total}`)
    console.log(`❌ Failed tests: ${results.failed}/${results.total}`)

    const successRate = (results.passed / results.total) * 100
    console.log(`📈 Success rate: ${successRate.toFixed(1)}%`)

    if (results.errors.length > 0) {
      console.log('\n🚨 Failed tests:')
      results.errors.forEach((error) => {
        console.log(`  - ${error.test}: ${error.reason}`)
      })
    }

    // Quality report
    const successfulQuality = qualityResults.filter((r) => r.success)
    if (successfulQuality.length > 0) {
      const avgQuality =
        successfulQuality.reduce((sum, r) => sum + r.quality, 0) /
        successfulQuality.length
      console.log(
        `\n🎯 Response quality: ${avgQuality.toFixed(1)}/10 (${successfulQuality.length} samples)`
      )
    }

    // Overall assessment
    if (successRate >= 90 && successfulQuality.every((r) => r.quality >= 7)) {
      console.log('\n🎉 EXCELLENT: API handles edge cases very well!')
    } else if (successRate >= 80) {
      console.log('\n👍 GOOD: API handles most edge cases correctly')
    } else {
      console.log('\n⚠️ NEEDS IMPROVEMENT: Several edge cases failing')
    }
  } catch (error) {
    console.error('💥 Test suite failed:', error.message)
    console.log('💡 Make sure the development server is running: pnpm dev')
  }
}

// Run if called directly
if (require.main === module) {
  runEdgeCaseTests()
}

module.exports = { testEdgeCase, analyzeTextQuality }
