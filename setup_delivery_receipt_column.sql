-- Add delivery_receipt column to request_delivery table if it doesn't exist
-- This allows storing delivery receipt numbers for tracking purposes

-- Check if column exists and add it if it doesn't
SET @col_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'request_delivery'
    AND COLUMN_NAME = 'delivery_receipt'
);

SET @sql = IF(@col_exists = 0,
    'ALTER TABLE `request_delivery` ADD COLUMN `delivery_receipt` VARCHAR(255) NULL AFTER `driver_name`',
    'SELECT "Column delivery_receipt already exists" AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

