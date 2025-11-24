import { NextResponse } from 'next/server'

/**
 * POST /api/chatgpt/chat
 * Handle ChatGPT chat requests
 */
export async function POST(request) {
  try {
    const body = await request.json()
    const { messages } = body

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      )
    }

    // Get API key and optional model from request body
    // Priority: 1. Server-side env variable (OPENAI_API_KEY or AI_API_KEY), 2. User-provided key
    const serverApiKey = process.env.OPENAI_API_KEY || process.env.AI_API_KEY
    const userApiKey = body.apiKey
    const apiKey = serverApiKey || userApiKey
    const model = body.model || body.requestedModel
    const organizationId = body.organizationId || body.orgId
    const projectId = body.projectId

    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured. Please add your API key in Settings or configure OPENAI_API_KEY environment variable.' },
        { status: 401 }
      )
    }

    // Try models in order of preference (with fallback)
    // Always include fallback models even if a specific model is requested
    const fallbackModels = ['gpt-4o-mini', 'gpt-4-mini', 'gpt-3.5-turbo-0125', 'gpt-3.5-turbo-1106', 'gpt-3.5-turbo']
    const modelsToTry = model 
      ? [model, ...fallbackModels.filter(m => m !== model)] // Try requested model first, then fallbacks
      : fallbackModels

    let lastError = null
    let successfulModel = null
    let openaiResponse = null
    const startTime = Date.now()

    // Try each model until one works
    for (const model of modelsToTry) {
      try {
        const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        }
        
        // Add OpenAI organization/project headers if provided
        if (organizationId) {
          headers['OpenAI-Organization'] = organizationId
        }
        if (projectId) {
          headers['OpenAI-Project'] = projectId
        }

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            model: model,
            messages: messages.map(({ role, content }) => ({ role, content })),
            temperature: body.temperature || 0.7,
            max_tokens: body.max_tokens || 1000,
          }),
        })

        if (response.ok) {
          openaiResponse = response
          successfulModel = model
          break
        } else {
          const errorData = await response.json().catch(() => ({}))
          const errorMessage = errorData.error?.message || errorData.error?.code || `Model ${model} not available`
          lastError = errorMessage
          
          // Continue to next model if it's a model access/availability error
          const isModelAccessError = 
            errorMessage.includes('does not have access') ||
            errorMessage.includes('model') ||
            errorMessage.includes('not found') ||
            response.status === 404 ||
            errorData.error?.code === 'model_not_found' ||
            errorData.error?.code === 'model_not_available'
          
          // Only stop trying if it's NOT a model access error (e.g., auth errors, rate limits)
          if (!isModelAccessError && response.status !== 429) {
            break
          }
        }
      } catch (error) {
        lastError = error.message
        // Continue to next model on network errors
      }
    }

    const responseTime = Date.now() - startTime

    if (!openaiResponse || !successfulModel) {
      const errorMessage = lastError || 'Failed to get response from OpenAI'
      const triedAllModels = modelsToTry.length > 1
      const helpfulMessage = errorMessage.includes('does not have access') || errorMessage.includes('model')
        ? `${errorMessage}. Tried ${modelsToTry.length} model(s): ${modelsToTry.join(', ')}. Please ensure your OpenAI API key has access to at least one chat model. You may need to enable model access in your OpenAI dashboard or use a different API key.`
        : errorMessage
      
      return NextResponse.json(
        { 
          error: helpfulMessage, 
          triedModels: modelsToTry,
          suggestion: triedAllModels 
            ? 'All available models were tried. Please check your API key permissions or try a different API key.'
            : 'Please check your API key permissions in the OpenAI dashboard.'
        },
        { status: 400 }
      )
    }

    const data = await openaiResponse.json()
    const assistantMessage = data.choices[0]?.message?.content || 'No response generated'
    const usage = data.usage || {}
    
    // Extract token usage
    const promptTokens = usage.prompt_tokens || 0
    const completionTokens = usage.completion_tokens || 0
    const totalTokens = usage.total_tokens || 0

    // Calculate cost (approximate)
    const { calculateAICost } = await import('@/lib/ai-usage-storage')
    const cost = calculateAICost(successfulModel, promptTokens, completionTokens)

    // Log AI usage
    try {
      const { logAIUsage } = await import('@/lib/ai-usage-storage')
      logAIUsage({
        type: 'chat',
        feature: 'chatgpt',
        model: successfulModel,
        tokensUsed: totalTokens,
        promptTokens,
        completionTokens,
        cost,
        responseTime,
        success: true,
        metadata: {
          messageCount: messages.length,
        },
      })
    } catch (logError) {
      console.error('Error logging AI usage:', logError)
      // Don't fail the request if logging fails
    }

    // Check if we used a fallback model (different from requested)
    const usedFallback = model && successfulModel !== model

    return NextResponse.json({
      message: assistantMessage,
      model: successfulModel,
      requestedModel: model,
      usedFallback,
      tokens: totalTokens,
      promptTokens,
      completionTokens,
      cost,
      responseTime,
    })
  } catch (error) {
    console.error('ChatGPT API error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to process chat request' },
      { status: 500 }
    )
  }
}

