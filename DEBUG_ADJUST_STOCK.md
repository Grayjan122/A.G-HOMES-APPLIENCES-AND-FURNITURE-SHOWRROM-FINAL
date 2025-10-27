# Debug: Adjust Stock Not Working

## Quick Checks ⚡

### 1. Did you add the backend code?
- [ ] Opened your `inventory.php` file (in your API folder)
- [ ] Added the `AdjustStock` case to the switch statement
- [ ] Saved the file

**Location:** Usually in `C:\xampp\htdocs\capstone-api\api\inventory.php`

---

## Step-by-Step Troubleshooting

### Step 1: Check if Modal Opens

**Test:** Click "Adjust Stock" button on any inventory item

**Expected:** Modal should open showing product details

**If modal doesn't open:**
- Check browser console for JavaScript errors (F12 → Console tab)
- Verify the button exists in the inventory table

**If modal opens:** ✅ Frontend is working, continue to Step 2

---

### Step 2: Check Browser Console

**Open Developer Tools:**
- Press **F12** in your browser
- Go to **Console** tab
- Clear any old messages

**Try to adjust stock and watch for:**
- Red error messages
- Network errors
- JavaScript errors

**Common errors and solutions:**

**Error: "Failed to adjust stock"**
→ Backend code not added or has errors

**Error: "Network Error" or "404"**
→ inventory.php file path is wrong or doesn't exist

**Error: "500 Internal Server Error"**
→ PHP error in backend code (check Apache error logs)

---

### Step 3: Check Network Request

**In Developer Tools:**
1. Go to **Network** tab
2. Clear the network log (🚫 icon)
3. Click "Adjust Stock" button
4. Enter quantity
5. Click "Add Stock" or "Remove Stock"

**Look for a request to `inventory.php` with operation "AdjustStock"**

**Check the request:**
- Click on the `inventory.php` request
- Go to **Payload** or **Request** tab
- Should see: `operation=AdjustStock`
- Should see: JSON data with product_id, location_id, etc.

**Check the response:**
- Go to **Response** tab
- Should see JSON: `{"success": true, ...}` or an error message

---

### Step 4: Verify Backend Code Was Added

**Open your `inventory.php` file and search for:**
```php
case 'AdjustStock':
```

**If NOT found:**
→ You need to add the backend code from `ADJUST_STOCK_BACKEND_CODE.php`

**If found:**
→ Continue to Step 5

---

### Step 5: Check PHP Syntax Errors

**Look at Apache error logs:**

**Location:** `C:\xampp\apache\logs\error.log`

**Open this file and look at the bottom for recent errors**

**Common PHP errors:**

**Parse error:**
→ Missing semicolon, bracket, or parenthesis in the code

**Fatal error:**
→ Wrong variable name or missing database connection

**Warning:**
→ Might still work but check what it says

---

### Step 6: Test Backend Directly

**Create a test file:** `test_adjust_stock.php` in your API folder

```php
<?php
include 'db_connection.php'; // Use your actual connection file name

// Test data
$test_data = [
    'product_id' => 1,  // Use a real product ID from your database
    'location_id' => 1, // Use a real location ID from your database
    'adjustment_type' => 'add',
    'quantity' => 5,
    'user_id' => 1  // Use a real user ID from your database
];

$jsonData = json_encode($test_data);
$operation = 'AdjustStock';

// Your AdjustStock code should be in inventory.php
// Include it or copy the case here to test

echo "Test complete. Check your inventory table.";
?>
```

**Run this file:** `http://localhost/capstone-api/api/test_adjust_stock.php`

---

### Step 7: Check Database Connection

**In your browser console (F12):**

Look for the baseURL:
```javascript
sessionStorage.getItem('baseURL')
```

**It should be something like:**
- `http://localhost/capstone-api/api/`
- `http://localhost/your-api-folder/`

**Test if it's correct:**

Open: `http://localhost/capstone-api/api/inventory.php?operation=GetInventory&json={}`

**Expected:** Should return JSON with inventory data

**If blank or error:**
→ Your API path is wrong or PHP file has errors

---

## Common Issues & Solutions

### Issue 1: "Failed to adjust stock" Error

**Cause:** Backend code not added or has errors

**Solution:**
1. Open `inventory.php`
2. Find the `switch($operation)` statement
3. Add the AdjustStock case from `ADJUST_STOCK_BACKEND_CODE.php`
4. Make sure it's BEFORE the closing `}` of the switch
5. Save the file

---

### Issue 2: Nothing Happens When Clicking Button

**Cause:** JavaScript error or modal not showing

**Solution:**
1. Open browser console (F12)
2. Look for red error messages
3. Check if `openAdjustModal` function exists
4. Verify the file `inventoryIM.js` was saved

---

### Issue 3: "Inventory record not found"

**Cause:** Product doesn't exist in inventory table for that location

**Solution:**
1. Check if the product has an inventory record
2. Run: `SELECT * FROM inventory WHERE product_id = ? AND location_id = ?`
3. If no record exists, you need to create it first

---

### Issue 4: Modal Opens But Submit Does Nothing

**Cause:** Network request not being sent

**Solution:**
1. Check browser console for errors
2. Verify baseURL is set correctly
3. Check Network tab to see if request is made
4. Make sure quantity is greater than 0

---

### Issue 5: "Insufficient stock" When Adding

**Cause:** Wrong logic or you're trying to remove (not add)

**Solution:**
1. Make sure you selected "Add Stock" (green option)
2. Check the adjustment_type in the request payload
3. Should be `"adjustment_type": "add"`

---

### Issue 6: Changes Not Saving to Database

**Cause:** Database transaction rolling back

**Solution:**
1. Check PHP error logs
2. Verify all table columns exist
3. Check SQL INSERT statement matches your table structure
4. Make sure database connection is working

---

## Quick Test Script

**Copy this into your browser console (F12):**

```javascript
// Check if the function exists
console.log('openAdjustModal exists:', typeof window.openAdjustModal !== 'undefined');

// Check baseURL
console.log('baseURL:', sessionStorage.getItem('baseURL'));

// Check user_id
console.log('user_id:', sessionStorage.getItem('user_id'));

// Check if inventory list has items
console.log('Page should have inventory items visible');
```

---

## Need More Help?

**Provide these details:**

1. **What happens when you click "Adjust Stock"?**
   - Modal opens or nothing happens?

2. **Browser console errors?**
   - Copy and paste any red error messages

3. **Network tab shows request to inventory.php?**
   - Yes/No
   - What's the response?

4. **Did you add the backend code?**
   - Yes/No
   - Where is your inventory.php file located?

5. **Apache error logs show anything?**
   - Check `C:\xampp\apache\logs\error.log`

---

## Quick Fix Checklist

```
Step 1: Did you add backend code?
□ Yes - Code added to inventory.php
□ No - Add code from ADJUST_STOCK_BACKEND_CODE.php

Step 2: Does modal open when you click button?
□ Yes - Frontend working
□ No - Check browser console for errors

Step 3: Check Network tab - is request made?
□ Yes - Request sent to server
□ No - JavaScript error, check console

Step 4: What's the response?
□ Success - Should work!
□ Error message - Read the error
□ 404 - Wrong API path
□ 500 - PHP error, check logs

Step 5: Check PHP error logs
□ No errors - Good!
□ Errors found - Fix them

Step 6: Test again
□ Works! ✅
□ Still broken - Provide error details
```

---

## Still Not Working?

**Let me know:**
1. Exact error message you see
2. Browser console output
3. Whether modal opens or not
4. If you added the backend code
5. Your baseURL value

I'll help you fix it! 🔧

