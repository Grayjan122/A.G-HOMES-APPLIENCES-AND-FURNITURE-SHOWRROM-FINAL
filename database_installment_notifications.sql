-- Add notification tracking columns to installment_payment_sched table
-- Run this SQL in your database

ALTER TABLE `installment_payment_sched` 
ADD COLUMN `reminder_1week_sent` TINYINT(1) DEFAULT 0 COMMENT '1 week before due date reminder sent',
ADD COLUMN `reminder_3days_sent` TINYINT(1) DEFAULT 0 COMMENT '3 days before due date reminder sent',
ADD COLUMN `reminder_1day_sent` TINYINT(1) DEFAULT 0 COMMENT '1 day before due date reminder sent',
ADD COLUMN `overdue_notification_sent` TINYINT(1) DEFAULT 0 COMMENT 'Overdue notification sent (after grace period)';

-- Add index for better query performance
ALTER TABLE `installment_payment_sched`
ADD INDEX `idx_due_date_status` (`due_date`, `status`),
ADD INDEX `idx_reminders` (`reminder_1week_sent`, `reminder_3days_sent`, `reminder_1day_sent`, `overdue_notification_sent`);

-- Ensure customers table has email column (if not exists)
-- Uncomment if needed:
-- ALTER TABLE `customers` 
-- ADD COLUMN `email` VARCHAR(255) NULL AFTER `phone`,
-- ADD COLUMN `phone` VARCHAR(50) NULL AFTER `cust_address`;

