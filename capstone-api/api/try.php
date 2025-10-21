<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

class User
{
    // login
    function GetcustomizeRequest($json)
    {
        include 'conn.php';

        // $json = json_decode($json, true);

        $accountID = isset($json['accID']) ? (int) $json['accID'] : 0;
        $locationID = isset($json['locID']) ? (int) $json['locID'] : 0;
        $json = json_decode($json, true);
        $reqT = 'a.req_to';
        if (isset($json['requestType']) && $json['requestType'] === 'From') {
            $reqT = 'a.req_from';
        }


        $sql = "SELECT a.`customize_req_id`, a.`customize_sales_id`, a.`status`, a.`date`, a.`time`, a.`req_from`,
            b.location_name AS 'reqFrom', a.`req_to` , c.location_name AS 'reqTo',
            d.invoice_id, f.account_id,e.fname, e.lname, e.mname
            FROM `customize_request` a
            JOIN location b ON a.req_from = b.location_id
            JOIN location c ON c.location_id = a.req_to
            JOIN customize_sales d ON a.customize_sales_id = d.customize_sales_id
            JOIN invoice f ON d.invoice_id = f.invoice_id
            JOIN account e ON f.account_id = e.account_id
            WHERE $reqT = :locationId;";



        $stmt = $conn->prepare($sql);
        $stmt->bindValue(':locationId', $json['locID'], PDO::PARAM_INT);
        $stmt->execute();
        $returnValue = $stmt->fetchAll(PDO::FETCH_ASSOC);
        unset($conn);
        unset($stmt);
        return json_encode($returnValue);
    }
    function GetcustomizeRequestFrom($json)
    {
        include 'conn.php';

        // $json = json_decode($json, true);

        $accountID = isset($json['accID']) ? (int) $json['accID'] : 0;
        $locationID = isset($json['locID']) ? (int) $json['locID'] : 0;

        $json = json_decode($json, true);
        $sql = "SELECT a.`customize_req_id`, a.`customize_sales_id`, a.`status`, a.`date`, a.`time`, a.`req_from`,
            b.location_name AS 'reqFrom', a.`req_to` , c.location_name AS 'reqTo',
            d.invoice_id, e.fname, e.lname, e.mname
            FROM `customize_request` a
            JOIN location b ON a.req_from = b.location_id
            JOIN location c ON c.location_id = a.req_to
            JOIN customer_sales d ON a.customize_sales_id = d.customer_sales_id
            JOIN invoice f ON d.invoice_id = f.invoice_id
            JOIN account e ON f.account_id = e.account_id
            WHERE a.req_from = :locationId;";

        $stmt = $conn->prepare($sql);
        $stmt->bindValue(':locationId', $json['locID'], PDO::PARAM_INT);
        $stmt->execute();
        $returnValue = $stmt->fetchAll(PDO::FETCH_ASSOC);
        unset($conn);
        unset($stmt);
        return json_encode($returnValue);
    }

    function GetcustomizeDeliver($json)
    {
        include 'conn.php';

        // $json = json_decode($json, true);

        $accountID = isset($json['accID']) ? (int) $json['accID'] : 0;
        $locationID = isset($json['locID']) ? (int) $json['locID'] : 0;

        $json = json_decode($json, true);
        $sql = "SELECT a.`deliver_customize_id`, a.`customize_request_id`, a.`driver`, a.`status`, 
                    a.`date`, a.`time`, a.`deliver_to`, b.location_name AS 'DeliverTo',a.`deliver_from`,
                     c.location_name AS 'DeliverFrom', a.`done_by`, d.fname, d.mname, d.lname,
                     h.fname AS 'doneFname', h.lname AS 'doneLname', h.mname AS 'doneMname'
                     FROM `deliver_customize` a 
                    INNER JOIN location b ON b.location_id = a.deliver_to
                    INNER JOIN location c ON c.location_id = a.deliver_from
                    INNER JOIN account d ON d.account_id = a.done_by
                    INNER JOIN customize_request e ON a.customize_request_id = e.customize_req_id
                    INNER JOIN customize_sales f ON e.customize_sales_id = f.customize_sales_id
                    INNER JOIN invoice g ON f.invoice_id = g.invoice_id
                    INNER JOIN account h ON g.account_id = h.account_id
                    ;";

        if ($json['deliverType'] == 'deliverFrom') {
            $sql .= " WHERE a.deliver_from = :locationId;";
        } elseif ($json['deliverType'] == 'deliverTo') {
            $sql .= " WHERE a.deliver_to = :locationId;";
        }
        $stmt = $conn->prepare($sql);
        $stmt->bindValue(':locationId', $json['locID'], PDO::PARAM_INT);
        $stmt->execute();
        $returnValue = $stmt->fetchAll(PDO::FETCH_ASSOC);
        unset($conn);
        unset($stmt);
        return json_encode($returnValue);
    }

    function GetcustomizeRequestDetailSemi($json)
    {
        include 'conn.php';

        // $json = json_decode($json, true);

        $accountID = isset($json['accID']) ? (int) $json['accID'] : 0;
        $locationID = isset($json['locID']) ? (int) $json['locID'] : 0;

        $json = json_decode($json, true);
        $sql = "SELECT a.`scd_id`, a.`customize_sales_id`, a.`baseProduct_id`, a.`modifications`, 
            a.`orig_price`, a.`adjusted_price`, a.`qty`, a.`total`,
            b.description, b.product_name
            FROM `semi_customize_details` a
            INNER JOIN products b ON b.product_id = a.baseProduct_id";

        $stmt = $conn->prepare($sql);
        // $stmt->bindValue(':locationId', $json['locID'], PDO::PARAM_INT);
        $stmt->execute();
        $returnValue = $stmt->fetchAll(PDO::FETCH_ASSOC);
        unset($conn);
        unset($stmt);
        return json_encode($returnValue);
    }

    function GetcustomizeRequestDetailFull($json)
    {
        include 'conn.php';

        // $json = json_decode($json, true);

        $accountID = isset($json['accID']) ? (int) $json['accID'] : 0;
        $locationID = isset($json['locID']) ? (int) $json['locID'] : 0;

        $json = json_decode($json, true);
        $sql = "SELECT `fcd_id`, `customize_sales_id`, `additional_description`, `description`, 
                `price`, `qty`, `total_price` 
                FROM `full_customize_details`";

        $stmt = $conn->prepare($sql);
        // $stmt->bindValue(':locationId', $json['locID'], PDO::PARAM_INT);
        $stmt->execute();
        $returnValue = $stmt->fetchAll(PDO::FETCH_ASSOC);
        unset($conn);
        unset($stmt);
        return json_encode($returnValue);
    }

    function GetTheStatusDate($json)
    {
        include 'conn.php';

        // $json = json_decode($json, true);

        $customize_sales_id = isset($json['CD_ID']) ? (int) $json['CD_ID'] : 0;
        // $locationID = isset($json['locID']) ? (int) $json['locID'] : 0;

        $json = json_decode($json, true);
        $sql = "SELECT `crr_id`, `customize_request_id`, `status`, `date`, `time` FROM `customize_request_report`
            WHERE `customize_request_id` = :CustomizeID AND status = :status";
        $stmt = $conn->prepare($sql);
        $stmt->bindValue(':CustomizeID', $json['CD_ID'], PDO::PARAM_INT);
        $stmt->bindValue(':status', $json['stats'], PDO::PARAM_STR);

        // $stmt->bindValue(':locationId', $json['locID'], PDO::PARAM_INT);
        $stmt->execute();
        $returnValue = $stmt->fetchAll(PDO::FETCH_ASSOC);
        unset($conn);
        unset($stmt);
        return json_encode($returnValue);
    }
    public function AcceptCustomizeRequestWR($json)
    {
        include 'conn.php';

        $details = json_decode($json, true);



        try {
            // Begin transaction
            $conn->beginTransaction();

            // 1. Insert into request_approved working
            $sql = "INSERT INTO `approved_customize_request`( `customize_request_id`, `aprroved_by`, 
                `date`, `time`)
                 VALUES (:customizeID, :approvedBy, :date, :time)";
            $stmt = $conn->prepare($sql);
            $stmt->bindValue(':customizeID', $details['customizeID']);
            $stmt->bindValue(':approvedBy', $details['accID']);
            $stmt->bindValue(':date', $date);
            $stmt->bindValue(':time', $time);
            $stmt->execute();

            // 2. Update request_stock status working
            $sql = "UPDATE `customize_request` SET `status`='On Going' WHERE `customize_req_id`=:customizeID";
            $stmt = $conn->prepare($sql);
            $stmt->bindValue(':customizeID', $details['customizeID']);
            $stmt->execute();


            $status = 'On Going';
            // 3 Insert into transfer_stock_reports  working
            $sql = "INSERT INTO `customize_request_report`( `customize_request_id`, `status`, `date`, `time`) 
                     VALUES (:customerSalesId, :status, :date, :time)";
            $stmt = $conn->prepare($sql);
            $stmt->bindValue(':customerSalesId', $details['customizeID'], PDO::PARAM_INT);
            $stmt->bindValue(':status', $status);
            $stmt->bindValue(':date', $date);
            $stmt->bindValue(':time', $time);
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

    function DeliverCustomize($json)
    {
        include 'conn.php';

        // $json = json_decode($json, true);

        $deliverFrom = isset($json['locID']) ? (int) $json['locID'] : 0;
        $accountID = isset($json['accID']) ? (int) $json['accID'] : 0;
        $deliverTo = isset($json['deliverTo']) ? (int) $json['deliverTo'] : 0;



        try {
            // Begin transaction
            $conn->beginTransaction();

            // 1. Insert into deliver_customize
            $status = 'On Delivery';
            $json = json_decode($json, true);
            $sql = "INSERT INTO `deliver_customize`(`customize_request_id`, `driver`, `status`, `date`, `time`, `deliver_to`, `deliver_from`, `done_by`) 
                 VALUES (:CustomizeID, :driver, :status, :date, :time, :deliverTo, :deliverFrom, :doneBy)";
            $stmt = $conn->prepare($sql);
            $stmt->bindValue(':CustomizeID', $json['reqID'], PDO::PARAM_INT);
            $stmt->bindValue(':driver', $json['driverName'], PDO::PARAM_STR);
            $stmt->bindValue(':status', $status);
            $stmt->bindValue(':date', $date);
            $stmt->bindValue(':time', $time);
            $stmt->bindValue(':deliverTo', $json['deliverTo'], PDO::PARAM_STR);
            $stmt->bindValue(':deliverFrom', $json['deliverFrom'], PDO::PARAM_INT);
            $stmt->bindValue(':doneBy', $json['accID'], PDO::PARAM_INT);
            $stmt->execute();

            // 2. Update request_stock status working
            $sql = "UPDATE `customize_request` SET `status`= 'On Delivery' WHERE `customize_req_id`=:customizeID";
            $stmt = $conn->prepare($sql);
            $stmt->bindValue(':customizeID', $json['reqID']);
            $stmt->execute();



            // 3 Insert into transfer_stock_reports  working
            $sql = "INSERT INTO `customize_request_report`( `customize_request_id`, `status`, `date`, `time`) 
                     VALUES (:customerSalesId, :status, :date, :time)";
            $stmt = $conn->prepare($sql);
            $stmt->bindValue(':customerSalesId', $json['reqID'], PDO::PARAM_INT);
            $stmt->bindValue(':status', $status);
            $stmt->bindValue(':date', $date);
            $stmt->bindValue(':time', $time);
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

    public function MarkAsCompleteCustomize($json)
    {
        include 'conn.php';

        $details = json_decode($json, true);



        try {
            // Begin transaction
            $conn->beginTransaction();

            $sql = "UPDATE `deliver_customize` SET `status`='Completed' WHERE customize_request_id=:customizeID";
            $stmt = $conn->prepare($sql);
            $stmt->bindValue(':customizeID', $details['customizeID']);
            $stmt->execute();

            // 2. Update customize request_stock status working
            $sql = "UPDATE `customize_request` SET `status`='Completed' WHERE `customize_req_id`=:customizeID";
            $stmt = $conn->prepare($sql);
            $stmt->bindValue(':customizeID', $details['customizeID']);
            $stmt->execute();


            $status = 'Completed';
            // 3 Insert into  customize request_stock_reports  working
            $sql = "INSERT INTO `customize_request_report`( `customize_request_id`, `status`, `date`, `time`) 
                     VALUES (:customerSalesId, :status, :date, :time)";
            $stmt = $conn->prepare($sql);
            $stmt->bindValue(':customerSalesId', $details['customizeID'], PDO::PARAM_INT);
            $stmt->bindValue(':status', $status);
            $stmt->bindValue(':date', $date);
            $stmt->bindValue(':time', $time);
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

    public function ReceiveCustomize($json, $semiProducts, $fullProducts)
    {
        include 'conn.php';

        $details = json_decode($json, true);

        try {
            // Begin transaction
            $conn->beginTransaction();

            // register the customize products

            // semi customize products
            $semiProducts = json_decode($semiProducts, true);

            if (!empty($semiProducts)) {
                $customizeType = 'Semi';
                foreach ($semiProducts as $product) {
                    $sql = "INSERT INTO `customize_products`(`customize_type`, `price`)
                        VALUES (:customize_type, :price)";
                    $stmt = $conn->prepare($sql);
                    $stmt->bindValue(':customize_type', $customizeType);
                    $stmt->bindValue(':price', $product['adjusted_price']);
                    $stmt->execute();
                    $customizeProdID = $conn->lastInsertId();

                    // add semi customize details
                    $sql = "INSERT INTO `semi_customize_products`(`cp_id`, `baseProduct_id`, 
                            `modifications`, `orig_price`, `adjusted_price`)
                        VALUES (:cp_id, :baseProduct_id, 
                            :modifications, :orig_price, :adjusted_price)";
                    $stmt = $conn->prepare($sql);
                    $stmt->bindValue(':cp_id', $customizeProdID);
                    $stmt->bindValue(':baseProduct_id', $product['baseProduct_id']);
                    $stmt->bindValue(':modifications', $product['modifications']);
                    $stmt->bindValue(':orig_price', $product['orig_price']);
                    $stmt->bindValue(':adjusted_price', $product['adjusted_price']);
                    $stmt->execute();

                    // add to inventory
                    $sql = "INSERT INTO `customize_store_inventory`(`cp_id`, `status`, `qty`, `locationd_id`) 
                        VALUES (:cp_id, :status, :qty, :locationd_id)";
                    $stmt = $conn->prepare($sql);
                    $stmt->bindValue(':cp_id', $customizeProdID);
                    $stmt->bindValue(':status', 'Available');
                    $stmt->bindValue(':qty', $product['qty']);
                    $stmt->bindValue(':locationd_id', $details['locID']);
                    $stmt->execute();
                    $csi_id = $conn->lastInsertId();

                    // add to ledger (SEMI) — fixed: bind account_id
                    $sql = "INSERT INTO `customize_inventory_ledgerr`(`csi_id`, `cp_id`, 
                          `type`, `past_balance`, `qty`, `current_balance`, `date`, `time`, 
                           `locationd_id`, `account_id`) 
                        VALUES (:csi_id, :cp_id, 
                          :type, :past_balance, :qty, :current_balance, :date, :time, 
                             :locationd_id, :account_id)";
                    $stmt = $conn->prepare($sql);
                    $stmt->bindValue(':csi_id', $csi_id);
                    $stmt->bindValue(':cp_id', $customizeProdID);
                    $stmt->bindValue(':type', 'Stock In');
                    $stmt->bindValue(':past_balance', 0);
                    $stmt->bindValue(':qty', $product['qty']);
                    $stmt->bindValue(':current_balance', $product['qty']);
                    $stmt->bindValue(':date', $date);
                    $stmt->bindValue(':time', $time);
                    $stmt->bindValue(':locationd_id', $details['locID']);
                    // bind missing account_id
                    $stmt->bindValue(':account_id', $details['accID']);
                    $stmt->execute();
                }
            }

            // full customize products
            $fullProducts = json_decode($fullProducts, true);
            if (!empty($fullProducts)) {
                $customizeType = 'Full';
                foreach ($fullProducts as $product) {
                    $sql = "INSERT INTO `customize_products`(`customize_type`, `price`)
                        VALUES (:customize_type, :price)";
                    $stmt = $conn->prepare($sql);
                    $stmt->bindValue(':customize_type', $customizeType);
                    $stmt->bindValue(':price', $product['price']);
                    $stmt->execute();
                    $customizeProdID = $conn->lastInsertId();

                    // add full customize details
                    $sql = "INSERT INTO `full_customize_products`(`cp_id`, 
                        `description`, `additional_description`, `price`) 
                    VALUES (:cp_id, :description, :additional_description, :price)";
                    $stmt = $conn->prepare($sql);
                    $stmt->bindValue(':cp_id', $customizeProdID);
                    $stmt->bindValue(':description', $product['description']);
                    $stmt->bindValue(':additional_description', $product['additional_description']);
                    $stmt->bindValue(':price', $product['price']);
                    $stmt->execute();

                    // add to inventory
                    $sql = "INSERT INTO `customize_store_inventory`(`cp_id`, `status`, `qty`, `locationd_id`) 
                        VALUES (:cp_id, :status, :qty, :locationd_id)";
                    $stmt = $conn->prepare($sql);
                    $stmt->bindValue(':cp_id', $customizeProdID);
                    $stmt->bindValue(':status', 'Available');
                    $stmt->bindValue(':qty', $product['qty']);
                    $stmt->bindValue(':locationd_id', $details['locID']);
                    $stmt->execute();
                    $csi_id = $conn->lastInsertId();

                    // add to ledger (FULL)
                    $sql = "INSERT INTO `customize_inventory_ledgerr`(`csi_id`, `cp_id`, 
                          `type`, `past_balance`, `qty`, `current_balance`, `date`, `time`, 
                           `locationd_id`, `account_id`) 
                        VALUES (:csi_id, :cp_id, 
                          :type, :past_balance, :qty, :current_balance, :date, :time, 
                             :locationd_id, :account_id)";
                    $stmt = $conn->prepare($sql);
                    $stmt->bindValue(':csi_id', $csi_id);
                    $stmt->bindValue(':cp_id', $customizeProdID);
                    $stmt->bindValue(':type', 'Stock In');
                    $stmt->bindValue(':past_balance', 0);
                    $stmt->bindValue(':qty', $product['qty']);
                    $stmt->bindValue(':current_balance', $product['qty']);
                    $stmt->bindValue(':date', $date);
                    $stmt->bindValue(':time', $time);
                    $stmt->bindValue(':locationd_id', $details['locID']);
                    $stmt->bindValue(':account_id', $details['accID']);
                    $stmt->execute();
                }
            }

            $customizeID = $details['reqID'];
            // update the customize delivery
            $sql = "UPDATE `deliver_customize` SET `status`='Delivered' WHERE customize_request_id=:customizeID";
            $stmt = $conn->prepare($sql);
            $stmt->bindValue(':customizeID', $customizeID);
            $stmt->execute();

            // Update customize_request status
            $sql = "UPDATE `customize_request` SET `status`= 'Delivered' WHERE `customize_req_id`=:customizeID";
            $stmt = $conn->prepare($sql);
            // use $customizeID (from $details)
            $stmt->bindValue(':customizeID', $customizeID, PDO::PARAM_INT);
            $stmt->execute();

            // Insert into customize_request_report
            $status = 'Delivered';
            $sql = "INSERT INTO `customize_request_report`( `customize_request_id`, `status`, `date`, `time`) 
                 VALUES (:customerSalesId, :status, :date, :time)";
            $stmt = $conn->prepare($sql);
            $stmt->bindValue(':customerSalesId', $customizeID, PDO::PARAM_INT);
            $stmt->bindValue(':status', $status);
            $stmt->bindValue(':date', $date);
            $stmt->bindValue(':time', $time);
            $stmt->execute();

            // Commit everything
            $conn->commit();
            $returnValue = 'Success';

        } catch (PDOException $e) {
            // Rollback on error
            $conn->rollBack();
            $returnValue = 'Error: ' . $e->getMessage();
        }

        unset($stmt);
        unset($conn);

        return json_encode($returnValue);
    }

    function GetcustomizeInventory($json)
    {
        include 'conn.php';

        // $json = json_decode($json, true);

        $accountID = isset($json['accID']) ? (int) $json['accID'] : 0;
        $locationID = isset($json['locID']) ? (int) $json['locID'] : 0;

        $json = json_decode($json, true);
        $sql = "SELECT a.`csi_id`, a.`cp_id`, a.`status`, a.`qty`, a.`locationd_id`, b.location_name
	                FROM `customize_store_inventory` a
                    INNER JOIN location b ON a.locationd_id = b.location_id
                    WHERE a.locationd_id = :locationId;";


        $stmt = $conn->prepare($sql);
        $stmt->bindValue(':locationId', $json['locID'], PDO::PARAM_INT);
        $stmt->execute();
        $returnValue = $stmt->fetchAll(PDO::FETCH_ASSOC);
        unset($conn);
        unset($stmt);
        return json_encode($returnValue);
    }

    function GetcustomizeInventoryLedger($json)
    {
        include 'conn.php';

        // $json = json_decode($json, true);

        $accountID = isset($json['accID']) ? (int) $json['accID'] : 0;
        $locationID = isset($json['locID']) ? (int) $json['locID'] : 0;

        $json = json_decode($json, true);
        $sql = "SELECT a.`cil_id`, a.`csi_id`, a.`cp_id`, a.`type`, a.`past_balance`, a.`qty`, a.`current_balance`, a.`date`, a.`time`, 				a.`locationd_id`,b.location_name, a.`account_id` , c.fname, c.mname, c.lname
	                FROM `customize_inventory_ledgerr` a
                     JOIN location b ON b.location_id = a.locationd_id
                     JOIN account c ON c.account_id = a.account_id
                    ;";


        $stmt = $conn->prepare($sql);
        // $stmt->bindValue(':locationId', $json['locID'], PDO::PARAM_INT);
        $stmt->execute();
        $returnValue = $stmt->fetchAll(PDO::FETCH_ASSOC);
        unset($conn);
        unset($stmt);
        return json_encode($returnValue);
    }

    function GetcustomizProduct($json)
    {
        include 'conn.php';

        // $json = json_decode($json, true);

        $accountID = isset($json['accID']) ? (int) $json['accID'] : 0;
        $locationID = isset($json['locID']) ? (int) $json['locID'] : 0;

        $json = json_decode($json, true);
        $sql = "SELECT `cp_id`, `customize_type`, `price` FROM `customize_products`;";


        $stmt = $conn->prepare($sql);
        // $stmt->bindValue(':locationId', $json['locID'], PDO::PARAM_INT);
        $stmt->execute();
        $returnValue = $stmt->fetchAll(PDO::FETCH_ASSOC);
        unset($conn);
        unset($stmt);
        return json_encode($returnValue);
    }

    function GetSemiCustomizeProduct($json)
    {
        include 'conn.php';

        // $json = json_decode($json, true);

        $accountID = isset($json['accID']) ? (int) $json['accID'] : 0;
        $locationID = isset($json['locID']) ? (int) $json['locID'] : 0;

        $json = json_decode($json, true);
        $sql = "SELECT a.`scp_id`, a.`cp_id`, a.`baseProduct_id`, a.`modifications`, 
            a.`orig_price`, a.`adjusted_price`,
            b.description, b.product_name
            FROM `semi_customize_products` a
            INNER JOIN products b ON b.product_id = a.baseProduct_id;";


        $stmt = $conn->prepare($sql);
        // $stmt->bindValue(':locationId', $json['locID'], PDO::PARAM_INT);
        $stmt->execute();
        $returnValue = $stmt->fetchAll(PDO::FETCH_ASSOC);
        unset($conn);
        unset($stmt);
        return json_encode($returnValue);
    }

    function GetFullCustomizeProduct($json)
    {
        include 'conn.php';

        // $json = json_decode($json, true);

        $accountID = isset($json['accID']) ? (int) $json['accID'] : 0;
        $locationID = isset($json['locID']) ? (int) $json['locID'] : 0;

        $json = json_decode($json, true);
        $sql = "SELECT `fcp_id`, `cp_id`, `description`, `additional_description`, `price` FROM `full_customize_products`;";


        $stmt = $conn->prepare($sql);
        // $stmt->bindValue(':locationId', $json['locID'], PDO::PARAM_INT);
        $stmt->execute();
        $returnValue = $stmt->fetchAll(PDO::FETCH_ASSOC);
        unset($conn);
        unset($stmt);
        return json_encode($returnValue);
    }


    function GetCustomizeSales($json)
    {
        include 'conn.php';

        // $json = json_decode($json, true);

        $accountID = isset($json['accID']) ? (int) $json['accID'] : 0;
        $locationID = isset($json['locID']) ? (int) $json['locID'] : 0;

        $json = json_decode($json, true);
        $sql = "SELECT a.`customize_sales_id`, a.`invoice_id`, b.date , b.time, b.account_id, 
            c.fname AS 'doneFname', c.mname  AS 'doneMname', c.lname  AS 'doneLname', 
			a.`total_qty`, a.`total_price`, a.`down_payment`, a.`balance`, 				
            a.`status`, 				
			a.`customize_type`, a.`cust_id`, d.cust_name
		FROM `customize_sales` a 
        JOIN invoice b ON a.invoice_id = b.invoice_id
        JOIN account c ON b.account_id = c.account_id
        JOIN customers d ON d.cust_id = a.cust_id
        WHERE b.location_id = :locationId;";


        $stmt = $conn->prepare($sql);
        $stmt->bindValue(':locationId', $json['locID'], PDO::PARAM_INT);
        $stmt->execute();
        $returnValue = $stmt->fetchAll(PDO::FETCH_ASSOC);
        unset($conn);
        unset($stmt);
        return json_encode($returnValue);
    }



}

// submitted by the client - operation and json data
if ($_SERVER['REQUEST_METHOD'] == 'GET') {
    $operation = $_GET['operation'];
    $json = $_GET['json'];

    $semiProducts = $_GET['semiProd'] ?? '[]';
    $fullProducts = $_GET['fullProd'] ?? '[]';

} else if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $operation = $_POST['operation'];
    $json = $_POST['json'];

    $semiProducts = $_POST['semiProd'] ?? '[]';
    $fullProducts = $_POST['fullProd'] ?? '[]';
}

$user = new User();
switch ($operation) {
    case 'GetCustomizeRequest':
        echo $user->GetcustomizeRequest($json);
        break;
    case 'GetCustomizeRequestFrom':
        echo $user->GetcustomizeRequestFrom($json);
        break;


    case 'GetCustomizeRequestDetailSemi':
        echo $user->GetcustomizeRequestDetailSemi($json);
        break;

    case 'GetCustomizeRequestDetailFull':
        echo $user->GetcustomizeRequestDetailFull($json);
        break;

    case 'GetTheStatusDate':
        echo $user->GetTheStatusDate($json);
        break;

    case 'AcceptCustomizeRequestWR':
        echo $user->AcceptCustomizeRequestWR($json);
        break;

    case 'DeliverCustomize':
        echo $user->DeliverCustomize($json);
        break;

    case 'GetCustomizeDeliver':
        echo $user->GetcustomizeDeliver($json);
        break;

    case 'MarkAsCompleteCustomize':
        echo $user->MarkAsCompleteCustomize($json);
        break;
    case 'ReceiveCustomize':
        echo $user->ReceiveCustomize($json, $semiProducts, $fullProducts);
        break;

    case 'GetCustomizeInventory':
        echo $user->GetcustomizeInventory($json);
        break;
    case 'GetCustomizeInventoryLedger':
        echo $user->GetcustomizeInventoryLedger($json);
        break;
    case 'GetCustomizProduct':
        echo $user->GetcustomizProduct($json);
        break;
    case 'GetSemiCustomizeProduct':
        echo $user->GetSemiCustomizeProduct($json);
        break;
    case 'GetFullCustomizeProduct':
        echo $user->GetFullCustomizeProduct($json);
        break;

    case 'GetCustomizeSales':
        echo $user->GetCustomizeSales($json);
        break;
}
?>