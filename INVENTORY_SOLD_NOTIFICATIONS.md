# Inventory Manager Sales Notifications

## Overview
Inventory Managers now receive real-time notifications when products are sold through the POS system, allowing them to track inventory movement and plan restocking accordingly.

## Implementation

### Feature Details
When a Sales Clerk processes a sale (either full payment or installment), the Inventory Manager at that location receives a notification containing:

1. **Product Names** - All products sold in the transaction
2. **Quantities** - The quantity of each product sold
3. **Customer Name** - Who purchased the products
4. **Invoice Number** - For reference and tracking
5. **Location** - Where the sale occurred

### Technical Implementation

#### Location: `app/Contents/saleClearkContents/posSC.js`

#### 1. Full Payment Sales (Lines 739-770)
```javascript
// Send notification to Inventory Manager about products sold
try {
  const notificationUrl = baseURL + 'notifications.php';
  
  // Create a detailed message with all products sold
  const productDetails = cart.map(item => 
    `${item.product_name} (Qty: ${item.quantity})`
  ).join(', ');
  
  const notificationData = {
    type: 'inventory_sold',
    title: 'Products Sold',
    message: `Products sold at ${locName}. Invoice #${response.data}. Customer: ${selectedCustomer.cust_name}. Items: ${productDetails}`,
    locationId: locId,
    targetRole: 'Inventory Manager',
    productId: cart[0]?.product_id || null,
    customerId: selectedCustomer.cust_id,
    referenceId: response.data
  };

  await axios.get(notificationUrl, {
    params: {
      json: JSON.stringify(notificationData),
      operation: "CreateNotification"
    }
  });
} catch (notificationError) {
  console.error("Error sending inventory notification:", notificationError);
  // Don't block the sale if notification fails
}
```

#### 2. Installment Sales (Lines 877-908)
```javascript
// Send notification to Inventory Manager about products sold
try {
  const notificationUrl = baseURL + 'notifications.php';
  
  // Create a detailed message with all products sold
  const productDetails = cart.map(item => 
    `${item.product_name} (Qty: ${item.quantity})`
  ).join(', ');
  
  const notificationData = {
    type: 'inventory_sold',
    title: 'Products Sold (Installment)',
    message: `Products sold via installment at ${locName}. Invoice #${response.data}. Customer: ${selectedCustomer.cust_name}. Items: ${productDetails}`,
    locationId: locId,
    targetRole: 'Inventory Manager',
    productId: cart[0]?.product_id || null,
    customerId: selectedCustomer.cust_id,
    referenceId: response.data
  };

  await axios.get(notificationUrl, {
    params: {
      json: JSON.stringify(notificationData),
      operation: "CreateNotification"
    }
  });
} catch (notificationError) {
  console.error("Error sending inventory notification:", notificationError);
  // Don't block the sale if notification fails
}
```

## Notification Structure

### Notification Data Object
```javascript
{
  type: 'inventory_sold',                    // Type identifier for filtering
  title: 'Products Sold',                    // Notification title
  message: 'Full details of the sale',       // Detailed message with products
  locationId: locId,                         // Location where sale occurred
  targetRole: 'Inventory Manager',           // Who should receive this
  productId: cart[0]?.product_id || null,   // First product ID as reference
  customerId: selectedCustomer.cust_id,      // Customer who made the purchase
  referenceId: response.data                 // Invoice number
}
```

## Notification Message Format

### Full Payment Notification
```
Products sold at [Location Name]. 
Invoice #[Invoice Number]. 
Customer: [Customer Name]. 
Items: [Product 1 (Qty: X), Product 2 (Qty: Y), ...]
```

### Installment Payment Notification
```
Products sold via installment at [Location Name]. 
Invoice #[Invoice Number]. 
Customer: [Customer Name]. 
Items: [Product 1 (Qty: X), Product 2 (Qty: Y), ...]
```

## Example Notifications

### Single Product Sale
```
Title: Products Sold
Message: Products sold at Agora Showroom Main. Invoice #12345. Customer: John Doe. Items: Office Chair (Qty: 2)
```

### Multiple Products Sale
```
Title: Products Sold
Message: Products sold at Agora Showroom Main. Invoice #12346. Customer: Jane Smith. Items: Office Desk (Qty: 1), Office Chair (Qty: 4), Filing Cabinet (Qty: 2)
```

### Installment Sale
```
Title: Products Sold (Installment)
Message: Products sold via installment at Agora Showroom Main. Invoice #12347. Customer: Bob Johnson. Items: Executive Desk Set (Qty: 1)
```

## Error Handling
- If notification sending fails, it's logged to console but doesn't block the sale
- Sale processing continues regardless of notification status
- Error is caught and logged for debugging purposes

## Benefits

### For Inventory Managers
1. **Real-time Awareness** - Know immediately when products are sold
2. **Inventory Tracking** - Better visibility of stock movement
3. **Restocking Planning** - Can plan replenishment based on sales patterns
4. **Customer Insights** - Know what products are popular and who's buying

### For the Business
1. **Better Communication** - Improved coordination between sales and inventory teams
2. **Inventory Management** - Proactive stock management
3. **Customer Service** - Better ability to track orders and commitments
4. **Audit Trail** - Clear record of all sales and inventory changes

## Backend Requirements
The notification system uses the existing `notifications.php` endpoint with the `CreateNotification` operation. Ensure:
1. The endpoint handles `inventory_sold` notification type
2. Notifications are properly routed to users with `Inventory Manager` role
3. Notifications are stored in the database for history
4. The notification appears in the Inventory Manager's notification panel

## Testing Checklist
- ✅ Process a full payment sale with single product
- ✅ Process a full payment sale with multiple products
- ✅ Process an installment sale
- ✅ Verify notification appears for Inventory Manager
- ✅ Verify notification includes all product details
- ✅ Verify notification includes customer name
- ✅ Verify notification includes invoice number
- ✅ Verify sale completes even if notification fails

## Future Enhancements
1. Add notification preferences (enable/disable for specific product types)
2. Include low stock warnings in notifications
3. Add daily/weekly sales summaries
4. Include profit margins in notifications
5. Add filtering by product category

