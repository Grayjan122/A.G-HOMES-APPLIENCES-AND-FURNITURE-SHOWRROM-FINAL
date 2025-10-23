# 🔧 NOTIFICATION FIX - NOT RECORDING IN DATABASE

## 🔴 Problem:
Notifications were not being recorded in the database when accepting requests.

## 🔍 Root Cause:
The frontend was sending data using `axios.post()` with a JSON object, but the PHP backend expected the data in `FormData` format with separate `operation` and `json` parameters (matching the POST request structure used by other APIs).

---

## ✅ Solution Applied:

### **Updated `createNotification` Function**

**Location:** `requestPage.js` lines 355-371

**Before (NOT WORKING):**
```javascript
const createNotification = async (notificationData) => {
    const baseURL = sessionStorage.getItem('baseURL');
    const url = baseURL + 'notifications.php';
    
    try {
        await axios.post(url, {
            operation: 'CreateNotification',
            ...notificationData
        });
        console.log('Notification sent successfully');
    } catch (error) {
        console.error('Error sending notification:', error);
    }
};
```

**After (WORKING):**
```javascript
const createNotification = async (notificationData) => {
    const baseURL = sessionStorage.getItem('baseURL');
    const url = baseURL + 'notifications.php';
    
    try {
        // Format data for PHP backend (using FormData for POST)
        const formData = new FormData();
        formData.append('operation', 'CreateNotification');
        formData.append('json', JSON.stringify(notificationData));

        const response = await axios.post(url, formData);
        console.log('Notification sent successfully:', response.data);
    } catch (error) {
        console.error('Error sending notification:', error);
        console.error('Error details:', error.response?.data || error.message);
    }
};
```

---

## 🔑 Key Changes:

### **1. Using FormData**
```javascript
const formData = new FormData();
formData.append('operation', 'CreateNotification');
formData.append('json', JSON.stringify(notificationData));
```

**Why:** PHP backend expects `$_POST['operation']` and `$_POST['json']` separately, not a single JSON object.

### **2. Stringifying Notification Data**
```javascript
formData.append('json', JSON.stringify(notificationData));
```

**Why:** The backend decodes the JSON in the `CreateNotification` function using `json_decode($json, true)`.

### **3. Better Error Logging**
```javascript
console.log('Notification sent successfully:', response.data);
console.error('Error details:', error.response?.data || error.message);
```

**Why:** Helps debug issues by showing the actual backend response.

---

## 📊 How It Works Now:

### **Frontend Request Format:**

```
POST http://localhost/capstone-api/api/notifications.php

FormData:
{
  operation: "CreateNotification"
  json: "{\"type\":\"stock_request\",\"title\":\"Stock Request Approved\",\"message\":\"Your stock request #1234...\",\"locationId\":3,\"targetRole\":\"Inventory Manager\",\"productId\":null,\"customerId\":null,\"referenceId\":1234}"
}
```

### **Backend Processing:**

```php
// notifications.php lines 256-259
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $operation = $_POST['operation'];  // "CreateNotification"
    $json = $_POST['json'];            // JSON string
}

// notifications.php lines 87-120
function CreateNotification($json) {
    $json = json_decode($json, true);  // Parse JSON string
    
    $type = $json['type'];
    $title = $json['title'];
    // ... extract all fields
    
    // Insert into database
    $sql = "INSERT INTO notifications ...";
}
```

---

## 🧪 Testing:

### **Test Stock Request Notification:**

1. Open browser console (F12)
2. Go to "All Requests" page as Warehouse Representative
3. Accept a stock request
4. **Check console for:**
   ```
   Notification sent successfully: "Success"
   ```

5. **Check database:**
   ```sql
   SELECT * FROM notifications 
   WHERE type = 'stock_request'
   ORDER BY notification_id DESC 
   LIMIT 1;
   ```

   **Expected Result:**
   ```
   notification_id: 123
   type: stock_request
   title: Stock Request Approved
   message: Your stock request #1234 from Store A has been approved...
   location_id: 3 (requesting location)
   target_role: Inventory Manager
   reference_id: 1234
   created_at: 2025-10-23 14:35:00
   is_read: 0
   ```

### **Test Customize Request Notification:**

1. Open browser console (F12)
2. Accept a customize request
3. **Check console for:**
   ```
   Notification sent successfully: "Success"
   ```

4. **Check database:**
   ```sql
   SELECT * FROM notifications 
   WHERE type = 'customize_request'
   ORDER BY notification_id DESC 
   LIMIT 1;
   ```

   **Expected Result:**
   ```
   notification_id: 124
   type: customize_request
   title: Customize Request Approved
   message: Your customize request #567 from Store B has been approved...
   location_id: 5 (requesting location)
   target_role: Sales Clerk
   reference_id: 567
   created_at: 2025-10-23 14:40:00
   is_read: 0
   ```

---

## 🔍 Troubleshooting:

### **If notifications still don't appear in database:**

#### **1. Check Browser Console**

**Look for:**
- ✅ "Notification sent successfully: Success" (working)
- ❌ "Error sending notification" (not working)

**If error appears, check the error details:**
```javascript
console.error('Error details:', error.response?.data);
```

#### **2. Check Backend Response**

Open Network tab in browser:
1. Accept a request
2. Find the POST request to `notifications.php`
3. Check Response tab

**Expected Response:**
```json
"Success"
```

**If error, check Status Code:**
- 200: Success
- 400: Bad request (check data format)
- 500: Server error (check PHP logs)

#### **3. Check PHP Error Logs**

Location: `C:\xampp\php\logs\php_error_log`

Look for errors related to:
- SQL syntax errors
- Missing columns
- Connection errors

#### **4. Test Backend Directly**

Use Postman or browser to test:

```
POST http://localhost/capstone-api/api/notifications.php

Body (form-data):
operation: CreateNotification
json: {"type":"stock_request","title":"Test","message":"Test message","locationId":3,"targetRole":"Inventory Manager","productId":null,"customerId":null,"referenceId":999}
```

**Expected Response:**
```json
"Success"
```

#### **5. Verify Database Table Structure**

```sql
DESCRIBE notifications;
```

**Required columns:**
- `notification_id` (INT, PRIMARY KEY, AUTO_INCREMENT)
- `type` (VARCHAR)
- `title` (VARCHAR)
- `message` (TEXT)
- `location_id` (INT, NULLABLE)
- `target_role` (VARCHAR)
- `product_id` (INT, NULLABLE)
- `customer_id` (INT, NULLABLE)
- `reference_id` (INT, NULLABLE)
- `created_at` (DATETIME)
- `is_read` (TINYINT)

If table doesn't exist, run:
```sql
-- Use database_notifications_simple.sql
```

---

## 📝 Complete Request Flow:

### **Stock Request Approval:**

```
1. User clicks "Accept" on stock request #1234
         ↓
2. ApproveStockRequest() executes
         ↓
3. Backend processes request → "Success"
         ↓
4. Activity logged: "Accept the request #1234"
         ↓
5. createNotification() called with:
   {
     type: 'stock_request',
     title: 'Stock Request Approved',
     message: 'Your stock request #1234...',
     locationId: 3,
     targetRole: 'Inventory Manager',
     referenceId: 1234
   }
         ↓
6. FormData created:
   operation: 'CreateNotification'
   json: '{...JSON stringified data...}'
         ↓
7. POST to notifications.php
         ↓
8. Backend CreateNotification() executes
         ↓
9. SQL INSERT into notifications table
         ↓
10. Returns "Success"
         ↓
11. Console logs: "Notification sent successfully: Success"
         ↓
12. Notification appears in database
         ↓
13. Inventory Manager at requesting location sees notification bell update
```

---

## 🎯 Success Criteria:

After the fix, you should see:

1. ✅ Console log: "Notification sent successfully: Success"
2. ✅ New record in `notifications` table
3. ✅ Notification bell updates for target role at target location
4. ✅ Notification appears in dropdown with correct message
5. ✅ `target_role` matches request type (Inventory Manager or Sales Clerk)
6. ✅ `location_id` matches requesting location (not warehouse)

---

## 📋 Files Modified:

**`app/Contents/warehouse-contents/requestPage.js`**
- Updated `createNotification` function (lines 355-371)
- Changed from JSON object to FormData format
- Added better error logging

---

## 💡 Key Takeaway:

**Always match the backend's expected request format!**

Your PHP backend uses:
```php
$operation = $_POST['operation'];
$json = $_POST['json'];
```

So your frontend must send:
```javascript
const formData = new FormData();
formData.append('operation', 'CreateNotification');
formData.append('json', JSON.stringify(data));
```

**Not:**
```javascript
axios.post(url, { operation: '...', ...data })  // ❌ Won't work
```

---

## 🎉 Result:

Notifications now properly record in the database and appear for the target users! 🚀

