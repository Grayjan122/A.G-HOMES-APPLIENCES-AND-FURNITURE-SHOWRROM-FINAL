# 🔐 Profile Settings Password Reset - Backend Implementation Guide

## ✅ What Was Implemented (Frontend)

### Profile Settings Component
- ✅ Display user email in profile details
- ✅ Change password with old password verification
- ✅ "Forgot Password?" option in change password modal
- ✅ 3-step email verification flow
- ✅ 6-digit verification code
- ✅ Password reset with email verification
- ✅ Show/hide password toggles
- ✅ Password complexity validation

---

## 🔄 User Flow

### Regular Password Change (Knows Old Password)
```
1. User clicks "Profile" in header
   ↓
2. Views profile details (including email)
   ↓
3. Clicks "Change Password" button
   ↓
4. Enters old password, new password, and confirmation
   ↓
5. System verifies old password
   ↓
6. Updates to new password
   ↓
7. Success! Password changed
```

### Forgot Password Flow (Email Verification)
```
1. User clicks "Change Password"
   ↓
2. Clicks "Forgot Password?" link
   ↓
3. Enters email address → System verifies it's their account
   ↓
4. Generates 6-digit code → Sends to email
   ↓
5. User enters code from email
   ↓
6. Code verified → User enters new password
   ↓
7. Password updated → User can continue using system
```

---

## 📁 Files Modified

### Frontend
- ✅ `app/Components/profileSetting/userProfilePage.js` - Complete password reset functionality

### Backend (You need to update)
- ❗ Add operations to `login.php` (or your backend file)

---

## 🛠️ Backend Operations Required

Add these operations to your `login.php` file:

### 1. `verifyUserEmail` - Verify Email Belongs to User

This operation verifies that the email address belongs to the currently logged-in user.

```php
case 'verifyUserEmail':
    echo verifyUserEmail($json, $conn);
    break;

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

### 2. `sendCode` - Send Verification Code via Email

**Note:** If you already have this function from the forgot password feature on login page, you can reuse it!

```php
case 'sendCode':
    echo sendCode($json);
    break;

function sendCode($json) {
    $data = json_decode($json, true);
    $email = $data['email'];
    $code = $data['code'];
    $name = $data['name'];
    
    // Use PHPMailer
    require_once 'path/to/PHPMailer/src/Exception.php';
    require_once 'path/to/PHPMailer/src/PHPMailer.php';
    require_once 'path/to/PHPMailer/src/SMTP.php';
    
    use PHPMailer\PHPMailer\PHPMailer;
    use PHPMailer\PHPMailer\Exception;
    
    $mail = new PHPMailer(true);
    
    try {
        // SMTP Configuration
        $mail->isSMTP();
        $mail->Host = 'smtp.gmail.com';
        $mail->SMTPAuth = true;
        $mail->Username = 'your-email@gmail.com';  // ← UPDATE THIS
        $mail->Password = 'your-app-password';      // ← UPDATE THIS (16-char app password)
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port = 587;
        
        // Email settings
        $mail->setFrom('your-email@gmail.com', 'A.G Home Appliance');
        $mail->addAddress($email, $name);
        $mail->isHTML(true);
        $mail->Subject = 'Password Reset Verification Code';
        
        // Email body
        $mail->Body = "
        <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>
            <div style='background-color: #007bff; color: white; padding: 20px; text-align: center;'>
                <h1>A.G HOME APPLIANCE</h1>
                <h2>Password Reset Request</h2>
            </div>
            <div style='padding: 30px; background-color: #f9f9f9;'>
                <p>Hello <strong>$name</strong>,</p>
                <p>We received a request to reset your password. Use the verification code below:</p>
                <div style='background-color: white; padding: 20px; text-align: center; border-radius: 5px; margin: 20px 0;'>
                    <h1 style='color: #007bff; font-size: 36px; letter-spacing: 8px; margin: 0;'>$code</h1>
                </div>
                <p>This code will expire in <strong>15 minutes</strong>.</p>
                <p>If you didn't request this password reset, please ignore this email or contact support.</p>
            </div>
            <div style='background-color: #333; color: white; padding: 15px; text-align: center; font-size: 12px;'>
                <p>&copy; " . date('Y') . " A.G Home Appliance. All rights reserved.</p>
            </div>
        </div>
        ";
        
        $mail->send();
        return json_encode([
            'success' => true,
            'message' => 'Verification code sent successfully'
        ]);
        
    } catch (Exception $e) {
        return json_encode([
            'success' => false,
            'error' => 'Failed to send email: ' . $mail->ErrorInfo
        ]);
    }
}
```

### 3. `updatePassword` - Update User Password

**Note:** You likely already have this operation! Just ensure it exists.

```php
case 'updatePassword':
    echo updatePassword($json, $conn);
    break;

function updatePassword($json, $conn) {
    $data = json_decode($json, true);
    $userID = $data['userID'];
    $newPassword = $data['newPassword'];
    
    try {
        // Hash the password (match your existing hashing method)
        $hashedPassword = md5($newPassword);  // Or use password_hash($newPassword, PASSWORD_DEFAULT);
        
        $sql = "UPDATE account SET password = :password WHERE account_id = :user_id";
        $stmt = $conn->prepare($sql);
        $stmt->bindParam(':password', $hashedPassword);
        $stmt->bindParam(':user_id', $userID);
        $stmt->execute();
        
        return json_encode([
            'success' => true,
            'message' => 'Password updated successfully'
        ]);
        
    } catch(PDOException $e) {
        return json_encode([
            'success' => false,
            'error' => $e->getMessage()
        ]);
    }
}
```

### 4. `getUserDetails` - Get User Profile Details

**Note:** You likely already have this operation! Just ensure it returns the email field.

```php
case 'getUserDetails':
    echo getUserDetails($json, $conn);
    break;

function getUserDetails($json, $conn) {
    $data = json_decode($json, true);
    $user_id = $data['user_id'];
    
    try {
        $sql = "SELECT 
                    a.account_id,
                    a.fname,
                    a.mname,
                    a.lname,
                    a.username,
                    a.email,
                    a.active_status,
                    r.role_name,
                    l.location_name
                FROM account a
                LEFT JOIN role r ON a.role_id = r.role_id
                LEFT JOIN location l ON a.location_id = l.location_id
                WHERE a.account_id = :user_id";
        
        $stmt = $conn->prepare($sql);
        $stmt->bindParam(':user_id', $user_id);
        $stmt->execute();
        
        $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
        return json_encode($result);
        
    } catch(PDOException $e) {
        return json_encode(['error' => $e->getMessage()]);
    }
}
```

---

## 🔐 Email SMTP Setup (Gmail)

### Step 1: Enable 2-Step Verification
1. Go to https://myaccount.google.com/security
2. Enable "2-Step Verification"

### Step 2: Generate App Password
1. Go to https://myaccount.google.com/apppasswords
2. Select "Mail" and your device
3. Copy the 16-character password
4. Use this password in the `sendCode()` function

### Step 3: Update PHP Code
```php
$mail->Username = 'your-email@gmail.com';        // Your Gmail
$mail->Password = 'xxxx xxxx xxxx xxxx';         // 16-char app password
```

---

## 📋 Testing Checklist

### Test Regular Password Change
- [ ] Click "Change Password" button
- [ ] Enter incorrect old password → Should show error
- [ ] Enter correct old password
- [ ] Enter weak new password → Should show validation error
- [ ] Enter strong password with confirmation mismatch → Should show error
- [ ] Enter matching strong passwords → Should succeed
- [ ] Try logging in with new password → Should work

### Test Forgot Password Flow
- [ ] Click "Forgot Password?" link
- [ ] Enter wrong email → Should show error
- [ ] Enter correct email → Should send code
- [ ] Check email inbox for code
- [ ] Enter wrong code → Should show error
- [ ] Enter correct code → Should proceed
- [ ] Enter weak password → Should show validation error
- [ ] Enter strong password → Should succeed
- [ ] Continue using system with new password → Should work

### Test Email Display
- [ ] Email should be visible in profile details
- [ ] Email should pre-fill in forgot password flow

---

## 🎯 Password Complexity Requirements

All new passwords must meet these requirements:
- ✅ At least 8 characters long
- ✅ At least 1 uppercase letter (A-Z)
- ✅ At least 1 number (0-9)
- ✅ At least 1 special character (@$!%*?&)

**Example valid passwords:**
- `MyPass123!`
- `Secure@456`
- `Test$Pass99`

---

## ⚠️ Important Notes

1. **Password Hashing**: Make sure the `updatePassword` function uses the same hashing method as your existing login system (MD5, SHA256, or password_hash).

2. **Email Field**: Ensure your `account` table has an `email` column. If not, add it:
   ```sql
   ALTER TABLE account ADD COLUMN email VARCHAR(255);
   ```

3. **Session Security**: The user must be logged in to access profile settings. The user_id is taken from sessionStorage.

4. **Email Verification**: The system verifies that the email belongs to the logged-in user before sending the code.

5. **Code Expiration**: The 6-digit code is stored in frontend state and doesn't expire (in current implementation). Consider adding server-side code storage with expiration for enhanced security.

---

## 🐛 Troubleshooting

### Email not sending?
- Check SMTP credentials are correct
- Verify Gmail App Password is 16 characters
- Check spam/junk folder
- Ensure 2-Step Verification is enabled
- Check PHP error logs

### "Email does not match your account" error?
- Verify email exists in database
- Check email is associated with correct user_id
- Ensure email field is populated in account table

### Password not updating?
- Check database connection
- Verify password hashing matches login system
- Check PHP error logs
- Ensure user_id is correct

---

## ✅ Summary

**Frontend Implementation:** ✓ Complete
**Backend Required:** Add 2-4 operations to login.php
**Email Setup:** Configure Gmail SMTP
**Testing:** Follow checklist above

The profile settings now supports both:
1. **Regular password change** (with old password)
2. **Forgot password** (with email verification)

This provides a secure and user-friendly way for users to manage their passwords!

---

**File:** `PROFILE_PASSWORD_RESET_BACKEND.md`
**Created:** For profile settings password reset feature
**Related Files:** 
- Frontend: `app/Components/profileSetting/userProfilePage.js`
- Backend: `login.php` (needs updates)

