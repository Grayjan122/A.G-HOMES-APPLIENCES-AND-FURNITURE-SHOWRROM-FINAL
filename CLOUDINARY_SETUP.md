# Cloudinary Setup Instructions

## 🎯 Overview
This project now uses **Cloudinary** for image uploads instead of local filesystem storage. This ensures images work properly on **Vercel** and other serverless hosting platforms.

---

## 📝 Step 1: Create a Cloudinary Account

1. Go to [https://cloudinary.com](https://cloudinary.com)
2. Sign up for a **FREE account** (no credit card required)
3. After signing up, you'll be redirected to your dashboard

---

## 🔑 Step 2: Get Your Cloudinary Credentials

From your Cloudinary Dashboard ([https://cloudinary.com/console](https://cloudinary.com/console)), you'll find:

- **Cloud Name**: e.g., `dxyz123abc`
- **API Key**: e.g., `123456789012345`
- **API Secret**: e.g., `abcdefghijklmnopqrstuvwxyz123`

**⚠️ IMPORTANT**: Keep your API Secret private! Never commit it to GitHub.

---

## 🛠️ Step 3: Configure Environment Variables

### For Local Development:

1. Create a file named `.env.local` in your project root (if it doesn't exist)
2. Add the following variables:

```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
CLOUDINARY_UPLOAD_FOLDER=ag-homes/products
```

3. Replace `your_cloud_name_here`, `your_api_key_here`, and `your_api_secret_here` with your actual credentials from Step 2.

### For Vercel Deployment:

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variables:

| Name | Value | Environment |
|------|-------|-------------|
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | your_cloud_name | Production, Preview, Development |
| `CLOUDINARY_API_KEY` | your_api_key | Production, Preview, Development |
| `CLOUDINARY_API_SECRET` | your_api_secret | Production, Preview, Development |
| `CLOUDINARY_UPLOAD_FOLDER` | ag-homes/products | Production, Preview, Development |

4. Click **Save**
5. **Redeploy** your application for changes to take effect

---

## ✅ Step 4: Test the Upload

1. Run your application locally:
   ```bash
   npm run dev
   ```

2. Navigate to the Products page
3. Try adding a new product with an image
4. The image should upload to Cloudinary successfully
5. Check your Cloudinary Media Library to see the uploaded image

---

## 📂 Where Are Images Stored?

- **Cloudinary**: All product images are stored in the cloud at:
  - Folder: `ag-homes/products/`
  - URLs look like: `https://res.cloudinary.com/YOUR_CLOUD_NAME/image/upload/v1234567890/ag-homes/products/product_1234567890.jpg`

---

## 🎨 Image Optimization Features

The upload automatically applies these optimizations:

✅ **Maximum dimensions**: 1000x1000px (maintains aspect ratio)  
✅ **Auto quality**: Cloudinary automatically optimizes quality  
✅ **Auto format**: Serves WebP for modern browsers, fallback for older ones  
✅ **Responsive**: Images are served at optimal sizes

---

## 🔒 Security Notes

- ✅ `.env.local` is already in `.gitignore` (won't be committed to GitHub)
- ✅ API Secret is only used server-side (never exposed to browser)
- ✅ Only image files are allowed for upload
- ✅ Public IDs are timestamped to prevent collisions

---

## 🐛 Troubleshooting

### Error: "Cloudinary configuration missing"
**Solution**: Make sure all environment variables are set correctly in `.env.local` (local) or Vercel dashboard (production).

### Error: "Upload failed: Invalid credentials"
**Solution**: Double-check your API Key and API Secret from Cloudinary dashboard.

### Images not showing after upload
**Solution**: 
1. Check browser console for errors
2. Verify the image URL starts with `https://res.cloudinary.com`
3. Check Cloudinary Media Library to confirm upload succeeded

### Old local images not working
**Solution**: Old images stored in `/public/uploads/` won't work on Vercel. You'll need to re-upload them through the product edit interface.

---

## 📊 Cloudinary Free Tier Limits

- ✅ **25 GB** storage
- ✅ **25 GB** monthly bandwidth
- ✅ **25,000** transformations/month
- ✅ Unlimited images

This is more than enough for most small-to-medium projects!

---

## 🔄 Migration from Local Storage

If you have existing products with local images:

1. Edit each product in the admin panel
2. Re-upload the product image
3. Save the product
4. The new Cloudinary URL will replace the old local path

---

## 📚 Additional Resources

- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Next.js + Cloudinary Guide](https://cloudinary.com/documentation/next_integration)
- [Image Transformation Reference](https://cloudinary.com/documentation/image_transformations)

---

## ✨ Benefits of Using Cloudinary

✅ Works on Vercel and all serverless platforms  
✅ Automatic image optimization  
✅ CDN delivery (faster loading worldwide)  
✅ Responsive image serving  
✅ No server storage needed  
✅ Easy to scale  

---

**Need help?** Contact your development team or check the Cloudinary documentation.

