-- SQL Script to Verify Delivery Tracking System Tables
-- Run this to ensure all required tables and columns exist
-- Date: October 25, 2025

-- =====================================================
-- 1. Verify deliver_to_customer table structure
-- =====================================================

SELECT 'Checking deliver_to_customer table...' as status;

-- Check if table exists
SELECT 
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ deliver_to_customer table exists'
        ELSE '❌ deliver_to_customer table MISSING'
    END as table_check
FROM information_schema.tables 
WHERE table_schema = 'agdatabase' 
AND table_name = 'deliver_to_customer';

-- Check required columns
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = 'agdatabase'
AND TABLE_NAME = 'deliver_to_customer'
ORDER BY ORDINAL_POSITION;

-- =====================================================
-- 2. Verify deliver_to_customer_details table structure
-- =====================================================

SELECT 'Checking deliver_to_customer_details table...' as status;

SELECT 
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ deliver_to_customer_details table exists'
        ELSE '❌ deliver_to_customer_details table MISSING'
    END as table_check
FROM information_schema.tables 
WHERE table_schema = 'agdatabase' 
AND table_name = 'deliver_to_customer_details';

-- Check required columns
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = 'agdatabase'
AND TABLE_NAME = 'deliver_to_customer_details'
ORDER BY ORDINAL_POSITION;

-- =====================================================
-- 3. Verify deliver_to_customer_tracking table structure
-- =====================================================

SELECT 'Checking deliver_to_customer_tracking table...' as status;

SELECT 
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ deliver_to_customer_tracking table exists'
        ELSE '❌ deliver_to_customer_tracking table MISSING'
    END as table_check
FROM information_schema.tables 
WHERE table_schema = 'agdatabase' 
AND table_name = 'deliver_to_customer_tracking';

-- Check required columns
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = 'agdatabase'
AND TABLE_NAME = 'deliver_to_customer_tracking'
ORDER BY ORDINAL_POSITION;

-- =====================================================
-- 4. Sample Data Check - Current Deliveries
-- =====================================================

SELECT 'Sample delivery data:' as status;

SELECT 
    dtc.dtc_id,
    dtc.invoice_id,
    dtc.status,
    dtc.driver_name,
    CONCAT(c.fname, ' ', c.lname) as customer_name,
    i.total_amount,
    COUNT(dtcd.dtcd_id) as total_items
FROM deliver_to_customer dtc
INNER JOIN invoice i ON dtc.invoice_id = i.invoice_id
LEFT JOIN customers c ON i.cust_id = c.cust_id
LEFT JOIN deliver_to_customer_details dtcd ON dtc.dtc_id = dtcd.dtc_id
GROUP BY dtc.dtc_id, dtc.invoice_id, dtc.status, dtc.driver_name, c.fname, c.lname, i.total_amount
ORDER BY dtc.dtc_id DESC
LIMIT 10;

-- =====================================================
-- 5. Check Installment Sales Integration
-- =====================================================

SELECT 'Deliveries with installment plans:' as status;

SELECT 
    dtc.dtc_id,
    dtc.invoice_id,
    dtc.status,
    ins.installment_id,
    ins.months,
    ins.total_amount,
    ins.downpayment,
    (ins.total_amount - ins.downpayment) as remaining_balance
FROM deliver_to_customer dtc
INNER JOIN invoice i ON dtc.invoice_id = i.invoice_id
INNER JOIN installment_sales ins ON i.invoice_id = ins.invoice_id
WHERE dtc.status != 'Delivered'
ORDER BY dtc.dtc_id DESC;

-- =====================================================
-- 6. Check Tracking Records
-- =====================================================

SELECT 'Recent tracking records:' as status;

SELECT 
    dtct.dtct_id,
    dtct.dtc_id,
    dtct.status,
    dtct.date,
    dtct.time,
    dtc.invoice_id
FROM deliver_to_customer_tracking dtct
INNER JOIN deliver_to_customer dtc ON dtct.dtc_id = dtc.dtc_id
ORDER BY dtct.date DESC, dtct.time DESC
LIMIT 10;

-- =====================================================
-- 7. Status Distribution
-- =====================================================

SELECT 'Delivery status distribution:' as status;

SELECT 
    status,
    COUNT(*) as count,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM deliver_to_customer), 2) as percentage
FROM deliver_to_customer
GROUP BY status
ORDER BY count DESC;

-- =====================================================
-- 8. Deliveries Without Customer Email (Potential Issues)
-- =====================================================

SELECT 'Deliveries without customer email (will fail notification):' as status;

SELECT 
    dtc.dtc_id,
    dtc.invoice_id,
    dtc.status,
    i.cust_id,
    c.fname,
    c.lname,
    c.email
FROM deliver_to_customer dtc
INNER JOIN invoice i ON dtc.invoice_id = i.invoice_id
LEFT JOIN customers c ON i.cust_id = c.cust_id
WHERE c.email IS NULL OR c.email = ''
ORDER BY dtc.dtc_id DESC;

-- =====================================================
-- 9. Installment Schedules That Need Activation
-- =====================================================

SELECT 'Installment schedules waiting for delivery completion:' as status;

SELECT 
    ins.installment_id,
    ins.invoice_id,
    ins.months,
    ins.total_amount,
    dtc.status,
    MIN(ips.due_date) as first_payment_date,
    i.transaction_date as purchase_date,
    CASE 
        WHEN dtc.status = 'Delivered' THEN 'Schedule should be activated'
        ELSE 'Waiting for delivery'
    END as schedule_status
FROM installment_sales ins
INNER JOIN invoice i ON ins.invoice_id = i.invoice_id
INNER JOIN deliver_to_customer dtc ON i.invoice_id = dtc.invoice_id
LEFT JOIN installment_payment_sched ips ON ins.installment_id = ips.installment_id
GROUP BY ins.installment_id, ins.invoice_id, ins.months, ins.total_amount, dtc.status, i.transaction_date
ORDER BY ins.installment_id DESC;

-- =====================================================
-- 10. Check Foreign Key Constraints
-- =====================================================

SELECT 'Foreign key constraints:' as status;

SELECT 
    CONSTRAINT_NAME,
    TABLE_NAME,
    COLUMN_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'agdatabase'
AND TABLE_NAME IN ('deliver_to_customer', 'deliver_to_customer_details', 'deliver_to_customer_tracking')
AND REFERENCED_TABLE_NAME IS NOT NULL;

-- =====================================================
-- DIAGNOSTIC SUMMARY
-- =====================================================

SELECT '========================================' as divider;
SELECT 'DIAGNOSTIC SUMMARY' as section;
SELECT '========================================' as divider;

SELECT 
    'Total Deliveries' as metric,
    COUNT(*) as value
FROM deliver_to_customer
UNION ALL
SELECT 
    'Pending (Production)' as metric,
    COUNT(*) as value
FROM deliver_to_customer
WHERE status = 'Pending'
UNION ALL
SELECT 
    'Ready for Delivery' as metric,
    COUNT(*) as value
FROM deliver_to_customer
WHERE status = 'Ready for Delivery'
UNION ALL
SELECT 
    'On Delivery' as metric,
    COUNT(*) as value
FROM deliver_to_customer
WHERE status = 'On Delivery'
UNION ALL
SELECT 
    'Delivered' as metric,
    COUNT(*) as value
FROM deliver_to_customer
WHERE status = 'Delivered'
UNION ALL
SELECT 
    'Deliveries with Installments' as metric,
    COUNT(DISTINCT dtc.dtc_id) as value
FROM deliver_to_customer dtc
INNER JOIN invoice i ON dtc.invoice_id = i.invoice_id
INNER JOIN installment_sales ins ON i.invoice_id = ins.invoice_id
UNION ALL
SELECT 
    'Deliveries Missing Customer Email' as metric,
    COUNT(*) as value
FROM deliver_to_customer dtc
INNER JOIN invoice i ON dtc.invoice_id = i.invoice_id
LEFT JOIN customers c ON i.cust_id = c.cust_id
WHERE c.email IS NULL OR c.email = '';

SELECT '========================================' as divider;
SELECT '✅ Verification Complete!' as status;
SELECT '========================================' as divider;

