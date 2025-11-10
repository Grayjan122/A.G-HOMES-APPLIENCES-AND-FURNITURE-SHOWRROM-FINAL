# 🛒 E-Commerce with Separate Customer Tables

## ✅ Important: Data Separation

Your e-commerce shop now uses **SEPARATE tables** from your walk-in customer system!

---

## 📊 Database Structure

### Walk-In Customer System (EXISTING - UNTOUCHED):
```
customers              ← Walk-in customers (NO CHANGES)
customer_sales         ← Walk-in sales (NO CHANGES)
customer_sales_details ← Walk-in sale items (NO CHANGES)
```

### E-Commerce Shop System (NEW - SEPARATE):
```
ecommerce_customers      ← Online shop customers
ecommerce_orders         ← Online orders
ecommerce_order_items    ← Order line items
ecommerce_wishlist       ← Customer wishlists
ecommerce_cart           ← Shopping cart
```

---

## 🎯 Why Separate Tables?

✅ **Clean Separation**
- Walk-in customers and online customers don't mix
- Different data requirements
- Different business workflows

✅ **Data Integrity**
- No conflicts between systems
- Each system has its own ID sequence
- Independent of each other

✅ **Reporting**
- Easy to track online vs walk-in sales separately
- Clear metrics for each channel
- No confusion in analytics

---

## 🔑 Key Differences

### Walk-In Customers Table (`customers`):
```sql
- cust_id (existing ID)
- cust_name
- phone
- email
- address
- (No password field - not needed)
```

### E-Commerce Customers Table (`ecommerce_customers`):
```sql
- ecommerce_customer_id (separate ID)
- customer_name
- phone
- email (UNIQUE)
- address
- password (hashed for login)
- status (Active/Inactive)
- date_created
- last_login
```

---

## 🔐 Test Account

**Email:** shop@example.com  
**Password:** shop123

---

## 📁 Updated Files

### Database:
- ✅ `ecommerce_database_update.sql` - Creates separate tables

### Backend:
- ✅ `backend-api-files/customer.php` - Updated to use `ecommerce_customers`

### Frontend:
- ✅ `app/shop/page.js` - Updated to use correct field names

---

## ⚙️ Setup Steps

### 1. Run the Database Script:
```sql
-- Run this file:
ecommerce_database_update.sql
```

This creates:
- `ecommerce_customers` table
- `ecommerce_orders` table
- `ecommerce_order_items` table
- `ecommerce_wishlist` table
- `ecommerce_cart` table

### 2. Copy Backend Files:
```
Copy: backend-api-files/customer.php
To: C:\xampp\htdocs\capstone-api\api\customer.php
```

### 3. Update Inventory.php:
Add the location inventory function as before.

### 4. Test:
Visit: http://localhost:3000/shop

---

## 📊 How It Works

### When a customer signs up on the shop:
1. Account created in `ecommerce_customers` table
2. Password is hashed and stored
3. Customer can login to shop
4. **No impact on walk-in customer system**

### When a customer orders online:
1. Order created in `ecommerce_orders` table
2. Items saved in `ecommerce_order_items` table
3. Inventory deducted from `store_inventory`
4. **No impact on walk-in sales system**

---

## 🔍 Field Mapping

| Shop Frontend | Database Field | Table |
|---------------|----------------|-------|
| customer_id | ecommerce_customer_id | ecommerce_customers |
| customer_name | customer_name | ecommerce_customers |
| email | email | ecommerce_customers |
| phone | phone | ecommerce_customers |
| address | address | ecommerce_customers |

---

## ✅ Benefits

1. **No Data Corruption**
   - Walk-in and online customers separate
   - No risk of mixing data

2. **Independent Systems**
   - Online shop can be updated without affecting POS
   - POS can be updated without affecting shop

3. **Clear Analytics**
   - Easy to report on online vs walk-in sales
   - Track online customer growth separately

4. **Security**
   - Online customers have passwords
   - Walk-in customers don't need passwords
   - Different security requirements

---

## 🎯 What's Protected

### Your Existing Data (UNTOUCHED):
- ✅ All walk-in customers
- ✅ All customer sales
- ✅ All sale details
- ✅ All existing tables
- ✅ All existing relationships

### What's New:
- ✅ E-commerce customers (separate)
- ✅ E-commerce orders (separate)
- ✅ E-commerce wishlists (separate)

---

## 📝 Summary

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  WALK-IN SYSTEM          E-COMMERCE SYSTEM             │
│  (Existing)              (New)                         │
│                                                         │
│  customers               ecommerce_customers           │
│  customer_sales          ecommerce_orders              │
│  customer_sales_details  ecommerce_order_items         │
│                          ecommerce_wishlist            │
│                          ecommerce_cart                │
│                                                         │
│  ✅ UNTOUCHED             ✅ BRAND NEW                  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 Ready to Use!

1. Run `ecommerce_database_update.sql`
2. Copy `customer.php` to XAMPP
3. Visit http://localhost:3000/shop
4. Your walk-in system continues working normally!

**No conflicts, no data mixing, clean separation!** ✨

