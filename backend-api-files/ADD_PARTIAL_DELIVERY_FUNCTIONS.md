# Instructions to Add Partial Delivery Functions

## Problem
The error "Unexpected token '<', "<br />" ... is not valid JSON" occurs because the functions `GetDeliveredProducts` and `DeliverStockPartial` are being called in the switch statement but don't exist in the User class.

## Solution
Add these two functions to the `User` class in `requestStock.php` **before the closing brace `}`** at line 1123.

## Steps:
1. Open `c:\xampp\htdocs\capstone-api\api\requestStock.php`
2. Go to line 1115 (after `return json_encode($returnValue);` in the `GetReqDateAndTime` function)
3. Before the closing brace `}` at line 1123, paste the following code:

```php
    public function GetDeliveredProducts($json, $requestList)
    {
        include 'conn.php';
        $details = json_decode($json, true);
        $reqID = isset($details['reqID']) ? (int) $details['reqID'] : 0;
        try {
            $createTableSql = "CREATE TABLE IF NOT EXISTS `request_stock_delivered_products` (
                `r_delivered_product_id` INT(11) NOT NULL AUTO_INCREMENT,
                `request_stock_id` INT(11) NOT NULL,
                `product_id` INT(11) NOT NULL,
                `delivery_date` DATE NOT NULL,
                `driver_name` VARCHAR(255) NOT NULL,
                `r_deliver_id` INT(11) NULL,
                PRIMARY KEY (`r_delivered_product_id`),
                UNIQUE KEY `unique_delivery` (`request_stock_id`, `product_id`, `r_deliver_id`),
                KEY `request_stock_id` (`request_stock_id`),
                KEY `product_id` (`product_id`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci";
            $conn->exec($createTableSql);
            $sql = "SELECT DISTINCT `product_id` FROM `request_stock_delivered_products` WHERE `request_stock_id` = :reqID";
            $stmt = $conn->prepare($sql);
            $stmt->bindParam(':reqID', $reqID, PDO::PARAM_INT);
            $stmt->execute();
            $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $returnValue = array_map(function($row) { return (int) $row['product_id']; }, $result);
            unset($stmt);
            unset($conn);
            return json_encode($returnValue);
        } catch (PDOException $e) {
            unset($conn);
            if (isset($stmt)) unset($stmt);
            return json_encode([]);
        }
    }

    public function DeliverStockPartial($json, $requestList)
    {
        include 'conn.php';
        $details = json_decode($json, true);
        $date = date("Y-m-d");
        $time = date("H:i:s");
        $reqID = isset($details['reqID']) ? (int) $details['reqID'] : 0;
        $accID = isset($details['accID']) ? (int) $details['accID'] : 0;
        $driverName = isset($details['driverName']) ? trim($details['driverName']) : '';
        $selectedProducts = isset($details['selectedProducts']) && is_array($details['selectedProducts']) ? array_map('intval', $details['selectedProducts']) : [];
        if (empty($reqID) || empty($driverName) || empty($selectedProducts)) {
            unset($conn);
            return json_encode('Error: Missing required parameters');
        }
        try {
            $createTableSql = "CREATE TABLE IF NOT EXISTS `request_stock_delivered_products` (
                `r_delivered_product_id` INT(11) NOT NULL AUTO_INCREMENT,
                `request_stock_id` INT(11) NOT NULL,
                `product_id` INT(11) NOT NULL,
                `delivery_date` DATE NOT NULL,
                `driver_name` VARCHAR(255) NOT NULL,
                `r_deliver_id` INT(11) NULL,
                PRIMARY KEY (`r_delivered_product_id`),
                UNIQUE KEY `unique_delivery` (`request_stock_id`, `product_id`, `r_deliver_id`),
                KEY `request_stock_id` (`request_stock_id`),
                KEY `product_id` (`product_id`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci";
            $conn->exec($createTableSql);
            $conn->beginTransaction();
            $checkSql = "SELECT `r_deliver_id` FROM `request_deliver` WHERE `request_stock_id` = :reqID AND `delivery_status` = 'On Delivery' LIMIT 1";
            $checkStmt = $conn->prepare($checkSql);
            $checkStmt->bindParam(':reqID', $reqID, PDO::PARAM_INT);
            $checkStmt->execute();
            $deliverRecord = $checkStmt->fetch(PDO::FETCH_ASSOC);
            $r_deliver_id = $deliverRecord ? (int) $deliverRecord['r_deliver_id'] : null;
            if (!$r_deliver_id) {
                $insertDeliverSql = "INSERT INTO `request_deliver` (`request_stock_id`, `date`, `delivery_status`, `driverName`) VALUES (:reqID, :date, 'On Delivery', :driverName)";
                $insertDeliverStmt = $conn->prepare($insertDeliverSql);
                $insertDeliverStmt->bindParam(':reqID', $reqID, PDO::PARAM_INT);
                $insertDeliverStmt->bindParam(':date', $date);
                $insertDeliverStmt->bindParam(':driverName', $driverName);
                $insertDeliverStmt->execute();
                $r_deliver_id = $conn->lastInsertId();
                unset($insertDeliverStmt);
            }
            $updateStatusSql = "UPDATE `request_stock` SET `request_status` = 'On Delivery' WHERE `request_stock_id` = :reqID AND `request_status` != 'Complete'";
            $updateStatusStmt = $conn->prepare($updateStatusSql);
            $updateStatusStmt->bindParam(':reqID', $reqID, PDO::PARAM_INT);
            $updateStatusStmt->execute();
            unset($updateStatusStmt);
            $checkReportSql = "SELECT `rr_id` FROM `request_reports` WHERE `request_stock_id` = :reqID AND `status` = 'On Delivery' LIMIT 1";
            $checkReportStmt = $conn->prepare($checkReportSql);
            $checkReportStmt->bindParam(':reqID', $reqID, PDO::PARAM_INT);
            $checkReportStmt->execute();
            $reportExists = $checkReportStmt->fetch(PDO::FETCH_ASSOC);
            unset($checkReportStmt);
            if (!$reportExists) {
                $insertReportSql = "INSERT INTO `request_reports` (`request_stock_id`, `date`, `time`, `status`, `account_id`) VALUES (:reqID, :date, :time, 'On Delivery', :accID)";
                $insertReportStmt = $conn->prepare($insertReportSql);
                $insertReportStmt->bindParam(':reqID', $reqID, PDO::PARAM_INT);
                $insertReportStmt->bindParam(':date', $date);
                $insertReportStmt->bindParam(':time', $time);
                $insertReportStmt->bindParam(':accID', $accID, PDO::PARAM_INT);
                $insertReportStmt->execute();
                unset($insertReportStmt);
            }
            $insertDeliveredSql = "INSERT INTO `request_stock_delivered_products` (`request_stock_id`, `product_id`, `delivery_date`, `driver_name`, `r_deliver_id`) VALUES (:reqID, :productId, :date, :driverName, :rDeliverId) ON DUPLICATE KEY UPDATE `delivery_date` = :date, `driver_name` = :driverName";
            $insertDeliveredStmt = $conn->prepare($insertDeliveredSql);
            foreach ($selectedProducts as $productId) {
                $insertDeliveredStmt->bindParam(':reqID', $reqID, PDO::PARAM_INT);
                $insertDeliveredStmt->bindParam(':productId', $productId, PDO::PARAM_INT);
                $insertDeliveredStmt->bindParam(':date', $date);
                $insertDeliveredStmt->bindParam(':driverName', $driverName);
                $insertDeliveredStmt->bindParam(':rDeliverId', $r_deliver_id, PDO::PARAM_INT);
                $insertDeliveredStmt->execute();
            }
            unset($insertDeliveredStmt);
            $totalProductsSql = "SELECT COUNT(DISTINCT `product_id`) as total FROM `request_stock_details` WHERE `request__stock_id` = :reqID";
            $totalProductsStmt = $conn->prepare($totalProductsSql);
            $totalProductsStmt->bindParam(':reqID', $reqID, PDO::PARAM_INT);
            $totalProductsStmt->execute();
            $totalResult = $totalProductsStmt->fetch(PDO::FETCH_ASSOC);
            $totalProducts = (int) $totalResult['total'];
            unset($totalProductsStmt);
            $deliveredProductsSql = "SELECT COUNT(DISTINCT `product_id`) as delivered FROM `request_stock_delivered_products` WHERE `request_stock_id` = :reqID";
            $deliveredProductsStmt = $conn->prepare($deliveredProductsSql);
            $deliveredProductsStmt->bindParam(':reqID', $reqID, PDO::PARAM_INT);
            $deliveredProductsStmt->execute();
            $deliveredResult = $deliveredProductsStmt->fetch(PDO::FETCH_ASSOC);
            $deliveredProducts = (int) $deliveredResult['delivered'];
            unset($deliveredProductsStmt);
            if ($totalProducts > 0 && $deliveredProducts >= $totalProducts) {
                $completeStatusSql = "UPDATE `request_stock` SET `request_status` = 'Complete' WHERE `request_stock_id` = :reqID";
                $completeStatusStmt = $conn->prepare($completeStatusSql);
                $completeStatusStmt->bindParam(':reqID', $reqID, PDO::PARAM_INT);
                $completeStatusStmt->execute();
                unset($completeStatusStmt);
                $completeDeliverSql = "UPDATE `request_deliver` SET `delivery_status` = 'Complete' WHERE `request_stock_id` = :reqID";
                $completeDeliverStmt = $conn->prepare($completeDeliverSql);
                $completeDeliverStmt->bindParam(':reqID', $reqID, PDO::PARAM_INT);
                $completeDeliverStmt->execute();
                unset($completeDeliverStmt);
                $insertCompleteReportSql = "INSERT INTO `request_reports` (`request_stock_id`, `date`, `time`, `status`, `account_id`) VALUES (:reqID, :date, :time, 'Complete', :accID)";
                $insertCompleteReportStmt = $conn->prepare($insertCompleteReportSql);
                $insertCompleteReportStmt->bindParam(':reqID', $reqID, PDO::PARAM_INT);
                $insertCompleteReportStmt->bindParam(':date', $date);
                $insertCompleteReportStmt->bindParam(':time', $time);
                $insertCompleteReportStmt->bindParam(':accID', $accID, PDO::PARAM_INT);
                $insertCompleteReportStmt->execute();
                unset($insertCompleteReportStmt);
            }
            $conn->commit();
            unset($checkStmt);
            unset($conn);
            return json_encode('Success');
        } catch (PDOException $e) {
            if ($conn->inTransaction()) {
                $conn->rollBack();
            }
            unset($conn);
            if (isset($checkStmt)) unset($checkStmt);
            return json_encode('Error: ' . $e->getMessage());
        }
    }
```

4. Save the file
5. The error should be resolved!

## Location in File:
- Insert AFTER line 1115 (after `GetReqDateAndTime` function ends)
- Insert BEFORE line 1123 (before the closing `}` of the User class)

## What These Functions Do:
- **GetDeliveredProducts**: Fetches which products have been delivered for a request
- **DeliverStockPartial**: Handles partial delivery - records selected products as delivered, updates request status, and marks request as "Complete" when all products are delivered

