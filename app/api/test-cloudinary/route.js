import { NextResponse } from 'next/server';
import { cloudinaryConfig } from '@/app/config/cloudinary';

/**
 * Test endpoint to verify Cloudinary configuration
 * Visit: /api/test-cloudinary
 * 
 * ⚠️ DELETE THIS FILE AFTER TESTING! It exposes configuration status.
 */
export async function GET() {
  return NextResponse.json({
    message: 'Cloudinary Configuration Status',
    environment: process.env.NODE_ENV || 'development',
    config: {
      cloud_name: cloudinaryConfig.cloud_name ? '✅ Set: ' + cloudinaryConfig.cloud_name : '❌ Missing',
      api_key: cloudinaryConfig.api_key ? '✅ Set (hidden for security)' : '❌ Missing',
      api_secret: cloudinaryConfig.api_secret ? '✅ Set (hidden for security)' : '❌ Missing',
      upload_folder: cloudinaryConfig.upload_folder || 'ag-homes/products'
    },
    envVars: {
      NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ? '✅ Set' : '❌ Missing',
      CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY ? '✅ Set' : '❌ Missing',
      CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET ? '✅ Set' : '❌ Missing',
      CLOUDINARY_UPLOAD_FOLDER: process.env.CLOUDINARY_UPLOAD_FOLDER || 'ag-homes/products (default)'
    },
    ready: !!(cloudinaryConfig.cloud_name && cloudinaryConfig.api_key && cloudinaryConfig.api_secret),
    instructions: 'If any variables show ❌ Missing, add them to your Vercel/Netlify environment variables and redeploy.'
  });
}

