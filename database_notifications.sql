-- Create notifications table without foreign keys first
CREATE TABLE IF NOT EXISTS `notifications` (
  `notification_id` INT(11) NOT NULL AUTO_INCREMENT,
  `type` VARCHAR(50) NOT NULL COMMENT 'stock_request, delivery, out_of_stock, payment_due, overdue',
  `title` VARCHAR(255) NOT NULL,
  `message` TEXT NOT NULL,
  `location_id` INT(11) DEFAULT NULL,
  `target_role` VARCHAR(100) DEFAULT 'All' COMMENT 'Admin, Warehouse Representative, Inventory Manager, etc.',
  `product_id` INT(11) DEFAULT NULL,
  `customer_id` INT(11) DEFAULT NULL,
  `reference_id` INT(11) DEFAULT NULL COMMENT 'ID of related entity (stock_request_id, delivery_id, sale_id, etc.)',
  `created_at` DATETIME NOT NULL,
  `is_read` TINYINT(1) DEFAULT 0,
  PRIMARY KEY (`notification_id`),
  KEY `location_id` (`location_id`),
  KEY `product_id` (`product_id`),
  KEY `customer_id` (`customer_id`),
  KEY `is_read` (`is_read`),
  KEY `created_at` (`created_at`),
  KEY `idx_type_read` (`type`, `is_read`),
  KEY `idx_target_role` (`target_role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Try to add foreign keys if the tables exist
-- If these fail, the table will still work without foreign keys

-- Add location foreign key if location table exists
SET @location_exists = (SELECT COUNT(*) FROM information_schema.tables 
                        WHERE table_schema = DATABASE() 
                        AND table_name = 'location');

SET @sql = IF(@location_exists > 0,
    'ALTER TABLE `notifications` ADD CONSTRAINT `notifications_location_fk` 
     FOREIGN KEY (`location_id`) REFERENCES `location` (`location_id`) ON DELETE CASCADE',
    'SELECT "Location table does not exist, skipping FK" as warning');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add product foreign key if products table exists
SET @product_exists = (SELECT COUNT(*) FROM information_schema.tables 
                       WHERE table_schema = DATABASE() 
                       AND table_name = 'products');

SET @sql = IF(@product_exists > 0,
    'ALTER TABLE `notifications` ADD CONSTRAINT `notifications_product_fk` 
     FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`) ON DELETE CASCADE',
    'SELECT "Products table does not exist, skipping FK" as warning');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add customer foreign key if customers table exists
SET @customer_exists = (SELECT COUNT(*) FROM information_schema.tables 
                        WHERE table_schema = DATABASE() 
                        AND table_name = 'customers');

SET @sql = IF(@customer_exists > 0,
    'ALTER TABLE `notifications` ADD CONSTRAINT `notifications_customer_fk` 
     FOREIGN KEY (`customer_id`) REFERENCES `customers` (`customer_id`) ON DELETE CASCADE',
    'SELECT "Customers table does not exist, skipping FK" as warning');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

