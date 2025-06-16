import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';
import twilio from 'twilio';

// Twilio webhook validation
const validateTwilioRequest = (request: NextRequest, params: Record<string, any>): boolean => {
  const twilioSignature = request.headers.get('X-Twilio-Signature');
  const url = request.url;
  const authToken = process.env.TWILIO_AUTH_TOKEN!;
  
  if (!twilioSignature) return false;
  
  return twilio.validateRequest(
    authToken,
    twilioSignature,
    url,
    params
  );
};

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const params: Record<string, string> = {};
    
    // Convert FormData to object for Twilio validation
    formData.forEach((value, key) => {
      params[key] = value.toString();
    });
    
    // Validate Twilio request (optional in development)
    // if (process.env.NODE_ENV === 'production' && !validateTwilioRequest(request, params)) {
    //   return NextResponse.json({ error: 'Invalid request' }, { status: 403 });
    // }
    
    // Extract SMS data
    const from = formData.get('From') as string;
    const to = formData.get('To') as string;
    const messageBody = formData.get('Body') as string;
    const messageSid = formData.get('MessageSid') as string;
    
    const supabase = await createServiceRoleClient();
    
    // Find the phone number
    const { data: phoneNumber } = await supabase
      .from('phone_numbers')
      .select('*')
      .eq('number', to)
      .single();
    
    if (!phoneNumber || !phoneNumber.user_id) {
      console.error('Phone number not found or not assigned:', to);
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
        twilio_sid: messageSid,
      });
    
    // Update conversation
    await supabase
      .from('conversations')
      .update({
        last_message_at: new Date().toISOString(),
        unread_count: conversation.unread_count + 1,
      })
      .eq('id', conversation.id);
    
    // Return empty TwiML response
    return new NextResponse('<?xml version="1.0" encoding="UTF-8"?><Response></Response>', {
      headers: { 'Content-Type': 'text/xml' },
    });
  } catch (error) {
    console.error('Error processing incoming SMS:', error);
    return new NextResponse('<?xml version="1.0" encoding="UTF-8"?><Response></Response>', {
      headers: { 'Content-Type': 'text/xml' },
    });
  }
} 