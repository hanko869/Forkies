-- Add username column to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;

-- Create an index on username for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Update the email constraint to allow non-email formats
-- First, drop the existing constraint if it exists
ALTER TABLE users 
DROP CONSTRAINT IF EXISTS users_email_check;

-- Add a comment for clarity
COMMENT ON COLUMN users.username IS 'Unique username for login (can be simple text without email format)';

-- Make email nullable since we're using username for login
ALTER TABLE users 
ALTER COLUMN email DROP NOT NULL;

-- Update existing users to have username same as their email prefix
UPDATE users 
SET username = SPLIT_PART(email, '@', 1) 
WHERE username IS NULL AND email IS NOT NULL; 