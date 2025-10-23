# 🚀 Deploy Forgot Password to Production Server

## 📍 Your API Locations

### Local Development
- **Path**: `capstone-api/api/forgot-password.php`
- **URL**: `http://localhost/capstone-api/api/forgot-password.php`
- **Status**: ✅ File already created!

### Production Server
- **Domain**: `https://ag-home.site/backend/`
- **File**: `forgot-password.php`
- **Status**: ❗ **YOU NEED TO UPLOAD THIS**

---

## 📤 Step 1: Upload to Production

### Option A: Using FTP/SFTP (FileZilla, WinSCP, etc.)

1. **Connect to your hosting server**
   - Host: `ag-home.site`
   - Use your FTP/SFTP credentials

2. **Navigate to your backend folder**
   - Usually: `/public_html/backend/` or `/www/backend/`

3. **Upload the file**
   - Local file: `capstone-api/api/forgot-password.php`
   - Upload to: `/backend/forgot-password.php`

### Option B: Using cPanel File Manager

1. **Login to cPanel** at your hosting provider
2. **Open File Manager**
3. **Navigate to** `/public_html/backend/` (or wherever your backend files are)
4. **Click "Upload"**
5. **Select** `capstone-api/api/forgot-password.php`
6. **Upload** the file

### Option C: Copy via SSH

```bash
# Connect to your server
ssh your-username@ag-home.site

# Navigate to backend folder
cd /path/to/backend/

# Use nano or vim to create the file
nano forgot-password.php

# Paste the contents from capstone-api/api/forgot-password.php
# Save and exit
```

---

## 🔧 Step 2: Configure Email on Production

After uploading, you need to configure the email settings:

### Edit the Production File

Open: `https://ag-home.site/backend/forgot-password.php` (via FTP/cPanel)

**Update these lines (around line 88-91):**

```php
$mail->Username   = 'your-email@gmail.com';              // Your Gmail
$mail->Password   = 'your-16-char-app-password';         // App Password
```

**Change to:**

```php
$mail->Username   = 'youractual@gmail.com';              // Your real Gmail
$mail->Password   = 'abcdefghijklmnop';                  // Your 16-char app password
```

**Also update line 98:**

```php
$mail->setFrom('youractual@gmail.com', 'A.G Home');
```

---

## 📦 Step 3: Install PHPMailer on Production

Your production server needs PHPMailer installed.

### Option A: Via SSH + Composer (Recommended)

```bash
# SSH into your server
ssh your-username@ag-home.site

# Navigate to backend folder
cd /path/to/backend/

# Install PHPMailer
composer require phpmailer/phpmailer
```

### Option B: Upload PHPMailer Manually

1. **Download PHPMailer**: https://github.com/PHPMailer/PHPMailer/releases
2. **Extract the files**
3. **Upload the `PHPMailer` folder to your server**:
   - Upload to: `/backend/PHPMailer/`
   - Should have: `/backend/PHPMailer/src/PHPMailer.php`, etc.

4. **The file already has fallback code** to load PHPMailer manually

---

## 🔄 Step 4: Update Frontend for Production

When deploying to production, **uncomment** the production URL:

**In `app/page.js` (line 54-55):**

```javascript
// For PRODUCTION:
const BASE_URL = 'https://ag-home.site/backend/';

// For LOCAL DEVELOPMENT:
// const BASE_URL = 'http://localhost/capstone-api/api/';
```

Or use environment variables:

```javascript
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/capstone-api/api/';
```

Then in `.env.production`:
```
NEXT_PUBLIC_API_URL=https://ag-home.site/backend/
```

And in `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost/capstone-api/api/
```

---

## ✅ Step 5: Test Both Environments

### Test Locally (Development)

1. Make sure you're using:
   ```javascript
   const BASE_URL = 'http://localhost/capstone-api/api/';
   ```

2. Configure `capstone-api/api/forgot-password.php` with your Gmail

3. Test the forgot password feature

### Test Production (Live Server)

1. Switch to:
   ```javascript
   const BASE_URL = 'https://ag-home.site/backend/';
   ```

2. Upload `forgot-password.php` to your server

3. Configure it with your Gmail credentials

4. Test on your live site

---

## 📋 Deployment Checklist

### Local Development
- [x] `capstone-api/api/forgot-password.php` created
- [ ] PHPMailer installed (`composer require phpmailer/phpmailer`)
- [ ] Email credentials configured (Gmail + App Password)
- [ ] Test forgot password feature locally

### Production Server
- [ ] Upload `forgot-password.php` to `https://ag-home.site/backend/`
- [ ] Install PHPMailer on server (Composer or manual)
- [ ] Configure email credentials in production file
- [ ] Update `BASE_URL` in `app/page.js` for production
- [ ] Test forgot password on live site

---

## 🔒 Security Recommendations

### Don't Commit Credentials to Git

Add this to your `.gitignore`:

```
# Ignore files with credentials
capstone-api/api/forgot-password.php
```

Or better yet, use **environment variables**:

```php
// In forgot-password.php
$mail->Username = getenv('EMAIL_USERNAME') ?: 'fallback@gmail.com';
$mail->Password = getenv('EMAIL_PASSWORD') ?: 'fallback-password';
```

Then set environment variables on your server via cPanel or `.env` file.

---

## 🆘 Troubleshooting

### Local works, but production doesn't

1. **Check file path**: Make sure `forgot-password.php` is in `/backend/` folder
2. **Check URL**: Verify frontend is calling `https://ag-home.site/backend/forgot-password.php`
3. **Check PHPMailer**: Ensure it's installed on production server
4. **Check CORS**: Make sure your backend allows requests from your frontend domain
5. **Check logs**: Look at PHP error logs on your server

### Email not sending on production

1. **Firewall**: Some hosting providers block SMTP ports (587/465)
2. **Check with host**: Contact your hosting support about SMTP access
3. **Try port 465**: Change from port 587 to 465 with SSL
4. **Use alternative**: Consider SendGrid or other email services

---

## 📞 Quick Commands

### Copy file content to clipboard (Windows)

```powershell
Get-Content capstone-api/api/forgot-password.php | Set-Clipboard
```

### Check if file exists on server

```bash
curl -I https://ag-home.site/backend/forgot-password.php
```

### Test API endpoint

```bash
curl "https://ag-home.site/backend/forgot-password.php?operation=checkEmail&json={\"email\":\"test@example.com\"}"
```

---

## 📁 File Locations Summary

| Environment | File Location |
|-------------|---------------|
| **Local** | `C:\Users\USER\capstone2\capstone-api\api\forgot-password.php` |
| **Production** | Upload to: `/public_html/backend/forgot-password.php` |
| **Frontend** | `app/page.js` (line 54-55 - BASE_URL) |

---

## ✨ You're Almost Done!

1. **For local testing**: Configure the email in `capstone-api/api/forgot-password.php`
2. **For production**: Upload the file and configure it on your server

Good luck! 🚀

