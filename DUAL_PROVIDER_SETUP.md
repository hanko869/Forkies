# Dual Provider Setup: Twilio + SignalWire

This application supports both Twilio and SignalWire as SMS/Voice providers, giving you maximum flexibility and redundancy.

## Overview

The application automatically routes SMS messages through the appropriate provider based on which provider owns the phone number. This means you can:

- Use Twilio numbers and SignalWire numbers simultaneously
- Gradually migrate from one provider to another
- Take advantage of better pricing in different regions
- Have redundancy in case one provider has issues

## How It Works

1. **Phone Number Provider Association**: Each phone number in the database has a `provider` field that indicates whether it's from Twilio or SignalWire.

2. **Automatic Routing**: When sending an SMS, the system automatically checks which provider owns the phone number and routes the message accordingly.

3. **Unified API**: The application code doesn't need to know which provider is being used - it just calls the unified `sendSMS` function.

## Setting Up Both Providers

### Environment Variables

Configure both providers in your `.env.local`:

```env
# Twilio Configuration
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_twilio_auth_token

# SignalWire Configuration
SIGNALWIRE_PROJECT_ID=your_project_id
SIGNALWIRE_TOKEN=your_token
SIGNALWIRE_SPACE_URL=yourspace.signalwire.com
```

You can configure:
- **Both providers**: Full flexibility to use either
- **Only Twilio**: Leave SignalWire variables empty
- **Only SignalWire**: Leave Twilio variables empty

### Database Schema

The `phone_numbers` table has a `provider` column that accepts either 'twilio' or 'signalwire':

```sql
CREATE TABLE phone_numbers (
  id UUID PRIMARY KEY,
  number TEXT NOT NULL,
  provider TEXT CHECK (provider IN ('twilio', 'signalwire')),
  -- other fields...
);
```

### Webhooks

Each provider needs its own webhook endpoints:

**Twilio Webhooks:**
- SMS: `https://your-domain.com/api/webhooks/twilio/sms`
- Voice: `https://your-domain.com/api/webhooks/twilio/voice`

**SignalWire Webhooks:**
- SMS: `https://your-domain.com/api/webhooks/signalwire/sms`
- Voice: `https://your-domain.com/api/webhooks/signalwire/voice`

## Code Architecture

### Unified Provider Interface

The `src/lib/sms/provider.ts` file provides a unified interface:

```typescript
// Send SMS - automatically uses the correct provider
const result = await sendSMS({
  to: '+1234567890',
  from: '+0987654321',
  body: 'Hello from either provider!'
});

// Get available numbers from both providers
const numbers = await getAvailablePhoneNumbers('212');
// Returns: { twilio: [...], signalwire: [...] }

// Purchase a number from a specific provider
const result = await purchasePhoneNumber('+1234567890', 'signalwire');
```

### Provider-Specific Implementations

- `src/lib/twilio/client.ts` - Twilio-specific implementation
- `src/lib/signalwire/client.ts` - SignalWire-specific implementation
- `src/lib/sms/provider.ts` - Unified interface that routes to the appropriate provider

## Admin Features

When logged in as an admin, you can:

1. **Search for available numbers** from both providers
2. **Purchase numbers** from either provider
3. **Assign numbers** to users regardless of provider
4. **View provider information** for each number

## Benefits of Dual Provider Support

1. **Cost Optimization**: Use the provider with better rates for specific regions
2. **Redundancy**: If one provider has issues, you can still use the other
3. **Gradual Migration**: Move from one provider to another without disruption
4. **Feature Comparison**: Use provider-specific features when needed
5. **Load Balancing**: Distribute traffic across providers

## Migration Scenarios

### Migrating from Twilio to SignalWire

1. Keep existing Twilio numbers active
2. Purchase new numbers from SignalWire
3. Gradually move users to SignalWire numbers
4. Eventually remove Twilio configuration when ready

### Adding SignalWire to Existing Twilio Setup

1. Add SignalWire credentials to environment
2. Run the database migration to support both providers
3. Start purchasing SignalWire numbers for new users
4. Existing Twilio numbers continue to work

## Monitoring and Debugging

The application logs indicate which provider was used:

```
Sending SMS via signalwire: +1234567890 -> +0987654321
SMS sent successfully via signalwire: messageId=xxx
```

Check the `messages` table to see the `provider_sid` which indicates the provider's message ID.

## Best Practices

1. **Test both providers** in development before production
2. **Monitor costs** from both providers regularly
3. **Set up alerts** for failed messages from either provider
4. **Document** which numbers use which provider
5. **Plan migrations** carefully to avoid service disruption

## Troubleshooting

### Messages not sending

1. Check provider-specific credentials are correct
2. Verify the phone number's provider in the database
3. Check webhook configuration for incoming messages
4. Review provider-specific error messages in logs

### Provider not found

If you see "No provider found for phone number", ensure:
1. The phone number exists in the database
2. The `provider` field is set correctly
3. The number is marked as `is_active`

### Webhook issues

Each provider has separate webhook endpoints. Ensure:
1. Correct URLs are configured in each provider's dashboard
2. Your application is publicly accessible
3. Webhook endpoints are not blocked by authentication 