import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendSMS } from '@/lib/twilio/client';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { phoneNumberId, recipientNumber, message } = await request.json();

    // Validate input
    if (!phoneNumberId || !recipientNumber || !message) {
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

    // Check user credits
    const { data: credits } = await supabase
      .from('user_credits')
      .select('sms_credits')
      .eq('user_id', user.id)
      .single();

    if (!credits || credits.sms_credits < 1) {
      return NextResponse.json({ error: 'Insufficient credits' }, { status: 403 });
    }

    // Find or create conversation
    let { data: conversation } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', user.id)
      .eq('phone_number_id', phoneNumberId)
      .eq('recipient_number', recipientNumber)
      .single();

    if (!conversation) {
      const { data: newConversation } = await supabase
        .from('conversations')
        .insert({
          user_id: user.id,
          phone_number_id: phoneNumberId,
          recipient_number: recipientNumber,
        })
        .select()
        .single();
      
      conversation = newConversation;
    }

    // Create message record
    const { data: messageRecord } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversation.id,
        content: message,
        direction: 'outbound',
        status: 'pending',
      })
      .select()
      .single();

    // Send SMS via Twilio
    const result = await sendSMS(recipientNumber, phoneNumber.number, message);

    if (result.success) {
      // Update message status
      await supabase
        .from('messages')
        .update({
          status: 'sent',
          twilio_sid: result.messageId,
        })
        .eq('id', messageRecord.id);

      // Update conversation last message time
      await supabase
        .from('conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', conversation.id);

      // Deduct credit
      await supabase
        .from('user_credits')
        .update({ sms_credits: credits.sms_credits - 1 })
        .eq('user_id', user.id);

      // Record usage
      await supabase
        .from('usage_records')
        .insert({
          user_id: user.id,
          type: 'sms',
          credits_used: 1,
          details: {
            phone_number_id: phoneNumberId,
            recipient: recipientNumber,
            message_id: messageRecord.id,
          },
        });

      return NextResponse.json({
        success: true,
        messageId: messageRecord.id,
        twilioSid: result.messageId,
      });
    } else {
      // Update message status to failed
      await supabase
        .from('messages')
        .update({
          status: 'failed',
          error_message: result.error,
        })
        .eq('id', messageRecord.id);

      return NextResponse.json({ error: result.error }, { status: 500 });
    }
  } catch (error) {
    console.error('Error sending SMS:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 