# Delivery Receipt Backend Setup

## Overview
The frontend has been updated to include a **mandatory delivery receipt field** when starting a delivery. The backend needs to be updated to handle and store this data.

---

## Database Changes

### Update `delivery_to_customer` Table
Add a `delivery_receipt` column to store the receipt number:

```sql
ALTER TABLE `delivery_to_customer`
ADD COLUMN `delivery_receipt` VARCHAR(255) NULL AFTER `driver_name`;
```

**Note:** Check if this column already exists before running the ALTER TABLE command.

---

## Backend Changes

### File: `delivery-management.php`

#### Update `UpdateDeliveryStatus` Function

The function now receives `delivery_receipt` from the frontend. Update the SQL to include this field:

**Current Parameters Received:**
```php
{
    "dtc_id": 123,
    "status": "On Delivery To Customer",
    "driver_name": "John Doe",
    "delivery_receipt": "DR-2025-001"  // NEW FIELD
}
```

**Updated SQL Query:**
```php
function UpdateDeliveryStatus($json)
{
    include 'conn.php';
    
    $json = json_decode($json, true);
    
    $dtc_id = isset($json['dtc_id']) ? (int) $json['dtc_id'] : 0;
    $status = isset($json['status']) ? $json['status'] : '';
    $driver_name = isset($json['driver_name']) ? $json['driver_name'] : '';
    $delivery_receipt = isset($json['delivery_receipt']) ? $json['delivery_receipt'] : ''; // NEW
    $date = date("Y-m-d");
    $time = date("H:i:s");
    
    if (empty($dtc_id) || empty($status)) {
        return json_encode("Error: Missing required parameters");
    }
    
    try {
        $conn->beginTransaction();
        
        // Update delivery status with receipt number
        $sql = "UPDATE `delivery_to_customer` 
                SET `status` = :status, 
                    `driver_name` = :driver_name,
                    `delivery_receipt` = :delivery_receipt
                WHERE `dtc_id` = :dtc_id";
        
        $stmt = $conn->prepare($sql);
        $stmt->bindParam(':status', $status, PDO::PARAM_STR);
        $stmt->bindParam(':driver_name', $driver_name, PDO::PARAM_STR);
        $stmt->bindParam(':delivery_receipt', $delivery_receipt, PDO::PARAM_STR); // NEW
        $stmt->bindParam(':dtc_id', $dtc_id, PDO::PARAM_INT);
        $stmt->execute();
        
        // Insert tracking record
        $trackSql = "INSERT INTO `delivery_to_customer_tracking` 
                     (`dtc_id`, `status`, `date`, `time`) 
                     VALUES (:dtc_id, :status, :date, :time)";
        
        $trackStmt = $conn->prepare($trackSql);
        $trackStmt->bindParam(':dtc_id', $dtc_id, PDO::PARAM_INT);
        $trackStmt->bindParam(':status', $status, PDO::PARAM_STR);
        $trackStmt->bindParam(':date', $date, PDO::PARAM_STR);
        $trackStmt->bindParam(':time', $time, PDO::PARAM_STR);
        $trackStmt->execute();
        
        $conn->commit();
        unset($conn);
        unset($stmt);
        unset($trackStmt);
        
        return json_encode("Success");
        
    } catch (PDOException $e) {
        if ($conn->inTransaction()) {
            $conn->rollBack();
        }
        error_log("UpdateDeliveryStatus - Error: " . $e->getMessage());
        unset($conn);
        return json_encode("Error: " . $e->getMessage());
    }
}
```

---

## Frontend Changes Summary (Already Completed)

✅ Added `deliveryReceipt` state  
✅ Added input field in "Start Delivery" modal  
✅ Added validation to ensure receipt number is mandatory  
✅ Included receipt number in API call to backend  
✅ Reset receipt state on modal close/success  
✅ Updated button disabled state to include receipt validation  
✅ **Display receipt in main delivery cards** (shows when available)  
✅ **Display receipt in delivery details modal**  
✅ **Display receipt in tracking timeline modal**  
✅ **Display receipt in completed deliveries modal**  

---

## UI Display Locations (Already Implemented)

The delivery receipt number now appears in:

1. **Main Delivery Cards** - Shows below driver name with 📄 icon
2. **Delivery Details Modal** - Displays in the info section at the top
3. **Tracking Timeline Modal** - Shows in the delivery summary section
4. **Completed Deliveries Modal** - Listed for each completed delivery

All displays are conditional - only shows if `delivery_receipt` exists in the data.

---

## Testing Checklist

After implementing backend changes:

1. ✅ Verify `delivery_receipt` column exists in database
2. ✅ Test starting a delivery with receipt number
3. ✅ Verify receipt number is saved to database
4. ✅ Test validation - modal should not allow submission without receipt number
5. ✅ Test validation - modal should not allow submission without driver name
6. ✅ Verify tracking record is created correctly
7. ✅ Test customer notification still works
8. ✅ Verify receipt number appears in all UI locations:
   - Main delivery cards
   - Delivery details modal
   - Tracking timeline modal
   - Completed deliveries modal

---

## Notes

- The delivery receipt field is **mandatory** - users cannot start a delivery without entering it
- The receipt number is sent to the backend as a string
- Consider implementing a receipt number format/pattern validation if needed (e.g., DR-YYYY-NNN)
- The backend should validate that the receipt number is unique if that's a business requirement

