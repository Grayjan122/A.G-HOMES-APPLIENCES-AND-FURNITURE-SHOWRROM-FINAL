-- Create table to store items selected for delivery
CREATE TABLE IF NOT EXISTS `request_stock_selected_delivery` (
    `r_selected_delivery_id` INT(11) NOT NULL AUTO_INCREMENT,
    `request_stock_id` INT(11) NOT NULL,
    `product_id` INT(11) NOT NULL,
    `quantity` INT(11) NOT NULL,
    `selected_date` DATETIME NOT NULL,
    `selected_by` INT(11) NOT NULL,
    `delivery_status` ENUM('Selected', 'Delivered', 'Cancelled') DEFAULT 'Selected',
    PRIMARY KEY (`r_selected_delivery_id`),
    UNIQUE KEY `unique_selection` (`request_stock_id`, `product_id`),
    KEY `request_stock_id` (`request_stock_id`),
    KEY `product_id` (`product_id`),
    KEY `selected_by` (`selected_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

