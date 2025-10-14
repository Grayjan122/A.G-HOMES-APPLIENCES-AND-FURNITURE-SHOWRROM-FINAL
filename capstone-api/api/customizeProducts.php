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
        $sql = "SELECT a.`customize_req_id`, a.`customize_sales_id`, a.`status`, a.`date`, a.`time`, a.`req_from`,
            b.location_name AS 'reqFrom', a.`req_to` , c.location_name AS 'reqTo',
            d.invoice_id, e.fname, e.lname, e.mname
            FROM `customize_request` a
            JOIN location b ON a.req_from = b.location_id
            JOIN location c ON c.location_id = a.req_to
            JOIN customer_sales d ON a.customize_sales_id = d.customer_sales_id
            JOIN invoice f ON d.invoice_id = f.invoice_id
            JOIN account e ON f.account_id = e.account_id
            WHERE a.req_to = :locationId;";

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
        $sql = "SELECT `scd_id`, `customize_sales_id`, `baseProduct_id`, `modifications`, 
            `orig_price`, `adjusted_price`, `qty`, `total` 
            FROM `semi_customize_details` ";

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


}

// submitted by the client - operation and json data
if ($_SERVER['REQUEST_METHOD'] == 'GET') {
    $operation = $_GET['operation'];
    $json = $_GET['json'];
} else if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $operation = $_POST['operation'];
    $json = $_POST['json'];
}

$user = new User();
switch ($operation) {
    case 'GetCustomizeRequest':
        echo $user->GetcustomizeRequest($json);
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
}
?>