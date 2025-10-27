# Adjust Stock Feature - Quick Reference

## ✅ What's Been Done (Frontend)

### File Modified: `app/Contents/inventory-contents/inventoryIM.js`

1. **Added State Variables** (lines 40-45)
   - Modal visibility control
   - Selected product tracking
   - Adjustment type (add/subtract)
   - Quantity and reason inputs

2. **Added Functions** (lines 234-319)
   - `openAdjustModal()` - Opens adjustment dialog
   - `closeAdjustModal()` - Closes and resets dialog
   - `handleAdjustStock()` - Makes API call to adjust stock

3. **Added UI Components** (lines 503-702)
   - Complete Adjust Stock Modal with:
     - Product information display
     - Add/Remove type selector
     - Quantity input with preview
     - Reason text area
     - Validation and error handling

4. **Updated Inventory Table** (line 1134-1170)
   - Added "Adjust Stock" button next to "View Report"
   - Green button styling

---

## 🔧 What YOU Need to Do (Backend Setup)

### Step 1: No Database Changes! ✅

**Good news!** This feature uses your existing database structure. No new columns needed.

### Step 2: Add Code to `inventory.php`

**Location:** Your backend `inventory.php` file (e.g., `C:\xampp\htdocs\capstone-api\api\inventory.php`)

**What to do:**
1. Open `inventory.php`
2. Find the `switch` statement that handles operations
3. Add the new case before the closing `}` of the switch
4. Copy the code from `ADJUST_STOCK_BACKEND_CODE.php`

**Example Structure:**
```php
switch($operation) {
    case 'GetInventory':
        // existing code
        break;
    
    case 'GetInventoryReport':
        // existing code
        break;
    
    case 'AdjustStock':  // ⭐ ADD THIS NEW CASE
        // Paste the code from ADJUST_STOCK_BACKEND_CODE.php here
        break;
        
    default:
        // default case
        break;
}
```

### Step 3: Test the Feature

1. **Start Your Servers**
   ```
   - XAMPP Apache: Running
   - XAMPP MySQL: Running
   - Next.js Dev Server: npm run dev
   ```

2. **Login as Inventory Manager**

3. **Go to Inventory Management**

4. **Click "Adjust Stock" on any product**

5. **Test Both Operations:**
   - ✅ Add stock
   - ✅ Remove stock
   - ✅ Check ledger shows adjustments

---

## 🎯 Quick Test Checklist

```
□ Backend code added to inventory.php (no database changes needed!)
□ inventory_ledger table exists with standard columns
□ Can open Adjust Stock modal
□ Can add stock (shows green)
□ Can remove stock (shows red)
□ Preview shows new stock level
□ Reason field is optional (can submit without it)
□ Cannot remove more than available stock
□ Success message appears
□ Inventory table updates automatically
□ Ledger shows adjustment entry
□ "View Report" shows new adjustment types
```

---

## 📁 Files Created

| File | Purpose |
|------|---------|
| `ADJUST_STOCK_FEATURE_SETUP.md` | Complete detailed setup guide |
| `ADJUST_STOCK_BACKEND_CODE.php` | Backend PHP code to copy |
| `setup_adjust_stock_feature.sql` | Database info (no changes needed) |
| `ADJUST_STOCK_QUICK_REFERENCE.md` | This quick reference |
| `ADJUST_STOCK_FLOW_DIAGRAM.txt` | Visual flow diagram |

---

## 🚀 Usage Example

### Adding Stock
1. Click "Adjust Stock"
2. Select "Add Stock"
3. Enter: `25`
4. Reason (optional): `Received from supplier - PO #12345`
5. Click "Add Stock"
6. ✅ Done!

### Removing Stock
1. Click "Adjust Stock"
2. Select "Remove Stock"
3. Enter: `5`
4. Reason (optional): `Damaged during inspection - unusable`
5. Click "Remove Stock"
6. ✅ Done!

---

## 🎨 UI Preview

```
┌─────────────────────────────────────┐
│  Adjust Stock                    × │
├─────────────────────────────────────┤
│                                     │
│  Product: ABC-123                   │
│  Description: Widget Pro            │
│  Store: Main Store                  │
│  Current Stock: 100 units           │
│                                     │
│  Adjustment Type *                  │
│  ⚪ Add Stock   ⚪ Remove Stock      │
│                                     │
│  Quantity *                         │
│  [_______________]                  │
│  New stock will be: 110 units       │
│                                     │
│  Reason for Adjustment (Optional)   │
│  [_____________________________]    │
│  [_____________________________]    │
│  [_____________________________]    │
│                                     │
├─────────────────────────────────────┤
│               [ Cancel ] [ Add Stock ] │
└─────────────────────────────────────┘
```

---

## 🔍 Ledger Entry Format

After adjustment, the inventory report will show:

```
Type: Stock Adjustment (Add)
Past Balance: 100
Qty: +10
Current Balance: 110
Date: Oct 27, 2025
Time: 2:30 PM
Done By: John Doe
```

---

## 📞 Need Help?

### Common Issues:

**Backend not responding?**
- Check `baseURL` in sessionStorage
- Verify PHP file location
- Check Apache error logs

**"Inventory record not found"?**
- Product must exist in inventory table for that location
- Check product_id and location_id are correct

**Adjustment not saving?**
- Check database transaction is committing
- Verify all table columns exist
- Check PHP error logs

---

## 🎉 You're Ready!

The frontend is complete. Just add the backend code and you're good to go!

**Time to complete setup:** ~3 minutes

**Complexity:** Easy ⭐

**Files to modify:** Just 1 (inventory.php)

**Database changes:** None! Uses existing structure ✅

