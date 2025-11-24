import { google } from 'googleapis'
import { getOAuth2Client } from '@/lib/google-auth'

/**
 * Initialize Google Drive API client
 * @param {string} accessToken - OAuth2 access token
 * @returns {object} Google Drive API client
 */
export function getDriveClient(accessToken) {
  const oauth2Client = getOAuth2Client(accessToken)
  return google.drive({ version: 'v3', auth: oauth2Client })
}

/**
 * Initialize Google Docs API client
 * @param {string} accessToken - OAuth2 access token
 * @returns {object} Google Docs API client
 */
export function getDocsClient(accessToken) {
  const oauth2Client = getOAuth2Client(accessToken)
  return google.docs({ version: 'v1', auth: oauth2Client })
}

/**
 * Create a new Google Doc and save it to Drive
 * @param {string} accessToken - OAuth2 access token
 * @param {object} docData - Document data (title, content)
 * @returns {Promise<object>} Created document with file ID and URL
 */
export async function createGoogleDoc(accessToken, docData) {
  try {
    if (!accessToken || accessToken.trim() === '') {
      throw new Error('Access token is required')
    }
    
    // Check if Google API credentials are configured
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      throw new Error('Google Docs API is not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables.')
    }

    const drive = getDriveClient(accessToken)
    const docs = getDocsClient(accessToken)

    // Step 1: Create a new Google Doc file in Drive
    const fileMetadata = {
      name: docData.title || 'Untitled Document',
      mimeType: 'application/vnd.google-apps.document',
    }

    const file = await drive.files.create({
      requestBody: fileMetadata,
      fields: 'id, name, webViewLink, webContentLink',
    })

    const documentId = file.data.id

    // Step 2: Add content to the document
    if (docData.content) {
      try {
        // Wait a brief moment for the document to be fully initialized
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Get the document structure
        const document = await docs.documents.get({
          documentId,
        })

        // Find a safe insertion point
        // New Google Docs typically start with an empty paragraph at index 1
        // We want to insert at the end of the body content
        let insertIndex = 1
        
        if (document.data.body?.content && document.data.body.content.length > 0) {
          // Find the last text element or use the end of the body
          const lastElement = document.data.body.content[document.data.body.content.length - 1]
          if (lastElement.paragraph) {
            // Insert at the end of the last paragraph
            const paragraphElements = lastElement.paragraph.elements || []
            if (paragraphElements.length > 0) {
              const lastTextElement = paragraphElements[paragraphElements.length - 1]
              if (lastTextElement.textRun) {
                insertIndex = lastElement.endIndex - 1
              } else {
                insertIndex = lastElement.startIndex || 1
              }
            } else {
              insertIndex = lastElement.startIndex || 1
            }
          } else {
            insertIndex = lastElement.endIndex - 1 || 1
          }
        }
        
        const requests = [
          {
            insertText: {
              location: {
                index: insertIndex,
              },
              text: docData.content,
            },
          },
        ]

        await docs.documents.batchUpdate({
          documentId,
          requestBody: {
            requests,
          },
        })
      } catch (contentError) {
        // If content insertion fails, log the error but don't fail the whole operation
        // The document is still created, just without content
        console.error('Failed to insert content into document:', contentError)
        console.error('Content error details:', {
          code: contentError.code,
          message: contentError.message,
          response: contentError.response?.data,
        })
        // Re-throw with more context for better error messages
        throw new Error(`Failed to add content to document: ${contentError.message || 'Unknown error'}`)
      }
    }

    return {
      id: documentId,
      name: file.data.name,
      webViewLink: file.data.webViewLink,
      webContentLink: file.data.webContentLink,
    }
  } catch (error) {
    console.error('Error creating Google Doc:', error)
    
    // Check for authentication errors
    if (error.code === 401 || error.code === 403 || 
        error.message?.includes('invalid authentication') ||
        error.message?.includes('authentication credential')) {
      const authError = new Error('Invalid or expired authentication token')
      authError.code = error.code || 401
      throw authError
    }
    
    throw error
  }
}

/**
 * Get OAuth2 authorization URL for Drive and Docs
 * @deprecated Use getUnifiedAuthUrl from @/lib/google-auth instead
 * This function is kept for backward compatibility
 * @returns {string} Authorization URL
 */
export function getDriveAuthUrl() {
  const { getUnifiedAuthUrl } = require('@/lib/google-auth')
  return getUnifiedAuthUrl()
}

