╔════════════════════════════════════════════════════════════════╗
║         BACKEND API FILES FOR E-COMMERCE SHOP                  ║
╚════════════════════════════════════════════════════════════════╝

📁 FILES IN THIS FOLDER:
────────────────────────────────────────────────────────────────

1. customer.php
   → Copy this to: C:\xampp\htdocs\capstone-api\api\customer.php

2. inventory_update_code.php
   → Contains code to add to your existing inventory.php

3. INVENTORY_PHP_UPDATE.txt
   → Instructions for updating inventory.php

4. COPY_INSTRUCTIONS.md
   → Detailed copy instructions

5. COPY_TO_XAMPP.bat
   → Automated copy script (USE THIS!)

6. README.txt
   → This file

════════════════════════════════════════════════════════════════

⚡ QUICK START (EASIEST METHOD):
────────────────────────────────────────────────────────────────

METHOD 1 - Automatic (Recommended):
1. Double-click: COPY_TO_XAMPP.bat
2. The script will copy customer.php automatically
3. Follow the on-screen instructions

METHOD 2 - Manual:
1. Copy customer.php to C:\xampp\htdocs\capstone-api\api\
2. Open C:\xampp\htdocs\capstone-api\api\inventory.php
3. Add the code from INVENTORY_PHP_UPDATE.txt

════════════════════════════════════════════════════════════════

📋 DETAILED INSTRUCTIONS:
────────────────────────────────────────────────────────────────

STEP 1: Copy customer.php
   From: C:\Users\USER\capstone2\backend-api-files\customer.php
   To:   C:\xampp\htdocs\capstone-api\api\customer.php

STEP 2: Update inventory.php
   File: C:\xampp\htdocs\capstone-api\api\inventory.php
   Add:  Function and case from INVENTORY_PHP_UPDATE.txt

STEP 3: Run database setup
   File: C:\Users\USER\capstone2\customer_database_setup.sql
   Run in: phpMyAdmin or MySQL Workbench

STEP 4: Test
   Visit: http://localhost:3000/shop

════════════════════════════════════════════════════════════════

✅ VERIFICATION:
────────────────────────────────────────────────────────────────

After copying, verify these files exist:

C:\xampp\htdocs\capstone-api\api\
  ✓ connection.php (existing)
  ✓ customer.php (NEW)
  ✓ inventory.php (UPDATED)
  ✓ products.php (existing)
  ✓ category.php (existing)
  ✓ location.php (existing)

════════════════════════════════════════════════════════════════

🧪 TEST THE API:
────────────────────────────────────────────────────────────────

Test customer.php:
http://localhost/capstone-api/api/customer.php

Expected response:
{"success":false,"message":"Invalid operation"}

This is GOOD! It means the file works.

════════════════════════════════════════════════════════════════

🎯 WHAT THESE FILES DO:
────────────────────────────────────────────────────────────────

customer.php:
  • CustomerLogin - Authenticate customers
  • CustomerSignup - Create new accounts
  • GetCustomerById - Get customer details
  • UpdateCustomer - Update customer info

inventory.php (update):
  • GetProductInventoryByLocation - Show stock at all locations

════════════════════════════════════════════════════════════════

Need help? See COPY_INSTRUCTIONS.md for detailed steps!

════════════════════════════════════════════════════════════════

