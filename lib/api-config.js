/**
 * API Configuration
 * Centralized configuration for all external API integrations
 * 
 * APIs Used:
 * - Google: Calendar & Gmail (OAuth-based, no API key needed)
 * - Slack: Communication statistics
 * - AI: Recommendations and insights
 */

export const API_CONFIG = {
  // Slack API - for communication statistics
  SLACK: {
    enabled: !!process.env.SLACK_BOT_TOKEN,
    botToken: process.env.SLACK_BOT_TOKEN || '',
    signingSecret: process.env.SLACK_SIGNING_SECRET || '',
  },
  
  // AI API - for recommendations and insights
  AI: {
    enabled: !!process.env.AI_API_KEY,
    apiKey: process.env.AI_API_KEY || '',
    baseUrl: process.env.AI_API_URL || 'https://api.openai.com/v1',
    // Support for OpenAI or other AI providers
    provider: process.env.AI_PROVIDER || 'openai',
  },
  
  // Google APIs use OAuth (configured separately)
  // See: GOOGLE_CALENDAR_SETUP.md and GMAIL_SETUP_GUIDE.md
}

/**
 * Slack API helper functions
 */
export async function fetchSlackData(endpoint, options = {}) {
  if (!API_CONFIG.SLACK.enabled) {
    throw new Error('Slack API not configured')
  }
  
  const url = `https://slack.com/api${endpoint}`
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${API_CONFIG.SLACK.botToken}`,
    ...options.headers,
  }
  
  try {
    const response = await fetch(url, {
      ...options,
      headers,
    })
    
    if (!response.ok) {
      throw new Error(`Slack API error: ${response.status} ${response.statusText}`)
    }
    
    const data = await response.json()
    if (!data.ok) {
      throw new Error(`Slack API error: ${data.error}`)
    }
    
    return data
  } catch (error) {
    console.error(`Slack API fetch error for ${endpoint}:`, error)
    throw error
  }
}

/**
 * AI API helper functions
 */
export async function fetchAIData(endpoint, options = {}) {
  if (!API_CONFIG.AI.enabled) {
    throw new Error('AI API not configured')
  }
  
  const url = `${API_CONFIG.AI.baseUrl}${endpoint}`
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${API_CONFIG.AI.apiKey}`,
    ...options.headers,
  }
  
  // Handle body for POST requests
  const fetchOptions = {
    ...options,
    headers,
  }
  
  if (options.body && typeof options.body === 'object') {
    fetchOptions.body = JSON.stringify(options.body)
  }
  
  const startTime = Date.now()
  let responseData = null
  let error = null
  
  try {
    const response = await fetch(url, fetchOptions)
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error')
      error = new Error(`AI API error: ${response.status} ${response.statusText} - ${errorText}`)
      throw error
    }
    
    responseData = await response.json()
    
    // Log AI usage automatically
    try {
      const responseTime = Date.now() - startTime
      const model = options.body?.model || 'unknown'
      const usage = responseData.usage || {}
      const promptTokens = usage.prompt_tokens || 0
      const completionTokens = usage.completion_tokens || 0
      const totalTokens = usage.total_tokens || (promptTokens + completionTokens)
      
      // Determine feature from endpoint or metadata
      const feature = options.metadata?.feature || 
                     (endpoint.includes('recommendations') ? 'recommendations' : 
                      endpoint.includes('chat') ? 'chat' : 'other')
      
      // Log asynchronously (don't block the response)
      fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/ai-usage/log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: options.metadata?.type || 'api_call',
          feature,
          model,
          tokensUsed: totalTokens,
          promptTokens,
          completionTokens,
          responseTime,
          success: true,
          metadata: options.metadata || {},
        })
      }).catch(err => console.warn('Failed to log AI usage:', err))
    } catch (logError) {
      console.warn('Error logging AI usage:', logError)
    }
    
    return responseData
  } catch (fetchError) {
    error = fetchError
    
    // Log failed request
    try {
      const responseTime = Date.now() - startTime
      const model = options.body?.model || 'unknown'
      
      fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/ai-usage/log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: options.metadata?.type || 'api_call',
          feature: options.metadata?.feature || 'other',
          model,
          responseTime,
          success: false,
          error: error.message,
          metadata: options.metadata || {},
        })
      }).catch(() => {})
    } catch {}
    
    console.error(`AI API fetch error for ${endpoint}:`, error)
    throw error
  }
}

