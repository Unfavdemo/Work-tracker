import { NextResponse } from 'next/server'
import { logAIUsage } from '@/lib/ai-usage-storage'

/**
 * POST /api/ai-usage/log
 * Log an AI usage event
 */
export async function POST(request) {
  try {
    const body = await request.json()
    const {
      type,
      feature,
      model,
      tokensUsed,
      promptTokens,
      completionTokens,
      cost,
      responseTime,
      success = true,
      error = null,
      metadata = {}
    } = body

    // Validation
    if (!type || !feature) {
      return NextResponse.json(
        { error: 'Type and feature are required' },
        { status: 400 }
      )
    }

    // Calculate cost if not provided but tokens are
    let finalCost = cost
    if (!finalCost && promptTokens && completionTokens && model) {
      const { calculateAICost } = await import('@/lib/ai-usage-storage')
      finalCost = calculateAICost(model, promptTokens, completionTokens)
    }

    const entry = logAIUsage({
      type,
      feature,
      model,
      tokensUsed: tokensUsed || (promptTokens + completionTokens) || 0,
      promptTokens: promptTokens || 0,
      completionTokens: completionTokens || 0,
      cost: finalCost || 0,
      responseTime: responseTime || 0,
      success,
      error,
      metadata,
    })

    return NextResponse.json({
      success: true,
      entry,
      message: 'AI usage logged successfully',
    }, { status: 201 })
  } catch (error) {
    console.error('Error logging AI usage:', error)
    return NextResponse.json(
      { error: 'Failed to log AI usage', details: error.message },
      { status: 500 }
    )
  }
}

