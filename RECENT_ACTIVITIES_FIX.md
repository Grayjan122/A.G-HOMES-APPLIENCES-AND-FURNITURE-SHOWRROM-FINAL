# ✅ RECENT ACTIVITIES FIX - ACCEPT REQUEST REFLECTION

## 🔴 Problem:
When you accept a request, it doesn't immediately show up in the Recent Activities section of the warehouse dashboard.

## 🔍 Root Causes Found:

### 1. **Missing Backend Operation**
- The `audit-log.php` backend didn't have a `GetRecentLogs` operation
- The dashboard was calling `GetRecentLogs` but the backend only had `GetLogs`
- The existing `GetLogs` didn't filter by location

### 2. **No Auto-Refresh for Activities**
- Recent Activities were only loaded once on dashboard mount
- They were NOT included in the auto-refresh interval
- Even if logged, activities wouldn't appear until page reload

### 3. **Slow Refresh Rate**
- Auto-refresh was set to 30 seconds
- Too slow to see immediate updates after accepting requests

---

## ✅ Solutions Applied:

### 1. **Updated Backend (`audit-log.php`)** ✅

Added new `GetRecentLogs()` function:
```php
function GetRecentLogs($json)
{
    include 'conn.php';
    $json = json_decode($json, true);
    
    // Combine date and time into a timestamp for proper sorting
    $sql = "SELECT 
                a.`activity_log_id`, 
                a.`activity`, 
                a.`time`, 
                a.`date`, 
                a.`account_id`, 
                b.fname, 
                b.mname, 
                b.lname,
                b.location_id,
                CONCAT(a.`date`, ' ', a.`time`) as timestamp
            FROM `activity_log` a
            INNER JOIN account b ON a.account_id = b.account_id
            WHERE b.location_id = :location_id
            ORDER BY a.`date` DESC, a.`time` DESC
            LIMIT 10";

    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':location_id', $json['location_id']);
    $stmt->execute();
    $returnValue = $stmt->fetchAll(PDO::FETCH_ASSOC);
    unset($conn);
    unset($stmt);
    return json_encode($returnValue);
}
```

**Key Features:**
- ✅ Filters by `location_id` (only shows activities for current warehouse)
- ✅ Returns `timestamp` field (combines date + time)
- ✅ Properly sorted by date and time (most recent first)
- ✅ Returns last 10 activities (frontend shows 5)
- ✅ Includes user's first and last name

### 2. **Added Auto-Refresh (`dashboardWR.js`)** ✅

**Line 69:** Added `GetRecentActivities()` to the auto-refresh interval
```javascript
const interval = setInterval(() => {
    GetRequest();
    GetOngoingReq();
    GetDelivered();
    GetInventoryStats();
    GetRecentActivities();  // ← ADDED THIS
}, 10000);
```

### 3. **Increased Refresh Speed** ✅

**Line 70:** Changed refresh interval from 30 seconds to 10 seconds
```javascript
}, 10000); // Reduced from 30s to 10s
```

---

## 🎯 How It Works Now:

### **Timeline After Accepting a Request:**

```
[0s]  User clicks "Accept Request"
      ↓
[0s]  Backend processes request
      ↓
[0s]  Logs() function saves: "Accept the request #1234"
      ↓
[0-10s] Dashboard auto-refreshes (within 10 seconds)
      ↓
[10s] GetRecentActivities() fetches latest logs
      ↓
[10s] New activity appears in Recent Activities panel!
```

### **What Gets Logged:**

**From `requestPage.js` line 404:**
```javascript
Logs(accountID, 'Accept the request #' + s_reqID);
```

**Database Entry:**
- `activity`: "Accept the request #1234"
- `account_id`: Your user ID
- `date`: "2025-10-23"
- `time`: "14:35"

**Backend Returns:**
```json
{
  "activity": "Accept the request #1234",
  "fname": "John",
  "lname": "Doe",
  "timestamp": "2025-10-23 14:35"
}
```

**Dashboard Displays:**
```
Accept the request #1234
John Doe                    Just now
```

---

## 🔄 Auto-Refresh Behavior:

### **Initial Load:**
- Dashboard mounts → Calls `GetRecentActivities()` immediately
- Shows any existing activities

### **Every 10 Seconds:**
- Calls `GetRecentActivities()` automatically
- Fetches latest activities from backend
- Updates the display without page reload

### **After Accepting Request:**
- Within 0-10 seconds, the new activity will appear
- No manual refresh needed!

---

## 📊 Backend API Requirements:

### **Endpoint:**
`audit-log.php?operation=GetRecentLogs&json={"location_id": 3}`

### **Input:**
```json
{
  "location_id": 3
}
```

### **Output:**
```json
[
  {
    "activity_log_id": "123",
    "activity": "Accept the request #1234",
    "time": "14:35",
    "date": "2025-10-23",
    "account_id": "5",
    "fname": "John",
    "mname": "M",
    "lname": "Doe",
    "location_id": "3",
    "timestamp": "2025-10-23 14:35"
  },
  ...
]
```

---

## 🧪 Testing:

### **To Test the Fix:**

1. ✅ Open Warehouse Dashboard
2. ✅ Note the current activities shown
3. ✅ Accept a pending request
4. ✅ Wait 10 seconds (or less)
5. ✅ New activity should appear: "Accept the request #[ID]"

### **What You Should See:**

**Before Accepting:**
```
Recent Activities
─────────────────────────────────────
│ Deliver the request #999          │
│ Jane Smith            5m ago      │
─────────────────────────────────────
```

**After Accepting (within 10s):**
```
Recent Activities
─────────────────────────────────────
│ Accept the request #1234          │ ← NEW!
│ John Doe              Just now    │ ← YOU!
─────────────────────────────────────
│ Deliver the request #999          │
│ Jane Smith            5m ago      │
─────────────────────────────────────
```

---

## 🚨 Troubleshooting:

### **If activities still don't appear:**

#### 1. Check if logging is working:
```sql
-- Run in your database
SELECT * FROM activity_log 
ORDER BY activity_log_id DESC 
LIMIT 5;
```
Should show your recent "Accept the request" entries.

#### 2. Check location filter:
```sql
-- Verify user's location_id
SELECT a.account_id, a.fname, a.location_id 
FROM account a 
WHERE a.account_id = [YOUR_USER_ID];
```

#### 3. Check backend response:
Open browser console and look for:
```javascript
console.log("Fetching recent activities...");
```

#### 4. Check API directly:
```
http://localhost/capstone-api/api/audit-log.php?operation=GetRecentLogs&json={"location_id":3}
```
Should return JSON array of activities.

---

## 📝 Files Modified:

1. ✅ `app/Contents/warehouse-contents/dashboardWR.js`
   - Added `GetRecentActivities()` to auto-refresh interval
   - Changed refresh rate from 30s to 10s

2. ✅ `capstone-api/api/audit-log.php`
   - Added `GetRecentLogs()` function
   - Added location filtering
   - Added timestamp field
   - Added switch case for `GetRecentLogs`

---

## 🎉 Result:

**Recent Activities now:**
- ✅ Load on dashboard mount
- ✅ Auto-refresh every 10 seconds
- ✅ Show only activities from your warehouse location
- ✅ Display immediately after accepting requests
- ✅ Show user names and time ago format
- ✅ Sort by most recent first

**Your request acceptance workflow is now complete!** 🚀

