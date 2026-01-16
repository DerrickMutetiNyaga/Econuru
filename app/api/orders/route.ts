import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/lib/models/Order';
import Customer from '@/lib/models/Customer';
import { requireAuth } from '@/lib/auth';
import { smsService } from '@/lib/sms';
import Promotion from '@/lib/models/Promotion';
import { applyLockedInPromotion, updatePromotionStatuses } from '@/lib/promotion-utils';

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

    // Handle promotion logic - support both locked-in and regular promotions
    let promoCode = orderData.promoCode?.trim();
    let promoDiscount = 0;
    let promotionDetails = orderData.promotionDetails || null;
    
    // Auto-update promotion statuses first
    await updatePromotionStatuses();
    
    if (promotionDetails && promotionDetails.lockedIn) {
      // Use locked-in promotion (honors promotion even if expired/limit reached)
      console.log(`🔒 Processing locked-in promotion: ${promotionDetails.promoCode}`);
      const result = await applyLockedInPromotion(promotionDetails);
      
      if (result.success) {
        promoCode = result.promoCode;
        promoDiscount = result.promoDiscount;
        console.log(`✅ Applied locked-in promotion: ${promoCode} - Discount: Ksh ${promoDiscount}`);
      } else {
        console.warn(`⚠️ Failed to apply locked-in promotion: ${result.error}`);
        // Keep the locked-in details for future reference but don't apply discount
        promoCode = promotionDetails.promoCode;
        promoDiscount = 0;
      }
    } else if (promoCode) {
      // Regular promotion validation (for backwards compatibility)
      console.log(`🔍 Processing regular promotion: ${promoCode}`);
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
          console.warn(`⚠️ Promotion ${promoCode} usage limit exceeded`);
          promoCode = undefined;
          promoDiscount = 0;
          promotionDetails = null;
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
          console.log(`✅ Applied regular promotion: ${promoCode} - Usage: ${promo.usageCount}/${promo.usageLimit}`);
        }
      } else {
        console.warn(`⚠️ Invalid or expired promo: ${promoCode}`);
        promoCode = undefined;
        promoDiscount = 0;
        promotionDetails = null;
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
      promotionDetails: promotionDetails || undefined,
    });

    await order.save();

    // Create or update customer automatically
    try {
      // Normalize phone number - try to find customer with any format
      const phoneInput = orderData.customer.phone.trim();
      const normalizedPhone = phoneInput.replace(/\D/g, "");
      
      // Try multiple phone formats
      let phoneVariants = [phoneInput];
      if (normalizedPhone.startsWith("254") && normalizedPhone.length === 12) {
        phoneVariants.push("0" + normalizedPhone.substring(3));
      } else if (normalizedPhone.startsWith("0") && normalizedPhone.length === 10) {
        phoneVariants.push("254" + normalizedPhone.substring(1));
      }
      phoneVariants.push(normalizedPhone);

      // Try to find customer with any phone format
      let customer = await Customer.findOne({
        $or: phoneVariants.map(p => ({ phone: p }))
      });
      
      if (customer) {
        // Update existing customer
        customer.totalOrders = (customer.totalOrders || 0) + 1;
        customer.totalSpent = (customer.totalSpent || 0) + (order.totalAmount || 0);
        customer.lastOrder = new Date();
        // Update customer details if provided and different
        if (orderData.customer.name && orderData.customer.name !== customer.name) {
          customer.name = orderData.customer.name;
        }
        if (orderData.customer.email && orderData.customer.email !== customer.email) {
          customer.email = orderData.customer.email;
        }
        if (orderData.customer.address && orderData.customer.address !== customer.address) {
          customer.address = orderData.customer.address;
        }
        await customer.save();
        console.log(`✅ Updated existing customer: ${customer.name} (${customer.phone})`);
      } else {
        // Create new customer - normalize phone to 0 format for consistency
        const phoneToStore = normalizedPhone.startsWith("254") && normalizedPhone.length === 12
          ? "0" + normalizedPhone.substring(3)
          : normalizedPhone.startsWith("0")
          ? normalizedPhone
          : "0" + normalizedPhone;
        
        customer = await Customer.create({
          name: orderData.customer.name,
          phone: phoneToStore,
          email: orderData.customer.email || '',
          address: orderData.customer.address || '',
          totalOrders: 1,
          totalSpent: order.totalAmount || 0,
          lastOrder: new Date(),
          status: 'active',
          preferences: [],
        });
        console.log(`✅ Created new customer: ${customer.name} (${customer.phone})`);
      }
    } catch (customerError: any) {
      // Don't fail order creation if customer creation/update fails
      console.error('Error creating/updating customer:', customerError);
      // If it's a duplicate key error, try to find and update existing customer
      if (customerError.code === 11000) {
        try {
          const phoneInput = orderData.customer.phone.trim();
          const normalizedPhone = phoneInput.replace(/\D/g, "");
          let phoneVariants = [phoneInput];
          if (normalizedPhone.startsWith("254") && normalizedPhone.length === 12) {
            phoneVariants.push("0" + normalizedPhone.substring(3));
          } else if (normalizedPhone.startsWith("0") && normalizedPhone.length === 10) {
            phoneVariants.push("254" + normalizedPhone.substring(1));
          }
          phoneVariants.push(normalizedPhone);
          
          const existingCustomer = await Customer.findOne({
            $or: phoneVariants.map(p => ({ phone: p }))
          });
          if (existingCustomer) {
            existingCustomer.totalOrders = (existingCustomer.totalOrders || 0) + 1;
            existingCustomer.totalSpent = (existingCustomer.totalSpent || 0) + (order.totalAmount || 0);
            existingCustomer.lastOrder = new Date();
            await existingCustomer.save();
            console.log(`✅ Updated existing customer after duplicate error: ${existingCustomer.name}`);
          }
        } catch (updateError) {
          console.error('Error updating customer after duplicate error:', updateError);
        }
      }
    }

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

    // Send admin notification SMS
    try {
      await smsService.sendAdminNewOrderNotification(order);
      console.log('Admin SMS sent successfully');
    } catch (adminSmsError) {
      console.error('Admin SMS sending failed:', adminSmsError);
      // Don't fail the order creation if admin SMS fails
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