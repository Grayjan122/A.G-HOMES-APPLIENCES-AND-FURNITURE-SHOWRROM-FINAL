-- ═══════════════════════════════════════════════════════════════
-- E-COMMERCE DATABASE SETUP - SEPARATE FROM WALK-IN CUSTOMERS
-- Creates new tables for online shop customers only
-- Your existing 'customers' table for walk-in customers remains untouched
-- ═══════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════
-- Create ecommerce_customers table for online shop customers
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS `ecommerce_customers` (
  `ecommerce_customer_id` int(11) NOT NULL AUTO_INCREMENT,
  `customer_name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `address` text NOT NULL,
  `password` varchar(255) NOT NULL,
  `status` enum('Active','Inactive') DEFAULT 'Active',
  `date_created` datetime DEFAULT CURRENT_TIMESTAMP,
  `last_login` datetime DEFAULT NULL,
  PRIMARY KEY (`ecommerce_customer_id`),
  UNIQUE KEY `unique_email` (`email`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ═══════════════════════════════════════════════════════════════
-- Create ecommerce_orders table for online orders
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS `ecommerce_orders` (
  `ecommerce_order_id` int(11) NOT NULL AUTO_INCREMENT,
  `ecommerce_customer_id` int(11) NOT NULL,
  `order_number` varchar(50) NOT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `status` enum('Pending','Processing','Completed','Cancelled') DEFAULT 'Pending',
  `payment_method` varchar(50) DEFAULT NULL,
  `payment_status` enum('Unpaid','Paid','Partial') DEFAULT 'Unpaid',
  `shipping_address` text DEFAULT NULL,
  `contact_phone` varchar(20) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `order_date` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`ecommerce_order_id`),
  UNIQUE KEY `unique_order_number` (`order_number`),
  KEY `ecommerce_customer_id` (`ecommerce_customer_id`),
  KEY `idx_status` (`status`),
  KEY `idx_order_date` (`order_date`),
  CONSTRAINT `fk_ecommerce_orders_customer` FOREIGN KEY (`ecommerce_customer_id`) REFERENCES `ecommerce_customers` (`ecommerce_customer_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ═══════════════════════════════════════════════════════════════
-- Create ecommerce_order_items table for order details
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS `ecommerce_order_items` (
  `ecommerce_order_item_id` int(11) NOT NULL AUTO_INCREMENT,
  `ecommerce_order_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `product_name` varchar(100) NOT NULL,
  `quantity` int(11) NOT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  PRIMARY KEY (`ecommerce_order_item_id`),
  KEY `ecommerce_order_id` (`ecommerce_order_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `fk_ecommerce_order_items_order` FOREIGN KEY (`ecommerce_order_id`) REFERENCES `ecommerce_orders` (`ecommerce_order_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ecommerce_order_items_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ═══════════════════════════════════════════════════════════════
-- Create ecommerce_wishlist table for customer wishlists
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS `ecommerce_wishlist` (
  `ecommerce_wishlist_id` int(11) NOT NULL AUTO_INCREMENT,
  `ecommerce_customer_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `added_date` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ecommerce_wishlist_id`),
  KEY `ecommerce_customer_id` (`ecommerce_customer_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `fk_ecommerce_wishlist_customer` FOREIGN KEY (`ecommerce_customer_id`) REFERENCES `ecommerce_customers` (`ecommerce_customer_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ecommerce_wishlist_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ═══════════════════════════════════════════════════════════════
-- Create ecommerce_cart table for shopping carts (optional)
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS `ecommerce_cart` (
  `ecommerce_cart_id` int(11) NOT NULL AUTO_INCREMENT,
  `ecommerce_customer_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `added_date` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`ecommerce_cart_id`),
  KEY `ecommerce_customer_id` (`ecommerce_customer_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `fk_ecommerce_cart_customer` FOREIGN KEY (`ecommerce_customer_id`) REFERENCES `ecommerce_customers` (`ecommerce_customer_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ecommerce_cart_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ═══════════════════════════════════════════════════════════════
-- Insert test e-commerce customer account
-- Email: shop@example.com
-- Password: shop123 (hashed with PHP password_hash)
-- ═══════════════════════════════════════════════════════════════

INSERT INTO `ecommerce_customers` (`customer_name`, `email`, `phone`, `address`, `password`, `status`) VALUES
('Test Shop Customer', 'shop@example.com', '09123456789', '123 Sample Street, Cagayan de Oro City', '$2y$10$a977.QYijOwpMFVGjEwpB.zQQDGvVP9S0J4oQi6Np.sQRT4mRAvMK', 'Active')
ON DUPLICATE KEY UPDATE password = '$2y$10$a977.QYijOwpMFVGjEwpB.zQQDGvVP9S0J4oQi6Np.sQRT4mRAvMK';

-- ═══════════════════════════════════════════════════════════════
-- Verification Queries
-- ═══════════════════════════════════════════════════════════════

SELECT '✅ E-commerce database setup complete!' AS Status;

SELECT 'Checking new e-commerce tables...' AS Message;
SHOW TABLES LIKE 'ecommerce_%';

SELECT 'Checking ecommerce_customers table...' AS Message;
SELECT COUNT(*) as total_ecommerce_customers FROM ecommerce_customers;

SELECT 'Your walk-in customers table is UNTOUCHED!' AS Important_Note;
SELECT COUNT(*) as total_walk_in_customers FROM customers;

-- ═══════════════════════════════════════════════════════════════
-- SUMMARY OF CHANGES:
-- ═══════════════════════════════════════════════════════════════
-- 
-- ✅ NEW TABLES CREATED (Separate from walk-in customers):
--   • ecommerce_customers - Online shop customer accounts
--   • ecommerce_orders - Online orders
--   • ecommerce_order_items - Order line items
--   • ecommerce_wishlist - Customer wishlists
--   • ecommerce_cart - Shopping cart items
--
-- ✅ EXISTING TABLES UNTOUCHED:
--   • customers - Your walk-in customers (NO CHANGES)
--   • customer_sales - Walk-in sales (NO CHANGES)
--   • All other existing tables (NO CHANGES)
--
-- 📊 DATA SEPARATION:
--   Walk-in customers → customers table
--   Online customers  → ecommerce_customers table
--
-- 🔐 TEST ACCOUNT:
--   Email: shop@example.com
--   Password: shop123
--
-- ═══════════════════════════════════════════════════════════════
