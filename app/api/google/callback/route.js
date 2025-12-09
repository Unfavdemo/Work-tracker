import { NextResponse } from 'next/server'
import { getUnifiedTokensFromCode } from '@/lib/google-auth'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const error = searchParams.get('error')

    if (error) {
      // Return HTML page that sends error message to parent window
      const errorHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Google Authentication Error</title>
          </head>
          <body>
            <div style="display: flex; align-items: center; justify-content: center; height: 100vh; font-family: system-ui;">
              <div style="text-align: center;">
                <p style="color: #ef4444; font-size: 14px;">Google authentication was cancelled or denied.</p>
              </div>
            </div>
            <script>
              if (window.opener) {
                window.opener.postMessage({
                  type: 'GOOGLE_AUTH_ERROR',
                  error: ${JSON.stringify(error)},
                }, window.location.origin);
                setTimeout(() => window.close(), 2000);
              } else {
                window.location.href = '${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}?google_auth_error=' + encodeURIComponent(${JSON.stringify(error)});
              }
            </script>
          </body>
        </html>
      `
      return new NextResponse(errorHtml, {
        headers: {
          'Content-Type': 'text/html',
        },
        status: 400,
      })
    }

    if (!code) {
      // Return HTML page that sends error message to parent window
      const errorHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Google Authentication Error</title>
          </head>
          <body>
            <div style="display: flex; align-items: center; justify-content: center; height: 100vh; font-family: system-ui;">
              <div style="text-align: center;">
                <p style="color: #ef4444; font-size: 14px;">No authorization code received.</p>
              </div>
            </div>
            <script>
              if (window.opener) {
                window.opener.postMessage({
                  type: 'GOOGLE_AUTH_ERROR',
                  error: 'No authorization code received',
                }, window.location.origin);
                setTimeout(() => window.close(), 2000);
              } else {
                window.location.href = '${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}?google_auth_error=no_code';
              }
            </script>
          </body>
        </html>
      `
      return new NextResponse(errorHtml, {
        headers: {
          'Content-Type': 'text/html',
        },
        status: 400,
      })
    }

    const tokens = await getUnifiedTokensFromCode(code)

    // Return HTML page that will communicate with parent window
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Authenticating Google Services...</title>
        </head>
        <body>
          <div style="display: flex; align-items: center; justify-content: center; height: 100vh; font-family: system-ui;">
            <div style="text-align: center;">
              <div style="border: 3px solid #f3f4f6; border-top: 3px solid #3b82f6; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 0 auto 16px;"></div>
              <p style="color: #6b7280; font-size: 14px;">Completing Google authentication...</p>
            </div>
          </div>
          <script>
            (function() {
              const tokens = ${JSON.stringify(tokens)};
              const origin = window.location.origin;
              
              // Try to send message immediately
              function sendMessage() {
                if (window.opener && !window.opener.closed) {
                  try {
                    window.opener.postMessage({
                      type: 'GOOGLE_AUTH_SUCCESS',
                      accessToken: tokens.access_token,
                      refreshToken: tokens.refresh_token,
                      services: ['calendar', 'gmail', 'drive', 'docs'],
                    }, origin);
                    // Give message time to be received before closing
                    setTimeout(() => {
                      try {
                        window.close();
                      } catch (e) {
                        // Popup might already be closed
                      }
                    }, 100);
                  } catch (e) {
                    console.error('Error sending postMessage:', e);
                    // Fallback: redirect with tokens in URL
                    window.location.href = '${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}?google_auth_success=true&token=' + encodeURIComponent(tokens.access_token);
                  }
                } else {
                  // Fallback: redirect with tokens in URL (less secure, but works)
                  window.location.href = '${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}?google_auth_success=true&token=' + encodeURIComponent(tokens.access_token);
                }
              }
              
              // Send immediately when script loads
              sendMessage();
              
              // Also try on page load in case opener wasn't ready
              if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', sendMessage);
              }
            })();
          </script>
          <style>
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          </style>
        </body>
      </html>
    `

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
      },
    })
  } catch (error) {
    console.error('Google auth callback error:', error)
    
    // Determine error message based on error type
    let errorMessage = error.message || 'Google authentication failed. Please try again.'
    let errorDetails = ''
    
    if (error.code === 'NETWORK_ERROR' || error.message?.includes('ENOTFOUND') || error.message?.includes('getaddrinfo')) {
      errorMessage = 'Network connection error'
      errorDetails = 'Unable to connect to Google OAuth servers. Please check your internet connection and network settings.'
    } else if (error.code === 'OAUTH_ERROR') {
      errorMessage = 'OAuth authentication error'
      errorDetails = error.message
    } else if (error.message?.includes('not configured')) {
      errorMessage = 'OAuth not configured'
      errorDetails = 'Please configure Google OAuth credentials in your environment variables.'
    }
    
    const errorHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Google Authentication Failed</title>
          <style>
            body {
              font-family: system-ui, -apple-system, sans-serif;
              margin: 0;
              padding: 0;
              background: #f9fafb;
            }
            .container {
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              padding: 20px;
            }
            .error-box {
              background: white;
              border-radius: 8px;
              padding: 24px;
              max-width: 500px;
              box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }
            .error-title {
              color: #ef4444;
              font-size: 18px;
              font-weight: 600;
              margin-bottom: 8px;
            }
            .error-details {
              color: #6b7280;
              font-size: 14px;
              line-height: 1.5;
              margin-top: 12px;
            }
            .error-code {
              background: #f3f4f6;
              padding: 8px 12px;
              border-radius: 4px;
              font-family: monospace;
              font-size: 12px;
              color: #374151;
              margin-top: 12px;
              word-break: break-all;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="error-box">
              <div class="error-title">${errorMessage}</div>
              ${errorDetails ? `<div class="error-details">${errorDetails}</div>` : ''}
              ${error.code ? `<div class="error-code">Error Code: ${error.code}</div>` : ''}
            </div>
          </div>
          <script>
            if (window.opener) {
              window.opener.postMessage({
                type: 'GOOGLE_AUTH_ERROR',
                error: ${JSON.stringify(errorMessage)},
                details: ${JSON.stringify(errorDetails)},
                code: ${JSON.stringify(error.code || '')},
              }, window.location.origin);
              setTimeout(() => window.close(), 5000);
            }
          </script>
        </body>
      </html>
    `
    return new NextResponse(errorHtml, {
      headers: {
        'Content-Type': 'text/html',
      },
      status: 400,
    })
  }
}

