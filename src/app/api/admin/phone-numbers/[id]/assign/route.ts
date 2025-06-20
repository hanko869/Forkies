import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth/utils';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const supabase = await createServiceRoleClient();
    const { id } = await params;
    
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Check if the phone number exists and is not already assigned
    const { data: phoneNumber, error: phoneError } = await supabase
      .from('phone_numbers')
      .select('*')
      .eq('id', id)
      .single();

    if (phoneError || !phoneNumber) {
      return NextResponse.json({ error: 'Phone number not found' }, { status: 404 });
    }

    if (phoneNumber.user_id) {
      return NextResponse.json({ error: 'Phone number is already assigned' }, { status: 400 });
    }

    // Check if the user exists
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, preferred_provider')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Optionally check if the phone number provider matches user's preferred provider
    if (user.preferred_provider && phoneNumber.provider !== user.preferred_provider) {
      console.warn(`Assigning ${phoneNumber.provider} number to user preferring ${user.preferred_provider}`);
    }

    // Assign the phone number to the user
    const { error: updateError } = await supabase
      .from('phone_numbers')
      .update({ 
        user_id: userId,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (updateError) {
      console.error('Error assigning phone number:', updateError);
      return NextResponse.json({ error: 'Failed to assign phone number' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Phone number assigned successfully',
    });
  } catch (error) {
    console.error('Error in assign phone number:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 