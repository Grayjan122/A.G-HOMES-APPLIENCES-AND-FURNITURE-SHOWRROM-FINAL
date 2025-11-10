-- ADD THIS COLUMN NOW - Run this in phpMyAdmin SQL tab

ALTER TABLE `request_delivery_details` 
ADD COLUMN `request_stock_id` INT(11) NOT NULL DEFAULT 0 AFTER `r_delivery_id`;

ALTER TABLE `request_delivery_details` 
ADD INDEX `idx_request_stock_id` (`request_stock_id`);

UPDATE `request_delivery_details` rdd
INNER JOIN `request_delivery` rd ON rdd.r_delivery_id = rd.r_delivery_id
SET rdd.request_stock_id = rd.request_stock_id
WHERE rdd.request_stock_id = 0;

