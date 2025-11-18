# OAuth Setup Guide - Fix "OAuth client was not found" Error

## Problem
You're seeing the error: **"Access blocked: Authorization Error - The OAuth client was not found. Error 401: invalid_client"**

This happens because your Google OAuth credentials are not properly configured.

## Solution

### Step 1: Create Google Cloud Project and OAuth Credentials

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Sign in with your Google account (siquilward221@gmail.com)

2. **Create or Select a Project**
   - Click the project dropdown at the top
   - Click "New Project" or select an existing project
   - Give it a name (e.g., "Taheera Calendar Integration")

3. **Enable Google Calendar API**
   - Go to **APIs & Services** > **Library**
   - Search for "Google Calendar API"
   - Click on it and press **Enable**

4. **Configure OAuth Consent Screen**
   - Go to **APIs & Services** > **OAuth consent screen**
   - Choose **External** (unless you have Google Workspace)
   - Fill in the required fields:
     - **App name**: Taheera's Workshop Tracker
     - **User support email**: siquilward221@gmail.com
     - **Developer contact information**: siquilward221@gmail.com
   - Click **Save and Continue**
   - On **Scopes** page, click **Add or Remove Scopes**
     - Add: `https://www.googleapis.com/auth/calendar.readonly`
     - Add: `https://www.googleapis.com/auth/calendar.events`
   - Click **Update** then **Save and Continue**
   - On **Test users** page, add your email: **siquilward221@gmail.com**
   - Click **Save and Continue** through the remaining steps

5. **Create OAuth Client ID**
   - Go to **APIs & Services** > **Credentials**
   - Click **Create Credentials** > **OAuth client ID**
   - Application type: **Web application**
   - Name: "Taheera Calendar Client"
   - **Authorized redirect URIs**: Add these:
     - `http://localhost:3000/api/auth/callback`
     - (If deploying, also add your production URL)
   - Click **Create**
   - **IMPORTANT**: Copy the **Client ID** and **Client Secret** immediately (you won't see the secret again!)

### Step 2: Update Your Environment Variables

1. **Open your `.env` file** in the project root
2. **Replace the placeholder values** with your actual credentials:

```env
GOOGLE_CLIENT_ID=YOUR_ACTUAL_CLIENT_ID.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=YOUR_ACTUAL_CLIENT_SECRET
```

**Example:**
```env
GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abcdefghijklmnopqrstuvwxyz
```

3. **Save the file**

### Step 3: Restart Your Development Server

After updating the `.env` file, you must restart your Next.js server:

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

### Step 4: Test the Connection

1. Open your app in the browser
2. Navigate to the Schedule panel
3. Click **Connect Google Calendar**
4. You should now see the Google OAuth consent screen
5. Sign in and grant permissions
6. Your calendar events should sync!

## Common Issues

### Still seeing "invalid_client" error?
- ✅ Make sure you copied the **entire** Client ID (it should end with `.apps.googleusercontent.com`)
- ✅ Make sure you copied the **entire** Client Secret (it starts with `GOCSPX-`)
- ✅ Check for extra spaces or quotes in your `.env` file
- ✅ Restart your development server after changing `.env`

### "Redirect URI mismatch" error?
- ✅ Make sure the redirect URI in `.env` matches exactly what you added in Google Cloud Console
- ✅ Default should be: `http://localhost:3000/api/auth/callback`
- ✅ No trailing slashes!

### "Access blocked" with your email?
- ✅ Make sure your email (siquilward221@gmail.com) is added as a **Test user** in OAuth consent screen
- ✅ If your app is in "Testing" mode, only test users can access it
- ✅ To make it public, you'll need to submit for verification (not recommended for development)

## Security Notes

⚠️ **Never commit your `.env` file to Git!**
- Your `.env` file is already in `.gitignore`
- The `.env.example` file is safe to commit (it has placeholder values)

## Need Help?

If you're still having issues:
1. Check the browser console for detailed error messages
2. Check your terminal/server logs for errors
3. Verify your credentials in Google Cloud Console
4. Make sure the Google Calendar API is enabled

