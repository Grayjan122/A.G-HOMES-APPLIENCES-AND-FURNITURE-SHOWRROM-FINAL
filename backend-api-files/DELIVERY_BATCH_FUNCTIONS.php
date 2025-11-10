<?php
// Delivery Batch System Functions
// This implements a proper delivery batch system where each delivery creates a header
// and tracks which items are in that delivery batch

public function DeliverStockPartial($json, $requestList)
{
    include 'conn.php';

    $details = json_decode($json, true);
    $date = date("Y-m-d");
    $time = date("H:i:s");

    $reqID = isset($details['reqID']) ? (int) $details['reqID'] : 0;
    $accID = isset($details['accID']) ? (int) $details['accID'] : 0;
    $driverName = isset($details['driverName']) ? trim($details['driverName']) : '';
    
    // Parse selectedProducts - handle both array and string formats
    $selectedProducts = [];
    if (isset($details['selectedProducts'])) {
        if (is_array($details['selectedProducts'])) {
            $selectedProducts = array_map('intval', $details['selectedProducts']);
        } else if (is_string($details['selectedProducts'])) {
            $decoded = json_decode($details['selectedProducts'], true);
            if (is_array($decoded)) {
                $selectedProducts = array_map('intval', $decoded);
            }
        }
    }
    
    // Remove any duplicates and ensure we have valid product IDs
    $selectedProducts = array_unique(array_filter($selectedProducts, function($id) {
        return $id > 0;
    }));

    if (empty($reqID) || empty($driverName) || empty($selectedProducts)) {
        unset($conn);
        return json_encode('Error: Missing required parameters. Selected products: ' . json_encode($selectedProducts));
    }

    try {
        // Create delivery batch tables if they don't exist
        $createDeliveryTableSql = "CREATE TABLE IF NOT EXISTS `request_delivery` (
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
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci";

        $createDetailsTableSql = "CREATE TABLE IF NOT EXISTS `request_delivery_details` (
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
            KEY `item_status` (`item_status`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci";

        $conn->exec($createDeliveryTableSql);
        $conn->exec($createDetailsTableSql);

        $conn->beginTransaction();

        // VALIDATION: Get all products in the request to validate selected products
        $validateSql = "SELECT DISTINCT `product_id`, `qty` FROM `request_stock_details` WHERE `request__stock_id` = :reqID";
        $validateStmt = $conn->prepare($validateSql);
        $validateStmt->bindParam(':reqID', $reqID, PDO::PARAM_INT);
        $validateStmt->execute();
        $allRequestProducts = $validateStmt->fetchAll(PDO::FETCH_ASSOC);
        $requestProductMap = [];
        foreach ($allRequestProducts as $row) {
            $requestProductMap[(int)$row['product_id']] = (int)$row['qty'];
        }
        unset($validateStmt);

        // VALIDATION: Ensure all selected products are actually in the request
        $invalidProducts = [];
        foreach ($selectedProducts as $prodId) {
            if (!isset($requestProductMap[$prodId])) {
                $invalidProducts[] = $prodId;
            }
        }
        if (!empty($invalidProducts)) {
            $conn->rollBack();
            unset($conn);
            return json_encode('Error: Invalid product IDs selected. Products ' . json_encode($invalidProducts) . ' are not in this request.');
        }

        // 1. Create a new delivery batch header
        $insertDeliverySql = "INSERT INTO `request_delivery` 
            (`request_stock_id`, `delivery_date`, `delivery_time`, `driver_name`, `delivery_status`, `created_by`) 
            VALUES (:reqID, :date, :time, :driverName, 'On Delivery', :accID)";
        $insertDeliveryStmt = $conn->prepare($insertDeliverySql);
        $insertDeliveryStmt->bindParam(':reqID', $reqID, PDO::PARAM_INT);
        $insertDeliveryStmt->bindParam(':date', $date);
        $insertDeliveryStmt->bindParam(':time', $time);
        $insertDeliveryStmt->bindParam(':driverName', $driverName);
        $insertDeliveryStmt->bindParam(':accID', $accID, PDO::PARAM_INT);
        $insertDeliveryStmt->execute();
        $r_delivery_id = $conn->lastInsertId();
        unset($insertDeliveryStmt);

        error_log("DeliverStockPartial - Created delivery batch #$r_delivery_id for request $reqID with " . count($selectedProducts) . " products");

        // 2. Insert delivery details for each selected product
        $insertedProducts = [];
        $failedProducts = [];
        
        $insertDetailSql = "INSERT INTO `request_delivery_details` 
            (`r_delivery_id`, `request_stock_id`, `product_id`, `quantity`, `item_status`, `delivered_date`, `delivered_time`) 
            VALUES (:deliveryId, :reqID, :productId, :quantity, 'Delivered', :date, :time)";
        $insertDetailStmt = $conn->prepare($insertDetailSql);

        foreach ($selectedProducts as $productId) {
            $productId = (int) $productId;
            $quantity = isset($requestProductMap[$productId]) ? $requestProductMap[$productId] : 1;
            
            $insertDetailStmt->bindValue(':deliveryId', $r_delivery_id, PDO::PARAM_INT);
            $insertDetailStmt->bindValue(':reqID', $reqID, PDO::PARAM_INT);
            $insertDetailStmt->bindValue(':productId', $productId, PDO::PARAM_INT);
            $insertDetailStmt->bindValue(':quantity', $quantity, PDO::PARAM_INT);
            $insertDetailStmt->bindValue(':date', $date);
            $insertDetailStmt->bindValue(':time', $time);
            
            if ($insertDetailStmt->execute()) {
                $insertedProducts[] = $productId;
                error_log("DeliverStockPartial - Added product $productId (qty: $quantity) to delivery batch #$r_delivery_id");
            } else {
                $failedProducts[] = $productId;
                error_log("DeliverStockPartial - Failed to add product $productId to delivery batch #$r_delivery_id");
            }
        }
        unset($insertDetailStmt);

        // VALIDATION: Verify we inserted all selected products
        if (count($insertedProducts) !== count($selectedProducts)) {
            $conn->rollBack();
            unset($conn);
            return json_encode('Error: Failed to create delivery details. Inserted: ' . count($insertedProducts) . ', Expected: ' . count($selectedProducts) . '. Failed products: ' . json_encode($failedProducts));
        }

        // 3. Check total products in request and how many are delivered
        $totalProductsInRequest = count($requestProductMap);
        
        // Count how many unique products have been delivered (across all delivery batches)
        $checkDeliveredSql = "SELECT COUNT(DISTINCT `product_id`) as delivered_count 
            FROM `request_delivery_details` 
            WHERE `request_stock_id` = :reqID AND `item_status` = 'Delivered'";
        $checkDeliveredStmt = $conn->prepare($checkDeliveredSql);
        $checkDeliveredStmt->bindParam(':reqID', $reqID, PDO::PARAM_INT);
        $checkDeliveredStmt->execute();
        $deliveredResult = $checkDeliveredStmt->fetch(PDO::FETCH_ASSOC);
        $deliveredCount = (int) $deliveredResult['delivered_count'];
        unset($checkDeliveredStmt);

        error_log("DeliverStockPartial - Request $reqID: Total products: $totalProductsInRequest, Delivered: $deliveredCount");

        // 4. Update request status based on delivery completion
        if ($deliveredCount >= $totalProductsInRequest && $totalProductsInRequest > 0) {
            // All products delivered, set status to "On Delivery"
            $updateStatusSql = "UPDATE `request_stock` 
                SET `request_status` = 'On Delivery' 
                WHERE `request_stock_id` = :reqID 
                AND `request_status` NOT IN ('Complete', 'Delivered')";
            $updateStatusStmt = $conn->prepare($updateStatusSql);
            $updateStatusStmt->bindParam(':reqID', $reqID, PDO::PARAM_INT);
            $updateStatusStmt->execute();
            unset($updateStatusStmt);

            // Insert "On Delivery" report if not exists
            $checkReportSql = "SELECT `rr_id` FROM `request_reports` 
                WHERE `request_stock_id` = :reqID AND `status` = 'On Delivery' LIMIT 1";
            $checkReportStmt = $conn->prepare($checkReportSql);
            $checkReportStmt->bindParam(':reqID', $reqID, PDO::PARAM_INT);
            $checkReportStmt->execute();
            $reportExists = $checkReportStmt->fetch(PDO::FETCH_ASSOC);
            unset($checkReportStmt);

            if (!$reportExists) {
                $insertReportSql = "INSERT INTO `request_reports` 
                    (`request_stock_id`, `date`, `time`, `status`, `account_id`) 
                    VALUES (:reqID, :date, :time, 'On Delivery', :accID)";
                $insertReportStmt = $conn->prepare($insertReportSql);
                $insertReportStmt->bindParam(':reqID', $reqID, PDO::PARAM_INT);
                $insertReportStmt->bindParam(':date', $date);
                $insertReportStmt->bindParam(':time', $time);
                $insertReportStmt->bindParam(':accID', $accID, PDO::PARAM_INT);
                $insertReportStmt->execute();
                unset($insertReportStmt);
            }
        } else {
            // Partial delivery, keep status as "On Going"
            $updateStatusSql = "UPDATE `request_stock` 
                SET `request_status` = 'On Going' 
                WHERE `request_stock_id` = :reqID 
                AND `request_status` IN ('Pending', 'Approved', 'On Going')";
            $updateStatusStmt = $conn->prepare($updateStatusSql);
            $updateStatusStmt->bindParam(':reqID', $reqID, PDO::PARAM_INT);
            $updateStatusStmt->execute();
            unset($updateStatusStmt);
        }

        $conn->commit();
        unset($conn);

        error_log("DeliverStockPartial - Successfully created delivery batch #$r_delivery_id for request $reqID");
        return json_encode('Success');
    } catch (PDOException $e) {
        if (isset($conn) && $conn->inTransaction()) {
            $conn->rollBack();
        }
        error_log("DeliverStockPartial - PDO Error: " . $e->getMessage() . " | Request ID: $reqID | Selected: " . json_encode($selectedProducts));
        if (isset($conn)) unset($conn);
        return json_encode('Error: ' . $e->getMessage());
    } catch (Exception $e) {
        if (isset($conn) && $conn->inTransaction()) {
            $conn->rollBack();
        }
        error_log("DeliverStockPartial - General Exception: " . $e->getMessage() . " | Request ID: $reqID | Selected: " . json_encode($selectedProducts));
        if (isset($conn)) unset($conn);
        return json_encode('Error: ' . $e->getMessage());
    }
}

// Get delivered products for a request (using delivery batch system)
public function GetDeliveredProducts($json, $requestList)
{
    include 'conn.php';

    $details = json_decode($json, true);
    $reqID = isset($details['reqID']) ? (int) $details['reqID'] : 0;

    try {
        // Create table if it doesn't exist
        $createDetailsTableSql = "CREATE TABLE IF NOT EXISTS `request_delivery_details` (
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
            KEY `item_status` (`item_status`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci";

        $conn->exec($createDetailsTableSql);

        // Get all delivered product IDs from delivery details
        $sql = "SELECT DISTINCT `product_id` 
                FROM `request_delivery_details` 
                WHERE `request_stock_id` = :reqID AND `item_status` = 'Delivered'";
        $stmt = $conn->prepare($sql);
        $stmt->bindParam(':reqID', $reqID, PDO::PARAM_INT);
        $stmt->execute();
        $result = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $returnValue = array_map(function($row) {
            return (int) $row['product_id'];
        }, $result);

        unset($stmt);
        unset($conn);

        return json_encode($returnValue);
    } catch (PDOException $e) {
        unset($conn);
        if (isset($stmt)) unset($stmt);
        return json_encode([]);
    }
}

