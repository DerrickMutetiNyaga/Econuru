import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Banner from '@/lib/models/Banner';
import { requireAdmin } from '@/lib/auth';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// GET all banners
export const GET = async (request: NextRequest) => {
  try {
    console.log('🎯 Banner API: Starting fetch...');
    const startTime = Date.now();
    
    await connectDB();
    console.log(`🔗 Banner API: DB connected in ${Date.now() - startTime}ms`);
    
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') === 'true';
    
    let query = {};
    let projection = {};
    
    if (activeOnly) {
      query = { isActive: true };
      // Only fetch essential fields for homepage
      projection = {
        title: 1,
        subtitle: 1,
        description: 1,
        bannerImage: 1,
        linkUrl: 1,
        position: 1,
        button1: 1,
        button2: 1,
        badges: 1,
        reviewSnippet: 1,
        _id: 1
      };
    }
    
    const queryStart = Date.now();
    const banners = await Banner.find(query, projection)
      .sort({ position: 1, createdAt: -1 })
      .limit(activeOnly ? 10 : undefined) // Limit active banners for homepage
      .lean(); // Use lean() for better performance
    
    console.log(`📊 Banner API: Query executed in ${Date.now() - queryStart}ms`);
    console.log(`✅ Banner API: Total time ${Date.now() - startTime}ms, found ${banners.length} banners`);
    
    // Add cache headers for faster loading
    const response = NextResponse.json({ success: true, banners });
    if (activeOnly) {
      response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    }
    
    return response;
  } catch (error) {
    console.error('❌ Banner API Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch banners' },
      { status: 500 }
    );
  }
};

// POST create new banner
export const POST = requireAdmin(async (request: NextRequest) => {
  try {
    await connectDB();
    
    const formData = await request.formData();
    
    const title = formData.get('title') as string;
    const subtitle = formData.get('subtitle') as string;
    const description = formData.get('description') as string;
    const linkUrl = formData.get('linkUrl') as string;
    const isActive = formData.get('isActive') === 'true';
    const position = parseInt(formData.get('position') as string) || 0;
    const startDate = formData.get('startDate') as string;
    const endDate = formData.get('endDate') as string;
    
    const bannerFile = formData.get('bannerImage') as File | null;
    let bannerImageUrl = formData.get('bannerImageUrl') as string | undefined;
    
    // New fields for full hero/slider management
    let button1, button2, badges, reviewSnippet;
    try {
      button1 = formData.get('button1') ? JSON.parse(formData.get('button1') as string) : undefined;
      button2 = formData.get('button2') ? JSON.parse(formData.get('button2') as string) : undefined;
      badges = formData.get('badges') ? JSON.parse(formData.get('badges') as string) : undefined;
      reviewSnippet = formData.get('reviewSnippet') ? JSON.parse(formData.get('reviewSnippet') as string) : undefined;
    } catch (e) {
      return NextResponse.json(
        { success: false, message: 'Invalid JSON in one of the hero fields' },
        { status: 400 }
      );
    }
    
    // Upload image to Cloudinary if provided
    if (bannerFile && bannerFile.size > 0) {
      const arrayBuffer = await bannerFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      const uploadRes = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream({ folder: 'banners' }, (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }).end(buffer);
      });
      
      bannerImageUrl = (uploadRes as any).secure_url;
    }
    
    if (!bannerImageUrl) {
      return NextResponse.json(
        { success: false, message: 'Banner image is required' },
        { status: 400 }
      );
    }
    
    const banner = await Banner.create({
      title,
      subtitle,
      description,
      bannerImage: bannerImageUrl,
      linkUrl,
      isActive,
      position,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      button1,
      button2,
      badges,
      reviewSnippet,
    });
    
    return NextResponse.json({ success: true, banner });
  } catch (error) {
    console.error('Error creating banner:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create banner' },
      { status: 500 }
    );
  }
});
