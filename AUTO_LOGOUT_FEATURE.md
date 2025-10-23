# 🔐 Automatic Logout & Inactivity Detection Feature

## Overview
An automatic logout system has been implemented to protect user accounts from unauthorized access when users are inactive or close their browser.

---

## ✨ Features

### 1. **Inactivity Detection**
- Monitors user activity (mouse movements, clicks, keyboard, scroll, touch)
- **Timeout**: 1 hour of inactivity
- **Warning**: Displayed 59 minutes after last activity
- **Grace Period**: 60-second countdown to stay logged in

### 2. **Browser Close Detection**
- Automatically sets user status to "Offline" when browser/tab closes
- Tracks unclean exits (browser crashes, force close)
- Prevents "ghost" online users

### 3. **Tab Visibility Tracking**
- Monitors when user switches tabs or minimizes browser
- If tab hidden for more than 1 hour → automatic logout
- Resumes tracking when tab becomes visible again

### 4. **Warning Modal**
- Shows a prominent warning 1 minute before logout
- Live countdown timer (60 seconds)
- Two options:
  - ✅ **"Stay Logged In"** - Resets the inactivity timer
  - ❌ **"Logout Now"** - Immediately logs out

---

## 🎯 How It Works

### Activity Tracking
```
User Activity Detected
    ↓
Reset 1-hour Timer
    ↓
59 Minutes Pass
    ↓
Show Warning Modal with 60s Countdown
    ↓
User Clicks "Stay Logged In" OR 60 Seconds Expire
    ↓
Reset Timer OR Auto Logout
```

### Browser Close
```
User Closes Browser/Tab
    ↓
beforeunload Event Triggered
    ↓
Call Backend API to Set User Offline
    ↓
Clear Session Storage
```

---

## 📁 Files Modified

### New Component
- **`app/Components/InactivityLogout/inactivityLogout.js`**
  - Main inactivity detection logic
  - Warning modal UI
  - Backend API integration for offline status and audit logs

### Updated Pages
All authenticated pages now include the `<InactivityLogout />` component:
- ✅ `app/adminPage/page.js`
- ✅ `app/inventoryPage/page.js`
- ✅ `app/warehousePage/page.js`
- ✅ `app/salesClerkPage/page.js`

---

## ⚙️ Configuration

### Timeout Settings
Located in `app/Components/InactivityLogout/inactivityLogout.js`:

```javascript
// Inactivity timeout: 1 hour (in milliseconds)
const INACTIVITY_TIMEOUT = 3600000; // 1 hour

// Warning time: 1 minute before logout
const WARNING_TIME = 60000; // 1 minute

// Warning shows at: 59 minutes
const TIME_BEFORE_WARNING = INACTIVITY_TIMEOUT - WARNING_TIME;
```

### To Change Timeout Duration:
```javascript
// Example: 30 minutes
const INACTIVITY_TIMEOUT = 1800000; // 30 minutes

// Example: 15 minutes
const INACTIVITY_TIMEOUT = 900000; // 15 minutes

// Example: 2 hours
const INACTIVITY_TIMEOUT = 7200000; // 2 hours
```

---

## 🔄 Backend Integration

### API Endpoints Used

#### 1. Set User Offline
```javascript
// Endpoint: login.php
// Operation: actStatus
axios.get(baseURL + 'login.php', {
  params: {
    json: JSON.stringify({
      userID: userId,
      state: 'Offline'
    }),
    operation: 'actStatus'
  }
});
```

#### 2. Log Activity
```javascript
// Endpoint: audit-log.php
// Operation: Logs
axios.get(baseURL + 'audit-log.php', {
  params: {
    json: JSON.stringify({
      accID: userId,
      activity: 'Auto Logout - Inactivity Timeout'
    }),
    operation: 'Logs'
  }
});
```

### Audit Log Messages
- `"Auto Logout - Inactivity Timeout"` - User inactive for 1 hour
- `"Auto Logout - Browser Inactive"` - Tab hidden for 1 hour
- `"Manual Logout - From Warning"` - User clicked "Logout Now" in warning

---

## 🎨 Warning Modal UI

### Design Features
- **Modal Type**: Static backdrop (cannot be closed by clicking outside)
- **Color**: Orange warning theme (#ff9800)
- **Countdown**: Large, bold timer (48px font)
  - Orange: 60-11 seconds remaining
  - Red: 10 seconds or less
- **Buttons**: 
  - Green "Stay Logged In" (success)
  - Red "Logout Now" (danger)
- **Z-index**: 99999 (appears above everything)

### Modal Preview
```
┌─────────────────────────────────────────┐
│ ⚠️ Inactivity Warning                   │
├─────────────────────────────────────────┤
│                                         │
│  You have been inactive for too long!  │
│                                         │
│  You will be automatically logged out   │
│               in:                       │
│                                         │
│               45s                       │
│                                         │
│  Click "Stay Logged In" to continue    │
│  your session, or you will be          │
│  redirected to the login page.         │
│                                         │
├─────────────────────────────────────────┤
│  [✓ Stay Logged In] [✗ Logout Now]    │
└─────────────────────────────────────────┘
```

---

## 🚀 User Experience

### Normal Flow
1. User logs in → Activity tracking starts
2. User actively uses the system → Timer resets on each action
3. User becomes inactive (59 minutes) → Warning appears
4. User clicks "Stay Logged In" → Timer resets, work continues
5. User closes browser → Logged out automatically

### Inactive User Flow
1. User logs in → Activity tracking starts
2. User leaves computer (no activity for 59 minutes)
3. Warning modal appears with 60-second countdown
4. No response from user
5. Countdown reaches 0
6. User automatically logged out
7. Audit log entry created
8. User status set to "Offline"
9. Redirected to login page

---

## 🔒 Security Benefits

1. **Prevents Unauthorized Access**
   - Automatic logout protects unattended sessions
   - Reduces risk of data breaches

2. **Audit Trail**
   - All logouts are logged with reason
   - Helps track unusual activity patterns

3. **Resource Management**
   - Prevents "ghost" sessions
   - Frees up server resources

4. **Compliance**
   - Meets security best practices
   - Helps with regulatory requirements

---

## 🛠️ Troubleshooting

### Warning Doesn't Appear
**Issue**: User inactive but no warning shown
**Solution**: 
- Check browser console for errors
- Verify `InactivityLogout` component is imported
- Check sessionStorage for `user_id` and `baseURL`

### Timer Resets Too Frequently
**Issue**: Warning appears but resets immediately
**Solution**: 
- Check for background scripts triggering events
- Review throttle timeout (currently 1 second)
- Check for auto-refresh or polling scripts

### User Not Set to Offline
**Issue**: User status still "Online" after logout
**Solution**:
- Verify backend API endpoint is working
- Check CORS settings
- Verify `login.php` has `actStatus` operation
- Check database connection

### Warning Appears Too Soon/Late
**Issue**: Timing is incorrect
**Solution**:
- Adjust `INACTIVITY_TIMEOUT` value
- Adjust `WARNING_TIME` value
- Clear browser cache
- Restart development server

---

## 📝 Testing Checklist

### Manual Testing

- [ ] Log in and wait 59 minutes → Warning appears
- [ ] Click "Stay Logged In" → Timer resets
- [ ] Click "Logout Now" → Redirects to login
- [ ] Wait for countdown to reach 0 → Auto logout
- [ ] Close browser → User set to offline
- [ ] Switch tabs for 1+ hour → Auto logout on return
- [ ] Move mouse → Timer resets
- [ ] Type on keyboard → Timer resets
- [ ] Click anywhere → Timer resets
- [ ] Scroll page → Timer resets

### Backend Testing

- [ ] Check audit logs after auto logout
- [ ] Verify user status changes to "Offline"
- [ ] Test with multiple users simultaneously
- [ ] Test API endpoint failures (graceful degradation)

---

## 🎯 Future Enhancements

### Potential Improvements
1. **Admin Configuration**
   - Let admins set timeout duration via settings page
   - Different timeouts for different user roles

2. **Session Extension**
   - Allow users to request extended sessions
   - Require password re-entry for extensions

3. **Activity Dashboard**
   - Show last activity time in header
   - Display remaining time before warning

4. **Mobile Optimization**
   - Better handling of mobile background states
   - Touch-optimized warning modal

5. **Multiple Warnings**
   - First warning at 50 minutes
   - Second warning at 59 minutes
   - More gradual escalation

---

## 📚 Related Files

- `app/Components/InactivityLogout/inactivityLogout.js` - Main component
- `app/Components/Header/page.js` - Logout functions
- `app/page.js` - Login page (destination after logout)
- Backend API: `login.php` (offline status)
- Backend API: `audit-log.php` (activity logging)

---

## 🔧 Customization Examples

### Change Warning Time to 5 Minutes
```javascript
const WARNING_TIME = 300000; // 5 minutes
```

### Change Total Timeout to 30 Minutes
```javascript
const INACTIVITY_TIMEOUT = 1800000; // 30 minutes
```

### Disable Browser Close Detection
```javascript
// Comment out or remove the beforeunload listener
// window.addEventListener('beforeunload', handleBeforeUnload);
```

### Custom Warning Message
```javascript
<Modal.Body>
  <div style={{ textAlign: 'center', padding: '20px' }}>
    <h4>Your custom message here!</h4>
    {/* ... rest of modal content ... */}
  </div>
</Modal.Body>
```

---

## ✅ Success Indicators

Feature is working correctly when:
- ✓ Warning appears after 59 minutes of inactivity
- ✓ Countdown timer updates every second
- ✓ "Stay Logged In" resets the timer
- ✓ Auto logout occurs at 0 seconds
- ✓ User status changes to "Offline" on browser close
- ✓ Audit logs contain logout entries
- ✓ User redirected to login page after logout
- ✓ Session storage cleared after logout

---

## 📞 Support

If you encounter issues:
1. Check browser console for errors
2. Verify backend API endpoints are working
3. Check network tab for failed requests
4. Review audit logs for clues
5. Test in incognito mode to rule out cache issues

---

**Status**: ✅ Implemented and Active
**Version**: 1.0
**Last Updated**: October 23, 2025

