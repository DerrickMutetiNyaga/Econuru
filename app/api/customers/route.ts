import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Customer from '@/lib/models/Customer';
import { requireAdmin } from '@/lib/auth';

export async function GET() {
  try {
    await dbConnect();
    const customers = await Customer.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, customers });
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch customers' },
      { status: 500 }
    );
  }
}

export const POST = requireAdmin(async (req: NextRequest) => {
  try {
    await dbConnect();
    const body = await req.json();
    
    // Check for existing customer with same phone or email
    const existingCustomer = await Customer.findOne({
      $or: [
        { phone: body.phone },
        ...(body.email ? [{ email: body.email }] : [])
      ]
    });

    if (existingCustomer) {
      return NextResponse.json(
        { success: false, message: 'Customer with this phone number or email already exists' },
        { status: 400 }
      );
    }

    const customer = await Customer.create({
      name: body.name,
      phone: body.phone,
      email: body.email,
      address: body.address,
      status: 'active',
      preferences: [],
    });

    return NextResponse.json({ success: true, customer });
  } catch (error: any) {
    console.error('Error creating customer:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to create customer' },
      { status: 500 }
    );
  }
}); 