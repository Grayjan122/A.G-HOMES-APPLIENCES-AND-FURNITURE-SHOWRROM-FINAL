<?php
// Functions to add to requestStock.php User class before the closing brace

public function SaveSelectedDeliveryItems($json, $requestList)
{
    include 'conn.php';

    $details = json_decode($json, true);
    $reqID = isset($details['reqID']) ? (int) $details['reqID'] : 0;
    $accID = isset($details['accID']) ? (int) $details['accID'] : 0;
    $selectedProducts = isset($details['selectedProducts']) && is_array($details['selectedProducts']) 
        ? array_map('intval', $details['selectedProducts']) 
        : [];

    if (empty($reqID) || empty($selectedProducts)) {
        unset($conn);
        return json_encode('Error: Missing required parameters');
    }

    try {
        $createTableSql = "CREATE TABLE IF NOT EXISTS `request_stock_selected_delivery` (
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
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci";

        $conn->exec($createTableSql);
        $conn->beginTransaction();

        $placeholders = implode(',', array_fill(0, count($selectedProducts), '?'));
        $getQuantitiesSql = "SELECT `product_id`, `qty` FROM `request_stock_details` 
            WHERE `request__stock_id` = ? AND `product_id` IN ($placeholders)";
        $getQuantitiesStmt = $conn->prepare($getQuantitiesSql);
        $getQuantitiesStmt->bindValue(1, $reqID, PDO::PARAM_INT);
        foreach ($selectedProducts as $idx => $prodId) {
            $getQuantitiesStmt->bindValue($idx + 2, $prodId, PDO::PARAM_INT); // Start at 2 because reqID is at position 1
        }
        $getQuantitiesStmt->execute();
        $quantities = $getQuantitiesStmt->fetchAll(PDO::FETCH_ASSOC);
        $quantityMap = [];
        foreach ($quantities as $qty) {
            $quantityMap[(int)$qty['product_id']] = (int)$qty['qty'];
        }
        unset($getQuantitiesStmt);

        $deleteSql = "DELETE FROM `request_stock_selected_delivery` 
            WHERE `request_stock_id` = :reqID AND `delivery_status` = 'Selected'";
        $deleteStmt = $conn->prepare($deleteSql);
        $deleteStmt->bindParam(':reqID', $reqID, PDO::PARAM_INT);
        $deleteStmt->execute();
        unset($deleteStmt);

        $insertSql = "INSERT INTO `request_stock_selected_delivery` 
            (`request_stock_id`, `product_id`, `quantity`, `selected_date`, `selected_by`, `delivery_status`) 
            VALUES (:reqID, :productId, :quantity, NOW(), :accID, 'Selected')
            ON DUPLICATE KEY UPDATE 
                `quantity` = :quantity2,
                `selected_date` = NOW(),
                `selected_by` = :accID2,
                `delivery_status` = 'Selected'";
        $insertStmt = $conn->prepare($insertSql);

        foreach ($selectedProducts as $productId) {
            $productId = (int) $productId;
            $quantity = isset($quantityMap[$productId]) ? $quantityMap[$productId] : 1;

            $insertStmt->bindValue(':reqID', $reqID, PDO::PARAM_INT);
            $insertStmt->bindValue(':productId', $productId, PDO::PARAM_INT);
            $insertStmt->bindValue(':quantity', $quantity, PDO::PARAM_INT);
            $insertStmt->bindValue(':accID', $accID, PDO::PARAM_INT);
            $insertStmt->bindValue(':quantity2', $quantity, PDO::PARAM_INT);
            $insertStmt->bindValue(':accID2', $accID, PDO::PARAM_INT);
            $insertStmt->execute();
        }

        unset($insertStmt);
        $conn->commit();
        unset($conn);
        return json_encode('Success');
    } catch (PDOException $e) {
        if (isset($conn) && $conn->inTransaction()) {
            $conn->rollBack();
        }
        error_log("SaveSelectedDeliveryItems - Error: " . $e->getMessage());
        if (isset($conn)) unset($conn);
        return json_encode('Error: ' . $e->getMessage());
    }
}

public function GetSelectedDeliveryItems($json, $requestList)
{
    include 'conn.php';

    $details = json_decode($json, true);
    $reqID = isset($details['reqID']) ? (int) $details['reqID'] : 0;

    try {
        $createTableSql = "CREATE TABLE IF NOT EXISTS `request_stock_selected_delivery` (
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
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci";

        $conn->exec($createTableSql);

        $sql = "SELECT 
                rsd.product_id,
                rsd.quantity as qty,
                rsd.selected_date,
                rsd.delivery_status,
                pd.product_name,
                pd.description,
                pd.price,
                pd.product_preview_image
            FROM `request_stock_selected_delivery` rsd
            JOIN `products` pd ON rsd.product_id = pd.product_id
            WHERE rsd.request_stock_id = :reqID 
            ORDER BY rsd.selected_date DESC";
        $stmt = $conn->prepare($sql);
        $stmt->bindParam(':reqID', $reqID, PDO::PARAM_INT);
        $stmt->execute();
        $result = $stmt->fetchAll(PDO::FETCH_ASSOC);

        unset($stmt);
        unset($conn);
        return json_encode($result);
    } catch (PDOException $e) {
        unset($conn);
        if (isset($stmt)) unset($stmt);
        return json_encode([]);
    }
}

public function UpdateSelectedDeliveryStatus($json, $requestList)
{
    include 'conn.php';

    $details = json_decode($json, true);
    $reqID = isset($details['reqID']) ? (int) $details['reqID'] : 0;
    $productIds = isset($details['productIds']) && is_array($details['productIds']) 
        ? array_map('intval', $details['productIds']) 
        : [];
    $status = isset($details['status']) ? trim($details['status']) : 'Delivered';

    if (empty($reqID) || empty($productIds)) {
        unset($conn);
        return json_encode('Error: Missing required parameters');
    }

    try {
        $conn->beginTransaction();

        $placeholders = implode(',', array_fill(0, count($productIds), '?'));
        $updateSql = "UPDATE `request_stock_selected_delivery` 
            SET `delivery_status` = :status 
            WHERE `request_stock_id` = :reqID 
            AND `product_id` IN ($placeholders)";
        $updateStmt = $conn->prepare($updateSql);
        $updateStmt->bindParam(':reqID', $reqID, PDO::PARAM_INT);
        $updateStmt->bindParam(':status', $status, PDO::PARAM_STR);
        foreach ($productIds as $idx => $prodId) {
            $updateStmt->bindValue($idx + 1, $prodId, PDO::PARAM_INT);
        }
        $updateStmt->execute();

        unset($updateStmt);
        $conn->commit();
        unset($conn);
        return json_encode('Success');
    } catch (PDOException $e) {
        if (isset($conn) && $conn->inTransaction()) {
            $conn->rollBack();
        }
        error_log("UpdateSelectedDeliveryStatus - Error: " . $e->getMessage());
        if (isset($conn)) unset($conn);
        return json_encode('Error: ' . $e->getMessage());
    }
}

