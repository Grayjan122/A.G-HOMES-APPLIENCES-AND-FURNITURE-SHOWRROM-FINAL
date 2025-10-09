<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

class User
{
    // login
    function GetInventory($json)
    {
        include 'conn.php';

        $json = json_decode($json, true);

        $locationID = isset($json['locID']) ? (int) $json['locID'] : 0;
        $orderBy = isset($json['stockLevel']) ? $json['stockLevel'] : '';
        $search = isset($json['search']) ? '%' . strtolower($json['search']) . '%' : '%';

        // Base SQL
        $sql = "SELECT a.store_inventory_id, a.product_id, b.product_name, b.description, b.price,b.product_preview_image ,b.color, a.qty, a.location_id, c.location_name, d.category_name
        FROM store_inventory a 
        JOIN products b ON a.product_id = b.product_id
        JOIN location c ON a.location_id = c.location_id 
        JOIN category d ON b.category_id = d.category_id
        WHERE (
            LOWER(b.product_name) LIKE :search 
            OR LOWER(b.description) LIKE :search
        )";

        // Add location filter if locationID > 0
        if ($locationID > 0) {
            $sql .= " AND a.location_id = :locationID";
        }

        // Add qty filter + ORDER BY
        if ($orderBy == 'High') {
            $sql .= " AND a.qty > 0 ORDER BY c.location_name ASC, b.description ASC";
        } elseif ($orderBy == 'Low') {
            $sql .= " AND a.qty < 1 ORDER BY c.location_name ASC, b.description ASC";
        } else {
            $sql .= " ORDER BY c.location_name ASC, b.description ASC";
        }


        $stmt = $conn->prepare($sql);

        // Bind common search param
        $stmt->bindParam(':search', $search, PDO::PARAM_STR);

        // Bind locationID only if it's used
        if ($locationID > 0) {
            $stmt->bindParam(':locationID', $locationID, PDO::PARAM_INT);
        }

        $stmt->execute();
        $returnValue = $stmt->fetchAll(PDO::FETCH_ASSOC);

        unset($conn);
        unset($stmt);

        return json_encode($returnValue);
    }

    function GetStockOut($json)
    {
        include 'conn.php';

        $json = json_decode($json, true);

        $locationID = isset($json['locID']) ? (int) $json['locID'] : 0;


        $sql = "SELECT a.store_inventory_id, a.location_id, a.product_id, a.qty, b.product_name, b.description FROM store_inventory a 
                    INNER JOIN products b ON a.product_id = b.product_id
                    WHERE a.location_id = :locID AND a.qty = 0
                    ORDER BY b.description;";


        $stmt = $conn->prepare($sql);
        $stmt->bindParam(':locID', $locationID, PDO::PARAM_STR);



        $stmt->execute();
        $returnValue = $stmt->fetchAll(PDO::FETCH_ASSOC);

        unset($conn);
        unset($stmt);

        return json_encode($returnValue);
    }

    function GetInventoryReport($json)
    {
        include 'conn.php';

        $json = json_decode($json, true);

        $locationID = isset($json['locID']) ? (int) $json['locID'] : 0;
        $prodID = isset($json['prodID']) ? (int) $json['prodID'] : 0;

        $sql = "SELECT 
                a.`sir_id`, 
                a.`location_id`, 
                d.location_name, 
                a.`type`, 
                a.`product_id`, 
                b.product_name, 
                b.description,  
                a.`past_balance`, 
                a.`qty`, 
                a.`current_balance`, 
                a.`date`, 
                a.`time`, 
                a.`account_id`, 
                c.fname, 
                c.mname, 
                c.lname
            FROM `store_inventory_transaction_ledger` a
            INNER JOIN products b ON a.product_id = b.product_id
            INNER JOIN account c ON a.account_id = c.account_id
            INNER JOIN location d ON a.location_id = d.location_id";

        // Collect conditions
        $conditions = [];
        if ($prodID > 0) {
            $conditions[] = "a.product_id = :prodID";
        }
        if ($locationID > 0) {
            $conditions[] = "a.location_id = :locID";
        }

        // Apply conditions
        if (!empty($conditions)) {
            $sql .= " WHERE " . implode(" AND ", $conditions);
        }

        $sql .= " ORDER BY a.sir_id DESC";

        $stmt = $conn->prepare($sql);

        // Bind parameters only if used
        if ($prodID > 0) {
            $stmt->bindParam(':prodID', $prodID, PDO::PARAM_INT);
        }
        if ($locationID > 0) {
            $stmt->bindParam(':locID', $locationID, PDO::PARAM_INT);
        }

        $stmt->execute();
        $returnValue = $stmt->fetchAll(PDO::FETCH_ASSOC);

        unset($conn);
        unset($stmt);

        return json_encode($returnValue);
    }

     function GetInventoryReport1($json)
    {
        include 'conn.php';

        $json = json_decode($json, true);

       
        $sql = "SELECT 
                a.`sir_id`, 
                a.`location_id`, 
                d.location_name, 
                a.`type`, 
                a.`product_id`, 
                b.product_name, 
                b.description,  
                a.`past_balance`, 
                a.`qty`, 
                a.`current_balance`, 
                a.`date`, 
                a.`time`, 
                a.`account_id`, 
                c.fname, 
                c.mname, 
                c.lname
            FROM `store_inventory_transaction_ledger` a
            INNER JOIN products b ON a.product_id = b.product_id
            INNER JOIN account c ON a.account_id = c.account_id
            INNER JOIN location d ON a.location_id = d.location_id";

        // Collect conditions
       

        $sql .= " ORDER BY a.sir_id DESC";

        $stmt = $conn->prepare($sql);

        $stmt->execute();
        $returnValue = $stmt->fetchAll(PDO::FETCH_ASSOC);

        unset($conn);
        unset($stmt);

        return json_encode($returnValue);
    }


    function StockIn($json, $updatedInventory, $newInventory, $reportInventory)
    {
        include 'conn.php';
        //recive a stock from request to warehouse

        $oldProduct = json_decode($updatedInventory, true);
        $newProduct = json_decode($newInventory, true);
        $report = json_decode($reportInventory, true);
        $json = json_decode($json, true);

        // $transferID = isset($json['transID']) ? (int) $json['transID'] : 0;
        // $dtID = isset($json['dtID']) ? (int) $json['dtID'] : 0;
        $requestID = isset($json['reqID']) ? (int) $json['reqID'] : 0;
        $accountID = isset($json['accID']) ? (int) $json['accID'] : 0;
        $locationID = isset($json['locID']) ? (int) $json['locID'] : 0;


        $date = date("Y-m-d");
        // $time = date("H:i");


        // return json_encode($oldProduct);

        try {

            //5
            if (!empty($oldProduct)) {
                foreach ($oldProduct as $item) {
                    $sql = "UPDATE `store_inventory` 
                        SET qty = :qty 
                        WHERE location_id = :storeID AND product_id = :productID";
                    $stmt = $conn->prepare($sql);
                    $stmt->bindParam(':qty', $item['qty'], PDO::PARAM_INT);
                    $stmt->bindParam(':storeID', $locationID, PDO::PARAM_INT);
                    $stmt->bindParam(':productID', $item['product_id'], PDO::PARAM_INT);
                    $stmt->execute();
                }
            }

            // 6 - Insert new products into store_inventory
            if (!empty($newProduct)) {
                foreach ($newProduct as $item) {
                    $sql = "INSERT INTO `store_inventory` (location_id, product_id, qty)
                VALUES (:storeID, :productID, :qty)";
                    $stmt = $conn->prepare($sql);
                    $stmt->bindParam(':storeID', $locationID, PDO::PARAM_INT);
                    $stmt->bindParam(':productID', $item['product_id'], PDO::PARAM_INT);
                    $stmt->bindParam(':qty', $item['qty'], PDO::PARAM_INT);
                    $stmt->execute();
                }
            }

            // 7 - Record ledger report
            if (!empty($report)) {
                foreach ($report as $item) {
                    $sql = "INSERT INTO `store_inventory_transaction_ledger` (
                    `location_id`, `type`, `product_id`, `past_balance`, `qty`, `current_balance`, `date`, `time`, `account_id`
                ) VALUES (
                    :storeID, 'Stock In', :productID, :pastBal, :qty, :currentBal, :date, :time, :accID
                )";
                    $stmt = $conn->prepare($sql);
                    $stmt->bindParam(':storeID', $locationID, PDO::PARAM_INT);
                    $stmt->bindParam(':productID', $item['prodID'], PDO::PARAM_INT);
                    $stmt->bindParam(':pastBal', $item['pastBalance'], PDO::PARAM_INT);
                    $stmt->bindParam(':qty', $item['qty'], PDO::PARAM_INT);
                    $stmt->bindParam(':currentBal', $item['currentBalance'], PDO::PARAM_INT);
                    $stmt->bindParam(':date', $date);
                    $stmt->bindParam(':time', $time);
                    $stmt->bindParam(':accID', $accountID, PDO::PARAM_INT);
                    $stmt->execute();
                }
            }

            // 8. Stock receiving report
            $itemCount = 0;
            foreach ($report as $item) {
                $itemCount += $item['qty'];
            }

            $sql = "INSERT INTO `stock_receiving`(
                    `transaction_date`, `total_item`, `report`, `account_id`, `location_id`
                ) VALUES (
                    :date, :totalItem, 'Stock In From Delivery' , :accID, :locID
                )";
            $stmt = $conn->prepare($sql);
            $stmt->bindParam(':date', $date);
            $stmt->bindParam(':totalItem', $itemCount, PDO::PARAM_INT);
            $stmt->bindParam(':accID', $accountID, PDO::PARAM_INT);
            $stmt->bindParam(':locID', $locationID, PDO::PARAM_INT);
            $stmt->execute();
            $lastID1 = $conn->lastInsertId();

            // 9. Stock receiving details
            foreach ($report as $item) {
                $sql = "INSERT INTO `stock_receiving_details`(
                        `stock_receiving_id`, `product_id`, `qty`
                    ) VALUES (
                        :srID, :prodID , :qty
                    )";
                $stmt = $conn->prepare($sql);
                $stmt->bindParam(':srID', $lastID1, PDO::PARAM_INT);
                $stmt->bindParam(':prodID', $item['prodID'], PDO::PARAM_INT);
                $stmt->bindParam(':qty', $item['qty'], PDO::PARAM_INT);
                $stmt->execute();
            }


            $returnValue = "Success";
        } catch (PDOException $e) {
            $returnValue = "Error: " . $e->getMessage();
        }

        unset($conn);
        unset($stmt);
        return json_encode($returnValue);
    }





}

// submitted by the client - operation and json data
if ($_SERVER['REQUEST_METHOD'] == 'GET') {
    $operation = $_GET['operation'];
    $json = $_GET['json'];
    $updatedInventory = $_GET['updatedInventory'] ?? '[]';
    $newInventory = $_GET['newInventory'] ?? '[]';
    $reportInventory = $_GET['reportInventory'] ?? '[]';

} else if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $operation = $_POST['operation'];
    $json = $_POST['json'];
    $updatedInventory = $_POST['updatedInventory'] ?? '[]';
    $newInventory = $_POST['newInventory'] ?? '[]';
    $reportInventory = $_POST['reportInventory'] ?? '[]';
}

$user = new User();
switch ($operation) {
    case 'GetInventory':
        echo $user->GetInventory($json);
        break;
     case 'GetInventoryReport1':
        echo $user->GetInventoryReport1($json);
        break;
    case 'GetStockOut':
        echo $user->GetStockOut($json);
        break;
    case 'GetInventoryReport':
        echo $user->GetInventoryReport($json);
        break;
    case 'StockIn':
        echo $user->StockIn($json, $updatedInventory, $newInventory, $reportInventory);
        break;
}
?>