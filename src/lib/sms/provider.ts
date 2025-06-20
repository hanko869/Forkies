import { sendSMS as sendTwilioSMS } from '@/lib/twilio/client';
import { sendSMS as sendSignalWireSMS } from '@/lib/signalwire/client';
import { createClient } from '@/lib/supabase/server';

export type SmsProvider = 'twilio' | 'signalwire';

export interface SendSmsOptions {
  to: string;
  from: string;
  body: string;
  provider?: SmsProvider;
  userId?: string; // To look up user's preferred provider
}

export interface SmsResult {
  success: boolean;
  messageId?: string;
  error?: string;
  provider?: SmsProvider;
}

/**
 * Send SMS using the appropriate provider based on user preference or phone number
 */
export async function sendSMS(options: SendSmsOptions): Promise<SmsResult> {
  const { to, from, body, provider, userId } = options;

  // If provider is explicitly specified, use it
  if (provider) {
    return sendWithProvider(to, from, body, provider);
  }

  const supabase = await createClient();

  // If userId is provided, check user's preferred provider first
  if (userId) {
    try {
      const { data: user } = await supabase
        .from('users')
        .select('preferred_provider')
        .eq('id', userId)
        .single();

      if (user?.preferred_provider) {
        console.log(`Using user's preferred provider: ${user.preferred_provider}`);
        return sendWithProvider(to, from, body, user.preferred_provider as SmsProvider);
      }
    } catch (error) {
      console.error('Error looking up user preferred provider:', error);
    }
  }

  // Otherwise, look up the provider based on the 'from' phone number
  try {
    const { data: phoneNumber } = await supabase
      .from('phone_numbers')
      .select('provider')
      .eq('number', from)
      .single();

    if (phoneNumber?.provider) {
      return sendWithProvider(to, from, body, phoneNumber.provider as SmsProvider);
    }

    // Default to Twilio if no provider found
    console.warn(`No provider found for phone number ${from}, defaulting to Twilio`);
    return sendWithProvider(to, from, body, 'twilio');
  } catch (error) {
    console.error('Error looking up phone number provider:', error);
    // Default to Twilio on error
    return sendWithProvider(to, from, body, 'twilio');
  }
}

/**
 * Send SMS using the specified provider
 */
async function sendWithProvider(
  to: string, 
  from: string, 
  body: string, 
  provider: SmsProvider
): Promise<SmsResult> {
  try {
    let result;
    
    switch (provider) {
      case 'signalwire':
        result = await sendSignalWireSMS(to, from, body);
        break;
      case 'twilio':
      default:
        result = await sendTwilioSMS(to, from, body);
        break;
    }

    return {
      ...result,
      provider
    };
  } catch (error) {
    console.error(`Error sending SMS with ${provider}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      provider
    };
  }
}

/**
 * Get available phone numbers from both providers
 */
export async function getAvailablePhoneNumbers(areaCode?: string, provider?: SmsProvider) {
  const results = {
    twilio: [] as any[],
    signalwire: [] as any[]
  };

  // If specific provider requested, only query that one
  if (provider) {
    try {
      if (provider === 'twilio') {
        const { getAvailablePhoneNumbers: getTwilioNumbers } = await import('@/lib/twilio/client');
        results.twilio = await getTwilioNumbers(areaCode);
      } else {
        const { getAvailablePhoneNumbers: getSignalWireNumbers } = await import('@/lib/signalwire/client');
        results.signalwire = await getSignalWireNumbers(areaCode);
      }
    } catch (error) {
      console.error(`Error fetching numbers from ${provider}:`, error);
    }
    return results;
  }

  // Otherwise, query both providers
  const promises: Promise<void>[] = [];

  // Check Twilio
  promises.push(
    import('@/lib/twilio/client').then(async ({ getAvailablePhoneNumbers: getTwilioNumbers }) => {
      try {
        results.twilio = await getTwilioNumbers(areaCode);
      } catch (error) {
        console.error('Error fetching Twilio numbers:', error);
      }
    })
  );

  // Check SignalWire
  promises.push(
    import('@/lib/signalwire/client').then(async ({ getAvailablePhoneNumbers: getSignalWireNumbers }) => {
      try {
        results.signalwire = await getSignalWireNumbers(areaCode);
      } catch (error) {
        console.error('Error fetching SignalWire numbers:', error);
      }
    })
  );

  await Promise.all(promises);
  return results;
}

/**
 * Purchase a phone number from the specified provider
 */
export async function purchasePhoneNumber(phoneNumber: string, provider: SmsProvider) {
  try {
    let result;
    
    if (provider === 'twilio') {
      const { purchasePhoneNumber: purchaseTwilio } = await import('@/lib/twilio/client');
      result = await purchaseTwilio(phoneNumber);
    } else {
      const { purchasePhoneNumber: purchaseSignalWire } = await import('@/lib/signalwire/client');
      result = await purchaseSignalWire(phoneNumber);
    }

    if (result.success) {
      // Store the phone number in database with the correct provider
      const supabase = await createClient();
      await supabase
        .from('phone_numbers')
        .insert({
          number: result.phoneNumber,
          provider: provider,
          is_active: true,
        });
    }

    return result;
  } catch (error) {
    console.error(`Error purchasing phone number from ${provider}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
} 