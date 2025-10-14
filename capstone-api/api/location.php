<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

class User
{
    // login
    function GetLocation($json)
    {
        include 'conn.php';
        //$json = '{"username":"pitok","password":"12345"}'
        $json = json_decode($json, true);
        $sql = "SELECT a.location_id, a.location_name, a.contact_person, a.phone, a.email, a.address, a.branch_id, b.branch_name, c.name
                FROM location a 
                JOIN branch b ON a.branch_id = b.branch_id
                JOIN location_type c ON a.loc_type_id = c.loc_type_id
                ORDER BY a.location_name ASC";

        $stmt = $conn->prepare($sql);
        // $stmt->bindParam(':username', $json['username']);
        // $stmt->bindParam(':password', $json['password']);
        $stmt->execute();
        $returnValue = $stmt->fetchAll(PDO::FETCH_ASSOC);
        unset($conn);
        unset($stmt);
        return json_encode($returnValue);
    }
    function AddLocation($json)
    {
        include 'conn.php';

        header('Content-Type: application/json');
        ini_set('display_errors', 1);
        error_reporting(E_ALL);

        $json = json_decode($json, true);

        if (!$json) {
            return json_encode(['status' => 'error', 'message' => 'Invalid or empty JSON input.']);
        }

        $sql = "INSERT INTO `location` (`location_name`, `contact_person`, `phone`, `email`, `address`, `branch_id`) 
            VALUES (:locName, :contactPerson, :phone, :email, :address, :branchID)";

        $stmt = $conn->prepare($sql);

        $stmt->bindValue(':locName', $json['locName']);
        $stmt->bindValue(':contactPerson', $json['contactPerson']);
        $stmt->bindValue(':phone', $json['phone']);
        $stmt->bindValue(':email', $json['email']);
        $stmt->bindValue(':address', $json['address']);
        $stmt->bindValue(':branchID', $json['branchID']);

        try {
            $stmt->execute();
            $returnValue = 'Success';
        } catch (PDOException $e) {
            $returnValue = 'Error: ' . $e->getMessage();
        }

        unset($stmt);
        unset($conn);

        return json_encode($returnValue);
    }

    function GetLocationDetails($json)
    {
        include 'conn.php';
        //$json = '{"username":"pitok","password":"12345"}'
        $json = json_decode($json, true);
        $sql = "SELECT a.location_id, a.location_name, a.contact_person, a.phone, a.email, a.address, a.branch_id, b.branch_name
                FROM location a JOIN branch b ON a.branch_id = b.branch_id WHERE a.location_id = :locID";

        $stmt = $conn->prepare($sql);
        $stmt->bindParam(':locID', $json['locID']);
        // $stmt->bindParam(':password', $json['password']);
        $stmt->execute();
        $returnValue = $stmt->fetchAll(PDO::FETCH_ASSOC);
        unset($conn);
        unset($stmt);
        return json_encode($returnValue);
    }

    function UpdateLocationDetails($json)
    {
        include 'conn.php';

        $json = json_decode($json, true);
        $returnValue = "Error"; // Default

        try {
            $sql = "UPDATE `location` 
                SET `location_name` = :locName,
                    `contact_person` = :contactPerson,
                    `phone` = :phone,
                    `email` = :email,
                    `address` = :address,
                    `branch_id` = :branchID 
                WHERE `location_id` = :locID";

            $stmt = $conn->prepare($sql);

            $stmt->bindValue(':locName', $json['locName']);
            $stmt->bindValue(':contactPerson', $json['contactPerson']);
            $stmt->bindValue(':phone', $json['phone']);
            $stmt->bindValue(':email', $json['email']);
            $stmt->bindValue(':address', $json['address']);
            $stmt->bindValue(':branchID', $json['branchID']);
            $stmt->bindValue(':locID', $json['locID'], PDO::PARAM_INT);

            if ($stmt->execute()) {
                $returnValue = "Success";
            }
        } catch (Exception $e) {
            $returnValue = "Error" + $e->getMessage();
        } finally {
            unset($stmt);
            unset($conn);
        }

        return json_encode($returnValue);
    }


    function AddBranch($json)
    {
        include 'conn.php';

        header('Content-Type: application/json');
        ini_set('display_errors', 1);
        error_reporting(E_ALL);

        $json = json_decode($json, true);

        if (!$json) {
            return json_encode(['status' => 'error', 'message' => 'Invalid or empty JSON input.']);
        }

        $sql = "INSERT INTO `branch`(`branch_name`) VALUES (:branchName)";

        $stmt = $conn->prepare($sql);

        $stmt->bindValue(':branchName', $json['branchName']);

        try {
            $stmt->execute();
            $returnValue = 'Success';
        } catch (PDOException $e) {
            $returnValue = 'Error: ' . $e->getMessage();
        }

        unset($stmt);
        unset($conn);

        return json_encode($returnValue);
    }

    function GetBranchDetails($json)
    {
        include 'conn.php';
        //$json = '{"username":"pitok","password":"12345"}'
        $json = json_decode($json, true);
        $sql = "SELECT * FROM branch WHERE branch_id = :branchID";

        $stmt = $conn->prepare($sql);
        $stmt->bindParam(':branchID', $json['branchID']);
        // $stmt->bindParam(':password', $json['password']);
        $stmt->execute();
        $returnValue = $stmt->fetchAll(PDO::FETCH_ASSOC);
        unset($conn);
        unset($stmt);
        return json_encode($returnValue);
    }

    function UpdateBranchDetails($json)
    {
        include 'conn.php';

        header('Content-Type: application/json');
        ini_set('display_errors', 1);
        error_reporting(E_ALL);

        $json = json_decode($json, true);

        if (!$json) {
            return json_encode(['status' => 'error', 'message' => 'Invalid or empty JSON input.']);
        }

        $sql = "UPDATE `branch` SET `branch_name`= :branchName WHERE branch_id = :branchID";

        $stmt = $conn->prepare($sql);

        $stmt->bindValue(':branchName', $json['branchName']);
        $stmt->bindParam(':branchID', $json['branchID']);


        try {
            $stmt->execute();
            $returnValue = 'Success';
        } catch (PDOException $e) {
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
    case 'GetLocation':
        echo $user->GetLocation($json);
        break;
    case 'AddLocation':
        echo $user->AddLocation($json);
        break;
    case 'GetLocationDetails':
        echo $user->GetLocationDetails($json);
        break;
    case 'UpdateLocationDetails':
        echo $user->UpdateLocationDetails($json);
        break;
    case 'AddBranch':
        echo $user->AddBranch($json);
        break;
    case 'GetBranchDetails':
        echo $user->GetBranchDetails($json);
        break;
    case 'UpdateBranchDetails':
        echo $user->UpdateBranchDetails($json);
        break;
}
?>