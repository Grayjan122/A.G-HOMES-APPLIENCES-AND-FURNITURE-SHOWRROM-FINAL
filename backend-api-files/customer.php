<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Include database connection
require_once 'connection.php';

// Get parameters
$json = isset($_GET['json']) ? json_decode($_GET['json'], true) : [];
$operation = isset($_GET['operation']) ? $_GET['operation'] : '';

// Response array
$response = [];

try {
    switch ($operation) {
        case 'CustomerLogin':
            customerLogin($json, $conn);
            break;
            
        case 'CustomerSignup':
            customerSignup($json, $conn);
            break;
            
        case 'GetCustomerById':
            getCustomerById($json, $conn);
            break;
            
        case 'UpdateCustomer':
            updateCustomer($json, $conn);
            break;
            
        default:
            echo json_encode(['success' => false, 'message' => 'Invalid operation']);
            break;
    }
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}

// Customer Login - Uses ecommerce_customers table
function customerLogin($data, $conn) {
    $email = $data['email'] ?? '';
    $password = $data['password'] ?? '';
    
    if (empty($email) || empty($password)) {
        echo json_encode(['success' => false, 'message' => 'Email and password are required']);
        return;
    }
    
    // Query ecommerce_customers table (NOT the walk-in customers table)
    $stmt = $conn->prepare("SELECT * FROM ecommerce_customers WHERE email = ? AND status = 'Active'");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        $customer = $result->fetch_assoc();
        
        // Verify password
        if (password_verify($password, $customer['password'])) {
            // Update last login
            $updateStmt = $conn->prepare("UPDATE ecommerce_customers SET last_login = NOW() WHERE ecommerce_customer_id = ?");
            $updateStmt->bind_param("i", $customer['ecommerce_customer_id']);
            $updateStmt->execute();
            $updateStmt->close();
            
            // Remove password from response
            unset($customer['password']);
            
            echo json_encode([
                'success' => true,
                'message' => 'Login successful',
                'customer' => $customer
            ]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Invalid email or password']);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'Invalid email or password']);
    }
    
    $stmt->close();
}

// Customer Signup - Creates account in ecommerce_customers table
function customerSignup($data, $conn) {
    $name = $data['name'] ?? '';
    $email = $data['email'] ?? '';
    $phone = $data['phone'] ?? '';
    $address = $data['address'] ?? '';
    $password = $data['password'] ?? '';
    
    // Validation
    if (empty($name) || empty($email) || empty($phone) || empty($address) || empty($password)) {
        echo json_encode(['success' => false, 'message' => 'All fields are required']);
        return;
    }
    
    // Validate email format
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(['success' => false, 'message' => 'Invalid email format']);
        return;
    }
    
    // Check if email already exists in ecommerce_customers
    $stmt = $conn->prepare("SELECT ecommerce_customer_id FROM ecommerce_customers WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        echo json_encode(['success' => false, 'message' => 'Email already registered']);
        $stmt->close();
        return;
    }
    $stmt->close();
    
    // Hash password
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
    
    // Insert new e-commerce customer
    $stmt = $conn->prepare("INSERT INTO ecommerce_customers (customer_name, email, phone, address, password, status, date_created) VALUES (?, ?, ?, ?, ?, 'Active', NOW())");
    $stmt->bind_param("sssss", $name, $email, $phone, $address, $hashedPassword);
    
    if ($stmt->execute()) {
        echo json_encode([
            'success' => true,
            'message' => 'Account created successfully',
            'customer_id' => $conn->insert_id
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to create account']);
    }
    
    $stmt->close();
}

// Get Customer by ID - From ecommerce_customers table
function getCustomerById($data, $conn) {
    $customerId = $data['customer_id'] ?? '';
    
    if (empty($customerId)) {
        echo json_encode(['success' => false, 'message' => 'Customer ID is required']);
        return;
    }
    
    $stmt = $conn->prepare("SELECT ecommerce_customer_id, customer_name, email, phone, address, status, date_created, last_login FROM ecommerce_customers WHERE ecommerce_customer_id = ?");
    $stmt->bind_param("i", $customerId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        $customer = $result->fetch_assoc();
        echo json_encode(['success' => true, 'customer' => $customer]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Customer not found']);
    }
    
    $stmt->close();
}

// Update Customer - Updates ecommerce_customers table
function updateCustomer($data, $conn) {
    $customerId = $data['customer_id'] ?? '';
    $name = $data['name'] ?? '';
    $phone = $data['phone'] ?? '';
    $address = $data['address'] ?? '';
    
    if (empty($customerId)) {
        echo json_encode(['success' => false, 'message' => 'Customer ID is required']);
        return;
    }
    
    $stmt = $conn->prepare("UPDATE ecommerce_customers SET customer_name = ?, phone = ?, address = ? WHERE ecommerce_customer_id = ?");
    $stmt->bind_param("sssi", $name, $phone, $address, $customerId);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Customer updated successfully']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to update customer']);
    }
    
    $stmt->close();
}

$conn->close();
?>
