import { google } from 'googleapis'

/**
 * Initialize Google Calendar API client
 * @param {string} accessToken - OAuth2 access token
 * @returns {object} Google Calendar API client
 */
export function getCalendarClient(accessToken) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/callback'
  )

  oauth2Client.setCredentials({ access_token: accessToken })
  
  return google.calendar({ version: 'v3', auth: oauth2Client })
}

/**
 * Fetch events from Google Calendar
 * @param {string} accessToken - OAuth2 access token
 * @param {object} options - Query options (timeMin, timeMax, maxResults)
 * @returns {Promise<Array>} Array of calendar events
 */
export async function fetchCalendarEvents(accessToken, options = {}) {
  try {
    const calendar = getCalendarClient(accessToken)
    
    const {
      timeMin = new Date().toISOString(),
      timeMax,
      maxResults = 50,
      calendarId = 'primary'
    } = options

    const response = await calendar.events.list({
      calendarId,
      timeMin,
      timeMax,
      maxResults,
      singleEvents: true,
      orderBy: 'startTime',
    })

    return response.data.items || []
  } catch (error) {
    console.error('Error fetching calendar events:', error)
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
 * Get OAuth2 authorization URL
 * @returns {string} Authorization URL
 */
export function getAuthUrl() {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/callback'
  )

  const scopes = [
    'https://www.googleapis.com/auth/calendar.readonly',
    'https://www.googleapis.com/auth/calendar.events',
  ]

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent',
  })
}

/**
 * Exchange authorization code for tokens
 * @param {string} code - Authorization code
 * @returns {Promise<object>} Tokens (access_token, refresh_token)
 */
export async function getTokensFromCode(code) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/callback'
  )

  const { tokens } = await oauth2Client.getToken(code)
  return tokens
}

