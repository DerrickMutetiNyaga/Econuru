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

    let query = {};
    if (filter === 'unconnected') {
      query = { isConnectedToOrder: false };
    } else if (filter === 'connected') {
      query = { isConnectedToOrder: true };
    }

    // Fetch M-Pesa transactions
    const transactions = await MpesaTransaction.find(query)
      .populate('connectedOrderId', 'orderNumber customer paymentStatus')
      .sort({ transactionDate: -1 })
      .lean();

    // Get statistics
    const stats = {
      total: await MpesaTransaction.countDocuments(),
      unconnected: await MpesaTransaction.countDocuments({ isConnectedToOrder: false }),
      connected: await MpesaTransaction.countDocuments({ isConnectedToOrder: true }),
      totalAmount: await MpesaTransaction.aggregate([
        { $group: { _id: null, total: { $sum: '$amountPaid' } } }
      ]).then(result => result[0]?.total || 0),
      unconnectedAmount: await MpesaTransaction.aggregate([
        { $match: { isConnectedToOrder: false } },
        { $group: { _id: null, total: { $sum: '$amountPaid' } } }
      ]).then(result => result[0]?.total || 0)
    };

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
      pendingOrders
    });

  } catch (error: any) {
    console.error('Error fetching M-Pesa transactions:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
} 