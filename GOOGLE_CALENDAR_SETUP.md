# Google Calendar Integration Setup Guide

This guide will help you set up Google Calendar integration for the schedule component.

## Prerequisites

- A Google Cloud Platform account
- Access to Google Cloud Console

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown and select "New Project"
3. Enter a project name (e.g., "Taheera Calendar Integration")
4. Click "Create"

## Step 2: Enable Google Calendar API

1. In your Google Cloud project, go to **APIs & Services** > **Library**
2. Search for "Google Calendar API"
3. Click on it and press **Enable**

## Step 3: Create OAuth 2.0 Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth client ID**
3. If prompted, configure the OAuth consent screen:
   - Choose **External** (unless you have a Google Workspace)
   - Fill in the required fields (App name, User support email, Developer contact)
   - Add scopes: `https://www.googleapis.com/auth/calendar.readonly` and `https://www.googleapis.com/auth/calendar.events`
   - Add test users (your email) if in testing mode
   - Save and continue
4. For OAuth client:
   - Application type: **Web application**
   - Name: "Taheera Calendar Client"
   - Authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback` (for local development)
     - `https://yourdomain.com/api/auth/callback` (for production)
   - Click **Create**
5. Copy the **Client ID** and **Client Secret**

## Step 4: Configure Environment Variables

1. Create a `.env.local` file in the root of your project (if it doesn't exist)
2. Add the following variables:

```env
GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/callback
```

**Important:** 
- Never commit `.env.local` to version control
- For production, update `GOOGLE_REDIRECT_URI` to your production URL
- Make sure the redirect URI in your `.env.local` matches the one in Google Cloud Console

## Step 5: Test the Integration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to your application
3. In the Schedule panel, click **Connect Google Calendar**
4. You'll be redirected to Google's OAuth consent screen
5. Sign in and grant permissions
6. You should see your Google Calendar events in the schedule panel

## Features

- **View Events**: Automatically syncs and displays events from your Google Calendar
- **Real-time Updates**: Refresh button to manually sync events
- **Search**: Filter events using the search functionality
- **Event Details**: Shows event title, time, date, location, and status

## Troubleshooting

### "Invalid redirect URI" error
- Make sure the redirect URI in `.env.local` exactly matches the one in Google Cloud Console
- Check for trailing slashes or protocol mismatches (http vs https)

### "Access blocked" error
- If your app is in testing mode, make sure your email is added as a test user
- Check that the OAuth consent screen is properly configured

### Events not loading
- Check browser console for errors
- Verify your access token is stored in localStorage
- Check that the Google Calendar API is enabled in your project

### Token expired
- The app will automatically detect expired tokens and prompt for re-authentication
- You may need to reconnect your Google Calendar

## Security Notes

- Access tokens are stored in browser localStorage (client-side only)
- For production, consider implementing server-side token storage and refresh token handling
- Never expose your Client Secret in client-side code
- Use environment variables for all sensitive configuration

## Next Steps

- Implement event creation functionality
- Add support for multiple calendars
- Add calendar selection dropdown
- Implement automatic token refresh

