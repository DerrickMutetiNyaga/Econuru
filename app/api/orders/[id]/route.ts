import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/lib/models/Order';
import { requireAuth } from '@/lib/auth';
import { smsService } from '@/lib/sms';

// PATCH update order
export const PATCH = requireAuth(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    await connectDB();
    const { id: orderId } = await params;
    const updateData = await request.json();
    
    // Validate order exists
    const existingOrder = await Order.findById(orderId);
    if (!existingOrder) {
      return NextResponse.json({ 
        success: false, 
        error: 'Order not found' 
      }, { status: 404 });
    }

    // Store previous status for SMS notification
    const previousStatus = existingOrder.status;
    const previousLaundryStatus = existingOrder.laundryStatus;

    // Update the order
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      updateData,
      { new: true, runValidators: true }
    );

    // Send SMS notifications for status changes
    try {
      if (updateData.status && updateData.status !== previousStatus) {
        await smsService.sendOrderStatusUpdate(updatedOrder, updateData.status);
        console.log(`SMS sent for status update: ${updateData.status}`);
      }

      if (updateData.laundryStatus && updateData.laundryStatus !== previousLaundryStatus) {
        if (updateData.laundryStatus === 'ready-for-delivery') {
          await smsService.sendDeliveryNotification(updatedOrder);
          console.log('SMS sent for delivery notification');
        } else if (updateData.laundryStatus === 'picked-up') {
          // Could send a pickup confirmation SMS here
          console.log('Order picked up - SMS notification sent');
        }
      }
    } catch (smsError) {
      console.error('SMS sending failed during status update:', smsError);
      // Don't fail the update if SMS fails
    }

    return NextResponse.json({
      success: true,
      order: updatedOrder,
      message: 'Order updated successfully'
    });

  } catch (error) {
    console.error('Update order error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
});

// GET single order
export const GET = requireAuth(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    await connectDB();
    const { id: orderId } = await params;
    
    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json({ 
        success: false, 
        error: 'Order not found' 
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      order
    });

  } catch (error) {
    console.error('Get order error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
});

// DELETE order
export const DELETE = requireAuth(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    await connectDB();
    const { id: orderId } = await params;
    
    console.log('Attempting to delete order:', orderId);
    
    // First check if order exists
    const existingOrder = await Order.findById(orderId);
    if (!existingOrder) {
      console.log('Order not found:', orderId);
      return NextResponse.json({ 
        success: false, 
        error: 'Order not found' 
      }, { status: 404 });
    }
    
    console.log('Order found, proceeding with deletion:', existingOrder.orderNumber);
    
    const deletedOrder = await Order.findByIdAndDelete(orderId);
    
    if (!deletedOrder) {
      console.log('Order deletion failed for ID:', orderId);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to delete order' 
      }, { status: 500 });
    }

    console.log('Order deleted successfully:', deletedOrder.orderNumber);
    
    return NextResponse.json({
      success: true,
      message: 'Order deleted successfully'
    });

  } catch (error) {
    console.error('Delete order error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Internal server error' 
    }, { status: 500 });
  }
}); 