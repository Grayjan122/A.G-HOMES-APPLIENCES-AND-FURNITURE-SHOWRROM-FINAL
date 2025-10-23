# PowerShell script to create .env.local file
# Run this script to automatically create your .env.local file

$envContent = @"
# Cloudinary Configuration
# IMPORTANT: You still need to add your API Secret!
# Get it from: https://cloudinary.com/console
# Click "API Keys" → Click "Show" next to API Secret

NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dqxygi0yz
CLOUDINARY_API_KEY=137649583543222
CLOUDINARY_API_SECRET=your_api_secret_here
CLOUDINARY_UPLOAD_FOLDER=ag-homes/products
"@

# Create .env.local in the current directory
$envContent | Out-File -FilePath ".env.local" -Encoding UTF8 -NoNewline

Write-Host ""
Write-Host "✅ .env.local file created successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "⚠️  IMPORTANT: You still need to add your API Secret!" -ForegroundColor Yellow
Write-Host ""
Write-Host "Steps:" -ForegroundColor Cyan
Write-Host "1. Go to: https://cloudinary.com/console" -ForegroundColor White
Write-Host "2. Find 'API Secret' section" -ForegroundColor White
Write-Host "3. Click 'Show' to reveal your API Secret" -ForegroundColor White
Write-Host "4. Copy the API Secret" -ForegroundColor White
Write-Host "5. Open .env.local file" -ForegroundColor White
Write-Host "6. Replace 'your_api_secret_here' with your actual API Secret" -ForegroundColor White
Write-Host "7. Save the file" -ForegroundColor White
Write-Host "8. Restart your dev server: npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "Current values:" -ForegroundColor Cyan
Write-Host "  Cloud Name: dqxygi0yz ✅" -ForegroundColor Green
Write-Host "  API Key: 137649583543222 ✅" -ForegroundColor Green
Write-Host "  API Secret: ❌ NEEDS TO BE ADDED" -ForegroundColor Red
Write-Host ""

