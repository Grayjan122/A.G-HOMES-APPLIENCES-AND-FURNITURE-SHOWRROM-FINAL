# 🚚 Delivery Tracking - Quick Start Guide

## 🎯 What Was Built

A complete delivery management system that:
- Tracks deliveries from production to customer's door
- Sends automatic email notifications to customers
- Manages driver assignments
- **Starts installment schedules ONLY after delivery completion** (not at purchase time)

---

## 🚀 How to Use (Sales Clerk)

### Step 1: Access Delivery Tracking
1. Log in as Sales Clerk
2. Click **"DELIVERY TRACKING"** in the sidebar
3. You'll see 4 tabs:
   - 📦 **Ready for Delivery** - Items ready to ship
   - 🚚 **On Delivery** - Items currently being delivered
   - ✅ **Completed** - Successfully delivered items
   - ⏳ **Pending** - Items still in production

### Step 2: Start a Delivery
1. Go to **"Ready for Delivery"** tab
2. Find the order you want to deliver
3. Click **"Start Delivery"** button
4. Enter the driver's name
5. Click **"Start Delivery"** to confirm

**What happens:**
- Status changes to "On Delivery"
- Customer receives email: "Your order is on the way! Driver: [Name]"
- Tracking record is created

### Step 3: Complete a Delivery
1. When driver confirms delivery, go to **"On Delivery"** tab
2. Find the delivered order
3. Click **"Mark as Delivered"** button
4. Confirm completion

**What happens:**
- Status changes to "Delivered"
- Customer receives email: "Your order has been delivered!"
- **If installment plan:** Schedule is activated starting from TODAY
- Tracking record is created with completion date/time

---

## 💡 Key Features

### Search Functionality
Use the search bar to find orders by:
- Customer name
- Invoice number
- Driver name

### Installment Schedule Logic ⚠️ IMPORTANT
**OLD WAY (WRONG):**
- Purchase Date: Oct 10
- First Payment Due: Nov 10
- Problem: Customer hasn't received item yet!

**NEW WAY (CORRECT):**
- Purchase Date: Oct 10
- Delivery Date: Oct 25
- First Payment Due: Nov 25 ✅
- Customer has the item before paying!

### Status Meanings

| Status | Icon | Meaning | Action Available |
|--------|------|---------|------------------|
| Pending | ⏳ | Still being made (customization) | None (wait) |
| Ready for Delivery | 📦 | Ready to ship | Start Delivery |
| On Delivery | 🚚 | Driver is delivering | Mark as Delivered |
| Delivered | ✅ | Customer received item | None (complete) |

---

## 📧 Customer Notifications

### Automatic Emails Sent:

1. **"On Delivery" Email**
   - Subject: "Your Order is On the Way! 🚚"
   - Includes: Invoice #, Driver name, Order details
   - Sent when: Sales clerk clicks "Start Delivery"

2. **"Delivered" Email**
   - Subject: "Your Order Has Been Delivered! ✅"
   - Includes: Invoice #, Thank you message
   - Sent when: Sales clerk clicks "Mark as Delivered"

---

## 🎨 What You'll See

### Delivery Card Example:
```
┌─────────────────────────────────────┐
│ Invoice #187        [Ready for Delivery] │
├─────────────────────────────────────┤
│ 👤 Customer: Juan Dela Cruz         │
│ 📧 Email: juan@example.com          │
│ 📦 Items: 3 item(s)                 │
│ 💰 Total: ₱45,000.00                │
│ 📍 Address: 123 Main St, Manila     │
│ 💳 Payment: 6 months installment    │
│                                      │
│ ⚠️ Installment schedule will start  │
│    upon delivery completion          │
├─────────────────────────────────────┤
│       [🚚 Start Delivery]           │
└─────────────────────────────────────┘
```

---

## 🗂️ Files Created

### Frontend:
- `app/Contents/saleClearkContents/deliveryTracking.js` - Main page component
- `app/Contents/saleClearkContents/deliveryTracking.css` - Styling

### Backend:
- `C:\xampp\htdocs\capstone-api\api\delivery-management.php` - API endpoints

### Updated:
- `app/Components/Sidebar-SalesClerk/page.js` - Added delivery tracking menu

---

## ✅ Testing Checklist

Before going live, test:

- [ ] Can view all delivery statuses in tabs
- [ ] Can search for orders
- [ ] "Start Delivery" requires driver name
- [ ] Customer receives email when delivery starts
- [ ] Can mark delivery as complete
- [ ] Customer receives email when delivered
- [ ] Installment schedule starts from delivery date (check database)
- [ ] Works on mobile devices

---

## 🔧 Database Tables Used

| Table | Purpose |
|-------|---------|
| `deliver_to_customer` | Main delivery record (status, driver, notes) |
| `deliver_to_customer_details` | Items being delivered |
| `deliver_to_customer_tracking` | Status history with timestamps |
| `installment_sales` | Installment plan details |
| `installment_payment_sched` | Monthly payment schedule |
| `invoice` | Links delivery to customer |
| `customers` | Customer email and info |

---

## ⚠️ Important Notes

1. **Driver Name is Required**
   - Cannot start delivery without driver name
   - Driver name is sent to customer in email

2. **Installment Schedules**
   - Only activated when item is delivered
   - Payment dates calculated from delivery date
   - Old schedules are deleted and recreated

3. **Email Notifications**
   - Sent automatically
   - If email fails, delivery still proceeds
   - Check SMTP settings if emails not sending

4. **Status Flow**
   - Must follow: Pending → Ready → On Delivery → Delivered
   - Cannot skip or reverse statuses

---

## 🆘 Troubleshooting

### Emails Not Sending?
1. Check SMTP credentials in `delivery-management.php`
2. Verify Gmail app password is correct
3. Check PHP error log for email errors

### Installment Schedule Not Starting?
1. Verify delivery is marked as "Delivered"
2. Check `installment_payment_sched` table for new dates
3. Dates should be from delivery date, not purchase date

### Can't See Deliveries?
1. Check if orders have delivery address (needsDelivery = true)
2. Verify data exists in `deliver_to_customer` table
3. Check browser console for API errors

---

## 📞 Support

If you encounter issues:
1. Check browser console (F12) for errors
2. Check PHP error log: `C:\xampp\apache\logs\error.log`
3. Verify all database tables exist
4. Ensure XAMPP Apache and MySQL are running

---

**Quick Reference:**
- **Menu Location:** Sales Clerk Sidebar → "DELIVERY TRACKING"
- **API Endpoint:** `http://localhost/capstone-api/api/delivery-management.php`
- **Main Operations:** GetDeliveries, UpdateDeliveryStatus, CompleteDelivery, SendCustomerNotification

---

**Status:** ✅ Ready to Use  
**Created:** October 25, 2025

