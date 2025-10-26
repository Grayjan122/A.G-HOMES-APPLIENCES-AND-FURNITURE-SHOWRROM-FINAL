-- =====================================================
-- Cleanup Invalid Payment Schedules
-- Purpose: Remove payment schedules that were incorrectly 
--          created for delivery items before the fix
-- Date: October 25, 2025
-- =====================================================

-- IMPORTANT: Backup your database before running this!

-- =====================================================
-- Step 1: Identify problematic schedules
-- =====================================================

SELECT 'PROBLEMATIC SCHEDULES FOUND:' as status;

-- Find schedules with ₱0 amounts
SELECT 
    'Zero Amount Schedules' as issue_type,
    COUNT(*) as count
FROM installment_payment_sched
WHERE amount_due = 0 OR amount_due IS NULL;

-- Find schedules for delivery items that haven't been delivered yet
SELECT 
    'Delivery Not Complete (Pending/Ready/On Delivery)' as issue_type,
    COUNT(DISTINCT ips.schedule_id) as count
FROM installment_payment_sched ips
INNER JOIN installment_sales ins ON ips.installment_id = ins.installment_id
INNER JOIN invoice i ON ins.invoice_id = i.invoice_id
INNER JOIN deliver_to_customer dtc ON i.invoice_id = dtc.invoice_id
WHERE dtc.status IN ('Pending', 'Ready for Delivery', 'On Delivery');

-- =====================================================
-- Step 2: Review specific cases (DO NOT DELETE YET)
-- =====================================================

SELECT '========================================' as divider;
SELECT 'REVIEWING SPECIFIC CASES' as status;
SELECT '========================================' as divider;

-- Show schedules with zero amounts
SELECT 
    ips.schedule_id,
    ips.installment_id,
    ins.invoice_id,
    ips.payment_number,
    ips.due_date,
    ips.amount_due as problematic_amount,
    ins.monthly_payment as should_be_amount,
    COALESCE(dtc.status, 'No Delivery') as delivery_status
FROM installment_payment_sched ips
INNER JOIN installment_sales ins ON ips.installment_id = ins.installment_id
LEFT JOIN invoice i ON ins.invoice_id = i.invoice_id
LEFT JOIN deliver_to_customer dtc ON i.invoice_id = dtc.invoice_id
WHERE ips.amount_due = 0 OR ips.amount_due IS NULL
ORDER BY ips.installment_id, ips.payment_number;

-- Show schedules for undelivered items
SELECT 
    ips.schedule_id,
    ips.installment_id,
    ins.invoice_id,
    ips.payment_number,
    ips.due_date,
    ips.amount_due,
    dtc.status as delivery_status,
    'Should NOT exist yet' as note
FROM installment_payment_sched ips
INNER JOIN installment_sales ins ON ips.installment_id = ins.installment_id
INNER JOIN invoice i ON ins.invoice_id = i.invoice_id
INNER JOIN deliver_to_customer dtc ON i.invoice_id = dtc.invoice_id
WHERE dtc.status IN ('Pending', 'Ready for Delivery', 'On Delivery')
ORDER BY ips.installment_id, ips.payment_number;

-- =====================================================
-- Step 3: BACKUP before deleting
-- =====================================================

SELECT '========================================' as divider;
SELECT 'CREATING BACKUP TABLE' as status;
SELECT '========================================' as divider;

-- Create backup table
CREATE TABLE IF NOT EXISTS installment_payment_sched_backup_20251025 AS
SELECT * FROM installment_payment_sched
WHERE schedule_id IN (
    SELECT ips.schedule_id
    FROM installment_payment_sched ips
    INNER JOIN installment_sales ins ON ips.installment_id = ins.installment_id
    LEFT JOIN invoice i ON ins.invoice_id = i.invoice_id
    LEFT JOIN deliver_to_customer dtc ON i.invoice_id = dtc.invoice_id
    WHERE (ips.amount_due = 0 OR ips.amount_due IS NULL)
       OR (dtc.status IN ('Pending', 'Ready for Delivery', 'On Delivery'))
);

SELECT CONCAT('Backed up ', COUNT(*), ' schedule entries') as backup_status
FROM installment_payment_sched_backup_20251025;

-- =====================================================
-- Step 4: DELETE invalid schedules
-- =====================================================

SELECT '========================================' as divider;
SELECT 'DELETING INVALID SCHEDULES' as status;
SELECT '========================================' as divider;

-- Delete schedules with zero or NULL amounts
DELETE FROM installment_payment_sched
WHERE amount_due = 0 OR amount_due IS NULL;

SELECT CONCAT('Deleted ', ROW_COUNT(), ' schedules with zero amounts') as delete_result_1;

-- Delete schedules for undelivered items
DELETE ips FROM installment_payment_sched ips
INNER JOIN installment_sales ins ON ips.installment_id = ins.installment_id
INNER JOIN invoice i ON ins.invoice_id = i.invoice_id
INNER JOIN deliver_to_customer dtc ON i.invoice_id = dtc.invoice_id
WHERE dtc.status IN ('Pending', 'Ready for Delivery', 'On Delivery');

SELECT CONCAT('Deleted ', ROW_COUNT(), ' schedules for undelivered items') as delete_result_2;

-- =====================================================
-- Step 5: Verify cleanup
-- =====================================================

SELECT '========================================' as divider;
SELECT 'VERIFICATION' as status;
SELECT '========================================' as divider;

-- Check remaining problematic schedules (should be 0)
SELECT 
    'Remaining Zero Amount Schedules' as check_type,
    COUNT(*) as count,
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ Clean'
        ELSE '❌ Still have issues'
    END as status
FROM installment_payment_sched
WHERE amount_due = 0 OR amount_due IS NULL

UNION ALL

SELECT 
    'Remaining Undelivered Item Schedules' as check_type,
    COUNT(*) as count,
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ Clean'
        ELSE '❌ Still have issues'
    END as status
FROM installment_payment_sched ips
INNER JOIN installment_sales ins ON ips.installment_id = ins.installment_id
INNER JOIN invoice i ON ins.invoice_id = i.invoice_id
INNER JOIN deliver_to_customer dtc ON i.invoice_id = dtc.invoice_id
WHERE dtc.status IN ('Pending', 'Ready for Delivery', 'On Delivery');

-- =====================================================
-- Step 6: Summary
-- =====================================================

SELECT '========================================' as divider;
SELECT 'CLEANUP COMPLETE' as status;
SELECT '========================================' as divider;

SELECT 
    'Total Schedules Remaining' as metric,
    COUNT(*) as value
FROM installment_payment_sched

UNION ALL

SELECT 
    'Schedules for Delivered Items' as metric,
    COUNT(DISTINCT ips.schedule_id) as value
FROM installment_payment_sched ips
INNER JOIN installment_sales ins ON ips.installment_id = ins.installment_id
INNER JOIN invoice i ON ins.invoice_id = i.invoice_id
INNER JOIN deliver_to_customer dtc ON i.invoice_id = dtc.invoice_id
WHERE dtc.status = 'Delivered'

UNION ALL

SELECT 
    'Schedules for Non-Delivery Items' as metric,
    COUNT(DISTINCT ips.schedule_id) as value
FROM installment_payment_sched ips
INNER JOIN installment_sales ins ON ips.installment_id = ins.installment_id
INNER JOIN invoice i ON ins.invoice_id = i.invoice_id
LEFT JOIN deliver_to_customer dtc ON i.invoice_id = dtc.invoice_id
WHERE dtc.dtc_id IS NULL;

-- =====================================================
-- OPTIONAL: If you need to restore the backup
-- =====================================================

/*
-- To restore deleted schedules if needed:
INSERT INTO installment_payment_sched
SELECT * FROM installment_payment_sched_backup_20251025;

-- To drop the backup table after confirming everything works:
DROP TABLE installment_payment_sched_backup_20251025;
*/

SELECT '✅ Cleanup script completed successfully!' as final_status;

