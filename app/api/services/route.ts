import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Service from '@/lib/models/Service';
import { requireAdmin } from '@/lib/auth';

// GET all services
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const services = await Service.find({}).sort({ createdAt: -1 });
    
    return NextResponse.json({
      success: true,
      services,
    });
  } catch (error) {
    console.error('Get services error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
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