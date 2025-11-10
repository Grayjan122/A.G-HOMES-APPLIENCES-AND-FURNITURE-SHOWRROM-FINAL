# ✅ Inventory API Updated - Product Availability Feature

## 🎯 What Was Added

Added a new operation to `inventory.php` to support the shop's product availability feature.

## 📝 New Function: `GetProductInventoryByLocation`

### Purpose
Returns inventory levels for a specific product across all locations (warehouses/stores).

### Location in Code
- **File:** `c:\xampp\htdocs\capstone-api\api\inventory.php`
- **Lines:** 351-377
- **Switch Case:** Line 529-531

### Function Code
```php
function GetProductInventoryByLocation($json)
{
    include 'conn.php';

    $json = json_decode($json, true);
    $productId = isset($json['productId']) ? (int) $json['productId'] : 0;

    // Get inventory for this product across all locations
    $sql = "SELECT 
                a.location_id,
                b.location_name,
                a.qty
            FROM store_inventory a
            INNER JOIN location b ON a.location_id = b.location_id
            WHERE a.product_id = :productId
            ORDER BY b.location_name ASC";

    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':productId', $productId, PDO::PARAM_INT);
    $stmt->execute();
    $returnValue = $stmt->fetchAll(PDO::FETCH_ASSOC);

    unset($conn);
    unset($stmt);

    return json_encode($returnValue);
}
```

### Switch Case Addition
```php
case 'GetProductInventoryByLocation':
    echo $user->GetProductInventoryByLocation($json);
    break;
```

## 📊 Request Format

**Endpoint:** `http://localhost/capstone-api/api/inventory.php`

**Method:** GET

**Parameters:**
- `operation`: `GetProductInventoryByLocation`
- `json`: `{"productId": 123}`

**Example Call:**
```javascript
axios.get('http://localhost/capstone-api/api/inventory.php', {
  params: {
    json: JSON.stringify({ productId: 123 }),
    operation: 'GetProductInventoryByLocation'
  }
});
```

## 📤 Response Format

Returns an array of objects:

```json
[
  {
    "location_id": "1",
    "location_name": "Main Warehouse",
    "qty": "50"
  },
  {
    "location_id": "2",
    "location_name": "Store A",
    "qty": "15"
  },
  {
    "location_id": "3",
    "location_name": "Store B",
    "qty": "0"
  }
]
```

## 🔗 How It's Used

### Shop Page Implementation
When a customer clicks "View Details" on a product:

1. Product modal opens
2. `fetchProductInventory(productId)` is called
3. API returns inventory across all locations
4. Displays in a table showing availability

### Display Example
```
┌────────────────────────────────────┐
│ Availability by Location           │
├───────────────┬──────┬─────────────┤
│ Location      │ Stock│ Status      │
├───────────────┼──────┼─────────────┤
│ Main Warehouse│  50  │ ✓ In Stock  │
│ Store A       │  15  │ ✓ In Stock  │
│ Store B       │   0  │ ✗ Out of Stock│
└───────────────┴──────┴─────────────┘
```

## ✅ Testing

### Test with Browser Console
```javascript
fetch('http://localhost/capstone-api/api/inventory.php?operation=GetProductInventoryByLocation&json={"productId":1}')
  .then(r => r.json())
  .then(d => console.log('Inventory:', d))
  .catch(e => console.error('Error:', e));
```

### Expected Result
Should return inventory for product ID 1 across all locations.

## 🔍 SQL Query Explanation

```sql
SELECT 
    a.location_id,        -- Location identifier
    b.location_name,      -- Human-readable location name
    a.qty                 -- Stock quantity at this location
FROM store_inventory a
INNER JOIN location b ON a.location_id = b.location_id
WHERE a.product_id = :productId
ORDER BY b.location_name ASC
```

**What it does:**
- Joins `store_inventory` with `location` table
- Filters by specific product ID
- Returns all locations that have (or had) this product
- Orders alphabetically by location name

## 📋 Database Tables Used

1. **store_inventory**
   - `product_id` - Which product
   - `location_id` - Which location
   - `qty` - How many units

2. **location**
   - `location_id` - Location ID
   - `location_name` - Display name

## 🎯 Integration Points

### Frontend (Shop Page)
- **File:** `app/shop/page.js`
- **Function:** `fetchProductInventoryByLocation(productId)`
- **Trigger:** Product detail modal opens

### Backend (Inventory API)
- **File:** `c:\xampp\htdocs\capstone-api\api\inventory.php`
- **Function:** `GetProductInventoryByLocation($json)`
- **Operation:** `GetProductInventoryByLocation`

## 🚀 Benefits

1. **Customer Transparency:** Customers can see which locations have stock
2. **Informed Decisions:** Helps customers choose pickup location
3. **Stock Visibility:** Shows real-time availability
4. **Multi-location Support:** Works across all warehouses/stores

## 📝 Notes

- Returns ALL locations where the product exists in inventory
- Includes locations with 0 stock (out of stock)
- Ordered alphabetically by location name for consistency
- Uses prepared statements for security (SQL injection protection)
- Follows same pattern as other inventory functions

---
**Added:** October 28, 2025
**Purpose:** Shop product availability feature
**Status:** ✅ Ready for production

