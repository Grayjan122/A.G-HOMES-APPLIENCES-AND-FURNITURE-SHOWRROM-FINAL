# 🔧 Debug: Can't Purchase Installment Customize

## Quick Diagnostic

### Step 1: What's the exact error?

When you try to make an installment customize purchase, what happens?

**Check these:**

1. **Open browser console (F12)**
   - Press F12
   - Go to Console tab
   - Try to complete purchase
   - What error appears?

2. **Check Network tab (F12)**
   - Go to Network tab
   - Try to complete purchase
   - Look for request to `sales.php`
   - Click on it → Response tab
   - What does it say?

---

## Common Issues & Solutions

### Issue 1: "Failed to process the sale" or No Response

**Cause:** Backend operation might not exist or has error

**Solution:** Check if `CustomizeinstallmentPlan` operation exists in your `sales.php` file

**File location:** `C:\xampp\htdocs\capstone-api\api\sales.php`

**Look for:**
```php
case 'CustomizeinstallmentPlan':
    echo $user->CustomizeInstallmentSales($json, $salesDetails, $dateDue);
    break;
```

**If not found**, add it to your switch statement!

---

### Issue 2: "Please select a customer"

**Cause:** No customer selected

**Solution:** Make sure you select a customer before clicking "Complete Purchase"

---

### Issue 3: "Please add items to cart"

**Cause:** Empty cart

**Solution:** Add customization items to cart first

---

### Issue 4: Nothing happens when clicking "Complete Purchase"

**Cause:** JavaScript error or validation failing

**Solution:** 
1. Check browser console (F12)
2. Look for any red errors
3. Check if calculateRemainingBalance() is negative

---

### Issue 5: "Remaining balance is negative"

**Cause:** Downpayment is too high

**Solution:** Adjust your downpayment amount to be less than or equal to total

---

## Quick Test Checklist

```
□ Customer is selected
□ Cart has items
□ Installment plan is selected
□ Downpayment is valid
□ XAMPP Apache is running
□ XAMPP MySQL is running
□ Browser console shows no errors
□ Network request to sales.php is successful
```

---

## What Information I Need

To help you fix this, please tell me:

1. **What exact error message appears?**
   (from browser console or alert)

2. **What's in the Network response?**
   - F12 → Network tab
   - Find the sales.php request
   - What's in the Response tab?

3. **Does the "Full Payment" customize work?**
   (to see if it's specifically an installment issue)

4. **Console output:**
   Look for these console.log statements in customize.js:
   ```
   console.log(installmentDetails1);
   console.log(list1);
   ```
   What do they show?

---

## Backend Check

**Open:** `C:\xampp\htdocs\capstone-api\api\sales.php`

**Search for:** `CustomizeinstallmentPlan`

**Should find:** A case in the switch statement like:
```php
case 'CustomizeinstallmentPlan':
    echo $user->CustomizeInstallmentSales($json, $salesDetails, $dateDue);
    break;
```

**If missing:** The operation handler needs to be added

**Also check:** Function `CustomizeInstallmentSales` exists in the User class

---

## Test the Backend Directly

Create a test file: `test_customize_installment.html`

```html
<!DOCTYPE html>
<html>
<head>
    <title>Test Customize Installment</title>
</head>
<body>
    <h1>Test Customize Installment Purchase</h1>
    <button onclick="test()">Test</button>
    <div id="result"></div>

    <script>
    async function test() {
        const baseURL = 'http://localhost/capstone-api/api/';
        
        const testData = {
            origPrice: 10000,
            downPayment: 2000,
            downPercentage: 20,
            remainingBal: 8000,
            interestRate: 0,
            interestAmount: 0,
            totalSales: 10000,
            installmentPlan: 3,
            monthlyPayment: 2666.67,
            totalPayment: 8000,
            balance: 8000,
            custID: 1,  // Use a real customer ID
            locID: 1,   // Use a real location ID
            accID: 1    // Use a real account ID
        };
        
        const salesDetails = [
            {
                product_id: 1,
                product_name: "Test Product",
                price: 10000,
                quantity: 1,
                customizationType: "full",
                modifications: "Test modifications"
            }
        ];
        
        const dateDue = [
            { paymentNumber: 1, paymentDate: "2025-11-27", amountDue: 2666.67 },
            { paymentNumber: 2, paymentDate: "2025-12-27", amountDue: 2666.67 },
            { paymentNumber: 3, paymentDate: "2026-01-27", amountDue: 2666.67 }
        ];
        
        const url = `${baseURL}sales.php`;
        
        try {
            const response = await fetch(url + '?' + new URLSearchParams({
                operation: 'CustomizeinstallmentPlan',
                json: JSON.stringify(testData),
                salesDetails: JSON.stringify(salesDetails),
                dateDue: JSON.stringify(dateDue)
            }));
            
            const text = await response.text();
            console.log('Response:', text);
            
            document.getElementById('result').innerHTML = `
                <h3>Response:</h3>
                <pre>${text}</pre>
            `;
        } catch (error) {
            console.error('Error:', error);
            document.getElementById('result').innerHTML = `
                <h3>Error:</h3>
                <p>${error.message}</p>
            `;
        }
    }
    </script>
</body>
</html>
```

**Open this file in browser and click Test**

**Expected:** Should return an invoice number

**If error:** Copy the exact error message

---

## Next Steps

**Please provide:**

1. Exact error message from browser console
2. Network response from sales.php request
3. Whether full payment customize works
4. Any PHP errors from Apache error log (`C:\xampp\apache\logs\error.log`)

Once I know the exact error, I can give you the specific fix! 🔧

