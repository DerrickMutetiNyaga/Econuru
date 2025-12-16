import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Service from '@/lib/models/Service';
import { requireAdmin } from '@/lib/auth';

// GET all services
export async function GET(request: NextRequest) {
  try {
    console.log('🚀 Services API: Starting...');
    const startTime = Date.now();
    
    await connectDB();
    const connectTime = Date.now() - startTime;
    console.log(`⚡ Services API: DB connected in ${connectTime}ms`);
    
    const queryStart = Date.now();
    const services = await Service.find({}).sort({ createdAt: -1 }).lean();
    const queryTime = Date.now() - queryStart;
    
    console.log(`✅ Services API: Found ${services.length} services in ${queryTime}ms (Total: ${Date.now() - startTime}ms)`);
    console.log(`📊 Active services: ${services.filter((s: any) => s.active !== false).length}`);
    
    return NextResponse.json({
      success: true,
      services,
    });
  } catch (error: any) {
    console.error('❌ Get services error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Internal server error',
        message: 'Failed to fetch services'
      },
      { status: 500 }
    );
  }
}

// POST create new service
export const POST = requireAdmin(async (request: NextRequest) => {
  try {
    await connectDB();
    
    const { name, description, category, price, turnaround, features, image, featured = false } = await request.json();

    if (!name || !description || !category || !price || !turnaround) {
      return NextResponse.json(
        { error: 'Name, description, category, price, and turnaround are required' },
        { status: 400 }
      );
    }

    // Create new service
    const service = new Service({
      name,
      description,
      category,
      price,
      turnaround,
      features: features || [],
      image: image || '/placeholder.svg',
      featured,
      active: true,
    });

    await service.save();

    return NextResponse.json({
      success: true,
      service,
      message: 'Service created successfully',
    }, { status: 201 });

  } catch (error) {
    console.error('Create service error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}); 