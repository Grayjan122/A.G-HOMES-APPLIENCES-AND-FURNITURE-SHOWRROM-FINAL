<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

class User {
    // login
    function login($json){
        include 'conn.php';
        //$json = '{"username":"pitok","password":"12345"}'
        $json = json_decode($json, true);
        $sql = "SELECT a.account_id, a.status,a.location_id,a.fname,a.mname, a.lname, b.role_name, c.location_name, a.active_status FROM account a
                    INNER JOIN role b ON a.role_id = b.role_id
                    INNER JOIN location c ON a.location_id = c.location_id 
                    WHERE a.username = :username AND a.user_password = :password";

        $stmt = $conn->prepare($sql);
        $stmt->bindParam(':username', $json['username']);
        $stmt->bindParam(':password', $json['password']);
        $stmt->execute();
        $returnValue = $stmt->fetchAll(PDO::FETCH_ASSOC);
        unset($conn); unset($stmt);
        return json_encode($returnValue);
    }
    

    function actStatus($json){
        include 'conn.php';
        //$json = '{"username":"pitok","password":"12345"}'
        $json = json_decode($json, true);
        $sql = "UPDATE `account` SET `active_status`= :statusState WHERE account_id = :userID";

        $stmt = $conn->prepare($sql);
        
        $stmt->bindParam(':userID', $json['userID']);
        $stmt->bindParam(':statusState', $json['state']);
        $stmt->execute();
        $returnValue = $stmt->fetchAll(PDO::FETCH_ASSOC);
        unset($conn); unset($stmt);
        return json_encode($returnValue);
    }

     function getUserDetails($json){
        include 'conn.php';
        $json = json_decode($json, true);
        $userID = $json['user_id'];

        $sql = "SELECT 
                    a.account_id, 
                    a.fname, 
                    a.mname, 
                    a.lname, 
                    a.username, 
                    a.status, 
                    a.active_status, 
                    a.location_id,
                    b.role_name, 
                    c.location_name
                FROM account a
                INNER JOIN role b ON a.role_id = b.role_id
                INNER JOIN location c ON a.location_id = c.location_id
                WHERE a.account_id = :user_id";

        $stmt = $conn->prepare($sql);
        $stmt->bindParam(':user_id', $userID);
        $stmt->execute();
        $returnValue = $stmt->fetchAll(PDO::FETCH_ASSOC);

        unset($conn);
        unset($stmt);
        return json_encode($returnValue);
    }

     function updatePassword($json){
        include 'conn.php';
        $json = json_decode($json, true);
        $sql = "UPDATE account SET user_password = :newPassword WHERE account_id = :userID";
        $stmt = $conn->prepare($sql);
        $stmt->bindParam(':newPassword', $json['newPassword']);
        $stmt->bindParam(':userID', $json['userID']);
        $stmt->execute();
        unset($conn); unset($stmt);
        return json_encode(['status' => 'success']);
    }
}

// submitted by the client - operation and json data
if ($_SERVER['REQUEST_METHOD'] == 'GET'){
    $operation = $_GET['operation'];
    $json = $_GET['json'];
} else if ($_SERVER['REQUEST_METHOD'] == 'POST'){
    $operation = $_POST['operation'];
    $json = $_POST['json'];
}

$user = new User();
switch($operation){
    case 'login':
        echo $user->login($json);
        break;
    case 'actStatus':
        echo $user->actStatus($json);
        break;
    case 'getUserDetails':
        echo $user->getUserDetails($json);
        break;
    case 'updatePassword':
        echo $user->updatePassword($json);
        break;
}
?>
