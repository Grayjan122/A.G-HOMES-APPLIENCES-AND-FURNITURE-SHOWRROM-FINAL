# ✅ REQUEST ACCEPTANCE NOTIFICATIONS

## 📋 Overview:
When a Warehouse Representative accepts a request (stock or customize), a notification is automatically sent to the location that made the request, targeting the specific role.

---

## 🎯 Notification Flow:

### **Stock Request Acceptance:**
```
Warehouse accepts stock request
         ↓
Notification sent to: Requesting Location
         ↓
Target Role: Inventory Manager
         ↓
Message: "Your stock request #[ID] from [Location] has been approved and is ready for delivery."
```

### **Customize Request Acceptance:**
```
Warehouse accepts customize request
         ↓
Notification sent to: Requesting Location
         ↓
Target Role: Sales Clerk
         ↓
Message: "Your customize request #[ID] from [Location] has been approved and is ready for delivery."
```

---

## 🔧 Implementation Details:

### **1. New Function: `createNotification`**

**Location:** `requestPage.js` lines 355-368

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

**Purpose:** Sends notification data to the backend API.

---

### **2. Stock Request Approval Notification**

**Location:** `requestPage.js` lines 421-431

**When:** After successfully approving a stock request

**Notification Details:**
```javascript
{
    type: 'stock_request',
    title: 'Stock Request Approved',
    message: 'Your stock request #[ID] from [Location] has been approved and is ready for delivery.',
    locationId: reqFromId,          // Requesting location
    targetRole: 'Inventory Manager', // Target role
    productId: null,
    customerId: null,
    referenceId: s_reqID            // Stock request ID
}
```

**Example:**
- Stock Request #1234 from "Store A" approved
- Notification sent to: Store A
- Target Role: Inventory Manager
- Message: "Your stock request #1234 from Store A has been approved and is ready for delivery."

---

### **3. Customize Request Approval Notification**

**Location:** `requestPage.js` lines 558-568

**When:** After successfully approving a customize request

**Notification Details:**
```javascript
{
    type: 'customize_request',
    title: 'Customize Request Approved',
    message: 'Your customize request #[ID] from [Location] has been approved and is ready for delivery.',
    locationId: c_reqFromId,        // Requesting location
    targetRole: 'Sales Clerk',       // Target role
    productId: null,
    customerId: null,
    referenceId: c_reqID             // Customize request ID
}
```

**Example:**
- Customize Request #567 from "Store B" approved
- Notification sent to: Store B
- Target Role: Sales Clerk
- Message: "Your customize request #567 from Store B has been approved and is ready for delivery."

---

## 📊 Notification Data Structure:

### **Parameters:**

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `type` | string | Type of notification | `'stock_request'` or `'customize_request'` |
| `title` | string | Notification title | `'Stock Request Approved'` |
| `message` | string | Detailed message | `'Your stock request #1234...'` |
| `locationId` | number | Target location ID | `3` |
| `targetRole` | string | Specific role to notify | `'Inventory Manager'` or `'Sales Clerk'` |
| `productId` | null | Not used for this type | `null` |
| `customerId` | null | Not used for this type | `null` |
| `referenceId` | number | Request ID for reference | `1234` |

---

## 🎭 Role-Based Targeting:

### **Stock Requests:**
- **Initiated by:** Inventory Manager
- **Approved by:** Warehouse Representative
- **Notification goes to:** Inventory Manager at requesting location

### **Customize Requests:**
- **Initiated by:** Sales Clerk
- **Approved by:** Warehouse Representative
- **Notification goes to:** Sales Clerk at requesting location

---

## 🔄 Complete Workflow:

### **Stock Request Scenario:**

1. **Inventory Manager at Store A** sends stock request to Warehouse
2. **Warehouse Representative** views pending requests
3. **Warehouse Representative** clicks "Accept" on request #1234
4. Backend processes the request
5. ✅ Request marked as "Approved"
6. 📝 Activity log: "Accept the request #1234"
7. 🔔 **Notification created:**
   - Sent to: Store A
   - Target: Inventory Manager role
   - Message: "Your stock request #1234 from Store A has been approved and is ready for delivery."
8. **Inventory Manager at Store A** sees notification bell update
9. Opens notification dropdown
10. Reads: "Stock Request Approved"

### **Customize Request Scenario:**

1. **Sales Clerk at Store B** creates customize request
2. **Warehouse Representative** views pending customize requests
3. **Warehouse Representative** clicks "Accept Request" on customize #567
4. Backend processes the request
5. ✅ Request marked as "Approved"
6. 📝 Activity log: "Accept the customize request #567"
7. 🔔 **Notification created:**
   - Sent to: Store B
   - Target: Sales Clerk role
   - Message: "Your customize request #567 from Store B has been approved and is ready for delivery."
8. **Sales Clerk at Store B** sees notification bell update
9. Opens notification dropdown
10. Reads: "Customize Request Approved"

---

## 🔍 How Recipients See Notifications:

### **In the Notification Bell:**

```
🔔 (2)  ← Badge shows unread count

Notification Dropdown:
┌─────────────────────────────────────────┐
│ 🔔 Notifications                    ✓   │
├─────────────────────────────────────────┤
│ Stock Request Approved             NEW  │
│ Your stock request #1234 from Store A   │
│ has been approved and is ready for...   │
│ 2 minutes ago                            │
├─────────────────────────────────────────┤
│ Customize Request Approved         NEW  │
│ Your customize request #567 from...     │
│ 5 minutes ago                            │
└─────────────────────────────────────────┘
```

---

## 📍 Location and Role Mapping:

### **Request Variables:**

**Stock Request:**
- `reqFromId` - Location ID that sent the request (requesting location)
- `reqToId` - Warehouse location ID (current user's location)
- `s_reqFrom` - Requesting location name (e.g., "Store A")

**Customize Request:**
- `c_reqFromId` - Location ID that sent the request (requesting location)
- `c_reqToId` - Warehouse location ID (current user's location)
- `c_reqFrom` - Requesting location name (e.g., "Store B")

---

## 🧪 Testing:

### **Test Stock Request Notification:**

1. Log in as **Inventory Manager** at Store A
2. Send a stock request to Warehouse
3. Log in as **Warehouse Representative** at Warehouse
4. Go to "All Requests" page
5. Click on the stock request from Store A
6. Click "Accept" button
7. ✅ Success message appears
8. Log in as **Inventory Manager** at Store A again
9. Check notification bell (should show new notification)
10. Click bell and verify message:
    - Title: "Stock Request Approved"
    - Message contains request ID and location

### **Test Customize Request Notification:**

1. Log in as **Sales Clerk** at Store B
2. Create a customize request
3. Log in as **Warehouse Representative** at Warehouse
4. Go to "All Requests" page
5. Click on the customize request from Store B
6. Click "Accept Request" button
7. ✅ Success message appears
8. Log in as **Sales Clerk** at Store B again
9. Check notification bell (should show new notification)
10. Click bell and verify message:
    - Title: "Customize Request Approved"
    - Message contains request ID and location

---

## 🚨 Troubleshooting:

### **Notification not appearing:**

1. **Check Backend API:**
   - Ensure `notifications.php` is working
   - Check `CreateNotification` operation exists

2. **Check Database:**
   ```sql
   SELECT * FROM notifications 
   WHERE type IN ('stock_request', 'customize_request')
   ORDER BY notification_id DESC 
   LIMIT 5;
   ```

3. **Check Browser Console:**
   - Should see: "Notification sent successfully"
   - Or error message if failed

4. **Check Role Matching:**
   - Notification targets specific roles
   - User must have role "Inventory Manager" or "Sales Clerk"
   - Check `target_role` column in database

5. **Check Location Matching:**
   - Notification sent to requesting location
   - User must be at that location
   - Check `location_id` in database

---

## 📝 Files Modified:

### **1. `app/Contents/warehouse-contents/requestPage.js`**

**Changes:**
- ✅ Added `createNotification` function (lines 355-368)
- ✅ Updated `ApproveStockRequest` to send notification (lines 421-431)
- ✅ Updated `ApproveCustomizeRequest` to send notification (lines 558-568)

**Lines of code added:** ~35 lines

---

## 🎯 Summary:

### **What happens when accepting requests:**

1. ✅ Request is approved in database
2. ✅ Activity is logged
3. ✅ Success message shown to approver
4. ✅ **Notification sent to requester:**
   - Stock Request → Inventory Manager at requesting location
   - Customize Request → Sales Clerk at requesting location
5. ✅ Notification appears in bell icon
6. ✅ Requester can see approval status immediately

**Benefits:**
- 🚀 Real-time communication
- 🎯 Role-specific targeting
- 📍 Location-aware notifications
- 💬 Clear, informative messages
- ⚡ Instant feedback loop

**The notification system now provides complete transparency in the request approval workflow!** 🎉

