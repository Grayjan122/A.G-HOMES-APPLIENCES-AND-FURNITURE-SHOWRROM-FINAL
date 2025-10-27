-- ============================================
-- ⚡ RUN THIS FIRST - Password History Setup
-- ============================================
-- Copy existing passwords to password_history table
-- This is a ONE-TIME operation

-- Step 1: Populate password history with existing passwords
INSERT INTO `password_history` (`account_id`, `password_hash`, `created_at`)
SELECT 
    `account_id`, 
    `user_password`, 
    NOW()
FROM `account`
WHERE `user_password` IS NOT NULL
  AND `account_id` NOT IN (
    SELECT DISTINCT account_id FROM password_history
  );

-- Step 2: Verify it worked
SELECT 
    '✅ Migration Complete!' as status,
    COUNT(*) as total_passwords_in_history,
    COUNT(DISTINCT account_id) as users_with_history
FROM password_history;

-- Step 3: View sample of what was added
SELECT 
    h.history_id,
    a.account_id,
    a.username,
    a.email,
    h.created_at as password_added_to_history
FROM password_history h
JOIN account a ON h.account_id = a.account_id
ORDER BY h.created_at DESC
LIMIT 10;

-- ✅ DONE! Now test your forgot password feature!

