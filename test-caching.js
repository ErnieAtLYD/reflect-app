#!/usr/bin/env node

/**
 * Caching Test for AI API Integration
 *
 * Tests that the same content returns cached responses
 * and verifies response consistency.
 */

const API_BASE = 'http://localhost:3000'

const testContent =
  "Today I learned something important about patience. While working on a difficult problem, I found myself getting frustrated when the solution didn't come immediately. I took a step back, breathed deeply, and approached it with fresh eyes. The breakthrough came when I stopped forcing it and allowed my mind to work naturally. This experience reminded me that sometimes the best approach is to trust the process and give things time to unfold."

async function testCaching() {
  console.log('🧪 Testing API Response Caching')
  console.log('================================\n')

  console.log('📝 Test content:', testContent.substring(0, 100) + '...')
  console.log('📏 Length:', testContent.length, 'characters\n')

  // Make first request
  console.log('🔄 Making first request...')
  const start1 = Date.now()

  const response1 = await fetch(`${API_BASE}/api/reflect`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: testContent }),
  })

  const data1 = await response1.json()
  const duration1 = Date.now() - start1

  if (!response1.ok) {
    console.log('❌ First request failed:', data1.message)
    return
  }

  console.log('✅ First request successful')
  console.log('⏱️ Response time:', duration1 + 'ms')
  console.log('📊 Summary:', data1.summary)
  console.log('🔍 Pattern:', data1.pattern)
  console.log('💡 Suggestion:', data1.suggestion)
  console.log('')

  // Wait a moment
  console.log('⏱️ Waiting 2 seconds before second request...')
  await new Promise((resolve) => setTimeout(resolve, 2000))

  // Make second request with same content
  console.log('🔄 Making second request with identical content...')
  const start2 = Date.now()

  const response2 = await fetch(`${API_BASE}/api/reflect`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: testContent }),
  })

  const data2 = await response2.json()
  const duration2 = Date.now() - start2

  if (!response2.ok) {
    console.log('❌ Second request failed:', data2.message)
    return
  }

  console.log('✅ Second request successful')
  console.log('⏱️ Response time:', duration2 + 'ms')
  console.log('')

  // Compare responses
  console.log('🔍 Comparing responses:')
  console.log('=======================')

  const summaryMatch = data1.summary === data2.summary
  const patternMatch = data1.pattern === data2.pattern
  const suggestionMatch = data1.suggestion === data2.suggestion

  console.log('📊 Summary match:', summaryMatch ? '✅' : '❌')
  if (!summaryMatch) {
    console.log('   First:', data1.summary)
    console.log('   Second:', data2.summary)
  }

  console.log('🔍 Pattern match:', patternMatch ? '✅' : '❌')
  if (!patternMatch) {
    console.log('   First:', data1.pattern)
    console.log('   Second:', data2.pattern)
  }

  console.log('💡 Suggestion match:', suggestionMatch ? '✅' : '❌')
  if (!suggestionMatch) {
    console.log('   First:', data1.suggestion)
    console.log('   Second:', data2.suggestion)
  }

  console.log('')

  // Analyze performance
  console.log('⚡ Performance Analysis:')
  console.log('========================')
  console.log('First request:', duration1 + 'ms')
  console.log('Second request:', duration2 + 'ms')

  const speedup = duration1 / duration2
  const expectedCacheSpeedup = 10 // Expect cache to be at least 10x faster

  if (duration2 < duration1 / expectedCacheSpeedup) {
    console.log(
      `✅ Significant speedup detected (${speedup.toFixed(1)}x faster)`
    )
    console.log('🎯 Caching appears to be working!')
  } else {
    console.log(`⚠️ Limited speedup (${speedup.toFixed(1)}x faster)`)
    console.log('❓ Caching may not be working as expected')
  }

  console.log('')

  // Test with slightly modified content
  console.log('🔄 Testing with slightly modified content...')
  const modifiedContent =
    testContent + ' This is a small addition to test cache miss.'

  const start3 = Date.now()
  const response3 = await fetch(`${API_BASE}/api/reflect`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: modifiedContent }),
  })

  const data3 = await response3.json()
  const duration3 = Date.now() - start3

  if (response3.ok) {
    console.log('✅ Modified content request successful')
    console.log('⏱️ Response time:', duration3 + 'ms')

    const isDifferent =
      data3.summary !== data1.summary ||
      data3.pattern !== data1.pattern ||
      data3.suggestion !== data1.suggestion

    if (isDifferent) {
      console.log(
        '✅ Different content produces different response (cache miss working)'
      )
    } else {
      console.log('⚠️ Different content produced same response (unexpected)')
    }
  } else {
    console.log('❌ Modified content request failed:', data3.message)
  }

  console.log('')

  // Final summary
  console.log('📋 CACHING TEST SUMMARY')
  console.log('========================')

  const allMatch = summaryMatch && patternMatch && suggestionMatch
  const cacheWorking = allMatch && duration2 < duration1 / 5

  if (cacheWorking) {
    console.log('🎉 SUCCESS: Caching is working correctly!')
    console.log('✅ Identical content returns consistent responses')
    console.log('⚡ Significant performance improvement detected')
  } else if (allMatch) {
    console.log('✅ Content consistency maintained')
    console.log('⚠️ But caching performance unclear')
  } else {
    console.log('❌ Content inconsistency detected')
    console.log('🔧 API may have non-deterministic behavior')
  }

  return {
    consistent: allMatch,
    cached: duration2 < duration1 / 5,
    performance: { first: duration1, second: duration2, speedup },
  }
}

// Test different content types
async function testContentVariations() {
  console.log('\n🎨 Testing Different Content Types')
  console.log('===================================\n')

  const contentTests = [
    {
      name: 'Emotional Processing',
      content:
        'I feel overwhelmed by all the changes happening in my life right now. Everything feels uncertain.',
    },
    {
      name: 'Goal Setting',
      content:
        'I want to start exercising regularly. I know it would help my mental health, but I struggle with consistency.',
    },
    {
      name: 'Gratitude Expression',
      content:
        'Today I am grateful for my morning coffee, the sunshine, and a good conversation with a friend.',
    },
  ]

  const results = []

  for (const test of contentTests) {
    console.log(`🧪 Testing: ${test.name}`)

    try {
      const response = await fetch(`${API_BASE}/api/reflect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: test.content }),
      })

      const data = await response.json()

      if (response.ok) {
        console.log('✅ Success')
        console.log(`📊 Summary: ${data.summary.substring(0, 60)}...`)
        console.log(`🔍 Pattern: ${data.pattern.substring(0, 60)}...`)
        console.log(`💡 Suggestion: ${data.suggestion.substring(0, 60)}...`)

        results.push({
          name: test.name,
          success: true,
          data,
        })
      } else {
        console.log(`❌ Failed: ${data.message}`)
        results.push({
          name: test.name,
          success: false,
          error: data.message,
        })
      }
    } catch (error) {
      console.log(`❌ Error: ${error.message}`)
      results.push({
        name: test.name,
        success: false,
        error: error.message,
      })
    }

    console.log('')

    // Small delay between requests
    await new Promise((resolve) => setTimeout(resolve, 1500))
  }

  const successCount = results.filter((r) => r.success).length
  console.log(
    `📊 Results: ${successCount}/${results.length} content types processed successfully`
  )

  return results
}

// Main test runner
async function runCacheTests() {
  console.log('🚀 Starting Caching and Content Tests\n')

  try {
    // Check server
    const healthCheck = await fetch(`${API_BASE}/api/reflect`, {
      method: 'GET',
    })
    if (healthCheck.status !== 405) {
      throw new Error('Server not responding')
    }
    console.log('✅ Server is accessible\n')

    // Run caching tests
    const cacheResult = await testCaching()

    // Test content variations
    const contentResults = await testContentVariations()

    console.log('\n🏁 ALL TESTS COMPLETED')
    console.log('======================')

    if (cacheResult.consistent && cacheResult.cached) {
      console.log('🎉 Caching system: EXCELLENT')
    } else if (cacheResult.consistent) {
      console.log('👍 Response consistency: GOOD')
    } else {
      console.log('⚠️ Issues detected with consistency')
    }

    const contentSuccess = contentResults.filter((r) => r.success).length
    console.log(
      `📊 Content processing: ${contentSuccess}/${contentResults.length} successful`
    )
  } catch (error) {
    console.error('💥 Test failed:', error.message)
    console.log('💡 Make sure the development server is running: pnpm dev')
  }
}

// Run if called directly
if (require.main === module) {
  runCacheTests()
}

module.exports = { testCaching, testContentVariations }
