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
  BarChart3,
  CalendarIcon,
  SearchIcon,
  Users,
  Download
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { format } from 'date-fns';

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
      const response = await fetch('/api/admin/payments', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setPayments(data.payments || []);
        setStats(data.stats || stats);
      } else {
        toast.error('Failed to load payments');
      }
    } catch (error) {
      console.error('Error loading payments:', error);
      toast.error('Error loading payments');
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
        toast.success('Payments exported successfully');
      } else {
        toast.error('Failed to export payments');
      }
    } catch (error) {
      console.error('Error exporting payments:', error);
      toast.error('Error exporting payments');
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
        return <Badge variant="default" className="bg-green-600">M-Pesa STK</Badge>;
      case 'mpesa_c2b':
        return <Badge variant="default" className="bg-blue-600">M-Pesa C2B</Badge>;
      case 'cash':
        return <Badge variant="outline">Cash</Badge>;
      default:
        return <Badge variant="outline">{method}</Badge>;
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
          <div className="flex gap-2">
            <Button onClick={exportPayments} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            <Button onClick={loadPayments} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
          </Button>
          </div>
        </div>

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
                Ksh {stats.totalAmount.toLocaleString()}
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
                    <Clock className="w-4 h-4" />
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
                <CalendarIcon className="w-4 h-4" />
                Today's Revenue
                  </CardTitle>
                </CardHeader>
                <CardContent>
              <div className="text-2xl font-bold text-green-600">
                Ksh {stats.todayAmount.toLocaleString()}
                  </div>
                </CardContent>
              </Card>
            </div>

        {/* Filters */}
              <Card>
          <CardHeader>
            <CardTitle>Filter Payments</CardTitle>
            <CardDescription>Search and filter payment records</CardDescription>
                </CardHeader>
                <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search by order number, customer name, phone, or receipt number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
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
            <CardTitle>Payment Records ({filteredPayments.length})</CardTitle>
            <CardDescription>
              All payment transactions and their details
            </CardDescription>
              </CardHeader>
              <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <RefreshCw className="w-8 h-8 animate-spin" />
                  </div>
                ) : (
              <div className="rounded-md border">
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
                        <TableCell colSpan={8} className="h-24 text-center">
                          No payments found.
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
                              <code className="text-xs bg-muted px-1 rounded">
                                {payment.mpesaReceiptNumber}
                              </code>
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
      </div>
    </div>
  );
} 