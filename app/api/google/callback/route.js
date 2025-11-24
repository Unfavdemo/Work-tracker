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
    const errorHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Google Authentication Failed</title>
        </head>
        <body>
          <div style="display: flex; align-items: center; justify-content: center; height: 100vh; font-family: system-ui;">
            <div style="text-align: center;">
              <p style="color: #ef4444; font-size: 14px;">Google authentication failed. Please try again.</p>
            </div>
          </div>
          <script>
            if (window.opener) {
              window.opener.postMessage({
                type: 'GOOGLE_AUTH_ERROR',
                error: ${JSON.stringify(error.message)},
              }, window.location.origin);
              setTimeout(() => window.close(), 2000);
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

