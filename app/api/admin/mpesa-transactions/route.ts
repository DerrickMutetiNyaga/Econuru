import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import MpesaTransaction from '@/lib/models/MpesaTransaction';
import Order from '@/lib/models/Order';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
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

    await connectDB();

    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || 'all'; // all, unconnected, connected
    const month = searchParams.get('month'); // Format: YYYY-MM
    const year = searchParams.get('year'); // Format: YYYY

    let query: any = {};
    if (filter === 'unconnected') {
      query.isConnectedToOrder = false;
    } else if (filter === 'connected') {
      query.isConnectedToOrder = true;
    }
    
    // Add month/year filtering
    if (month && year) {
      // Parse month and year
      const monthNum = parseInt(month);
      const yearNum = parseInt(year);
      
      if (isNaN(monthNum) || isNaN(yearNum)) {
        return NextResponse.json(
          { error: 'Invalid month or year parameter' },
          { status: 400 }
        );
      }
      
      // Create date range for the month
      // Start: First day of the month at 00:00:00 local time
      const startDate = new Date(yearNum, monthNum - 1, 1, 0, 0, 0, 0);
      // End: First day of next month at 00:00:00 (exclusive), so we use $lt
      const endDate = new Date(yearNum, monthNum, 1, 0, 0, 0, 0);
      
      console.log(`📅 Filtering transactions for ${monthNum}/${yearNum}:`, {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });
      
      query.transactionDate = {
        $gte: startDate,
        $lt: endDate  // Use $lt (less than) instead of $lte to exclude next month
      };
    } else if (year) {
      // Filter by year only
      const yearNum = parseInt(year);
      
      if (isNaN(yearNum)) {
        return NextResponse.json(
          { error: 'Invalid year parameter' },
          { status: 400 }
        );
      }
      
      const startDate = new Date(yearNum, 0, 1, 0, 0, 0, 0); // January 1st
      const endDate = new Date(yearNum + 1, 0, 1, 0, 0, 0, 0); // January 1st of next year (exclusive)
      
      query.transactionDate = {
        $gte: startDate,
        $lt: endDate
      };
    }
    // Note: We're showing ALL transactions regardless of STK success status

    // Fetch M-Pesa transactions - optimized with select to reduce data transfer
    const transactions = await MpesaTransaction.find(query)
      .select('transactionId mpesaReceiptNumber transactionDate phoneNumber amountPaid transactionType customerName isConnectedToOrder connectedOrderId notes createdAt')
      .populate('connectedOrderId', 'orderNumber customer.name customer.phone paymentStatus')
      .sort({ transactionDate: -1 })
      .lean();
    
    console.log(`✅ Found ${transactions.length} transactions matching the query`);

    // Get statistics (for current filter) - run in parallel for speed
    const [totalCount, unconnectedCount, connectedCount, totalAmountResult, unconnectedAmountResult] = await Promise.all([
      MpesaTransaction.countDocuments(query),
      MpesaTransaction.countDocuments({ ...query, isConnectedToOrder: false }),
      MpesaTransaction.countDocuments({ ...query, isConnectedToOrder: true }),
      MpesaTransaction.aggregate([
        { $match: query },
        { $group: { _id: null, total: { $sum: '$amountPaid' } } }
      ]).then(result => result[0]?.total || 0),
      MpesaTransaction.aggregate([
        { $match: { ...query, isConnectedToOrder: false } },
        { $group: { _id: null, total: { $sum: '$amountPaid' } } }
      ]).then(result => result[0]?.total || 0)
    ]);
    
    const stats = {
      total: totalCount,
      unconnected: unconnectedCount,
      connected: connectedCount,
      totalAmount: totalAmountResult,
      unconnectedAmount: unconnectedAmountResult
    };

    // Get monthly summary for all months (for navigation) - only if superadmin
    // This is expensive, so we'll make it optional or cache it
    let monthlySummary: any[] = [];
    try {
      const monthlySummaryResult = await MpesaTransaction.aggregate([
        {
          $group: {
            _id: {
              year: { $year: '$transactionDate' },
              month: { $month: '$transactionDate' }
            },
            totalAmount: { $sum: '$amountPaid' },
            transactionCount: { $sum: 1 }
          }
        },
        {
          $sort: { '_id.year': -1, '_id.month': -1 }
        }
      ]);
      monthlySummary = monthlySummaryResult || [];
    } catch (error) {
      console.warn('Error fetching monthly summary:', error);
      monthlySummary = [];
    }

    // Also fetch recent pending orders for connection suggestions
    const pendingOrders = await Order.find({
      paymentStatus: { $in: ['unpaid', 'pending'] }
    })
    .select('_id orderNumber customer totalAmount createdAt')
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();

    return NextResponse.json({
      success: true,
      transactions,
      stats,
      pendingOrders,
      monthlySummary
    });

  } catch (error: any) {
    console.error('Error fetching M-Pesa transactions:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

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

    const {
      transactionId,
      mpesaReceiptNumber,
      transactionDate,
      phoneNumber,
      amountPaid,
      customerName,
      transactionType,
      notes
    } = await request.json();

    // Validate required fields
    if (!transactionId || !amountPaid || !customerName) {
      return NextResponse.json({ 
        error: 'Transaction ID, amount paid, and customer name are required' 
      }, { status: 400 });
    }

    await connectDB();

    // Check if transaction ID already exists
    const existingTransaction = await MpesaTransaction.findOne({ transactionId });
    if (existingTransaction) {
      return NextResponse.json({ 
        error: 'Transaction ID already exists' 
      }, { status: 400 });
    }

    // Create new transaction
    const newTransaction = new MpesaTransaction({
      transactionId,
      mpesaReceiptNumber: mpesaReceiptNumber || transactionId, // Use transaction ID as receipt number if not provided
      transactionDate: new Date(transactionDate),
      phoneNumber: phoneNumber || 'Unknown',
      amountPaid: parseFloat(amountPaid),
      transactionType: transactionType || 'C2B',
      customerName,
      paymentCompletedAt: new Date(),
      notes: notes || `Manually added by ${decoded.email || decoded.name || 'admin'}`,
      isConnectedToOrder: false,
      confirmationStatus: 'confirmed', // Mark as confirmed since admin is adding it
      confirmedBy: decoded.email || decoded.name || 'admin',
      confirmedAt: new Date()
    });

    await newTransaction.save();

    console.log(`📝✅ Manual M-Pesa transaction added by ${decoded.email}:`, {
      transactionId,
      customerName,
      amountPaid,
      phoneNumber
    });

    return NextResponse.json({
      success: true,
      message: 'M-Pesa transaction added successfully',
      transaction: {
        id: newTransaction._id,
        transactionId: newTransaction.transactionId,
        customerName: newTransaction.customerName,
        amountPaid: newTransaction.amountPaid
      }
    });

  } catch (error: any) {
    console.error('Error adding M-Pesa transaction:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
} 