# 📧 INSTALLMENT EMAIL NOTIFICATIONS SYSTEM

## 📋 Overview:
Automatically send email reminders to customers for their installment payments at scheduled intervals, plus overdue notifications after the grace period ends.

---

## 🔔 Notification Schedule:

### **Reminder Emails (Before Due Date):**
1. ✅ **1 Week Before** - Friendly reminder that payment is due in 7 days
2. ✅ **3 Days Before** - Urgent reminder that payment is due in 3 days
3. ✅ **1 Day Before** - Final reminder that payment is due tomorrow

### **Overdue Notification (After Grace Period):**
4. ✅ **After Grace Period** - Sent ONCE after the 3-day grace period ends
   - Sent on the 4th day after due date
   - Includes 5% penalty notice
   - Only sent once per installment

---

## 🎯 Key Features:

- ✅ **Automated Sending** - Runs automatically when dashboard loads (once per day)
- ✅ **Manual Trigger** - Button to manually send all pending notifications
- ✅ **Smart Tracking** - Won't send duplicate emails (tracks sent status in database)
- ✅ **Professional Templates** - Beautiful HTML email templates
- ✅ **Grace Period Handling** - Clearly explains 3-day grace period policy
- ✅ **Penalty Notification** - 5% penalty notice for overdue payments
- ✅ **Customer Details** - Includes payment number, due date, amount
- ✅ **Only Sends Once** - Each notification type sent only once per installment

---

## 📁 Files Created:

### **1. Backend PHP File:**
**`C:\xampp\htdocs\capstone-api\api\installment-notifications.php`**

**Operations:**
- `SendInstallmentReminders` - Sends 1 week, 3 day, and 1 day reminders
- `SendOverdueNotifications` - Sends overdue notices after grace period

**Features:**
- Uses PHPMailer for email sending
- Queries installments table for due dates
- Tracks which notifications have been sent
- Professional HTML email templates
- Error logging and handling

---

### **2. Database Schema:**
**`database_installment_notifications.sql`**

**Columns Added to `installment` Table:**
```sql
- reminder_1week_sent   TINYINT(1) DEFAULT 0
- reminder_3days_sent   TINYINT(1) DEFAULT 0
- reminder_1day_sent    TINYINT(1) DEFAULT 0
- overdue_notification_sent TINYINT(1) DEFAULT 0
```

**Indexes Added:**
- `idx_due_date_status` - For efficient date/status queries
- `idx_reminders` - For tracking sent notifications

---

### **3. Frontend Integration:**
**`app/Contents/saleClearkContents/dashboardSC.js`**

**Added Functions:**
- `checkAndSendNotifications()` - Auto-check on dashboard load
- `sendInstallmentReminders()` - Send reminder emails
- `sendOverdueNotifications()` - Send overdue emails
- `manualSendNotifications()` - Manual trigger button handler

**UI Elements:**
- "Send Payment Reminders" button in dashboard header
- Loading state with spinner animation
- Success/failure alerts with counts

---

## ⚙️ Setup Instructions:

### **Step 1: Run Database Migration**

Execute the SQL script in your database:

```bash
# In phpMyAdmin or MySQL client:
mysql -u your_username -p your_database < database_installment_notifications.sql
```

Or copy-paste the SQL content directly into phpMyAdmin SQL tab.

---

### **Step 2: Configure Email Settings**

Edit `C:\xampp\htdocs\capstone-api\api\installment-notifications.php`:

**Line 129 & 245 - Update Gmail Credentials:**

```php
$mail->Username = 'your-email@gmail.com';     // Your Gmail address
$mail->Password = 'your-16-char-app-password'; // Your Gmail App Password
```

**Also update lines 134 & 250:**
```php
$mail->setFrom('your-email@gmail.com', 'A.G HOME');
```

---

### **Step 3: Get Gmail App Password**

1. Go to your Google Account: https://myaccount.google.com/
2. Click **Security** (left sidebar)
3. Enable **2-Step Verification** (if not already enabled)
4. Search for "App Passwords" or go to: https://myaccount.google.com/apppasswords
5. Select app: **Mail**
6. Select device: **Other (Custom name)**
7. Name it: **A.G HOME Notifications**
8. Click **Generate**
9. Copy the 16-character password (no spaces)
10. Paste it in the PHP file

---

### **Step 4: Ensure Customers Have Email Addresses**

Make sure your `customers` table has email addresses:

```sql
-- Check if customers have emails
SELECT cust_id, cust_name, email 
FROM customers 
WHERE email IS NULL OR email = '';

-- Update customers without emails (example)
UPDATE customers 
SET email = 'customer@example.com' 
WHERE cust_id = 1;
```

---

### **Step 5: Test the System**

1. **Open Sales Clerk Dashboard**
2. **Click "Send Payment Reminders" button**
3. **Check Console for logs:**
   - Should see: "Installment reminders sent: {data}"
   - Should see: "Overdue notifications sent: {data}"
4. **Check Alert Message:**
   - Shows count of emails sent for each type
5. **Check Customer Email:**
   - Verify email was received
   - Check spam folder if not in inbox

---

## 📧 Email Templates:

### **1. Reminder Email (1 week, 3 days, 1 day before):**

**Subject:** Payment Reminder - Installment Due in [timeframe]

**Content:**
- Friendly greeting with customer name
- Payment details (number, due date, amount)
- Large, prominent amount display
- Grace period information
- Professional footer

**Design:**
- Purple gradient header
- Clean, modern layout
- Mobile-responsive
- Professional branding

---

### **2. Overdue Email (after grace period):**

**Subject:** URGENT: Overdue Payment Notice - 5% Penalty Applied

**Content:**
- Urgent red header with 🚨 icon
- Days overdue count
- Penalty warning box (5% applied)
- Original amount + penalty breakdown
- Total amount due (with penalty)
- Immediate action required notice
- Contact information for assistance

**Design:**
- Red/pink gradient header
- Warning box with penalty info
- Large, bold total amount
- Urgent but professional tone

---

## 🔄 How It Works:

### **Automatic Flow:**

```
1. Sales Clerk opens dashboard
         ↓
2. checkAndSendNotifications() runs
         ↓
3. Check localStorage for last sent date
         ↓
4. If not sent today:
   a. Query installments due in 1 week (not sent)
   b. Query installments due in 3 days (not sent)
   c. Query installments due in 1 day (not sent)
   d. Query overdue installments (not sent)
         ↓
5. Send emails via PHPMailer
         ↓
6. Update database (mark as sent)
         ↓
7. Store today's date in localStorage
         ↓
8. ✅ Done - won't send again until tomorrow
```

---

### **Manual Flow:**

```
1. Click "Send Payment Reminders" button
         ↓
2. Button shows "Sending..." with spinner
         ↓
3. sendInstallmentReminders() called
         ↓
4. sendOverdueNotifications() called
         ↓
5. Alert shows count of emails sent
         ↓
6. localStorage updated
         ↓
7. ✅ Complete
```

---

## 📊 Database Queries:

### **1 Week Reminders:**
```sql
SELECT i.*, c.cust_name, c.email
FROM installment i
INNER JOIN customers c ON i.cust_id = c.cust_id
WHERE i.status = 'UNPAID' 
AND i.due_date = DATE_ADD(CURDATE(), INTERVAL 7 DAY)
AND (i.reminder_1week_sent IS NULL OR i.reminder_1week_sent = 0)
AND c.email IS NOT NULL;
```

### **Overdue Notifications:**
```sql
SELECT i.*, c.cust_name, c.email
FROM installment i
INNER JOIN customers c ON i.cust_id = c.cust_id
WHERE i.status = 'UNPAID' 
AND i.due_date <= DATE_SUB(CURDATE(), INTERVAL 3 DAY)  -- Past grace period
AND (i.overdue_notification_sent IS NULL OR i.overdue_notification_sent = 0)
AND c.email IS NOT NULL;
```

---

## 🧪 Testing Checklist:

### **Test 1: 1 Week Reminder**
- [ ] Create test installment due in exactly 7 days
- [ ] Click "Send Payment Reminders"
- [ ] Verify email received
- [ ] Check database: `reminder_1week_sent = 1`
- [ ] Click button again - should not resend

### **Test 2: 3 Day Reminder**
- [ ] Create test installment due in exactly 3 days
- [ ] Click "Send Payment Reminders"
- [ ] Verify email received
- [ ] Check database: `reminder_3days_sent = 1`

### **Test 3: 1 Day Reminder**
- [ ] Create test installment due tomorrow
- [ ] Click "Send Payment Reminders"
- [ ] Verify email received
- [ ] Check database: `reminder_1day_sent = 1`

### **Test 4: Overdue Notification**
- [ ] Create test installment due 4+ days ago
- [ ] Set status to 'UNPAID'
- [ ] Click "Send Payment Reminders"
- [ ] Verify overdue email received
- [ ] Email should show 5% penalty
- [ ] Check database: `overdue_notification_sent = 1`
- [ ] Click button again - should not resend

### **Test 5: Automatic Sending**
- [ ] Close and reopen dashboard
- [ ] Check console for "Installment reminders sent"
- [ ] Verify it only runs once per day

---

## 🚨 Troubleshooting:

### **Problem: Emails not sending**

**Check:**
1. Gmail App Password is correct (16 characters, no spaces)
2. 2-Step Verification is enabled on Gmail
3. PHPMailer is installed: `C:\xampp\htdocs\capstone-api\vendor\phpmailer\phpmailer\`
4. Customer has valid email address
5. Check PHP error logs: `C:\xampp\php\logs\php_error_log`

**Solution:**
```bash
# Reinstall PHPMailer if needed
cd C:\xampp\htdocs\capstone-api
composer require phpmailer/phpmailer
```

---

### **Problem: Duplicate emails sent**

**Check:**
1. Database columns are properly set to 1 after sending
2. localStorage is storing the date correctly

**Solution:**
```sql
-- Manually check sent status
SELECT installment_id, due_date, 
       reminder_1week_sent, reminder_3days_sent, 
       reminder_1day_sent, overdue_notification_sent
FROM installment
WHERE status = 'UNPAID'
ORDER BY due_date;
```

---

### **Problem: No reminders found**

**Check:**
1. Installments exist in database
2. Due dates are in the future (for reminders)
3. Status is 'UNPAID'
4. Customers have email addresses

**Solution:**
```sql
-- Check what installments are eligible
SELECT i.*, c.email,
       DATEDIFF(i.due_date, CURDATE()) as days_until_due
FROM installment i
LEFT JOIN customers c ON i.cust_id = c.cust_id
WHERE i.status = 'UNPAID'
ORDER BY i.due_date;
```

---

## 💡 Best Practices:

1. **Run Once Per Day** - The system automatically prevents duplicate sends
2. **Monitor Email Logs** - Check PHP error logs for any issues
3. **Test Email Delivery** - Send test emails to verify SMTP works
4. **Keep Customer Emails Updated** - Ensure all customers have valid emails
5. **Check Spam Folders** - Advise customers to check spam
6. **Whitelist Domain** - Ask customers to whitelist your email address
7. **Monitor Bounce Rate** - Check for failed deliveries
8. **Update Templates** - Customize email templates for your brand

---

## 📈 Benefits:

1. ✅ **Automated Reminders** - No manual effort required
2. ✅ **Improved Collections** - Timely reminders increase payment rates
3. ✅ **Professional Communication** - Beautiful, branded emails
4. ✅ **Customer Awareness** - Clear grace period and penalty info
5. ✅ **Reduced Delinquency** - Early warnings prevent overdue accounts
6. ✅ **Audit Trail** - Track which emails were sent and when
7. ✅ **Scalable** - Handles any number of customers automatically

---

## 🎯 Summary:

### **What It Does:**

- Automatically sends payment reminders:
  - 1 week before due date
  - 3 days before due date
  - 1 day before due date
- Sends overdue notice after 3-day grace period ends
- Each notification sent only ONCE per installment
- Beautiful HTML email templates
- Automatic daily checking
- Manual trigger button available

### **Requirements:**

- PHPMailer installed
- Gmail App Password configured
- Database columns added
- Customer email addresses in database

### **Result:**

Customers receive timely, professional payment reminders automatically, reducing late payments and improving cash flow! 🎉

---

**SYSTEM READY TO USE!** 📧✅

