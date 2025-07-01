"use client";

import React, { useState, useEffect } from 'react';
import PaymentNavbar from '@/components/PaymentNavbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  CreditCard, 
  CheckCircle, 
  XCircle, 
  Clock,
  RefreshCw,
  AlertTriangle,
  BarChart3
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

interface PaymentStats {
  totalPayments: number;
  successfulPayments: number;
  failedPayments: number;
  pendingPayments: number;
  totalRevenue: number;
  todayRevenue: number;
  weekRevenue: number;
  monthRevenue: number;
}

interface RecentTransaction {
  _id: string;
  orderNumber: string;
  customerName: string;
  amount: number;
  status: 'paid' | 'failed' | 'pending';
  mpesaReceiptNumber?: string;
  transactionDate: string;
  phoneNumber: string;
}

export default function PaymentsDashboard() {
  const { isAdmin, logout, isLoading, token } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<PaymentStats>({
    totalPayments: 0,
    successfulPayments: 0,
    failedPayments: 0,
    pendingPayments: 0,
    totalRevenue: 0,
    todayRevenue: 0,
    weekRevenue: 0,
    monthRevenue: 0,
  });
  const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      logout();
    }
  }, [isAdmin, isLoading, logout]);

  useEffect(() => {
    if (token) {
      fetchPaymentStats();
      fetchRecentTransactions();
    }
  }, [token]);

  const fetchPaymentStats = async () => {
    try {
      const response = await fetch('/api/orders', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        const orders = data.orders || [];
        
        // Calculate payment statistics
        const totalPayments = orders.filter((order: any) => order.paymentStatus !== 'unpaid').length;
        const successfulPayments = orders.filter((order: any) => order.paymentStatus === 'paid').length;
        const failedPayments = orders.filter((order: any) => order.paymentStatus === 'failed').length;
        const pendingPayments = orders.filter((order: any) => order.paymentStatus === 'pending').length;
        
        const totalRevenue = orders
          .filter((order: any) => order.paymentStatus === 'paid')
          .reduce((sum: number, order: any) => sum + (order.totalAmount || 0), 0);

        const today = new Date();
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const weekStart = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

        const todayRevenue = orders
          .filter((order: any) => 
            order.paymentStatus === 'paid' && 
            new Date(order.updatedAt) >= todayStart
          )
          .reduce((sum: number, order: any) => sum + (order.totalAmount || 0), 0);

        const weekRevenue = orders
          .filter((order: any) => 
            order.paymentStatus === 'paid' && 
            new Date(order.updatedAt) >= weekStart
          )
          .reduce((sum: number, order: any) => sum + (order.totalAmount || 0), 0);

        const monthRevenue = orders
          .filter((order: any) => 
            order.paymentStatus === 'paid' && 
            new Date(order.updatedAt) >= monthStart
          )
          .reduce((sum: number, order: any) => sum + (order.totalAmount || 0), 0);

        setStats({
          totalPayments,
          successfulPayments,
          failedPayments,
          pendingPayments,
          totalRevenue,
          todayRevenue,
          weekRevenue,
          monthRevenue,
        });
      }
    } catch (error) {
      console.error('Error fetching payment stats:', error);
    }
  };

  const fetchRecentTransactions = async () => {
    try {
      const response = await fetch('/api/orders', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        const orders = data.orders || [];
        
        // Get recent transactions with M-Pesa payment data
        const transactions = orders
          .filter((order: any) => order.mpesaPayment && order.mpesaPayment.checkoutRequestId)
          .sort((a: any, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
          .slice(0, 10)
          .map((order: any) => ({
            _id: order._id,
            orderNumber: order.orderNumber,
            customerName: order.customer.name,
            amount: order.totalAmount,
            status: order.paymentStatus,
            mpesaReceiptNumber: order.mpesaPayment?.mpesaReceiptNumber,
            transactionDate: order.mpesaPayment?.transactionDate || order.updatedAt,
            phoneNumber: order.mpesaPayment?.phoneNumber || order.customer.phone,
          }));

        setRecentTransactions(transactions);
      }
    } catch (error) {
      console.error('Error fetching recent transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <PaymentNavbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Payment Dashboard</h1>
            <p className="text-gray-600 mt-2">Monitor and manage M-Pesa payments</p>
          </div>
          <Button 
            onClick={() => {
              fetchPaymentStats();
              fetchRecentTransactions();
            }}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Data
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">Loading payment data...</p>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Total Revenue
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">
                    Ksh {stats.totalRevenue.toLocaleString()}
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-600">+12.5%</span>
                    <span className="text-sm text-gray-500">vs last month</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Successful Payments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">
                    {stats.successfulPayments}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {stats.totalPayments > 0 ? 
                      `${((stats.successfulPayments / stats.totalPayments) * 100).toFixed(1)}% success rate` :
                      'No payments yet'
                    }
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Pending Payments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">
                    {stats.pendingPayments}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    Awaiting customer action
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                    <XCircle className="w-4 h-4" />
                    Failed Payments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {stats.failedPayments}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    Need attention
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Revenue Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Today's Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold text-green-600">
                    Ksh {stats.todayRevenue.toLocaleString()}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">This Week</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold text-blue-600">
                    Ksh {stats.weekRevenue.toLocaleString()}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">This Month</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold text-purple-600">
                    Ksh {stats.monthRevenue.toLocaleString()}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Transactions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Recent M-Pesa Transactions
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentTransactions.length === 0 ? (
                  <div className="text-center py-8">
                    <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No M-Pesa transactions yet</p>
                    <Button 
                      onClick={() => router.push('/admin/orders')}
                      className="mt-4 bg-green-600 hover:bg-green-700 text-white"
                    >
                      Process First Payment
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentTransactions.map((transaction) => (
                      <div key={transaction._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(transaction.status)}
                            <Badge className={getStatusColor(transaction.status)}>
                              {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                            </Badge>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{transaction.orderNumber}</p>
                            <p className="text-sm text-gray-600">{transaction.customerName}</p>
                            <p className="text-sm text-gray-500">{transaction.phoneNumber}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900">Ksh {transaction.amount.toLocaleString()}</p>
                          {transaction.mpesaReceiptNumber && (
                            <p className="text-xs text-green-600">Receipt: {transaction.mpesaReceiptNumber}</p>
                          )}
                          <p className="text-xs text-gray-500">
                            {new Date(transaction.transactionDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
} 