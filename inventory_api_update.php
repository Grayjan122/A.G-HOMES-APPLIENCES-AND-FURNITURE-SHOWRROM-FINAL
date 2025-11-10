<?php
// Add this new operation to your existing inventory.php file

// Get Product Inventory By Location
// This operation fetches inventory for a specific product across all locations
function getProductInventoryByLocation($data, $conn) {
    $productId = $data['productId'] ?? '';
    
    if (empty($productId)) {
        echo json_encode([]);
        return;
    }
    
    $query = "SELECT 
                si.store_inventory_id,
                si.location_id,
                si.product_id,
                si.qty,
                l.location_name,
                l.location_type,
                p.product_name,
                p.price
              FROM store_inventory si
              INNER JOIN locations l ON si.location_id = l.location_id
              INNER JOIN products p ON si.product_id = p.product_id
              WHERE si.product_id = ?
              ORDER BY l.location_name ASC";
    
    $stmt = $conn->prepare($query);
    $stmt->bind_param("i", $productId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $inventory = [];
    while ($row = $result->fetch_assoc()) {
        $inventory[] = $row;
    }
    
    echo json_encode($inventory);
    $stmt->close();
}

// Add this case to your switch statement in inventory.php:
/*
case 'GetProductInventoryByLocation':
    getProductInventoryByLocation($json, $conn);
    break;
*/
?>

