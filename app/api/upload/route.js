import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { cloudinaryConfig } from '@/app/config/cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: cloudinaryConfig.cloud_name,
  api_key: cloudinaryConfig.api_key,
  api_secret: cloudinaryConfig.api_secret,
});

export async function POST(request) {
  try {
    // Log configuration status (without exposing secrets)
    console.log('Cloudinary Config Check:', {
      cloud_name: cloudinaryConfig.cloud_name ? '✅ Set' : '❌ Missing',
      api_key: cloudinaryConfig.api_key ? '✅ Set' : '❌ Missing',
      api_secret: cloudinaryConfig.api_secret ? '✅ Set' : '❌ Missing',
      upload_folder: cloudinaryConfig.upload_folder || 'ag-homes/products'
    });

    // Validate Cloudinary configuration
    if (!cloudinaryConfig.cloud_name || !cloudinaryConfig.api_key || !cloudinaryConfig.api_secret) {
      console.error('❌ Cloudinary configuration missing!');
      console.error('Missing:', {
        cloud_name: !cloudinaryConfig.cloud_name,
        api_key: !cloudinaryConfig.api_key,
        api_secret: !cloudinaryConfig.api_secret
      });
      return NextResponse.json({ 
        error: 'Cloudinary configuration missing. Please set environment variables in your hosting platform (Vercel/Netlify). Required: NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET',
        details: {
          cloud_name: cloudinaryConfig.cloud_name ? 'Set' : 'Missing',
          api_key: cloudinaryConfig.api_key ? 'Set' : 'Missing',
          api_secret: cloudinaryConfig.api_secret ? 'Set' : 'Missing'
        }
      }, { status: 500 });
    }

    console.log('✅ Cloudinary configuration validated');

    const formData = await request.formData();
    const file = formData.get('image');

    if (!file) {
      console.error('❌ No file received in request');
      return NextResponse.json({ error: 'No file received' }, { status: 400 });
    }

    console.log('📦 File received:', {
      name: file.name,
      type: file.type,
      size: `${(file.size / 1024 / 1024).toFixed(2)} MB`
    });

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    console.log('🔄 Starting Cloudinary upload...');

    // Upload to Cloudinary using promise wrapper
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: cloudinaryConfig.upload_folder,
          resource_type: 'image',
          public_id: `product_${Date.now()}`,
          overwrite: true,
          transformation: [
            { width: 1000, height: 1000, crop: 'limit' }, // Limit max dimensions
            { quality: 'auto' }, // Auto quality
            { fetch_format: 'auto' } // Auto format (webp for supported browsers)
          ]
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            reject(error);
          } else {
            resolve(result);
          }
        }
      );

      uploadStream.end(buffer);
    });

    console.log('✅ Upload successful!', {
      publicId: uploadResult.public_id,
      url: uploadResult.secure_url,
      size: `${uploadResult.width}x${uploadResult.height}`,
      format: uploadResult.format
    });

    return NextResponse.json({ 
      message: 'File uploaded successfully to Cloudinary',
      fileName: uploadResult.public_id,
      path: uploadResult.secure_url,
      cloudinaryData: {
        publicId: uploadResult.public_id,
        width: uploadResult.width,
        height: uploadResult.height,
        format: uploadResult.format
      }
    });
  } catch (error) {
    console.error('❌ Upload error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    // Provide helpful error messages
    let errorMessage = 'Upload failed: ' + (error.message || 'Unknown error');
    
    if (error.message?.includes('Invalid API')) {
      errorMessage = 'Invalid Cloudinary credentials. Please check your API key and secret.';
    } else if (error.message?.includes('timeout')) {
      errorMessage = 'Upload timeout. Please try with a smaller image or check your internet connection.';
    } else if (error.message?.includes('quota')) {
      errorMessage = 'Cloudinary quota exceeded. Please check your Cloudinary account limits.';
    }
    
    return NextResponse.json({ 
      error: errorMessage,
      details: error.message
    }, { status: 500 });
  }
}