# Deployment Login Issue - Debugging Guide

## 🔴 Problem
- **Local:** Login works with `https://ag-home.site/backend/api/`
- **Deployed:** Can't login - "no connection" error

---

## 🔍 Common Causes & Solutions

### **1. CORS (Cross-Origin Resource Sharing) Issue** ⚠️

The backend might be blocking requests from your deployed frontend.

#### **Fix: Update Backend CORS Headers**

Add these headers to **ALL your PHP files** in `C:\xampp\htdocs\capstone-api\api\`:

```php
<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');  // ← This is critical!
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
```

**Files to update:**
- `login.php`
- `users.php`
- `audit-log.php`
- `forgot-password.php`
- All other API files

---

### **2. Backend Server Not Running** 🖥️

Check if your backend server at `https://ag-home.site/backend/api/` is running.

#### **Test:**
Open in browser: `https://ag-home.site/backend/api/login.php`

**Expected:** Should show something (even an error is fine)  
**Problem:** If it shows "Cannot connect" or times out → Server is down

---

### **3. SSL/HTTPS Certificate Issue** 🔒

If deployed frontend is HTTPS, it cannot call HTTP backend.

#### **Check:**
- Frontend URL: `https://your-deployed-site.com` ✅
- Backend URL: `https://ag-home.site/backend/api/` ✅

Both should be HTTPS! If backend is HTTP, browser will block it.

---

### **4. Firewall/Network Blocking** 🚫

Your hosting provider might be blocking external API calls.

#### **Check Deployment Platform:**

**Vercel/Netlify:**
- No special config needed
- Should work with CORS headers

**Other platforms:**
- May need to whitelist the backend domain
- Check platform documentation

---

## 🧪 **Debugging Steps**

### **Step 1: Check Browser Console**

When login fails on deployed site:

1. Press **F12** (open DevTools)
2. Go to **Console** tab
3. Look for errors like:
   - `CORS policy` → CORS issue
   - `net::ERR_CONNECTION_REFUSED` → Backend down
   - `Mixed content` → HTTP/HTTPS mismatch
   - `Failed to fetch` → Network issue

4. Go to **Network** tab
5. Try logging in
6. Look at the `login.php` request:
   - **Red?** → Request failed
   - **Status code?** → What does it say?

**Share these with me!**

---

### **Step 2: Test Backend Directly**

Open these URLs in your browser:

1. `https://ag-home.site/backend/api/`
   - Should show: Directory listing or error (not "Cannot connect")

2. `https://ag-home.site/backend/api/login.php`
   - Should show: Some JSON response or PHP error

3. `https://ag-home.site/backend/api/login.php?operation=login&json={"username":"test","password":"test"}`
   - Should show: JSON response (even if login fails)

**If any of these don't work** → Backend server is not accessible

---

### **Step 3: Check CORS on Backend**

Run this command on your **backend server** (via SSH or cPanel terminal):

```bash
curl -I https://ag-home.site/backend/api/login.php
```

Look for:
```
Access-Control-Allow-Origin: *
```

If missing → CORS not configured

---

## 🔧 **Quick Fix: Add CORS to login.php**

Edit: `C:\xampp\htdocs\capstone-api\api\login.php`

**Add at the TOP** (line 1-2):

```php
<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// ... rest of your code
```

---

## 📝 **Environment-Specific Configuration**

Instead of hardcoding the URL, you can use environment variables:

### **In Next.js:**

Create `.env.local` (for local):
```
NEXT_PUBLIC_API_URL=http://localhost/capstone-api/api/
```

Create `.env.production` (for deployment):
```
NEXT_PUBLIC_API_URL=https://ag-home.site/backend/api/
```

### **In page.js:**

```javascript
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://ag-home.site/backend/api/';
```

This way, it automatically uses the right URL!

---

## ✅ **Most Likely Solution**

**99% of deployment login issues are CORS!**

1. Add CORS headers to `login.php`
2. Add CORS headers to all API files
3. Redeploy your backend
4. Clear browser cache
5. Try login again

---

## 🚨 **Emergency Test**

To confirm it's CORS, temporarily disable CORS in your browser:

**Chrome:**
1. Close all Chrome windows
2. Run Chrome with: `chrome.exe --disable-web-security --user-data-dir="C:/ChromeDevSession"`
3. Try login on deployed site
4. **If it works** → Confirmed CORS issue!

⚠️ **Don't use this browser for regular browsing** - only for testing!

---

## 📞 **What to Share for Help**

If still not working, share:

1. **Browser Console Error** (screenshot or text)
2. **Network Tab** → login.php request (screenshot)
3. **Backend URL test** → Does `https://ag-home.site/backend/api/login.php` open?
4. **Deployed Frontend URL** → Where is it deployed?
5. **Hosting Platform** → Vercel? Netlify? Custom server?

---

## 💡 **Common Mistakes**

❌ **Forgot to restart Apache** after updating PHP files  
❌ **Backend server is offline**  
❌ **Wrong backend URL** (missing `/api/` or trailing slash)  
❌ **Firewall blocking port 80/443**  
❌ **SSL certificate expired or invalid**  

---

**Next Step:** Check browser console and share the error message!

