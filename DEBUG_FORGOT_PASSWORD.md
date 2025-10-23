# 🐛 Debug: Forgot Password Not Sending Email

## 🔍 Step-by-Step Debugging

Follow these steps **in order** to find the problem:

---

## Step 1: Test Email Sending Directly

**Visit this URL in your browser:**
```
http://localhost/capstone-api/api/test-send-code.php
```

**What to look for:**
- ✅ "SUCCESS! Email sent"
- ✅ Check your email inbox for test email
- ❌ If you see "PHPMailer not found" → Install it (see below)
- ❌ If you see "SMTP Error" → Gmail credentials issue

**If email arrives:** ✅ Email system works! Problem is in the app connection.  
**If email doesn't arrive:** ❌ Email system broken. Check spam folder, then Gmail settings.

---

## Step 2: Test Backend Endpoints

**Visit this URL:**
```
http://localhost/capstone-api/api/test-users-endpoint.php
```

**Click the test links on that page:**
1. Click "Click to test" for verifyUserEmail
2. Click "Click to test sendCode" 

**What to look for:**
- ✅ `{"exists":true}` or `{"exists":false}` → verifyUserEmail works
- ✅ `{"success":true}` → sendCode works and email sent
- ❌ `{"error":"..."}` → There's a problem

---

## Step 3: Check Browser Console

1. **Open your app:** `http://localhost:3000`
2. **Press F12** to open Developer Tools
3. **Go to Console tab**
4. **Go to Profile → Change Password → Forgot Password**
5. **Enter email and click Send Code**

**Look for errors in console (red text):**

### Common Errors:

**Error: "Failed to send verification code"**
```
Solution: Backend has an issue. Check Step 4.
```

**Error: "404 Not Found"**
```
Solution: users.php file not found or wrong URL
Check: sessionStorage.getItem('baseURL')
Should be: http://localhost/capstone-api/api/
```

**Error: "Email does not match your account"**
```
Solution: The email you entered is not in your account
Check: What email is stored in your database account table?
```

**Error: "Network Error" or "CORS Error"**
```
Solution: XAMPP Apache not running or wrong URL
```

---

## Step 4: Check Network Tab

1. **Keep F12 Developer Tools open**
2. **Click on "Network" tab**
3. **Try to send code again**
4. **Look for request to "users.php"**
5. **Click on it**
6. **Check "Response" tab**

**What you should see:**
```json
{"success":true,"message":"Code sent successfully"}
```

**If you see:**
```json
{"success":false,"error":"..."}
```
The error message will tell you what's wrong.

---

## Step 5: Check PHP Error Log

**Location:** `C:\xampp\apache\logs\error.log`

**Open this file and look for recent errors (at the bottom)**

**Look for:**
```
=== sendCode START ===
Sending password reset code to: janmaristela2003@gmail.com
✓ Password reset code sent successfully
```

**Or errors like:**
```
✗ Failed to send password reset code
ERROR: PHPMailer not found
```

---

## Step 6: Verify Database

**Open phpMyAdmin:** `http://localhost/phpmyadmin`

**Run this query:**
```sql
SELECT account_id, fname, email FROM account WHERE email = 'janmaristela2003@gmail.com';
```

**Check:**
- ✅ Does a record exist?
- ✅ Is the email correct?
- ✅ What is the account_id?

---

## 🔧 Quick Fixes

### Fix 1: PHPMailer Not Installed

**Open Command Prompt (CMD) as Administrator:**
```bash
cd C:\xampp\htdocs\capstone-api
composer require phpmailer/phpmailer
```

**Don't have Composer?**
1. Download: https://getcomposer.org/download/
2. Install Composer
3. Run the command above

---

### Fix 2: Wrong baseURL

**Open browser console and type:**
```javascript
sessionStorage.getItem('baseURL')
```

**Should return:**
```
"http://localhost/capstone-api/api/"
```

**If it's different or null:**
```javascript
sessionStorage.setItem('baseURL', 'http://localhost/capstone-api/api/')
```

Then refresh the page and try again.

---

### Fix 3: Email Not in Database

**In your app, check what email is shown in Profile Settings.**

**If it shows "Not set":**
1. Go to phpMyAdmin
2. Find your account in the `account` table
3. Add your email:
```sql
UPDATE account SET email = 'janmaristela2003@gmail.com' WHERE account_id = YOUR_ID;
```

---

### Fix 4: XAMPP Not Running

**Check XAMPP Control Panel:**
- ✅ Apache should be green and say "Running"
- ✅ MySQL should be green and say "Running"

**If not running:**
- Click "Start" next to Apache
- Click "Start" next to MySQL

---

## 📋 Complete Diagnostic

**Fill this out to help debug:**

```
STEP 1 - Direct Email Test:
[ ] Test email sent successfully
[ ] Test email received in inbox
[ ] Error message: _______________

STEP 2 - Endpoint Test:
[ ] verifyUserEmail works
[ ] sendCode works
[ ] Error message: _______________

STEP 3 - Browser Console:
Error message: _______________

STEP 4 - Network Response:
Response: _______________

STEP 5 - PHP Error Log:
Last error: _______________

STEP 6 - Database:
[ ] Email exists in database
[ ] Email value: _______________
[ ] Account ID: _______________

XAMPP:
[ ] Apache running
[ ] MySQL running

baseURL value: _______________
```

---

## 🎯 Most Likely Issues (Ranked)

### 1. **baseURL not set correctly** (70% chance)
**Check:** `sessionStorage.getItem('baseURL')`  
**Fix:** Set it to `http://localhost/capstone-api/api/`

### 2. **Email not in database** (15% chance)
**Check:** Profile shows email or "Not set"?  
**Fix:** Add email to database

### 3. **PHPMailer not installed** (10% chance)
**Check:** Visit test-send-code.php  
**Fix:** Run `composer require phpmailer/phpmailer`

### 4. **XAMPP not running** (5% chance)
**Check:** XAMPP Control Panel  
**Fix:** Start Apache

---

## 🚀 Quick Test Sequence

**Do this right now:**

1. **Open:** `http://localhost/capstone-api/api/test-send-code.php`
   - Did you get an email? 
   - ✅ YES → Problem is in app, not email system
   - ❌ NO → Email system broken, check error message

2. **Press F12 in your app**
   - Console tab
   - Network tab (keep it open)

3. **Type in console:**
   ```javascript
   sessionStorage.getItem('baseURL')
   ```
   - Does it show `http://localhost/capstone-api/api/`?
   - ❌ NO → This is your problem! Fix it:
   ```javascript
   sessionStorage.setItem('baseURL', 'http://localhost/capstone-api/api/')
   ```

4. **Go to Profile → Change Password → Forgot Password**
   - Enter: janmaristela2003@gmail.com
   - Click Send Code
   - **Watch the Network tab**
   - Click on the "users.php" request
   - What does Response say?

5. **Tell me:**
   - What error you see in Console?
   - What the Network Response says?
   - Did test-send-code.php work?

---

## 💡 Most Common Solution

**90% of the time, it's one of these:**

```javascript
// 1. Wrong baseURL
sessionStorage.setItem('baseURL', 'http://localhost/capstone-api/api/')

// 2. Email not in your account
// Go to Profile Settings - does it show your email?
// If not, add it to database

// 3. XAMPP not running
// Check XAMPP Control Panel - Apache should be green
```

---

**🔍 Run the tests above and tell me what you find!**

The test files will show us exactly where the problem is.

