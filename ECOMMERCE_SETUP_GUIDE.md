# E-commerce Shop Setup Guide

## 🎉 Overview

A complete e-commerce shop has been created for your A.G Home Appliance & Furniture system with the following features:

✅ Product browsing with filtering and search
✅ Customer authentication (login/signup)
✅ Product details with location-based inventory availability
✅ Shopping cart functionality
✅ Responsive design
✅ Beautiful modern UI

---

## 📁 Files Created

### Frontend Files:
1. **`app/shop/page.js`** - Main e-commerce page
2. **`app/css/shop.css`** - Styling for the shop

### Backend Files (to be added to your PHP API):
1. **`customer_api_backend.php`** - Save as `customer.php` in your API directory
2. **`inventory_api_update.php`** - Code to add to your existing `inventory.php`

### Database Setup:
1. **`customer_database_setup.sql`** - SQL script to create customer tables

---

## 🚀 Setup Instructions

### Step 1: Database Setup

Run the SQL script to create necessary tables:

```bash
# Open your database management tool (phpMyAdmin, MySQL Workbench, etc.)
# Run the customer_database_setup.sql file
```

This creates:
- `customers` table - stores customer accounts
- `customer_orders` table - tracks orders
- `customer_order_items` table - order details
- `customer_wishlist` table - customer wishlists

### Step 2: Backend API Setup

1. **Copy customer.php to your API directory:**
   ```bash
   # Copy customer_api_backend.php to:
   C:\xampp\htdocs\capstone-api\api\customer.php
   ```

2. **Update inventory.php:**
   - Open your existing `inventory.php` file
   - Add the `GetProductInventoryByLocation` operation from `inventory_api_update.php`
   - Add this case to your switch statement:
   ```php
   case 'GetProductInventoryByLocation':
       getProductInventoryByLocation($json, $conn);
       break;
   ```

### Step 3: Add Default Product Image

Create a default product image:
- Add an image at: `public/assets/images/default-product.png`
- This will be used when products don't have images

### Step 4: Test the Shop

1. **Start your development server:**
   ```bash
   npm run dev
   ```

2. **Access the shop:**
   ```
   http://localhost:3000/shop
   ```

3. **Test customer signup:**
   - Click "Login / Sign Up"
   - Switch to "Sign Up" tab
   - Create a test account
   - Login with the credentials

4. **Test features:**
   - Search for products
   - Filter by category
   - Sort by price
   - View product details
   - Check inventory by location
   - Add items to cart

---

## 🎨 Features

### 1. **Product Browsing**
- Grid layout with product cards
- Product images, names, descriptions, prices
- Pagination for easy navigation
- Responsive design for all devices

### 2. **Advanced Filtering**
- **Search** - Search by product name, description, or color
- **Category Filter** - Filter by product category
- **Price Range** - Set min/max price range
- **Sort Options** - Sort by name or price

### 3. **Customer Authentication**
- **Login** - Secure login with email and password
- **Sign Up** - Create new customer account
- **Session Management** - Persistent login using sessionStorage
- **Password Security** - Passwords hashed with bcrypt

### 4. **Product Details Modal**
- Large product image
- Full description
- Specifications (color, material, dimensions)
- **Location Availability Table** - Shows stock at each location
- Visual stock status indicators

### 5. **Shopping Cart**
- Add/remove items
- Adjust quantities
- Real-time total calculation
- Persistent cart (saved per customer)
- Cart counter in header

### 6. **Responsive Design**
- Mobile-friendly
- Tablet-optimized
- Desktop layout
- Touch-friendly controls

---

## 🎯 User Flow

### For New Customers:
1. Visit `/shop`
2. Browse products
3. Click "Login / Sign Up"
4. Create account with:
   - Full name
   - Email
   - Phone
   - Address
   - Password
5. Login automatically redirected
6. Start shopping!

### For Existing Customers:
1. Visit `/shop`
2. Click "Login / Sign Up"
3. Enter email and password
4. Browse and shop
5. Add items to cart
6. View cart
7. (Checkout - to be implemented)

---

## 🔧 Customization

### Change Colors:
Edit `app/css/shop.css` - Look for gradient colors:
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

### Add More Filters:
In `app/shop/page.js`, add new filter states and logic in the `filterAndSortProducts` function.

### Modify Product Card Layout:
Update the `.product-card` class in `shop.css`.

---

## 🌐 API Endpoints

### Customer Operations:

**1. Customer Login**
```
GET /api/customer.php?operation=CustomerLogin
JSON: { "email": "customer@example.com", "password": "password123" }
```

**2. Customer Signup**
```
GET /api/customer.php?operation=CustomerSignup
JSON: {
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "09123456789",
  "address": "123 Main St",
  "password": "password123"
}
```

**3. Get Customer by ID**
```
GET /api/customer.php?operation=GetCustomerById
JSON: { "customer_id": 1 }
```

### Inventory Operations:

**Get Product Inventory by Location**
```
GET /api/inventory.php?operation=GetProductInventoryByLocation
JSON: { "productId": 19 }
```

---

## 📊 Database Schema

### customers table:
```sql
- customer_id (PK)
- cust_name
- email (UNIQUE)
- phone
- address
- password (hashed)
- status (Active/Inactive)
- date_created
- last_login
```

### customer_orders table:
```sql
- order_id (PK)
- customer_id (FK)
- order_number
- total_amount
- status
- payment_method
- payment_status
- shipping_address
- order_date
```

---

## 🔒 Security Features

- ✅ Password hashing with bcrypt
- ✅ SQL injection prevention (prepared statements)
- ✅ XSS protection
- ✅ CORS headers configured
- ✅ Session validation
- ✅ Input sanitization

---

## 📱 Screenshots of Features

The shop includes:
- Modern gradient header with logo
- Clean product grid layout
- Modal-based authentication
- Detailed product view with availability
- Shopping cart with quantity controls
- Responsive filters and search

---

## 🎁 Next Steps (Optional Enhancements)

1. **Checkout System**
   - Payment integration
   - Order confirmation
   - Email receipts

2. **Customer Dashboard**
   - Order history
   - Profile management
   - Address book

3. **Product Reviews**
   - Rating system
   - Customer reviews
   - Review moderation

4. **Wishlist**
   - Save favorite items
   - Share wishlist
   - Move to cart

5. **Product Recommendations**
   - "Similar products"
   - "You may also like"
   - "Best sellers"

---

## 🐛 Troubleshooting

### Products not showing:
- Check if `GetProduct2` operation exists in `products.php`
- Verify database has products
- Check browser console for errors

### Can't login:
- Verify `customer.php` is in the correct API directory
- Check CORS headers are set
- Verify database table exists
- Check browser network tab for API responses

### Images not loading:
- Add default image at `public/assets/images/default-product.png`
- Check product image paths in database
- Verify Cloudinary config (if using)

### Cart not persisting:
- Check browser localStorage is enabled
- Verify customer is logged in
- Check sessionStorage for customer_id

---

## 📞 Support

If you encounter issues:
1. Check browser console for JavaScript errors
2. Check network tab for failed API calls
3. Verify PHP error logs
4. Check database connection
5. Ensure all files are in correct locations

---

## ✅ Checklist

- [ ] Run `customer_database_setup.sql` in database
- [ ] Copy `customer.php` to API directory
- [ ] Update `inventory.php` with new operation
- [ ] Add default product image
- [ ] Test signup and login
- [ ] Test product browsing
- [ ] Test cart functionality
- [ ] Test on mobile device

---

**Version:** 1.0
**Created:** October 2025
**Compatible with:** Your existing A.G Home Appliance system

🎉 **Enjoy your new e-commerce shop!**

