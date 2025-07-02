"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  DollarSign, 
  RefreshCw,
  Smartphone, 
  Receipt,
  Link2, 
  Search,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

interface MpesaTransaction {
  _id: string;
  transactionId: string;
  mpesaReceiptNumber: string;
  transactionDate: string;
  phoneNumber: string;
  amountPaid: number;
  transactionType: string;
  customerName: string;
  isConnectedToOrder: boolean;
  connectedOrderId?: string;
  connectedAt?: string;
  connectedBy?: string;
  notes?: string;
  createdAt: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  customer: {
    name: string;
    phone: string;
  };
  totalAmount: number;
  remainingBalance?: number;
  paymentStatus: string;
}

export default function MpesaTransactionsPage() {
  const { isAdmin, logout, isLoading, token } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  
  const [transactions, setTransactions] = useState<MpesaTransaction[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Connection modal state
  const [connectionDialogOpen, setConnectionDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<MpesaTransaction | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      logout();
    }
  }, [isAdmin, isLoading, logout]);

  useEffect(() => {
    if (token) {
      loadData();
    }
  }, [token]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load M-Pesa transactions
      const transactionsResponse = await fetch('/api/admin/mpesa-transactions', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      // Load orders for connection dropdown and display
      const ordersResponse = await fetch('/api/orders', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (transactionsResponse.ok && ordersResponse.ok) {
        const transactionsData = await transactionsResponse.json();
        const ordersData = await ordersResponse.json();
        
        // Debug: Log transaction data to see phone number format
        if (transactionsData.transactions && transactionsData.transactions.length > 0) {
          console.log('🔍 DEBUG: First transaction data:', {
            phoneNumber: transactionsData.transactions[0].phoneNumber,
            transactionId: transactionsData.transactions[0].transactionId,
            customerName: transactionsData.transactions[0].customerName
          });
        }
        
        setTransactions(transactionsData.transactions || []);
        setOrders(ordersData.orders || []);
      } else {
        toast({
          title: 'Error Loading Data',
          description: 'Failed to load transactions or orders',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: 'Connection Error',
        description: 'Unable to connect to the server',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConnectTransaction = (transaction: MpesaTransaction) => {
    setSelectedTransaction(transaction);
    setSelectedOrderId('');
    setConnectionDialogOpen(true);
  };

  const connectTransactionToOrder = async () => {
    if (!selectedTransaction || !selectedOrderId) {
      toast({
        title: 'Missing Information',
        description: 'Please select an order to connect',
        variant: 'destructive',
      });
      return;
    }

    try {
      setConnecting(true);
      
      const response = await fetch('/api/admin/mpesa-transactions/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          transactionId: selectedTransaction.transactionId,
          orderId: selectedOrderId,
        }),
      });
      
        const data = await response.json();

      if (data.success) {
        toast({
          title: 'Transaction Connected',
          description: data.message,
          variant: 'default',
        });

        // Update transaction in local state
        setTransactions(prevTransactions =>
          prevTransactions.map(t =>
            t._id === selectedTransaction._id
              ? { ...t, isConnectedToOrder: true, connectedOrderId: selectedOrderId }
              : t
          )
        );

        setConnectionDialogOpen(false);
        setSelectedTransaction(null);
        setSelectedOrderId('');
      } else {
        toast({
          title: 'Connection Failed',
          description: data.error || 'Failed to connect transaction',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error connecting transaction:', error);
      toast({
        title: 'Error',
        description: 'Failed to connect transaction',
        variant: 'destructive',
      });
    } finally {
      setConnecting(false);
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = 
      transaction.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.phoneNumber.includes(searchTerm) ||
      transaction.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.mpesaReceiptNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'connected' && transaction.isConnectedToOrder && getConnectedOrder(transaction)) ||
      (statusFilter === 'unconnected' && !transaction.isConnectedToOrder) ||
      (statusFilter === 'missing-order' && transaction.isConnectedToOrder && !getConnectedOrder(transaction));
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (transaction: MpesaTransaction) => {
    if (transaction.isConnectedToOrder) {
      const connectedOrder = getConnectedOrder(transaction);
      if (connectedOrder) {
        return <Badge variant="default" className="bg-green-500">Connected</Badge>;
      } else {
        return <Badge variant="destructive" className="bg-red-500">Missing Order</Badge>;
      }
    } else {
      return <Badge variant="secondary" className="bg-orange-500 text-white">Unconnected</Badge>;
    }
  };

  const getConnectedOrder = (transaction: MpesaTransaction) => {
    if (!transaction.connectedOrderId) return null;
    
    const connectedOrder = orders.find(order => order._id === transaction.connectedOrderId);
    
    // Debug: Log if we can't find a connected order
    if (!connectedOrder && transaction.isConnectedToOrder) {
      console.warn('🔍 Connected transaction missing order:', {
        transactionId: transaction.transactionId,
        connectedOrderId: transaction.connectedOrderId,
        availableOrderIds: orders.map(o => o._id).slice(0, 5) // First 5 for debugging
      });
    }
    
    return connectedOrder;
  };

  // Helper function to format phone number and handle corrupted data
  const formatPhoneNumber = (phoneNumber: string) => {
    // Check if it looks like a hash (64 characters, all hex)
    if (phoneNumber && phoneNumber.length === 64 && /^[a-f0-9]+$/i.test(phoneNumber)) {
      return 'Data Error';
    }
    
    // Check if it's empty or 'Unknown'
    if (!phoneNumber || phoneNumber === 'Unknown') {
      return 'Unknown';
    }
    
    // Return the phone number as-is
    return phoneNumber;
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-green-600" />
            </div>
            M-Pesa Transactions
          </h1>
          <p className="text-gray-600 mt-2">View and manage all M-Pesa transaction records</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadData} variant="outline" size="sm" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <Receipt className="w-4 h-4 text-blue-600" />
              </div>
              Total Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {transactions.length}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              All M-Pesa transactions
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-green-600" />
              </div>
              Connected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {transactions.filter(t => t.isConnectedToOrder && getConnectedOrder(t)).length}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              Properly linked to orders
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-orange-600" />
              </div>
              Unconnected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {transactions.filter(t => !t.isConnectedToOrder || (t.isConnectedToOrder && !getConnectedOrder(t))).length}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              Need connection/fixing
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Filter Transactions
          </CardTitle>
          <CardDescription>Search and filter M-Pesa transaction records</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name, phone, transaction ID, or receipt number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Connection Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Transactions</SelectItem>
                <SelectItem value="connected">Connected</SelectItem>
                <SelectItem value="unconnected">Unconnected</SelectItem>
                <SelectItem value="missing-order">Missing Order</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="w-5 h-5" />
            M-Pesa Transactions ({filteredTransactions.length})
          </CardTitle>
          <CardDescription>
            All M-Pesa transaction records with order connection options
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
              <p className="text-gray-500">Loading transactions...</p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden lg:block rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Client Name</TableHead>
                      <TableHead>Client No</TableHead>
                      <TableHead>Amount Paid</TableHead>
                      <TableHead>Transaction Id</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Order Number</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="h-32 text-center">
                          <div className="flex flex-col items-center space-y-2">
                            <Receipt className="w-8 h-8 text-gray-400" />
                            <p className="text-gray-500">No transactions found</p>
                            <p className="text-sm text-gray-400">
                              Transactions will appear here when customers make M-Pesa payments
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredTransactions.map((transaction) => {
                        const connectedOrder = getConnectedOrder(transaction);
                        return (
                          <TableRow key={transaction._id}>
                            <TableCell className="font-medium">
                              {transaction.customerName}
                            </TableCell>
                            <TableCell>
                              <div className="font-mono text-sm">
                                {formatPhoneNumber(transaction.phoneNumber)}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium text-green-600">
                                KES {transaction.amountPaid.toLocaleString()}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="font-mono text-sm">
                                {transaction.transactionId}
                              </div>
                            </TableCell>
                            <TableCell>
                              {format(new Date(transaction.transactionDate), 'MMM dd, yyyy HH:mm')}
                            </TableCell>
                            <TableCell>
                              {connectedOrder ? (
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-blue-600">
                                    {connectedOrder.orderNumber}
                                  </span>
                                  {connectedOrder.paymentStatus === 'paid' && (
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                  )}
                                </div>
                              ) : transaction.isConnectedToOrder ? (
                                <div className="flex items-center gap-2">
                                  <span className="text-red-600 text-sm">⚠️ Order Missing</span>
                                  <span className="text-xs text-gray-500">
                                    (ID: {transaction.connectedOrderId?.substring(0, 8)}...)
                                  </span>
                                </div>
                              ) : (
                                <span className="text-gray-400">Not connected</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(transaction)}
                            </TableCell>
                            <TableCell>
                              {!transaction.isConnectedToOrder ? (
                                <Button 
                                  size="sm" 
                                  onClick={() => handleConnectTransaction(transaction)}
                                  className="gap-2"
                                >
                                  <Link2 className="w-4 h-4" />
                                  Connect
                                </Button>
                              ) : transaction.isConnectedToOrder && !getConnectedOrder(transaction) ? (
                                <div className="flex gap-1">
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => handleConnectTransaction(transaction)}
                                    className="gap-1 text-xs"
                                    title="Reconnect to a different order"
                                  >
                                    <Link2 className="w-3 h-3" />
                                    Fix
                                  </Button>
                                </div>
                              ) : null}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card View */}
              <div className="lg:hidden space-y-4">
                {filteredTransactions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-32 space-y-2">
                    <Receipt className="w-8 h-8 text-gray-400" />
                    <p className="text-gray-500">No transactions found</p>
                    <p className="text-sm text-gray-400 text-center">
                      Transactions will appear here when customers make M-Pesa payments
                    </p>
                  </div>
                ) : (
                  filteredTransactions.map((transaction) => {
                    const connectedOrder = getConnectedOrder(transaction);
                    return (
                      <Card key={transaction._id} className="p-4">
                        <div className="space-y-3">
                          {/* Header with status */}
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium text-gray-900">
                              {transaction.customerName}
                            </h3>
                            {getStatusBadge(transaction)}
                          </div>

                          {/* Amount and Phone */}
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-gray-500">Amount</p>
                              <p className="font-bold text-green-600 text-lg">
                                KES {transaction.amountPaid.toLocaleString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-500">Phone</p>
                              <p className="font-mono text-sm">
                                {formatPhoneNumber(transaction.phoneNumber)}
                              </p>
                            </div>
                          </div>

                          {/* Transaction details */}
                          <div className="space-y-2">
                            <div>
                              <p className="text-sm text-gray-500">Transaction ID</p>
                              <p className="font-mono text-sm break-all">
                                {transaction.transactionId}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Date</p>
                              <p className="text-sm">
                                {format(new Date(transaction.transactionDate), 'MMM dd, yyyy HH:mm')}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Order Number</p>
                              {connectedOrder ? (
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-blue-600">
                                    {connectedOrder.orderNumber}
                                  </span>
                                  {connectedOrder.paymentStatus === 'paid' && (
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                  )}
                                </div>
                              ) : transaction.isConnectedToOrder ? (
                                <div className="flex flex-col">
                                  <span className="text-red-600 text-sm">⚠️ Order Missing</span>
                                  <span className="text-xs text-gray-500">
                                    ID: {transaction.connectedOrderId?.substring(0, 12)}...
                                  </span>
                                </div>
                              ) : (
                                <span className="text-gray-400">Not connected</span>
                              )}
                            </div>
                          </div>

                          {/* Action button */}
                          {!transaction.isConnectedToOrder ? (
                            <Button 
                              size="sm" 
                              onClick={() => handleConnectTransaction(transaction)}
                              className="w-full gap-2"
                            >
                              <Link2 className="w-4 h-4" />
                              Connect to Order
                            </Button>
                          ) : transaction.isConnectedToOrder && !getConnectedOrder(transaction) ? (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleConnectTransaction(transaction)}
                              className="w-full gap-2 border-red-300 text-red-600 hover:bg-red-50"
                            >
                              <Link2 className="w-4 h-4" />
                              Fix Connection
                            </Button>
                          ) : null}
                        </div>
                      </Card>
                    );
                  })
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Connection Dialog */}
      <Dialog open={connectionDialogOpen} onOpenChange={setConnectionDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Link2 className="w-5 h-5 text-blue-600" />
              Connect Transaction to Order
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Select an order to connect this M-Pesa transaction to
                              </DialogDescription>
                            </DialogHeader>

          {selectedTransaction && (
                            <div className="space-y-4">
              {/* Transaction Details */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-700">Customer:</span>
                    <span className="text-sm font-bold text-gray-900">{selectedTransaction.customerName}</span>
                                  </div>
                                                        <div className="flex justify-between">
                     <span className="text-sm font-medium text-gray-700">Phone:</span>
                     <span className="text-sm font-bold text-gray-900 font-mono">{formatPhoneNumber(selectedTransaction.phoneNumber)}</span>
                   </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-700">Amount:</span>
                    <span className="text-sm font-bold text-green-600">KES {selectedTransaction.amountPaid.toLocaleString()}</span>
                                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-700">Transaction ID:</span>
                    <span className="text-sm font-mono text-gray-900">{selectedTransaction.transactionId}</span>
                                  </div>
                                </div>
                              </div>
                              
                             {/* Order Selection */}
               <div className="space-y-2">
                 <label className="block text-sm font-medium text-gray-700">
                   Select Order
                 </label>
                 <Select value={selectedOrderId} onValueChange={setSelectedOrderId}>
                   <SelectTrigger className="w-full">
                     <SelectValue placeholder="Choose an order..." />
                   </SelectTrigger>
                   <SelectContent className="max-h-[200px] overflow-y-auto">
                     {orders
                       .filter(order => order.paymentStatus !== 'paid')
                       .map((order) => (
                         <SelectItem key={order._id} value={order._id} className="text-sm">
                           <div className="flex flex-col">
                             <span className="font-medium">{order.orderNumber}</span>
                             <span className="text-xs text-gray-500">{order.customer.name}</span>
                             <span className="text-xs text-green-600">KES {(order.remainingBalance || order.totalAmount).toLocaleString()}</span>
                                          </div>
                         </SelectItem>
                       ))}
                   </SelectContent>
                 </Select>
                 <p className="text-xs text-gray-500">
                   Only showing orders that are not fully paid
                 </p>
                                          </div>
                                            </div>
                                          )}

          <DialogFooter className="gap-2">
                                        <Button
              variant="outline" 
              onClick={() => {
                setConnectionDialogOpen(false);
                setSelectedTransaction(null);
                setSelectedOrderId('');
              }}
                                          disabled={connecting}
            >
              Cancel
            </Button>
            <Button
              onClick={connectTransactionToOrder}
              disabled={connecting || !selectedOrderId}
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                                        >
                                          {connecting ? (
                <>
                                            <RefreshCw className="w-4 h-4 animate-spin" />
                  Connecting...
                </>
                                          ) : (
                <>
                                            <Link2 className="w-4 h-4" />
                  Connect Transaction
                </>
                                          )}
                                        </Button>
          </DialogFooter>
                          </DialogContent>
                        </Dialog>
    </motion.div>
  );
} 