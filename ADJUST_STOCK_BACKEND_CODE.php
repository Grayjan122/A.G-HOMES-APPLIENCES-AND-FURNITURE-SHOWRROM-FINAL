<?php
/**
 * Add this code to your inventory.php backend file
 * This handles the AdjustStock operation for the Inventory Manager
 */

// Add this case to your switch statement in inventory.php

case 'AdjustStock':
    // Get the JSON data
    $json = json_decode($jsonData, true);
    
    $product_id = $json['product_id'];
    $location_id = $json['location_id'];
    $adjustment_type = $json['adjustment_type']; // 'add' or 'subtract'
    $quantity = intval($json['quantity']);
    $user_id = $json['user_id'];
    
    // Validate inputs
    if (empty($product_id) || empty($location_id) || empty($quantity) || empty($user_id)) {
        echo json_encode(['success' => false, 'message' => 'Missing required fields']);
        exit;
    }
    
    if ($quantity <= 0) {
        echo json_encode(['success' => false, 'message' => 'Quantity must be greater than 0']);
        exit;
    }
    
    // Start transaction
    $conn->begin_transaction();
    
    try {
        // Get current stock
        $stmt = $conn->prepare("SELECT qty FROM inventory WHERE product_id = ? AND location_id = ?");
        $stmt->bind_param("ii", $product_id, $location_id);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows === 0) {
            $conn->rollback();
            echo json_encode(['success' => false, 'message' => 'Inventory record not found']);
            exit;
        }
        
        $row = $result->fetch_assoc();
        $current_qty = intval($row['qty']);
        $past_balance = $current_qty;
        
        // Calculate new quantity
        if ($adjustment_type === 'add') {
            $new_qty = $current_qty + $quantity;
            $ledger_qty = $quantity; // Positive for additions
        } else { // subtract
            $new_qty = $current_qty - $quantity;
            $ledger_qty = $quantity; // Will be stored as positive, type indicates it's a subtraction
            
            // Check if we have enough stock to subtract
            if ($new_qty < 0) {
                $conn->rollback();
                echo json_encode(['success' => false, 'message' => 'Insufficient stock. Current stock: ' . $current_qty]);
                exit;
            }
        }
        
        // Update inventory quantity
        $stmt = $conn->prepare("UPDATE inventory SET qty = ? WHERE product_id = ? AND location_id = ?");
        $stmt->bind_param("iii", $new_qty, $product_id, $location_id);
        
        if (!$stmt->execute()) {
            $conn->rollback();
            echo json_encode(['success' => false, 'message' => 'Failed to update inventory']);
            exit;
        }
        
        // Create ledger entry
        $ledger_type = $adjustment_type === 'add' ? 'Stock Adjustment (Add)' : 'Stock Adjustment (Subtract)';
        
        $stmt = $conn->prepare("
            INSERT INTO inventory_ledger 
            (product_id, location_id, type, qty, past_balance, current_balance, done_by, date, time) 
            VALUES (?, ?, ?, ?, ?, ?, ?, CURDATE(), CURTIME())
        ");
        
        $stmt->bind_param(
            "iisiiii",
            $product_id,
            $location_id,
            $ledger_type,
            $ledger_qty,
            $past_balance,
            $new_qty,
            $user_id
        );
        
        if (!$stmt->execute()) {
            $conn->rollback();
            echo json_encode(['success' => false, 'message' => 'Failed to create ledger entry']);
            exit;
        }
        
        // Commit transaction
        $conn->commit();
        
        echo json_encode([
            'success' => true, 
            'message' => 'Stock adjusted successfully',
            'new_quantity' => $new_qty
        ]);
        
    } catch (Exception $e) {
        $conn->rollback();
        echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
    }
    
    break;

?>

