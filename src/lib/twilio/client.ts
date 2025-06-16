import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

// Create a dummy client if credentials are not available
const isDevelopment = process.env.NODE_ENV === 'development';
const hasCredentials = accountSid && authToken && accountSid.startsWith('AC');

export const twilioClient = hasCredentials 
  ? twilio(accountSid, authToken)
  : null;

export const sendSMS = async (to: string, from: string, body: string) => {
  if (!twilioClient) {
    console.warn('Twilio client not initialized - SMS not sent');
    return { success: false, error: 'Twilio credentials not configured' };
  }
  
  try {
    const message = await twilioClient.messages.create({
      body,
      from,
      to,
    });
    return { success: true, messageId: message.sid };
  } catch (error) {
    console.error('Error sending SMS:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

export const makeCall = async (to: string, from: string, url: string) => {
  if (!twilioClient) {
    console.warn('Twilio client not initialized - Call not made');
    return { success: false, error: 'Twilio credentials not configured' };
  }
  
  try {
    const call = await twilioClient.calls.create({
      url,
      to,
      from,
    });
    return { success: true, callId: call.sid };
  } catch (error) {
    console.error('Error making call:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

export const getAvailablePhoneNumbers = async (areaCode?: string) => {
  if (!twilioClient) {
    console.warn('Twilio client not initialized');
    return [];
  }
  
  try {
    const numbers = await twilioClient.availablePhoneNumbers('US')
      .local
      .list({
        areaCode: areaCode ? parseInt(areaCode) : undefined,
        smsEnabled: true,
        voiceEnabled: true,
        limit: 20,
      });
    
    return numbers.map(number => ({
      phoneNumber: number.phoneNumber,
      friendlyName: number.friendlyName,
      locality: number.locality,
      region: number.region,
      capabilities: {
        sms: number.capabilities.sms,
        voice: number.capabilities.voice,
      },
    }));
  } catch (error) {
    console.error('Error fetching available numbers:', error);
    throw error;
  }
};

export const purchasePhoneNumber = async (phoneNumber: string) => {
  if (!twilioClient) {
    console.warn('Twilio client not initialized');
    return { success: false, error: 'Twilio credentials not configured' };
  }
  
  try {
    const number = await twilioClient.incomingPhoneNumbers.create({
      phoneNumber,
      smsUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/twilio/sms`,
      voiceUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/twilio/voice`,
    });
    
    return {
      success: true,
      sid: number.sid,
      phoneNumber: number.phoneNumber,
      friendlyName: number.friendlyName,
    };
  } catch (error) {
    console.error('Error purchasing phone number:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}; 