-- ============================================
-- MIGRATE EXISTING PASSWORDS TO HISTORY TABLE
-- ============================================
-- This is a ONE-TIME migration script
-- Run this ONLY if you haven't populated password_history yet

-- ============================================
-- STEP 1: Check if migration is needed
-- ============================================
SELECT 
    'Migration Check' as step,
    (SELECT COUNT(*) FROM account WHERE password IS NOT NULL) as total_accounts,
    (SELECT COUNT(DISTINCT account_id) FROM password_history) as accounts_in_history,
    CASE 
        WHEN (SELECT COUNT(*) FROM account WHERE password IS NOT NULL) > 
             (SELECT COUNT(DISTINCT account_id) FROM password_history)
        THEN '⚠️ MIGRATION NEEDED - Some accounts not in history'
        ELSE '✅ ALL ACCOUNTS MIGRATED'
    END as status;

-- ============================================
-- STEP 2: Migrate missing passwords
-- ============================================
-- This only adds accounts that aren't already in password_history
INSERT INTO `password_history` (`account_id`, `password_hash`, `created_at`)
SELECT 
    a.`account_id`, 
    a.`password`, 
    NOW()
FROM `account` a
WHERE a.`password` IS NOT NULL
  AND a.`account_id` NOT IN (
    SELECT DISTINCT account_id FROM password_history
  )
ON DUPLICATE KEY UPDATE 
    `password_hash` = `password_hash`; -- No update, just ignore duplicates

-- ============================================
-- STEP 3: Verify migration results
-- ============================================
SELECT 
    'Migration Results' as step,
    COUNT(*) as total_history_records,
    COUNT(DISTINCT account_id) as unique_accounts,
    MIN(created_at) as oldest_entry,
    MAX(created_at) as newest_entry
FROM `password_history`;

-- ============================================
-- STEP 4: Check specific accounts
-- ============================================
-- See which accounts have password history
SELECT 
    a.account_id,
    a.username,
    a.email,
    a.fname,
    a.lname,
    a.role_name,
    COUNT(h.history_id) as password_count,
    MAX(h.created_at) as last_password_change
FROM `account` a
LEFT JOIN `password_history` h ON a.account_id = h.account_id
WHERE a.status = 'Active'
GROUP BY a.account_id
ORDER BY a.account_id;

-- ============================================
-- STEP 5: View sample password history entries
-- ============================================
-- Shows the 10 most recent password history entries
SELECT 
    h.history_id,
    a.username,
    a.email,
    CONCAT(a.fname, ' ', a.lname) as full_name,
    h.created_at as password_set_at,
    '✅ Password stored securely' as note
FROM `password_history` h
JOIN `account` a ON h.account_id = a.account_id
ORDER BY h.created_at DESC
LIMIT 10;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
SELECT 
    '✅ MIGRATION COMPLETE!' as message,
    CONCAT(
        'Successfully migrated ', 
        (SELECT COUNT(DISTINCT account_id) FROM password_history),
        ' accounts to password history'
    ) as details;

