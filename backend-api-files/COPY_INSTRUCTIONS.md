# 📋 Backend API Files - Copy Instructions

## 📁 Files to Copy

This folder contains the backend PHP files for the e-commerce shop.

---

## ✅ Step-by-Step Instructions

### Step 1: Copy customer.php

**From:** 
```
C:\Users\USER\capstone2\backend-api-files\customer.php
```

**To:**
```
C:\xampp\htdocs\capstone-api\api\customer.php
```

**How to Copy:**
1. Open File Explorer
2. Navigate to `C:\Users\USER\capstone2\backend-api-files\`
3. Copy `customer.php`
4. Navigate to `C:\xampp\htdocs\capstone-api\api\`
5. Paste the file

---

### Step 2: Update inventory.php

**File to Edit:**
```
C:\xampp\htdocs\capstone-api\api\inventory.php
```

**Instructions:**
1. Open `inventory.php` in your code editor
2. Read `INVENTORY_PHP_UPDATE.txt` in this folder
3. Follow the 2 steps in that file:
   - Add the new function
   - Add the new case to the switch statement

**Or use the quick method:**
1. Open both files:
   - `backend-api-files/inventory_update_code.php` (in this folder)
   - `C:\xampp\htdocs\capstone-api\api\inventory.php` (existing file)
2. Copy the function and switch case from the update file
3. Paste into your existing inventory.php

---

### Step 3: Verify Files

After copying, verify these files exist:

```
C:\xampp\htdocs\capstone-api\api\
  ├── connection.php (existing)
  ├── customer.php (NEW - just copied)
  ├── inventory.php (UPDATED - added new operation)
  ├── products.php (existing)
  ├── category.php (existing)
  └── location.php (existing)
```

---

## 🧪 Test the API

### Test customer.php:

Open in browser:
```
http://localhost/capstone-api/api/customer.php
```

You should see:
```json
{"success":false,"message":"Invalid operation"}
```

This is good! It means the file is working.

### Test the new inventory operation:

Try this in your browser (replace 19 with any product_id):
```
http://localhost/capstone-api/api/inventory.php?operation=GetProductInventoryByLocation&json={"productId":19}
```

You should see JSON with inventory data.

---

## ✅ Quick Checklist

- [ ] customer.php copied to API folder
- [ ] inventory.php updated with new function
- [ ] inventory.php updated with new case
- [ ] Tested customer.php in browser
- [ ] Tested GetProductInventoryByLocation
- [ ] No PHP errors in error log

---

## 🐛 Troubleshooting

### Error: "connection.php not found"
**Fix:** Make sure customer.php is in the same folder as connection.php

### Error: "syntax error"
**Fix:** Check that you copied the entire function correctly

### No output / blank page
**Fix:** Check PHP error logs at `C:\xampp\php\logs\php_error_log`

### CORS errors in browser
**Fix:** The CORS headers are already included in customer.php

---

## 📞 Need Help?

If you encounter issues:
1. Check PHP error logs
2. Verify file paths
3. Test API endpoints in browser
4. Check database connection
5. Ensure XAMPP is running

---

## ✨ What These Files Do

### customer.php
- CustomerLogin - Authenticate customers
- CustomerSignup - Create new accounts
- GetCustomerById - Fetch customer details
- UpdateCustomer - Update customer info

### inventory.php (update)
- GetProductInventoryByLocation - Show stock at all locations

---

**Ready!** Once copied, your e-commerce shop will have full backend support! 🎉

