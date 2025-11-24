import { google } from 'googleapis'
import { getOAuth2Client } from '@/lib/google-auth'

/**
 * Initialize Google Calendar API client
 * @param {string} accessToken - OAuth2 access token
 * @returns {object} Google Calendar API client
 */
export function getCalendarClient(accessToken) {
  const oauth2Client = getOAuth2Client(accessToken)
  return google.calendar({ version: 'v3', auth: oauth2Client })
}

/**
 * Retry a function with exponential backoff
 * @param {Function} fn - Function to retry
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} baseDelay - Base delay in milliseconds
 * @returns {Promise<any>} Result of the function
 */
async function retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      // Check if it's a retryable error
      const isRetryable = error.code === 'ENOTFOUND' || 
                         error.code === 'ECONNREFUSED' || 
                         error.code === 'ETIMEDOUT' ||
                         error.code === 'ECONNRESET' ||
                         error.message?.includes('getaddrinfo') ||
                         error.message?.includes('ENOTFOUND') ||
                         (error.response && error.response.status >= 500)
      
      if (!isRetryable || attempt === maxRetries) {
        throw error
      }
      
      // Calculate exponential backoff delay
      const delay = baseDelay * Math.pow(2, attempt)
      console.warn(`Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms. Error:`, error.message)
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
}

/**
 * Fetch events from Google Calendar
 * @param {string} accessToken - OAuth2 access token
 * @param {object} options - Query options (timeMin, timeMax, maxResults)
 * @returns {Promise<Array>} Array of calendar events
 */
export async function fetchCalendarEvents(accessToken, options = {}) {
  try {
    if (!accessToken || accessToken.trim() === '') {
      throw new Error('Access token is required')
    }
    
    // Check if Google API credentials are configured
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      throw new Error('Google Calendar API is not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables.')
    }
    
    const calendar = getCalendarClient(accessToken)
    
    const {
      timeMin = new Date().toISOString(),
      timeMax,
      maxResults = 50,
      calendarId = 'primary'
    } = options

    // Use retry logic for network/DNS errors
    const response = await retryWithBackoff(async () => {
      return await calendar.events.list({
        calendarId,
        timeMin,
        timeMax,
        maxResults,
        singleEvents: true,
        orderBy: 'startTime',
      })
    })

    return response.data.items || []
  } catch (error) {
    console.error('Error fetching calendar events:', error)
    
    // Check for authentication errors
    if (error.code === 401 || error.code === 403 || 
        error.message?.includes('invalid authentication') ||
        error.message?.includes('authentication credential')) {
      const authError = new Error('Invalid or expired authentication token')
      authError.code = error.code || 401
      throw authError
    }
    
    // Check for network/DNS errors (after retries exhausted)
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED' || 
        error.code === 'ETIMEDOUT' || error.code === 'ECONNRESET' ||
        error.message?.includes('getaddrinfo') ||
        error.message?.includes('ENOTFOUND')) {
      const networkError = new Error('Network error: Unable to connect to Google Calendar API. Please check your internet connection and try again.')
      networkError.code = 'NETWORK_ERROR'
      networkError.originalError = error.message
      throw networkError
    }
    
    // Re-throw with original error
    throw error
  }
}

/**
 * Create a new event in Google Calendar
 * @param {string} accessToken - OAuth2 access token
 * @param {object} eventData - Event data (title, start, end, description, etc.)
 * @param {string} calendarId - Calendar ID (default: 'primary')
 * @returns {Promise<object>} Created event
 */
export async function createCalendarEvent(accessToken, eventData, calendarId = 'primary') {
  try {
    const calendar = getCalendarClient(accessToken)
    
    const event = {
      summary: eventData.title,
      description: eventData.description || '',
      start: {
        dateTime: eventData.start,
        timeZone: eventData.timeZone || 'America/New_York',
      },
      end: {
        dateTime: eventData.end,
        timeZone: eventData.timeZone || 'America/New_York',
      },
      ...(eventData.location && { location: eventData.location }),
      ...(eventData.attendees && { attendees: eventData.attendees }),
    }

    const response = await calendar.events.insert({
      calendarId,
      requestBody: event,
    })

    return response.data
  } catch (error) {
    console.error('Error creating calendar event:', error)
    throw error
  }
}

/**
 * Get OAuth2 authorization URL with all required scopes
 * @deprecated Use getUnifiedAuthUrl from @/lib/google-auth instead
 * This function is kept for backward compatibility
 * @returns {string} Authorization URL
 */
export function getAuthUrl() {
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
export async function getTokensFromCode(code) {
  const { getUnifiedTokensFromCode } = require('@/lib/google-auth')
  return getUnifiedTokensFromCode(code)
}

