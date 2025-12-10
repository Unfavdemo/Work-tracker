# Deployment Guide for Vercel

This guide covers deploying Taheera's Workshop Tracker to Vercel and configuring it properly.

## Production URL

Your application is deployed at: **https://taheera-time-data-tracker.vercel.app**

## Required Environment Variables

Set these environment variables in your Vercel project settings:

### Google OAuth Configuration

1. **`GOOGLE_CLIENT_ID`** - Your Google OAuth Client ID
2. **`GOOGLE_CLIENT_SECRET`** - Your Google OAuth Client Secret
3. **`GOOGLE_REDIRECT_URI`** - Set to: `https://taheera-time-data-tracker.vercel.app/api/google/callback`
4. **`NEXT_PUBLIC_APP_URL`** - Set to: `https://taheera-time-data-tracker.vercel.app`
5. **`NEXT_PUBLIC_BASE_URL`** - Set to: `https://taheera-time-data-tracker.vercel.app`

### Optional Environment Variables

- **`OPENAI_API_KEY`** - Your OpenAI API key (if you want server-side AI features)

## Google Cloud Console Configuration

### 1. Authorized JavaScript Origins

In your [Google Cloud Console](https://console.cloud.google.com/apis/credentials), add these authorized JavaScript origins:

```
https://taheera-time-data-tracker.vercel.app
```

### 2. Authorized Redirect URIs

Add this authorized redirect URI:

```
https://taheera-time-data-tracker.vercel.app/api/google/callback
```

### 3. Application Privacy Policy Link

Add this URL in your OAuth consent screen:

```
https://taheera-time-data-tracker.vercel.app/privacy
```

### 4. Application Terms of Service Link

Add this URL in your OAuth consent screen:

```
https://taheera-time-data-tracker.vercel.app/terms
```

### 5. Authorized Domains

In your OAuth consent screen, add:

```
taheera-time-data-tracker.vercel.app
```

## Setting Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add each variable with the appropriate value
4. Make sure to select the correct environment (Production, Preview, Development)
5. Redeploy your application after adding variables

## Testing the Deployment

After deployment, verify:

1. ✅ Application loads at https://taheera-time-data-tracker.vercel.app
2. ✅ Privacy Policy accessible at https://taheera-time-data-tracker.vercel.app/privacy
3. ✅ Terms of Service accessible at https://taheera-time-data-tracker.vercel.app/terms
4. ✅ Google OAuth connection works
5. ✅ Footer links work correctly

## Custom Domain (Optional)

If you want to use a custom domain:

1. Add your domain in Vercel project settings
2. Update `NEXT_PUBLIC_APP_URL` and `GOOGLE_REDIRECT_URI` to use your custom domain
3. Update Google Cloud Console authorized origins and redirect URIs
4. Update the authorized domains in the OAuth consent screen

## Troubleshooting

### OAuth Not Working

- Verify all environment variables are set correctly
- Check that redirect URIs match exactly in Google Cloud Console
- Ensure the domain is added to authorized domains in OAuth consent screen

### Privacy/Terms Links Not Working

- Verify the pages are deployed (check `/privacy` and `/terms` routes)
- Check that the footer component is included in the layout

### API Routes Not Working

- Verify `NEXT_PUBLIC_BASE_URL` is set correctly
- Check Vercel function logs for errors
- Ensure environment variables are available at build time

