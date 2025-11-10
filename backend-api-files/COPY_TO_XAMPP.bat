@echo off
echo ============================================================
echo  COPYING BACKEND FILES TO XAMPP
echo ============================================================
echo.

REM Check if XAMPP directory exists
if not exist "C:\xampp\htdocs\capstone-api\api\" (
    echo ERROR: XAMPP API directory not found!
    echo Expected: C:\xampp\htdocs\capstone-api\api\
    echo.
    echo Please make sure:
    echo 1. XAMPP is installed
    echo 2. The path is correct
    pause
    exit /b 1
)

echo Copying customer.php to XAMPP API directory...
copy /Y "customer.php" "C:\xampp\htdocs\capstone-api\api\customer.php"

if %errorlevel% equ 0 (
    echo [SUCCESS] customer.php copied successfully!
) else (
    echo [ERROR] Failed to copy customer.php
    pause
    exit /b 1
)

echo.
echo ============================================================
echo  COPY COMPLETE!
echo ============================================================
echo.
echo Files copied to: C:\xampp\htdocs\capstone-api\api\
echo.
echo NEXT STEPS:
echo 1. Update inventory.php manually (see INVENTORY_PHP_UPDATE.txt)
echo 2. Run customer_database_setup.sql in your database
echo 3. Test the shop at: http://localhost:3000/shop
echo.
echo ============================================================
pause

