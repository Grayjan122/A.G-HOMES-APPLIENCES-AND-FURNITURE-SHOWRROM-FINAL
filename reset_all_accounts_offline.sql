-- Reset all accounts to Offline status
-- This will allow anyone to log in again

UPDATE account 
SET active_status = 'Offline' 
WHERE active_status = 'Online';

-- Check the results
SELECT account_id, username, email, active_status 
FROM account;

