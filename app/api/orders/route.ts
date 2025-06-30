import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/lib/models/Order';
import { requireAuth } from '@/lib/auth';
import { smsService } from '@/lib/sms';
import Promotion from '@/lib/models/Promotion';

// GET all orders
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const orders = await Order.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error('Get orders error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST create new order
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const orderData = await request.json();
    
    // Validate required fields
    if (!orderData.customer?.name || !orderData.customer?.phone || !orderData.services || orderData.services.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Customer name, phone, and at least one service are required' 
      }, { status: 400 });
    }

    // Promo code logic
    let promoCode = orderData.promoCode?.trim();
    let promoDiscount = 0;
    if (promoCode) {
      // Find active promotion
      const now = new Date();
      const promo = await Promotion.findOne({
        promoCode: { $regex: new RegExp(`^${promoCode}$`, 'i') },
        status: 'active',
        startDate: { $lte: now },
        endDate: { $gte: now }
      });
      
      if (promo) {
        // Check if usage limit is exceeded
        if (promo.usageLimit && promo.usageCount >= promo.usageLimit) {
          // Usage limit exceeded
          promoCode = undefined;
          promoDiscount = 0;
        } else {
          // Calculate discount
          const orderTotal = orderData.totalAmount || 0;
          if (orderTotal >= promo.minOrderAmount) {
            if (promo.discountType === 'percentage') {
              promoDiscount = Math.round((orderTotal * promo.discount) / 100);
              if (promo.maxDiscount && promoDiscount > promo.maxDiscount) {
                promoDiscount = promo.maxDiscount;
              }
            } else if (promo.discountType === 'fixed') {
              promoDiscount = promo.discount;
              if (promo.maxDiscount && promoDiscount > promo.maxDiscount) {
                promoDiscount = promo.maxDiscount;
              }
            }
          }
          // Increment usageCount and update updatedAt
          promo.usageCount = (promo.usageCount || 0) + 1;
          promo.updatedAt = new Date();
          await promo.save();
        }
      } else {
        // Invalid or expired promo
        promoCode = undefined;
        promoDiscount = 0;
      }
    }

    // Create new order
    const order = new Order({
      customer: {
        name: orderData.customer.name,
        phone: orderData.customer.phone,
        email: orderData.customer.email || '',
        address: orderData.customer.address || '',
      },
      services: orderData.services.map((service: any) => ({
        serviceId: service.serviceId,
        serviceName: service.serviceName,
        quantity: service.quantity,
        price: service.price,
      })),
      pickupDate: orderData.pickupDate || '',
      pickupTime: orderData.pickupTime || '',
      notes: orderData.notes || '',
      location: orderData.location || 'main-branch',
      totalAmount: orderData.totalAmount || 0,
      pickDropAmount: orderData.pickDropAmount || 0,
      discount: orderData.discount || 0,
      paymentStatus: orderData.paymentStatus || 'unpaid',
      laundryStatus: orderData.laundryStatus || 'to-be-picked',
      status: orderData.status || 'pending',
      orderNumber: generateOrderNumber(),
      promoCode: promoCode || '',
      promoDiscount: promoDiscount || 0,
    });

    await order.save();

    // Send SMS confirmation
    try {
      const smsResponse = await smsService.sendBookingConfirmation(order);
      console.log('SMS sent successfully:', smsResponse);
      
      // Update order with SMS transaction ID
      order.smsTransactionId = smsResponse.transactionId;
      await order.save();
    } catch (smsError) {
      console.error('SMS sending failed:', smsError);
      // Don't fail the order creation if SMS fails
    }

    return NextResponse.json({
      success: true,
      order,
      message: 'Order created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

// Generate unique order number
function generateOrderNumber(): string {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `ORD-${timestamp}-${random}`;
} 