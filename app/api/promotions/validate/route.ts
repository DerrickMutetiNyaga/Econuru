import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Promotion from '@/lib/models/Promotion';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    
    if (!code) {
      return NextResponse.json({ 
        success: false, 
        error: 'Promo code is required' 
      }, { status: 400 });
    }

    // Find active promotion
    const now = new Date();
    const promotion = await Promotion.findOne({
      promoCode: { $regex: new RegExp(`^${code.trim()}$`, 'i') },
      status: 'active',
      startDate: { $lte: now },
      endDate: { $gte: now }
    });

    if (!promotion) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid or expired promo code' 
      }, { status: 404 });
    }

    // Check if usage limit is exceeded
    if (promotion.usageLimit && promotion.usageCount >= promotion.usageLimit) {
      return NextResponse.json({ 
        success: false, 
        error: 'Promo code usage limit exceeded' 
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      promotion: {
        _id: promotion._id,
        promoCode: promotion.promoCode,
        discount: promotion.discount,
        discountType: promotion.discountType,
        minOrderAmount: promotion.minOrderAmount,
        maxDiscount: promotion.maxDiscount,
        description: promotion.description
      }
    });

  } catch (error) {
    console.error('Promo code validation error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
} 