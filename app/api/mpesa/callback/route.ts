import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/lib/models/Order';
import MpesaTransaction from '@/lib/models/MpesaTransaction';
import PaymentAuditLog from '@/lib/models/PaymentAuditLog';

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

      // Get the requested payment amount and type from pending payment data
      const requestedAmount = order.pendingMpesaPayment?.amount || order.totalAmount || 0;
      const paymentType = order.pendingMpesaPayment?.paymentType || 'full';
      const orderTotal = order.totalAmount || 0;
      const amountPaid = parseFloat(amount) || 0;
      
      // Check if the payment matches what was requested (not necessarily the full order amount)
      const isRequestedAmountPaid = amountPaid === parseFloat(requestedAmount);
      const isFullOrderPayment = amountPaid === orderTotal;
      const isPartialPayment = amountPaid < orderTotal;
      const isOverPayment = amountPaid > orderTotal;

      // Log original phone number from Safaricom
      console.log(`📱 STK Push - Phone number received from Safaricom: ${phoneNumber || 'Unknown'}`);
      console.log(`💰 Payment Analysis: Type=${paymentType}, Requested=${requestedAmount}, Paid=${amountPaid}, OrderTotal=${orderTotal}`);

      if (isRequestedAmountPaid) {
        // REQUESTED AMOUNT PAID: Create pending transaction for manual confirmation
        try {
          // Check if this transaction already exists to prevent duplicates
          const existingTransaction = await MpesaTransaction.findOne({
            mpesaReceiptNumber: mpesaReceiptNumber
          });

          if (existingTransaction) {
            console.log(`⚠️ Transaction ${mpesaReceiptNumber} already exists, skipping duplicate`);
            return NextResponse.json({ 
              success: true, 
              message: 'Duplicate transaction ignored' 
            });
          }

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
            // Pending confirmation fields
            confirmationStatus: 'pending',
            pendingOrderId: order._id,
            isConnectedToOrder: false, // Not connected until confirmed
            notes: `STK Push payment pending confirmation for order ${order.orderNumber}. Expected: KES ${requestedAmount}, Received: KES ${amountPaid}. Payment type: ${paymentType}.`
          });

          await mpesaTransaction.save();

          // Update order with basic payment info but keep as pending
          await Order.findByIdAndUpdate(order._id, {
            paymentStatus: 'pending',
            paymentMethod: 'mpesa_stk',
            resultCode: resultCode,
            resultDescription: resultDesc,
            $set: {
              'mpesaPayment.checkoutRequestId': checkoutRequestId,
              'mpesaPayment.resultCode': resultCode,
              'mpesaPayment.resultDescription': resultDesc,
              'mpesaPayment.paymentCompletedAt': new Date()
            }
          });

          console.log(`🟡 STK Push payment PENDING CONFIRMATION for order ${order.orderNumber}: Receipt ${mpesaReceiptNumber} (KES ${amountPaid}) - Requires admin verification`);
          
        } catch (transactionError) {
          console.error('Error storing pending STK Push transaction:', transactionError);
        }
              } else {
        // PAYMENT AMOUNT MISMATCH: Create unmatched transaction for manual review
        try {
          // Check if this transaction already exists to prevent duplicates
          const existingTransaction = await MpesaTransaction.findOne({
            mpesaReceiptNumber: mpesaReceiptNumber
          });

          if (existingTransaction) {
            console.log(`⚠️ Transaction ${mpesaReceiptNumber} already exists, skipping duplicate`);
            return NextResponse.json({ 
              success: true, 
              message: 'Duplicate transaction ignored' 
            });
          }

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
            // Unmatched transaction - no pending order connection
            confirmationStatus: 'pending',
            pendingOrderId: null, // No direct match
            isConnectedToOrder: false,
            notes: `STK Push payment AMOUNT MISMATCH for order ${order.orderNumber}. Expected: KES ${requestedAmount}, Received: KES ${amountPaid}, Order Total: KES ${orderTotal}. Requires manual connection.`
          });

          await mpesaTransaction.save();

          // Update order basic payment info but keep as unpaid
          await Order.findByIdAndUpdate(order._id, {
            resultCode: resultCode,
            resultDescription: resultDesc,
            $set: {
              'mpesaPayment.resultCode': resultCode,
              'mpesaPayment.resultDescription': resultDesc,
              'mpesaPayment.paymentCompletedAt': new Date()
            }
          });

          console.log(`🔴 STK Push AMOUNT MISMATCH for order ${order.orderNumber}: Expected KES ${requestedAmount}, Received KES ${amountPaid} - Receipt: ${mpesaReceiptNumber}`);
          console.log(`🔗 Transaction created as unmatched. Requires manual admin connection.`);
        } catch (transactionError) {
          console.error('Error storing unmatched STK Push transaction:', transactionError);
        }
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