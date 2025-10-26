# ✅ Fix "Account In Use" Message - Complete Guide

## 🎯 Problem
When trying to log in with an account that's already online, the system shows:
- ❌ "No account found" (WRONG)
- ✅ Should show: "Account In Use ⚠️" (CORRECT)

---

## 📝 What Was Fixed

### 1. ✅ Frontend Updated (COMPLETE)
**File:** `app/page.js`

**Changes Made:**
- Added better error detection for "account_in_use" error
- Added check for `active_status === 'Online'` in user data
- Added detailed debug logging
- Now properly shows "Account In Use ⚠️" message

---

### 2. 🔧 Backend Needs Update (ACTION REQUIRED)

**Important:** The actual backend file you're using is:
```
C:\xampp\htdocs\capstone-api\api\login.php
```

**Reference file in project:**
```
C:\Users\USER\capstone2\login_CLEAN.php
```

The `login_CLEAN.php` file has the correct code, but you need to copy it to your actual backend location.

---

## 🚀 Step-by-Step Backend Update

### Step 1: Open Your Backend File

1. Open file explorer
2. Navigate to: `C:\xampp\htdocs\capstone-api\api\`
3. Open `login.php` in a text editor (VS Code, Notepad++, etc.)

### Step 2: Find the Login Function

Look for the function that handles login. It should have code like:
```php
function login($json) {
    // ... password verification code ...
}
```

### Step 3: Add Account Status Check

**Find this section** (after password verification succeeds):
```php
if ($passwordMatch) {
    // Update active_status to "Online"
    $updateSql = "UPDATE account SET active_status = 'Online' WHERE account_id = :account_id";
    // ...
}
```

**Replace it with this:**
```php
if ($passwordMatch) {
    // CHECK ACCOUNT STATUS BEFORE ALLOWING LOGIN
    $accountStatus = $user['status'];
    error_log("Account status: " . $accountStatus);
    
    // Block deactivated accounts
    if ($accountStatus === 'Deactive') {
        error_log("Login blocked: Account is deactivated");
        unset($conn); unset($stmt);
        return json_encode([
            'error' => 'account_deactivated',
            'message' => 'This user no longer has access to the system. Please contact your administrator for more information.'
        ]);
    }
    
    // Block suspended accounts
    if ($accountStatus === 'Suspended') {
        error_log("Login blocked: Account is suspended");
        unset($conn); unset($stmt);
        return json_encode([
            'error' => 'account_suspended',
            'message' => 'Your account has been temporarily suspended. Please contact your administrator for assistance.'
        ]);
    }
    
    // ⭐ CHECK IF ACCOUNT IS ALREADY ONLINE (IN USE) ⭐
    if ($user['active_status'] === 'Online') {
        error_log("Login blocked: Account is already online (in use)");
        unset($conn); unset($stmt);
        
        // Return special error code for "account in use"
        return json_encode([
            'error' => 'account_in_use',
            'message' => 'This account is currently in use. Please try again later or contact support if this is your account.'
        ]);
    }
    
    // Only allow Active users to login
    // Update active_status to "Online" immediately upon successful login
    $updateSql = "UPDATE account SET active_status = 'Online' WHERE account_id = :account_id";
    $updateStmt = $conn->prepare($updateSql);
    $updateStmt->bindParam(':account_id', $user['account_id']);
    $updateStmt->execute();
    error_log("Updated active_status to Online for user: " . $user['account_id']);
    
    // Update the user array to reflect the change
    $user['active_status'] = 'Online';
    
    // Remove password from returned data for security
    unset($user['user_password']);
    error_log("Login successful!");
    unset($conn); unset($stmt); unset($updateStmt);
    return json_encode([$user]);
}
```

### Step 4: Save and Test

1. Save the `login.php` file
2. Restart XAMPP Apache (if needed)
3. Test the login

---

## 🧪 Testing Instructions

### Test 1: Normal Login (Account Offline)
1. Make sure your account is offline in database:
   ```sql
   UPDATE account SET active_status = 'Offline' WHERE email = 'your@email.com';
   ```
2. Try to login
3. ✅ Should succeed and show dashboard

### Test 2: Account Already Online
1. Set account to online in database:
   ```sql
   UPDATE account SET active_status = 'Online' WHERE email = 'your@email.com';
   ```
2. Try to login
3. ✅ Should show: "Account In Use ⚠️"
4. ✅ Message: "This account is currently in use. Please try again later or contact support if this is your account."

### Test 3: Deactivated Account
1. Set account to deactivated:
   ```sql
   UPDATE account SET status = 'Deactive' WHERE email = 'your@email.com';
   ```
2. Try to login
3. ✅ Should show: "Access Denied"

---

## 📊 What You Should See

### Before Fix:
```
User tries to login with online account
  ↓
Backend returns empty array []
  ↓
Frontend shows: "Account not found⚠️" ❌
```

### After Fix:
```
User tries to login with online account
  ↓
Backend returns: {error: 'account_in_use', message: '...'}
  ↓
Frontend shows: "Account In Use ⚠️" ✅
```

---

## 🔍 Debugging

### Check Backend Logs
Open: `C:\xampp\apache\logs\error.log`

Look for:
```
Login blocked: Account is already online (in use)
```

### Check Frontend Console
Open browser DevTools (F12) → Console

Look for:
```
❌ Login blocked: account_in_use
❌ Account is already in use (active_status is Online)
```

### Check Database
```sql
SELECT account_id, email, status, active_status 
FROM account 
WHERE email = 'your@email.com';
```

Should show:
- `status`: 'Active', 'Deactive', or 'Suspended'
- `active_status`: 'Online' or 'Offline'

---

## 🎯 Quick Copy-Paste Solution

If you want to completely replace your backend login function, copy the entire login function from:

**Source:**
```
C:\Users\USER\capstone2\login_CLEAN.php
```

**Destination:**
```
C:\xampp\htdocs\capstone-api\api\login.php
```

**Or use this complete function:**

```php
function login($json){
    include 'conn.php';
    $json = json_decode($json, true);
    
    $sql = "SELECT a.*, 
                   r.role_name, 
                   l.location_name, 
                   l.location_type
            FROM account a
            LEFT JOIN role r ON a.role_id = r.role_id
            LEFT JOIN location l ON a.location_id = l.location_id
            WHERE (a.username = :username OR a.email = :username) 
            AND a.user_password = :password";
    
    error_log("Login attempt for: " . $json['username']);
    
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':username', $json['username']);
    $stmt->bindParam(':password', $json['password']);
    $stmt->execute();
    
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($user) {
        error_log("User found: " . $user['email']);
        
        // Verify password
        $passwordMatch = ($user['user_password'] === $json['password']);
        
        if (!$passwordMatch) {
            error_log("Password does not match for user: " . $json['username']);
        }
        
        if ($passwordMatch) {
            // CHECK ACCOUNT STATUS BEFORE ALLOWING LOGIN
            $accountStatus = $user['status'];
            error_log("Account status: " . $accountStatus);
            
            // Block deactivated accounts
            if ($accountStatus === 'Deactive') {
                error_log("Login blocked: Account is deactivated");
                unset($conn); unset($stmt);
                return json_encode([
                    'error' => 'account_deactivated',
                    'message' => 'This user no longer has access to the system. Please contact your administrator for more information.'
                ]);
            }
            
            // Block suspended accounts
            if ($accountStatus === 'Suspended') {
                error_log("Login blocked: Account is suspended");
                unset($conn); unset($stmt);
                return json_encode([
                    'error' => 'account_suspended',
                    'message' => 'Your account has been temporarily suspended. Please contact your administrator for assistance.'
                ]);
            }
            
            // Check if account is already online (in use by another session)
            if ($user['active_status'] === 'Online') {
                error_log("Login blocked: Account is already online (in use)");
                unset($conn); unset($stmt);
                
                // Return special error code for "account in use"
                return json_encode([
                    'error' => 'account_in_use',
                    'message' => 'This account is currently in use. Please try again later or contact support if this is your account.'
                ]);
            }
            
            // Only allow Active users to login
            // Update active_status to "Online" immediately upon successful login
            $updateSql = "UPDATE account SET active_status = 'Online' WHERE account_id = :account_id";
            $updateStmt = $conn->prepare($updateSql);
            $updateStmt->bindParam(':account_id', $user['account_id']);
            $updateStmt->execute();
            error_log("Updated active_status to Online for user: " . $user['account_id']);
            
            // Update the user array to reflect the change
            $user['active_status'] = 'Online';
            
            // Remove password from returned data for security
            unset($user['user_password']);
            error_log("Login successful!");
            unset($conn); unset($stmt); unset($updateStmt);
            return json_encode([$user]);
        } else {
            error_log("Password does not match");
            unset($conn); unset($stmt);
            return json_encode([]);
        }
    } else {
        error_log("User not found");
        unset($conn); unset($stmt);
        return json_encode([]);
    }
}
```

---

## ✅ Verification Checklist

After updating backend, verify:

- [ ] Backend file updated: `C:\xampp\htdocs\capstone-api\api\login.php`
- [ ] Apache restarted (if needed)
- [ ] Test login with offline account → Success
- [ ] Test login with online account → "Account In Use ⚠️"
- [ ] Test login with deactivated account → "Access Denied"
- [ ] Check error logs for debug messages
- [ ] Check browser console for debug messages

---

## 📞 Still Having Issues?

If you still see "Account not found" instead of "Account In Use":

1. **Check BASE_URL** in `app/page.js` line 56:
   - Make sure it points to correct backend
   - Default: `http://localhost/capstone-api/api/`

2. **Check backend file location**:
   - File must be at: `C:\xampp\htdocs\capstone-api\api\login.php`
   - Not: `C:\Users\USER\capstone2\login_CLEAN.php`

3. **Clear browser cache**:
   - Press Ctrl+Shift+Delete
   - Clear cached files
   - Refresh page (Ctrl+F5)

4. **Check XAMPP**:
   - Apache must be running
   - MySQL must be running
   - Check error logs

---

## 🎉 Success!

After these updates, your login system will properly show:

- ✅ "Account In Use ⚠️" when account is already online
- ✅ "Access Denied" when account is deactivated
- ✅ "Account Suspended" when account is suspended
- ✅ "Account not found⚠️" only for invalid credentials

**The message will now be accurate!** 🎯

---

**Last Updated:** October 24, 2025  
**Status:** ✅ Frontend Complete | 🔧 Backend Needs Manual Update

