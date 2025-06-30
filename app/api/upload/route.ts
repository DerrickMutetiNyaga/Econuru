import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { requireAdmin } from '@/lib/auth';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Maximum file size (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export const POST = requireAdmin(async (request: NextRequest) => {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Only image files are allowed' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size must be less than ${MAX_FILE_SIZE / (1024 * 1024)}MB` },
        { status: 400 }
      );
    }

    console.log(`Uploading file: ${file.name}, size: ${file.size} bytes, type: ${file.type}`);

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64String = `data:${file.type};base64,${buffer.toString('base64')}`;

    // Upload to Cloudinary with timeout and better error handling
    const result = await cloudinary.uploader.upload(base64String, {
      folder: 'ecolaundryservices',
      resource_type: 'auto',
      timeout: 60000, // 60 second timeout
      chunk_size: 6000000, // 6MB chunks for large files
    });

    console.log(`Upload successful: ${result.secure_url}`);

    return NextResponse.json({
      success: true,
      url: result.secure_url,
      public_id: result.public_id,
    });

  } catch (error: any) {
    console.error('Upload error:', error);
    
    // Handle specific Cloudinary errors
    if (error.error && error.error.http_code === 499) {
      return NextResponse.json(
        { error: 'Upload timeout. Please try again with a smaller image or check your internet connection.' },
        { status: 408 }
      );
    }
    
    if (error.error && error.error.http_code === 400) {
      return NextResponse.json(
        { error: 'Invalid file format or corrupted image.' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Upload failed. Please try again.' },
      { status: 500 }
    );
  }
}); 