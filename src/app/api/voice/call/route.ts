import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { makeCall } from '@/lib/twilio/client';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { phoneNumberId, recipientNumber } = await request.json();

    // Validate input
    if (!phoneNumberId || !recipientNumber) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if user owns the phone number
    const { data: phoneNumber } = await supabase
      .from('phone_numbers')
      .select('*')
      .eq('id', phoneNumberId)
      .eq('user_id', user.id)
      .single();

    if (!phoneNumber) {
      return NextResponse.json({ error: 'Phone number not found' }, { status: 404 });
    }

    // Check user voice credits
    const { data: credits } = await supabase
      .from('user_credits')
      .select('voice_credits')
      .eq('user_id', user.id)
      .single();

    if (!credits || credits.voice_credits < 1) {
      return NextResponse.json({ error: 'Insufficient voice credits' }, { status: 403 });
    }

    // Create call record
    const { data: callRecord } = await supabase
      .from('calls')
      .insert({
        user_id: user.id,
        phone_number_id: phoneNumberId,
        recipient_number: recipientNumber,
        direction: 'outbound',
        status: 'initiated',
      })
      .select()
      .single();

    // Initiate call via Twilio
    const twimlUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/voice/twiml?callId=${callRecord.id}`;
    const result = await makeCall(recipientNumber, phoneNumber.number, twimlUrl);

    if (result.success) {
      // Update call record with provider SID
      await supabase
        .from('calls')
        .update({
          provider_sid: result.callId,
          status: 'ringing',
        })
        .eq('id', callRecord.id);

      return NextResponse.json({
        success: true,
        callId: callRecord.id,
        providerSid: result.callId,
      });
    } else {
      // Update call status to failed
      await supabase
        .from('calls')
        .update({
          status: 'failed',
          error_message: result.error,
        })
        .eq('id', callRecord.id);

      return NextResponse.json({ error: result.error }, { status: 500 });
    }
  } catch (error) {
    console.error('Error initiating call:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 