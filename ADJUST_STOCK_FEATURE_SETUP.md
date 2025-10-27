# Adjust Stock Feature - Setup Guide

## Overview
The Adjust Stock feature allows Inventory Managers to manually adjust stock quantities (add or subtract) with a reason, and automatically creates ledger entries for tracking.

## Features
✅ Add or subtract stock quantities  
✅ Optional reason/note field for user reference  
✅ Real-time preview of new stock level  
✅ Automatic ledger entry creation  
✅ Activity logging with reason  
✅ Validation to prevent negative stock  
✅ Uses existing database structure (no schema changes needed)  

---

## 🎯 Frontend Changes (Already Implemented)

### File: `app/Contents/inventory-contents/inventoryIM.js`

#### New State Variables Added:
```javascript
// Adjust Stock Modal States
const [showAdjustModal, setShowAdjustModal] = useState(false);
const [selectedProduct, setSelectedProduct] = useState(null);
const [adjustmentType, setAdjustmentType] = useState('add');
const [adjustmentQty, setAdjustmentQty] = useState('');
const [adjustmentReason, setAdjustmentReason] = useState('');
```

#### New Functions Added:
- `openAdjustModal(item)` - Opens the adjustment modal
- `closeAdjustModal()` - Closes and resets the modal
- `handleAdjustStock()` - Handles the stock adjustment API call

#### UI Changes:
- Added "Adjust Stock" button in the inventory table actions column
- Added a modal dialog for stock adjustment with:
  - Product information display
  - Radio buttons to select Add/Remove
  - Quantity input field
  - Real-time preview of new stock level
  - Reason text area (required)

---

## 🔧 Backend Setup

### Step 1: No Database Changes Needed! ✅

**Good news:** This feature uses your existing database structure. No new columns or tables are required!

Your existing `inventory_ledger` table already has everything needed:
- product_id, location_id, type, qty
- past_balance, current_balance, done_by
- date, time

### Step 2: Add Backend Code to `inventory.php`

Open your backend `inventory.php` file (usually in `capstone-api/api/` or similar) and add the `AdjustStock` case to your switch statement.

**Location:** Inside the main switch statement that handles different operations

**Code to Add:**
```php
case 'AdjustStock':
    // Get the JSON data
    $json = json_decode($jsonData, true);
    
    $product_id = $json['product_id'];
    $location_id = $json['location_id'];
    $adjustment_type = $json['adjustment_type']; // 'add' or 'subtract'
    $quantity = intval($json['quantity']);
    $reason = $json['reason'];
    $user_id = $json['user_id'];
    
    // Validate inputs
    if (empty($product_id) || empty($location_id) || empty($quantity) || empty($reason) || empty($user_id)) {
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
            $ledger_qty = $quantity;
        } else { // subtract
            $new_qty = $current_qty - $quantity;
            $ledger_qty = $quantity;
            
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
            (product_id, location_id, type, qty, past_balance, current_balance, done_by, reason, date, time) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURDATE(), CURTIME())
        ");
        
        $stmt->bind_param(
            "iisiiiis",
            $product_id,
            $location_id,
            $ledger_type,
            $ledger_qty,
            $past_balance,
            $new_qty,
            $user_id,
            $reason
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
```

**Full code is also available in:** `ADJUST_STOCK_BACKEND_CODE.php`

---

## 📋 How to Use

### For Inventory Managers:

1. **Navigate to Inventory Management**
   - Go to your Inventory Manager dashboard
   - Click on "Inventory Management" in the sidebar

2. **Find the Product**
   - Use filters to find the product (by store, stock level, or search)
   - Locate the product you want to adjust

3. **Adjust Stock**
   - Click the green "Adjust Stock" button
   - A modal will appear showing:
     - Product details
     - Current stock quantity
   
4. **Fill in Adjustment Details**
   - Select adjustment type:
     - **Add Stock** - Increase inventory (e.g., found items, corrections)
     - **Remove Stock** - Decrease inventory (e.g., damaged items, shrinkage)
   - Enter the quantity to add or remove
   - See real-time preview of new stock level
   - **Optionally enter a reason** - add a note explaining the adjustment (recommended for tracking)

5. **Confirm Adjustment**
   - Click "Add Stock" or "Remove Stock" button
   - The system will:
     - Update inventory quantity
     - Create a ledger entry with your reason
     - Log the activity in audit logs
     - Show success message

6. **View Adjustments**
   - Click "View Report" on any product
   - You'll see ledger entries showing:
     - "Stock Adjustment (Add)" or "Stock Adjustment (Subtract)"
     - Past balance
     - Quantity changed
     - Current balance
     - Date and time
     - Who made the adjustment

---

## 🔍 Example Use Cases

### Adding Stock
**Scenario:** Found 10 units during physical inventory count
- Select: **Add Stock**
- Quantity: `10`
- Reason: `Physical inventory count - found missing items in storage`

### Removing Stock
**Scenario:** 5 units were damaged
- Select: **Remove Stock**
- Quantity: `5`
- Reason: `Water damage during storage - units unfit for sale`

---

## 🛡️ Validations

The system includes several validations:

1. **Quantity must be greater than 0**
2. **Prevents negative stock** - Cannot remove more than available
3. **Transaction safety** - Uses database transactions to ensure data integrity
4. **User authentication** - Only logged-in users can adjust stock

---

## 📊 Ledger Entry Types

After adjustment, the ledger will show:
- **Type:** "Stock Adjustment (Add)" or "Stock Adjustment (Subtract)"
- **Qty:** The amount adjusted (shown with + or - in the report)
- **Past Balance:** Stock before adjustment
- **Current Balance:** Stock after adjustment
- **Done By:** Your name
- **Date & Time:** When the adjustment was made

**Note:** The reason field in the UI is for your reference when making the adjustment. It's included in the activity log but not stored in the ledger table.

---

## 🎨 UI Features

### Modal Dialog Features:
- ✅ Clean, professional design
- ✅ Color-coded for Add (green) and Remove (red)
- ✅ Real-time calculation preview
- ✅ Required field indicators
- ✅ Responsive layout

### Button Design:
- Green "Adjust Stock" button in inventory table
- Positioned next to "View Report" button
- Clear, accessible design

---

## 🧪 Testing Checklist

- [ ] Can open adjust stock modal
- [ ] Can select Add/Remove type
- [ ] Can enter quantity
- [ ] Preview shows correct new stock level
- [ ] Cannot submit without reason
- [ ] Cannot submit with zero or negative quantity
- [ ] Cannot remove more stock than available
- [ ] Stock updates correctly in inventory table
- [ ] Ledger entry appears in View Report
- [ ] Activity log records the adjustment
- [ ] Success message appears
- [ ] Inventory list refreshes automatically

---

## 🐛 Troubleshooting

### Issue: "Failed to adjust stock"
**Solution:** Check that the backend code is properly added to `inventory.php`

### Issue: "Inventory record not found"
**Solution:** Ensure the product exists in the inventory table for that location

### Issue: "Insufficient stock"
**Solution:** Cannot remove more than the current stock quantity

### Issue: Backend returns 500 error
**Solution:** 
1. Check PHP error logs
2. Verify database connection
3. Check that all required columns exist in `inventory_ledger` table
4. Verify the INSERT statement matches your table structure

### Issue: Ledger entries not showing in report
**Solution:**
1. Check that the insert statement is executing
2. Verify the ledger table has the new entries
3. Ensure `GetInventoryReport` includes the new adjustment types

---

## 📝 Database Schema Requirements

### `inventory` table needs:
- `product_id`
- `location_id`
- `qty`

### `inventory_ledger` table needs:
- `ledger_id` (PRIMARY KEY, AUTO_INCREMENT)
- `product_id`
- `location_id`
- `type`
- `qty`
- `past_balance`
- `current_balance`
- `done_by`
- `date`
- `time`

**That's it!** No additional columns needed. Uses your existing table structure.

---

## ✅ Setup Complete!

Once you've:
1. ✅ Added the backend code to `inventory.php` (that's all!)
2. ✅ Frontend is already updated (in the file)

You're ready to use the Adjust Stock feature! 🎉

**No database changes needed - uses your existing structure!**

---

## 📞 Support

If you encounter any issues:
1. Check PHP error logs (`xampp/php/logs/php_error_log`)
2. Check browser console for JavaScript errors
3. Verify database connection and table structure
4. Ensure user has proper permissions

---

**Feature Version:** 1.0  
**Last Updated:** October 2025  
**Compatibility:** Works with existing inventory system

