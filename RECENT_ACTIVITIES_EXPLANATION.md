# HOW RECENT ACTIVITIES WORK

## 📋 Overview:
The **Recent Activities** feature shows the last 5 actions performed by users at the warehouse location in real-time.

---

## 🔄 Technical Flow:

### 1. **Data Fetching (`GetRecentActivities` function)**

**Location:** `dashboardWR.js` lines 218-235

```javascript
const GetRecentActivities = async () => {
    const LocationID = parseInt(sessionStorage.getItem('location_id'));
    const baseURL = sessionStorage.getItem('baseURL');
    const url = baseURL + 'audit-log.php';

    try {
        const response = await axios.get(url, {
            params: {
                json: JSON.stringify({ location_id: LocationID }),
                operation: "GetRecentLogs"
            }
        });
        
        setRecentActivities((response.data || []).slice(0, 5)); // Get last 5 activities
    } catch (error) {
        console.error("Error fetching recent activities:", error);
    }
};
```

**What it does:**
- Gets the current warehouse location ID from session storage
- Calls the backend API `audit-log.php` 
- Requests operation: `"GetRecentLogs"`
- Sends the location ID to filter activities for this warehouse only
- Takes the response and keeps only the first 5 activities
- Stores them in the `recentActivities` state

---

### 2. **Backend API (`audit-log.php`)**

**Expected Operation:** `GetRecentLogs`

**What the backend should do:**
```sql
SELECT 
    a.*, 
    acc.fname, 
    acc.lname,
    acc.location_id
FROM audit_log a
INNER JOIN account acc ON a.account_id = acc.account_id
WHERE acc.location_id = :locationId
ORDER BY a.timestamp DESC
LIMIT 10
```

**Returns:** Array of log entries with:
- `activity` - Description of the action (e.g., "Sent a request from Store A to Warehouse CDO")
- `fname` - First name of user who performed the action
- `lname` - Last name of user
- `timestamp` - When the action occurred

---

### 3. **Display Format (`formatTimeAgo` function)**

**Location:** `dashboardWR.js` lines 273-284

```javascript
const formatTimeAgo = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
};
```

**Converts timestamps to human-readable format:**
- Less than 1 minute: `"Just now"`
- Less than 1 hour: `"5m ago"`, `"23m ago"`
- Less than 1 day: `"2h ago"`, `"15h ago"`
- Less than 1 week: `"3d ago"`, `"6d ago"`
- Older: Full date `"10/23/2025"`

---

### 4. **UI Display**

**Location:** `dashboardWR.js` lines 510-555

Each activity is displayed as a card showing:
```
┌─────────────────────────────────────────┐
│ Sent a request from Store A to Warehouse│ ← Activity description
│ John Doe                    2h ago      │ ← User name & time
└─────────────────────────────────────────┘
```

**Visual Features:**
- Green left border (3px solid #28a745)
- Light gray background (#f8f9fa)
- Activity text in dark gray
- User name and time in lighter gray
- Responsive layout

---

## 🔄 Auto-Refresh:

**Location:** `dashboardWR.js` lines 63-71

```javascript
useEffect(() => {
    // ... initial data fetch
    GetRecentActivities();
    
    // Refresh data every 30 seconds
    const interval = setInterval(() => {
        GetRequest();
        GetOngoingReq();
        GetDelivered();
        GetInventoryStats();
    }, 30000);
    
    return () => clearInterval(interval);
}, []);
```

**⚠️ NOTE:** Recent activities are fetched on initial load but NOT included in the 30-second auto-refresh.

**To add auto-refresh for activities, update to:**
```javascript
const interval = setInterval(() => {
    GetRequest();
    GetOngoingReq();
    GetDelivered();
    GetInventoryStats();
    GetRecentActivities();  // ← Add this line
}, 30000);
```

---

## 📝 How Activities Are Created:

Activities are logged throughout the application using the `Logs` function:

**Example from `combineRequestManagement.js` line 257:**
```javascript
Logs(accountID, 'Deliver the request #' + normalRID);
```

**Example from `requestStockIM.js` line 727:**
```javascript
Logs(accountID, `Sent a request from ${from1.location_name} to ${to1.location_name}`);
```

**Common Activities Logged:**
- ✅ Stock requests sent
- ✅ Deliveries scheduled
- ✅ Driver appointments
- ✅ Inventory updates
- ✅ User logins/logouts
- ✅ Product additions/edits

---

## 🎯 Example Output:

```
Recent Activities
─────────────────────────────────────────
│ Deliver the request #1234              │
│ Jane Smith                    Just now │
─────────────────────────────────────────
│ Sent a request from Store A to Warehouse│
│ John Doe                      5m ago   │
─────────────────────────────────────────
│ Request Stock Out List                 │
│ Mike Johnson                  15m ago  │
─────────────────────────────────────────
│ Log in                                 │
│ Sarah Williams                2h ago   │
─────────────────────────────────────────
│ Deliver the customize request #789    │
│ Tom Brown                     3h ago   │
─────────────────────────────────────────
```

---

## ⚙️ Requirements:

### Backend (`audit-log.php`) must have:

1. **Operation:** `"GetRecentLogs"`
2. **Input:** `{ location_id: number }`
3. **Output:** Array of objects with:
   ```javascript
   {
       activity: string,      // Action description
       fname: string,         // First name
       lname: string,         // Last name
       timestamp: datetime    // When it happened
   }
   ```

### Database table structure:
```sql
CREATE TABLE audit_log (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    account_id INT NOT NULL,
    activity VARCHAR(255) NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (account_id) REFERENCES account(account_id)
);
```

---

## 🚀 Summary:

1. **Dashboard loads** → Calls `GetRecentActivities()`
2. **API called** → `audit-log.php` with operation `GetRecentLogs`
3. **Backend filters** → Activities for this warehouse location
4. **Returns data** → Last 5-10 activities with user info
5. **Frontend displays** → Formatted with "time ago" and user names
6. **No auto-refresh** → Only loads once (can be added to 30s refresh)

The Recent Activities panel provides real-time visibility into warehouse operations! 🎉

