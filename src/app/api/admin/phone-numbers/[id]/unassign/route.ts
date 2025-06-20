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

    // Check if the phone number exists
    const { data: phoneNumber, error: phoneError } = await supabase
      .from('phone_numbers')
      .select('*')
      .eq('id', id)
      .single();

    if (phoneError || !phoneNumber) {
      return NextResponse.json({ error: 'Phone number not found' }, { status: 404 });
    }

    if (!phoneNumber.user_id) {
      return NextResponse.json({ error: 'Phone number is not assigned to any user' }, { status: 400 });
    }

    // Unassign the phone number
    const { error: updateError } = await supabase
      .from('phone_numbers')
      .update({ 
        user_id: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (updateError) {
      console.error('Error unassigning phone number:', updateError);
      return NextResponse.json({ error: 'Failed to unassign phone number' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Phone number unassigned successfully',
    });
  } catch (error) {
    console.error('Error in unassign phone number:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 