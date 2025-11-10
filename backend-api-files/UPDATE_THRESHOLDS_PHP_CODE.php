<?php
/**
 * ============================================================================
 * ADD THIS CODE TO YOUR inventory.php FILE
 * Location: C:\xampp\htdocs\capstone-api\api\inventory.php
 * ============================================================================
 * 
 * STEP 1: Add this function to your inventory.php file
 * (Add it with your other functions, before the switch statement)
 */

function UpdateThresholds($json, $conn) {
    // Decode JSON data
    $data = json_decode($json, true);
    
    // Extract parameters
    $product_id = isset($data['product_id']) ? (int)$data['product_id'] : 0;
    $location_id = isset($data['location_id']) ? (int)$data['location_id'] : 0;
    $min_threshold = isset($data['min_threshold']) ? (int)$data['min_threshold'] : 1;
    $max_threshold = isset($data['max_threshold']) ? (int)$data['max_threshold'] : 2;
    $user_id = isset($data['user_id']) ? (int)$data['user_id'] : 0;
    
    // Validate inputs
    if (empty($product_id) || empty($location_id)) {
        echo json_encode([
            'success' => false,
            'message' => 'Product ID and Location ID are required'
        ]);
        return;
    }
    
    if ($min_threshold < 0 || $max_threshold < 0) {
        echo json_encode([
            'success' => false,
            'message' => 'Threshold values cannot be negative'
        ]);
        return;
    }
    
    if ($min_threshold > $max_threshold) {
        echo json_encode([
            'success' => false,
            'message' => 'Minimum threshold cannot be greater than maximum threshold'
        ]);
        return;
    }
    
    try {
        // Check if inventory record exists
        $checkStmt = $conn->prepare("SELECT store_inventory_id FROM store_inventory WHERE product_id = ? AND location_id = ?");
        $checkStmt->bind_param("ii", $product_id, $location_id);
        $checkStmt->execute();
        $result = $checkStmt->get_result();
        
        if ($result->num_rows === 0) {
            echo json_encode([
                'success' => false,
                'message' => 'Inventory record not found for this product and location'
            ]);
            $checkStmt->close();
            return;
        }
        
        $checkStmt->close();
        
        // Update thresholds
        $updateStmt = $conn->prepare("UPDATE store_inventory SET min_threshold = ?, max_threshold = ? WHERE product_id = ? AND location_id = ?");
        $updateStmt->bind_param("iiii", $min_threshold, $max_threshold, $product_id, $location_id);
        
        if ($updateStmt->execute()) {
            echo json_encode([
                'success' => true,
                'message' => 'Thresholds updated successfully',
                'data' => [
                    'product_id' => $product_id,
                    'location_id' => $location_id,
                    'min_threshold' => $min_threshold,
                    'max_threshold' => $max_threshold
                ]
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'Failed to update thresholds: ' . $conn->error
            ]);
        }
        
        $updateStmt->close();
        
    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Error updating thresholds: ' . $e->getMessage()
        ]);
    }
}

/**
 * ============================================================================
 * STEP 2: Update GetInventory function to include thresholds
 * ============================================================================
 * 
 * Find your GetInventory function and modify the SELECT query to include:
 * 
 * SELECT 
 *     si.store_inventory_id,
 *     si.location_id,
 *     si.product_id,
 *     si.qty,
 *     si.min_threshold,    -- ADD THIS
 *     si.max_threshold,    -- ADD THIS
 *     l.location_name,
 *     p.product_name,
 *     p.description,
 *     ... (other columns)
 * FROM store_inventory si
 * INNER JOIN locations l ON si.location_id = l.location_id
 * INNER JOIN products p ON si.product_id = p.product_id
 * WHERE ...
 */

/**
 * ============================================================================
 * STEP 3: Add this case to your switch statement
 * ============================================================================
 * 
 * Find the switch statement that handles operations and add:
 * 
 * switch ($operation) {
 *     case 'GetInventory':
 *         GetInventory($json, $conn);
 *         break;
 *     
 *     case 'AdjustStock':
 *         AdjustStock($json, $conn);
 *         break;
 *     
 *     // ADD THIS NEW CASE:
 *     case 'UpdateThresholds':
 *         UpdateThresholds($json, $conn);
 *         break;
 *     
 *     default:
 *         echo json_encode(['error' => 'Invalid operation']);
 *         break;
 * }
 * 
 * ============================================================================
 */

