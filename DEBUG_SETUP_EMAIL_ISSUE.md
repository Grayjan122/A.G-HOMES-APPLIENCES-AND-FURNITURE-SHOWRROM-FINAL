# 🔍 Setup Email Not Sent to Correct User - Debugging Guide

## Problem Description
**User Report:**
> "when i add a new user, the set up email is not sent to the created user email but instead to the sender"

The setup email is being sent to `janmaristela2003@gmail.com` (the sender) instead of the new user's email address.

---

## Quick Diagnosis Steps

### Step 1: Test Email Sending
I've created a test script to verify the email is being sent to the correct address.

**Test URL:**
```
http://localhost/capstone-api/api/test-setup-email.php?email=YOUR_TEST_EMAIL@gmail.com&name=TestUser
```

**Example:**
```
http://localhost/capstone-api/api/test-setup-email.php?email=john.doe@gmail.com&name=John
```

This will:
1. Send a test email to the specified address
2. Show detailed SMTP debug output
3. Confirm the recipient address
4. Help identify if it's a code issue or Gmail configuration issue

---

### Step 2: Check Error Logs

**Location:** `C:\xampp\apache\logs\error.log`

Look for these log entries when adding a user:
```
=== sendSetupEmail START ===
Email: [THE_NEW_USER_EMAIL]
First Name: [THE_NAME]
FROM: janmaristela2003@gmail.com
TO: [THE_NEW_USER_EMAIL] (Name: [THE_NAME])
Email addresses set - Recipient: [THE_NEW_USER_EMAIL]
✓ SUCCESS: Email sent successfully!
Recipient confirmed: [THE_NEW_USER_EMAIL]
```

**What to check:**
- Does the "TO:" line show the correct email?
- Does "Recipient confirmed:" show the correct email?
- If these are correct but you still receive at janmaristela2003@gmail.com, it's a Gmail issue

---

## Possible Causes & Solutions

### Cause 1: Gmail Account Settings (Most Likely)

Gmail might have a setting that redirects emails. Check:

#### A. Gmail Forwarding Settings
1. Go to Gmail (logged in as janmaristela2003@gmail.com)
2. Click Settings ⚙️ → See all settings
3. Click "Forwarding and POP/IMAP"
4. Check if there's any forwarding rule that sends emails back to yourself

#### B. Gmail Filters
1. Go to Settings ⚙️ → See all settings
2. Click "Filters and Blocked Addresses"
3. Check if there are any filters redirecting emails

#### C. Google Workspace Settings (if applicable)
If using Google Workspace, there might be routing rules:
1. Go to Google Admin Console
2. Check routing settings
3. Verify no rules are redirecting outgoing emails

---

### Cause 2: Testing with Same Domain

If you're testing by sending to another @gmail.com address that you don't have access to, check:

**Problem:** You might be seeing the email in your "Sent" folder and thinking it's in your inbox.

**Solution:**
1. Use a different email service for testing (Yahoo, Outlook, etc.)
2. Or ask someone else to give you their email for testing

---

### Cause 3: Code Issue (Less Likely, but let's check)

The code has been updated with enhanced logging. When you add a user:

**Check the database to confirm email was saved correctly:**

```sql
SELECT account_id, fname, lname, email 
FROM account 
ORDER BY date_created DESC 
LIMIT 1;
```

This shows the most recently created user and their email.

---

## Testing Procedure

### Test 1: Use Test Script

1. Open browser: `http://localhost/capstone-api/api/test-setup-email.php`
2. Enter a test email address (use your own or someone you can verify)
3. Click "Send Test Email"
4. Check the inbox of the test email
5. **Important:** Also check SPAM/JUNK folder

**Expected Result:**
- Email arrives at the test address
- Email has red border and says "TEST EMAIL"
- Shows the recipient address in yellow box

**If it arrives at janmaristela2003@gmail.com instead:**
→ This is a Gmail configuration issue, not a code issue

---

### Test 2: Add Real User

1. Go to User Management
2. Click "ADD USER+"
3. Fill in details with a real email you can access
4. Click Save
5. Check BOTH inboxes:
   - The new user's email (expected)
   - janmaristela2003@gmail.com (to confirm it's NOT there)

---

### Test 3: Check Email Headers

If email arrives at wrong address:

1. Open the email
2. Click "Show original" or "View headers"
3. Look for these lines:
   ```
   To: [should be new user's email]
   From: janmaristela2003@gmail.com
   ```
4. If "To:" shows the wrong address → Code issue
5. If "To:" shows correct address but delivered wrong → Gmail issue

---

## Enhanced Logging Added

I've added detailed logging to help diagnose:

```php
// New logs show:
error_log("FROM: janmaristela2003@gmail.com");
error_log("TO: $email (Name: $fname)");
error_log("Email addresses set - Recipient: $email");
error_log("Recipient confirmed: $email");
```

**How to check:**
1. Add a new user
2. Open: `C:\xampp\apache\logs\error.log`
3. Scroll to bottom
4. Find the logs starting with `=== sendSetupEmail START ===`
5. Verify the "TO:" line shows the correct email

---

## Gmail App Password Check

Verify Gmail settings are correct:

### 1. Check if App Password is still valid
```
Username: janmaristela2003@gmail.com
App Password: gmytcjzbhunlwczt
```

### 2. Test SMTP Connection
The test script will show detailed SMTP communication.

### 3. Gmail Security Settings
1. Go to: https://myaccount.google.com/security
2. Check "Less secure app access" (should be OFF if using App Password)
3. Check "2-Step Verification" (should be ON)
4. Verify App Passwords are still valid

---

## Quick Fixes to Try

### Fix 1: Temporary SMTPDebug
If you want to see detailed email sending info in error logs, change line 154 in `users.php`:

**From:**
```php
$mail->SMTPDebug = 0; // Production mode
```

**To:**
```php
$mail->SMTPDebug = 2; // Debug mode
```

This will log all SMTP communication. **Remember to change back to 0 after testing!**

---

### Fix 2: Clear Email Address Explicitly

Add this to force email address (temporary testing):

In `users.php`, line 183, temporarily add:
```php
$mail->clearAddresses(); // Clear any previous addresses
$mail->addAddress($email, $fname);
error_log("Forced recipient: $email");
```

---

### Fix 3: Send to Multiple Recipients (Testing)

Temporarily send to both addresses to verify:
```php
$mail->addAddress($email, $fname); // New user
$mail->addAddress('janmaristela2003@gmail.com', 'Admin'); // You (for testing)
```

This way you can verify both receive the email.

---

## Check Gmail "Sent" vs "Inbox"

**Important Question:** Where are you seeing the email?

### If in "Sent" folder:
✅ **This is NORMAL!** 
- Sent folder shows emails YOU sent
- The new user should receive it in THEIR inbox
- You won't see it in your inbox because you're the sender

### If in "Inbox" folder:
❌ **This is the problem!**
- Means email is being redirected back to you
- Check Gmail forwarding/filters settings

---

## Expected Behavior

### What SHOULD happen:
1. Admin adds user with email: `newuser@example.com`
2. Email is sent FROM: `janmaristela2003@gmail.com`
3. Email is sent TO: `newuser@example.com`
4. **You (admin) see it in:** "Sent" folder ✅
5. **New user sees it in:** "Inbox" folder ✅

### What should NOT happen:
1. Admin adds user with email: `newuser@example.com`
2. **You receive email in your inbox** ❌
3. New user doesn't receive anything ❌

---

## Next Steps

1. **Run the test script:**
   ```
   http://localhost/capstone-api/api/test-setup-email.php?email=YOUR_EMAIL
   ```

2. **Check the error logs:**
   ```
   C:\xampp\apache\logs\error.log
   ```

3. **Verify Gmail settings:**
   - No forwarding rules
   - No filters redirecting emails
   - App password is valid

4. **Test with different email service:**
   - Try sending to a non-Gmail address
   - Use Yahoo, Outlook, etc.

5. **Check email headers:**
   - Verify "To:" field in email headers
   - Compare with what's in the logs

---

## Common Misunderstanding

**Are you checking the "Sent" folder?**

When you send an email, it appears in YOUR "Sent" folder. This is normal!

The recipient receives it in THEIR "Inbox" folder.

**Example:**
- You (admin@gmail.com) send email to user@gmail.com
- You see it in: admin@gmail.com → Sent ✅ (expected)
- User sees it in: user@gmail.com → Inbox ✅ (expected)
- You should NOT see it in: admin@gmail.com → Inbox ❌ (would be a problem)

---

## Files Modified

### C:\xampp\htdocs\capstone-api\api\users.php
**Changes:**
- Added enhanced logging (lines 178-185, 219-232)
- Added SMTP debugging capability (lines 153-157)
- Added SSL options (lines 167-174)
- Better error handling

### New Test File
**C:\xampp\htdocs\capstone-api\api\test-setup-email.php**
- Standalone test script
- Detailed SMTP debugging
- Visual confirmation of recipient
- Easy to test different email addresses

---

## Contact Me With Results

After running the test script, please provide:

1. **Test script result:** Did email arrive at correct address?
2. **Error log excerpt:** The lines from `=== sendSetupEmail START ===` to `=== sendSetupEmail END ===`
3. **Where you see the email:** Sent folder or Inbox?
4. **Email headers:** The "To:" line from email headers

This will help identify the exact issue!

---

**Status:** Debugging in progress  
**Priority:** High  
**Impact:** Users cannot complete account setup

