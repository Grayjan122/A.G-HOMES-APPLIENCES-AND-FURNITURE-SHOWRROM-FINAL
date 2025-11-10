# 📊 Product Inventory by Location - Shop Feature

## ✅ Updated to Match Inventory System Pattern

The product availability feature now uses the same code pattern as the main inventory management system.

## 🔧 Implementation

### Function: `fetchProductInventory(productId)`

**Purpose:** Fetch inventory levels for a specific product across all locations

**API Call:**
```javascript
const response = await axios.get(`${BASE_URL}inventory.php`, {
  params: {
    json: JSON.stringify({ productId: productId }),
    operation: 'GetProductInventoryByLocation'
  },
  timeout: 10000
});
```

### Pattern Consistency

**Matches your inventory system:**
```javascript
// Your inventory system (inventoryIM.js)
const response = await axios.get(`${baseURL}inventory.php`, {
  params: {
    json: JSON.stringify({ locID, stockLevel, search: searchProd }),
    operation: "GetInventory"
  }
});

// Shop product availability (shop/page.js)
const response = await axios.get(url, {
  params: {
    json: JSON.stringify({ productId: productId }),
    operation: 'GetProductInventoryByLocation'
  },
  timeout: 10000
});
```

## 🎯 When It's Called

The function is triggered when:
1. Customer clicks "View Details" on a product
2. Product detail modal opens
3. Automatically fetches inventory for that product across all locations

## 📝 Console Logging

When working correctly, you'll see:
```
📊 Fetching inventory for product: 123
✅ Inventory response: [{location_id: 1, location_name: "Warehouse A", qty: 50}, ...]
✅ Loaded inventory for 3 locations
```

If there's an issue:
```
❌ Error fetching product inventory: Network Error
Error details: {...}
```

## 🎨 Display in Product Modal

The inventory data is displayed in a table:

```
┌─────────────────────────────────────┐
│ Availability by Location            │
├──────────────┬──────┬───────────────┤
│ Location     │ Stock│ Status        │
├──────────────┼──────┼───────────────┤
│ Warehouse A  │ 50   │ ✓ In Stock    │
│ Store B      │ 5    │ ✓ In Stock    │
│ Store C      │ 0    │ ✗ Out of Stock│
└──────────────┴──────┴───────────────┘
```

## 🔍 Expected Response Format

The API should return an array of objects:
```javascript
[
  {
    location_id: 1,
    location_name: "Warehouse A",
    qty: 50
  },
  {
    location_id: 2,
    location_name: "Store B",
    qty: 5
  },
  {
    location_id: 3,
    location_name: "Store C",
    qty: 0
  }
]
```

## 📋 Backend Requirements

Your `inventory.php` needs to handle the operation:

```php
case 'GetProductInventoryByLocation':
    $data = json_decode($_GET['json'], true);
    $productId = $data['productId'];
    
    $query = "SELECT 
                i.location_id,
                l.location_name,
                i.qty
              FROM inventory i
              LEFT JOIN location l ON i.location_id = l.location_id
              WHERE i.product_id = ?
              ORDER BY l.location_name";
    
    $stmt = $conn->prepare($query);
    $stmt->bind_param("i", $productId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $inventory = [];
    while($row = $result->fetch_assoc()) {
        $inventory[] = $row;
    }
    
    echo json_encode($inventory);
    break;
```

## ✅ Benefits

- **Consistent Code:** Uses same pattern as main inventory system
- **Better Debugging:** Detailed console logs
- **Error Handling:** Gracefully handles failures
- **Timeout Protection:** 10-second timeout prevents hanging

## 🧪 Testing

1. **Open product details:**
   - Click "View Details" on any product
   - Check browser console for logs

2. **Verify data:**
   - Should show inventory for all locations
   - Quantities should match database

3. **Test edge cases:**
   - Product with no inventory
   - Product in some locations only
   - Out of stock everywhere

## 🔗 Related Files

- **Shop Page:** `app/shop/page.js` - Calls the function
- **Backend API:** `inventory.php` - Handles the request
- **Inventory System:** `app/Contents/inventory-contents/inventoryIM.js` - Reference pattern

---
**Updated:** October 28, 2025
**Pattern:** Matches main inventory system
**Status:** ✅ Ready for use

