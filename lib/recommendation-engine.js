/**
 * Advanced Recommendation Engine
 * Analyzes user data to generate intelligent, actionable recommendations
 */

/**
 * Analyze workshop patterns and generate recommendations
 */
export async function analyzeWorkshopData(workshops, timeEntries, meetings) {
  const recommendations = []
  
  if (!workshops || workshops.length === 0) {
    return recommendations
  }

  // Calculate average workshop duration
  const durations = workshops
    .map(w => {
      const match = w.duration?.match(/(\d+\.?\d*)h?/)
      return match ? parseFloat(match[1]) : 0
    })
    .filter(d => d > 0)
  
  const avgDuration = durations.length > 0
    ? durations.reduce((a, b) => a + b, 0) / durations.length
    : 0

  // Analyze time patterns
  const timeByDay = {}
  const timeByHour = {}
  
  timeEntries.forEach(entry => {
    if (entry.startTime) {
      const date = new Date(entry.startTime)
      const day = date.getDay()
      const hour = date.getHours()
      
      timeByDay[day] = (timeByDay[day] || 0) + (entry.duration || 0)
      timeByHour[hour] = (timeByHour[hour] || 0) + (entry.duration || 0)
    }
  })

  // Find peak productivity hours
  const peakHour = Object.entries(timeByHour)
    .sort(([, a], [, b]) => b - a)[0]?.[0]
  
  // Analyze workshop completion rates
  const completed = workshops.filter(w => w.status === 'completed').length
  const inProgress = workshops.filter(w => w.status === 'in_progress').length
  const completionRate = workshops.length > 0 
    ? (completed / workshops.length) * 100 
    : 0

  // Analyze student engagement
  const totalStudents = workshops.reduce((sum, w) => sum + (w.students || 0), 0)
  const avgStudents = workshops.length > 0 ? totalStudents / workshops.length : 0
  const highEngagementWorkshops = workshops.filter(w => (w.students || 0) > avgStudents * 1.2)

  // Generate recommendations based on analysis

  // 1. Peak Productivity Time Recommendation
  if (peakHour !== undefined) {
    const hourLabel = peakHour < 12 
      ? `${peakHour}:00 AM` 
      : peakHour === 12 
        ? '12:00 PM' 
        : `${peakHour - 12}:00 PM`
    
    recommendations.push({
      id: 'peak-productivity',
      title: 'Schedule During Peak Hours',
      description: `You're most productive at ${hourLabel}. Schedule new workshops during this time for better efficiency.`,
      type: 'suggestion',
      priority: 'high',
      icon: 'Clock',
      impact: 'high',
      metrics: {
        productivityGain: '15-25%',
        timeSaved: '30-45 min per workshop'
      },
      actionItems: [
        'Block peak hours for workshop creation',
        'Use off-peak hours for admin tasks'
      ]
    })
  }

  // 2. Workshop Duration Optimization
  if (avgDuration > 5) {
    recommendations.push({
      id: 'duration-optimization',
      title: 'Optimize Workshop Duration',
      description: `Your average workshop duration is ${avgDuration.toFixed(1)}h. Consider breaking longer workshops into shorter sessions for better student engagement.`,
      type: 'suggestion',
      priority: 'medium',
      icon: 'Lightbulb',
      impact: 'medium',
      metrics: {
        engagementIncrease: '20-30%',
        completionRate: '+15%'
      },
      actionItems: [
        'Split workshops over 6h into 2-3 sessions',
        'Add breaks every 90 minutes'
      ]
    })
  }

  // 3. Completion Rate Alert
  if (completionRate < 70 && workshops.length > 3) {
    recommendations.push({
      id: 'completion-rate',
      title: 'Low Completion Rate',
      description: `Only ${completionRate.toFixed(0)}% of workshops are completed. ${inProgress} workshops are still in progress.`,
      type: 'alert',
      priority: 'high',
      icon: 'AlertCircle',
      impact: 'high',
      metrics: {
        currentRate: `${completionRate.toFixed(0)}%`,
        targetRate: '85%+'
      },
      actionItems: [
        'Review in-progress workshops',
        'Set clear deadlines',
        'Break down large tasks'
      ]
    })
  }

  // 4. Student Engagement Insight
  if (highEngagementWorkshops.length > 0 && workshops.length > 2) {
    const topWorkshop = highEngagementWorkshops.sort((a, b) => (b.students || 0) - (a.students || 0))[0]
    recommendations.push({
      id: 'engagement-pattern',
      title: 'High Engagement Pattern',
      description: `"${topWorkshop.title}" has ${topWorkshop.students} students (${((topWorkshop.students / avgStudents) * 100).toFixed(0)}% above average). Analyze what makes it successful.`,
      type: 'insight',
      priority: 'medium',
      icon: 'TrendingUp',
      impact: 'medium',
      metrics: {
        avgStudents: Math.round(avgStudents),
        topWorkshop: topWorkshop.students
      },
      actionItems: [
        'Review successful workshop format',
        'Apply similar structure to new workshops'
      ]
    })
  }

  // 5. Time Tracking Recommendation
  if (timeEntries.length === 0) {
    recommendations.push({
      id: 'time-tracking',
      title: 'Start Tracking Time',
      description: 'Track time spent on workshops to identify patterns and optimize your workflow.',
      type: 'suggestion',
      priority: 'high',
      icon: 'Clock',
      impact: 'high',
      metrics: {
        insightsGained: 'Productivity patterns',
        timeSaved: 'Up to 2h per week'
      },
      actionItems: [
        'Use the Time Tracker for each workshop',
        'Review weekly time reports'
      ]
    })
  } else if (timeEntries.length < workshops.length) {
    recommendations.push({
      id: 'time-tracking-consistency',
      title: 'Improve Time Tracking',
      description: `You've tracked time for ${timeEntries.length} activities but created ${workshops.length} workshops. Track all activities for better insights.`,
      type: 'suggestion',
      priority: 'medium',
      icon: 'Clock',
      impact: 'medium',
      metrics: {
        trackingRate: `${((timeEntries.length / workshops.length) * 100).toFixed(0)}%`,
        targetRate: '90%+'
      },
      actionItems: [
        'Track time for all workshops',
        'Set reminders to log time'
      ]
    })
  }

  // 6. Workshop Frequency Analysis
  const workshopsByDate = {}
  workshops.forEach(w => {
    const date = w.date || w.createdAt
    if (date) {
      const week = getWeekNumber(new Date(date))
      workshopsByDate[week] = (workshopsByDate[week] || 0) + 1
    }
  })
  
  const avgPerWeek = Object.values(workshopsByDate).reduce((a, b) => a + b, 0) / Object.keys(workshopsByDate).length || 0
  
  if (avgPerWeek > 0 && avgPerWeek < 1) {
    recommendations.push({
      id: 'workshop-frequency',
      title: 'Increase Workshop Frequency',
      description: `You're creating ${avgPerWeek.toFixed(1)} workshops per week. Consider increasing frequency to maintain momentum.`,
      type: 'suggestion',
      priority: 'low',
      icon: 'TrendingUp',
      impact: 'low',
      metrics: {
        currentRate: `${avgPerWeek.toFixed(1)}/week`,
        recommendedRate: '2-3/week'
      },
      actionItems: [
        'Schedule regular workshop creation time',
        'Batch similar tasks together'
      ]
    })
  }

  return recommendations
}

/**
 * Analyze communication patterns
 */
export function analyzeCommunicationData(meetings, emails) {
  const recommendations = []
  
  // Analyze meeting patterns
  if (meetings && meetings.length > 0) {
    const avgDuration = meetings.reduce((sum, m) => sum + (m.duration || 0), 0) / meetings.length
    const totalDuration = meetings.reduce((sum, m) => sum + (m.duration || 0), 0)
    
    if (avgDuration > 60) {
      recommendations.push({
        id: 'meeting-duration',
        title: 'Optimize Meeting Length',
        description: `Average meeting duration is ${Math.round(avgDuration)} minutes. Consider shorter, focused meetings for better productivity.`,
        type: 'suggestion',
        priority: 'medium',
        icon: 'Clock',
        impact: 'medium',
        metrics: {
          timeSaved: `${Math.round((avgDuration - 45) * meetings.length)} min/week`,
          efficiencyGain: '20-30%'
        },
        actionItems: [
          'Set 45-minute default meeting length',
          'Use agenda templates',
          'End meetings 5 minutes early'
        ]
      })
    }

    if (totalDuration > 600) { // More than 10 hours
      recommendations.push({
        id: 'meeting-overload',
        title: 'High Meeting Volume',
        description: `You've spent ${Math.round(totalDuration / 60)} hours in meetings. Consider blocking focus time for workshop creation.`,
        type: 'alert',
        priority: 'high',
        icon: 'AlertCircle',
        impact: 'high',
        metrics: {
          totalHours: `${Math.round(totalDuration / 60)}h`,
          recommendedMax: '8h/week'
        },
        actionItems: [
          'Block 2-3 hours daily for deep work',
          'Decline non-essential meetings',
          'Batch meetings on specific days'
        ]
      })
    }
  }

  return recommendations
}

/**
 * Generate AI-powered recommendations using actual data
 */
export async function generateIntelligentRecommendations(userData) {
  const {
    workshops = [],
    timeEntries = [],
    meetings = [],
    emails = [],
    stats = {}
  } = userData

  // Generate data-driven recommendations
  let workshopRecs = []
  let communicationRecs = []
  
  try {
    workshopRecs = await analyzeWorkshopData(workshops || [], timeEntries || [], meetings || [])
  } catch (error) {
    console.warn('Error analyzing workshop data:', error)
  }
  
  try {
    communicationRecs = analyzeCommunicationData(meetings || [], emails || [])
  } catch (error) {
    console.warn('Error analyzing communication data:', error)
  }

  // Combine and prioritize
  const allRecommendations = [...(workshopRecs || []), ...(communicationRecs || [])]
  
  // Sort by priority (high first) and impact
  const priorityOrder = { high: 3, medium: 2, low: 1 }
  const impactOrder = { high: 3, medium: 2, low: 1 }
  
  // Filter out invalid recommendations before sorting
  const validRecommendations = allRecommendations.filter(rec => 
    rec && rec.title && rec.description && rec.type && rec.priority
  )
  
  validRecommendations.sort((a, b) => {
    const priorityDiff = (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0)
    if (priorityDiff !== 0) return priorityDiff
    return (impactOrder[b.impact] || 0) - (impactOrder[a.impact] || 0)
  })

  return validRecommendations.slice(0, 6) // Return top 6 recommendations
}

/**
 * Helper function to get week number
 */
function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7)
}

