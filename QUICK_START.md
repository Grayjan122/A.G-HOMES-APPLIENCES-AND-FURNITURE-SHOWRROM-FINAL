# 🚀 Quick Start - Cloudinary Setup

## For Local Development (3 Minutes Setup)

### 1️⃣ Get Cloudinary Credentials (FREE)
1. Go to: https://cloudinary.com/users/register_free
2. Sign up (no credit card needed)
3. Copy your credentials from the dashboard

### 2️⃣ Create `.env.local` File
In your project root, create a file named `.env.local` and paste:

```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=paste_your_cloud_name
CLOUDINARY_API_KEY=paste_your_api_key
CLOUDINARY_API_SECRET=paste_your_api_secret
CLOUDINARY_UPLOAD_FOLDER=ag-homes/products
```

### 3️⃣ Restart Your Dev Server
```bash
npm run dev
```

### 4️⃣ Test Upload
- Go to Products page
- Add a new product with an image
- ✅ Done! Image is now stored in Cloudinary

---

## For Vercel Deployment

### 1️⃣ Add Environment Variables in Vercel
1. Open your Vercel project dashboard
2. Go to: **Settings** → **Environment Variables**
3. Add these 3 variables:
   - `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
   
4. Select: **Production**, **Preview**, and **Development**
5. Click **Save**

### 2️⃣ Redeploy
```bash
git push origin main
```

Or click **Redeploy** in Vercel dashboard.

### 3️⃣ Test in Production
✅ Upload now works on Vercel!

---

## ⚡ What Changed?

### Before (Local Storage - ❌ Doesn't work on Vercel):
```
/public/uploads/products/product_123.jpg
```

### After (Cloudinary - ✅ Works everywhere):
```
https://res.cloudinary.com/your-cloud/image/upload/v123/ag-homes/products/product_123.jpg
```

---

## 🎯 Benefits

✅ Works on Vercel (serverless)  
✅ Images stored in the cloud (CDN)  
✅ Auto-optimization (smaller file sizes)  
✅ Responsive images (WebP for modern browsers)  
✅ No server storage needed  
✅ FREE tier: 25GB storage + bandwidth  

---

## 📱 Test Checklist

- [ ] Created `.env.local` with Cloudinary credentials
- [ ] Restarted dev server (`npm run dev`)
- [ ] Can add product with image locally
- [ ] Image appears in product list
- [ ] Image URL starts with `https://res.cloudinary.com`
- [ ] Added environment variables in Vercel
- [ ] Redeployed to Vercel
- [ ] Can upload images in production

---

## 🆘 Need Help?

**Error: "Cloudinary configuration missing"**  
→ Check `.env.local` file exists and has correct values

**Error: "Invalid credentials"**  
→ Double-check API Key and Secret from Cloudinary dashboard

**Images not loading**  
→ Check browser console, verify Cloudinary URL is valid

**Still stuck?**  
→ Check `CLOUDINARY_SETUP.md` for detailed instructions

---

**Ready to go! 🎉**

