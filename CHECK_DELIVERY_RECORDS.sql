-- Run these queries to check if delivery records are being created

-- 1. Check all records in request_delivery table
SELECT * FROM `request_delivery` ORDER BY created_at DESC LIMIT 10;

-- 2. Check all records in request_delivery_details table
SELECT * FROM `request_delivery_details` ORDER BY r_delivery_detail_id DESC LIMIT 20;

-- 3. Check for a specific request (replace XXX with your request ID)
SELECT 
    rd.*,
    COUNT(rdd.r_delivery_detail_id) as product_count
FROM `request_delivery` rd
LEFT JOIN `request_delivery_details` rdd ON rd.r_delivery_id = rdd.r_delivery_id
WHERE rd.request_stock_id = XXX  -- Replace XXX with your request ID
GROUP BY rd.r_delivery_id;

-- 4. Check the details for a specific delivery batch (replace YYY with r_delivery_id)
SELECT 
    rdd.*,
    p.product_name,
    p.description
FROM `request_delivery_details` rdd
LEFT JOIN `products` p ON rdd.product_id = p.product_id
WHERE rdd.r_delivery_id = YYY;  -- Replace YYY with r_delivery_id

