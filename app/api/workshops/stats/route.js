import { NextResponse } from 'next/server'
import { API_CONFIG, fetchAIData } from '@/lib/api-config'
import { timeData, aiUsageData, workshopStats } from '@/lib/data'
import { getWorkshopStats } from '@/lib/workshop-storage'
import { convertCalendarEventsToWorkshops, mergeWorkshops } from '@/lib/workshop-sync'
import { fetchCalendarEvents } from '@/lib/google-calendar'
import { getAIUsageStats } from '@/lib/ai-usage-storage'

export async function GET(request) {
  try {
    // Get time range from query params
    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get('timeRange') || 'week'
    
    // Get manually created workshops
    const { getWorkshops } = await import('@/lib/workshop-storage')
    const manualWorkshops = getWorkshops()
    
    // Try to get workshops from APIs
    const apiWorkshops = []
    
    // Get from Google Calendar if token is available
    try {
      const authHeader = request.headers.get('authorization')
      const accessToken = authHeader?.replace('Bearer ', '')
      
      if (accessToken) {
        const now = new Date()
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
        
        const calendarEvents = await fetchCalendarEvents(accessToken, {
          timeMin: sevenDaysAgo.toISOString(),
          timeMax: thirtyDaysFromNow.toISOString(),
          maxResults: 50,
        })
        
        const calendarWorkshops = convertCalendarEventsToWorkshops(calendarEvents)
        apiWorkshops.push(...calendarWorkshops)
      }
    } catch (calendarError) {
      console.warn('Could not fetch from Google Calendar:', calendarError.message)
    }
    
    // Merge all workshops
    const allWorkshops = mergeWorkshops(manualWorkshops, apiWorkshops)
    
    // Calculate stats from merged workshops
    const workshopCount = allWorkshops.length
    const completedWorkshops = allWorkshops.filter(w => w.status === 'completed').length
    const inProgressWorkshops = allWorkshops.filter(w => w.status === 'in_progress').length
    const totalStudents = allWorkshops.reduce((sum, w) => sum + (w.students || 0), 0)
    const avgRating = allWorkshops.length > 0
      ? allWorkshops.reduce((sum, w) => sum + (w.rating || 0), 0) / allWorkshops.length
      : 0
    
    // Calculate average time per workshop from actual durations
    const workshopsWithDuration = allWorkshops.filter(w => w.duration)
    let avgTimeHours = 0
    if (workshopsWithDuration.length > 0) {
      const totalHours = workshopsWithDuration.reduce((sum, w) => {
        // Parse duration like "4.5h" or "3.8h"
        const durationStr = w.duration.toString().replace('h', '').trim()
        const hours = parseFloat(durationStr) || 0
        return sum + hours
      }, 0)
      avgTimeHours = totalHours / workshopsWithDuration.length
    }
    
    // Calculate previous period stats for trend calculation
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)
    
    const recentWorkshops = allWorkshops.filter(w => {
      if (!w.createdAt && !w.date) return false
      const workshopDate = w.createdAt ? new Date(w.createdAt) : new Date(w.date)
      return workshopDate >= thirtyDaysAgo
    })
    
    const previousPeriodWorkshops = allWorkshops.filter(w => {
      if (!w.createdAt && !w.date) return false
      const workshopDate = w.createdAt ? new Date(w.createdAt) : new Date(w.date)
      return workshopDate >= sixtyDaysAgo && workshopDate < thirtyDaysAgo
    })
    
    // Calculate average time for previous period
    const prevWorkshopsWithDuration = previousPeriodWorkshops.filter(w => w.duration)
    let prevAvgTimeHours = 0
    if (prevWorkshopsWithDuration.length > 0) {
      const prevTotalHours = prevWorkshopsWithDuration.reduce((sum, w) => {
        const durationStr = w.duration.toString().replace('h', '').trim()
        const hours = parseFloat(durationStr) || 0
        return sum + hours
      }, 0)
      prevAvgTimeHours = prevTotalHours / prevWorkshopsWithDuration.length
    }
    
    // Calculate time trend
    const timeTrend = prevAvgTimeHours > 0
      ? Math.round(((avgTimeHours - prevAvgTimeHours) / prevAvgTimeHours) * 100 * 10) / 10
      : avgTimeHours > 0 ? 100 : 0
    
    // Calculate workshop count trend
    const prevWorkshopCount = previousPeriodWorkshops.length
    const workshopTrend = prevWorkshopCount > 0
      ? Math.round(((recentWorkshops.length - prevWorkshopCount) / prevWorkshopCount) * 100)
      : recentWorkshops.length > 0 ? 100 : 0
    
    // Count decks created (assuming each workshop has one deck, or count completed workshops)
    const decksCreated = completedWorkshops
    const prevDecksCreated = previousPeriodWorkshops.filter(w => w.status === 'completed').length
    const decksTrend = prevDecksCreated > 0
      ? Math.round(((decksCreated - prevDecksCreated) / prevDecksCreated) * 100)
      : decksCreated > 0 ? 100 : 0
    
    const workshopStatsData = {
      total: workshopCount,
      completed: completedWorkshops,
      inProgress: inProgressWorkshops,
      totalStudents,
      avgRating: Math.round(avgRating * 10) / 10,
    }
    
    // Get real AI usage stats
    const aiUsageStats = getAIUsageStats({
      startDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    })
    
    const prevAiUsageStats = getAIUsageStats({
      startDate: sixtyDaysAgo.toISOString().split('T')[0],
      endDate: thirtyDaysAgo.toISOString().split('T')[0]
    })
    
    // Calculate AI usage percentage (success rate)
    const aiUsagePercentage = Math.round(aiUsageStats.successRate || 0)
    const prevAiUsagePercentage = Math.round(prevAiUsageStats.successRate || 0)
    const aiUsageTrend = prevAiUsagePercentage > 0
      ? Math.round(((aiUsagePercentage - prevAiUsagePercentage) / prevAiUsagePercentage) * 100)
      : aiUsagePercentage > 0 ? 100 : 0
    
    // Generate time chart data from actual workshops
    const timeChartData = generateTimeChartData(allWorkshops, timeRange)
    
    // Generate AI usage chart data from AI logs
    const aiUsageChartData = generateAIUsageChartData(aiUsageStats)
    
    // Combine all stats
    const stats = {
      avgTime: {
        value: Math.round(avgTimeHours * 10) / 10,
        unit: 'h',
        trend: timeTrend
      },
      decksCreated: {
        value: decksCreated,
        unit: '',
        trend: decksTrend
      },
      workshopsCreated: {
        value: workshopCount,
        unit: '',
        trend: workshopTrend,
      },
      aiUsage: {
        value: aiUsagePercentage,
        unit: '%',
        trend: aiUsageTrend
      },
      timeData: timeChartData,
      aiUsageData: aiUsageChartData,
      source: 'real',
      workshopStats: workshopStatsData,
    }
    
    return NextResponse.json({ stats })
  } catch (error) {
    console.error('Error fetching workshop stats:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch workshop stats' },
      { status: 500 }
    )
  }
}

// Generate time chart data from actual workshops
function generateTimeChartData(workshops, range = 'week') {
  const now = new Date()
  let daysBack = 7
  if (range === 'month') daysBack = 30
  if (range === 'year') daysBack = 365
  
  const startDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000)
  
  // Filter workshops in range
  const workshopsInRange = workshops.filter(w => {
    if (!w.date && !w.createdAt) return false
    const workshopDate = w.date ? new Date(w.date) : new Date(w.createdAt)
    return workshopDate >= startDate
  })
  
  // Group by day
  const dayMap = {}
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  
  // Initialize all days with 0 hours
  for (let i = daysBack - 1; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
    const dayKey = dayNames[date.getDay()]
    const dateKey = date.toISOString().split('T')[0]
    if (!dayMap[dateKey]) {
      dayMap[dateKey] = { day: dayKey, hours: 0, count: 0 }
    }
  }
  
  // Add workshop durations
  workshopsInRange.forEach(w => {
    if (!w.date && !w.createdAt) return
    const workshopDate = w.date ? new Date(w.date) : new Date(w.createdAt)
    const dateKey = workshopDate.toISOString().split('T')[0]
    
    if (dayMap[dateKey]) {
      const durationStr = w.duration ? w.duration.toString().replace('h', '').trim() : '0'
      const hours = parseFloat(durationStr) || 0
      dayMap[dateKey].hours += hours
      dayMap[dateKey].count += 1
    }
  })
  
  // Convert to array and format
  const chartData = Object.values(dayMap)
    .sort((a, b) => {
      const dateA = Object.keys(dayMap).find(key => dayMap[key] === a)
      const dateB = Object.keys(dayMap).find(key => dayMap[key] === b)
      return dateA.localeCompare(dateB)
    })
    .map(item => ({
      day: item.day,
      hours: Math.round(item.hours * 10) / 10
    }))
  
  // If we have less data than days, fill in with 0s for missing days
  if (range === 'week') {
    // Ensure we have 7 days with zeros for missing days
    const result = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const dayKey = dayNames[date.getDay()]
      const existing = chartData.find(d => d.day === dayKey)
      result.push(existing || { day: dayKey, hours: 0 })
    }
    return result
  }
  
  // For month/year, return data with zeros for missing days, or empty array if no workshops at all
  if (chartData.length === 0 && workshopsInRange.length === 0) {
    return [] // No workshops in range, return empty
  }
  
  return chartData
}

// Generate AI usage chart data from AI usage stats
function generateAIUsageChartData(aiUsageStats) {
  if (!aiUsageStats.usageByDay || Object.keys(aiUsageStats.usageByDay).length === 0) {
    return [] // Return empty array if no data
  }
  
  // Get last 4 weeks of data
  const now = new Date()
  const weeks = []
  for (let i = 3; i >= 0; i--) {
    const weekStart = new Date(now.getTime() - (i * 7 + 6) * 24 * 60 * 60 * 1000)
    const weekEnd = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000)
    
    let weekRequests = 0
    Object.entries(aiUsageStats.usageByDay).forEach(([date, data]) => {
      const logDate = new Date(date)
      if (logDate >= weekStart && logDate <= weekEnd) {
        weekRequests += data.requests || 0
      }
    })
    
    weeks.push({
      week: `W${4 - i}`,
      usage: weekRequests
    })
  }
  
  // If we have data, return it, otherwise calculate percentage from total
  if (weeks.some(w => w.usage > 0)) {
    // Normalize to percentage (assuming max is 100 requests per week = 100%)
    const maxUsage = Math.max(...weeks.map(w => w.usage), 1)
    return weeks.map(w => ({
      week: w.week,
      usage: Math.round((w.usage / maxUsage) * 100)
    }))
  }
  
  // If no data, return empty array
  return []
}

