import { NextResponse } from 'next/server'
import { getAIUsageStats, getAIUsageLogs } from '@/lib/ai-usage-storage'

/**
 * GET /api/ai-usage/stats
 * Get AI usage statistics
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const type = searchParams.get('type')
    const feature = searchParams.get('feature')
    const includeLogs = searchParams.get('includeLogs') === 'true'
    const limit = parseInt(searchParams.get('limit') || '50')

    const filters = {}
    if (startDate) filters.startDate = startDate
    if (endDate) filters.endDate = endDate
    if (type) filters.type = type
    if (feature) filters.feature = feature

    const stats = getAIUsageStats(filters)

    const response = {
      stats,
      period: {
        startDate: filters.startDate || null,
        endDate: filters.endDate || null,
      },
    }

    // Optionally include recent logs
    if (includeLogs) {
      const logs = getAIUsageLogs(filters)
      response.logs = logs.slice(0, limit)
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching AI usage stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch AI usage stats', details: error.message },
      { status: 500 }
    )
  }
}

