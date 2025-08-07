/**
 * AI API Integration Test Script
 *
 * Tests the /api/reflect endpoint with various journal entry samples
 * to verify AI responses match the expected format.
 */

const JOURNAL_SAMPLES = [
  {
    name: 'Daily Reflection',
    content:
      'Today was a challenging day at work. I had to deal with several difficult clients, but I managed to stay calm and find solutions. I feel proud of how I handled the situations and learned that I can be more resilient than I thought. The experience taught me to trust my problem-solving abilities more.',
  },
  {
    name: 'Personal Growth',
    content:
      "I've been thinking about my relationships lately. I realized I have a tendency to avoid difficult conversations, which sometimes makes things worse. Today I decided to have an honest talk with my friend about something that had been bothering me. It went better than expected, and I feel like our friendship is stronger now. I want to practice being more direct and honest in my communications.",
  },
  {
    name: 'Career Reflection',
    content:
      "Had my performance review today. My manager gave me mostly positive feedback, but pointed out that I need to work on taking more initiative on projects. At first I felt defensive, but then I realized they're right. I do tend to wait for clear instructions instead of proposing solutions. I'm going to start brainstorming ideas for our next team meeting and volunteer to lead a small project.",
  },
  {
    name: 'Emotional Processing',
    content:
      "I'm feeling anxious about the upcoming presentation next week. My mind keeps racing through all the things that could go wrong. I know I'm prepared and my content is solid, but I can't seem to shake this nervous energy. Maybe I should practice my presentation a few more times and try some relaxation techniques. I remember that last time I felt this way, things turned out fine.",
  },
  {
    name: 'Life Transition',
    content:
      "Moving to a new city has been harder than I expected. I miss my old friends and familiar places. Everything feels uncertain right now, and I'm questioning whether I made the right decision. But I also know that growth often comes from discomfort. I need to give myself time to adjust and be patient with the process. Maybe I should focus on finding one new thing to explore each week.",
  },
  {
    name: 'Achievement Reflection',
    content:
      "Finally finished reading that book I've been working on for months! It feels good to complete something I set out to do. The book gave me new perspectives on productivity and time management. I want to implement some of the strategies I learned, especially around setting boundaries and saying no to commitments that don't align with my goals.",
  },
  {
    name: 'Relationship Insight',
    content:
      "Had dinner with my parents tonight. We talked about my childhood, and they shared some stories I hadn't heard before. It made me realize how much they've sacrificed for our family. I often take their support for granted, but tonight I felt really grateful. I should make more effort to show appreciation and spend quality time with them while they're healthy.",
  },
  {
    name: 'Creative Block',
    content:
      "Been struggling with writer's block for weeks now. Every time I sit down to write, my mind goes blank. It's frustrating because I have so many ideas swirling in my head, but I can't seem to get them on paper. Maybe I'm putting too much pressure on myself to create something perfect. Tomorrow I'm going to try just writing stream-of-consciousness for 15 minutes without worrying about quality.",
  },
]

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

/**
 * Test a single journal entry sample
 */
async function testJournalSample(sample) {
  console.log(`\n🧪 Testing: ${sample.name}`)
  console.log(`📝 Content: ${sample.content.substring(0, 100)}...`)

  try {
    const response = await fetch(`${BASE_URL}/api/reflect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: sample.content,
        preferences: {
          tone: 'supportive',
          focusAreas: ['growth', 'patterns'],
        },
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.log(`❌ Error (${response.status}):`, data.message)
      if (data.error === 'rate_limit' && data.retryAfter) {
        console.log(`⏰ Rate limited. Retry after ${data.retryAfter} seconds`)
      }
      return { success: false, error: data }
    }

    // Validate response format
    const validationResults = validateResponseFormat(data)

    if (validationResults.isValid) {
      console.log('✅ Response format valid')
      console.log(`📊 Summary: ${data.summary}`)
      console.log(`🔍 Pattern: ${data.pattern}`)
      console.log(`💡 Suggestion: ${data.suggestion}`)
      console.log(
        `🤖 Model: ${data.metadata.model} (${data.metadata.processingTimeMs}ms)`
      )
    } else {
      console.log('❌ Invalid response format:', validationResults.errors)
    }

    return {
      success: validationResults.isValid,
      data,
      errors: validationResults.errors,
    }
  } catch (error) {
    console.log('❌ Network/Parse Error:', error.message)
    return { success: false, error: error.message }
  }
}

/**
 * Validate that the API response matches expected format
 */
function validateResponseFormat(data) {
  const errors = []

  // Check required fields exist
  if (!data.summary) errors.push('Missing summary field')
  if (!data.pattern) errors.push('Missing pattern field')
  if (!data.suggestion) errors.push('Missing suggestion field')
  if (!data.metadata) errors.push('Missing metadata field')

  // Check field types
  if (data.summary && typeof data.summary !== 'string') {
    errors.push('Summary must be a string')
  }
  if (data.pattern && typeof data.pattern !== 'string') {
    errors.push('Pattern must be a string')
  }
  if (data.suggestion && typeof data.suggestion !== 'string') {
    errors.push('Suggestion must be a string')
  }

  // Check metadata format
  if (data.metadata) {
    if (!data.metadata.model) errors.push('Missing metadata.model')
    if (!data.metadata.processedAt) errors.push('Missing metadata.processedAt')
    if (typeof data.metadata.processingTimeMs !== 'number') {
      errors.push('metadata.processingTimeMs must be a number')
    }
  }

  // Check content quality
  if (data.summary && data.summary.length < 10) {
    errors.push('Summary too short (< 10 characters)')
  }
  if (data.pattern && data.pattern.length < 10) {
    errors.push('Pattern too short (< 10 characters)')
  }
  if (data.suggestion && data.suggestion.length < 10) {
    errors.push('Suggestion too short (< 10 characters)')
  }

  // Check for duplicate content
  if (data.summary === data.pattern) {
    errors.push('Summary and pattern are identical')
  }
  if (data.summary === data.suggestion) {
    errors.push('Summary and suggestion are identical')
  }
  if (data.pattern === data.suggestion) {
    errors.push('Pattern and suggestion are identical')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Test various error scenarios
 */
async function testErrorScenarios() {
  console.log('\n🚨 Testing Error Scenarios\n')

  const errorTests = [
    {
      name: 'Empty content',
      body: { content: '' },
      expectedStatus: 400,
    },
    {
      name: 'Too short content',
      body: { content: 'short' },
      expectedStatus: 400,
    },
    {
      name: 'Missing content field',
      body: { note: 'This should fail' },
      expectedStatus: 400,
    },
    {
      name: 'Invalid JSON (GET request)',
      method: 'GET',
      expectedStatus: 405,
    },
  ]

  for (const test of errorTests) {
    console.log(`🧪 Testing: ${test.name}`)

    try {
      const response = await fetch(`${BASE_URL}/api/reflect`, {
        method: test.method || 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: test.body ? JSON.stringify(test.body) : undefined,
      })

      const data = await response.json()

      if (response.status === test.expectedStatus) {
        console.log(`✅ Expected ${test.expectedStatus} status received`)
        console.log(`📝 Error message: ${data.message}`)
      } else {
        console.log(
          `❌ Expected ${test.expectedStatus}, got ${response.status}`
        )
      }
    } catch (error) {
      console.log('❌ Test failed:', error.message)
    }
  }
}

/**
 * Test rate limiting behavior
 */
async function testRateLimiting() {
  console.log('\n⏱️ Testing Rate Limiting\n')

  const testContent =
    "This is a test entry for rate limiting. It's long enough to pass validation and should trigger rate limits when sent multiple times quickly."

  console.log('Sending 12 requests quickly to test rate limiting...')

  const promises = []
  for (let i = 0; i < 12; i++) {
    promises.push(
      fetch(`${BASE_URL}/api/reflect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: testContent }),
      })
    )
  }

  const responses = await Promise.all(promises)

  let successCount = 0
  let rateLimitedCount = 0

  for (let i = 0; i < responses.length; i++) {
    const response = responses[i]
    console.log(`Request ${i + 1}: Status ${response.status}`)

    if (response.status === 200) {
      successCount++
    } else if (response.status === 429) {
      rateLimitedCount++
      const data = await response.json()
      console.log(`  ⏰ Rate limited. Retry after: ${data.retryAfter}s`)
    }
  }

  console.log(`\n📊 Rate Limiting Results:`)
  console.log(`✅ Successful requests: ${successCount}`)
  console.log(`⏱️ Rate limited requests: ${rateLimitedCount}`)
  console.log(
    `📝 Expected: ~10 success, ~2 rate limited (based on 10 RPM limit)`
  )
}

/**
 * Main test runner
 */
async function runTests() {
  console.log('🚀 Starting AI API Integration Tests')
  console.log(`🔗 Testing endpoint: ${BASE_URL}/api/reflect\n`)

  // Check if server is running
  try {
    const healthCheck = await fetch(`${BASE_URL}/api/reflect`, {
      method: 'GET',
    })
    if (healthCheck.status !== 405) {
      throw new Error('Server not responding correctly')
    }
    console.log('✅ Server is running\n')
  } catch (error) {
    console.log('❌ Server not accessible. Make sure to run `pnpm dev` first.')
    console.log(
      '💡 If running on different port, set NEXT_PUBLIC_BASE_URL environment variable'
    )
    return
  }

  const results = {
    total: JOURNAL_SAMPLES.length,
    successful: 0,
    failed: 0,
    errors: [],
  }

  // Test journal samples
  console.log('📝 Testing Journal Entry Samples')
  console.log('='.repeat(50))

  for (const sample of JOURNAL_SAMPLES) {
    const result = await testJournalSample(sample)

    if (result.success) {
      results.successful++
    } else {
      results.failed++
      results.errors.push({
        sample: sample.name,
        error: result.error || result.errors,
      })
    }

    // Small delay to avoid overwhelming the API
    await new Promise((resolve) => setTimeout(resolve, 500))
  }

  // Test error scenarios
  await testErrorScenarios()

  // Test rate limiting (optional - can be resource intensive)
  const testRates = process.argv.includes('--test-rates')
  if (testRates) {
    await testRateLimiting()
  } else {
    console.log('\n💡 Run with --test-rates flag to test rate limiting')
  }

  // Final summary
  console.log('\n' + '='.repeat(60))
  console.log('📊 FINAL TEST RESULTS')
  console.log('='.repeat(60))
  console.log(`✅ Successful tests: ${results.successful}/${results.total}`)
  console.log(`❌ Failed tests: ${results.failed}/${results.total}`)

  if (results.errors.length > 0) {
    console.log('\n🚨 Errors encountered:')
    results.errors.forEach((error) => {
      console.log(`  - ${error.sample}: ${JSON.stringify(error.error)}`)
    })
  }

  const successRate = (results.successful / results.total) * 100
  if (successRate >= 90) {
    console.log(`\n🎉 Excellent! ${successRate.toFixed(1)}% success rate`)
  } else if (successRate >= 75) {
    console.log(`\n👍 Good! ${successRate.toFixed(1)}% success rate`)
  } else {
    console.log(
      `\n⚠️ Needs improvement! ${successRate.toFixed(1)}% success rate`
    )
  }

  console.log('\n💡 To test with real OpenAI API:')
  console.log('   1. Add OPENAI_API_KEY to .env.local')
  console.log('   2. Start dev server: pnpm dev')
  console.log('   3. Run this script: node test-api-integration.js')
}

// Run tests if called directly
if (require.main === module) {
  runTests().catch(console.error)
}

module.exports = { testJournalSample, validateResponseFormat, runTests }
