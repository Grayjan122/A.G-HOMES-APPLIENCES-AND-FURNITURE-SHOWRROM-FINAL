# 🔍 DIAGNOSE: Account Terminated When No One Else Is Logging In

## Issue
You're still getting logged out even though:
- ✅ Session token column exists in database
- ✅ Code has been updated
- ✅ No one else is logging in with the same account

## Let's Debug Step by Step

### Step 1: Test Backend Token Generation

Visit this URL in your browser:
```
http://localhost/capstone-api/api/test-login-token.php
```

**What to look for:**
- `session_token_column_exists`: Should say "YES - Column exists"
- `active_sessions`: Check if tokens are being stored
- `test_token_generation`: Should show a 64-character token

---

### Step 2: Check Browser Console

1. Open your app
2. Login
3. Press `F12` (open console)
4. **Immediately after login**, type:
   ```javascript
   console.log('User ID:', sessionStorage.getItem('user_id'));
   console.log('Session Token:', sessionStorage.getItem('session_token'));
   console.log('Token Length:', sessionStorage.getItem('session_token')?.length);
   ```

**Expected Results:**
- User ID: Should show a number (e.g., "7")
- Session Token: Should show 64-character string (e.g., "abc123def456...")
- Token Length: Should show "64"

**If Session Token is NULL or undefined:**
→ Backend is NOT returning the token!

---

### Step 3: Check What Backend Is Returning

In browser console, after login, check what the login API returned:

1. Open Network tab (F12 → Network)
2. Login
3. Find the `login.php` request
4. Click on it
5. Go to "Response" tab
6. Check if response includes `session_token`

**Expected:**
```json
[{
  "account_id": "7",
  "username": "youruser",
  "role_name": "Admin",
  "session_token": "abc123def456...",
  ...
}]
```

**If `session_token` is missing from response:**
→ Backend has an issue!

---

### Step 4: Check Backend Logs

Look at: `C:\xampp\apache\logs\error.log`

Search for recent entries with:
- "session token"
- "Session check"
- "token_mismatch"
- "logged_out"

**Common issues:**
```
❌ "Column 'session_token' not found" → Database not updated
❌ "Token mismatch" → Token comparison failing
❌ "User is offline" → Status getting set to Offline incorrectly
```

---

### Step 5: Manually Test Database

Run this SQL:

```sql
-- Clear all sessions first
UPDATE account SET active_status = 'Offline', session_token = NULL;

-- Now login through your app, then run:
SELECT account_id, username, active_status, 
       CASE 
         WHEN session_token IS NULL THEN '❌ NULL'
         WHEN session_token = '' THEN '⚠️ EMPTY'
         WHEN LENGTH(session_token) = 64 THEN '✅ VALID (64 chars)'
         ELSE CONCAT('⚠️ INVALID (', LENGTH(session_token), ' chars)')
       END as token_status,
       LEFT(session_token, 20) as token_preview
FROM account 
WHERE active_status = 'Online';
```

**Expected after login:**
```
username  | active_status | token_status       | token_preview
----------|---------------|--------------------|-----------------
youruser  | Online        | ✅ VALID (64 chars)| abc123def456789...
```

**If token_status shows NULL or EMPTY:**
→ Backend is NOT storing tokens!

---

## Common Issues and Fixes

### Issue 1: Token Not Being Generated

**Symptoms:**
- `sessionStorage.getItem('session_token')` returns `null`
- Database shows NULL for session_token

**Check:**
```sql
-- See if column accepts data
UPDATE account SET session_token = 'test123' WHERE account_id = 1;
SELECT session_token FROM account WHERE account_id = 1;
-- Should show 'test123'
```

**Fix:** Backend code might have an error. Check `error.log`

---

### Issue 2: Token Not Being Sent to Frontend

**Symptoms:**
- Database has token
- Browser doesn't have token

**Check:** Network tab - is `session_token` in login response?

**Fix:** Make sure login.php includes `session_token` in response:
```php
return json_encode([$user]); // $user should include session_token
```

---

### Issue 3: Session Validator Too Aggressive

**Symptoms:**
- Token exists in browser
- Still getting logged out

**Temporary Fix - Disable Session Validator:**

Open: `app/Components/SessionValidator/sessionValidator.js`

Add this at the top of the `useEffect`:
```javascript
useEffect(() => {
  // TEMPORARY: Disable for testing
  console.log('Session Validator DISABLED for testing');
  return; // Exit early - disables all checking
  
  // ... rest of code
```

**Test:** Login again. If you stay logged in → SessionValidator is the issue

---

### Issue 4: Backend Not Checking Tokens Correctly

**Symptoms:**
- Tokens exist everywhere
- Still getting "Session Terminated"

**Check `session-check.php` logs:**

Look in error.log for:
```
Session check for user: 7 with token: abc123...
Session invalid: Token mismatch
```

**If you see "Token mismatch":**
→ Tokens don't match between browser and database

---

## Quick Diagnostic Commands

Run these in order:

### 1. Check Database Column
```sql
DESCRIBE account;
-- Look for 'session_token' in output
```

### 2. Clear Everything
```sql
UPDATE account SET active_status = 'Offline', session_token = NULL;
```

### 3. Login and Check Immediately
```sql
SELECT username, active_status, 
       LENGTH(session_token) as token_len,
       LEFT(session_token, 10) as token_start
FROM account 
WHERE active_status = 'Online';
```

### 4. Browser Console Check
```javascript
console.log({
  userId: sessionStorage.getItem('user_id'),
  hasToken: sessionStorage.getItem('session_token') !== null,
  tokenLength: sessionStorage.getItem('session_token')?.length
});
```

---

## Report Back With:

1. **Test Login Token URL result** (visit the URL above)
2. **Browser Console Output** (after login)
3. **Network Tab Response** (what login.php returns)
4. **Database Query Result** (after login)
5. **Any errors in error.log**

With this info, I can pinpoint the exact issue!

---

## Emergency Fix: Disable Session Validation Temporarily

If you need to work NOW while we debug:

**File:** `app/Components/SessionValidator/sessionValidator.js`

**Add return at top:**
```javascript
export default function SessionValidator() {
  const router = useRouter();
  
  // TEMPORARY: Disable session validation
  return null;
  
  // ... rest of code
```

This disables the termination but also removes security. Use only for testing!

