import { NextResponse } from 'next/server'
import { getTokensFromCode } from '@/lib/google-calendar'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const error = searchParams.get('error')

    if (error) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}?auth_error=${encodeURIComponent(error)}`
      )
    }

    if (!code) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}?auth_error=no_code`
      )
    }

    const tokens = await getTokensFromCode(code)

    // Return HTML page that will communicate with parent window
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Authenticating...</title>
        </head>
        <body>
          <div style="display: flex; align-items: center; justify-content: center; height: 100vh; font-family: system-ui;">
            <div style="text-align: center;">
              <div style="border: 3px solid #f3f4f6; border-top: 3px solid #3b82f6; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 0 auto 16px;"></div>
              <p style="color: #6b7280; font-size: 14px;">Completing authentication...</p>
            </div>
          </div>
          <script>
            (function() {
              const tokens = ${JSON.stringify(tokens)};
              if (window.opener) {
                window.opener.postMessage({
                  type: 'GOOGLE_AUTH_SUCCESS',
                  accessToken: tokens.access_token,
                  refreshToken: tokens.refresh_token,
                  services: ['calendar', 'drive', 'docs'],
                }, window.location.origin);
                window.close();
              } else {
                // Fallback: redirect with tokens in URL (less secure, but works)
                window.location.href = '${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}?auth_success=true&token=' + encodeURIComponent(tokens.access_token);
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
    console.error('Auth callback error:', error)
    const errorHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Authentication Failed</title>
        </head>
        <body>
          <div style="display: flex; align-items: center; justify-content: center; height: 100vh; font-family: system-ui;">
            <div style="text-align: center;">
              <p style="color: #ef4444; font-size: 14px;">Authentication failed. Please try again.</p>
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

