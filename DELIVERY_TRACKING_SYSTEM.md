# 🚚 Delivery Tracking System - Complete Implementation

## Overview
A comprehensive delivery tracking and management system has been implemented for the Sales Clerk role. This system manages the entire delivery lifecycle from production to final delivery, with automatic customer notifications and intelligent installment schedule management.

---

## 🎯 Key Features

### 1. **Delivery Status Management**
The system tracks four distinct delivery statuses:

- **Pending (In Production)** 🏭
  - Items are still being manufactured
  - Not yet ready for delivery
  - Typically applies to customization orders

- **Ready for Delivery** 📦
  - Items are manufactured and ready to ship
  - Sales clerk can assign a driver and initiate delivery

- **On Delivery** 🚚
  - Driver is actively delivering the order
  - Customer receives automatic notification with driver details
  - Tracking record is created

- **Delivered** ✅
  - Order has been successfully delivered to customer
  - Customer receives completion notification
  - Installment schedule is activated (if applicable)

### 2. **Customer Notification System**
Automatic email notifications are sent to customers at key stages:

#### On Delivery Notification
- Sent when sales clerk marks order as "On Delivery"
- Includes:
  - Invoice number
  - Driver name
  - Delivery status update
  - Professional HTML email template

#### Delivery Completion Notification
- Sent when order is marked as "Delivered"
- Confirms successful delivery
- Thanks customer for their purchase

### 3. **Installment Schedule Management** 💳
**CRITICAL FEATURE**: Installment schedules now start from the delivery completion date, NOT the purchase date.

#### How It Works:
1. When an installment purchase is made, the schedule is created but not activated
2. When the item is marked as "Delivered":
   - The old schedule is deleted
   - A new schedule is generated starting from the delivery date
   - Each payment is due on the same day of subsequent months

#### Example:
- Purchase Date: October 10, 2025
- Delivery Date: October 25, 2025
- 3-Month Installment Plan
- Payment Schedule:
  - Month 1: Due November 25, 2025
  - Month 2: Due December 25, 2025
  - Month 3: Due January 25, 2026

### 4. **Driver Assignment**
- Sales clerk must enter driver name before starting delivery
- Driver name is stored and displayed on all tracking views
- Included in customer notification emails

---

## 📁 Files Created

### Frontend Components

#### 1. `app/Contents/saleClearkContents/deliveryTracking.js`
Main delivery tracking page component featuring:
- Tab-based interface (Pending, Ready, On Delivery, Completed)
- Search functionality (by customer, invoice, driver)
- Real-time status updates
- Driver assignment modal
- Delivery completion confirmation
- Customer notification integration

#### 2. `app/Contents/saleClearkContents/deliveryTracking.css`
Comprehensive styling including:
- Modern gradient designs
- Responsive grid layout
- Status badges with color coding
- Animated loading states
- Professional modal dialogs
- Mobile-responsive design

### Backend API

#### 3. `C:\xampp\htdocs\capstone-api\api\delivery-management.php`
Backend PHP API with four main operations:

**GetDeliveries**
- Fetches deliveries filtered by status
- Joins multiple tables for comprehensive data
- Returns customer info, payment details, item counts

**UpdateDeliveryStatus**
- Updates delivery status to "On Delivery"
- Records driver name
- Creates tracking entry with timestamp

**CompleteDelivery**
- Marks delivery as "Delivered"
- Activates installment schedule (if applicable)
- Recalculates payment dates from delivery date
- Creates completion tracking entry

**SendCustomerNotification**
- Sends HTML email notifications
- Uses PHPMailer with SMTP
- Professional email templates
- Error logging and handling

---

## 🔄 Database Integration

### Tables Used

#### `deliver_to_customer`
Main delivery record:
- `dtc_id`: Primary key
- `invoice_id`: Link to invoice
- `notes`: Delivery address
- `preferred_date_delivery`: Customer's preferred date
- `driver_name`: Assigned driver
- `status`: Current delivery status

#### `deliver_to_customer_details`
Items being delivered:
- `dtcd_id`: Primary key
- `dtc_id`: Foreign key to deliver_to_customer
- `product_code`: Product identifier
- `product_description`: Item description
- `modifications`: Customization details
- `total_qty`: Quantity
- `price_per_item`: Unit price

#### `deliver_to_customer_tracking`
Status history and tracking:
- `dtct_id`: Primary key
- `dtc_id`: Foreign key to deliver_to_customer
- `status`: Status at this point in time
- `date`: Date of status change
- `time`: Time of status change

#### `installment_sales`
Installment payment information:
- `installment_id`: Primary key
- `invoice_id`: Link to invoice
- `months`: Number of payment months
- `total_amount`: Total sale amount
- `downpayment`: Initial payment

#### `installment_payment_sched`
Monthly payment schedule:
- `schedule_id`: Primary key
- `installment_id`: Foreign key to installment_sales
- `payment_month`: Month number (1, 2, 3, etc.)
- `amount_due`: Amount for this month
- `due_date`: Payment due date
- `status`: Payment status (Pending, Paid)

### Data Flow for Customer Email Retrieval
```
deliver_to_customer (invoice_id) 
  → invoice (invoice_id, cust_id) 
    → installment_sales (invoice_id, cust_id) 
      → customers (cust_id, email, fname, lname)
```

---

## 🎨 User Interface Features

### Delivery Tracking Page Layout

#### Header Section
- Page title with icon
- Brief description
- Search bar for filtering deliveries

#### Tab Navigation
- Four tabs with status indicators
- Badge counts showing number of items in each status
- Active tab highlighting

#### Delivery Cards
Each card displays:
- Invoice number (prominent header)
- Current status badge
- Customer name and email
- Total items count
- Total amount
- Delivery address (from notes)
- Preferred delivery date (if set)
- Driver name (if assigned)
- Payment plan type (Full Payment or X months)
- Installment warning (if applicable and not yet delivered)

#### Action Buttons
- **Ready for Delivery**: "Start Delivery" button
- **On Delivery**: "Mark as Delivered" button
- **Completed**: Shows delivery date
- **Pending**: Shows production message

#### Driver Modal
- Invoice summary
- Customer name and address
- Driver name input field
- Information message about customer notification
- Cancel and Confirm buttons

---

## 🚀 How to Use the System

### For Sales Clerks

#### 1. **Viewing Deliveries**
1. Navigate to "DELIVERY TRACKING" in the sidebar
2. Select a tab to filter deliveries:
   - **Ready for Delivery**: Items ready to be shipped
   - **On Delivery**: Currently in transit
   - **Completed**: Successfully delivered
   - **Pending**: Still in production

#### 2. **Starting a Delivery**
1. Find the order in "Ready for Delivery" tab
2. Click "Start Delivery" button
3. Enter the driver's name in the modal
4. Click "Start Delivery" to confirm
5. System will:
   - Update status to "On Delivery"
   - Record driver name
   - Send notification to customer
   - Create tracking entry

#### 3. **Completing a Delivery**
1. Find the order in "On Delivery" tab
2. Click "Mark as Delivered" button
3. Confirm the delivery completion
4. System will:
   - Update status to "Delivered"
   - Send completion notification to customer
   - Activate installment schedule (if applicable)
   - Create tracking entry with date/time

#### 4. **Searching for Orders**
- Use the search bar to filter by:
  - Customer name
  - Invoice number
  - Driver name

---

## 🔧 Technical Implementation Details

### Frontend Architecture

#### State Management
```javascript
const [deliveries, setDeliveries] = useState([]);
const [loading, setLoading] = useState(true);
const [activeTab, setActiveTab] = useState('ready');
const [selectedDelivery, setSelectedDelivery] = useState(null);
const [showDriverModal, setShowDriverModal] = useState(false);
const [driverName, setDriverName] = useState('');
```

#### Key Functions

**fetchDeliveries()**
- Fetches deliveries from backend based on active tab
- Updates state with delivery data
- Handles loading states

**handleStartDelivery(delivery)**
- Opens driver modal
- Sets selected delivery

**confirmStartDelivery()**
- Validates driver name input
- Calls backend API to update status
- Sends customer notification
- Refreshes delivery list

**handleCompleteDelivery(delivery)**
- Shows confirmation dialog
- Calls backend API to complete delivery
- Activates installment schedule
- Sends completion notification

**sendCustomerNotification(delivery, status)**
- Prepares notification message
- Calls backend API to send email

### Backend Architecture

#### API Design
- RESTful approach using GET/POST requests
- JSON parameter passing
- Operation-based routing
- PDO prepared statements for security

#### Database Transactions
- Used for critical operations (CompleteDelivery)
- Ensures data consistency
- Rollback on errors

#### Error Handling
- Try-catch blocks for all operations
- Error logging to PHP error log
- Graceful degradation for non-critical features

#### Email System
- PHPMailer library integration
- SMTP configuration for Gmail
- HTML email templates
- Fallback plain text version

---

## 📧 Email Configuration

### SMTP Settings
```php
$mail->Host = 'smtp.gmail.com';
$mail->SMTPAuth = true;
$mail->Username = 'agorafurniture.official@gmail.com';
$mail->Password = 'vyel yzbk dvfj lskd'; // App password
$mail->SMTPSecure = 'tls';
$mail->Port = 587;
```

### Email Templates
Professional HTML templates with:
- Gradient header design
- Responsive layout
- Clear messaging
- Company branding
- Footer with copyright

---

## ⚠️ Important Notes

### Installment Schedule Logic
1. **DO NOT** start installment schedule on purchase date
2. **ONLY** activate schedule when item is delivered
3. Schedule is recalculated from delivery date
4. Old schedule entries are deleted and recreated

### Customer Notifications
- Email notifications are sent automatically
- If email sending fails, delivery still proceeds
- Errors are logged but don't block operations
- Ensure SMTP credentials are valid

### Status Workflow
Deliveries must follow this workflow:
```
Pending → Ready for Delivery → On Delivery → Delivered
```

Cannot skip statuses or go backwards.

### Driver Name Requirement
- Driver name is REQUIRED to start delivery
- Must be entered before status can change to "On Delivery"
- Stored for record-keeping and customer communication

---

## 🧪 Testing Checklist

- [ ] View deliveries in all four tabs
- [ ] Search functionality works correctly
- [ ] Start delivery requires driver name
- [ ] Customer receives "On Delivery" email
- [ ] Complete delivery confirmation works
- [ ] Customer receives "Delivered" email
- [ ] Installment schedule is created/updated on delivery
- [ ] Payment dates start from delivery date
- [ ] Tracking records are created with correct timestamps
- [ ] Mobile responsive design works properly

---

## 🔮 Future Enhancements (Optional)

1. **Real-time Tracking**
   - GPS integration for driver location
   - Customer-facing tracking page

2. **Delivery Routes**
   - Route optimization for multiple deliveries
   - Map integration

3. **Driver Management**
   - Driver profiles and assignment
   - Performance tracking

4. **Customer Ratings**
   - Post-delivery feedback system
   - Driver ratings

5. **Push Notifications**
   - Real-time updates to customer mobile app
   - Driver app integration

---

## 📝 Summary

The delivery tracking system provides a complete solution for managing customer deliveries from production through final delivery. Key highlights:

✅ Four-stage status tracking (Pending → Ready → On Delivery → Delivered)
✅ Automatic customer email notifications
✅ Driver assignment and tracking
✅ Intelligent installment schedule management
✅ Professional user interface
✅ Comprehensive search and filtering
✅ Mobile-responsive design
✅ Complete audit trail with tracking records

The system ensures customers receive their items efficiently while keeping them informed at every step, and ensures installment payments only begin after customers have received their purchases.

---

**Created:** October 25, 2025  
**Status:** Fully Implemented and Ready for Use  
**Role:** Sales Clerk

