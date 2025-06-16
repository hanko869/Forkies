-- First, disable RLS temporarily to fix the policies
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies on users table
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Admins can update all users" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Admins can insert users" ON users;
DROP POLICY IF EXISTS "Admins can delete users" ON users;

-- Re-enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create simple, non-recursive policies
-- Everyone can read all users (for now, to fix the immediate issue)
CREATE POLICY "Enable read access for all users" ON users
  FOR SELECT
  USING (true);

-- Users can update their own profile
CREATE POLICY "Enable update for users based on user_id" ON users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Only service role can insert (for admin creating users via API)
CREATE POLICY "Enable insert for service role only" ON users
  FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- Only service role can delete
CREATE POLICY "Enable delete for service role only" ON users
  FOR DELETE
  USING (auth.role() = 'service_role'); 