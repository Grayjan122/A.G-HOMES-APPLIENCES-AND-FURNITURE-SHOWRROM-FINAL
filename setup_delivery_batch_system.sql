-- Create delivery batch header table
CREATE TABLE IF NOT EXISTS `request_delivery` (
    `r_delivery_id` INT(11) NOT NULL AUTO_INCREMENT,
    `request_stock_id` INT(11) NOT NULL,
    `delivery_date` DATE NOT NULL,
    `delivery_time` TIME NOT NULL,
    `driver_name` VARCHAR(255) NOT NULL,
    `delivery_status` ENUM('On Delivery', 'Delivered', 'Complete', 'Cancelled') DEFAULT 'On Delivery',
    `created_by` INT(11) NOT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`r_delivery_id`),
    KEY `request_stock_id` (`request_stock_id`),
    KEY `delivery_status` (`delivery_status`),
    KEY `created_by` (`created_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Create delivery batch details table
CREATE TABLE IF NOT EXISTS `request_delivery_details` (
    `r_delivery_detail_id` INT(11) NOT NULL AUTO_INCREMENT,
    `r_delivery_id` INT(11) NOT NULL,
    `request_stock_id` INT(11) NOT NULL,
    `product_id` INT(11) NOT NULL,
    `quantity` INT(11) NOT NULL,
    `item_status` ENUM('Delivered', 'Pending') DEFAULT 'Pending',
    `delivered_date` DATE NULL,
    `delivered_time` TIME NULL,
    PRIMARY KEY (`r_delivery_detail_id`),
    KEY `r_delivery_id` (`r_delivery_id`),
    KEY `request_stock_id` (`request_stock_id`),
    KEY `product_id` (`product_id`),
    KEY `item_status` (`item_status`),
    FOREIGN KEY (`r_delivery_id`) REFERENCES `request_delivery`(`r_delivery_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Add driverName column to request_deliver if it doesn't exist
ALTER TABLE `request_deliver` 
ADD COLUMN IF NOT EXISTS `driverName` VARCHAR(255) NULL AFTER `delivery_status`;

