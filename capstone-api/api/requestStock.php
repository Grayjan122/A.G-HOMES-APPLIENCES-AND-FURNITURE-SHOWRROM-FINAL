<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
date_default_timezone_set('Asia/Manila');

class User
{
    public function SendRequest($json, $requestList)
    {
        include 'conn.php';

        $details = json_decode($json, true);            // Location details
        $items = json_decode($requestList, true);       // Product list
        $date = date("Y-m-d");

        try {
            // Insert into request_stock table
            $sql = "INSERT INTO `request_stock` (`request_from`, `request_to`, `date`, `request_status`, `request_by`) 
                    VALUES (:requestFrom, :requestTo, :date, 'Pending', :requestBy)";
            $stmt = $conn->prepare($sql);
            $stmt->bindParam(':requestFrom', $details['reqFrom']);
            $stmt->bindParam(':requestTo', $details['reqTo']);
            $stmt->bindParam(':date', $date);
            $stmt->bindParam(':requestBy', $details['reqBy']);
            $stmt->execute();

            // Get the last inserted request_stock_id
            $lastId = $conn->lastInsertId();


            $sql = "INSERT INTO `request_reports`(
                    `request_stock_id`, `date`, `time`, `status`, `account_id`
                ) VALUES (
                    :tsID, :date, :time, 'Request Sent', :accID
                )";
            $stmt = $conn->prepare($sql);
            $stmt->bindValue(':tsID', $lastId);
            $stmt->bindValue(':date', $date);
            $stmt->bindValue(':time', $time);
            $stmt->bindValue(':accID', $details['reqBy']);
            $stmt->execute();

            // Insert each product into request_stock_details
            $sql = "INSERT INTO request_stock_details (request__stock_id, product_id, qty) VALUES (?, ?, ?)";
            $stmt = $conn->prepare($sql);

            foreach ($items as $product) {
                $productId = $product['product_id'];
                $qty = $product['qty'];
                $stmt->execute([$lastId, $productId, $qty]);
            }

            $returnValue = 'Success';


        } catch (PDOException $e) {
            $returnValue = 'Error: ' . $e->getMessage();

        }

        unset($stmt);
        unset($conn);

        return json_encode($returnValue);
    }

    public function GetRequest($json, $requestList)
    {
        include 'conn.php';

        $json = json_decode($json, true);

        $locationID = isset($json['locID']) ? (int) $json['locID'] : 0;
        $status = $json['status'];
        $reqT = $json['reqType'];




        $sql = "SELECT             
                    a.request_stock_id, 
                    a.request_from, 
                    fromLoc.location_name AS reqFrom,
                    a.request_to, 
                    toLoc.location_name AS reqTo,
                    a.date, 
                    a.request_status, 
                    a.request_by,
                    reqBy.fname,
                    reqBy.mname,
                    reqBy.lname
                FROM request_stock AS a 
                INNER JOIN location AS fromLoc 
                    ON a.request_from = fromLoc.location_id
                INNER JOIN location AS toLoc 
                    ON a.request_to = toLoc.location_id			
                INNER JOIN account AS reqBy 
                    ON a.request_by = reqBy.account_id";

        if ($reqT == 'ReqTo') {
            $sql .= " WHERE a.request_to = :locID";
        } else if ($reqT == 'ReqFrom' && $locationID) {
            $sql .= " WHERE a.request_from = :locID";
        } else {

        }

        if ($status == "Pending") {
            $sql .= " AND a.request_status = 'Pending'";
        } else if ($status == "Complete") {
            $sql .= " AND a.request_status = 'Complete'";
        } else if ($status == "Delivered") {
            $sql .= " AND a.request_status = 'Delivered'";
        } else if ($status == "On Going") {
            $sql .= " AND a.request_status = 'On Going'";
        } else if ($status == "On Delivery") {
            $sql .= " AND a.request_status = 'On Delivery'";
        } else if ($status == "OnGoing") {
            $sql .= " AND a.request_status NOT IN ('Pending', 'Ready To Deliver', 'Complete')";
        }

        $sql .= " ORDER BY a.request_stock_id ASC";

        $stmt = $conn->prepare($sql);

        if ($reqT && $locationID) {
            $stmt->bindParam(':locID', $locationID, PDO::PARAM_STR);

        }





        $stmt->execute();
        $returnValue = $stmt->fetchAll(PDO::FETCH_ASSOC);

        unset($conn);
        unset($stmt);

        return json_encode($returnValue);
    }

     public function GetCompletedRequest($json, $requestList)
    {
        include 'conn.php';

        $json = json_decode($json, true);

        $locationID = isset($json['locID']) ? (int) $json['locID'] : 0;
        $status = $json['status'];
        // $reqT = $json['reqType'];




        $sql = "SELECT             
                    a.request_stock_id, 
                    a.request_from, 
                    fromLoc.location_name AS reqFrom,
                    a.request_to, 
                    toLoc.location_name AS reqTo,
                    a.date, 
                    a.request_status, 
                    a.request_by,
                    reqBy.fname,
                    reqBy.mname,
                    reqBy.lname
                FROM request_stock AS a 
                INNER JOIN location AS fromLoc 
                    ON a.request_from = fromLoc.location_id
                INNER JOIN location AS toLoc 
                    ON a.request_to = toLoc.location_id			
                INNER JOIN account AS reqBy 
                    ON a.request_by = reqBy.account_id
                    WHERE a.request_status = 'Complete'
                    ORDER BY a.request_stock_id DESC";

       

        // $sql .= " ORDER BY a.request_stock_id ASC";

        $stmt = $conn->prepare($sql);

      




        $stmt->execute();
        $returnValue = $stmt->fetchAll(PDO::FETCH_ASSOC);

        unset($conn);
        unset($stmt);

        return json_encode($returnValue);
    }

    public function GetRequest2($json, $requestList)
    {
        include 'conn.php';

        $json = json_decode($json, true);

        $locationID = isset($json['locID']) ? (int) $json['locID'] : 0;
        $status = $json['status'];
        $reqT = $json['reqType'];




        $sql = "SELECT
                    d.request_approved_id, 
                    a.request_stock_id, 
                    a.request_from, 
                    fromLoc.location_name AS reqFrom,
                    a.request_to, 
                    toLoc.location_name AS reqTo,
                    a.date, 
                    a.request_status, 
                    a.request_by,
                    reqBy.fname,
                    reqBy.mname,
                    reqBy.lname
                FROM request_approved AS d
                INNER JOIN request_stock AS a 
                    ON d.request_stock_id = a.request_stock_id
                INNER JOIN location AS fromLoc 
                    ON a.request_from = fromLoc.location_id
                INNER JOIN location AS toLoc 
                    ON a.request_to = toLoc.location_id			
                INNER JOIN account AS reqBy 
                    ON a.request_by = reqBy.account_id";

        if ($reqT == 'ReqTo') {
            $sql .= " WHERE a.request_to = :locID";
        } else {
            $sql .= " WHERE a.request_from = :locID";
        }

        if ($status == "Pending") {
            $sql .= " AND a.request_status = 'Pending'";
        } else if ($status == "Approved") {
            $sql .= " AND a.request_status = 'Approved'";
        } else if ($status == "OnGoing") {
            $sql .= " AND a.request_status NOT IN ('Pending', 'On Delivery', 'Complete', 'Delivered')";
        } else if ($status == "OnDeliver") {
            $sql .= " AND a.request_status = 'On Deliver'";
        }

        $sql .= " ORDER BY d.request_approved_id ASC";

        $stmt = $conn->prepare($sql);
        $stmt->bindParam(':locID', $locationID, PDO::PARAM_STR);





        $stmt->execute();
        $returnValue = $stmt->fetchAll(PDO::FETCH_ASSOC);

        unset($conn);
        unset($stmt);

        return json_encode($returnValue);
    }

    public function GetRequest3($json, $requestList)
    {
        include 'conn.php';

        $json = json_decode($json, true);

        $locationID = isset($json['locID']) ? (int) $json['locID'] : 0;
        $status = $json['status'];
        $reqT = $json['reqType'];




        $sql = "SELECT
                    d.request_approved_id, 
                    a.request_stock_id, 
                    a.request_from, 
                    fromLoc.location_name AS reqFrom,
                    a.request_to, 
                    toLoc.location_name AS reqTo,
                    a.date, 
                    a.request_status, 
                    a.request_by,
                    reqBy.fname,
                    reqBy.mname,
                    reqBy.lname,
                    e.fname AS F,
                    e.mname AS M,
                    e.lname AS L
                FROM request_approved AS d
                INNER JOIN request_stock AS a 
                    ON d.request_stock_id = a.request_stock_id
                INNER JOIN location AS fromLoc 
                    ON a.request_from = fromLoc.location_id
                INNER JOIN location AS toLoc 
                    ON a.request_to = toLoc.location_id			
                INNER JOIN account AS reqBy 
                    ON a.request_by = reqBy.account_id
                INNER JOIN request_deliver f ON a.request_stock_id = f.request_stock_id
                INNER JOIN account e ON f.account_id = e.account_id";

        if ($reqT == 'ReqTo') {
            $sql .= " WHERE a.request_to = :locID";
        } else if ($reqT == 'ReqFrom' && $locationID > 0) {
            $sql .= " WHERE a.request_from = :locID";
        }

        if ($status == "Pending") {
            $sql .= " AND a.request_status = 'Pending'";
        } else if ($status == "Approved") {
            $sql .= " AND a.request_status = 'Approved'";
        } else if ($status == "OnGoing") {
            $sql .= " AND a.request_status NOT IN ('Pending', 'On Deliver', 'Completed')";
        } else if ($status == "OnDeliver") {
            $sql .= " AND a.request_status = 'On Delivery'";
        }

        $sql .= " ORDER BY d.request_approved_id ASC";

        $stmt = $conn->prepare($sql);
        if ($locationID > 0) {
            $stmt->bindParam(':locID', $locationID, PDO::PARAM_STR);

        }





        $stmt->execute();
        $returnValue = $stmt->fetchAll(PDO::FETCH_ASSOC);

        unset($conn);
        unset($stmt);

        return json_encode($returnValue);
    }
    public function GetRequestD($json, $requestList)
    {
        include 'conn.php';

        $json = json_decode($json, true);

        $locationID = isset($json['locID']) ? (int) $json['locID'] : 0;
        $requestID = isset($json['reqID']) ? (int) $json['reqID'] : 0;



        $sql = "SELECT 
                a.request_stock_id, 
                a.request_from, 
                fromLoc.location_name AS reqFrom,
                a.request_to, 
                toLoc.location_name AS reqTo,
                a.date, 
                a.request_status, 
                a.request_by,
                reqBY.fname,
                reqBY.mname,
                reqBY.lname   
                FROM 
                request_stock a
                INNER JOIN location AS fromLoc ON a.request_from = fromLoc.location_id
                INNER JOIN location AS toLoc ON a.request_to = toLoc.location_id			
                INNER JOIN account AS reqBy ON a.request_by = reqBy.account_id
                WHERE a.request_stock_id = :reqID";


        $stmt = $conn->prepare($sql);
        // $stmt->bindParam(':locID', $locationID, PDO::PARAM_STR);
        $stmt->bindParam(':reqID', $requestID, PDO::PARAM_STR);




        $stmt->execute();
        $returnValue = $stmt->fetchAll(PDO::FETCH_ASSOC);

        unset($conn);
        unset($stmt);

        return json_encode($returnValue);
    }
    public function GetRequestD3($json, $requestList)
    {
        include 'conn.php';

        $json = json_decode($json, true);

        $locationID = isset($json['locID']) ? (int) $json['locID'] : 0;
        $requestID = isset($json['reqID']) ? (int) $json['reqID'] : 0;



        $sql = "SELECT 
                a.request_stock_id, 
                a.request_from, 
                fromLoc.location_name AS reqFrom,
                a.request_to, 
                toLoc.location_name AS reqTo,
                a.date, 
                a.request_status, 
                a.request_by,
                reqBY.fname,
                reqBY.mname,
                reqBY.lname
                FROM 
                request_stock a
                INNER JOIN location AS fromLoc ON a.request_from = fromLoc.location_id
                INNER JOIN location AS toLoc ON a.request_to = toLoc.location_id			
                INNER JOIN account AS reqBy ON a.request_by = reqBy.account_id
                WHERE a.request_stock_id = :reqID";


        $stmt = $conn->prepare($sql);
        // $stmt->bindParam(':locID', $locationID, PDO::PARAM_STR);
        $stmt->bindParam(':reqID', $requestID, PDO::PARAM_STR);




        $stmt->execute();
        $returnValue = $stmt->fetchAll(PDO::FETCH_ASSOC);

        unset($conn);
        unset($stmt);

        return json_encode($returnValue);
    }

    public function GetRequestD2($json, $requestList)
    {
        include 'conn.php';

        $json = json_decode($json, true);

        $locationID = isset($json['locID']) ? (int) $json['locID'] : 0;
        $requestID = isset($json['reqID']) ? (int) $json['reqID'] : 0;



        $sql = "SELECT
                    d.request_approved_id, 
                    a.request_stock_id, 
                    a.request_from, 
                    fromLoc.location_name AS reqFrom,
                    a.request_to, 
                    toLoc.location_name AS reqTo,
                    a.date, 
                    a.request_status, 
                    a.request_by,
                    reqBy.fname,
                    reqBy.mname,
                    reqBy.lname,
                    e.fname AS F,
                    e.mname AS M,
                    e.lname AS L
                FROM request_approved AS d
                INNER JOIN request_stock AS a 
                    ON d.request_stock_id = a.request_stock_id
                INNER JOIN location AS fromLoc 
                    ON a.request_from = fromLoc.location_id
                INNER JOIN location AS toLoc 
                    ON a.request_to = toLoc.location_id			
                INNER JOIN account AS reqBy 
                    ON a.request_by = reqBy.account_id
                INNER JOIN request_deliver f ON a.request_stock_id = f.request_stock_id
                INNER JOIN account e ON f.account_id = e.account_id
                WHERE a.request_stock_id = :reqID";


        $stmt = $conn->prepare($sql);
        // $stmt->bindParam(':locID', $locationID, PDO::PARAM_STR);
        $stmt->bindParam(':reqID', $requestID, PDO::PARAM_STR);




        $stmt->execute();
        $returnValue = $stmt->fetchAll(PDO::FETCH_ASSOC);

        unset($conn);
        unset($stmt);

        return json_encode($returnValue);
    }

    public function GetRequestDetails($json, $requestList)
    {
        include 'conn.php';

        $json = json_decode($json, true);

        // $locationID = isset($json['locID']) ? (int) $json['locID'] : 0;
        $requestID = isset($json['reqID']) ? (int) $json['reqID'] : 0;



        $sql = "SELECT a.request_stock__details_id, a.request__stock_id, a.product_id, a.qty, b.product_name, b.description 
                    FROM request_stock_details a 
                    INNER JOIN products b ON a.product_id = b.product_id WHERE a.request__stock_id = :reqID";


        $stmt = $conn->prepare($sql);
        // $stmt->bindParam(':locID', $locationID, PDO::PARAM_STR);
        $stmt->bindParam(':reqID', $requestID, PDO::PARAM_STR);




        $stmt->execute();
        $returnValue = $stmt->fetchAll(PDO::FETCH_ASSOC);

        unset($conn);
        unset($stmt);

        return json_encode($returnValue);
    }
    public function ApproveRequest($json, $transferList, $unavailList, $inventoryReportList)
    {
        include 'conn.php';

        $details = json_decode($json, true);
        $transferProd = json_decode($transferList, true);
        $notAvailProd = json_decode($unavailList, true);
        $updatedInventory = json_decode($inventoryReportList, true);

        $date = date("Y-m-d");
        // $time = date("H:i");

        try {
            // Begin transaction
            $conn->beginTransaction();

            // 1. Insert into request_approved working
            $sql = "INSERT INTO `request_approved` (`request_stock_id`, `approved_by`, `date`) 
                VALUES (:reqID, :accID, :date)";
            $stmt = $conn->prepare($sql);
            $stmt->bindValue(':reqID', $details['reqID']);
            $stmt->bindValue(':accID', $details['accID']);
            $stmt->bindValue(':date', $date);
            $stmt->execute();

            // 2. Update request_stock status working
            $sql = "UPDATE `request_stock` 
                SET `request_status`='Approved' 
                WHERE request_stock_id = :reqID";
            $stmt = $conn->prepare($sql);
            $stmt->bindValue(':reqID', $details['reqID']);
            $stmt->execute();

            // 3. Insert into transfer_stock working
            $sql = "INSERT INTO `transfer_stock`(
                    `request_stock_id`, `location_id_sender`, `location_id_receiver`, `date`, `current_status`, `account_id`
                ) VALUES (
                    :reqID, :sendFrom, :sendTo, :date, 'Approved', :accountID)";
            $stmt = $conn->prepare($sql);
            $stmt->bindValue(':reqID', $details['reqID']);
            $stmt->bindValue(':sendFrom', $details['reqToID']);
            $stmt->bindValue(':sendTo', $details['reqFromID']);
            $stmt->bindValue(':date', $date);
            $stmt->bindValue(':accountID', $details['accID']);
            $stmt->execute();
            $lastId = $conn->lastInsertId();

            // 4. Insert into transfer_stock_details working
            $sql = "INSERT INTO `transfer_stock_details`(`ts_id`, `product_id`, `qty`) 
                VALUES (?, ?, ?)";
            $stmt = $conn->prepare($sql);
            foreach ($transferProd as $product) {
                $stmt->execute([$lastId, $product['product_id'], $product['qty']]);
            }

            // // 5. Insert unavailable products
            if (!empty($notAvailProd)) {
                $sql = "INSERT INTO `unavailable_products`(`ts_id`, `product_id`) 
                    VALUES (?, ?)";
                $stmt = $conn->prepare($sql);
                foreach ($notAvailProd as $u) {
                    $stmt->execute([$lastId, $u['product_id']]);
                }
            }

            // 6. Update store_inventory not working
            $sql = "UPDATE `store_inventory` 
                SET `qty` = :newQty 
                WHERE product_id = :prodID AND location_id = :locID";
            $stmt = $conn->prepare($sql);

            foreach ($updatedInventory as $p) {
                if (!isset($p['prodID'], $p['currentBalance']))
                    continue;

                $stmt->bindValue(':newQty', $p["currentBalance"], PDO::PARAM_INT);
                $stmt->bindValue(':prodID', $p["prodID"], PDO::PARAM_INT);
                $stmt->bindValue(':locID', $details['reqToID'], PDO::PARAM_INT);
                $stmt->execute();
            }

            // 7. Insert into ledger not working
            $sql = "INSERT INTO `store_inventory_transaction_ledger` (
            `location_id`, `type`, `product_id`, `past_balance`, 
            `qty`, `current_balance`, `date`, `time`, `account_id`
                ) VALUES (
                    :locID, 'Transfer Out', :prodID, :pastBalance, :qty, 
                    :currentBalance, :date, :time, :accID
                )";
            $stmt = $conn->prepare($sql);

            foreach ($updatedInventory as $p) {
                if (!isset($p['prodID'], $p['pastBalance'], $p['qty'], $p['currentBalance']))
                    continue;

                $stmt->bindValue(':locID', $details['reqToID'], PDO::PARAM_INT);
                $stmt->bindValue(':prodID', $p["prodID"], PDO::PARAM_INT);
                $stmt->bindValue(':pastBalance', $p["pastBalance"], PDO::PARAM_INT);
                $stmt->bindValue(':qty', $p["qty"], PDO::PARAM_INT);
                $stmt->bindValue(':currentBalance', $p["currentBalance"], PDO::PARAM_INT);
                $stmt->bindValue(':date', $date);
                $stmt->bindValue(':time', $time);
                $stmt->bindValue(':accID', $details['accID'], PDO::PARAM_INT);
                $stmt->execute();
            }


            // 8. Insert into transfer_stock_reports  working
            $sql = "INSERT INTO `transfer_stock_reports`(
                    `ts_id`, `date`, `time`, `status`, `account_id`
                ) VALUES (
                    :tsID, :date, :time, 'Ready To Deliver', :accID
                )";
            $stmt = $conn->prepare($sql);
            $stmt->bindValue(':tsID', $lastId);
            $stmt->bindValue(':date', $date);
            $stmt->bindValue(':time', $time);
            $stmt->bindValue(':accID', $details['accID']);
            $stmt->execute();

            // Commit everything
            $conn->commit();
            $returnValue = 'Success';
            // $returnValue = [
            //     'updatedInventory' => $updatedInventory,
            //     'transferList' => $transferProd,
            //     'details' => $details,
            //     'notAvail' => $notAvailProd
            // ];

        } catch (PDOException $e) {
            // Rollback on error
            $conn->rollBack();
            $returnValue = 'Error: ' . $e->getMessage();
        }

        unset($stmt);
        unset($conn);

        return json_encode($returnValue);
    }

    public function AcceptRequestWR($json, $transferList, $unavailList, $inventoryReportList)
    {
        include 'conn.php';

        $details = json_decode($json, true);
        $transferProd = json_decode($transferList, true);
        $notAvailProd = json_decode($unavailList, true);
        $updatedInventory = json_decode($inventoryReportList, true);

        $date = date("Y-m-d");
        // $time = date("H:i");

        try {
            // Begin transaction
            $conn->beginTransaction();

            // 1. Insert into request_approved working
            $sql = "INSERT INTO `request_approved` (`request_stock_id`, `approved_by`, `date`) 
                VALUES (:reqID, :accID, :date)";
            $stmt = $conn->prepare($sql);
            $stmt->bindValue(':reqID', $details['reqID']);
            $stmt->bindValue(':accID', $details['accID']);
            $stmt->bindValue(':date', $date);
            $stmt->execute();

            // 2. Update request_stock status working
            $sql = "UPDATE `request_stock` 
                SET `request_status`='On Going' 
                WHERE request_stock_id = :reqID";
            $stmt = $conn->prepare($sql);
            $stmt->bindValue(':reqID', $details['reqID']);
            $stmt->execute();



            // 3 Insert into transfer_stock_reports  working
            $sql = "INSERT INTO `request_reports`(
                    `request_stock_id`, `date`, `time`, `status`, `account_id`
                ) VALUES (
                    :tsID, :date, :time, 'On Going', :accID
                )";
            $stmt = $conn->prepare($sql);
            $stmt->bindValue(':tsID', $details['reqID']);
            $stmt->bindValue(':date', $date);
            $stmt->bindValue(':time', $time);
            $stmt->bindValue(':accID', $details['accID']);
            $stmt->execute();

            // Commit everything
            $conn->commit();
            $returnValue = 'Success';
            // $returnValue = [
            //     'updatedInventory' => $updatedInventory,
            //     'transferList' => $transferProd,
            //     'details' => $details,
            //     'notAvail' => $notAvailProd
            // ];

        } catch (PDOException $e) {
            // Rollback on error
            $conn->rollBack();
            $returnValue = 'Error: ' . $e->getMessage();
        }

        unset($stmt);
        unset($conn);

        return json_encode($returnValue);
    }

    public function DeliverStock($json, $requestList)
    {
        include 'conn.php';

        $details = json_decode($json, true);     // Location details
        $items = json_decode($requestList, true); // Product list
        $date = date("Y-m-d");
        // $time = date("H:i:s");

        try {
            // 1. Update the request status
            $sql = "UPDATE `request_stock` 
                SET `request_status` = 'On Delivery' 
                WHERE `request_stock_id` = :reqID";
            $stmt = $conn->prepare($sql);
            $stmt->bindParam(':reqID', $details['reqID']);
            $stmt->execute();

            // 2. Insert into request_reports
            $sql = "INSERT INTO `request_reports` 
                    (`request_stock_id`, `date`, `time`, `status`, `account_id`) 
                VALUES (:reqID, :date, :time, 'On Delivery', :accID)";
            $stmt = $conn->prepare($sql);
            $stmt->bindParam(':reqID', $details['reqID']);
            $stmt->bindParam(':date', $date);
            $stmt->bindParam(':time', $time);
            $stmt->bindParam(':accID', $details['accID']);
            $stmt->execute();

            // 3. Insert into request_deliver
            $sql = "INSERT INTO `request_deliver` 
                    (`request_stock_id`, `date`, `delivery_status`, `account_id`) 
                VALUES (:reqID, :date, 'On Delivery', :accID)";
            $stmt = $conn->prepare($sql);
            $stmt->bindParam(':reqID', $details['reqID']);
            $stmt->bindParam(':date', $date);
            $stmt->bindParam(':accID', $details['driverID']);
            $stmt->execute();

            $returnValue = 'Success';

        } catch (PDOException $e) {
            $returnValue = 'Error: ' . $e->getMessage();
        }

        unset($stmt);
        unset($conn);

        return json_encode($returnValue);
    }

    public function GetReqDelivery($json, $requestList)
    {
        include 'conn.php';

        $details = json_decode($json, true);     // Location details
        $items = json_decode($requestList, true); // Product list
        $date = date("Y-m-d");
        // $time = date("H:i:s");

        $sql = "SELECT a.`r_deliver_id`, a.`request_stock_id`, a.`date`, a.`delivery_status`, 
                            a.`account_id`, b.fname, b.mname, b.lname, c.request_from, d.location_name AS 'reqFrom',
                    c.request_to, e.location_name AS 'reqTo',
                    c.request_by, f.fname AS 'firstName', f.mname AS 'middleName', f.lname AS 'lastName'               
                    FROM `request_deliver` a INNER JOIN account b ON a.account_id = b.account_id
                    INNER JOIN request_stock c ON a.request_stock_id = c.request_stock_id
                    INNER JOIN location d ON d.location_id = c.request_from
                    INNER JOIN location e ON c.request_to = e.location_id
                    INNER JOIN account f ON c.request_by = f.account_id
                    WHERE a.delivery_status != 'Complete' 
                    AND c.request_to = :locID
                    ORDER BY a.r_deliver_id ASC";

        $stmt = $conn->prepare($sql);
        $stmt->bindParam(':locID', $details['locID'] , PDO::PARAM_INT);
        $stmt->execute();
        $returnValue = $stmt->fetchAll(PDO::FETCH_ASSOC);

        unset($conn);
        unset($stmt);

        return json_encode($returnValue);
    }


    public function GetReqDateAndTime($json, $requestList)
    {
        include 'conn.php';

        $details = json_decode($json, true); // Location details

        // Make sure your $details or $requestList contain reqID and status
        $reqID = $details['reqID'] ?? null;
        $status = $details['status'] ?? null;

        if (!$reqID || !$status) {
            return json_encode([
                "error" => "Missing required parameters (reqID or status)."
            ]);
        }

        $sql = "SELECT * FROM `request_reports` 
            WHERE request_stock_id = :reqID 
            AND status = :status;";

        $stmt = $conn->prepare($sql);
        $stmt->bindParam(':reqID', $reqID, PDO::PARAM_INT);
        $stmt->bindParam(':status', $status, PDO::PARAM_STR);

        $stmt->execute();
        $returnValue = $stmt->fetchAll(PDO::FETCH_ASSOC);

        unset($conn);
        unset($stmt);

        return json_encode($returnValue);
    }







}

// Handle input
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $operation = $_GET['operation'] ?? '';
    $json = $_GET['json'] ?? '{}';
    $requestList = $_GET['requestList'] ?? '[]';

    $transferList = $_GET['transferList'] ?? '[]';
    $unavailList = $_GET['unavailList'] ?? '[]';
    $inventoryReportList = $_GET['inventoryReportList'] ?? '[]';




} else if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $operation = $_POST['operation'] ?? '';
    $json = $_POST['json'] ?? '{}';
    $requestList = $_POST['requestList'] ?? '[]';

    $transferList = $_POST['transferList'] ?? '[]';
    $unavailList = $_POST['unavailList'] ?? '[]';
    $inventoryReportList = $_POST['inventoryReportList'] ?? '[]';

}

// Execute
$user = new User();

switch ($operation) {
    case 'SendRequest':
        echo $user->SendRequest($json, $requestList);
        break;
    case 'GetRequest':
        echo $user->GetRequest($json, $requestList);
        break;
    case 'GetCompletedRequest':
        echo $user->GetCompletedRequest($json, $requestList);
        break;
    case 'GetRequest2':
        echo $user->GetRequest2($json, $requestList);
        break;
    case 'GetRequest3':
        echo $user->GetRequest3($json, $requestList);
        break;
    case 'GetRequestD':
        echo $user->GetRequestD($json, $requestList);
        break;
    case 'GetRequestD3':
        echo $user->GetRequestD3($json, $requestList);
        break;
    case 'GetRequestD2':
        echo $user->GetRequestD2($json, $requestList);
        break;
    case 'GetRequestDetails':
        echo $user->GetRequestDetails($json, $requestList);
        break;
    case 'ApproveRequest':
        echo $user->ApproveRequest($json, $transferList, $unavailList, $inventoryReportList);
        break;
    case 'AcceptRequestWR':
        echo $user->AcceptRequestWR($json, $transferList, $unavailList, $inventoryReportList);
        break;
    case 'DeliverStock':
        echo $user->DeliverStock($json, $requestList);
        break;
    case 'GetReqDelivery':
        echo $user->GetReqDelivery($json, $requestList);
        break;
    case 'GetReqDateAndTime':
        echo $user->GetReqDateAndTime($json, $requestList);
        break;



}
?>