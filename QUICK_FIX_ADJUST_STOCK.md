# 🚀 QUICK FIX: Adjust Stock Not Working

## The Problem
Modal opens but saving fails with error message.

## The Solution (3 Steps)

### Step 1: Find Your inventory.php File

**Common locations:**
- `C:\xampp\htdocs\capstone-api\api\inventory.php`
- `C:\xampp\htdocs\your-api-folder\inventory.php`

**Can't find it?** Search your computer for "inventory.php"

---

### Step 2: Open inventory.php and Find the Switch Statement

Look for something like this:
```php
<?php
// ... connection code ...

$operation = $_GET['operation'];
$jsonData = $_GET['json'];

switch($operation) {
    case 'GetInventory':
        // code here
        break;
    
    case 'GetInventoryReport':
        // code here
        break;
    
    // YOUR CODE GOES HERE!
    
    default:
        echo json_encode(['error' => 'Invalid operation']);
        break;
}
?>
```

---

### Step 3: Add This Code BEFORE the `default:` or closing `}`

Copy this entire block and paste it:

```php
    case 'AdjustStock':
        // Get the JSON data
        $json = json_decode($jsonData, true);
        
        $product_id = $json['product_id'];
        $location_id = $json['location_id'];
        $adjustment_type = $json['adjustment_type'];
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
                $ledger_qty = $quantity;
            } else {
                $new_qty = $current_qty - $quantity;
                $ledger_qty = $quantity;
                
                if ($new_qty < 0) {
                    $conn->rollback();
                    echo json_encode(['success' => false, 'message' => 'Insufficient stock. Current stock: ' . $current_qty]);
                    exit;
                }
            }
            
            // Update inventory
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
            
            $stmt->bind_param("iisiiii", $product_id, $location_id, $ledger_type, $ledger_qty, $past_balance, $new_qty, $user_id);
            
            if (!$stmt->execute()) {
                $conn->rollback();
                echo json_encode(['success' => false, 'message' => 'Failed to create ledger entry']);
                exit;
            }
            
            // Commit
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

**Important:** Make sure you add it BEFORE the closing `}` of the switch statement!

---

### Step 4: Save the File

Press **Ctrl+S** to save inventory.php

---

### Step 5: Test It!

**Option A: Use the Test File**
1. Open `test_adjust_backend.html` in your browser
2. Fill in your values (product_id, location_id, etc.)
3. Click "Test Adjust Stock"
4. Should see success message

**Option B: Test in Your App**
1. Refresh your inventory page
2. Click "Adjust Stock"
3. Enter quantity
4. Click "Add Stock"
5. Should work! ✅

---

## Still Not Working?

### Check These:

**1. Is XAMPP running?**
- Apache: Must be green/running
- MySQL: Must be green/running

**2. Open browser console (F12)**
- What error do you see?
- Copy the exact error message

**3. Check Apache error logs**
- Location: `C:\xampp\apache\logs\error.log`
- Open it and look at the bottom
- Any PHP errors?

**4. Database connection variable**
- In your inventory.php, what's your database connection variable called?
- Is it `$conn`? If not, change all `$conn` in the code above to match yours
- Common names: `$conn`, `$connection`, `$db`

---

## Common Error Messages & Solutions

### "Inventory record not found"
**Problem:** Product doesn't exist in inventory table for that location

**Solution:** 
```sql
-- Check if record exists
SELECT * FROM inventory WHERE product_id = 1 AND location_id = 1;

-- If no result, insert a record first
INSERT INTO inventory (product_id, location_id, qty) VALUES (1, 1, 0);
```

### "Failed to create ledger entry"
**Problem:** Column mismatch in inventory_ledger table

**Solution:** Check your table columns:
```sql
DESCRIBE inventory_ledger;
```

Make sure you have these columns:
- product_id
- location_id
- type
- qty
- past_balance
- current_balance
- done_by
- date
- time

### "Missing required fields"
**Problem:** Data not being sent correctly

**Solution:** Check browser console (F12) → Network tab → Click on inventory.php request → Check the payload

---

## Video Guide (What to Do)

1. **Find** inventory.php file (in your API folder)
2. **Open** it in VS Code or Notepad++
3. **Find** the line with `switch($operation)` 
4. **Scroll down** to where you see `case 'GetInventory':` or similar
5. **After the last case**, BEFORE the closing `}`, paste the code
6. **Save** the file (Ctrl+S)
7. **Refresh** your browser
8. **Test** adjust stock

---

## Need Help?

Tell me:
1. ✅ Did you add the code to inventory.php?
2. ✅ Did you save the file?
3. What error message appears when you try to adjust stock?
4. What's in the browser console (F12)?

I'll help you fix it! 🔧

