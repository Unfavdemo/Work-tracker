import { google } from 'googleapis'

/**
 * Unified Google OAuth2 client for all Google services
 * This single authentication grants access to:
 * - Google Calendar (read and create events)
 * - Gmail (read emails)
 * - Google Drive (create and save files)
 * - Google Docs (create and edit documents)
 */

/**
 * Get OAuth2 authorization URL with all required scopes
 * @returns {string} Authorization URL
 */
export function getUnifiedAuthUrl() {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    throw new Error('Google OAuth is not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables.')
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/google/callback'
  )

  // All required scopes requested in a single authentication flow
  // This ensures Calendar, Gmail, Drive, and Docs all work together
  const scopes = [
    'https://www.googleapis.com/auth/calendar.readonly',
    'https://www.googleapis.com/auth/calendar.events',
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/documents',
  ]

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent', // Force consent screen to ensure all permissions are granted
  })
}

/**
 * Exchange authorization code for tokens
 * @param {string} code - Authorization code
 * @returns {Promise<object>} Tokens (access_token, refresh_token)
 */
export async function getUnifiedTokensFromCode(code) {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    throw new Error('Google OAuth is not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables.')
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/google/callback'
  )

  try {
    const { tokens } = await oauth2Client.getToken(code)
    return tokens
  } catch (error) {
    // Handle network/DNS errors
    if (error.code === 'ENOTFOUND' || error.message?.includes('ENOTFOUND') || error.message?.includes('getaddrinfo')) {
      const networkError = new Error(
        'Network connection error: Unable to reach Google OAuth servers. ' +
        'This could be due to:\n' +
        '1. No internet connection on the server\n' +
        '2. DNS resolution issues\n' +
        '3. Firewall or proxy blocking the request\n' +
        '4. VPN or network restrictions\n\n' +
        'Please check your network connectivity and try again.'
      )
      networkError.code = 'NETWORK_ERROR'
      networkError.originalError = error
      throw networkError
    }
    
    // Handle other OAuth errors
    if (error.response?.data) {
      const oauthError = new Error(
        `Google OAuth error: ${error.response.data.error || error.message}`
      )
      oauthError.code = 'OAUTH_ERROR'
      oauthError.details = error.response.data
      throw oauthError
    }
    
    // Re-throw other errors as-is
    throw error
  }
}

/**
 * Get OAuth2 client with credentials set
 * @param {string} accessToken - OAuth2 access token
 * @returns {object} OAuth2 client
 */
export function getOAuth2Client(accessToken) {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    throw new Error('Google OAuth is not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables.')
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/google/callback'
  )

  oauth2Client.setCredentials({ access_token: accessToken })
  return oauth2Client
}

