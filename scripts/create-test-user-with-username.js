const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTestUser() {
  try {
    // Create a test user with username
    const username = 'testuser';
    const fakeEmail = `${username}@local.app`;
    
    console.log('Creating test user with username:', username);

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: fakeEmail,
      password: 'test123',
      email_confirm: true,
      user_metadata: {
        name: 'Test User',
        username: username,
      },
    });

    if (authError) {
      console.error('Error creating auth user:', authError);
      return;
    }

    console.log('Auth user created:', authData.user.id);

    // Create user profile
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email: fakeEmail,
        username: username,
        name: 'Test User',
        role: 'user',
        preferred_provider: 'signalwire',
      });

    if (profileError) {
      console.error('Error creating user profile:', profileError);
      // Try to clean up auth user
      await supabase.auth.admin.deleteUser(authData.user.id);
      return;
    }

    console.log('User profile created');

    // Create initial credits
    const { error: creditsError } = await supabase
      .from('user_credits')
      .insert({
        user_id: authData.user.id,
        sms_credits: 100,
        voice_credits: 10,
      });

    if (creditsError) {
      console.error('Error creating credits:', creditsError);
    } else {
      console.log('Credits created');
    }

    console.log('\nTest user created successfully!');
    console.log('Username:', username);
    console.log('Password: test123');
    console.log('Provider: SignalWire');
    console.log('SMS Credits: 100');
    console.log('Voice Credits: 10');
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

createTestUser(); 