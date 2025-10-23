# ✅ CORRECTED - INSTALLMENT EMAIL NOTIFICATIONS SYSTEM

## 📋 Database Structure Correction:

Your actual database structure uses:
- **`installment_sales`** - Main installment contract table
- **`installment_payment_sched`** - Individual payment schedules (THIS is what we send emails for)
- **`installment_payment_record`** - Payment history records
- **`customers`** - Customer information with email addresses

---

## 🔧 Updated Files:

### **1. Database Migration - CORRECTED**
**`database_installment_notifications.sql`**

Now adds columns to the **correct table**: `installment_payment_sched`

```sql
ALTER TABLE `installment_payment_sched` 
ADD COLUMN `reminder_1week_sent` TINYINT(1) DEFAULT 0,
ADD COLUMN `reminder_3days_sent` TINYINT(1) DEFAULT 0,
ADD COLUMN `reminder_1day_sent` TINYINT(1) DEFAULT 0,
ADD COLUMN `overdue_notification_sent` TINYINT(1) DEFAULT 0;
```

---

### **2. Backend PHP - CORRECTED**
**`C:\xampp\htdocs\capstone-api\api\installment-notifications.php`**

Now uses correct table joins:

**Original (WRONG):**
```sql
FROM installment i
INNER JOIN customers c ON i.cust_id = c.cust_id
```

**Corrected (RIGHT):**
```sql
FROM installment_payment_sched ips
INNER JOIN installment_sales ins ON ips.installment_id = ins.installment_sales_id
INNER JOIN customers c ON ins.cust_id = c.cust_id
```

---

## 📊 How The Tables Relate:

```
customers (cust_id, cust_name, email)
    ↓
installment_sales (installment_sales_id, cust_id, invoice_id)
    ↓
installment_payment_sched (ips_id, installment_id, due_date, payment_number, amount_due, status)
    ↓
installment_payment_record (when payments are made)
```

---

## 🔔 Email Notification Flow:

### **1. 1 Week Before Due Date:**
```sql
SELECT ips.*, c.cust_name, c.email, c.phone, ins.invoice_id
FROM installment_payment_sched ips
INNER JOIN installment_sales ins ON ips.installment_id = ins.installment_sales_id
INNER JOIN customers c ON ins.cust_id = c.cust_id
WHERE ips.status = 'UNPAID' 
AND ips.due_date = DATE_ADD(CURDATE(), INTERVAL 7 DAY)
AND (ips.reminder_1week_sent IS NULL OR ips.reminder_1week_sent = 0)
AND c.email IS NOT NULL;
```

### **2. 3 Days Before Due Date:**
Same query but with `INTERVAL 3 DAY`

### **3. 1 Day Before Due Date:**
Same query but with `INTERVAL 1 DAY`

### **4. After Grace Period (4+ days overdue):**
```sql
SELECT ips.*, c.cust_name, c.email, c.phone, ins.invoice_id,
       DATEDIFF(CURDATE(), ips.due_date) as days_overdue
FROM installment_payment_sched ips
INNER JOIN installment_sales ins ON ips.installment_id = ins.installment_sales_id
INNER JOIN customers c ON ins.cust_id = c.cust_id
WHERE ips.status = 'UNPAID' 
AND ips.due_date <= DATE_SUB(CURDATE(), INTERVAL 3 DAY)
AND (ips.overdue_notification_sent IS NULL OR ips.overdue_notification_sent = 0)
AND c.email IS NOT NULL;
```

---

## 📧 Email Content (Based on Your Data):

### **Example: Payment Reminder**

**To:** customer@example.com (from `customers.email`)
**Subject:** Payment Reminder - Installment Due in 1 week

**Payment Details:**
- **Customer:** John Doe (from `customers.cust_name`)
- **Payment Number:** 3 (from `installment_payment_sched.payment_number`)
- **Due Date:** November 05, 2025 (from `installment_payment_sched.due_date`)
- **Amount Due:** ₱3,000.00 (from `installment_payment_sched.amount_due`)
- **Status:** UNPAID (from `installment_payment_sched.status`)

---

### **Example: Overdue Notice**

**To:** customer@example.com
**Subject:** URGENT: Overdue Payment Notice - 5% Penalty Applied

**Payment Details:**
- **Customer:** Jane Smith
- **Payment Number:** 2
- **Original Due Date:** August 05, 2025
- **Days Overdue:** 80 days
- **Original Amount:** ₱3,000.00
- **Penalty (5%):** ₱150.00
- **Total Due:** ₱3,150.00

---

## ⚙️ Setup Steps (UPDATED):

### **Step 1: Run Database Migration**

Execute the **CORRECTED** SQL script:

```bash
# In phpMyAdmin or MySQL client:
mysql -u your_username -p agdatabase < database_installment_notifications.sql
```

Or copy-paste into phpMyAdmin SQL tab.

---

### **Step 2: Verify Table Structure**

Check that your `installment_payment_sched` table now has the new columns:

```sql
DESCRIBE installment_payment_sched;

-- Should see:
-- ips_id
-- installment_id
-- due_date
-- payment_number
-- amount_due
-- status
-- reminder_1week_sent   ← NEW
-- reminder_3days_sent   ← NEW
-- reminder_1day_sent    ← NEW
-- overdue_notification_sent  ← NEW
```

---

### **Step 3: Configure Email Settings**

Same as before - update Gmail credentials in `installment-notifications.php`:

```php
// Lines 129, 134, 245, 250
$mail->Username = 'your-email@gmail.com';
$mail->Password = 'your-16-char-app-password';
```

---

### **Step 4: Ensure Customers Have Email**

```sql
-- Check customers with email
SELECT cust_id, cust_name, email, phone 
FROM customers 
WHERE email IS NOT NULL AND email != '';

-- Add/update emails for customers
UPDATE customers 
SET email = 'customer@example.com' 
WHERE cust_id = 1;
```

---

### **Step 5: Test with Real Data**

Based on your current data, you can test with:

```sql
-- Find upcoming due dates
SELECT 
    ips.ips_id,
    ips.payment_number,
    ips.due_date,
    ips.amount_due,
    ips.status,
    c.cust_name,
    c.email,
    DATEDIFF(ips.due_date, CURDATE()) as days_until_due
FROM installment_payment_sched ips
INNER JOIN installment_sales ins ON ips.installment_id = ins.installment_sales_id
INNER JOIN customers c ON ins.cust_id = c.cust_id
WHERE ips.status = 'UNPAID'
ORDER BY ips.due_date;
```

---

## 🧪 Test Scenarios (Based on Your Data):

### **Test 1: Customer ID 3 - Payment #3**
```
From your data:
- installment_id: 13
- payment_number: 3
- due_date: 2025-08-05
- amount_due: 3000.00
- status: UNPAID
- Already overdue by ~80 days
```

**Expected:** Should receive overdue email with 5% penalty

---

### **Test 2: Customer ID 1 - Payment #1**
```
From your data:
- installment_id: 32
- payment_number: 1
- due_date: 2025-11-07
- amount_due: 7245.50
- status: UNPAID
```

**Expected:** 
- If today is 2025-10-31: Receive "1 week" reminder
- If today is 2025-11-04: Receive "3 days" reminder
- If today is 2025-11-06: Receive "1 day" reminder

---

## 🔍 Debugging Queries:

### **Check what would be sent today:**

```sql
-- 1 Week reminders
SELECT c.cust_name, c.email, ips.payment_number, ips.due_date, ips.amount_due
FROM installment_payment_sched ips
INNER JOIN installment_sales ins ON ips.installment_id = ins.installment_sales_id
INNER JOIN customers c ON ins.cust_id = c.cust_id
WHERE ips.status = 'UNPAID' 
AND ips.due_date = DATE_ADD(CURDATE(), INTERVAL 7 DAY)
AND c.email IS NOT NULL;

-- Overdue (past grace period)
SELECT c.cust_name, c.email, ips.payment_number, ips.due_date, ips.amount_due,
       DATEDIFF(CURDATE(), ips.due_date) as days_overdue
FROM installment_payment_sched ips
INNER JOIN installment_sales ins ON ips.installment_id = ins.installment_sales_id
INNER JOIN customers c ON ins.cust_id = c.cust_id
WHERE ips.status = 'UNPAID' 
AND ips.due_date <= DATE_SUB(CURDATE(), INTERVAL 3 DAY)
AND c.email IS NOT NULL
ORDER BY days_overdue DESC;
```

---

## ✅ Summary of Corrections:

| Item | Was (WRONG) | Now (CORRECT) |
|------|-------------|---------------|
| **Table Name** | `installment` | `installment_payment_sched` |
| **Join Table** | N/A | `installment_sales` |
| **Customer Join** | Direct `installment.cust_id` | Via `installment_sales.cust_id` |
| **ID Column** | `installment_id` | `ips_id` |
| **Update Query** | `UPDATE installment` | `UPDATE installment_payment_sched` |

---

## 🎯 Your Data Example:

Looking at your installment_payment_sched table:
- You have **many UNPAID** payments
- Some are already **overdue** (due_date < today)
- Some are **upcoming** (due_date > today)

**Example Overdue:**
- ips_id: 66, 67, 68, 69 (installment_id: 13) - Due 2025-08-05, 09-05, 10-05, 11-05
- These are **already past due** - should get overdue emails!

**Example Upcoming:**
- ips_id: 172-177 (installment_id: 33) - Due Nov-Apr 2025-2026
- These will get reminder emails as dates approach

---

## 🚀 Ready to Use:

1. ✅ Database migration corrected
2. ✅ PHP backend updated with correct table joins
3. ✅ Frontend dashboard unchanged (works with backend)
4. ✅ Email templates ready

**Just run the SQL migration and configure your Gmail credentials!** 📧✨

---

## 📌 Important Notes:

1. **Status Field:** Your table uses `status` column with values:
   - `'UNPAID'` - Not yet paid
   - `'Paid'` - Already paid

2. **Grace Period:** 3 days after due_date before penalty applies

3. **Each Payment Separate:** Each row in `installment_payment_sched` gets its own reminder emails

4. **Example:** If customer has 6-month payment plan, they get:
   - Payment #1: 4 reminders (1 week, 3 days, 1 day, overdue if unpaid)
   - Payment #2: 4 reminders
   - ... and so on for each payment

**SYSTEM NOW CORRECTLY CONFIGURED FOR YOUR DATABASE!** ✅

