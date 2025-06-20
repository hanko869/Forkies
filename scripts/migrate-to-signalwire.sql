-- Migration script to update from Twilio to SignalWire

-- Update phone_numbers table provider column
ALTER TABLE phone_numbers 
ALTER COLUMN provider TYPE text;

-- Update the check constraint to allow 'signalwire'
ALTER TABLE phone_numbers 
DROP CONSTRAINT IF EXISTS phone_numbers_provider_check;

ALTER TABLE phone_numbers 
ADD CONSTRAINT phone_numbers_provider_check 
CHECK (provider IN ('twilio', 'signalwire'));

-- Rename twilio_sid columns to provider_sid
ALTER TABLE messages 
RENAME COLUMN twilio_sid TO provider_sid;

ALTER TABLE calls 
RENAME COLUMN twilio_sid TO provider_sid;

-- Update any existing Twilio phone numbers to SignalWire (optional)
-- Uncomment the following line if you want to migrate all existing numbers
-- UPDATE phone_numbers SET provider = 'signalwire' WHERE provider = 'twilio';

-- Add indexes for the renamed columns
CREATE INDEX IF NOT EXISTS idx_messages_provider_sid ON messages(provider_sid);
CREATE INDEX IF NOT EXISTS idx_calls_provider_sid ON calls(provider_sid); 