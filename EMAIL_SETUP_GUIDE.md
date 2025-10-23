# 📧 Email Setup Guide for Forgot Password Feature

## ⚠️ CRITICAL: Configure Email Settings

The forgot password feature needs email configuration to work. Follow these steps:

---

## 🔧 Step 1: Install PHPMailer

### Option A: Using Composer (Recommended)
```bash
cd capstone-api
composer require phpmailer/phpmailer
```

### Option B: Manual Installation
1. Download PHPMailer: https://github.com/PHPMailer/PHPMailer/releases
2. Extract to `capstone-api/api/PHPMailer/`
3. The file already includes manual import fallback

---

## 🔑 Step 2: Get Gmail App Password

### 1. Enable 2-Step Verification
- Go to: https://myaccount.google.com/security
- Scroll to "2-Step Verification"
- Click "Get started" and follow the steps

### 2. Generate App Password
- Go to: https://myaccount.google.com/apppasswords
- Select app: **Mail**
- Select device: **Other (Custom name)**
- Enter name: **A.G Home Password Reset**
- Click **Generate**
- You'll get a **16-character password** (looks like: `abcd efgh ijkl mnop`)
- **Copy this password** (you can't see it again!)

---

## ✏️ Step 3: Update forgot-password.php

Open: `capstone-api/api/forgot-password.php`

Find these lines (around line 88-91):

```php
// ⚠️ IMPORTANT: Replace these with your actual Gmail credentials
$mail->Username   = 'your-email@gmail.com';              // Your Gmail address
$mail->Password   = 'your-16-char-app-password';         // Your Gmail App Password
```

Replace with your actual credentials:

```php
$mail->Username   = 'youractual@gmail.com';              // Your real Gmail
$mail->Password   = 'abcdefghijklmnop';                  // Your 16-char app password (no spaces)
```

Also update the "From" email (line 98):

```php
$mail->setFrom('youractual@gmail.com', 'A.G Home');
```

---

## 🧪 Step 4: Test the Setup

1. **Restart your development server** (if running)

2. **Open your login page**

3. **Click "Forgot Password?"**

4. **Enter a valid email** from your database

5. **Click "Send Code"**

6. **Check your email** for the verification code

---

## ❌ Troubleshooting

### Error: "Failed to send email"

**Possible causes:**

1. **Wrong Gmail credentials**
   - Double-check your email and app password
   - Make sure you removed the spaces from the app password

2. **2-Step Verification not enabled**
   - You MUST enable 2-Step Verification first
   - Then generate the app password

3. **PHPMailer not installed**
   - Run: `composer require phpmailer/phpmailer`
   - Or download manually and place in `capstone-api/api/PHPMailer/`

4. **Firewall blocking port 587**
   - Try changing port to 465:
     ```php
     $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
     $mail->Port       = 465;
     ```

5. **Hosting restrictions**
   - Some hosting providers block SMTP
   - Contact your hosting support

### Error: "SMTP Error: Could not authenticate"

- Your app password is incorrect
- Try generating a new app password
- Make sure you're using the app password, NOT your regular Gmail password

### Error: "Account does not exist"

- The email is not in your database
- Check the `account` table for the email

---

## 🔐 Security Tips

✅ **Never commit credentials to Git**
   - Add `forgot-password.php` to `.gitignore` OR
   - Use environment variables for credentials

✅ **Use HTTPS in production**
   - Email credentials are sent over the network

✅ **Consider rate limiting**
   - Prevent spam by limiting password reset attempts

✅ **Set code expiration**
   - Verification codes should expire after 15 minutes
   - (Currently not implemented, but recommended)

---

## 🌐 Alternative Email Providers

### SendGrid (Recommended for production)
```php
$mail->Host       = 'smtp.sendgrid.net';
$mail->Port       = 587;
$mail->Username   = 'apikey';
$mail->Password   = 'your-sendgrid-api-key';
```

### Outlook/Hotmail
```php
$mail->Host       = 'smtp-mail.outlook.com';
$mail->Port       = 587;
$mail->Username   = 'your-email@outlook.com';
$mail->Password   = 'your-password';
```

### Office 365
```php
$mail->Host       = 'smtp.office365.com';
$mail->Port       = 587;
$mail->Username   = 'your-email@yourdomain.com';
$mail->Password   = 'your-password';
```

---

## 📝 Quick Checklist

- [ ] PHPMailer installed (Composer or manual)
- [ ] 2-Step Verification enabled on Gmail
- [ ] App Password generated
- [ ] `forgot-password.php` updated with real email
- [ ] `forgot-password.php` updated with real app password
- [ ] `setFrom()` updated with real email
- [ ] Tested sending code
- [ ] Received email successfully

---

## 🎯 Current File Location

Your PHP file is at:
```
capstone-api/api/forgot-password.php
```

Frontend calls it at:
```javascript
https://localhost/backend/forgot-password.php?operation=...
```

Make sure your `api.js` URL matches your backend path!

---

## ✅ Ready to Test!

Once you've updated the email credentials, try the forgot password feature again!

If you still get errors, check the browser console and PHP error logs for more details.

