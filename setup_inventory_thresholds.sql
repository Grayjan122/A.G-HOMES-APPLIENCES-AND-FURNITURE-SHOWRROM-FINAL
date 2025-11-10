-- Add min_threshold and max_threshold columns to store_inventory table
-- Run this SQL script in your database (phpMyAdmin or MySQL command line)

-- Add min_threshold column with default value of 1
ALTER TABLE `store_inventory` 
ADD COLUMN `min_threshold` INT(11) DEFAULT 1 NULL AFTER `qty`;

-- Add max_threshold column with default value of 2
ALTER TABLE `store_inventory` 
ADD COLUMN `max_threshold` INT(11) DEFAULT 2 NULL AFTER `min_threshold`;

-- Update existing records to have default values (optional, but recommended)
UPDATE `store_inventory` 
SET `min_threshold` = 1, `max_threshold` = 2 
WHERE `min_threshold` IS NULL OR `max_threshold` IS NULL;

-- Verify the columns were added
-- DESCRIBE store_inventory;

