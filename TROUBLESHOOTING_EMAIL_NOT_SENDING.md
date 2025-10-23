# 🔧 TROUBLESHOOTING: Emails Not Sending

## 📋 Problem:
You have overdue payments (18+ days) but emails are not being sent.

---

## ✅ Step-by-Step Debug Process:

### **Step 1: Run the Debug Script**

Open this URL in your browser:
```
http://localhost/capstone-api/api/test-installment-emails.php
```

This will show you:
- ✅ If database columns exist
- ✅ If customers have email addresses
- ✅ How many overdue payments exist
- ✅ If PHPMailer is installed
- ✅ Which payments are eligible for emails

**Look for RED error messages!**

---

### **Step 2: Check Database Migration**

Run this query in phpMyAdmin:

```sql
DESCRIBE installment_payment_sched;
```

**You should see these columns:**
- `reminder_1week_sent`
- `reminder_3days_sent`
- `reminder_1day_sent`
- `overdue_notification_sent`

**❌ If these columns are MISSING:**
```sql
-- Run the migration SQL
ALTER TABLE `installment_payment_sched` 
ADD COLUMN `reminder_1week_sent` TINYINT(1) DEFAULT 0,
ADD COLUMN `reminder_3days_sent` TINYINT(1) DEFAULT 0,
ADD COLUMN `reminder_1day_sent` TINYINT(1) DEFAULT 0,
ADD COLUMN `overdue_notification_sent` TINYINT(1) DEFAULT 0;
```

---

### **Step 3: Check Customer Emails**

Run this query:

```sql
SELECT 
    c.cust_id,
    c.cust_name,
    c.email,
    COUNT(ips.ips_id) as unpaid_count
FROM customers c
LEFT JOIN installment_sales ins ON c.cust_id = ins.cust_id
LEFT JOIN installment_payment_sched ips ON ins.installment_sales_id = ips.installment_id
WHERE ips.status = 'UNPAID'
GROUP BY c.cust_id
ORDER BY unpaid_count DESC;
```

**❌ If email column is NULL or empty:**
```sql
-- Add email addresses for your customers
UPDATE customers 
SET email = 'customer1@example.com' 
WHERE cust_id = 1;

UPDATE customers 
SET email = 'customer2@example.com' 
WHERE cust_id = 2;

-- etc...
```

---

### **Step 4: Check Overdue Payments**

Run this query to see what SHOULD get emails:

```sql
SELECT 
    ips.ips_id,
    c.cust_id,
    c.cust_name,
    c.email,
    ips.payment_number,
    ips.due_date,
    ips.amount_due,
    ips.status,
    ips.overdue_notification_sent,
    DATEDIFF(CURDATE(), ips.due_date) as days_overdue
FROM installment_payment_sched ips
INNER JOIN installment_sales ins ON ips.installment_id = ins.installment_sales_id
INNER JOIN customers c ON ins.cust_id = c.cust_id
WHERE ips.status = 'UNPAID' 
AND ips.due_date <= DATE_SUB(CURDATE(), INTERVAL 3 DAY)
AND (ips.overdue_notification_sent IS NULL OR ips.overdue_notification_sent = 0)
ORDER BY days_overdue DESC;
```

**This query shows:**
- Which payments are overdue by 4+ days
- Which customers they belong to
- If they have email addresses
- If emails have already been sent

**Look for:**
- ❌ Missing email addresses
- ❌ `overdue_notification_sent` already = 1 (already sent)
- ❌ Status is not 'UNPAID'

---

### **Step 5: Check PHPMailer Installation**

In command prompt:

```bash
cd C:\xampp\htdocs\capstone-api
dir vendor\phpmailer
```

**❌ If "File Not Found":**
```bash
cd C:\xampp\htdocs\capstone-api
composer require phpmailer/phpmailer
```

---

### **Step 6: Check Email Configuration**

Open: `C:\xampp\htdocs\capstone-api\api\installment-notifications.php`

**Check lines 245-250 and 371-376:**

```php
$mail->Username = 'your-email@gmail.com';     // ← YOUR Gmail here
$mail->Password = 'your-16-char-app-password'; // ← YOUR App Password here
```

**❌ If still using placeholder values:**
1. Replace with your REAL Gmail address
2. Get Gmail App Password:
   - Go to: https://myaccount.google.com/apppasswords
   - Generate new password
   - Copy the 16-character password
   - Paste in the PHP file

---

### **Step 7: Test Email Sending**

1. Open Sales Clerk Dashboard
2. Click "📧 Send Payment Reminders" button
3. Check browser console (F12 → Console tab)

**Look for:**
- ✅ "Installment reminders sent: {data}"
- ✅ "Overdue notifications sent: {data}"

**Check for errors:**
- ❌ "Network Error"
- ❌ "Failed to send"
- ❌ Error 500

---

### **Step 8: Check PHP Error Logs**

**Location:** `C:\xampp\php\logs\php_error_log`

**Look for:**
- "SendOverdueNotifications: Found X overdue installments"
- "Processing overdue payment: IPS_ID=..."
- "Successfully sent overdue email for IPS_ID=..."
- Any PHPMailer errors

---

## 🔍 Common Issues & Solutions:

### **Issue 1: No emails because columns don't exist**

**Symptom:** SQL error about unknown columns

**Solution:**
```sql
-- Run in phpMyAdmin
ALTER TABLE `installment_payment_sched` 
ADD COLUMN `reminder_1week_sent` TINYINT(1) DEFAULT 0,
ADD COLUMN `reminder_3days_sent` TINYINT(1) DEFAULT 0,
ADD COLUMN `reminder_1day_sent` TINYINT(1) DEFAULT 0,
ADD COLUMN `overdue_notification_sent` TINYINT(1) DEFAULT 0;
```

---

### **Issue 2: No emails because customers don't have email addresses**

**Symptom:** Debug script shows 0 customers with emails

**Solution:**
```sql
-- Add emails to your customers
UPDATE customers SET email = 'email@example.com' WHERE cust_id = 1;
-- Repeat for all customers
```

---

### **Issue 3: PHPMailer not installed**

**Symptom:** "Class PHPMailer not found" error

**Solution:**
```bash
cd C:\xampp\htdocs\capstone-api
composer require phpmailer/phpmailer
```

---

### **Issue 4: Gmail credentials not configured**

**Symptom:** Authentication failed errors

**Solution:**
1. Get Gmail App Password: https://myaccount.google.com/apppasswords
2. Update `installment-notifications.php` lines 245-250 and 371-376
3. Make sure 2-Step Verification is enabled on Gmail

---

### **Issue 5: Emails already sent**

**Symptom:** Query returns 0 results, but you see overdue payments

**Solution:**
Check if `overdue_notification_sent` = 1:

```sql
-- See all overdue (including those already notified)
SELECT 
    ips.ips_id,
    c.cust_name,
    ips.payment_number,
    ips.due_date,
    ips.overdue_notification_sent,
    DATEDIFF(CURDATE(), ips.due_date) as days_overdue
FROM installment_payment_sched ips
INNER JOIN installment_sales ins ON ips.installment_id = ins.installment_sales_id
INNER JOIN customers c ON ins.cust_id = c.cust_id
WHERE ips.status = 'UNPAID' 
AND ips.due_date <= DATE_SUB(CURDATE(), INTERVAL 3 DAY)
ORDER BY days_overdue DESC;
```

If `overdue_notification_sent` = 1, the email was already sent.

**To resend (for testing):**
```sql
-- Reset notification flags (ONLY for testing!)
UPDATE installment_payment_sched 
SET overdue_notification_sent = 0 
WHERE ips_id = 66;  -- Replace with your IPS ID
```

---

### **Issue 6: Wrong table status values**

**Symptom:** No payments found even though they exist

**Solution:**
Check exact status values:

```sql
SELECT DISTINCT status FROM installment_payment_sched;
```

**Expected:** `UNPAID` or `Paid`

If different (e.g., `unpaid`, `Unpaid`), update query to match.

---

## 📝 Debug Checklist:

Run through this checklist:

- [ ] Database columns added (`reminder_1week_sent`, etc.)
- [ ] Customers have valid email addresses
- [ ] PHPMailer is installed
- [ ] Gmail credentials configured (App Password)
- [ ] 2-Step Verification enabled on Gmail
- [ ] Overdue payments exist (4+ days past due)
- [ ] Status is exactly `'UNPAID'` (case-sensitive)
- [ ] `overdue_notification_sent` = 0 (not already sent)
- [ ] PHP error logs checked
- [ ] Browser console checked (F12)
- [ ] Test script run (test-installment-emails.php)

---

## 🎯 Quick Test:

**1. Add test customer email:**
```sql
UPDATE customers 
SET email = 'your-test-email@gmail.com' 
WHERE cust_id = 3;  -- Customer with overdue payments
```

**2. Reset notification flag:**
```sql
UPDATE installment_payment_sched 
SET overdue_notification_sent = 0 
WHERE ips_id = 66 AND status = 'UNPAID';  -- Replace with actual IPS ID
```

**3. Click "Send Payment Reminders" button**

**4. Check your email inbox (and spam folder!)**

---

## 📧 Still Not Working?

**Check these final things:**

1. **SMTP Port Blocked?**
   - Try port 587 (current) or 465
   - Some ISPs block email ports

2. **Gmail Security:**
   - Check https://myaccount.google.com/security
   - Look for "Suspicious activity" alerts
   - Temporarily allow "Less secure app access" (not recommended)

3. **PHP Configuration:**
   - Check `php.ini` for email settings
   - Ensure `openssl` extension is enabled

4. **Direct Test:**
   ```bash
   # Test PHP mail function
   php -r "mail('your-email@gmail.com', 'Test', 'Test message');"
   ```

---

## 🚨 Emergency Quick Fix:

If still not working, try this simple test:

1. Open: `http://localhost/capstone-api/api/test-installment-emails.php`
2. Look at the **Test 3** section
3. Note the **IPS IDs** that show up
4. Check if they have emails
5. Check if "Email Sent?" column says YES or NO
6. Copy the customer emails
7. Manually send them a test email to verify email addresses work

---

**Once you identify the issue, let me know and I'll help fix it!** 🔧

