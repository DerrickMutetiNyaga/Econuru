import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/lib/models/Order';
import Customer from '@/lib/models/Customer';
import MpesaTransaction from '@/lib/models/MpesaTransaction';
import { C2BConfirmationRequest, C2BConfirmationResponse } from '@/lib/mpesa';

export async function POST(request: NextRequest) {
  try {
    const confirmationData: any = await request.json();
    
    console.log('💰 C2B Confirmation Request received:', JSON.stringify(confirmationData, null, 2));

    // Extract confirmation data (using exact M-Pesa field names)
    const {
      TransactionType: transactionType,
      TransID: transID,
      TransTime: transTime,
      TransAmount: transAmount,
      BusinessShortCode: businessShortCode,
      BillRefNumber: billRefNumber,
      OrgAccountBalance: orgAccountBalance,
      ThirdPartyTransID: thirdPartyTransID,
      MSISDN: msisdn,
      FirstName: firstName,
      MiddleName: middleName,
      LastName: lastName
    } = confirmationData;

    const amount = parseFloat(String(transAmount)) || 0;
    
    // Connect to database
    await connectDB();

    // Format customer phone number (handle encrypted MSISDN in production)
    let formattedPhone = '0700000000'; // Default for encrypted numbers
    if (msisdn && typeof msisdn === 'string' && !msisdn.includes('e') && msisdn.length < 20) {
      // Only process if it looks like a real phone number (not encrypted)
      formattedPhone = msisdn.replace(/\D/g, '');
      if (formattedPhone.startsWith('254')) {
        formattedPhone = '0' + formattedPhone.substring(3);
      } else if (!formattedPhone.startsWith('0')) {
        formattedPhone = '0' + formattedPhone;
      }
    }

    // Convert M-Pesa timestamp to Date object
    let transactionDate = new Date();
    if (transTime && transTime.length >= 14) {
      try {
        // M-Pesa format: YYYYMMDDHHMMSS
        const year = parseInt(transTime.substring(0, 4));
        const month = parseInt(transTime.substring(4, 6)) - 1; // Month is 0-indexed
        const day = parseInt(transTime.substring(6, 8));
        const hour = parseInt(transTime.substring(8, 10));
        const minute = parseInt(transTime.substring(10, 12));
        const second = parseInt(transTime.substring(12, 14));
        transactionDate = new Date(year, month, day, hour, minute, second);
      } catch (error) {
        console.error('Error parsing transaction time:', error);
      }
    }

    let orderUpdated = false;
    let customerUpdated = false;

    // Try to find and update existing order
    if (billRefNumber && billRefNumber !== '') {
      try {
        const order = await Order.findOne({
          $or: [
            { orderNumber: billRefNumber },
            { _id: billRefNumber }
          ]
        });

        if (order) {
          // Check if payment amount matches order total exactly (strict comparison)
          const orderTotal = order.totalAmount || 0;
          const isExactPayment = amount === orderTotal;
          const isPartialPayment = amount < orderTotal;
          const isOverPayment = amount > orderTotal;
          
          // Only mark as 'paid' if exact amount is received
          const paymentStatus = isExactPayment ? 'paid' : 'partially_paid';

          // Update order with payment details
          await Order.findByIdAndUpdate(order._id, {
            paymentStatus: paymentStatus,
            paymentMethod: 'mpesa_c2b',
            $set: {
              'c2bPayment': {
                transactionId: transID,
                mpesaReceiptNumber: transID, // M-Pesa receipt is the transID for C2B
                transactionDate: transactionDate,
                phoneNumber: formattedPhone,
                amountPaid: amount,
                transactionType: transactionType,
                billRefNumber: billRefNumber,
                thirdPartyTransID: thirdPartyTransID,
                orgAccountBalance: orgAccountBalance,
                customerName: [firstName, middleName, lastName].filter(Boolean).join(' '),
                paymentCompletedAt: new Date()
              }
            }
          });

          orderUpdated = true;
          if (isExactPayment) {
            console.log(`✅ EXACT C2B payment for order ${order.orderNumber}: ${transID} (KES ${amount})`);
          } else if (isOverPayment) {
            console.log(`💰 C2B OVERPAYMENT for order ${order.orderNumber}: KES ${amount} (expected KES ${orderTotal}) - ${transID}`);
          } else {
            console.log(`⚠️ PARTIAL C2B payment for order ${order.orderNumber}: KES ${amount} of KES ${orderTotal} (${transID})`);
          }
        }
      } catch (error) {
        console.error('Error updating order:', error);
      }
    }

    // Try to find or create customer
    try {
      let customer = await Customer.findOne({
        $or: [
          { phone: msisdn },
          { phone: formattedPhone },
          { phone: '+' + msisdn }
        ]
      });

      if (customer) {
        // Update existing customer's last payment
        await Customer.findByIdAndUpdate(customer._id, {
          $set: {
            lastPaymentDate: transactionDate,
            lastPaymentAmount: amount,
            lastTransactionId: transID
          }
        });
        customerUpdated = true;
        console.log(`✅ Customer ${customer.name} updated with payment info`);
      } else if (firstName || lastName) {
        // Create new customer if we have name information
        const customerName = [firstName, middleName, lastName].filter(Boolean).join(' ');
        
        if (customerName.trim()) {
          customer = new Customer({
            name: customerName,
            phone: formattedPhone,
            email: '', // Will be updated when they register
            createdViaPayment: true,
            lastPaymentDate: transactionDate,
            lastPaymentAmount: amount,
            lastTransactionId: transID,
            totalOrders: orderUpdated ? 1 : 0
          });

          await customer.save();
          customerUpdated = true;
          console.log(`✅ New customer created: ${customerName} (${formattedPhone})`);
        }
      }
    } catch (error) {
      console.error('Error handling customer:', error);
    }

    // If no order was found by bill reference, try intelligent matching for till number payments
    if (!orderUpdated && (!billRefNumber || billRefNumber === '')) {
      try {
        console.log(`🔍 Attempting intelligent order matching for amount: KES ${amount}`);
        
        // Find pending orders with matching amount in the last 2 hours
        const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
        
        const matchingOrders = await Order.find({
          totalAmount: amount,
          paymentStatus: { $in: ['unpaid', 'pending'] },
          createdAt: { $gte: twoHoursAgo },
          paymentMethod: { $ne: 'mpesa_c2b' } // Avoid already processed orders
        }).sort({ createdAt: -1 }); // Most recent first

        if (matchingOrders.length === 1) {
          // Exact match found - update this order
          const matchedOrder = matchingOrders[0];
          const orderTotal = matchedOrder.totalAmount || 0;
          const isExactPayment = amount === orderTotal;
          const isPartialPayment = amount < orderTotal;
          const isOverPayment = amount > orderTotal;
          
          // Only mark as 'paid' if exact amount is received
          const paymentStatus = isExactPayment ? 'paid' : 'partially_paid';
          
          await Order.findByIdAndUpdate(matchedOrder._id, {
            paymentStatus: paymentStatus,
            paymentMethod: 'mpesa_c2b',
            $set: {
              'c2bPayment': {
                transactionId: transID,
                mpesaReceiptNumber: transID,
                transactionDate: transactionDate,
                phoneNumber: formattedPhone,
                amountPaid: amount,
                transactionType: transactionType,
                billRefNumber: billRefNumber || 'TILL_PAYMENT',
                thirdPartyTransID: thirdPartyTransID,
                orgAccountBalance: orgAccountBalance,
                customerName: [firstName, middleName, lastName].filter(Boolean).join(' '),
                paymentCompletedAt: new Date()
              }
            }
          });

          orderUpdated = true;
          if (isExactPayment) {
            console.log(`✅ EXACT payment matched to order ${matchedOrder.orderNumber}: ${transID} (KES ${amount})`);
          } else if (isOverPayment) {
            console.log(`💰 OVERPAYMENT matched to order ${matchedOrder.orderNumber}: KES ${amount} (expected KES ${orderTotal}) - ${transID}`);
          } else {
            console.log(`⚠️ PARTIAL payment matched to order ${matchedOrder.orderNumber}: KES ${amount} of KES ${orderTotal} (${transID})`);
          }
          console.log(`📊 Match criteria: Amount=${amount}, Time window=2hrs, Customer=${[firstName, middleName, lastName].filter(Boolean).join(' ')}`);
          
        } else if (matchingOrders.length > 1) {
          // Multiple matches - log for manual review but create standalone record
          console.log(`⚠️ Multiple orders found with amount KES ${amount}:`);
          matchingOrders.forEach(order => {
            console.log(`   - ${order.orderNumber} (${order.customer.name}) - ${order.createdAt}`);
          });
          console.log(`🔄 Creating standalone payment record for manual matching`);
        } else {
          console.log(`📭 No matching orders found for amount KES ${amount} in last 2 hours`);
        }
      } catch (error) {
        console.error('Error during intelligent order matching:', error);
      }
    }

    // If no order matched, create a standalone M-Pesa transaction record
    if (!orderUpdated) {
      try {
        const customerName = [firstName, middleName, lastName].filter(Boolean).join(' ') || 'Unknown Customer';
        
        // Check if this transaction already exists
        const existingTransaction = await MpesaTransaction.findOne({ 
          transactionId: transID 
        });

        if (!existingTransaction) {
          const mpesaTransaction = new MpesaTransaction({
            transactionId: transID,
            mpesaReceiptNumber: transID,
            transactionDate: transactionDate,
            phoneNumber: formattedPhone,
            amountPaid: amount,
            transactionType: transactionType,
            billRefNumber: billRefNumber || 'TILL_PAYMENT',
            thirdPartyTransID: thirdPartyTransID,
            orgAccountBalance: orgAccountBalance,
            customerName: customerName,
            paymentCompletedAt: new Date(),
            isConnectedToOrder: false,
            notes: `Unmatched C2B payment. Awaiting manual connection to order.`
          });

          await mpesaTransaction.save();
          console.log(`💾 Standalone M-Pesa transaction saved: ${transID} (KES ${amount}) - ${customerName}`);
          console.log(`🔗 Transaction can be manually connected to order via admin dashboard`);
        } else {
          console.log(`⚠️ Transaction ${transID} already exists in database`);
        }
      } catch (error) {
        console.error('Error saving M-Pesa transaction:', error);
      }
    }

    // Log payment processing result
    console.log(`💰 C2B Payment processed successfully:
      Transaction ID: ${transID}
      Amount: KES ${amount}
      Phone: ${formattedPhone}
      Customer: ${[firstName, middleName, lastName].filter(Boolean).join(' ')}
      Bill Ref: ${billRefNumber || 'None'}
      Order Updated: ${orderUpdated}
      Customer Updated: ${customerUpdated}
    `);

    // Always return success to M-Pesa
    return NextResponse.json({
      resultCode: '0',
      resultDesc: 'Success'
    } as C2BConfirmationResponse);

  } catch (error: any) {
    console.error('❌ C2B Confirmation error:', error);
    
    // Still return success to M-Pesa to avoid retries
    // The payment has already been processed by M-Pesa
    return NextResponse.json({
      resultCode: '0',
      resultDesc: 'Success'
    } as C2BConfirmationResponse);
  }
}

// GET endpoint for testing/health check
export async function GET() {
  return NextResponse.json({
    message: 'C2B Confirmation endpoint is active',
    timestamp: new Date().toISOString(),
    status: 'healthy'
  });
} 