import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth/utils';

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const supabase = await createServiceRoleClient();
    
    const { provider, phoneNumber, providerSid } = await request.json();

    // Validate input
    if (!provider || !phoneNumber || !providerSid) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if phone number already exists
    const { data: existingPhone } = await supabase
      .from('phone_numbers')
      .select('id')
      .eq('number', phoneNumber)
      .single();

    if (existingPhone) {
      return NextResponse.json({ error: 'Phone number already exists' }, { status: 400 });
    }

    // Insert the phone number
    const { data: newPhone, error } = await supabase
      .from('phone_numbers')
      .insert({
        number: phoneNumber,
        provider: provider,
        provider_sid: providerSid,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding phone number:', error);
      return NextResponse.json({ error: 'Failed to add phone number' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      phoneNumber: newPhone,
    });
  } catch (error) {
    console.error('Error in phone numbers API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const supabase = await createServiceRoleClient();

    const { data: phoneNumbers, error } = await supabase
      .from('phone_numbers')
      .select(`
        *,
        users(id, name, username, email)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching phone numbers:', error);
      return NextResponse.json({ error: 'Failed to fetch phone numbers' }, { status: 500 });
    }

    return NextResponse.json(phoneNumbers);
  } catch (error) {
    console.error('Error in phone numbers API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 