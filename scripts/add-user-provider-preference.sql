-- Add provider preference to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS preferred_provider TEXT DEFAULT 'twilio' 
CHECK (preferred_provider IN ('twilio', 'signalwire'));

-- Add comment for clarity
COMMENT ON COLUMN users.preferred_provider IS 'The SMS/Voice provider this user should use for outgoing messages';

-- Update existing users to have a default provider
UPDATE users 
SET preferred_provider = 'twilio' 
WHERE preferred_provider IS NULL; 