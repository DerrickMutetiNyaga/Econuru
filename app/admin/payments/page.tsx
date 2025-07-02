"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
  BarChart3,
  CalendarIcon,
  SearchIcon,
  Users,
  Download,
  Smartphone,
  Receipt,
  Eye,
  Filter,
  AlertCircle,
  Calendar,
  Search
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

interface Payment {
  _id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  paymentMethod: string;
  paymentStatus: string;
  totalAmount: number;
  amountPaid?: number;
  mpesaReceiptNumber?: string;
  transactionDate?: string;
  phoneNumber?: string;
  createdAt: string;
  updatedAt: string;
}

interface PaymentStats {
  totalPayments: number;
  totalAmount: number;
  paidOrders: number;
  pendingOrders: number;
  todayPayments: number;
  todayAmount: number;
}

export default function PaymentsPage() {
  const { isAdmin, logout, isLoading, token } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<PaymentStats>({
    totalPayments: 0,
    totalAmount: 0,
    paidOrders: 0,
    pendingOrders: 0,
    todayPayments: 0,
    todayAmount: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('all');

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      logout();
    }
  }, [isAdmin, isLoading, logout]);

  useEffect(() => {
    if (token) {
      loadPayments();
    }
  }, [token]);

  const loadPayments = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading payments with token:', token ? 'Present' : 'Missing');
      
      const response = await fetch('/api/admin/payments', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      console.log('📡 Response status:', response.status);
      console.log('📡 Response ok:', response.ok);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Payments data received:', {
          paymentsCount: data.payments?.length || 0,
          stats: data.stats
        });
        setPayments(data.payments || []);
        setStats(data.stats || stats);
      } else {
        // Get the error details
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('❌ API Error:', response.status, errorData);
        
        // Show specific error message
        const errorMessage = errorData.error || `HTTP ${response.status} error`;
        toast({
          title: 'Error Loading Payments',
          description: errorMessage,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('❌ Network/Connection Error:', error);
      toast({
        title: 'Connection Error',
        description: 'Unable to connect to the server. Please check your connection.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const exportPayments = async () => {
    try {
      const response = await fetch('/api/admin/payments/export', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `payments-${format(new Date(), 'yyyy-MM-dd')}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        toast({
          title: 'Success',
          description: 'Payments exported successfully',
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to export payments',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error exporting payments:', error);
      toast({
        title: 'Error',
        description: 'Error exporting payments',
        variant: 'destructive',
      });
    }
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      payment.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.customerPhone.includes(searchTerm) ||
      (payment.mpesaReceiptNumber && payment.mpesaReceiptNumber.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || payment.paymentStatus === statusFilter;
    const matchesPaymentMethod = paymentMethodFilter === 'all' || payment.paymentMethod === paymentMethodFilter;
    
    return matchesSearch && matchesStatus && matchesPaymentMethod;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge variant="default" className="bg-green-500">Paid</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPaymentMethodBadge = (method: string) => {
    switch (method) {
      case 'mpesa_stk':
        return (
          <Badge variant="default" className="bg-green-600 hover:bg-green-700 gap-1">
            <Smartphone className="w-3 h-3" />
            M-Pesa STK
          </Badge>
        );
      case 'mpesa_c2b':
        return (
          <Badge variant="default" className="bg-blue-600 hover:bg-blue-700 gap-1">
            <CreditCard className="w-3 h-3" />
            M-Pesa C2B
          </Badge>
        );
      case 'cash':
        return (
          <Badge variant="outline" className="gap-1">
            <DollarSign className="w-3 h-3" />
            Cash
          </Badge>
        );
      default:
        return <Badge variant="outline">{method}</Badge>;
    }
  };

  if (!isAdmin) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            M-Pesa Payments
          </h1>
          <p className="text-gray-600 mt-2">Monitor and manage all M-Pesa transactions</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportPayments} variant="outline" size="sm" className="gap-2">
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
          <Button onClick={loadPayments} variant="outline" size="sm" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                      <DollarSign className="w-4 h-4 text-green-600" />
                    </div>
                    Total Revenue
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    KES {stats.totalAmount.toLocaleString()}
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
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-blue-600" />
                    </div>
                    Successful Payments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {stats.paidOrders}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {stats.totalPayments > 0 ? 
                      `${((stats.paidOrders / stats.totalPayments) * 100).toFixed(1)}% success rate` :
                      'No payments yet'
                    }
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
                      <Clock className="w-4 h-4 text-yellow-600" />
                    </div>
                    Pending Payments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">
                    {stats.pendingOrders}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    Awaiting customer action
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                      <CalendarIcon className="w-4 h-4 text-purple-600" />
                    </div>
                    Today's Revenue
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">
                    KES {stats.todayAmount.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {stats.todayPayments} transactions today
                  </div>
                </CardContent>
              </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filter Payments
          </CardTitle>
          <CardDescription>Search and filter payment records</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by order number, customer name, phone, or receipt number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Payment Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={paymentMethodFilter} onValueChange={setPaymentMethodFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Payment Method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Methods</SelectItem>
                  <SelectItem value="mpesa_stk">M-Pesa STK</SelectItem>
                  <SelectItem value="mpesa_c2b">M-Pesa C2B</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                </SelectContent>
              </Select>
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="w-5 h-5" />
            Payment Records ({filteredPayments.length})
          </CardTitle>
          <CardDescription>
            All M-Pesa payment transactions and their details
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
              <p className="text-gray-500">Loading payment records...</p>
            </div>
          ) : (
            <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Receipt No.</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPayments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="h-32 text-center">
                          <div className="flex flex-col items-center space-y-2">
                            {payments.length === 0 ? (
                              <>
                                <Receipt className="w-8 h-8 text-gray-400" />
                                <p className="text-gray-500">No payment records yet</p>
                                <p className="text-sm text-gray-400">
                                  Payment records will appear here when customers make M-Pesa payments
                                </p>
                              </>
                            ) : (
                              <>
                                <AlertTriangle className="w-8 h-8 text-gray-400" />
                                <p className="text-gray-500">No payment records match your filters</p>
                                <p className="text-sm text-gray-400">Try adjusting your filters or search terms</p>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredPayments.map((payment) => (
                        <TableRow key={payment._id}>
                          <TableCell className="font-medium">
                            {payment.orderNumber}
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{payment.customerName}</div>
                              {payment.customerEmail && (
                                <div className="text-sm text-muted-foreground">
                                  {payment.customerEmail}
                                </div>
                              )}
                          </div>
                          </TableCell>
                          <TableCell>{payment.customerPhone}</TableCell>
                          <TableCell>
                          <div>
                              <div className="font-medium">
                                KES {payment.totalAmount.toLocaleString()}
                              </div>
                              {payment.amountPaid && payment.amountPaid !== payment.totalAmount && (
                                <div className="text-sm text-muted-foreground">
                                  Paid: KES {payment.amountPaid.toLocaleString()}
                          </div>
                              )}
                        </div>
                          </TableCell>
                          <TableCell>
                            {getPaymentMethodBadge(payment.paymentMethod)}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(payment.paymentStatus)}
                          </TableCell>
                          <TableCell>
                            {payment.mpesaReceiptNumber ? (
                              <div className="flex items-center gap-2">
                                <code className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded font-mono">
                                  {payment.mpesaReceiptNumber}
                                </code>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                  onClick={() => navigator.clipboard.writeText(payment.mpesaReceiptNumber || '')}
                                  title="Copy receipt number"
                                >
                                  <Eye className="w-3 h-3" />
                                </Button>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {format(new Date(payment.transactionDate || payment.createdAt), 'MMM dd, yyyy')}
                              <div className="text-xs text-muted-foreground">
                                {format(new Date(payment.transactionDate || payment.createdAt), 'HH:mm')}
                        </div>
                      </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

      {/* M-Pesa Transactions Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-green-600" />
            M-Pesa Transactions
          </CardTitle>
          <CardDescription>
            Detailed view of all M-Pesa STK Push and C2B transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex flex-col items-center justify-center h-32 space-y-4">
              <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
              <p className="text-gray-500">Loading M-Pesa transactions...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* M-Pesa Transaction Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-600 font-medium">STK Push Payments</p>
                      <p className="text-2xl font-bold text-green-700">
                        {filteredPayments.filter(p => p.paymentMethod === 'mpesa_stk').length}
                      </p>
                    </div>
                    <Smartphone className="w-8 h-8 text-green-600" />
                  </div>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-600 font-medium">C2B Payments</p>
                      <p className="text-2xl font-bold text-blue-700">
                        {filteredPayments.filter(p => p.paymentMethod === 'mpesa_c2b').length}
                      </p>
                    </div>
                    <CreditCard className="w-8 h-8 text-blue-600" />
                  </div>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-purple-600 font-medium">Total M-Pesa Revenue</p>
                      <p className="text-2xl font-bold text-purple-700">
                        KES {filteredPayments
                          .filter(p => p.paymentMethod.includes('mpesa') && p.paymentStatus === 'paid')
                          .reduce((sum, p) => sum + p.totalAmount, 0)
                          .toLocaleString()}
                      </p>
                    </div>
                    <DollarSign className="w-8 h-8 text-purple-600" />
                  </div>
                </div>
              </div>

              {/* M-Pesa Transactions List */}
              <div className="space-y-3">
                <h4 className="font-semibold text-lg">Recent M-Pesa Transactions</h4>
                {filteredPayments
                  .filter(payment => payment.paymentMethod.includes('mpesa'))
                  .slice(0, 10)
                  .map((payment) => (
                    <div key={payment._id} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          {getPaymentMethodBadge(payment.paymentMethod)}
                          {getStatusBadge(payment.paymentStatus)}
                          <span className="font-mono text-sm text-gray-600">
                            {payment.orderNumber}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-lg">
                            KES {payment.totalAmount.toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-500">
                            {format(new Date(payment.transactionDate || payment.createdAt), 'MMM dd, HH:mm')}
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-600">Customer:</span>
                          <div>{payment.customerName}</div>
                          <div className="text-gray-500">{payment.customerPhone}</div>
                        </div>
                        
                        <div>
                          <span className="font-medium text-gray-600">Receipt:</span>
                          <div className="flex items-center gap-2">
                            {payment.mpesaReceiptNumber ? (
                              <>
                                <code className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                                  {payment.mpesaReceiptNumber}
                                </code>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                  onClick={() => navigator.clipboard.writeText(payment.mpesaReceiptNumber || '')}
                                  title="Copy receipt number"
                                >
                                  <Eye className="w-3 h-3" />
                                </Button>
                              </>
                            ) : (
                              <span className="text-gray-400">No receipt</span>
                            )}
                          </div>
                        </div>
                        
                        <div>
                          <span className="font-medium text-gray-600">Status:</span>
                          <div className="flex items-center gap-2">
                            {payment.paymentStatus === 'paid' && (
                              <>
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                <span className="text-green-600">Completed</span>
                              </>
                            )}
                            {payment.paymentStatus === 'pending' && (
                              <>
                                <Clock className="w-4 h-4 text-yellow-600" />
                                <span className="text-yellow-600">Processing</span>
                              </>
                            )}
                            {payment.paymentStatus === 'failed' && (
                              <>
                                <XCircle className="w-4 h-4 text-red-600" />
                                <span className="text-red-600">Failed</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                
                {filteredPayments.filter(p => p.paymentMethod.includes('mpesa')).length === 0 && (
                  <div className="text-center py-8">
                    <Smartphone className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">No M-Pesa transactions found</p>
                    <p className="text-sm text-gray-400">M-Pesa payments will appear here when customers pay</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
} 