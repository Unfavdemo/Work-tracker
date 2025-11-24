// AI Usage Tracking Storage
// Tracks all AI interactions for analytics and cost monitoring

let aiUsageLogs = []

/**
 * Log an AI usage event
 * @param {object} usageData - Usage event data
 * @returns {object} The logged entry
 */
export function logAIUsage(usageData) {
  const {
    type, // 'recommendation', 'content_generation', 'analysis', 'enhancement', etc.
    feature, // 'recommendations', 'workshop_creator', 'email_assistant', etc.
    model, // 'gpt-3.5-turbo', 'gpt-4', etc.
    tokensUsed = 0,
    promptTokens = 0,
    completionTokens = 0,
    cost = 0, // Estimated cost in USD
    responseTime = 0, // Time in milliseconds
    success = true,
    error = null,
    metadata = {}
  } = usageData

  const entry = {
    id: `ai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    date: new Date().toISOString().split('T')[0],
    type,
    feature,
    model: model || 'unknown',
    tokensUsed,
    promptTokens,
    completionTokens,
    cost,
    responseTime,
    success,
    error,
    metadata,
  }

  aiUsageLogs.push(entry)

  // Keep only last 5000 entries
  if (aiUsageLogs.length > 5000) {
    aiUsageLogs = aiUsageLogs.slice(-5000)
  }

  return entry
}

/**
 * Get all AI usage logs
 * @param {object} filters - Optional filters
 * @returns {Array} Array of usage logs
 */
export function getAIUsageLogs(filters = {}) {
  let logs = [...aiUsageLogs]

  // Exclude recommendations from tracking
  logs = logs.filter(log => log.feature !== 'recommendations')

  // Filter by date range
  if (filters.startDate) {
    logs = logs.filter(log => new Date(log.date) >= new Date(filters.startDate))
  }
  if (filters.endDate) {
    logs = logs.filter(log => new Date(log.date) <= new Date(filters.endDate))
  }

  // Filter by type
  if (filters.type) {
    logs = logs.filter(log => log.type === filters.type)
  }

  // Filter by feature
  if (filters.feature) {
    logs = logs.filter(log => log.feature === filters.feature)
  }

  // Filter by success
  if (filters.success !== undefined) {
    logs = logs.filter(log => log.success === filters.success)
  }

  // Sort by timestamp (newest first)
  logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

  return logs
}

/**
 * Get AI usage statistics
 * @param {object} filters - Optional filters
 * @returns {object} Usage statistics
 */
export function getAIUsageStats(filters = {}) {
  const logs = getAIUsageLogs(filters)

  if (logs.length === 0) {
    return {
      totalRequests: 0,
      totalTokens: 0,
      totalCost: 0,
      avgResponseTime: 0,
      successRate: 0,
      usageByType: {},
      usageByFeature: {},
      usageByDay: {},
      totalRequestsToday: 0,
      totalCostToday: 0,
    }
  }

  const totalRequests = logs.length
  const totalTokens = logs.reduce((sum, log) => sum + (log.tokensUsed || 0), 0)
  const totalCost = logs.reduce((sum, log) => sum + (log.cost || 0), 0)
  const successfulRequests = logs.filter(log => log.success).length
  const successRate = (successfulRequests / totalRequests) * 100
  const avgResponseTime = logs.reduce((sum, log) => sum + (log.responseTime || 0), 0) / totalRequests

  // Group by type
  const usageByType = {}
  logs.forEach(log => {
    usageByType[log.type] = (usageByType[log.type] || 0) + 1
  })

  // Group by feature
  const usageByFeature = {}
  logs.forEach(log => {
    usageByFeature[log.feature] = (usageByFeature[log.feature] || 0) + 1
  })

  // Group by day
  const usageByDay = {}
  logs.forEach(log => {
    const day = log.date
    if (!usageByDay[day]) {
      usageByDay[day] = { requests: 0, tokens: 0, cost: 0 }
    }
    usageByDay[day].requests++
    usageByDay[day].tokens += log.tokensUsed || 0
    usageByDay[day].cost += log.cost || 0
  })

  // Today's stats
  const today = new Date().toISOString().split('T')[0]
  const todayLogs = logs.filter(log => log.date === today)
  const totalRequestsToday = todayLogs.length
  const totalCostToday = todayLogs.reduce((sum, log) => sum + (log.cost || 0), 0)

  // This week's stats
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  const weekLogs = logs.filter(log => new Date(log.date) >= weekAgo)
  const totalRequestsThisWeek = weekLogs.length
  const totalCostThisWeek = weekLogs.reduce((sum, log) => sum + (log.cost || 0), 0)

  // This month's stats
  const monthAgo = new Date()
  monthAgo.setMonth(monthAgo.getMonth() - 1)
  const monthLogs = logs.filter(log => new Date(log.date) >= monthAgo)
  const totalRequestsThisMonth = monthLogs.length
  const totalCostThisMonth = monthLogs.reduce((sum, log) => sum + (log.cost || 0), 0)

  return {
    totalRequests,
    totalTokens,
    totalCost,
    avgResponseTime: Math.round(avgResponseTime),
    successRate: Math.round(successRate * 10) / 10,
    usageByType,
    usageByFeature,
    usageByDay,
    totalRequestsToday,
    totalCostToday,
    totalRequestsThisWeek,
    totalCostThisWeek,
    totalRequestsThisMonth,
    totalCostThisMonth,
  }
}

/**
 * Calculate estimated cost based on model and tokens
 * @param {string} model - AI model name
 * @param {number} promptTokens - Prompt tokens
 * @param {number} completionTokens - Completion tokens
 * @returns {number} Estimated cost in USD
 */
export function calculateAICost(model, promptTokens, completionTokens) {
  // Pricing per 1K tokens (as of 2024, adjust as needed)
  const pricing = {
    'gpt-4': { prompt: 0.03, completion: 0.06 },
    'gpt-4-turbo': { prompt: 0.01, completion: 0.03 },
    'gpt-4o-mini': { prompt: 0.00015, completion: 0.0006 },
    'gpt-4-mini': { prompt: 0.00015, completion: 0.0006 },
    'gpt-3.5-turbo': { prompt: 0.0005, completion: 0.0015 },
    'gpt-3.5-turbo-0125': { prompt: 0.0005, completion: 0.0015 },
    'gpt-3.5-turbo-1106': { prompt: 0.0005, completion: 0.0015 },
    'gpt-3.5-turbo-16k': { prompt: 0.003, completion: 0.004 },
    'default': { prompt: 0.001, completion: 0.002 },
  }

  // Try exact match first, then match by prefix
  let modelPricing = pricing[model]
  if (!modelPricing) {
    // Try to match by prefix (e.g., 'gpt-3.5-turbo-xxx' matches 'gpt-3.5-turbo')
    for (const [key, value] of Object.entries(pricing)) {
      if (model.startsWith(key) || key.startsWith(model)) {
        modelPricing = value
        break
      }
    }
  }

  modelPricing = modelPricing || pricing.default
  const promptCost = (promptTokens / 1000) * modelPricing.prompt
  const completionCost = (completionTokens / 1000) * modelPricing.completion

  return promptCost + completionCost
}

