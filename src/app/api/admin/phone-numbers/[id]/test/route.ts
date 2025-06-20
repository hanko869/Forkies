import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth/utils';
import { sendSMS } from '@/lib/sms/provider';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const supabase = await createServiceRoleClient();
    const { id } = await params;
    
    const { testNumber } = await request.json();

    if (!testNumber) {
      return NextResponse.json({ error: 'Test number is required' }, { status: 400 });
    }

    // Get the phone number details
    const { data: phoneNumber, error } = await supabase
      .from('phone_numbers')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !phoneNumber) {
      return NextResponse.json({ error: 'Phone number not found' }, { status: 404 });
    }

    // Send test SMS
    const result = await sendSMS({
      to: testNumber,
      from: phoneNumber.number,
      body: `Test message from 2Way SMS Platform. Your ${phoneNumber.provider} phone number ${phoneNumber.number} is working correctly!`,
      provider: phoneNumber.provider,
    });

    if (result.success) {
      // Update the phone number status to active
      await supabase
        .from('phone_numbers')
        .update({ is_active: true })
        .eq('id', id);

      return NextResponse.json({
        success: true,
        message: 'Test SMS sent successfully',
        messageId: result.messageId,
      });
    } else {
      // Update the phone number status to inactive
      await supabase
        .from('phone_numbers')
        .update({ is_active: false })
        .eq('id', id);

      return NextResponse.json({
        success: false,
        error: result.error,
      }, { status: 400 });
    }
  } catch (error) {
    console.error('Error testing phone number:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 