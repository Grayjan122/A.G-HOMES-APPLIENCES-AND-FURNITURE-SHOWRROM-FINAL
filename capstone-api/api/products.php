<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

class User
{
    // login
    function GetProduct($json)
    {
        include 'conn.php';

        $json = json_decode($json, true);
        $sql = "SELECT a.product_id, a.product_name, a.description, a.dimensions, a.material, a.color, a.price, a.product_preview_image,a.category_id, a.date_created, b.category_name from products a
            INNER JOIN category b ON a.category_id = b. category_id ORDER BY a.description ASC";

        $stmt = $conn->prepare($sql);
        $stmt->execute();
        $returnValue = $stmt->fetchAll(PDO::FETCH_ASSOC);
        unset($conn);
        unset($stmt);
        return json_encode($returnValue);
    }
    function SearchProduct($json)
    {
        include 'conn.php';

        $json = json_decode($json, true);

        // Use default search if not set
        $search = isset($json['search']) ? '%' . strtolower($json['search']) . '%' : '%';

        $sql = "SELECT 
            a.product_id, 
            a.product_name, 
            a.description, 
            a.dimensions, 
            a.material, 
            a.color, 
            a.price, 
            a.product_preview_image, 
            a.date_created, 
            b.category_name 
        FROM products a
        INNER JOIN category b ON a.category_id = b.category_id 
        WHERE LOWER(a.product_name) LIKE :search OR LOWER(a.description) LIKE :search
        ORDER BY a.product_name ASC";

        $stmt = $conn->prepare($sql);
        $stmt->bindParam(':search', $search, PDO::PARAM_STR);

        $stmt->execute();
        $returnValue = $stmt->fetchAll(PDO::FETCH_ASSOC);

        unset($conn);
        unset($stmt);

        return json_encode($returnValue);

    }
    function UpdateProduct($json)
    {
        include 'conn.php';
        $json = json_decode($json, true);

        // Build dimensions string (assuming width, height, depth are sent)
        // $dimensions = $json['width'] . 'x' . $json['height'] . 'x' . $json['depth'];
        $sql = "UPDATE products SET 
                product_name = :productName,
                category_id = :category,
                description = :description,
                dimensions = :dimensions,
                material = :material,
                color = :color,
                price = :price,
                product_preview_image = :product_preview_image
            WHERE product_id = :product_id";

        $stmt = $conn->prepare($sql);

        // Bind values AFTER preparing the statement
        $stmt->bindParam(':productName', $json['prodName']);
        $stmt->bindParam(':category', $json['category']);
        $stmt->bindParam(':description', $json['description']);
        $stmt->bindParam(':dimensions', $json['dimension']);
        $stmt->bindParam(':material', $json['material']);
        $stmt->bindParam(':color', $json['color']);
        $stmt->bindParam(':price', $json['price']);
        $stmt->bindParam(':product_preview_image', $json['product_preview_image']);
        $stmt->bindParam(':product_id', $json['prodId']);

        // Execute the update



        try {
            $stmt->execute();
            $returnValue = 'Success';
        } catch (PDOException $e) {
            $returnValue = 'Error: ' . $e->getMessage();
        }

        unset($conn);
        unset($stmt);
        return json_encode($returnValue);
    }

    function AddProduct($json)
    {
        include 'conn.php';

        $date = date("Y-m-d");
        $json = json_decode($json, true);

        // ✅ Build proper dimensions string
        // $dimensions = "width = " . $json['width'] . ", height = " . $json['height'] . ", depth = " . $json['depth'];

        // ✅ Correct SQL and backticks
        $sql = "INSERT INTO products (
                product_name, category_id, description, dimensions, material, color, price, product_preview_image, date_created
            ) VALUES (
                :productName, :category, :description, :dimensions, :material, :color, :price, :product_preview_image, :date_created
            )";

        // ✅ Prepare first, then bind
        $stmt = $conn->prepare($sql);

        $stmt->bindParam(':productName', $json['prodName']);
        $stmt->bindParam(':category', $json['category']);
        $stmt->bindParam(':description', $json['description']);
        $stmt->bindParam(':dimensions', $json['dimension']);
        $stmt->bindParam(':material', $json['material']);
        $stmt->bindParam(':color', $json['color']);
        $stmt->bindParam(':price', $json['price']);
        $stmt->bindParam(':product_preview_image', $json['product_preview_image']);
        $stmt->bindParam(':date_created', $date);

        try {
            $stmt->execute();
            $returnValue = 'Success';
        } catch (PDOException $e) {
            $returnValue = 'Error: ' . $e->getMessage();
        }

        unset($conn);
        unset($stmt);
        return json_encode($returnValue);
    }
    function ViewProductDetails($json)
    {
        include 'conn.php';

        $json = json_decode($json, true);

        $sql = "SELECT 
                a.product_id, a.product_name, a.description, a.dimensions, a.material, a.color, a.price, 
                a.product_preview_image, a.date_created, a.category_id, b.category_name 
            FROM products a
            INNER JOIN category b ON a.category_id = b.category_id
            WHERE a.product_id = :product_id";

        // ✅ Prepare before binding
        $stmt = $conn->prepare($sql);
        $stmt->bindParam(':product_id', $json['product_id']);
        $stmt->execute();

        $returnValue = $stmt->fetchAll(PDO::FETCH_ASSOC);

        unset($conn);
        unset($stmt);

        return json_encode($returnValue);
    }

    function GetCategory($json)
    {
        include 'conn.php';

        $json = json_decode($json, true);
        $sql = "SELECT * FROM category ORDER BY category_name ASC";

        $stmt = $conn->prepare($sql);
        $stmt->execute();
        $returnValue = $stmt->fetchAll(PDO::FETCH_ASSOC);
        unset($conn);
        unset($stmt);
        return json_encode($returnValue);
    }

    function AddCategory($json)
    {
        include 'conn.php';
        $json = json_decode($json, true);

        $sql = "INSERT INTO category(category_name, category_description) VALUES (:category_name, :category_description)";

        $stmt = $conn->prepare($sql);
        $stmt->bindParam(':category_name', $json['categoryName']);
        $stmt->bindParam(':category_description', $json['categoryDescription']);

        try {
            $stmt->execute();
            $returnValue = 'Success';
        } catch (PDOException $e) {
            $returnValue = 'Error: ' . $e->getMessage();
        }

        unset($conn);
        unset($stmt);
        return json_encode($returnValue);
    }

    function ViewCategoryDetails($json)
    {
        include 'conn.php';

        $json = json_decode($json, true);

        $sql = "SELECT * FROM category WHERE category_id = :category_id";

        $stmt = $conn->prepare($sql);
        $stmt->bindParam(':category_id', $json['categoryID']);
        $stmt->execute();

        $returnValue = $stmt->fetchAll(PDO::FETCH_ASSOC);

        unset($conn);
        unset($stmt);

        return json_encode($returnValue);
    }

    function UpdateCategory($json)
    {
        include 'conn.php';
        $json = json_decode($json, true);


        $sql = "UPDATE `category` SET `category_name`=:category_name,`category_description`= :category_description
                WHERE category_id = :category_id";

        $stmt = $conn->prepare($sql);

        // Bind values AFTER preparing the statement
        // $stmt->bindParam(':productName', $json['prodName']);
        $stmt->bindParam(':category_name', $json['catName']);
        $stmt->bindParam(':category_description', $json['catDescription']);
        $stmt->bindParam(':category_id', $json['catID']);



        // Execute the update
        try {
            $stmt->execute();
            $returnValue = 'Success';
        } catch (PDOException $e) {
            $returnValue = 'Error: ' . $e->getMessage();
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
} else if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $operation = $_POST['operation'];
    $json = $_POST['json'];
}

$user = new User();
switch ($operation) {
    case 'GetProduct':
        echo $user->GetProduct($json);
        break;
    case 'SearchProduct':
        echo $user->SearchProduct($json);
        break;
    case 'AddProduct':
        echo $user->AddProduct($json);
        break;
    case 'UpdateProduct':
        echo $user->UpdateProduct($json);
        break;
    case 'ViewProductDetails':
        echo $user->ViewProductDetails($json);
        break;
    case 'GetCategory':
        echo $user->GetCategory($json);
        break;
    case 'AddCategory':
        echo $user->AddCategory($json);
        break;
    case 'ViewCategoryDetails':
        echo $user->ViewCategoryDetails($json);
        break;
    case 'UpdateCategory':
        echo $user->UpdateCategory($json);
        break;

}
?>