import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';
import twilio from 'twilio';

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const callId = searchParams.get('callId');
    
    if (!callId) {
      return new NextResponse('Missing callId', { status: 400 });
    }

    const supabase = await createServiceRoleClient();
    
    // Get call details
    const { data: call } = await supabase
      .from('calls')
      .select('*')
      .eq('id', callId)
      .single();

    if (!call) {
      return new NextResponse('Call not found', { status: 404 });
    }

    // Create TwiML response
    const twiml = new twilio.twiml.VoiceResponse();
    
    // Simple voice call - just dial and connect
    twiml.say({
      voice: 'alice',
      language: 'en-US'
    }, 'Connecting your call. Please wait.');
    
    // Record the call
    twiml.record({
      maxLength: 3600, // 1 hour max
      recordingStatusCallback: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/twilio/recording?callId=${callId}`,
    });
    
    // Dial the recipient
    const dial = twiml.dial({
      callerId: call.phone_number_id,
      timeout: 30,
    });
    
    dial.number(call.recipient_number);

    return new NextResponse(twiml.toString(), {
      headers: {
        'Content-Type': 'text/xml',
      },
    });
  } catch (error) {
    console.error('Error generating TwiML:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  return POST(request);
} 