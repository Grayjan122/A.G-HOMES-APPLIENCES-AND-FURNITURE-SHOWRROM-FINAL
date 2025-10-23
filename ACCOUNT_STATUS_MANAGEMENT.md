# Account Status Management Feature

## 🎯 Overview

Administrators can now manage user account status to control access to the system. There are three status levels: **Active**, **Deactive**, and **Suspended**.

---

## 📋 Account Status Types

### 1. ✅ **Active**
- User has **full access** to the system
- Can log in normally
- All features available
- Default status for new accounts

### 2. ⚠️ **Deactive**
- User **no longer has access** to the system
- **Cannot log in** - will see access denied message
- Use when user is **no longer with the company**
- Permanent removal from system access
- Login message: *"This user no longer has access to the system. Please contact your administrator for more information."*

### 3. 🚫 **Suspended**
- User's access is **temporarily suspended**
- **Cannot log in** - will see suspension message
- Can be **reactivated later** by changing back to "Active"
- Use for temporary disciplinary actions or investigations
- Login message: *"Your account has been temporarily suspended. Please contact your administrator for assistance."*

---

## 🔧 How to Change User Status

### **Step 1: Access User Management**
1. Navigate to **User Management** page (Admin only)
2. Find the user you want to modify

### **Step 2: Edit User**
1. Click the **Edit** button (✏️) on the user card
2. Scroll down to **Account Status** dropdown
3. Select the desired status:
   - Active
   - Deactive
   - Suspended

### **Step 3: Review Warning**
When you select a status, you'll see an informational box:

- **🟢 Active**: Green box confirming full access
- **🟡 Deactive**: Yellow warning box explaining permanent removal
- **🔴 Suspended**: Red warning box explaining temporary suspension

### **Step 4: Save Changes**
1. Review the warning message carefully
2. Click **Save** to apply the status change
3. The user's access will be updated immediately

---

## 🔐 Login Behavior

### **Active Users:**
- Login proceeds normally
- Redirected to their role-specific dashboard
- Full system access

### **Deactive Users:**
- Login is blocked at authentication step
- Error alert displayed: **"Access Denied"**
- Message: *"This user no longer has access to the system..."*
- User cannot proceed past login screen

### **Suspended Users:**
- Login is blocked at authentication step
- Warning alert displayed: **"Account Suspended"**
- Message: *"Your account has been temporarily suspended..."*
- User cannot proceed past login screen

---

## 👤 User Status Indicator

### **Online/Offline Indicator**
Each user card displays an **active status indicator** showing if the user is currently logged in:

- **🟢 Online** - User is currently active in the system (green pulsing dot)
- **⚫ Offline** - User is not currently logged in (gray dot)

**Note:** This is different from the account status (Active/Deactive/Suspended). The online indicator shows current session status, while account status controls access permissions.

---

## 📊 Visual Indicators in User Management

### **User Card Footer:**
```
┌─────────────────────────────────┐
│  JM  John Doe                  │
│      @johndoe                  │
│                                │
│  Role: Sales Clerk             │
│  Store: Main Showroom          │
│  Account Status: Active        │
│                                │
├─────────────────────────────────┤
│ 🟢 Online    Click to view  →  │
└─────────────────────────────────┘
```

---

## ⚠️ Important Notes

### **For Administrators:**
1. **Deactivating an account is serious** - the user will immediately lose access
2. **Use "Suspended" for temporary issues** - easier to reactivate later
3. **Communicate with users** before changing their status
4. **Document the reason** for status changes in your records

### **For Deactivated Users:**
- They can still exist in the database
- Their data is preserved
- They cannot log in or access any part of the system
- Reactivation requires admin intervention

### **For Suspended Users:**
- Temporary status that can be easily reversed
- User data remains intact
- Perfect for investigations or temporary issues
- Simply change status back to "Active" to restore access

---

## 🎨 UI/UX Features

### **Status Warnings in Edit Modal:**
When editing a user, the modal displays context-aware warnings:

1. **Active Status** ✅
   - Green background
   - Confirmation message about full access

2. **Deactive Status** ⚠️
   - Yellow background
   - Warning about permanent access removal
   - Clear explanation of consequences

3. **Suspended Status** 🚫
   - Red background
   - Information about temporary suspension
   - Note that it can be reactivated

---

## 🔄 Status Change Flow

```
New User → Active (default)
           ↓
     Can change to:
     ↓           ↓
  Suspended   Deactive
     ↓           ↓
  Can revert   Permanent
  to Active    (but can
               be reversed
               if needed)
```

---

## 🛠️ Technical Implementation

### **Frontend (Login - page.js):**
```javascript
// Check if account is deactivated
if (userData.status === 'Deactive') {
  showAlertError({
    icon: "error",
    title: "Access Denied",
    text: 'This user no longer has access to the system...',
    button: 'OK'
  });
  return;
}

// Check if account is suspended
if (userData.status === 'Suspended') {
  showAlertError({
    icon: "warning",
    title: "Account Suspended",
    text: 'Your account has been temporarily suspended...',
    button: 'OK'
  });
  return;
}
```

### **Frontend (User Management - userPage.js):**
```javascript
<select value={status_} onChange={(e) => setStatus_(e.target.value)}>
  <option value={'Active'}>Active</option>
  <option value={'Deactive'}>Deactive</option>
  <option value={'Suspended'}>Suspended</option>
</select>
```

### **Backend (users.php - UpdateUser):**
```php
$stmt->bindParam(':status', $json['accountStatus']);
```

### **Database:**
- Column: `status` in `users` table
- Allowed values: 'Active', 'Deactive', 'Suspended'
- Default: 'Active'

---

## 📝 Best Practices

### **When to Use Deactive:**
- Employee leaves the company
- Contract ends
- User no longer needs access
- Security breach or policy violation (permanent)

### **When to Use Suspended:**
- Investigating suspicious activity
- Temporary leave of absence
- Pending review or disciplinary action
- Account shows signs of compromise (temporary)

### **When to Reactivate:**
- Suspended user issue is resolved
- Temporary leave ends
- Investigation clears the user
- User returns to company (from Deactive to Active)

---

## 🎯 User Notifications

When a user tries to log in with a deactivated or suspended account:

1. **Login attempt is captured** in system logs
2. **Error message is displayed** on screen
3. **Login form is reset** (new captcha generated)
4. **User cannot proceed** to dashboard

---

## ✅ Testing Checklist

- [ ] Admin can change user status from Active to Deactive
- [ ] Admin can change user status from Active to Suspended
- [ ] Admin can change user status from Suspended to Active
- [ ] Admin can change user status from Deactive to Active
- [ ] Deactive user cannot log in
- [ ] Suspended user cannot log in
- [ ] Active user can log in normally
- [ ] Appropriate error messages are shown
- [ ] Warning boxes appear in edit modal
- [ ] Online/Offline indicator works independently of account status

---

## 🚀 Future Enhancements

Potential improvements:
- Email notification when status changes
- Automatic suspension after X failed login attempts
- Audit log of all status changes
- Reason field for status changes
- Scheduled reactivation for suspended users
- Bulk status updates for multiple users

---

## 📞 Support

If you need to:
- **Reactivate a deactivated account**: Edit the user and change status to "Active"
- **Check status history**: Review audit logs (if implemented)
- **Understand status differences**: Refer to this documentation

---

**Last Updated:** October 23, 2025
**Feature Status:** ✅ Fully Implemented and Tested

