import { NextResponse } from 'next/server'
import { API_CONFIG, fetchAIData } from '@/lib/api-config'
import { recommendations } from '@/lib/data'
import { TrendingUp, Lightbulb, AlertCircle, Clock } from 'lucide-react'
import { generateIntelligentRecommendations } from '@/lib/recommendation-engine'
import { getWorkshops } from '@/lib/workshop-storage'

// Map icon components to their string names
const iconNameMap = new Map()
iconNameMap.set(TrendingUp, 'TrendingUp')
iconNameMap.set(Lightbulb, 'Lightbulb')
iconNameMap.set(AlertCircle, 'AlertCircle')
iconNameMap.set(Clock, 'Clock')

function getIconName(iconComponent) {
  if (typeof iconComponent === 'string') return iconComponent
  return iconNameMap.get(iconComponent) || 'Sparkles'
}

export async function GET(request) {
  try {
    // Step 1: Gather real user data for analysis
    let userData = {
      workshops: [],
      timeEntries: [],
      meetings: [],
      emails: [],
      stats: {}
    }

    try {
      // Fetch workshops
      const workshops = getWorkshops()
      userData.workshops = workshops

      // Fetch time entries (using internal import)
      try {
        const timeStorage = await import('@/lib/time-storage')
        const getTimeEntries = timeStorage.getTimeEntries || (() => [])
        userData.timeEntries = getTimeEntries() || []
      } catch (timeError) {
        // Time entries might not be available, that's okay
        console.warn('Time entries not available:', timeError.message)
      }

      // Fetch meetings (using internal import or API config)
      try {
        const { meetingData } = await import('@/lib/data')
        if (meetingData && Array.isArray(meetingData)) {
          userData.meetings = meetingData
        }
      } catch (meetingsError) {
        console.warn('Could not fetch meetings:', meetingsError.message)
      }
    } catch (dataError) {
      console.warn('Error gathering user data:', dataError.message)
    }

    // Step 2: Generate intelligent data-driven recommendations
    let intelligentRecs = []
    try {
      intelligentRecs = await generateIntelligentRecommendations(userData)
    } catch (recError) {
      console.warn('Error generating intelligent recommendations:', recError.message)
    }

    // Step 3: If AI API is enabled, enhance with AI analysis
    if (API_CONFIG.AI.enabled && intelligentRecs.length > 0) {
      try {
        const aiEnhancedRecs = await enhanceWithAI(intelligentRecs, userData)
        if (aiEnhancedRecs && aiEnhancedRecs.length > 0) {
          return NextResponse.json({ 
            recommendations: aiEnhancedRecs, 
            source: 'ai_enhanced',
            dataPoints: {
              workshops: userData.workshops.length,
              timeEntries: userData.timeEntries.length,
              meetings: userData.meetings.length
            }
          })
        }
      } catch (aiError) {
        console.warn('AI enhancement failed, using data-driven recommendations:', aiError.message)
      }
    }

    // Step 4: Return data-driven recommendations (or fallback)
    if (intelligentRecs.length > 0) {
      // Ensure all recommendations have required fields
      const normalizedRecs = intelligentRecs.map(rec => ({
        id: rec.id || `rec-${Date.now()}-${Math.random()}`,
        title: rec.title || 'Untitled Recommendation',
        description: rec.description || '',
        type: rec.type || 'suggestion',
        priority: rec.priority || 'medium',
        icon: typeof rec.icon === 'string' ? rec.icon : getIconName(rec.icon || 'Lightbulb'),
        impact: rec.impact || 'medium',
        metrics: rec.metrics || {},
        actionItems: rec.actionItems || []
      }))
      
      return NextResponse.json({
        recommendations: normalizedRecs,
        source: 'data_driven',
        dataPoints: {
          workshops: userData.workshops.length,
          timeEntries: userData.timeEntries.length,
          meetings: userData.meetings.length
        }
      })
    }

    // Step 5: Fallback to static data
    const serializedRecommendations = recommendations
      .filter(rec => rec && rec.title) // Filter out invalid recommendations
      .map(rec => ({
        id: rec.id || `rec-${Date.now()}-${Math.random()}`,
        title: rec.title || 'Untitled Recommendation',
        description: rec.description || '',
        type: rec.type || 'suggestion',
        priority: rec.priority || 'medium',
        icon: getIconName(rec.icon || 'Lightbulb'),
        impact: rec.impact || 'medium',
        metrics: rec.metrics || {},
        actionItems: rec.actionItems || []
      }))
    
    return NextResponse.json({
      recommendations: serializedRecommendations,
      source: 'static'
    })
  } catch (error) {
    console.error('Error fetching recommendations:', error)
    // Even on error, return fallback data so the component still works
    const serializedRecommendations = recommendations
      .filter(rec => rec && rec.title) // Filter out invalid recommendations
      .map(rec => ({
        id: rec.id || `rec-${Date.now()}-${Math.random()}`,
        title: rec.title || 'Untitled Recommendation',
        description: rec.description || '',
        type: rec.type || 'suggestion',
        priority: rec.priority || 'medium',
        icon: getIconName(rec.icon || 'Lightbulb'),
        impact: rec.impact || 'medium',
        metrics: rec.metrics || {},
        actionItems: rec.actionItems || []
      }))
    return NextResponse.json({
      recommendations: serializedRecommendations,
      source: 'fallback',
      error: error.message || 'Failed to fetch recommendations'
    })
  }
}

/**
 * Enhance recommendations with AI analysis
 */
async function enhanceWithAI(recommendations, userData) {
  try {
    const systemPrompt = `You are an advanced productivity AI assistant. Analyze user data and enhance recommendations with deeper insights.
    You must return a JSON object with a "recommendations" key containing an array of enhanced recommendation objects.
    Each recommendation should have:
    - id: original id
    - title: enhanced title (string, max 60 characters)
    - description: more detailed, actionable description (string, max 250 characters)
    - type: "insight", "suggestion", or "alert"
    - priority: "low", "medium", or "high"
    - icon: "TrendingUp", "Lightbulb", "AlertCircle", or "Clock"
    - impact: "low", "medium", or "high"
    - metrics: object with relevant metrics
    - actionItems: array of 2-3 specific action items
    
    Make recommendations more specific, actionable, and personalized based on the user's actual data patterns.
    Return ONLY valid JSON, no other text.`

    const userPrompt = `Here are data-driven recommendations and user data:
    
    Recommendations:
    ${JSON.stringify(recommendations, null, 2)}
    
    User Data Summary:
    ${JSON.stringify({
      workshopCount: userData.workshops.length,
      avgWorkshopDuration: userData.workshops.length > 0 
        ? userData.workshops.reduce((sum, w) => {
            const match = w.duration?.match(/(\d+\.?\d*)h?/)
            return sum + (match ? parseFloat(match[1]) : 0)
          }, 0) / userData.workshops.length 
        : 0,
      timeEntriesCount: userData.timeEntries.length,
      meetingsCount: userData.meetings.length,
      completionRate: userData.workshops.length > 0
        ? (userData.workshops.filter(w => w.status === 'completed').length / userData.workshops.length * 100).toFixed(0)
        : 0
    }, null, 2)}
    
    Enhance these recommendations with deeper AI insights while keeping the same structure. Return JSON with "recommendations" array.`

    const startTime = Date.now()
    const model = process.env.AI_MODEL || 'gpt-3.5-turbo'
    
    const aiResponse = await fetchAIData('/chat/completions', {
      method: 'POST',
      body: {
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
        max_tokens: 1500,
      }
    })

    const responseTime = Date.now() - startTime

    // AI recommendations are not tracked in usage stats

    if (!aiResponse || !aiResponse.choices || !aiResponse.choices[0]) {
      // AI recommendations are not tracked in usage stats
      throw new Error('Invalid AI response format')
    }

    const content = aiResponse.choices[0].message?.content
    if (!content) {
      throw new Error('No content in AI response')
    }

    let parsedContent
    try {
      parsedContent = JSON.parse(content)
    } catch (parseError) {
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/```\s*([\s\S]*?)\s*```/)
      if (jsonMatch) {
        parsedContent = JSON.parse(jsonMatch[1])
      } else {
        throw new Error('Could not parse AI response as JSON')
      }
    }

    const aiRecs = parsedContent.recommendations || parsedContent
    const enhancedRecs = Array.isArray(aiRecs) ? aiRecs : [aiRecs]

    return enhancedRecs
      .filter(rec => rec && rec.title && rec.description)
      .slice(0, 6)
      .map(rec => ({
        id: rec.id || `ai-${Date.now()}-${Math.random()}`,
        title: rec.title || 'Untitled Recommendation',
        description: rec.description || '',
        type: rec.type || 'suggestion',
        priority: rec.priority || 'medium',
        icon: typeof rec.icon === 'string' ? rec.icon : getIconName(rec.icon || 'Lightbulb'),
        impact: rec.impact || 'medium',
        metrics: rec.metrics || {},
        actionItems: Array.isArray(rec.actionItems) ? rec.actionItems : []
      }))
  } catch (error) {
    console.error('Error enhancing with AI:', error)
    throw error
  }
}

async function generateAIRecommendations() {
  try {
    // Fetch user data to provide context to AI
    // In a real implementation, you'd fetch actual user data from your database/APIs
    const userContext = {
      workshops: 'Sample workshop data',
      meetings: 'Sample meeting data',
      emails: 'Sample email data',
    }
    
    // Prepare prompt for AI
    const systemPrompt = `You are a productivity assistant for workshop creators. Generate 3-5 actionable recommendations based on user activity data. 
    You must return a JSON object with a "recommendations" key containing an array of recommendation objects.
    Each recommendation object must have these exact fields:
    - id: unique identifier (string, e.g., "ai-1")
    - title: short recommendation title (string, max 50 characters)
    - description: detailed description (string, max 200 characters)
    - type: one of "insight", "suggestion", or "alert" (string)
    - priority: one of "low", "medium", or "high" (string)
    - icon: one of "TrendingUp", "Lightbulb", "AlertCircle", or "Clock" (string)
    
    Make recommendations specific, actionable, and relevant to workshop creation and teaching.
    Return ONLY valid JSON, no other text.`
    
    const userPrompt = `Based on this user activity data, generate productivity recommendations in JSON format:
    ${JSON.stringify(userContext, null, 2)}
    
    Return a JSON object with this structure:
    {
      "recommendations": [
        {
          "id": "ai-1",
          "title": "Recommendation title",
          "description": "Detailed description",
          "type": "suggestion",
          "priority": "high",
          "icon": "Lightbulb"
        }
      ]
    }`
    
    // Call AI API
    const aiResponse = await fetchAIData('/chat/completions', {
      method: 'POST',
      body: {
        model: process.env.AI_MODEL || 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
        max_tokens: 1000,
      }
    })
    
    // Parse AI response
    if (!aiResponse || !aiResponse.choices || !aiResponse.choices[0]) {
      throw new Error('Invalid AI response format')
    }
    
    const content = aiResponse.choices[0].message?.content
    if (!content) {
      throw new Error('No content in AI response')
    }
    
    // Parse JSON response
    let parsedContent
    try {
      parsedContent = JSON.parse(content)
    } catch (parseError) {
      console.error('Error parsing AI JSON response:', parseError)
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/```\s*([\s\S]*?)\s*```/)
      if (jsonMatch) {
        parsedContent = JSON.parse(jsonMatch[1])
      } else {
        throw new Error('Could not parse AI response as JSON')
      }
    }
    
    // Extract recommendations array
    let aiRecommendations = parsedContent.recommendations || parsedContent
    if (!Array.isArray(aiRecommendations)) {
      // If it's a single object, wrap it in an array
      if (typeof aiRecommendations === 'object') {
        aiRecommendations = [aiRecommendations]
      } else {
        throw new Error('AI response does not contain recommendations array')
      }
    }
    
    // Validate and format recommendations
    const formattedRecommendations = aiRecommendations
      .filter(rec => rec.title && rec.description) // Only include valid recommendations
      .slice(0, 5) // Limit to 5 recommendations
      .map((rec, index) => ({
        id: rec.id || `ai-${index + 1}`,
        title: rec.title,
        description: rec.description,
        type: rec.type || 'suggestion',
        priority: rec.priority || 'medium',
        icon: rec.icon || 'Lightbulb',
      }))
    
    if (formattedRecommendations.length === 0) {
      throw new Error('No valid recommendations generated')
    }
    
    // Convert icon names to strings (already strings from AI, but ensure consistency)
    return formattedRecommendations.map(rec => ({
      ...rec,
      icon: typeof rec.icon === 'string' ? rec.icon : getIconName(rec.icon)
    }))
    
  } catch (error) {
    console.error('Error generating AI recommendations:', error)
    throw error // Re-throw to trigger fallback in calling function
  }
}

