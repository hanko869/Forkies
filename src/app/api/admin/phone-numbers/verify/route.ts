import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/utils';

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    
    const { provider, phoneNumber, providerSid } = await request.json();

    // Validate input
    if (!provider || !phoneNumber || !providerSid) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    let verified = false;
    let phoneNumberDetails = null;

    if (provider === 'twilio') {
      // Verify with Twilio
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;

      if (!accountSid || !authToken) {
        return NextResponse.json({ 
          error: 'Twilio credentials not configured',
          verified: false 
        }, { status: 200 });
      }

      try {
        // Fetch phone number details from Twilio
        const response = await fetch(
          `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/IncomingPhoneNumbers/${providerSid}.json`,
          {
            headers: {
              'Authorization': `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          // Verify the phone number matches
          if (data.phone_number === phoneNumber) {
            verified = true;
            phoneNumberDetails = {
              friendlyName: data.friendly_name,
              capabilities: {
                sms: data.capabilities.sms,
                voice: data.capabilities.voice,
              },
            };
          }
        }
      } catch (error) {
        console.error('Error verifying with Twilio:', error);
      }
    } else if (provider === 'signalwire') {
      // Verify with SignalWire
      const projectId = process.env.SIGNALWIRE_PROJECT_ID;
      const token = process.env.SIGNALWIRE_TOKEN;
      const spaceUrl = process.env.SIGNALWIRE_SPACE_URL;

      if (!projectId || !token || !spaceUrl) {
        return NextResponse.json({ 
          error: 'SignalWire credentials not configured',
          verified: false 
        }, { status: 200 });
      }

      try {
        // Fetch phone number details from SignalWire
        const response = await fetch(
          `https://${spaceUrl}/api/relay/rest/phone_numbers/${providerSid}`,
          {
            headers: {
              'Authorization': `Basic ${Buffer.from(`${projectId}:${token}`).toString('base64')}`,
              'Accept': 'application/json',
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          // Verify the phone number matches
          if (data.number === phoneNumber || data.e164 === phoneNumber) {
            verified = true;
            phoneNumberDetails = {
              friendlyName: data.name || phoneNumber,
              capabilities: {
                sms: data.capabilities?.includes('sms') || false,
                voice: data.capabilities?.includes('voice') || false,
              },
            };
          }
        }
      } catch (error) {
        console.error('Error verifying with SignalWire:', error);
      }
    }

    return NextResponse.json({
      verified,
      phoneNumber,
      provider,
      details: phoneNumberDetails,
    });
  } catch (error) {
    console.error('Error in verification:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 