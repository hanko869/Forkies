import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    // SignalWire sends data as form-encoded
    const formData = await request.formData();
    
    // Extract SMS data from SignalWire webhook
    const from = formData.get('From') as string;
    const to = formData.get('To') as string;
    const messageBody = formData.get('Body') as string;
    const messageSid = formData.get('MessageSid') as string;
    
    // SignalWire-specific fields
    const accountSid = formData.get('AccountSid') as string;
    const messagingServiceSid = formData.get('MessagingServiceSid') as string;
    
    const supabase = await createServiceRoleClient();
    
    // Find the phone number
    const { data: phoneNumber } = await supabase
      .from('phone_numbers')
      .select('*')
      .eq('number', to)
      .single();
    
    if (!phoneNumber || !phoneNumber.user_id) {
      console.error('Phone number not found or not assigned:', to);
      // Return empty XML response for SignalWire
      return new NextResponse('<?xml version="1.0" encoding="UTF-8"?><Response></Response>', {
        headers: { 'Content-Type': 'text/xml' },
      });
    }
    
    // Find or create conversation
    let { data: conversation } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', phoneNumber.user_id)
      .eq('phone_number_id', phoneNumber.id)
      .eq('recipient_number', from)
      .single();
    
    if (!conversation) {
      const { data: newConversation } = await supabase
        .from('conversations')
        .insert({
          user_id: phoneNumber.user_id,
          phone_number_id: phoneNumber.id,
          recipient_number: from,
        })
        .select()
        .single();
      
      conversation = newConversation;
    }
    
    // Create message record
    await supabase
      .from('messages')
      .insert({
        conversation_id: conversation.id,
        content: messageBody,
        direction: 'inbound',
        status: 'delivered',
        provider_sid: messageSid,
      });
    
    // Update conversation
    await supabase
      .from('conversations')
      .update({
        last_message_at: new Date().toISOString(),
        unread_count: conversation.unread_count + 1,
      })
      .eq('id', conversation.id);
    
    // Return empty XML response (SignalWire uses the same format as Twilio)
    return new NextResponse('<?xml version="1.0" encoding="UTF-8"?><Response></Response>', {
      headers: { 'Content-Type': 'text/xml' },
    });
  } catch (error) {
    console.error('Error processing incoming SMS from SignalWire:', error);
    return new NextResponse('<?xml version="1.0" encoding="UTF-8"?><Response></Response>', {
      headers: { 'Content-Type': 'text/xml' },
    });
  }
}

// SignalWire also supports GET requests for webhook verification
export async function GET(request: NextRequest) {
  // Return 200 OK for webhook verification
  return new NextResponse('OK', { status: 200 });
} 