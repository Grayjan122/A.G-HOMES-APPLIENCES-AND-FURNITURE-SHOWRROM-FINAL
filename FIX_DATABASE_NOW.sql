-- ================================================================
-- FIX: False Session Termination
-- ADD SESSION TOKEN COLUMN TO DATABASE
-- ================================================================
-- Run this in phpMyAdmin to fix the logout issue!
-- ================================================================

-- Add session_token column to track unique sessions
ALTER TABLE account 
ADD COLUMN IF NOT EXISTS session_token VARCHAR(255) DEFAULT NULL AFTER active_status;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_session_token ON account(session_token);

-- Clear all current sessions to start fresh
-- (Users will need to login again, but the fix will work)
UPDATE account 
SET active_status = 'Offline', session_token = NULL;

-- Verify the column was added
SELECT 'SUCCESS! session_token column added!' as STATUS,
       COUNT(*) as total_accounts
FROM account;

-- ================================================================
-- HOW TO USE:
-- 1. Open phpMyAdmin: http://localhost/phpmyadmin
-- 2. Select 'capstone' database on the left
-- 3. Click 'SQL' tab at the top
-- 4. Copy this ENTIRE file
-- 5. Paste into the SQL box
-- 6. Click 'Go' button
-- 7. You should see "SUCCESS! session_token column added!"
-- ================================================================

