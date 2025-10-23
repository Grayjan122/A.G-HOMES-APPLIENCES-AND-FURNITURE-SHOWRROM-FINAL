// Cloudinary Configuration
// IMPORTANT: Set these environment variables in your Vercel dashboard:
// - NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
// - CLOUDINARY_API_KEY
// - CLOUDINARY_API_SECRET

export const cloudinaryConfig = {
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  upload_folder: process.env.CLOUDINARY_UPLOAD_FOLDER || 'ag-homes/products'
};

