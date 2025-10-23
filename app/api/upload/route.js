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
    // Validate Cloudinary configuration
    if (!cloudinaryConfig.cloud_name || !cloudinaryConfig.api_key || !cloudinaryConfig.api_secret) {
      console.error('Cloudinary configuration missing. Please set environment variables.');
      return NextResponse.json({ 
        error: 'Cloudinary configuration missing. Please contact administrator.' 
      }, { status: 500 });
    }

    const formData = await request.formData();
    const file = formData.get('image');

    if (!file) {
      return NextResponse.json({ error: 'No file received' }, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

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
    console.error('Upload error:', error);
    return NextResponse.json({ 
      error: 'Upload failed: ' + (error.message || 'Unknown error') 
    }, { status: 500 });
  }
}