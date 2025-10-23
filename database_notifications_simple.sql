-- Simple notifications table without foreign keys
-- This will work regardless of your existing table structure

CREATE TABLE IF NOT EXISTS `notifications` (
  `notification_id` INT(11) NOT NULL AUTO_INCREMENT,
  `type` VARCHAR(50) NOT NULL COMMENT 'stock_request, delivery, out_of_stock, payment_due, overdue',
  `title` VARCHAR(255) NOT NULL,
  `message` TEXT NOT NULL,
  `location_id` INT(11) DEFAULT NULL,
  `target_role` VARCHAR(100) DEFAULT 'All',
  `product_id` INT(11) DEFAULT NULL,
  `customer_id` INT(11) DEFAULT NULL,
  `reference_id` INT(11) DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `is_read` TINYINT(1) DEFAULT 0,
  PRIMARY KEY (`notification_id`),
  INDEX `idx_location` (`location_id`),
  INDEX `idx_product` (`product_id`),
  INDEX `idx_customer` (`customer_id`),
  INDEX `idx_is_read` (`is_read`),
  INDEX `idx_created` (`created_at`),
  INDEX `idx_type_read` (`type`, `is_read`),
  INDEX `idx_target_role` (`target_role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

