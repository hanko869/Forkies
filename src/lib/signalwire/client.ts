import { SignalWire } from '@signalwire/realtime-api';

// SignalWire credentials
const projectId = process.env.SIGNALWIRE_PROJECT_ID;
const token = process.env.SIGNALWIRE_TOKEN;
const spaceUrl = process.env.SIGNALWIRE_SPACE_URL;

// Create SignalWire client
let signalWireClient: any = null;

const initializeClient = async () => {
  if (!projectId || !token || !spaceUrl) {
    console.warn('SignalWire credentials not configured');
    return null;
  }

  try {
    const client = await SignalWire({
      project: projectId,
      token: token,
      // Extract space name from the full URL
      host: spaceUrl.replace('https://', '').replace('.signalwire.com', '')
    });
    return client;
  } catch (error) {
    console.error('Error initializing SignalWire client:', error);
    return null;
  }
};

export const sendSMS = async (to: string, from: string, body: string) => {
  try {
    if (!signalWireClient) {
      signalWireClient = await initializeClient();
    }

    if (!signalWireClient) {
      console.warn('SignalWire client not initialized - SMS not sent');
      return { success: false, error: 'SignalWire credentials not configured' };
    }

    const messageClient = signalWireClient.messaging;
    const result = await messageClient.send({
      from: from,
      to: to,
      body: body,
    });

    return { 
      success: true, 
      messageId: result.id || result.sid || 'success'
    };
  } catch (error) {
    console.error('Error sending SMS:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};

export const sendMMS = async (to: string, from: string, body?: string, media?: string[]) => {
  try {
    if (!signalWireClient) {
      signalWireClient = await initializeClient();
    }

    if (!signalWireClient) {
      console.warn('SignalWire client not initialized - MMS not sent');
      return { success: false, error: 'SignalWire credentials not configured' };
    }

    const messageClient = signalWireClient.messaging;
    const result = await messageClient.send({
      from: from,
      to: to,
      body: body,
      media: media,
    });

    return { 
      success: true, 
      messageId: result.id || result.sid || 'success'
    };
  } catch (error) {
    console.error('Error sending MMS:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};

// For compatibility with REST API for phone number management
export const getAvailablePhoneNumbers = async (areaCode?: string) => {
  if (!spaceUrl || !projectId || !token) {
    console.warn('SignalWire credentials not configured');
    return [];
  }

  try {
    const response = await fetch(
      `https://${spaceUrl}/api/laml/2010-04-01/Accounts/${projectId}/AvailablePhoneNumbers/US/Local.json?${
        areaCode ? `AreaCode=${areaCode}&` : ''
      }SmsEnabled=true&VoiceEnabled=true`,
      {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${projectId}:${token}`).toString('base64')}`,
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.available_phone_numbers.map((number: any) => ({
      phoneNumber: number.phone_number,
      friendlyName: number.friendly_name,
      locality: number.locality,
      region: number.region,
      capabilities: {
        sms: number.capabilities.SMS,
        voice: number.capabilities.voice,
      },
    }));
  } catch (error) {
    console.error('Error fetching available numbers:', error);
    throw error;
  }
};

export const purchasePhoneNumber = async (phoneNumber: string) => {
  if (!spaceUrl || !projectId || !token) {
    console.warn('SignalWire credentials not configured');
    return { success: false, error: 'SignalWire credentials not configured' };
  }

  try {
    const response = await fetch(
      `https://${spaceUrl}/api/laml/2010-04-01/Accounts/${projectId}/IncomingPhoneNumbers.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(`${projectId}:${token}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
        },
        body: new URLSearchParams({
          PhoneNumber: phoneNumber,
          SmsUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/signalwire/sms`,
          VoiceUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/signalwire/voice`,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      sid: data.sid,
      phoneNumber: data.phone_number,
      friendlyName: data.friendly_name,
    };
  } catch (error) {
    console.error('Error purchasing phone number:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};

// Listen for incoming messages (for real-time functionality)
export const listenForMessages = async (topics: string[], onMessageReceived: (message: any) => void) => {
  try {
    if (!signalWireClient) {
      signalWireClient = await initializeClient();
    }

    if (!signalWireClient) {
      console.warn('SignalWire client not initialized');
      return;
    }

    await signalWireClient.messaging.listen({
      topics: topics,
      async onMessageReceived(message: any) {
        onMessageReceived(message);
      }
    });
  } catch (error) {
    console.error('Error setting up message listener:', error);
  }
}; 