import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceRoleClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth/utils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const supabase = await createServiceRoleClient();
    const { id } = await params;

    const { data: user, error } = await supabase
      .from('users')
      .select(`
        *,
        user_credits(sms_credits, voice_credits),
        phone_numbers(id, number, provider)
      `)
      .eq('id', id)
      .single();

    if (error || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const supabase = await createServiceRoleClient();
    const { id } = await params;
    
    const body = await request.json();
    const { preferred_provider } = body;

    // Validate provider
    if (preferred_provider && !['twilio', 'signalwire'].includes(preferred_provider)) {
      return NextResponse.json({ error: 'Invalid provider' }, { status: 400 });
    }

    // Update user
    const { data: user, error } = await supabase
      .from('users')
      .update({
        preferred_provider,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating user:', error);
      return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 