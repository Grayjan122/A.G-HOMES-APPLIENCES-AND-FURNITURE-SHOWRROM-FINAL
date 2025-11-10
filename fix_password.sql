-- Fix password for test e-commerce customer
-- This updates the password hash to correctly match "shop123"
-- Run this in phpMyAdmin

UPDATE ecommerce_customers 
SET password = '$2y$10$a977.QYijOwpMFVGjEwpB.zQQDGvVP9S0J4oQi6Np.sQRT4mRAvMK' 
WHERE email = 'shop@example.com';

-- Verify the update
SELECT ecommerce_customer_id, customer_name, email, status, 
       SUBSTRING(password, 1, 20) as password_hash_preview
FROM ecommerce_customers 
WHERE email = 'shop@example.com';

