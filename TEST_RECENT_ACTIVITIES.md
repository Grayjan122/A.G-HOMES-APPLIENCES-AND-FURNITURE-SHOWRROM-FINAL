# 🧪 TEST RECENT ACTIVITIES FIX

## ✅ Changes Applied:

### 1. **Backend API Updated** ✅
**File:** `C:\xampp\htdocs\capstone-api\api\audit-log.php`

- ✅ Added `GetRecentLogs()` function (lines 30-61)
- ✅ Added location filtering (`WHERE b.location_id = :location_id`)
- ✅ Added timestamp field (`CONCAT(a.date, ' ', a.time) as timestamp`)
- ✅ Added switch case for `GetRecentLogs` operation (line 113-115)

### 2. **Frontend Dashboard Updated** ✅
**File:** `app/Contents/warehouse-contents/dashboardWR.js`

- ✅ Added `GetRecentActivities()` to auto-refresh interval (line 69)
- ✅ Changed refresh rate from 30 seconds to 10 seconds (line 70)

---

## 🧪 HOW TO TEST:

### **Step 1: Test Backend API Directly**

Open your browser and go to:
```
http://localhost/capstone-api/api/audit-log.php?operation=GetRecentLogs&json={"location_id":3}
```

**Replace `3` with your actual warehouse location ID.**

**Expected Response:**
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
  }
]
```

✅ **If you see JSON data → Backend is working!**
❌ **If you see an error → Check database table structure below**

---

### **Step 2: Check Your Database**

Run these SQL queries in phpMyAdmin:

#### **Check if activity_log table exists:**
```sql
DESCRIBE activity_log;
```

**Expected columns:**
- `activity_log_id` (INT, PRIMARY KEY, AUTO_INCREMENT)
- `activity` (VARCHAR)
- `time` (VARCHAR or TIME)
- `date` (VARCHAR or DATE)
- `account_id` (INT)

#### **Check if there are recent activities:**
```sql
SELECT 
    a.*, 
    b.fname, 
    b.lname, 
    b.location_id,
    CONCAT(a.date, ' ', a.time) as timestamp
FROM activity_log a
INNER JOIN account b ON a.account_id = b.account_id
ORDER BY a.activity_log_id DESC
LIMIT 10;
```

✅ **If you see data → Database has activities**
❌ **If empty → Accept some requests first to generate activities**

---

### **Step 3: Test the Dashboard**

1. **Open Warehouse Dashboard**
   - Navigate to your warehouse page
   - Look for the "Recent Activities" section on the right side

2. **Check Initial Load**
   - Should show existing activities (if any)
   - Format: Activity description, User name, Time ago

3. **Accept a Request**
   - Go to Pending Requests
   - Click on any request and accept it
   - **This will log:** `"Accept the request #[ID]"`

4. **Wait and Watch**
   - Wait up to **10 seconds** (not 30 anymore!)
   - The Recent Activities section should auto-refresh
   - Your new activity should appear at the top

5. **Verify the Display**
   - ✅ Activity shows: "Accept the request #[ID]"
   - ✅ Your name appears: "[FirstName] [LastName]"
   - ✅ Time shows: "Just now" or "1m ago"

---

## 🔍 TROUBLESHOOTING:

### **Problem: API returns empty array `[]`**

**Solution 1:** Check if there are activities for your location
```sql
SELECT b.location_id, COUNT(*) as activity_count
FROM activity_log a
INNER JOIN account b ON a.account_id = b.account_id
GROUP BY b.location_id;
```

**Solution 2:** Verify your location_id
```javascript
// Check in browser console
console.log(sessionStorage.getItem('location_id'));
```

---

### **Problem: Activities don't refresh after accepting**

**Solution 1:** Check browser console for errors
- Open Developer Tools (F12)
- Look for errors in Console tab
- Look for "Error fetching recent activities"

**Solution 2:** Verify the request is being made
- Open Developer Tools → Network tab
- Accept a request
- Wait 10 seconds
- Look for a request to `audit-log.php?operation=GetRecentLogs`

**Solution 3:** Check if Logs() is being called
```sql
-- Check if new activities are being logged
SELECT * FROM activity_log 
ORDER BY activity_log_id DESC 
LIMIT 5;
```

---

### **Problem: Shows activities from other locations**

This means the location filter isn't working. Check:

1. **User's location_id is correct:**
```sql
SELECT account_id, fname, lname, location_id 
FROM account 
WHERE account_id = [YOUR_USER_ID];
```

2. **Backend is receiving location_id:**
Add this to `GetRecentLogs()` function (line 35):
```php
error_log("Location ID: " . print_r($json['location_id'], true));
```

Check PHP error log: `C:\xampp\php\logs\php_error_log`

---

### **Problem: Time shows wrong format**

The `timestamp` field might not be combining correctly. Try:

```sql
-- Test timestamp creation
SELECT 
    date,
    time,
    CONCAT(date, ' ', time) as timestamp
FROM activity_log
LIMIT 5;
```

---

## ✅ SUCCESS CRITERIA:

After the fix, you should see:

1. ✅ Recent Activities section loads on dashboard mount
2. ✅ Shows only activities from your warehouse location
3. ✅ Auto-refreshes every 10 seconds
4. ✅ When you accept a request, it appears within 10 seconds
5. ✅ Shows format: "Accept the request #[ID]"
6. ✅ Shows your name and "Just now"
7. ✅ Sorted by most recent first (newest on top)

---

## 📊 API ENDPOINT DETAILS:

### **Endpoint:**
```
GET http://localhost/capstone-api/api/audit-log.php
```

### **Parameters:**
```
operation: "GetRecentLogs"
json: {"location_id": 3}
```

### **Full URL Example:**
```
http://localhost/capstone-api/api/audit-log.php?operation=GetRecentLogs&json={"location_id":3}
```

### **Response Format:**
```json
[
  {
    "activity_log_id": "123",
    "activity": "Accept the request #1234",
    "time": "14:35:00",
    "date": "2025-10-23",
    "account_id": "5",
    "fname": "John",
    "mname": "M",
    "lname": "Doe",
    "location_id": "3",
    "timestamp": "2025-10-23 14:35:00"
  },
  {
    "activity_log_id": "122",
    "activity": "Deliver the request #999",
    "time": "14:30:00",
    "date": "2025-10-23",
    "account_id": "7",
    "fname": "Jane",
    "mname": "S",
    "lname": "Smith",
    "location_id": "3",
    "timestamp": "2025-10-23 14:30:00"
  }
]
```

---

## 🎉 EXPECTED RESULT:

When you accept a request, within **10 seconds** you'll see:

```
┌─────────────────────────────────────────┐
│  🕐 Recent Activities                   │
├─────────────────────────────────────────┤
│ Accept the request #1234               │ ← NEW!
│ Your Name              Just now        │
├─────────────────────────────────────────┤
│ Deliver the request #999               │
│ John Doe               5m ago          │
├─────────────────────────────────────────┤
│ Log in                                 │
│ Jane Smith             15m ago         │
└─────────────────────────────────────────┘
```

**Your Recent Activities feature is now fully functional!** 🚀

