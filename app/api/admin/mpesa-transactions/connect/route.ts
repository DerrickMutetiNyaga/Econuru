import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/lib/models/Order';
import MpesaTransaction from '@/lib/models/MpesaTransaction';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || (decoded.role !== 'admin' && decoded.role !== 'superadmin')) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { transactionId, orderId } = await request.json();

    if (!transactionId || !orderId) {
      return NextResponse.json({ 
        error: 'Transaction ID and Order ID are required' 
      }, { status: 400 });
    }

    await connectDB();

    // Find the M-Pesa transaction
    const transaction = await MpesaTransaction.findOne({ 
      transactionId: transactionId,
      isConnectedToOrder: false 
    });

    if (!transaction) {
      return NextResponse.json({ 
        error: 'Transaction not found or already connected' 
      }, { status: 404 });
    }

    // Find the order
    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json({ 
        error: 'Order not found' 
      }, { status: 404 });
    }

    // Check if order is already paid
    if (order.paymentStatus === 'paid') {
      return NextResponse.json({ 
        error: 'Order is already marked as paid' 
      }, { status: 400 });
    }

    // Get current remaining balance or use total amount
    const currentRemainingBalance = order.remainingBalance || order.totalAmount;
    const amountPaid = transaction.amountPaid || 0;
    
    // Calculate new remaining balance
    const newRemainingBalance = Math.max(0, currentRemainingBalance - amountPaid);
    const isExactPayment = newRemainingBalance === 0;
    const isPartialPayment = newRemainingBalance > 0;
    const isOverPayment = amountPaid > currentRemainingBalance;
    
    // Determine payment status
    const paymentStatus = isExactPayment ? 'paid' : 'partial';

    // Determine payment method based on transaction type
    const paymentMethod = transaction.transactionType === 'STK_PUSH' ? 'mpesa_stk' : 'mpesa_c2b';

    // Create payment record for partial payments array
    const paymentRecord = {
      amount: amountPaid,
      date: new Date(),
      mpesaReceiptNumber: transaction.mpesaReceiptNumber,
      phoneNumber: transaction.phoneNumber,
      method: paymentMethod
    };

    // Update the order with payment details
    await Order.findByIdAndUpdate(orderId, {
      paymentStatus: paymentStatus,
      paymentMethod: paymentMethod,
      remainingBalance: newRemainingBalance,
      $push: {
        partialPayments: paymentRecord
      },
      $set: {
        'c2bPayment': {
          transactionId: transaction.transactionId,
          mpesaReceiptNumber: transaction.mpesaReceiptNumber,
          transactionDate: transaction.transactionDate,
          phoneNumber: transaction.phoneNumber,
          amountPaid: transaction.amountPaid,
          transactionType: transaction.transactionType,
          billRefNumber: transaction.billRefNumber,
          thirdPartyTransID: transaction.thirdPartyTransID,
          orgAccountBalance: transaction.orgAccountBalance,
          customerName: transaction.customerName,
          paymentCompletedAt: transaction.paymentCompletedAt
        }
      }
    });

    // Update the transaction as connected
    await MpesaTransaction.findByIdAndUpdate(transaction._id, {
      isConnectedToOrder: true,
      connectedOrderId: orderId,
      connectedAt: new Date(),
      connectedBy: decoded.email || decoded.name || 'admin',
      notes: `${transaction.notes} Connected to order ${order.orderNumber} by admin.`
    });

    const logMessage = isExactPayment 
      ? `🔗✅ FULL payment transaction ${transactionId} connected to order ${order.orderNumber} by ${decoded.email} (KES ${amountPaid})`
      : isOverPayment
      ? `🔗💰 OVERPAYMENT transaction ${transactionId} connected to order ${order.orderNumber} by ${decoded.email} (KES ${amountPaid} for remaining KES ${currentRemainingBalance})`
      : `🔗⚠️ PARTIAL payment transaction ${transactionId} connected to order ${order.orderNumber} by ${decoded.email} (KES ${amountPaid}, remaining: KES ${newRemainingBalance})`;
    
    console.log(logMessage);

    const successMessage = isExactPayment
      ? `Transaction ${transactionId} successfully connected to order ${order.orderNumber} - Order fully paid`
      : isOverPayment
      ? `Transaction ${transactionId} connected as overpayment (KES ${amountPaid} for remaining KES ${currentRemainingBalance}) to order ${order.orderNumber}`
      : `Transaction ${transactionId} connected as partial payment (KES ${amountPaid}) to order ${order.orderNumber}. Remaining balance: KES ${newRemainingBalance}`;

    return NextResponse.json({
      success: true,
      message: successMessage,
      isExactPayment: isExactPayment,
      isPartialPayment: isPartialPayment,
      isOverPayment: isOverPayment,
      amountPaid: amountPaid,
      remainingBalance: newRemainingBalance,
      currentRemainingBalance: currentRemainingBalance,
      transaction: {
        id: transaction.transactionId,
        amount: transaction.amountPaid,
        customer: transaction.customerName
      },
      order: {
        id: order._id,
        orderNumber: order.orderNumber,
        customer: order.customer.name
      }
    });

  } catch (error: any) {
    console.error('Error connecting transaction to order:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
} 