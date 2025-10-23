# Fix Deactivated Account Login - Backend Update

## 🔧 Problem
Deactivated and suspended accounts can still log in because the backend `login.php` doesn't check the account status before returning user data.

## ✅ Solution
Update the `login.php` file to check account status and reject deactivated/suspended users.

---

## 📝 Backend Update Required

### File: `C:\xampp\htdocs\capstone-api\api\login.php`

Find the `login` function (or similar function that handles authentication) and add the status check **AFTER** password verification but **BEFORE** returning user data.

### Current Code (Approximate):
```php
function login($json) {
    $json = json_decode($json, true);
    
    $sql = "SELECT a.*, 
                   r.role_name, 
                   l.location_name 
            FROM users a
            LEFT JOIN role r ON a.role_id = r.role_id
            LEFT JOIN location l ON a.location_id = l.location_id
            WHERE (a.username = :username OR a.email = :username) 
            AND a.user_password = :password";
    
    $stmt = $this->pdo->prepare($sql);
    $stmt->bindParam(':username', $json['username']);
    $stmt->bindParam(':password', $json['password']); // Should be MD5 hashed
    $stmt->execute();
    
    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Update active_status to 'Online' if login successful
    if (count($data) > 0) {
        $updateSql = "UPDATE users SET active_status = 'Online' WHERE account_id = :id";
        $updateStmt = $this->pdo->prepare($updateSql);
        $updateStmt->bindParam(':id', $data[0]['account_id']);
        $updateStmt->execute();
    }
    
    return $data;
}
```

### Updated Code (WITH STATUS CHECK):
```php
function login($json) {
    $json = json_decode($json, true);
    
    $sql = "SELECT a.*, 
                   r.role_name, 
                   l.location_name 
            FROM users a
            LEFT JOIN role r ON a.role_id = r.role_id
            LEFT JOIN location l ON a.location_id = l.location_id
            WHERE (a.username = :username OR a.email = :username) 
            AND a.user_password = :password";
    
    $stmt = $this->pdo->prepare($sql);
    $stmt->bindParam(':username', $json['username']);
    $stmt->bindParam(':password', $json['password']); // Should be MD5 hashed
    $stmt->execute();
    
    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // ⭐ ADD THIS CHECK BEFORE ALLOWING LOGIN ⭐
    if (count($data) > 0) {
        $accountStatus = $data[0]['status'];
        
        // Block deactivated accounts
        if ($accountStatus === 'Deactive') {
            return [
                'error' => 'account_deactivated',
                'message' => 'This user no longer has access to the system. Please contact your administrator for more information.'
            ];
        }
        
        // Block suspended accounts
        if ($accountStatus === 'Suspended') {
            return [
                'error' => 'account_suspended',
                'message' => 'Your account has been temporarily suspended. Please contact your administrator for assistance.'
            ];
        }
        
        // Only update active_status to 'Online' if account is Active
        if ($accountStatus === 'Active') {
            $updateSql = "UPDATE users SET active_status = 'Online' WHERE account_id = :id";
            $updateStmt = $this->pdo->prepare($updateSql);
            $updateStmt->bindParam(':id', $data[0]['account_id']);
            $updateStmt->execute();
        }
    }
    
    return $data;
}
```

---

## 🔄 Frontend Update

The frontend already has the check, but we need to update it to handle the backend error response:

### File: `app/page.js` (Line ~422-433)

Update the account_in_use check to also handle account status errors:

```javascript
// Check if response is an error (account in use, deactivated, or suspended)
if (response.data && response.data.error) {
  addDebugLog('❌ Login blocked:', response.data.error);
  
  let title = 'Login Failed';
  let icon = 'warning';
  
  if (response.data.error === 'account_in_use') {
    title = 'Account In Use ⚠️';
  } else if (response.data.error === 'account_deactivated') {
    title = 'Access Denied';
    icon = 'error';
  } else if (response.data.error === 'account_suspended') {
    title = 'Account Suspended';
    icon = 'warning';
  }
  
  showAlertError({
    icon: icon,
    title: title,
    text: response.data.message || 'Unable to login at this time.',
    button: 'OK'
  });
  setIsLoading(false);
  generateRandomNumbers();
  return;
}
```

---

## 📋 Step-by-Step Implementation

### Step 1: Locate login.php
```
C:\xampp\htdocs\capstone-api\api\login.php
```

### Step 2: Find the login function
Look for the function that handles user authentication. It's usually named:
- `login()`
- `userLogin()`
- `authenticate()`

### Step 3: Add the status check
Add the status validation code **AFTER** fetching user data but **BEFORE** returning it.

### Step 4: Test the changes
1. **Set a user status to "Deactive"** in the database or via User Management
2. **Try to log in** with that user
3. **You should see:** "This user no longer has access to the system..."
4. **Change status back to "Active"**
5. **Try to log in again** - should work normally

---

## 🔍 Database Check

Make sure the `status` column exists in your `users` table:

```sql
-- Check if status column exists
SHOW COLUMNS FROM users LIKE 'status';

-- If it doesn't exist, add it:
ALTER TABLE `users` 
ADD COLUMN `status` VARCHAR(20) NOT NULL DEFAULT 'Active' AFTER `active_status`;

-- Update existing users to have 'Active' status
UPDATE `users` SET `status` = 'Active' WHERE `status` IS NULL OR `status` = '';
```

---

## 🧪 Testing Checklist

- [ ] Backend `login.php` has status check
- [ ] Deactive user **cannot** log in (backend blocks)
- [ ] Suspended user **cannot** log in (backend blocks)
- [ ] Active user **can** log in normally
- [ ] Error messages are correct
- [ ] Frontend displays backend error messages
- [ ] Online status only updates for Active users

---

## 🎯 Expected Behavior After Fix

### **Login Flow:**
```
User enters credentials
       ↓
Backend checks username/password
       ↓
✅ Credentials valid
       ↓
Backend checks account status
       ↓
├─ Active? → ✅ Allow login, set Online
├─ Deactive? → ❌ Return error: account_deactivated
└─ Suspended? → ❌ Return error: account_suspended
       ↓
Frontend receives response
       ↓
├─ Error? → Show error message
└─ Success? → Redirect to dashboard
```

---

## 📝 Alternative: Using JSON Response

If you prefer to always return JSON (not arrays), you can modify the backend like this:

```php
function login($json) {
    $json = json_decode($json, true);
    
    // ... SQL query ...
    
    if (count($data) > 0) {
        $accountStatus = $data[0]['status'];
        
        // Check account status
        if ($accountStatus === 'Deactive' || $accountStatus === 'Suspended') {
            $errorMsg = $accountStatus === 'Deactive' 
                ? 'This user no longer has access to the system.' 
                : 'Your account has been temporarily suspended.';
            
            // Return empty array to trigger "Account not found" in frontend
            return [];
        }
        
        // Update to Online
        $updateSql = "UPDATE users SET active_status = 'Online' WHERE account_id = :id";
        $updateStmt = $this->pdo->prepare($updateSql);
        $updateStmt->bindParam(':id', $data[0]['account_id']);
        $updateStmt->execute();
    }
    
    return $data;
}
```

With this approach, the frontend's existing check will work:
```javascript
if (response.data && response.data.length > 0) {
    // Login successful
} else {
    // Show "Account not found" error
}
```

---

## ✅ Recommended Approach

**Use the first approach** (return error object) because:
1. More informative error messages
2. Can distinguish between wrong password vs deactivated account
3. Better user experience
4. Easier to debug

---

## 🚀 After Implementation

Once the backend is updated:
1. Deactivated users will be blocked at the **server level**
2. Frontend checks become a **backup/UX enhancement**
3. System is more secure (backend validation is primary)

---

**Need Help?**
If you're unsure where the login function is, search for:
- `WHERE (a.username = :username OR a.email = :username)`
- `AND a.user_password`
- `SELECT a.*, r.role_name, l.location_name FROM users`

These are unique to the login query!

