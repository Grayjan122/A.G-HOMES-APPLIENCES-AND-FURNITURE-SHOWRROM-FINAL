<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

class User {
    // login
    function login($json){
        include 'conn.php';
        //$json = '{"username":"pitok","password":"12345"}'
        $json = json_decode($json, true);
        
        // First, get user by username only to retrieve stored password
        $sql = "SELECT a.account_id, a.status, a.location_id, a.fname, a.mname, a.lname, 
                       a.user_password, b.role_name, c.location_name, a.active_status 
                FROM account a
                INNER JOIN role b ON a.role_id = b.role_id
                INNER JOIN location c ON a.location_id = c.location_id 
                WHERE a.username = :username";

        $stmt = $conn->prepare($sql);
        $stmt->bindParam(':username', $json['username']);
        $stmt->execute();
        $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        error_log("Login attempt for username: " . $json['username']);
        error_log("User found in database: " . count($users));
        
        if (count($users) > 0) {
            $user = $users[0];
            $storedPassword = $user['user_password'];
            $inputPassword = $json['password'];
            
            error_log("Checking password...");
            
            // Try multiple password verification methods
            $passwordMatch = false;
            
            // Method 1: Plain text comparison (for backward compatibility)
            if ($storedPassword === $inputPassword) {
                $passwordMatch = true;
                error_log("Password matched: Plain text");
            }
            // Method 2: MD5 hash
            else if ($storedPassword === md5($inputPassword)) {
                $passwordMatch = true;
                error_log("Password matched: MD5");
            }
            // Method 3: SHA256 hash
            else if ($storedPassword === hash('sha256', $inputPassword)) {
                $passwordMatch = true;
                error_log("Password matched: SHA256");
            }
            // Method 4: password_verify (for password_hash)
            else if (password_verify($inputPassword, $storedPassword)) {
                $passwordMatch = true;
                error_log("Password matched: password_hash");
            }
            
            if ($passwordMatch) {
                // CHECK ACCOUNT STATUS BEFORE ALLOWING LOGIN
                $accountStatus = $user['status'];
                error_log("Account status: " . $accountStatus);
                
                // Block deactivated accounts
                if ($accountStatus === 'Deactive') {
                    error_log("Login blocked: Account is deactivated");
                    unset($conn); unset($stmt);
                    return json_encode([
                        'error' => 'account_deactivated',
                        'message' => 'This user no longer has access to the system. Please contact your administrator for more information.'
                    ]);
                }
                
                // Block suspended accounts
                if ($accountStatus === 'Suspended') {
                    error_log("Login blocked: Account is suspended");
                    unset($conn); unset($stmt);
                    return json_encode([
                        'error' => 'account_suspended',
                        'message' => 'Your account has been temporarily suspended. Please contact your administrator for assistance.'
                    ]);
                }
                
                // Check if account is already online (in use by another session)
                if ($user['active_status'] === 'Online') {
                    error_log("Login blocked: Account is already online (in use)");
                    unset($conn); unset($stmt);
                    
                    // Return special error code for "account in use"
                    return json_encode([
                        'error' => 'account_in_use',
                        'message' => 'This account is currently in use. Please try again later or contact support if this is your account.'
                    ]);
                }
                
                // Only allow Active users to login
                // Update active_status to "Online" immediately upon successful login
                $updateSql = "UPDATE account SET active_status = 'Online' WHERE account_id = :account_id";
                $updateStmt = $conn->prepare($updateSql);
                $updateStmt->bindParam(':account_id', $user['account_id']);
                $updateStmt->execute();
                error_log("Updated active_status to Online for user: " . $user['account_id']);
                
                // Update the user array to reflect the change
                $user['active_status'] = 'Online';
                
                // Remove password from returned data for security
                unset($user['user_password']);
                error_log("Login successful!");
                unset($conn); unset($stmt); unset($updateStmt);
                return json_encode([$user]);
            } else {
                error_log("Password does not match");
                unset($conn); unset($stmt);
                return json_encode([]);
            }
        } else {
            error_log("User not found");
            unset($conn); unset($stmt);
            return json_encode([]);
        }
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
        
        // Check if the update was successful
        $rowCount = $stmt->rowCount();
        
        if ($rowCount > 0) {
            $returnValue = [
                'success' => true,
                'message' => 'Status updated successfully',
                'status' => $json['state'],
                'user_id' => $json['userID'],
                'rows_affected' => $rowCount
            ];
        } else {
            $returnValue = [
                'success' => false,
                'message' => 'No rows updated. User may not exist.',
                'status' => $json['state'],
                'user_id' => $json['userID']
            ];
        }
        
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
                    a.email,
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

