# 🛒 E-Commerce Shop - Quick Start

## 🚀 Access the Shop

Visit: **http://localhost:3000/shop**

---

## ⚡ Quick Setup (5 Minutes)

### 1. Database Setup
Run this SQL in your database:
```sql
-- See customer_database_setup.sql file
```

### 2. Backend API Setup
Copy `customer_api_backend.php` to:
```
C:\xampp\htdocs\capstone-api\api\customer.php
```

### 3. Update Inventory API
Add to your `inventory.php` the code from `inventory_api_update.php`

### 4. Done!
Visit: http://localhost:3000/shop

---

## 🎯 Features At a Glance

### 🔍 Browse Products
- **Search** - Find products by name, description, color
- **Filter** - By category and price range
- **Sort** - By name or price
- **Paginate** - 12 products per page

### 👤 Customer Account
- **Sign Up** - Create new account
- **Login** - Secure authentication
- **Session** - Stay logged in

### 📦 Product Details
- **View Details** - Full product information
- **Check Availability** - See stock at each location
- **Location Table** - Shows which branch has stock

### 🛒 Shopping Cart
- **Add to Cart** - Click to add products
- **Adjust Quantity** - Increase/decrease items
- **Remove Items** - Delete from cart
- **View Total** - Real-time price calculation
- **Persistent** - Cart saved per customer

---

## 🧪 Test Account

Use this to test (or create your own):

**Email:** customer@example.com
**Password:** password123

---

## 📱 Responsive Design

Works on:
- ✅ Desktop (1920px+)
- ✅ Laptop (1366px)
- ✅ Tablet (768px)
- ✅ Mobile (320px+)

---

## 🎨 Customization

### Change Brand Colors:
Edit `app/css/shop.css`:
```css
/* Find this gradient and change colors */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

### Change Items Per Page:
Edit `app/shop/page.js`:
```javascript
const ITEMS_PER_PAGE = 12; // Change this number
```

---

## 🔧 Common Issues & Fixes

### Products not showing?
✅ Check database has products
✅ Verify API connection
✅ Check browser console for errors

### Can't login?
✅ Run customer_database_setup.sql
✅ Check customer.php is in API folder
✅ Verify CORS headers in PHP

### Images not loading?
✅ Add default-product.png to public/assets/images/
✅ Check product image paths in database

---

## 📊 What's Included

### Frontend (React/Next.js):
- Modern, clean UI
- SweetAlert2 for notifications
- Responsive grid layout
- Modal windows
- Real-time search & filter

### Backend (PHP):
- Customer authentication
- Password hashing
- Inventory queries
- Location-based stock

### Database:
- Customer accounts
- Order tracking
- Wishlist support
- Secure authentication

---

## 🎁 Next Features to Add

Want to extend the shop? Consider:

1. **Checkout System** - Complete order processing
2. **Payment Gateway** - Accept online payments
3. **Order Tracking** - Customer order history
4. **Reviews & Ratings** - Product reviews
5. **Wishlist** - Save favorite items
6. **Email Notifications** - Order confirmations

---

## 📞 Need Help?

See full documentation in:
- **ECOMMERCE_SETUP_GUIDE.md** - Complete setup guide
- **customer_database_setup.sql** - Database schema
- **customer_api_backend.php** - Backend API code

---

## ✅ Quick Checklist

Before launching:
- [ ] Database tables created
- [ ] customer.php in API directory
- [ ] inventory.php updated
- [ ] Default product image added
- [ ] Tested signup
- [ ] Tested login
- [ ] Tested product browsing
- [ ] Tested cart
- [ ] Tested on mobile

---

**Ready to shop!** 🎉

Access at: http://localhost:3000/shop

