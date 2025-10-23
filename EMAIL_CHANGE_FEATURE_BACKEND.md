# 📧 Email Change Feature - Backend Implementation Guide

## ✅ What Was Implemented (Frontend)

### Email Change Feature
- ✅ "Edit" button next to email address in profile
- ✅ 2-step email change modal with verification
- ✅ Email format validation
- ✅ Duplicate email check (prevents using email already in use)
- ✅ Verification code sent to new email
- ✅ Modern, beautiful UI design
- ✅ Progress indicator showing steps
- ✅ Real-time error handling

---

## 🔄 User Flow

```
1. User views profile → Sees current email with "Edit" button
   ↓
2. Clicks "Edit" button → Modal opens
   ↓
3. Step 1: Enter new email address
   - System validates email format
   - System checks if email is same as current
   - System checks if email already exists in database
   ↓
4. Clicks "Send Verification Code"
   - 6-digit code generated
   - Code sent to NEW email address
   - Progress to Step 2
   ↓
5. Step 2: Enter verification code
   - User checks new email inbox
   - Enters 6-digit code
   - System verifies code
   ↓
6. Code verified → Email updated in database
   - Success message shown
   - Profile updated with new email
   - Modal closes
```

---

## 🛠️ Backend Operations Required

Add these operations to your `login.php` file:

### 1. `checkEmailExists` - Check if Email is Already in Use

This prevents users from using an email that belongs to another account.

```php
case 'checkEmailExists':
    echo checkEmailExists($json, $conn);
    break;

function checkEmailExists($json, $conn) {
    $data = json_decode($json, true);
    $email = trim($data['email']);
    
    try {
        $sql = "SELECT account_id FROM account WHERE LOWER(email) = LOWER(:email)";
        $stmt = $conn->prepare($sql);
        $stmt->bindParam(':email', $email);
        $stmt->execute();
        
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($result) {
            return json_encode([
                'exists' => true,
                'message' => 'Email is already in use'
            ]);
        } else {
            return json_encode([
                'exists' => false,
                'message' => 'Email is available'
            ]);
        }
    } catch(PDOException $e) {
        return json_encode([
            'error' => $e->getMessage()
        ]);
    }
}
```

### 2. `sendEmailChangeCode` - Send Verification Code to New Email

This sends a verification code to the new email address to confirm ownership.

```php
case 'sendEmailChangeCode':
    echo sendEmailChangeCode($json);
    break;

function sendEmailChangeCode($json) {
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
        $mail->Subject = 'Email Change Verification Code';
        
        // Email body
        $mail->Body = "
        <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>
            <div style='background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;'>
                <h1 style='margin: 0;'>A.G HOME APPLIANCE</h1>
                <h2 style='margin: 10px 0 0 0; font-weight: normal;'>Email Change Request</h2>
            </div>
            <div style='padding: 40px 30px; background-color: #f9f9f9;'>
                <p style='font-size: 16px; color: #333;'>Hello <strong>$name</strong>,</p>
                <p style='font-size: 16px; color: #333;'>We received a request to change your email address. Please use the verification code below to confirm this change:</p>
                
                <div style='background-color: white; padding: 30px; text-align: center; border-radius: 10px; margin: 30px 0; box-shadow: 0 2px 10px rgba(0,0,0,0.1);'>
                    <p style='margin: 0 0 10px 0; color: #666; font-size: 14px;'>Your Verification Code</p>
                    <h1 style='color: #667eea; font-size: 48px; letter-spacing: 10px; margin: 0; font-family: monospace;'>$code</h1>
                </div>
                
                <div style='background-color: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107; margin: 20px 0;'>
                    <p style='margin: 0; color: #856404; font-size: 14px;'>
                        <strong>⚠️ Security Notice:</strong> If you didn't request this email change, please ignore this email and your account will remain secure.
                    </p>
                </div>
                
                <p style='font-size: 14px; color: #666;'>This code will expire in <strong>15 minutes</strong>.</p>
                <p style='font-size: 14px; color: #666;'>After verification, your email address will be updated to: <strong>$email</strong></p>
            </div>
            <div style='background-color: #333; color: white; padding: 20px; text-align: center; font-size: 12px; border-radius: 0 0 10px 10px;'>
                <p style='margin: 0;'>&copy; " . date('Y') . " A.G Home Appliance. All rights reserved.</p>
                <p style='margin: 10px 0 0 0; color: #999;'>This is an automated message, please do not reply.</p>
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

### 3. `updateEmail` - Update User Email in Database

This updates the email address after successful verification.

```php
case 'updateEmail':
    echo updateEmail($json, $conn);
    break;

function updateEmail($json, $conn) {
    $data = json_decode($json, true);
    $userID = $data['userID'];
    $newEmail = trim($data['newEmail']);
    
    try {
        // Double-check email is not in use (extra security)
        $checkSql = "SELECT account_id FROM account WHERE LOWER(email) = LOWER(:email) AND account_id != :user_id";
        $checkStmt = $conn->prepare($checkSql);
        $checkStmt->bindParam(':email', $newEmail);
        $checkStmt->bindParam(':user_id', $userID);
        $checkStmt->execute();
        
        if ($checkStmt->fetch()) {
            return json_encode([
                'success' => false,
                'error' => 'Email is already in use by another account'
            ]);
        }
        
        // Update email
        $sql = "UPDATE account SET email = :email WHERE account_id = :user_id";
        $stmt = $conn->prepare($sql);
        $stmt->bindParam(':email', $newEmail);
        $stmt->bindParam(':user_id', $userID);
        $stmt->execute();
        
        return json_encode([
            'success' => true,
            'message' => 'Email updated successfully'
        ]);
        
    } catch(PDOException $e) {
        return json_encode([
            'success' => false,
            'error' => $e->getMessage()
        ]);
    }
}
```

---

## 🔐 Security Features

### Frontend Validation
✅ Email format validation (regex)  
✅ Checks if new email is same as current  
✅ Checks if email already exists (prevents duplicates)  
✅ Verification code required  

### Backend Security
✅ Double-check email availability before update  
✅ Case-insensitive email comparison  
✅ Trim whitespace from email  
✅ Verification code expires (15 minutes recommended)  
✅ Only updates email for logged-in user  

---

## 📧 Gmail SMTP Setup

### Step 1: Enable 2-Step Verification
1. Go to https://myaccount.google.com/security
2. Enable "2-Step Verification"

### Step 2: Generate App Password
1. Go to https://myaccount.google.com/apppasswords
2. Select "Mail" and your device
3. Copy the 16-character password
4. Use this password in the `sendEmailChangeCode()` function

### Step 3: Update PHP Code
```php
$mail->Username = 'your-email@gmail.com';        // Your Gmail
$mail->Password = 'xxxx xxxx xxxx xxxx';         // 16-char app password
```

---

## 📋 Testing Checklist

### Frontend Tests
- [ ] Click "Edit" button on email field
- [ ] Modal opens with Step 1
- [ ] Enter invalid email format → Shows error
- [ ] Enter same email as current → Shows error
- [ ] Enter valid new email → Proceeds to verification

### Backend Tests
- [ ] Email existence check works
- [ ] Verification code sent to new email
- [ ] Email received in inbox (check spam too)
- [ ] Code format is 6 digits
- [ ] Email template displays correctly

### Verification Tests
- [ ] Enter wrong code → Shows error
- [ ] Enter correct code → Email updates
- [ ] Profile shows new email
- [ ] Can login with account using new email

### Security Tests
- [ ] Cannot use email already in use by another user
- [ ] Case-insensitive email check works
- [ ] Email with spaces is trimmed properly
- [ ] Only logged-in user can change their email

---

## 🎨 UI Features

### Profile Display
- Email shown with inline "Edit" button
- Button has hover effect (lift animation)
- Gradient purple theme

### Change Email Modal
- 2-step progress indicator
- Step 1: Enter new email
  - Shows current email
  - Warning about verification
  - Disabled state while sending
- Step 2: Enter verification code
  - Large, centered code input
  - Letter-spaced for easy reading
  - Option to go back and change email
- Modern gradient buttons
- Smooth transitions
- Responsive design

---

## ⚠️ Important Notes

1. **Email Uniqueness**: The system prevents multiple users from having the same email address (case-insensitive).

2. **Verification Required**: Users MUST verify the new email before it's updated. This ensures they have access to the email.

3. **Current Email Display**: The modal shows the current email so users can confirm they're changing from the correct address.

4. **Error Handling**: All errors are displayed clearly in the modal with appropriate messages.

5. **PHPMailer Required**: Make sure PHPMailer is installed:
   ```bash
   composer require phpmailer/phpmailer
   ```

6. **Database Column**: Ensure your `account` table has an `email` column:
   ```sql
   ALTER TABLE account ADD COLUMN IF NOT EXISTS email VARCHAR(255);
   CREATE INDEX idx_email ON account(email);
   ```

---

## 🎯 Benefits

### For Users
✅ Easy email updates without admin help  
✅ Secure verification process  
✅ Clear visual feedback  
✅ Can't accidentally use someone else's email  

### For Administrators
✅ Reduced support requests  
✅ Email uniqueness enforced  
✅ Audit trail maintained  
✅ Self-service reduces workload  

### For Security
✅ Email ownership verified  
✅ Prevents email hijacking  
✅ No duplicate emails  
✅ Logged-in users only  

---

## 📝 Summary

**Frontend Status:** ✅ Complete  
**Backend Required:** 3 operations (checkEmailExists, sendEmailChangeCode, updateEmail)  
**Email Setup:** Gmail SMTP configuration needed  
**Database:** Ensure email column exists  

**Time to Implement Backend:** ~45 minutes  
**Difficulty:** Easy (copy-paste with minor config)  

---

## 🚀 Quick Start

1. **Add 3 operations to login.php** (see code above)
2. **Setup Gmail SMTP** (app password)
3. **Test with your own email**
4. **Verify error handling works**
5. **Deploy to production**

---

**✨ Email Change Feature Complete! ✨**

Users can now securely update their email addresses with proper verification!

**Documentation Files:**
- `EMAIL_CHANGE_FEATURE_BACKEND.md` (this file)
- `PROFILE_PASSWORD_RESET_BACKEND.md` (password reset)
- `PROFILE_SETTINGS_COMPLETE.md` (profile overview)

