# ✅ Customer Validation Rules

## Overview
The customer management system now includes comprehensive validation for phone numbers, email addresses, and uniqueness checks when adding or editing customer information.

---

## 📋 Validation Rules

### 1. **Philippine Phone Number Validation** 📱

**Requirement:** All phone numbers must be valid Philippine phone numbers.

**Accepted Formats:**
- **Mobile Numbers:**
  - `09XX-XXX-XXXX` (11 digits starting with 09)
  - `0912-345-6789`
  - `09123456789`
  - `+639XX-XXX-XXXX` (with country code)
  - `+639123456789`

- **Landline Numbers:**
  - `(02) XXXX-XXXX` (Metro Manila)
  - `(0XX) XXX-XXXX` (Provincial)
  - `02-1234-5678`
  - `032-123-4567` (Cebu)

**Validation Logic:**
- Removes spaces, dashes, and parentheses before validation
- Checks against Philippine mobile pattern: `^(09|\+639)\d{9}$`
- Checks against landline pattern: `^0\d{1,2}\d{7,8}$`

**Error Message:**
> ❌ **Invalid Phone Number!**  
> Please enter a valid Philippine phone number (e.g., 09XX-XXX-XXXX or +639XX-XXX-XXXX)

---

### 2. **Email Format Validation** ✉️

**Requirement:** Email must be in a valid email format.

**Accepted Format:**
- `example@domain.com`
- `user.name@company.co.ph`
- `contact@business.net`

**Validation Logic:**
- Uses regex pattern: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- Ensures email contains `@` and `.` in correct positions
- No spaces allowed

**Error Message:**
> ❌ **Invalid Email!**  
> Please enter a valid email address (e.g., example@email.com)

---

### 3. **Email Uniqueness Validation** 🔒

**Requirement:** Email must be unique - no two customers can have the same email address.

**Validation Logic:**
- When **adding** a customer: Checks if email exists in any customer record
- When **editing** a customer: Checks if email exists in any OTHER customer record (excludes current customer)
- Case-insensitive comparison (`email@example.com` = `EMAIL@EXAMPLE.COM`)

**Error Message:**
> ❌ **Email Already Exists!**  
> This email is already registered to another customer. Please use a different email address.

---

## 🎯 Where Validations Apply

### Add Customer Modal
- ✅ All fields required (name, phone, email, address)
- ✅ Phone number must be PH format
- ✅ Email must be valid format
- ✅ Email must be unique

### Edit Customer Modal
- ✅ All fields required (name, phone, email, address)
- ✅ Phone number must be PH format
- ✅ Email must be valid format
- ✅ Email must be unique (excluding current customer's email)

---

## 🔍 Validation Functions

### `isValidPhilippinePhone(phone)`
```javascript
// Validates Philippine phone number format
// Accepts: 09XX-XXX-XXXX, +639XX-XXX-XXXX, landlines
// Returns: boolean
```

### `isValidEmail(email)`
```javascript
// Validates email format
// Returns: boolean
```

### `isEmailUnique(email, excludeCustomerId = null)`
```javascript
// Checks if email is unique among all customers
// excludeCustomerId: Optional - used when editing to exclude current customer
// Returns: boolean
```

---

## 🎨 UI Enhancements

### Visual Helpers
- **Placeholder text** guides users on correct format
- **Helper text** below inputs explains requirements
- **Icons** (📱 for phone, ✉️ for email) improve visual clarity
- **Required field indicator** (*) shows mandatory fields

### Example:
```
Phone Number *
[Input: e.g., 0912-345-6789 or +63912-345-6789]
📱 Philippine phone number format required
```

---

## 🧪 Testing Checklist

### Valid Test Cases
- ✅ Mobile: `09123456789`
- ✅ Mobile with dashes: `0912-345-6789`
- ✅ Mobile with +63: `+639123456789`
- ✅ Landline Manila: `02-1234-5678`
- ✅ Landline Provincial: `032-123-4567`
- ✅ Email: `customer@example.com`
- ✅ Unique email for new customer

### Invalid Test Cases (Should Show Error)
- ❌ Invalid mobile: `08123456789` (doesn't start with 09)
- ❌ Too short: `091234567`
- ❌ Foreign number: `+1234567890`
- ❌ Invalid email: `notanemail`
- ❌ Invalid email: `missing@domain`
- ❌ Duplicate email when adding new customer
- ❌ Duplicate email when editing (if email belongs to another customer)

### Edit Customer Special Cases
- ✅ Can save without changing email (keeps same email)
- ✅ Can change to a new unique email
- ❌ Cannot change to another customer's email

---

## 📊 Validation Flow

### Adding Customer
```
1. User fills form
2. Click "Save"
3. Check all required fields filled → Error if not
4. Validate phone format → Error if invalid
5. Validate email format → Error if invalid
6. Check email uniqueness → Error if exists
7. All valid → Save to database → Success!
```

### Editing Customer
```
1. User modifies form
2. Click "Save"
3. Check all required fields filled → Error if not
4. Validate phone format → Error if invalid
5. Validate email format → Error if invalid
6. Check email uniqueness (exclude current) → Error if exists
7. All valid → Update database → Success!
```

---

## 🚨 Error Messages

All errors use `showAlertError` with:
- **Icon:** "error" or "warning"
- **Title:** Descriptive error title
- **Text:** Helpful message explaining the issue
- **Button:** "Try Again"

---

## 💡 Best Practices

1. **Clear Error Messages:** Tell users exactly what went wrong
2. **Visual Guidance:** Placeholders and helper text guide correct input
3. **Real-time Prevention:** Input type attributes help prevent wrong data
4. **User-Friendly:** Accept common formats (with/without dashes, spaces)
5. **Case-Insensitive:** Email uniqueness check ignores case differences

---

## 🔄 Future Enhancements (Optional)

Consider adding:
- Real-time validation as user types
- Green checkmark for valid input
- Red border for invalid input
- Format auto-correction (e.g., auto-add +63)
- Phone number masking/formatting
- Backend validation (duplicate check on server)
- Phone number verification via SMS

---

## 📞 Support

If you encounter validation issues:
1. Check phone number matches PH format
2. Verify email has `@` and domain extension
3. Confirm email is not already used by another customer
4. Check browser console for detailed error logs

