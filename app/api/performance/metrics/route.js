import { NextResponse } from 'next/server'
import { API_CONFIG, fetchSlackData, fetchAIData } from '@/lib/api-config'
import { performanceMetrics } from '@/lib/data'

export async function GET(request) {
  try {
    // Calculate performance metrics from integrated APIs
    const metrics = { ...performanceMetrics }
    
    // Calculate engagement from Slack activity
    if (API_CONFIG.SLACK.enabled) {
      try {
        const conversations = await fetchSlackData('/conversations.list?types=public_channel,private_channel&limit=100')
        const channelCount = conversations.channels?.length || 0
        // Calculate engagement score
        metrics.engagement.value = Math.min(100, 80 + (channelCount * 0.3))
      } catch (apiError) {
        console.warn('Slack API not available for metrics:', apiError.message)
      }
    }
    
    // Use AI to analyze efficiency if configured
    if (API_CONFIG.AI.enabled) {
      try {
        // AI could analyze patterns and suggest efficiency improvements
        // For now, keep default value
      } catch (apiError) {
        console.warn('AI API not available for metrics:', apiError.message)
      }
    }
    
    return NextResponse.json({
      metrics,
      source: API_CONFIG.SLACK.enabled ? 'api' : 'fallback'
    })
  } catch (error) {
    console.error('Error fetching performance metrics:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch performance metrics' },
      { status: 500 }
    )
  }
}
