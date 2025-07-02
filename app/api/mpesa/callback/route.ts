import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/lib/models/Order';
import MpesaTransaction from '@/lib/models/MpesaTransaction';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    console.log('M-Pesa Callback received:', JSON.stringify(body, null, 2));

    // Extract callback data from M-Pesa response
    const stkCallback = body.Body?.stkCallback;
    if (!stkCallback) {
      console.error('Invalid callback format');
      return NextResponse.json({ success: false, message: 'Invalid callback format' });
    }

    const {
      CheckoutRequestID: checkoutRequestId,
      ResultCode: resultCode,
      ResultDesc: resultDesc
    } = stkCallback;

    // Find the order by checkout request ID (check both top-level and nested fields)
    const order = await Order.findOne({
      $or: [
        { checkoutRequestId: checkoutRequestId },
        { 'mpesaPayment.checkoutRequestId': checkoutRequestId }
      ]
    });

    if (!order) {
      console.error('Order not found for checkout request ID:', checkoutRequestId);
      return NextResponse.json({ success: false, message: 'Order not found' });
    }

    console.log('Processing payment for order:', order.orderNumber);

    // Update payment status based on result code
    if (resultCode === 0) {
      // Payment successful
      const callbackMetadata = stkCallback.CallbackMetadata?.Item || [];
      
      // Extract payment details
      let mpesaReceiptNumber = '';
      let transactionDate = '';
      let phoneNumber = '';
      let amount = 0;

      callbackMetadata.forEach((item: any) => {
        switch (item.Name) {
          case 'MpesaReceiptNumber':
            mpesaReceiptNumber = item.Value;
            break;
          case 'TransactionDate':
            transactionDate = item.Value;
            break;
          case 'PhoneNumber':
            phoneNumber = item.Value;
            break;
          case 'Amount':
            amount = item.Value;
            break;
        }
      });

      // Convert M-Pesa date format to Date object
      let transactionDateObj = null;
      if (transactionDate) {
        // M-Pesa date format: YYYYMMDDHHMMSS
        const year = parseInt(transactionDate.substring(0, 4));
        const month = parseInt(transactionDate.substring(4, 6)) - 1; // Month is 0-indexed
        const day = parseInt(transactionDate.substring(6, 8));
        const hour = parseInt(transactionDate.substring(8, 10));
        const minute = parseInt(transactionDate.substring(10, 12));
        const second = parseInt(transactionDate.substring(12, 14));
        transactionDateObj = new Date(year, month, day, hour, minute, second);
      }

      // Check if payment amount matches order total (handle partial payments)
      const orderTotal = order.totalAmount || 0;
      const amountPaid = parseFloat(amount) || 0;
      const isPartialPayment = amountPaid < orderTotal;
      const paymentStatus = isPartialPayment ? 'partially_paid' : 'paid';

      // Store the transaction in MpesaTransaction collection
      try {
        const mpesaTransaction = new MpesaTransaction({
          transactionId: mpesaReceiptNumber,
          mpesaReceiptNumber: mpesaReceiptNumber,
          transactionDate: transactionDateObj || new Date(),
          phoneNumber: phoneNumber || 'Unknown',
          amountPaid: amountPaid,
          transactionType: 'STK_PUSH',
          billRefNumber: order.orderNumber,
          customerName: order.customer?.name || 'STK Push Customer',
          paymentCompletedAt: new Date(),
          isConnectedToOrder: true,
          connectedOrderId: order._id,
          connectedAt: new Date(),
          connectedBy: 'system_auto_match',
          notes: `STK Push payment for order ${order.orderNumber}. ${isPartialPayment ? `Partial payment: KES ${amountPaid} of KES ${orderTotal}` : 'Full payment received'}`
        });

        await mpesaTransaction.save();
        console.log(`💾 STK Push transaction stored: ${mpesaReceiptNumber} (KES ${amountPaid})`);
      } catch (transactionError) {
        console.error('Error storing STK Push transaction:', transactionError);
      }

      // Update order with payment details
      const orderUpdate: any = {
        paymentMethod: 'mpesa_stk',
        mpesaReceiptNumber: mpesaReceiptNumber,
        transactionDate: transactionDateObj,
        phoneNumber: phoneNumber,
        amountPaid: amountPaid,
        resultCode: resultCode,
        resultDescription: resultDesc,
        paymentCompletedAt: new Date(),
        $set: {
          'mpesaPayment.mpesaReceiptNumber': mpesaReceiptNumber,
          'mpesaPayment.transactionDate': transactionDateObj,
          'mpesaPayment.phoneNumber': phoneNumber,
          'mpesaPayment.amountPaid': amountPaid,
          'mpesaPayment.resultCode': resultCode,
          'mpesaPayment.resultDescription': resultDesc,
          'mpesaPayment.paymentCompletedAt': new Date()
        }
      };

      // Set payment status based on amount comparison
      orderUpdate.paymentStatus = paymentStatus;

      await Order.findByIdAndUpdate(order._id, orderUpdate);

      if (isPartialPayment) {
        console.log(`⚠️ Partial payment received for order ${order.orderNumber}: KES ${amountPaid} of KES ${orderTotal} (Receipt: ${mpesaReceiptNumber})`);
      } else {
        console.log(`✅ Full payment successful for order ${order.orderNumber}: Receipt ${mpesaReceiptNumber} (KES ${amountPaid})`);
      }

    } else {
      // Payment failed or cancelled
      await Order.findByIdAndUpdate(order._id, {
        paymentStatus: 'failed',
        paymentMethod: 'mpesa_stk',
        resultCode: resultCode,
        resultDescription: resultDesc,
        paymentCompletedAt: new Date(),
        $set: {
          'mpesaPayment.resultCode': resultCode,
          'mpesaPayment.resultDescription': resultDesc,
          'mpesaPayment.paymentCompletedAt': new Date()
        }
      });

      console.log(`❌ Payment failed for order ${order.orderNumber}: ${resultDesc}`);
    }

    // Always return success to M-Pesa to acknowledge receipt
    return NextResponse.json({ 
      success: true, 
      message: 'Callback processed successfully' 
    });

  } catch (error) {
    console.error('M-Pesa callback error:', error);
    
    // Still return success to M-Pesa to avoid retries
    return NextResponse.json({ 
      success: true, 
      message: 'Callback received but processing failed' 
    });
  }
}

// Handle GET requests (for testing/verification)
export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    message: 'M-Pesa callback endpoint is active',
    timestamp: new Date().toISOString()
  });
} 