# 🖼️ Cloudinary Image Upload - Deployment Fix

## ❌ Problem:
Image upload works locally but fails when deployed to hosting (Vercel/Netlify).

## 🔍 Root Cause:
Environment variables (`.env.local`) are NOT deployed. Your hosting platform doesn't have Cloudinary credentials.

---

## ✅ Solution: Set Environment Variables in Hosting Platform

### **For Vercel:**

#### **Step 1: Go to Vercel Dashboard**
1. Open [vercel.com](https://vercel.com)
2. Select your project
3. Click **"Settings"** tab
4. Click **"Environment Variables"** in left sidebar

#### **Step 2: Add These Variables**

Add **4 environment variables** (one by one):

| Variable Name | Value | Environment |
|---------------|-------|-------------|
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | `dqxygi0yz` | Production, Preview, Development |
| `CLOUDINARY_API_KEY` | `137649583543222` | Production, Preview, Development |
| `CLOUDINARY_API_SECRET` | `O0S20-3RGJjtq_Gv4kvmmXeYPvQ` | Production, Preview, Development |
| `CLOUDINARY_UPLOAD_FOLDER` | `ag-homes/products` | Production, Preview, Development |

**How to add:**
1. Click **"Add New"** button
2. Enter **Name** (e.g., `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`)
3. Enter **Value** (e.g., `dqxygi0yz`)
4. Select **all environments** (Production, Preview, Development)
5. Click **"Save"**
6. Repeat for all 4 variables

#### **Step 3: Redeploy**
After adding all variables:
1. Go to **"Deployments"** tab
2. Click **"..."** menu on latest deployment
3. Click **"Redeploy"**
4. Wait ~2-3 minutes

---

### **For Netlify:**

#### **Step 1: Go to Netlify Dashboard**
1. Open [netlify.com](https://www.netlify.com)
2. Select your project
3. Click **"Site settings"**
4. Click **"Environment variables"** in left sidebar

#### **Step 2: Add These Variables**

Click **"Add a variable"** and add these 4 variables:

```
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME = dqxygi0yz
CLOUDINARY_API_KEY = 137649583543222
CLOUDINARY_API_SECRET = O0S20-3RGJjtq_Gv4kvmmXeYPvQ
CLOUDINARY_UPLOAD_FOLDER = ag-homes/products
```

#### **Step 3: Redeploy**
1. Go to **"Deploys"** tab
2. Click **"Trigger deploy"** → **"Clear cache and deploy site"**
3. Wait for deployment to complete

---

## 🧪 Testing After Deployment

### **Test 1: Check Environment Variables**

Add this test endpoint temporarily:

**Create: `app/api/test-env/route.js`**
```javascript
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ? '✅ Set' : '❌ Missing',
    api_key: process.env.CLOUDINARY_API_KEY ? '✅ Set' : '❌ Missing',
    api_secret: process.env.CLOUDINARY_API_SECRET ? '✅ Set' : '❌ Missing',
    folder: process.env.CLOUDINARY_UPLOAD_FOLDER || 'ag-homes/products'
  });
}
```

**Test:**
Open: `https://your-site.vercel.app/api/test-env`

**Expected:** All should say `✅ Set`

**Delete this file after testing!**

---

### **Test 2: Try Uploading Image**

1. Go to your deployed site
2. Try to add a product with an image
3. **If it works:** 🎉 Success!
4. **If it fails:** Check browser console (F12) and share the error

---

## 🔧 Enhanced Error Handling

I've improved your upload route with better error messages. The updated code will:
- ✅ Show detailed error messages
- ✅ Log configuration status
- ✅ Help debug issues

---

## 🚨 Common Issues & Solutions

### **Issue 1: "Cloudinary configuration missing"**

**Cause:** Environment variables not set in hosting

**Solution:**
- Double-check you added ALL 4 variables
- Make sure you selected "Production" environment
- Redeploy after adding variables

### **Issue 2: "Invalid API credentials"**

**Cause:** Wrong API key or secret

**Solution:**
- Verify credentials in Vercel dashboard
- Check for extra spaces or characters
- Get fresh credentials from [Cloudinary Dashboard](https://console.cloudinary.com)

### **Issue 3: "Upload timeout"**

**Cause:** Network issue or large file

**Solution:**
- Check file size (should be < 10MB)
- Try with smaller image first
- Check Cloudinary quota (free plan has limits)

### **Issue 4: Still fails after setting env vars**

**Cause:** Deployment cached old build

**Solution:**
- In Vercel: "Clear cache and redeploy"
- In Netlify: "Clear cache and deploy site"

---

## 📊 Verify Cloudinary Account

1. **Login to Cloudinary:**
   - Go to [console.cloudinary.com](https://console.cloudinary.com)
   - Login with your account

2. **Check Dashboard:**
   - Verify **Cloud name:** `dqxygi0yz`
   - Check **Usage:** Make sure you haven't exceeded limits
   - Free plan: 25 credits/month, ~25K transformations

3. **Get Fresh Credentials (if needed):**
   - Go to **Dashboard** → **API Keys**
   - Copy **Cloud name**, **API Key**, **API Secret**
   - Update in Vercel if different

---

## 🔐 Security Note

⚠️ **NEVER commit `.env.local` to git!**

Make sure `.env.local` is in your `.gitignore`:

```
# .gitignore
.env.local
.env*.local
```

API secrets should ONLY be:
- ✅ In `.env.local` (local development)
- ✅ In Vercel/Netlify environment variables (production)
- ❌ NEVER in git repository
- ❌ NEVER hardcoded in code

---

## ✅ Deployment Checklist

- [ ] Added `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` to Vercel/Netlify
- [ ] Added `CLOUDINARY_API_KEY` to Vercel/Netlify
- [ ] Added `CLOUDINARY_API_SECRET` to Vercel/Netlify
- [ ] Added `CLOUDINARY_UPLOAD_FOLDER` to Vercel/Netlify
- [ ] Selected **all environments** (Production, Preview, Development)
- [ ] Clicked **"Save"** for each variable
- [ ] Redeployed the site (clear cache)
- [ ] Waited for deployment to complete (~2-3 min)
- [ ] Tested image upload on deployed site

---

## 📱 Step-by-Step Screenshots Guide

### **Vercel - Adding Environment Variable:**

1. **Navigate:**
   ```
   Vercel Dashboard → Your Project → Settings → Environment Variables
   ```

2. **Click:** "Add New" button

3. **Fill in:**
   - Name: `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
   - Value: `dqxygi0yz`
   - ✅ Check: Production
   - ✅ Check: Preview
   - ✅ Check: Development

4. **Click:** "Save"

5. **Repeat** for other 3 variables

6. **Redeploy:**
   - Deployments tab → "..." → "Redeploy"

---

## 🆘 Still Not Working?

**Share these details:**

1. **Hosting Platform:** Vercel or Netlify?
2. **Environment Variables:** Screenshot of your env vars in dashboard (hide the values)
3. **Error Message:** What error appears in browser console when uploading?
4. **Network Tab:** Screenshot of the failed upload request (F12 → Network)
5. **Test Endpoint Result:** What does `/api/test-env` return?

---

## 🎯 Quick Fix Checklist

If upload fails after setting env vars:

1. ✅ Clear browser cache (Ctrl + Shift + Del)
2. ✅ Clear Vercel deployment cache (Redeploy with clear cache)
3. ✅ Verify ALL 4 env vars are set
4. ✅ Check env vars have correct values (no extra spaces)
5. ✅ Wait 2-3 minutes for deployment to complete
6. ✅ Try with a fresh browser tab (incognito mode)

---

**The most common fix: Just set the environment variables in Vercel/Netlify and redeploy!** 🚀

