import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addTestData() {
  try {
    console.log('Adding test data...');

    // Get the admin user
    const { data: adminUser } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'lirong@admin.com')
      .single();

    if (!adminUser) {
      console.error('Admin user not found');
      return;
    }

    console.log('Found admin user:', adminUser.id);

    // Add some test phone numbers
    const phoneNumbers = [
      { number: '+12025551234', user_id: null, is_active: true },
      { number: '+12025555678', user_id: null, is_active: true },
      { number: '+12025559012', user_id: null, is_active: true },
    ];

    const { data: insertedNumbers, error: phoneError } = await supabase
      .from('phone_numbers')
      .insert(phoneNumbers)
      .select();

    if (phoneError) {
      console.error('Error adding phone numbers:', phoneError);
    } else {
      console.log('Added phone numbers:', insertedNumbers?.length);
    }

    // Create a test user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'testuser@example.com',
      password: 'TestPassword123!',
      email_confirm: true,
    });

    if (authError) {
      console.error('Error creating test user auth:', authError);
      return;
    }

    // Add test user to users table
    const { data: testUser, error: userError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email: 'testuser@example.com',
        name: 'Test User',
        role: 'user',
      })
      .select()
      .single();

    if (userError) {
      console.error('Error creating test user:', userError);
      return;
    }

    console.log('Created test user:', testUser.email);

    // Assign a phone number to the test user
    if (insertedNumbers && insertedNumbers.length > 0) {
      await supabase
        .from('phone_numbers')
        .update({ user_id: testUser.id })
        .eq('id', insertedNumbers[0].id);

      console.log('Assigned phone number to test user');
    }

    // Add credits for the test user
    const { error: creditsError } = await supabase
      .from('user_credits')
      .insert({
        user_id: testUser.id,
        sms_credits: 100,
        voice_credits: 50,
      });

    if (creditsError) {
      console.error('Error adding credits:', creditsError);
    } else {
      console.log('Added credits for test user');
    }

    // Add credits for admin user
    const { error: adminCreditsError } = await supabase
      .from('user_credits')
      .insert({
        user_id: adminUser.id,
        sms_credits: 1000,
        voice_credits: 500,
      });

    if (adminCreditsError) {
      console.error('Error adding admin credits:', adminCreditsError);
    } else {
      console.log('Added credits for admin user');
    }

    console.log('\nTest data added successfully!');
    console.log('\nTest credentials:');
    console.log('Admin: lirong@admin.com / Qq221122?@');
    console.log('User: testuser@example.com / TestPassword123!');
  } catch (error) {
    console.error('Error:', error);
  }
}

addTestData(); 