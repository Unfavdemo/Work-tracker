import { google } from 'googleapis'
import { getOAuth2Client } from '@/lib/google-auth'

/**
 * Initialize Gmail API client
 * @param {string} accessToken - OAuth2 access token
 * @returns {object} Gmail API client
 */
export function getGmailClient(accessToken) {
  const oauth2Client = getOAuth2Client(accessToken)
  return google.gmail({ version: 'v1', auth: oauth2Client })
}

/**
 * Get Gmail OAuth2 authorization URL
 * @deprecated Use getUnifiedAuthUrl from @/lib/google-auth instead
 * This function is kept for backward compatibility
 * @returns {string} Authorization URL
 */
export function getGmailAuthUrl() {
  const { getUnifiedAuthUrl } = require('@/lib/google-auth')
  return getUnifiedAuthUrl()
}

/**
 * Exchange authorization code for tokens
 * @deprecated Use getUnifiedTokensFromCode from @/lib/google-auth instead
 * This function is kept for backward compatibility
 * @param {string} code - Authorization code
 * @returns {Promise<object>} Tokens (access_token, refresh_token)
 */
export async function getGmailTokensFromCode(code) {
  const { getUnifiedTokensFromCode } = require('@/lib/google-auth')
  return getUnifiedTokensFromCode(code)
}

/**
 * Fetch emails from Gmail
 * @param {string} accessToken - OAuth2 access token
 * @param {object} options - Query options (maxResults, query, labelIds)
 * @returns {Promise<Array>} Array of email messages
 */
export async function fetchEmails(accessToken, options = {}) {
  try {
    const gmail = getGmailClient(accessToken)
    
    const {
      maxResults = 50,
      query = '',
      labelIds = [],
    } = options

    const response = await gmail.users.messages.list({
      userId: 'me',
      maxResults,
      q: query,
      labelIds: labelIds.length > 0 ? labelIds : undefined,
    })

    const messages = response.data.messages || []
    
    // Fetch full message details for each message
    const messageDetails = await Promise.all(
      messages.map(async (message) => {
        try {
          const detail = await gmail.users.messages.get({
            userId: 'me',
            id: message.id,
            format: 'metadata',
            metadataHeaders: ['From', 'To', 'Subject', 'Date'],
          })
          return detail.data
        } catch (error) {
          console.error(`Error fetching message ${message.id}:`, error)
          return null
        }
      })
    )

    return messageDetails.filter(msg => msg !== null)
  } catch (error) {
    console.error('Error fetching emails:', error)
    throw error
  }
}

/**
 * Check if email is student-related
 * @param {object} message - Gmail message object
 * @param {string} accessToken - OAuth2 access token
 * @returns {Promise<boolean>} True if email is student-related
 */
async function isStudentEmail(message, accessToken) {
  try {
    const gmail = getGmailClient(accessToken)
    
    // Get full message to check headers
    const fullMessage = await gmail.users.messages.get({
      userId: 'me',
      id: message.id,
      format: 'metadata',
      metadataHeaders: ['From', 'To', 'Subject'],
    })

    const headers = fullMessage.data.payload?.headers || []
    const getHeader = (name) => headers.find(h => h.name === name)?.value || ''
    
    const from = getHeader('From').toLowerCase()
    const to = getHeader('To').toLowerCase()
    const subject = getHeader('Subject').toLowerCase()
    
    // Keywords that indicate student communication
    const studentKeywords = [
      'workshop', 'student', 'class', 'course', 'assignment', 
      'homework', 'project', 'lesson', 'session', 'training',
      'enrollment', 'registration', 'question', 'help', 'support'
    ]
    
    // Check if subject or email addresses contain student-related keywords
    const hasStudentKeyword = studentKeywords.some(keyword => 
      subject.includes(keyword) || from.includes(keyword) || to.includes(keyword)
    )
    
    // Check if it's from/to an educational domain (common patterns)
    const educationalDomains = ['@lauchpadphilly.org']
    const hasEducationalDomain = educationalDomains.some(domain => 
      from.includes(domain) || to.includes(domain)
    )
    
    return hasStudentKeyword || hasEducationalDomain
  } catch (error) {
    console.error('Error checking if student email:', error)
    return false
  }
}

/**
 * Get student email statistics
 * @param {string} accessToken - OAuth2 access token
 * @param {object} options - Query options (days, studentKeywords)
 * @returns {Promise<object>} Student email statistics
 */
export async function getStudentEmailStats(accessToken, options = {}) {
  try {
    const { days = 30, studentKeywords = [] } = options
    const gmail = getGmailClient(accessToken)
    
    // Calculate date range
    const now = new Date()
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
    const dateQuery = `after:${Math.floor(startDate.getTime() / 1000)}`
    
    // Build query for student-related emails
    // Priority: Filter by @lauchpadphilly.org domain first
    const domainFilter = 'from:@lauchpadphilly.org OR to:@lauchpadphilly.org'
    
    const keywordQuery = studentKeywords.length > 0 
      ? studentKeywords.map(k => `"${k}"`).join(' OR ')
      : 'workshop OR student OR class OR course OR assignment OR "workshop materials"'
    
    // Combine domain filter with keyword query
    const studentQuery = `${dateQuery} (${domainFilter} OR (${keywordQuery}))`

    // Get sent student emails
    const sentResponse = await gmail.users.messages.list({
      userId: 'me',
      maxResults: 500,
      q: `${studentQuery} in:sent`,
    })

    // Get received student emails
    const receivedResponse = await gmail.users.messages.list({
      userId: 'me',
      maxResults: 500,
      q: `${studentQuery} -in:sent`,
    })

    // Get student emails from last 7 days for daily breakdown
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const weeklyDateQuery = `after:${Math.floor(sevenDaysAgo.getTime() / 1000)}`
    const weeklyStudentQuery = `${weeklyDateQuery} (${domainFilter} OR (${keywordQuery}))`
    
    const weeklySent = await gmail.users.messages.list({
      userId: 'me',
      maxResults: 500,
      q: `${weeklyStudentQuery} in:sent`,
    }).catch(() => ({ data: { messages: [] } }))

    const weeklyReceived = await gmail.users.messages.list({
      userId: 'me',
      maxResults: 500,
      q: `${weeklyStudentQuery} -in:sent`,
    }).catch(() => ({ data: { messages: [] } }))

    // Calculate daily breakdown for last 7 days
    const dailyBreakdown = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate())
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000)
      
      const dayDateQuery = `after:${Math.floor(dayStart.getTime() / 1000)} before:${Math.floor(dayEnd.getTime() / 1000)}`
      const dayStudentQuery = `${dayDateQuery} (${domainFilter} OR (${keywordQuery}))`
      
      const [daySent, dayReceived] = await Promise.all([
        gmail.users.messages.list({
          userId: 'me',
          maxResults: 100,
          q: `${dayStudentQuery} in:sent`,
        }).catch(() => ({ data: { messages: [] } })),
        gmail.users.messages.list({
          userId: 'me',
          maxResults: 100,
          q: `${dayStudentQuery} -in:sent`,
        }).catch(() => ({ data: { messages: [] } })),
      ])

      dailyBreakdown.push({
        date: dayStart.toISOString().split('T')[0],
        day: dayStart.toLocaleDateString('en-US', { weekday: 'short' }),
        sent: daySent.data.messages?.length || 0,
        received: dayReceived.data.messages?.length || 0,
      })
    }

    const sentCount = sentResponse.data.messages?.length || 0
    const receivedCount = receivedResponse.data.messages?.length || 0
    const totalCount = sentCount + receivedCount
    
    // Calculate trend (compare with previous period)
    const previousStartDate = new Date(startDate.getTime() - days * 24 * 60 * 60 * 1000)
    const previousDateQuery = `after:${Math.floor(previousStartDate.getTime() / 1000)} before:${Math.floor(startDate.getTime() / 1000)}`
    const previousStudentQuery = `${previousDateQuery} (${domainFilter} OR (${keywordQuery}))`
    
    const [prevSent, prevReceived] = await Promise.all([
      gmail.users.messages.list({
        userId: 'me',
        maxResults: 500,
        q: `${previousStudentQuery} in:sent`,
      }).catch(() => ({ data: { messages: [] } })),
      gmail.users.messages.list({
        userId: 'me',
        maxResults: 500,
        q: `${previousStudentQuery} -in:sent`,
      }).catch(() => ({ data: { messages: [] } })),
    ])

    const prevTotal = (prevSent.data.messages?.length || 0) + (prevReceived.data.messages?.length || 0)
    const trend = prevTotal > 0 
      ? Math.round(((totalCount - prevTotal) / prevTotal) * 100)
      : 0

    return {
      total: totalCount,
      sent: sentCount,
      received: receivedCount,
      trend,
      dailyBreakdown,
      period: `${days} days`,
      type: 'student_emails',
    }
  } catch (error) {
    console.error('Error getting student email stats:', error)
    throw error
  }
}

/**
 * Get email statistics (general - kept for backward compatibility)
 * @param {string} accessToken - OAuth2 access token
 * @param {object} options - Query options (days)
 * @returns {Promise<object>} Email statistics
 */
export async function getEmailStats(accessToken, options = {}) {
  // For student communication tracking, use student email stats
  return getStudentEmailStats(accessToken, options)
}

/**
 * Get recent student email threads
 * @param {string} accessToken - OAuth2 access token
 * @param {number} maxResults - Maximum number of threads to return
 * @param {array} studentKeywords - Optional keywords to filter student emails
 * @returns {Promise<Array>} Array of student email threads
 */
export async function getRecentStudentEmailThreads(accessToken, maxResults = 10, studentKeywords = []) {
  try {
    const gmail = getGmailClient(accessToken)
    
    // Build query for student-related emails
    // Priority: Filter by @lauchpadphilly.org domain first
    const domainFilter = 'from:@lauchpadphilly.org OR to:@lauchpadphilly.org'
    
    const keywordQuery = studentKeywords.length > 0 
      ? studentKeywords.map(k => `"${k}"`).join(' OR ')
      : 'workshop OR student OR class OR course OR assignment OR "workshop materials"'
    
    // Combine domain filter with keyword query
    const combinedQuery = `${domainFilter} OR (${keywordQuery})`
    
    const response = await gmail.users.threads.list({
      userId: 'me',
      maxResults,
      q: combinedQuery,
    })

    const threads = response.data.threads || []
    
    // Fetch thread details
    const threadDetails = await Promise.all(
      threads.map(async (thread) => {
        try {
          const detail = await gmail.users.threads.get({
            userId: 'me',
            id: thread.id,
            format: 'metadata',
            metadataHeaders: ['From', 'To', 'Subject', 'Date'],
          })
          return detail.data
        } catch (error) {
          console.error(`Error fetching thread ${thread.id}:`, error)
          return null
        }
      })
    )

    return threadDetails
      .filter(thread => thread !== null)
      .map(thread => {
        const firstMessage = thread.messages?.[0]
        const headers = firstMessage?.payload?.headers || []
        
        const getHeader = (name) => headers.find(h => h.name === name)?.value || ''
        
        return {
          id: thread.id,
          subject: getHeader('Subject'),
          from: getHeader('From'),
          to: getHeader('To'),
          date: getHeader('Date'),
          snippet: firstMessage?.snippet || '',
          messageCount: thread.messages?.length || 0,
          type: 'student_communication',
        }
      })
  } catch (error) {
    console.error('Error getting student email threads:', error)
    throw error
  }
}

/**
 * Get recent email threads (general - kept for backward compatibility)
 * @param {string} accessToken - OAuth2 access token
 * @param {number} maxResults - Maximum number of threads to return
 * @returns {Promise<Array>} Array of email threads
 */
export async function getRecentEmailThreads(accessToken, maxResults = 10) {
  return getRecentStudentEmailThreads(accessToken, maxResults)
}

