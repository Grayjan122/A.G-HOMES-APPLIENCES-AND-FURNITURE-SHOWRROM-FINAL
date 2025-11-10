# Inventory Thresholds Setup Guide

## 📋 Overview
This feature allows users to set custom minimum and maximum inventory thresholds for each product in each store. When stock falls below these thresholds, the system will notify users that restocking is needed.

**Default Values:** Min = 1, Max = 2

---

## 🗄️ Step 1: Update Database

### Run the SQL Script

1. Open **phpMyAdmin** (http://localhost/phpmyadmin)
2. Select your database (usually `agdatabase`)
3. Click on the **SQL** tab
4. Copy and paste the contents of `setup_inventory_thresholds.sql`
5. Click **Go** to execute

**What this does:**
- Adds `min_threshold` column to `store_inventory` table (default: 1)
- Adds `max_threshold` column to `store_inventory` table (default: 2)
- Sets default values for existing records

---

## 💻 Step 2: Update Backend API

### Location
`C:\xampp\htdocs\capstone-api\api\inventory.php`

### What to Add

#### A. Add the UpdateThresholds Function

Copy the `UpdateThresholds` function from `backend-api-files/UPDATE_THRESHOLDS_PHP_CODE.php` and add it to your `inventory.php` file (before the switch statement).

#### B. Update GetInventory Function

Find your `GetInventory` function and modify the SELECT query to include the threshold columns:

**Before:**
```php
SELECT 
    si.store_inventory_id,
    si.location_id,
    si.product_id,
    si.qty,
    l.location_name,
    p.product_name,
    p.description
FROM store_inventory si
...
```

**After:**
```php
SELECT 
    si.store_inventory_id,
    si.location_id,
    si.product_id,
    si.qty,
    si.min_threshold,    -- ADD THIS
    si.max_threshold,    -- ADD THIS
    l.location_name,
    p.product_name,
    p.description
FROM store_inventory si
...
```

#### C. Add Switch Case

Find the switch statement in your `inventory.php` and add:

```php
switch ($operation) {
    // ... existing cases ...
    
    case 'UpdateThresholds':
        UpdateThresholds($json, $conn);
        break;
    
    // ... rest of cases ...
}
```

---

## ✅ Step 3: Verify Setup

1. **Test Database:**
   - Run: `DESCRIBE store_inventory;` in phpMyAdmin
   - Verify you see `min_threshold` and `max_threshold` columns

2. **Test Backend:**
   - Try saving thresholds from the frontend
   - Check browser console for any errors
   - Check PHP error logs if it fails

---

## 🎯 How It Works

1. **User clicks "Set Thresholds"** button on any inventory item
2. **Modal opens** showing current thresholds (defaults: min=1, max=2)
3. **User enters** custom min and max values
4. **System validates:**
   - Min and max must be >= 0
   - Min cannot be greater than max
5. **Backend saves** to `store_inventory` table
6. **Status display updates:**
   - **"Out of Stock"** - qty = 0
   - **"Below Minimum"** - qty < min_threshold
   - **"Low Stock"** - qty <= max_threshold (shows ⚠️ warning icon)
   - **"In Stock"** - qty > max_threshold

---

## 📝 Notes

- Default values are applied automatically if thresholds are NULL
- Each product-location combination can have different thresholds
- Thresholds persist across page refreshes
- The warning icon (⚠️) appears when stock needs restocking

---

## 🐛 Troubleshooting

**Issue: "Cannot save thresholds"**
- ✅ Check if database columns were added (run `DESCRIBE store_inventory;`)
- ✅ Verify backend function was added correctly
- ✅ Check PHP error logs in `C:\xampp\php\logs\php_error_log`
- ✅ Ensure switch case was added

**Issue: "Thresholds not showing in inventory list"**
- ✅ Verify GetInventory function includes `min_threshold` and `max_threshold` in SELECT
- ✅ Check browser console for API response errors

---

**Setup Complete!** 🎉

