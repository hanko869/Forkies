# Deployment Guide for 2Way SMS

## Prerequisites
- GitHub account
- Vercel account (free tier is sufficient)
- Your Supabase credentials ready

## Step 1: Create GitHub Repository

1. Go to [GitHub](https://github.com/new)
2. Create a new repository named `2way-sms`
3. Keep it private if you prefer
4. Don't initialize with README (we already have one)

## Step 2: Push to GitHub

Run these commands in your terminal:

```bash
git remote add origin https://github.com/YOUR_USERNAME/2way-sms.git
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username.

## Step 3: Deploy to Vercel

1. Go to [Vercel](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Configure your project:
   - Framework Preset: **Next.js**
   - Root Directory: **./** (leave as is)
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)

## Step 4: Add Environment Variables

In Vercel project settings, add these environment variables:

### Required Variables:
```
NEXT_PUBLIC_SUPABASE_URL=https://cscsmwsnwmdizprlftwj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzY3Ntd3Nud21kaXpwcmxmdHdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQzMjUzMzcsImV4cCI6MjA0OTkwMTMzN30.VqnBdLNGlGh9j1YtW1XdBhJxHvTCE7Np85V9jl1qQhs
SUPABASE_SERVICE_ROLE_KEY=[Your service role key from .env.local]
NEXT_PUBLIC_APP_URL=https://your-app-name.vercel.app
JWT_SECRET=[Generate a random string]
```

### Optional (for Twilio):
```
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

## Step 5: Deploy

1. Click "Deploy"
2. Wait for the build to complete (usually 2-3 minutes)
3. Your app will be live at `https://your-app-name.vercel.app`

## Step 6: Update Supabase URLs

1. Go to your Supabase project settings
2. Add your Vercel URL to:
   - Authentication > URL Configuration > Site URL
   - Authentication > URL Configuration > Redirect URLs

## Post-Deployment Setup

### Configure Twilio (when ready)
1. Get Twilio credentials from [Twilio Console](https://console.twilio.com)
2. Update environment variables in Vercel
3. Configure webhooks in Twilio:
   - SMS webhook: `https://your-app.vercel.app/api/webhooks/twilio/sms`
   - Voice webhook: `https://your-app.vercel.app/api/webhooks/twilio/voice`

### Test the Application
1. Visit your deployed URL
2. Login with admin credentials:
   - Email: `lirong@admin.com`
   - Password: `Qq221122?@`
3. Test user credentials:
   - Email: `testuser@example.com`
   - Password: `TestPassword123!`

## Automatic Deployments

After initial setup:
- Every push to `main` branch will trigger automatic deployment
- Preview deployments for pull requests
- Rollback capability in Vercel dashboard

## Troubleshooting

### Build Errors
- Check environment variables are set correctly
- Ensure all required dependencies are in package.json
- Check Vercel build logs for specific errors

### Authentication Issues
- Verify Supabase URLs are correctly configured
- Check that service role key is properly set
- Ensure redirect URLs include your Vercel domain

### Database Connection
- Verify Supabase project is active
- Check service role key has proper permissions
- Ensure database schema is properly migrated

## Security Notes

1. Never commit `.env.local` to git
2. Use Vercel's environment variable UI for sensitive data
3. Rotate JWT_SECRET periodically
4. Keep Supabase service role key secure
5. Enable 2FA on GitHub and Vercel accounts

## Monitoring

1. Use Vercel Analytics (free tier available)
2. Monitor Supabase dashboard for:
   - Database usage
   - Authentication metrics
   - API requests
3. Set up error tracking (e.g., Sentry) for production

## Support

For issues:
1. Check Vercel deployment logs
2. Review Supabase logs
3. Check browser console for client-side errors
4. Review server logs in Vercel Functions tab 