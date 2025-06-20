-- Script to identify and optionally clean up dummy/test phone numbers

-- First, let's see all phone numbers in the system
SELECT 
    id,
    number,
    provider,
    provider_sid,
    user_id,
    is_active,
    created_at
FROM phone_numbers
ORDER BY created_at DESC;

-- Check for phone numbers without provider_sid (likely dummy entries)
SELECT 
    id,
    number,
    provider,
    user_id,
    created_at
FROM phone_numbers
WHERE provider_sid IS NULL;

-- To delete phone numbers without provider_sid (uncomment to execute):
-- DELETE FROM phone_numbers
-- WHERE provider_sid IS NULL;

-- To delete specific test numbers (uncomment and modify as needed):
-- DELETE FROM phone_numbers
-- WHERE number IN ('+1234567890', '+0987654321');

-- To unassign all phone numbers from users (uncomment to execute):
-- UPDATE phone_numbers
-- SET user_id = NULL
-- WHERE user_id IS NOT NULL; 