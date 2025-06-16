import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { User } from '@/types';

export async function getUser(): Promise<User | null> {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('Error getting user:', error);
      return null;
    }
    
    if (!user) {
      console.log('No authenticated user found');
      return null;
    }
    
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (profileError) {
      console.error('Error getting user profile:', profileError);
      return null;
    }
    
    return profile;
  } catch (error) {
    console.error('Unexpected error in getUser:', error);
    return null;
  }
}

export async function requireUser() {
  const user = await getUser();
  
  if (!user) {
    redirect('/login');
  }
  
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  
  if (user.role !== 'admin') {
    redirect('/dashboard');
  }
  
  return user;
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
} 