// Script to create the first admin user
// Run this after setting up your database schema

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey || supabaseServiceKey === 'your_supabase_service_role_key_here') {
  console.error('❌ Please update your .env.local with the Supabase service role key');
  console.log('You can find it in your Supabase dashboard under Settings > API > service_role key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createAdminUser() {
  try {
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'lirong@admin.com',
      password: 'Qq221122?@',
      email_confirm: true,
    });

    if (authError) {
      console.error('❌ Error creating auth user:', authError.message);
      return;
    }

    console.log('✅ Auth user created:', authData.user.email);

    // Create user profile
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email: authData.user.email,
        name: 'Li Rong',
        role: 'admin',
      });

    if (profileError) {
      console.error('❌ Error creating user profile:', profileError.message);
      // Clean up auth user
      await supabase.auth.admin.deleteUser(authData.user.id);
      return;
    }

    console.log('✅ User profile created');

    // Create initial credits
    const { error: creditsError } = await supabase
      .from('user_credits')
      .insert({
        user_id: authData.user.id,
        sms_credits: 1000,
        voice_credits: 100,
      });

    if (creditsError) {
      console.error('⚠️  Warning: Could not create initial credits:', creditsError.message);
    } else {
      console.log('✅ Initial credits allocated');
    }

    console.log('\n🎉 Admin user created successfully!');
    console.log('📧 Email: lirong@admin.com');
    console.log('🔑 Password: Qq221122?@');
    console.log('\nYou can now login at http://localhost:3000/login');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

createAdminUser(); 