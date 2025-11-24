import { NextResponse } from 'next/server'
import { API_CONFIG, fetchSlackData } from '@/lib/api-config'
import { communicationData } from '@/lib/data'
import { Mail, MessageSquare, Users, MessageCircle } from 'lucide-react'
import { getStudentEmailStats, getGmailClient } from '@/lib/gmail'

// Map icon components to their string names
const iconNameMap = new Map()
iconNameMap.set(Mail, 'Mail')
iconNameMap.set(MessageSquare, 'MessageSquare')
iconNameMap.set(Users, 'Users')
iconNameMap.set(MessageCircle, 'MessageCircle')

function getIconName(iconComponent) {
  if (typeof iconComponent === 'string') return iconComponent
  return iconNameMap.get(iconComponent) || 'Mail'
}

export async function GET(request) {
  try {
    const stats = []
    
    // Get Gmail access token from authorization header
    const authHeader = request.headers.get('authorization')
    const gmailToken = authHeader?.replace('Bearer ', '')
    
    // Fetch Slack statistics if configured
    let slackStats = null
    if (API_CONFIG.SLACK.enabled) {
      try {
        // Get conversation statistics from Slack
        const conversations = await fetchSlackData('/conversations.list?types=public_channel,private_channel,im,mpim&limit=100')
        const messages = await fetchSlackData('/conversations.history?channel=general&limit=100').catch(() => null)
        
        slackStats = {
          type: 'Slack',
          count: conversations.channels?.length || 0,
          icon: 'MessageCircle',
          progress: 95,
          color: 'hsl(var(--chart-1))',
          trend: 15
        }
      } catch (apiError) {
        console.warn('Slack API not available:', apiError.message)
      }
    }
    
    // Fetch Gmail statistics (received emails only)
    let emailStats = {
      type: 'Emails',
      count: 0,
      icon: 'Mail',
      progress: 72,
      color: 'hsl(var(--chart-2))',
      trend: -5
    }
    
    if (gmailToken) {
      try {
        const { searchParams } = new URL(request.url)
        const days = parseInt(searchParams.get('days') || '30')
        const studentKeywords = searchParams.get('keywords')?.split(',') || []
        
        const gmailStats = await getStudentEmailStats(gmailToken, { days, studentKeywords })
        
        // Calculate trend for received emails only
        // We need to fetch previous period's received count
        const gmail = getGmailClient(gmailToken)
        const now = new Date()
        const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
        const previousStartDate = new Date(startDate.getTime() - days * 24 * 60 * 60 * 1000)
        const previousDateQuery = `after:${Math.floor(previousStartDate.getTime() / 1000)} before:${Math.floor(startDate.getTime() / 1000)}`
        
        const domainFilter = 'from:@lauchpadphilly.org OR to:@lauchpadphilly.org'
        const keywordQuery = studentKeywords.length > 0 
          ? studentKeywords.map(k => `"${k}"`).join(' OR ')
          : 'workshop OR student OR class OR course OR assignment OR "workshop materials"'
        const previousStudentQuery = `${previousDateQuery} (${domainFilter} OR (${keywordQuery}))`
        
        const prevReceivedResponse = await gmail.users.messages.list({
          userId: 'me',
          maxResults: 500,
          q: `${previousStudentQuery} -in:sent`,
        }).catch(() => ({ data: { messages: [] } }))
        
        const prevReceivedCount = prevReceivedResponse.data.messages?.length || 0
        const receivedCount = gmailStats.received || 0
        const receivedTrend = prevReceivedCount > 0 
          ? Math.round(((receivedCount - prevReceivedCount) / prevReceivedCount) * 100)
          : (receivedCount > 0 ? 100 : 0)
        
        // Use received count only
        emailStats = {
          type: 'Emails',
          count: receivedCount,
          icon: 'Mail',
          progress: receivedCount > 0 ? Math.min(100, Math.round((receivedCount / 200) * 100)) : 0, // Assuming 200 is target
          color: 'hsl(var(--chart-2))',
          trend: receivedTrend
        }
      } catch (gmailError) {
        console.warn('Gmail API not available:', gmailError.message)
        // Keep default emailStats with count 0
      }
    }
    
    // Combine API data with fallback data
    if (slackStats) stats.push(slackStats)
    stats.push(emailStats)
    
    // Add conversations placeholder
    stats.push({
      type: 'Conversations',
      count: 89,
      icon: 'MessageSquare',
      progress: 60,
      color: 'hsl(var(--chart-3))',
      trend: 8
    })
    
    // If no API data, use fallback
    if (stats.length === 0) {
      // Convert icon components to strings for JSON serialization
      const serializedStats = communicationData.map(item => ({
        ...item,
        icon: getIconName(item.icon)
      }))
      
      return NextResponse.json({
        stats: serializedStats,
        source: 'fallback'
      })
    }
    
    return NextResponse.json({
      stats,
      source: API_CONFIG.SLACK.enabled ? 'api' : 'fallback'
    })
  } catch (error) {
    console.error('Error fetching communication stats:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch communication stats' },
      { status: 500 }
    )
  }
}

