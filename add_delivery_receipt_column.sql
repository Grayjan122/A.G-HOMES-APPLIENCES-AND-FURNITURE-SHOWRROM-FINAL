-- ============================================
-- Add Delivery Receipt Column to Database
-- ============================================

-- Step 1: Check if the column already exists (run this first to verify)
SELECT COLUMN_NAME 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'deliver_to_customer' 
  AND COLUMN_NAME = 'delivery_receipt';

-- If the above query returns empty, proceed with Step 2
-- If it returns a row, the column already exists

-- ============================================
-- Step 2: Add the delivery_receipt column
-- ============================================

ALTER TABLE `deliver_to_customer`
ADD COLUMN `delivery_receipt` VARCHAR(255) NULL 
AFTER `driver_name`;

-- ============================================
-- Step 3: Verify the column was added successfully
-- ============================================

DESCRIBE `deliver_to_customer`;

-- You should see the delivery_receipt column in the output

-- ============================================
-- Optional: View sample data to test
-- ============================================

SELECT 
    dtc_id,
    invoice_id,
    driver_name,
    delivery_receipt,
    status
FROM `deliver_to_customer`
LIMIT 10;

-- ============================================
-- NOTES:
-- ============================================
-- 1. This column stores the delivery receipt number entered by staff
-- 2. VARCHAR(255) allows for flexible receipt number formats
-- 3. NULL is allowed since existing records won't have this data
-- 4. The column is positioned after driver_name for logical grouping
-- 5. After adding this column, the backend PHP code must be updated
--    to save the delivery_receipt value (see DELIVERY_RECEIPT_BACKEND_SETUP.md)

