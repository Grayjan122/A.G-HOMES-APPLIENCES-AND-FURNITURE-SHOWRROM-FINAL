# 🐛 Fix: Forgot Password Email Not Sending

## ❌ Problem
The forgot password feature in profile settings cannot send verification emails.

---

## 🔍 Root Cause

The frontend is calling these backend operations:
1. **`verifyUserEmail`** - Check if email belongs to logged-in user
2. **`sendCode`** - Send verification code to email

If emails aren't sending, one or both of these operations are missing or misconfigured in your backend.

---

## ✅ Quick Fix - Step by Step

### Step 1: Check Your Backend File Location

The frontend is calling: `baseURL + 'login.php'`

**Find your login.php file:**
```
Typical locations:
- C:\xampp\htdocs\capstone-api\api\login.php
- C:\xampp\htdocs\your-project\api\login.php
```

### Step 2: Open Browser Console for Debugging

1. Open profile settings
2. Click "Change Password"
3. Click "Forgot Password?"
4. Enter your email
5. Click "Send Code"
6. Press **F12** to open browser console
7. Look for errors (they'll be in red)

**Common errors you might see:**
```
❌ 404 Not Found → Backend file doesn't exist
❌ 500 Internal Server Error → PHP error in backend
❌ Operation not found → Missing case in switch statement
❌ Failed to send email → PHPMailer not configured
```

---

## 🛠️ Solution: Add Missing Backend Operations

### Option A: Add to Existing login.php

Open your `login.php` file and add these two operations:

#### 1. Add `verifyUserEmail` Operation

```php
// In your switch statement, add this case:

case 'verifyUserEmail':
    echo verifyUserEmail($json, $conn);
    break;

// Then add this function (place it with your other functions):

function verifyUserEmail($json, $conn) {
    $data = json_decode($json, true);
    $email = trim($data['email']);
    $user_id = $data['user_id'];
    
    try {
        $sql = "SELECT account_id, fname, email 
                FROM account 
                WHERE account_id = :user_id 
                AND email = :email 
                AND active_status = '1'";
        
        $stmt = $conn->prepare($sql);
        $stmt->bindParam(':user_id', $user_id);
        $stmt->bindParam(':email', $email);
        $stmt->execute();
        
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($result) {
            return json_encode([
                'exists' => true,
                'account_id' => $result['account_id'],
                'fname' => $result['fname']
            ]);
        } else {
            return json_encode([
                'exists' => false,
                'error' => 'Email does not match your account'
            ]);
        }
    } catch(PDOException $e) {
        return json_encode(['error' => $e->getMessage()]);
    }
}
```

#### 2. Add `sendCode` Operation

**⚠️ IMPORTANT:** Update email credentials before using!

```php
// In your switch statement, add this case:

case 'sendCode':
    echo sendCode($json);
    break;

// Then add this function:

function sendCode($json) {
    $data = json_decode($json, true);
    $email = $data['email'];
    $code = $data['code'];
    $name = $data['name'];
    
    // Load PHPMailer
    require_once __DIR__ . '/vendor/autoload.php';
    // OR if installed differently:
    // require_once 'PHPMailer/src/Exception.php';
    // require_once 'PHPMailer/src/PHPMailer.php';
    // require_once 'PHPMailer/src/SMTP.php';
    
    use PHPMailer\PHPMailer\PHPMailer;
    use PHPMailer\PHPMailer\Exception;
    
    $mail = new PHPMailer(true);
    
    try {
        // SMTP Configuration
        $mail->isSMTP();
        $mail->Host = 'smtp.gmail.com';
        $mail->SMTPAuth = true;
        $mail->Username = 'YOUR_EMAIL@gmail.com';  // ← CHANGE THIS
        $mail->Password = 'xxxx xxxx xxxx xxxx';    // ← CHANGE THIS (App Password)
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port = 587;
        
        // Disable SSL verification (for localhost testing only)
        $mail->SMTPOptions = array(
            'ssl' => array(
                'verify_peer' => false,
                'verify_peer_name' => false,
                'allow_self_signed' => true
            )
        );
        
        // Email settings
        $mail->setFrom('YOUR_EMAIL@gmail.com', 'A.G Home Appliance');
        $mail->addAddress($email, $name);
        $mail->isHTML(true);
        $mail->Subject = 'Password Reset Verification Code';
        
        // Email body
        $mail->Body = "
        <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>
            <div style='background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;'>
                <h1 style='margin: 0;'>A.G HOME APPLIANCE</h1>
                <h2 style='margin: 10px 0 0 0;'>Password Reset Request</h2>
            </div>
            <div style='padding: 40px 30px; background-color: #f9f9f9;'>
                <p style='font-size: 16px;'>Hello <strong>$name</strong>,</p>
                <p style='font-size: 16px;'>We received a request to reset your password. Use the verification code below:</p>
                <div style='background-color: white; padding: 30px; text-align: center; border-radius: 10px; margin: 30px 0;'>
                    <h1 style='color: #667eea; font-size: 48px; letter-spacing: 10px; margin: 0;'>$code</h1>
                </div>
                <p style='font-size: 14px; color: #666;'>This code will expire in <strong>15 minutes</strong>.</p>
                <p style='font-size: 14px; color: #666;'>If you didn't request this, please ignore this email.</p>
            </div>
            <div style='background-color: #333; color: white; padding: 20px; text-align: center; font-size: 12px; border-radius: 0 0 10px 10px;'>
                <p style='margin: 0;'>&copy; " . date('Y') . " A.G Home Appliance. All rights reserved.</p>
            </div>
        </div>
        ";
        
        $mail->send();
        return json_encode([
            'success' => true,
            'message' => 'Verification code sent successfully'
        ]);
        
    } catch (Exception $e) {
        // Return detailed error for debugging
        return json_encode([
            'success' => false,
            'error' => 'Mailer Error: ' . $mail->ErrorInfo,
            'exception' => $e->getMessage()
        ]);
    }
}
```

---

## 📧 Gmail SMTP Setup (REQUIRED!)

### Step 1: Enable 2-Step Verification
1. Go to: https://myaccount.google.com/security
2. Click "2-Step Verification"
3. Follow the steps to enable it

### Step 2: Generate App Password
1. Go to: https://myaccount.google.com/apppasswords
2. Select app: "Mail"
3. Select device: "Other (Custom name)" → Type "Capstone Project"
4. Click "Generate"
5. Copy the 16-character password (looks like: `xxxx xxxx xxxx xxxx`)

### Step 3: Update login.php
```php
$mail->Username = 'your.email@gmail.com';      // Your Gmail
$mail->Password = 'abcd efgh ijkl mnop';        // The 16-char password
```

---

## 🧪 Testing

### Test 1: Check if PHPMailer is Installed

Create a test file: `C:\xampp\htdocs\capstone-api\api\test-phpmailer.php`

```php
<?php
require_once __DIR__ . '/vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;

if (class_exists('PHPMailer\PHPMailer\PHPMailer')) {
    echo "✅ PHPMailer is installed correctly!";
} else {
    echo "❌ PHPMailer is NOT installed!";
    echo "<br>Run: composer require phpmailer/phpmailer";
}
?>
```

Visit: `http://localhost/capstone-api/api/test-phpmailer.php`

**If it says NOT installed:**
```bash
cd C:\xampp\htdocs\capstone-api\api
composer require phpmailer/phpmailer
```

### Test 2: Test Email Sending Directly

Create: `C:\xampp\htdocs\capstone-api\api\test-send-email.php`

```php
<?php
require_once __DIR__ . '/vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;

$mail = new PHPMailer(true);

try {
    $mail->isSMTP();
    $mail->Host = 'smtp.gmail.com';
    $mail->SMTPAuth = true;
    $mail->Username = 'YOUR_EMAIL@gmail.com';      // ← CHANGE
    $mail->Password = 'xxxx xxxx xxxx xxxx';        // ← CHANGE (App Password)
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port = 587;
    
    $mail->SMTPOptions = array(
        'ssl' => array(
            'verify_peer' => false,
            'verify_peer_name' => false,
            'allow_self_signed' => true
        )
    );
    
    $mail->setFrom('YOUR_EMAIL@gmail.com', 'Test');
    $mail->addAddress('YOUR_EMAIL@gmail.com');      // Send to yourself
    $mail->Subject = 'Test Email';
    $mail->Body = 'This is a test email. If you receive this, PHPMailer is working!';
    
    $mail->send();
    echo '✅ Email sent successfully! Check your inbox.';
} catch (Exception $e) {
    echo '❌ Error: ' . $mail->ErrorInfo;
}
?>
```

Visit: `http://localhost/capstone-api/api/test-send-email.php`

---

## 🔍 Common Issues & Solutions

### Issue 1: "PHPMailer class not found"
**Solution:** Install PHPMailer
```bash
cd C:\xampp\htdocs\capstone-api\api
composer require phpmailer/phpmailer
```

### Issue 2: "SMTP connect() failed"
**Solutions:**
1. Check your Gmail credentials
2. Make sure you're using App Password (not regular password)
3. Enable "Less secure app access" (not recommended)
4. Add SSL verification bypass (see code above)

### Issue 3: "Username and Password not accepted"
**Solution:** 
- You must use App Password, not your regular Gmail password
- Regenerate App Password if it's not working

### Issue 4: "Operation not found"
**Solution:** 
- Make sure you added the `case 'verifyUserEmail':` and `case 'sendCode':` in your switch statement
- Check for typos in operation names

### Issue 5: Email goes to Spam
**Solution:**
- Check spam/junk folder
- Mark as "Not Spam"
- Emails from localhost often go to spam (normal behavior)

---

## 📋 Checklist

Before testing again, make sure:

- [ ] PHPMailer is installed (`composer require phpmailer/phpmailer`)
- [ ] Gmail 2-Step Verification is enabled
- [ ] Gmail App Password is generated (16 characters)
- [ ] `verifyUserEmail` case added to login.php
- [ ] `sendCode` case added to login.php
- [ ] Email credentials updated in `sendCode()` function
- [ ] XAMPP Apache is running
- [ ] Database connection is working
- [ ] `account` table has `email` column

---

## 🎯 Quick Test Steps

1. **Start XAMPP** (Apache + MySQL)

2. **Test backend directly:**
   - Visit: `http://localhost/capstone-api/api/test-phpmailer.php`
   - Should say: "PHPMailer is installed correctly!"

3. **Test email sending:**
   - Visit: `http://localhost/capstone-api/api/test-send-email.php`
   - Should say: "Email sent successfully!"
   - Check your email inbox (and spam folder)

4. **Test in app:**
   - Go to Profile Settings
   - Click "Change Password"
   - Click "Forgot Password?"
   - Enter your email
   - Click "Send Code"
   - **Check browser console (F12)** for any errors
   - Check your email for the code

---

## 📞 Still Not Working?

### Check These:

1. **Browser Console (F12)**
   - What error message do you see?
   - Is it a 404, 500, or network error?

2. **PHP Error Log**
   - Location: `C:\xampp\apache\logs\error.log`
   - Check for PHP errors

3. **Network Tab (F12 → Network)**
   - Click "Send Code"
   - Look for the request to `login.php`
   - Check the response
   - Is it returning an error?

4. **Email Settings**
   - Are you using the correct Gmail?
   - Is 2-Step Verification enabled?
   - Is the App Password correct?

---

## 💡 Pro Tip

Add error logging to help debug:

```php
function sendCode($json) {
    // Log the attempt
    error_log("📧 Attempting to send email...");
    error_log("Data: " . print_r($data, true));
    
    try {
        // ... existing code ...
        
        $mail->send();
        error_log("✅ Email sent successfully!");
        
    } catch (Exception $e) {
        error_log("❌ Email failed: " . $e->getMessage());
        // ... existing code ...
    }
}
```

Then check: `C:\xampp\apache\logs\error.log`

---

**🚀 Once you complete these steps, the forgot password email should work!**

If you're still having issues, check the browser console and PHP error log for specific error messages.

