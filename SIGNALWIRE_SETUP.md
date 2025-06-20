# SignalWire Setup Guide

This guide will help you set up SignalWire as your SMS/Voice provider for the 2way application. The application supports both Twilio and SignalWire, allowing you to use either or both providers simultaneously.

## Prerequisites

1. A SignalWire account (sign up at https://signalwire.com)
2. Your Supabase project already configured
3. The application running locally or deployed

## Step 1: Get Your SignalWire Credentials

1. Log in to your SignalWire Space dashboard
2. Navigate to **API** → **Credentials**
3. Copy the following values:
   - **Project ID**: Your unique project identifier
   - **API Token**: Your authentication token
   - **Space URL**: Your space domain (e.g., `yourspace.signalwire.com`)

## Step 2: Configure Environment Variables

Create a `.env.local` file in your project root (if it doesn't exist) and add:

```env
# SignalWire Configuration
SIGNALWIRE_PROJECT_ID=your_project_id_here
SIGNALWIRE_TOKEN=your_token_here
SIGNALWIRE_SPACE_URL=yourspace.signalwire.com

# Twilio Configuration (Optional - if you also want to use Twilio)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token

# Existing Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Application URL (update for production)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Step 3: Update Your Database

Run the migration script to update your database schema:

1. Go to your Supabase dashboard
2. Navigate to **SQL Editor**
3. Run the migration script from `scripts/migrate-to-signalwire.sql`

## Step 4: Purchase a Phone Number

### Option A: Using SignalWire Dashboard

1. In your SignalWire dashboard, go to **Phone Numbers** → **Buy Numbers**
2. Search for available numbers by area code or capabilities
3. Select a number with SMS (and Voice if needed) capabilities
4. Purchase the number

### Option B: Using the Application (once configured)

The admin interface will allow you to search and purchase numbers directly.

## Step 5: Configure Webhooks

For each phone number you purchase:

1. In SignalWire dashboard, go to **Phone Numbers** → **Manage**
2. Click on your phone number
3. Configure the following webhooks:

   **For SMS:**
   - When a Message Comes In: `https://your-domain.com/api/webhooks/signalwire/sms`
   - Method: `POST`

   **For Voice (if using):**
   - When a Call Comes In: `https://your-domain.com/api/webhooks/signalwire/voice`
   - Method: `POST`

## Step 6: Test Your Setup

1. Start your application: `npm run dev`
2. Log in as an admin
3. Assign a phone number to a user
4. Send a test SMS

## Webhook URL Format

Make sure to replace `your-domain.com` with your actual domain:

- **Local Development**: `http://localhost:3000/api/webhooks/signalwire/sms`
- **Production**: `https://your-domain.com/api/webhooks/signalwire/sms`

For local development, you'll need to use a tunneling service like ngrok:

```bash
ngrok http 3000
```

Then use the ngrok URL for your webhooks.

## SignalWire Features

SignalWire offers several advantages:

1. **Compatibility**: Uses the same API format as Twilio (LaML/TwiML)
2. **Pricing**: Generally more competitive pricing than Twilio
3. **Real-time API**: Advanced WebSocket-based real-time messaging
4. **Reliability**: Built on robust telecom infrastructure

## Troubleshooting

### SMS Not Sending
- Check your SignalWire credentials in `.env.local`
- Verify the phone number is active in SignalWire
- Check the application logs for error messages

### Webhooks Not Working
- Ensure your webhook URLs are publicly accessible
- Check SignalWire's debugger for webhook failures
- Verify the webhook URLs are correctly configured

### Credits Not Deducting
- Ensure the database migration was run successfully
- Check that the user has sufficient credits
- Verify the phone number is assigned to the user

## Additional Resources

- [SignalWire Documentation](https://developer.signalwire.com/)
- [SignalWire Messaging Guide](https://developer.signalwire.com/messaging/)
- [SignalWire REST API](https://developer.signalwire.com/compatibility-api/rest)

## Support

For SignalWire-specific issues:
- SignalWire Support: https://signalwire.com/support
- Community Forum: https://community.signalwire.com/

For application issues:
- Check the application logs
- Review the error messages in the browser console
- Ensure all environment variables are set correctly 