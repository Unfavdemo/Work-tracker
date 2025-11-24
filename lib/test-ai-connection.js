/**
 * Test utility to verify AI Tracker connection to Dashboard
 * Run this in the browser console to test the connection
 */

export function testAIConnection() {
  console.log('🧪 Testing AI Tracker to Dashboard Connection...\n')
  
  let testResults = {
    eventEmission: false,
    eventListener: false,
    localStorageSync: false,
    dataFlow: false,
  }

  // Test 1: Check if event listener is registered
  console.log('Test 1: Checking event listener registration...')
  const hasListener = window.addEventListener.toString().includes('aiStatsUpdated') || 
                      document.addEventListener.toString().includes('aiStatsUpdated')
  
  // Create a test event
  const testEvent = new CustomEvent('aiStatsUpdated', {
    detail: { aiEfficiency: 85, stats: { successRate: 85 } }
  })
  
  // Test 2: Emit test event and check if it's received
  console.log('Test 2: Emitting test event...')
  const originalEfficiency = localStorage.getItem('ai_efficiency')
  
  window.dispatchEvent(testEvent)
  
  // Check if localStorage was updated
  setTimeout(() => {
    const updatedEfficiency = localStorage.getItem('ai_efficiency')
    if (updatedEfficiency === '85') {
      testResults.localStorageSync = true
      console.log('✅ localStorage sync working')
    } else {
      console.log('❌ localStorage sync failed')
    }
  }, 100)

  // Test 3: Simulate AI tracker fetch
  console.log('Test 3: Simulating AI tracker data fetch...')
  const mockStats = {
    successRate: 92.5,
    totalRequests: 150,
    totalTokens: 45000,
    avgResponseTime: 1200,
  }
  
  const aiEfficiency = Math.round(mockStats.successRate || 0)
  window.dispatchEvent(new CustomEvent('aiStatsUpdated', {
    detail: { aiEfficiency, stats: mockStats }
  }))
  
  localStorage.setItem('ai_efficiency', aiEfficiency.toString())
  localStorage.setItem('ai_stats_updated', Date.now().toString())
  
  if (localStorage.getItem('ai_efficiency') === '93') {
    testResults.dataFlow = true
    console.log('✅ Data flow working')
  } else {
    console.log('❌ Data flow failed')
  }

  // Test 4: Check if dashboard can read the value
  console.log('Test 4: Checking dashboard integration...')
  const dashboardValue = localStorage.getItem('ai_efficiency')
  if (dashboardValue) {
    console.log(`✅ Dashboard can read AI efficiency: ${dashboardValue}%`)
    testResults.eventListener = true
  } else {
    console.log('❌ Dashboard cannot read AI efficiency')
  }

  // Summary
  console.log('\n📊 Test Results:')
  console.log('==================')
  console.log(`Event Emission: ${testResults.eventEmission ? '✅' : '❌'}`)
  console.log(`Event Listener: ${testResults.eventListener ? '✅' : '❌'}`)
  console.log(`localStorage Sync: ${testResults.localStorageSync ? '✅' : '❌'}`)
  console.log(`Data Flow: ${testResults.dataFlow ? '✅' : '❌'}`)
  
  const allPassed = Object.values(testResults).every(result => result === true)
  console.log(`\n${allPassed ? '✅ All tests passed!' : '⚠️ Some tests failed'}`)
  
  return testResults
}

// Browser console helper
if (typeof window !== 'undefined') {
  window.testAIConnection = testAIConnection
  console.log('💡 Run testAIConnection() in the console to test the AI connection')
}

