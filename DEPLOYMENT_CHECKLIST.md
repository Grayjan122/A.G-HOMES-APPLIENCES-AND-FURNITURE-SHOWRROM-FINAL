# ✅ Cloudinary Deployment Checklist

Use this checklist to ensure everything is set up correctly for both local development and production deployment.

---

## 📋 Pre-Deployment Checklist

### 1. Cloudinary Account Setup
- [ ] Created Cloudinary account at https://cloudinary.com
- [ ] Verified email address
- [ ] Accessed Cloudinary dashboard
- [ ] Copied Cloud Name
- [ ] Copied API Key
- [ ] Copied API Secret (clicked "Show" to reveal)

### 2. Local Development Setup
- [ ] Created `.env.local` file in project root
- [ ] Added `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` to `.env.local`
- [ ] Added `CLOUDINARY_API_KEY` to `.env.local`
- [ ] Added `CLOUDINARY_API_SECRET` to `.env.local`
- [ ] Added `CLOUDINARY_UPLOAD_FOLDER=ag-homes/products` to `.env.local`
- [ ] Saved `.env.local` file
- [ ] Verified `.env.local` is in `.gitignore` (it should be automatically ignored)

### 3. Local Testing
- [ ] Stopped dev server (if running)
- [ ] Restarted dev server: `npm run dev`
- [ ] Opened browser to localhost
- [ ] Navigated to Products page
- [ ] Clicked "ADD PRODUCT+"
- [ ] Filled in product details
- [ ] Selected an image file
- [ ] Image preview appeared
- [ ] Clicked "Save"
- [ ] No errors in browser console
- [ ] Product appeared in list with image
- [ ] Image URL starts with `https://res.cloudinary.com`
- [ ] Checked Cloudinary Media Library - image appears there
- [ ] Tested editing existing product with new image
- [ ] Verified old image is replaced

---

## 🚀 Vercel Deployment Checklist

### 1. Code Preparation
- [ ] All changes committed to git
- [ ] `.env.local` is NOT committed (verify with `git status`)
- [ ] Pushed to GitHub: `git push origin main`
- [ ] GitHub repository is up to date

### 2. Vercel Environment Variables
- [ ] Logged into Vercel dashboard
- [ ] Selected correct project
- [ ] Navigated to: Settings → Environment Variables
- [ ] Added `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`:
  - [ ] Name: `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
  - [ ] Value: (your cloud name)
  - [ ] Environment: ✅ Production ✅ Preview ✅ Development
  - [ ] Clicked "Save"
- [ ] Added `CLOUDINARY_API_KEY`:
  - [ ] Name: `CLOUDINARY_API_KEY`
  - [ ] Value: (your API key)
  - [ ] Environment: ✅ Production ✅ Preview ✅ Development
  - [ ] Clicked "Save"
- [ ] Added `CLOUDINARY_API_SECRET`:
  - [ ] Name: `CLOUDINARY_API_SECRET`
  - [ ] Value: (your API secret)
  - [ ] Environment: ✅ Production ✅ Preview ✅ Development
  - [ ] Clicked "Save"
- [ ] Added `CLOUDINARY_UPLOAD_FOLDER` (optional):
  - [ ] Name: `CLOUDINARY_UPLOAD_FOLDER`
  - [ ] Value: `ag-homes/products`
  - [ ] Environment: ✅ Production ✅ Preview ✅ Development
  - [ ] Clicked "Save"

### 3. Deployment
- [ ] Clicked "Deployments" tab
- [ ] Clicked "Redeploy" button (or triggered by git push)
- [ ] Waited for deployment to complete
- [ ] Deployment status: ✅ Ready
- [ ] No build errors
- [ ] Clicked "Visit" to open production site

### 4. Production Testing
- [ ] Opened production URL
- [ ] Logged in as admin
- [ ] Navigated to Products page
- [ ] Clicked "ADD PRODUCT+"
- [ ] Filled in product details
- [ ] Selected an image file
- [ ] Image preview appeared
- [ ] Clicked "Save"
- [ ] Checked browser console - no errors
- [ ] Product appeared in list with image
- [ ] Image loaded correctly
- [ ] Image URL starts with `https://res.cloudinary.com`
- [ ] Verified image in Cloudinary Media Library
- [ ] Tested on mobile device/responsive view
- [ ] Tested editing product with new image
- [ ] Tested viewing product details

---

## 🔍 Verification Checklist

### Browser Console Checks
- [ ] No "Cloudinary configuration missing" errors
- [ ] No CORS errors
- [ ] No 500 Internal Server errors
- [ ] No authentication errors
- [ ] Upload success messages appear

### Cloudinary Dashboard Checks
- [ ] Logged into Cloudinary dashboard
- [ ] Navigated to Media Library
- [ ] Folder `ag-homes/products` exists
- [ ] Images appear in the folder
- [ ] Image transformations are applied (optimized)
- [ ] Checked usage stats (should be minimal)

### Network Tab Checks (Browser DevTools)
- [ ] POST request to `/api/upload` returns 200 status
- [ ] Response contains `path` field with Cloudinary URL
- [ ] Response contains `cloudinaryData` object
- [ ] No failed requests

### Database Checks
- [ ] Product saved with Cloudinary URL
- [ ] URL format: `https://res.cloudinary.com/...`
- [ ] Old products with local paths still display (if applicable)
- [ ] New products use Cloudinary URLs

---

## 🐛 Troubleshooting Checklist

### If upload fails locally:

- [ ] Checked `.env.local` exists
- [ ] Verified all environment variables are set
- [ ] Verified no typos in environment variable names
- [ ] Verified Cloud Name is correct (no spaces)
- [ ] Verified API Key is correct (numbers only)
- [ ] Verified API Secret is correct (copied full secret)
- [ ] Restarted dev server after creating `.env.local`
- [ ] Checked browser console for specific error
- [ ] Checked terminal for server-side errors
- [ ] Tried with a different image file
- [ ] Verified image file size (< 10MB recommended)
- [ ] Verified image format (jpg, png, webp)

### If upload fails on Vercel:

- [ ] Verified environment variables are set in Vercel
- [ ] Verified environment variables have correct names (no typos)
- [ ] Verified all 3 environments are checked (Production, Preview, Development)
- [ ] Clicked "Redeploy" after adding environment variables
- [ ] Waited for deployment to complete
- [ ] Checked Vercel deployment logs for errors
- [ ] Checked browser console for specific errors
- [ ] Verified Cloudinary account is active
- [ ] Verified API credentials haven't expired
- [ ] Checked Cloudinary dashboard for usage limits

### If images don't display:

- [ ] Verified image URL in database
- [ ] Opened image URL directly in browser (should show image)
- [ ] Checked browser console for CORS errors
- [ ] Verified image exists in Cloudinary Media Library
- [ ] Checked network tab for failed image requests
- [ ] Verified image URL is HTTPS (not HTTP)
- [ ] Checked if image was deleted from Cloudinary
- [ ] Tried re-uploading the image

---

## 📊 Performance Checklist

- [ ] Images load quickly (CDN)
- [ ] Images are optimized (file size reduced)
- [ ] WebP format used for modern browsers
- [ ] Images scale properly on mobile
- [ ] No layout shift when images load
- [ ] Lazy loading works (if implemented)

---

## 🔐 Security Checklist

- [ ] `.env.local` is NOT committed to git
- [ ] API Secret is not visible in browser
- [ ] Environment variables are only in Vercel dashboard
- [ ] No credentials in client-side code
- [ ] Upload route uses server-side credentials only
- [ ] Cloudinary URLs are public (expected - images are meant to be visible)

---

## 📈 Monitoring Checklist

### Daily/Weekly Checks:
- [ ] Check Cloudinary usage dashboard
- [ ] Verify storage usage (under 25GB for free tier)
- [ ] Verify bandwidth usage (under 25GB/month for free tier)
- [ ] Verify transformations (under 25,000/month for free tier)
- [ ] Check for any failed uploads in logs
- [ ] Monitor upload speeds/performance

### Monthly Checks:
- [ ] Review Cloudinary billing/usage
- [ ] Archive or delete unused images
- [ ] Optimize upload settings if needed
- [ ] Update documentation if process changes

---

## ✅ Final Sign-Off

### Development Sign-Off:
- [ ] All local tests pass
- [ ] Code reviewed
- [ ] Documentation updated
- [ ] Ready for deployment

**Signed by**: _________________ **Date**: _________

### Production Sign-Off:
- [ ] Vercel deployment successful
- [ ] All production tests pass
- [ ] Images loading correctly
- [ ] No errors in production
- [ ] Stakeholders notified

**Signed by**: _________________ **Date**: _________

---

## 📞 Support Contacts

**Cloudinary Support**: https://support.cloudinary.com  
**Vercel Support**: https://vercel.com/support  
**Project Documentation**: See `CLOUDINARY_SETUP.md` and `QUICK_START.md`

---

## 🎉 Completion

Once all checkboxes are marked, your Cloudinary integration is complete and production-ready!

**Status**: 
- [ ] ✅ All checks passed - Ready for production
- [ ] ⚠️  Some checks failed - Review troubleshooting section
- [ ] ❌ Major issues - Contact development team

---

**Last Updated**: _________________ **Next Review**: _________________

