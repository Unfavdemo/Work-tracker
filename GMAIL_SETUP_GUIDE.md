# Student Email Tracker Setup Guide

This guide will help you set up Gmail email tracking specifically for student communication emails.

## Prerequisites

- A Google Cloud Platform account
- Access to Google Cloud Console
- Gmail account
- Google Calendar API already set up (uses same OAuth credentials)

## Step 1: Enable Gmail API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your existing project (the same one used for Calendar)
3. Go to **APIs & Services** > **Library**
4. Search for "Gmail API"
5. Click on it and press **Enable**

## Step 2: Update OAuth Consent Screen (if needed)

If you haven't already configured OAuth consent screen:

1. Go to **APIs & Services** > **OAuth consent screen**
2. Add the following scopes:
   - `https://www.googleapis.com/auth/gmail.readonly`
   - `https://www.googleapis.com/auth/gmail.metadata`
3. Save and continue

## Step 3: Update OAuth Client Redirect URI

1. Go to **APIs & Services** > **Credentials**
2. Click on your existing OAuth 2.0 Client ID
3. Under **Authorized redirect URIs**, add:
   - `http://localhost:3000/api/gmail/callback` (for local development)
   - `https://yourdomain.com/api/gmail/callback` (for production)
4. Click **Save**

## Step 4: Environment Variables

Your existing `.env` file should already have:
```env
GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:3000/api/gmail/callback
```

**Note:** The same OAuth credentials work for both Calendar and Gmail APIs.

## Step 5: Test the Integration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to your application
3. Find the **Email Tracker** component
4. Click **Connect Gmail**
5. You'll be redirected to Google's OAuth consent screen
6. Sign in and grant permissions for Gmail
7. Your email statistics should now appear!

## Features

- **Student Email Statistics**: Track total, sent, and received student communication emails
- **Smart Filtering**: Automatically filters emails related to students, workshops, classes, and courses
- **Trend Analysis**: See percentage change compared to previous period
- **Daily Breakdown**: View student email activity for the last 7 days in a chart
- **Recent Student Conversations**: See your most recent student email threads
- **Real-time Updates**: Refresh button to manually sync email data

## What Data is Tracked

The tracker automatically identifies student-related emails by searching for keywords in:
- Email subject lines
- Sender/recipient addresses
- Email content

**Default Keywords**: workshop, student, class, course, assignment, homework, project, lesson, session, training, enrollment, registration, question, help, support

**Educational Domains**: Emails from/to .edu domains or containing "student", "university", "college", "school"

- **Total Student Emails**: All student-related emails in the selected time period (default: 30 days)
- **Sent Emails**: Student emails you sent
- **Received Emails**: Student emails you received
- **Daily Breakdown**: Sent and received student emails per day for the last 7 days
- **Recent Threads**: Your 5 most recent student email conversations

## Troubleshooting

### "Gmail API not enabled" error
- Make sure Gmail API is enabled in Google Cloud Console
- Check that you're using the correct project

### "Invalid redirect URI" error
- Make sure the redirect URI in `.env.local` exactly matches the one in Google Cloud Console
- Default should be: `http://localhost:3000/api/gmail/callback`
- No trailing slashes!

### "Access blocked" error
- If your app is in testing mode, make sure your email is added as a test user
- Check that the OAuth consent screen is properly configured
- Make sure Gmail scopes are added to the consent screen

### No email data showing
- Check browser console for errors
- Verify your access token is stored in localStorage (key: `gmail_token`)
- Make sure you have student-related emails in your Gmail account (emails containing keywords like "workshop", "student", "class", etc.)
- The tracker only shows emails that match student communication keywords
- Try clicking the refresh button
- If you have student emails but they're not showing, the keywords might need adjustment

### Token expired
- The app will automatically detect expired tokens and prompt for re-authentication
- You may need to reconnect your Gmail

## Security Notes

- Access tokens are stored in browser localStorage (client-side only)
- For production, consider implementing server-side token storage and refresh token handling
- Never expose your Client Secret in client-side code
- Use environment variables for all sensitive configuration
- The Gmail API only requests read-only access to your emails

## API Scopes Used

- `gmail.readonly`: Read-only access to Gmail messages and metadata
- `gmail.metadata`: Access to email metadata (headers, labels, etc.) without full message content

## Customizing Student Email Keywords

You can customize which emails are considered "student emails" by passing keywords to the API:

```
/api/gmail/stats?keywords=workshop,student,class,course
```

The default keywords are: `workshop OR student OR class OR course OR assignment OR "workshop materials"`

## Next Steps

- Add custom keyword configuration in the UI
- Implement email search functionality
- Add email filtering by date range
- Add support for email labels/categories
- Implement automatic token refresh
- Add email thread details view
- Track email response times
- Add student email address whitelist/blacklist

