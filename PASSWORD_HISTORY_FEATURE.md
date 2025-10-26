# 🔐 Password History Feature - Prevent Password Reuse

## Overview
This feature prevents users from reusing any of their last **5 passwords** when changing their password, enhancing account security.

---

## 🎯 Security Benefits

✅ **Prevents password cycling** - Users can't just alternate between 2-3 passwords  
✅ **Enforces password diversity** - Forces users to create genuinely new passwords  
✅ **Meets compliance standards** - Aligns with security best practices (PCI-DSS, NIST)  
✅ **Protects against credential stuffing** - Reduces risk of reused passwords from breaches  

---

## 🗄️ Database Setup

### Step 1: Create Password History Table

Run this SQL in phpMyAdmin:

```sql
CREATE TABLE IF NOT EXISTS `password_history` (
  `history_id` INT(11) NOT NULL AUTO_INCREMENT,
  `account_id` INT(11) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`history_id`),
  KEY `account_id` (`account_id`),
  KEY `idx_account_created` (`account_id`, `created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

ALTER TABLE `password_history`
  ADD CONSTRAINT `fk_password_history_account`
  FOREIGN KEY (`account_id`) REFERENCES `account` (`account_id`) ON DELETE CASCADE;
```

**Or** run the file: `password_history_table.sql`

### Table Structure

| Column | Type | Description |
|--------|------|-------------|
| `history_id` | INT(11) | Primary key, auto-increment |
| `account_id` | INT(11) | Foreign key to account table |
| `password_hash` | VARCHAR(255) | MD5 hash of the password |
| `created_at` | DATETIME | When password was changed |

---

## 🔄 How It Works

### Password Change Flow

```
1. User enters new password
      ↓
2. System hashes new password (MD5)
      ↓
3. Check #1: Is it same as current password?
      ↓ NO
4. Check #2: Query last 5 passwords from history
      ↓
5. Check #3: Does new password match any of them?
      ↓ NO
6. Save current password to history table
      ↓
7. Update account with new password
      ↓
8. Clean up - keep only last 5 in history
      ↓
9. ✅ Password updated successfully!
```

### If Password Reuse Detected

```
User tries to reuse password
      ↓
System detects match
      ↓
⚠️ Warning Alert Displayed:
   "Password Reuse Detected!"
   "You cannot reuse any of your last 5 passwords.
    Please choose a different password."
      ↓
User must choose a different password
```

---

## 💻 Backend Implementation

### Location
`C:\xampp\htdocs\capstone-api\api\users.php`

### Function: `updatePassword($json)`

**Key Checks:**

1. **Current Password Check**
```php
if ($currentPassword['user_password'] === $hashedPassword) {
    return json_encode([
        'success' => false, 
        'error' => 'password_reuse',
        'message' => 'New password cannot be the same as your current password'
    ]);
}
```

2. **History Check (Last 5)**
```php
$historySql = "SELECT password_hash FROM password_history 
              WHERE account_id = :user_id 
              ORDER BY created_at DESC 
              LIMIT 5";

foreach ($passwordHistory as $oldPassword) {
    if ($oldPassword['password_hash'] === $hashedPassword) {
        return json_encode([
            'success' => false, 
            'error' => 'password_reuse',
            'message' => 'You cannot reuse any of your last 5 passwords...'
        ]);
    }
}
```

3. **Save to History**
```php
// Save current password before updating
$insertHistorySql = "INSERT INTO password_history 
                    (account_id, password_hash, created_at) 
                    VALUES (:user_id, :password_hash, NOW())";
```

4. **Cleanup Old History**
```php
// Keep only last 5 passwords
$cleanupSql = "DELETE FROM password_history 
              WHERE account_id = :user_id 
              AND history_id NOT IN (
                  SELECT history_id FROM (
                      SELECT history_id FROM password_history 
                      WHERE account_id = :user_id 
                      ORDER BY created_at DESC 
                      LIMIT 5
                  ) AS keep_these
              )";
```

---

## 🎨 Frontend Implementation

### Location
`app/Components/profileSetting/userProfilePage.js`

### Updated Functions

**1. Change Password (with old password verification)**
```javascript
const updateResponse = await axios.post(url, updateParams);

// Check if password was reused
if (updateResponse.data.error === 'password_reuse') {
    showAlertError({
        icon: "warning",
        title: "Password Reuse Detected!",
        text: updateResponse.data.message,
        button: 'Choose Different Password'
    });
    return;
}
```

**2. Reset Password (forgot password flow)**
```javascript
const updateResponse = await axios.post(url, updateParams);

if (updateResponse.data.error === 'password_reuse') {
    setPasswordError(updateResponse.data.message);
    showAlertError({
        icon: "warning",
        title: "Password Reuse Detected!",
        text: updateResponse.data.message,
        button: 'Choose Different Password'
    });
    return;
}
```

---

## 🧪 Testing Scenarios

### Test Case 1: Reuse Current Password
```
Step 1: Log in
Step 2: Go to Profile Settings
Step 3: Click "Change Password"
Step 4: Enter current password as new password
Result: ⚠️ "New password cannot be the same as your current password"
```

### Test Case 2: Reuse Recent Password
```
Step 1: Change password to "Password123!"
Step 2: Change password to "Password456!"
Step 3: Change password to "Password789!"
Step 4: Try to change back to "Password123!"
Result: ⚠️ "You cannot reuse any of your last 5 passwords"
```

### Test Case 3: Use Unique Password (Success)
```
Step 1: Change password to "NewSecure123!"
Step 2: Change to "Another456!"
Step 3: Change to "Different789!"
Step 4: Change to "Fresh2025!"
Step 5: Change to "Unique2025!"
Step 6: Change to "BrandNew123!"
Result: ✅ "Password successfully updated!"
         (First password "NewSecure123!" can now be reused)
```

### Test Case 4: Forgot Password Flow
```
Step 1: Use "Forgot Password" feature
Step 2: Verify email with code
Step 3: Try to enter one of last 5 passwords
Result: ⚠️ "Password Reuse Detected!"
```

---

## 📊 Password History Lifecycle

### Example Timeline

| Date | Action | Password Hash | In History |
|------|--------|---------------|------------|
| Jan 1 | Set initial password | `hash_A` | - |
| Feb 1 | Change to password B | `hash_B` | `hash_A` |
| Mar 1 | Change to password C | `hash_C` | `hash_A, hash_B` |
| Apr 1 | Change to password D | `hash_D` | `hash_A, hash_B, hash_C` |
| May 1 | Change to password E | `hash_E` | `hash_A, hash_B, hash_C, hash_D` |
| Jun 1 | Change to password F | `hash_F` | `hash_A, hash_B, hash_C, hash_D, hash_E` |
| Jul 1 | Change to password G | `hash_G` | `hash_B, hash_C, hash_D, hash_E, hash_F` (A deleted) |
| Jul 1 | ✅ Can reuse password A | `hash_A` | Allowed! (not in last 5) |
| Jul 1 | ❌ Cannot reuse password F | - | Blocked! (still in history) |

---

## ⚙️ Configuration

### To Change Number of Historical Passwords

**Backend:** `users.php`
```php
// Change "LIMIT 5" in both queries:
$historySql = "SELECT password_hash FROM password_history 
              WHERE account_id = :user_id 
              ORDER BY created_at DESC 
              LIMIT 5";  // ← Change this number

$cleanupSql = "... LIMIT 5 ...";  // ← And this one
```

**Recommended Values:**
- **3 passwords** - Minimum security
- **5 passwords** - Standard (current setting)
- **10 passwords** - High security
- **24 passwords** - Maximum security (requires 2 years to cycle)

---

## 🔍 Database Queries for Admins

### View User's Password History
```sql
SELECT 
    ph.history_id,
    a.username,
    ph.created_at,
    COUNT(*) OVER (PARTITION BY ph.account_id) as total_history
FROM password_history ph
INNER JOIN account a ON ph.account_id = a.account_id
WHERE a.account_id = 26  -- Replace with user ID
ORDER BY ph.created_at DESC;
```

### View All Users with Password History
```sql
SELECT 
    a.account_id,
    a.username,
    COUNT(ph.history_id) as password_changes
FROM account a
LEFT JOIN password_history ph ON a.account_id = ph.account_id
GROUP BY a.account_id, a.username
ORDER BY password_changes DESC;
```

### Clean Up History for All Users (Keep Only Last 5)
```sql
DELETE FROM password_history
WHERE history_id NOT IN (
    SELECT history_id FROM (
        SELECT history_id,
               ROW_NUMBER() OVER (PARTITION BY account_id ORDER BY created_at DESC) as rn
        FROM password_history
    ) sub
    WHERE rn <= 5
);
```

---

## 🛡️ Security Considerations

### ✅ What This Feature DOES

- Prevents password reuse (last 5)
- Stores password hashes (not plaintext)
- Auto-cleans old history
- Works for both change password & forgot password flows
- Cascades delete (if user deleted, history deleted)

### ❌ What This Feature DOES NOT

- Does not prevent weak passwords (use password strength check)
- Does not prevent password sharing between users
- Does not detect dictionary words or common passwords
- Does not enforce password expiration

### 🔐 Additional Recommendations

1. **Password Strength** - Already implemented with:
   - Minimum 8 characters
   - 1 uppercase letter
   - 1 number
   - 1 special character

2. **Password Expiration** - Consider adding:
   - Force password change every 90 days
   - Warning 7 days before expiration

3. **Account Lockout** - Consider adding:
   - Lock after 5 failed login attempts
   - Temporary lockout for 15 minutes

---

## 📝 Error Messages

### User-Friendly Messages

| Scenario | Icon | Title | Message |
|----------|------|-------|---------|
| Same as current | ⚠️ | Password Reuse Detected! | New password cannot be the same as your current password |
| In last 5 | ⚠️ | Password Reuse Detected! | You cannot reuse any of your last 5 passwords. Please choose a different password. |
| Success | ✅ | Success! | Password successfully updated! |

---

## 🚀 Deployment Checklist

- [ ] Run `password_history_table.sql` in production database
- [ ] Backup database before deployment
- [ ] Test password change with existing users
- [ ] Test forgot password flow
- [ ] Verify history cleanup works correctly
- [ ] Check error logs for any issues
- [ ] Inform users about new security feature

---

## 📅 Implementation Date

**Date:** October 24, 2025  
**Status:** ✅ Complete and Ready for Testing  
**Files Modified:**
- `C:\xampp\htdocs\capstone-api\api\users.php`
- `app/Components/profileSetting/userProfilePage.js`
- `password_history_table.sql` (NEW)

---

**✨ Password History Feature Complete! ✨**

Users can no longer reuse their last 5 passwords, significantly improving account security!

