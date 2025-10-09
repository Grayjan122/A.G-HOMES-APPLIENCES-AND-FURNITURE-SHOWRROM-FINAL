<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

class User
{
    // login
    function ProductCount($json)
    {
        include 'conn.php';
        //$json = '{"username":"pitok","password":"12345"}'
        $json = json_decode($json, true);
        $sql = "SELECT COUNT(product_id) AS product_count FROM products;";

        $stmt = $conn->prepare($sql);

        $stmt->execute();
        $returnValue = $stmt->fetchAll(PDO::FETCH_ASSOC);
        unset($conn);
        unset($stmt);
        return json_encode($returnValue);
    }

    function CategoryCount($json)
    {
        include 'conn.php';
        //$json = '{"username":"pitok","password":"12345"}'
        $json = json_decode($json, true);
        $sql = "SELECT COUNT(category_id) AS category_count FROM category;";

        $stmt = $conn->prepare($sql);

        $stmt->execute();
        $returnValue = $stmt->fetchAll(PDO::FETCH_ASSOC);
        unset($conn);
        unset($stmt);
        return json_encode($returnValue);
    }

    function LocationCount($json)
    {
        include 'conn.php';
        //$json = '{"username":"pitok","password":"12345"}'
        $json = json_decode($json, true);
        $sql = "SELECT COUNT(location_id) AS location_count FROM location;";

        $stmt = $conn->prepare($sql);

        $stmt->execute();
        $returnValue = $stmt->fetchAll(PDO::FETCH_ASSOC);
        unset($conn);
        unset($stmt);
        return json_encode($returnValue);
    }

    function UserCount($json)
    {
        include 'conn.php';
        //$json = '{"username":"pitok","password":"12345"}'
        $json = json_decode($json, true);
        $sql = "SELECT COUNT(account_id) AS user_count FROM account;";

        $stmt = $conn->prepare($sql);

        $stmt->execute();
        $returnValue = $stmt->fetchAll(PDO::FETCH_ASSOC);
        unset($conn);
        unset($stmt);
        return json_encode($returnValue);
    }
    function Count($json)
    {
        include 'conn.php';
        $json = json_decode($json, true);

        // Extract values
        $column = $json['ID'];
        $alias = $json['tName'];
        $table = $json['tFrom'];


        // ⚠️ Directly insert identifiers (safe after validation)
        $sql = "SELECT COUNT($column) AS $alias FROM $table";

        $stmt = $conn->prepare($sql);
        $stmt->execute();

        $returnValue = $stmt->fetchAll(PDO::FETCH_ASSOC);

        unset($conn);
        unset($stmt);

        return json_encode($returnValue);
    }

    function ProductCountFromCategory($json)
    {
        include 'conn.php';
        //$json = '{"username":"pitok","password":"12345"}'
        $json = json_decode($json, true);
        $sql = "SELECT COUNT(product_id) AS product_count FROM products WHERE category_id = :categoryID;";
        $stmt->bindParam(':categoryID', $json['categoryID']);


        $stmt = $conn->prepare($sql);

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
} else if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $operation = $_POST['operation'];
    $json = $_POST['json'];
}

$user = new User();
switch ($operation) {
    case 'ProductCount':
        echo $user->ProductCount($json);
        break;
    case 'CategoryCount':
        echo $user->CategoryCount($json);
        break;
    case 'LocationCount':
        echo $user->LocationCount($json);
        break;
    case 'UserCount':
        echo $user->UserCount($json);
        break;
    case 'Count':
        echo $user->Count($json);
        break;
    case 'ProductCountFromCategory':
        echo $user->ProductCountFromCategory($json);
}
?>