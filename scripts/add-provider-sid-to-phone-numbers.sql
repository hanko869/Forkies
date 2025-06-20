-- Add provider_sid column to phone_numbers table
ALTER TABLE phone_numbers 
ADD COLUMN IF NOT EXISTS provider_sid TEXT;

-- Add comment for clarity
COMMENT ON COLUMN phone_numbers.provider_sid IS 'The SID/ID from the provider (Twilio or SignalWire) for this phone number';

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_phone_numbers_provider_sid ON phone_numbers(provider_sid); 