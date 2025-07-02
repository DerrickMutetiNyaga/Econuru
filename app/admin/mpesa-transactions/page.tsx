"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Smartphone, 
  Link2, 
  CheckCircle, 
  Clock, 
  RefreshCw, 
  Search,
  DollarSign,
  AlertTriangle,
  Eye,
  Filter
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface MpesaTransaction {
  _id: string;
  transactionId: string;
  mpesaReceiptNumber: string;
  transactionDate: string;
  phoneNumber: string;
  amountPaid: number;
  transactionType: string;
  billRefNumber: string;
  customerName: string;
  paymentCompletedAt: string;
  isConnectedToOrder: boolean;
  connectedOrderId?: {
    _id: string;
    orderNumber: string;
    customer: { name: string };
  };
  connectedAt?: string;
  connectedBy?: string;
  notes: string;
}

interface PendingOrder {
  _id: string;
  orderNumber: string;
  customer: { name: string };
  totalAmount: number;
  createdAt: string;
}

interface Stats {
  total: number;
  unconnected: number;
  connected: number;
  totalAmount: number;
  unconnectedAmount: number;
}

export default function MpesaTransactionsPage() {
  const { isAdmin, logout, isLoading, token } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [transactions, setTransactions] = useState<MpesaTransaction[]>([]);
  const [pendingOrders, setPendingOrders] = useState<PendingOrder[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    unconnected: 0,
    connected: 0,
    totalAmount: 0,
    unconnectedAmount: 0
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState<MpesaTransaction | null>(null);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      logout();
    }
  }, [isAdmin, isLoading, logout]);

  useEffect(() => {
    if (token) {
      loadTransactions();
    }
  }, [token, filter]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/mpesa-transactions?filter=${filter}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setTransactions(data.transactions || []);
        setPendingOrders(data.pendingOrders || []);
        setStats(data.stats || stats);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to load M-Pesa transactions',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error loading M-Pesa transactions:', error);
      toast({
        title: 'Error',
        description: 'Connection error',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const connectToOrder = async (transactionId: string, orderId: string) => {
    try {
      setConnecting(true);
      const response = await fetch('/api/admin/mpesa-transactions/connect', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transactionId, orderId }),
      });
      
      if (response.ok) {
        const data = await response.json();
        toast({
          title: 'Success',
          description: data.message,
        });
        loadTransactions(); // Reload data
        setSelectedTransaction(null);
      } else {
        const errorData = await response.json();
        toast({
          title: 'Error',
          description: errorData.error || 'Failed to connect transaction',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error connecting transaction:', error);
      toast({
        title: 'Error',
        description: 'Connection error',
        variant: 'destructive',
      });
    } finally {
      setConnecting(false);
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = 
      transaction.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.phoneNumber.includes(searchTerm) ||
      transaction.mpesaReceiptNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

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
              <Smartphone className="w-5 h-5 text-green-600" />
            </div>
            M-Pesa Transaction Manager
          </h1>
          <p className="text-gray-600 mt-2">View and connect M-Pesa payments to orders</p>
        </div>
        <Button onClick={loadTransactions} variant="outline" size="sm" className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-green-600" />
              Total Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.total}</div>
            <div className="text-sm text-gray-500">All M-Pesa payments</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Link2 className="w-4 h-4 text-blue-600" />
              Connected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.connected}</div>
            <div className="text-sm text-gray-500">Linked to orders</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-600" />
              Unconnected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.unconnected}</div>
            <div className="text-sm text-gray-500">Need connection</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-purple-600" />
              Total Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              KES {stats.totalAmount.toLocaleString()}
            </div>
            <div className="text-sm text-gray-500">All transactions</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Clock className="w-4 h-4 text-red-600" />
              Unconnected Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              KES {stats.unconnectedAmount.toLocaleString()}
            </div>
            <div className="text-sm text-gray-500">Needs attention</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filter Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by transaction ID, customer name, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Transactions</SelectItem>
                <SelectItem value="unconnected">Unconnected</SelectItem>
                <SelectItem value="connected">Connected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Transactions List */}
      <Card>
        <CardHeader>
          <CardTitle>M-Pesa Transactions ({filteredTransactions.length})</CardTitle>
          <CardDescription>
            Manage M-Pesa payments and connect them to orders
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex flex-col items-center justify-center h-32 space-y-4">
              <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
              <p className="text-gray-500">Loading transactions...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTransactions.map((transaction) => (
                <div key={transaction._id} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Badge 
                        variant={transaction.isConnectedToOrder ? "default" : "destructive"}
                        className="gap-1"
                      >
                        {transaction.isConnectedToOrder ? (
                          <>
                            <CheckCircle className="w-3 h-3" />
                            Connected
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="w-3 h-3" />
                            Unconnected
                          </>
                        )}
                      </Badge>
                      <code className="text-sm bg-gray-200 px-2 py-1 rounded">
                        {transaction.transactionId}
                      </code>
                    </div>
                                          <div className="text-right">
                        <div className="font-bold text-lg">
                          KES {transaction.amountPaid.toLocaleString()}
                        </div>
                        {transaction.connectedOrderId && (
                          <div className="text-xs text-blue-600">
                            Order: {transaction.connectedOrderId.orderNumber}
                          </div>
                        )}
                        <div className="text-sm text-gray-500">
                          {format(new Date(transaction.transactionDate), 'MMM dd, HH:mm')}
                        </div>
                      </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-sm mb-3">
                    <div>
                      <span className="font-medium text-gray-600">Transaction ID:</span>
                      <div className="font-mono text-blue-700 font-bold">
                        {transaction.transactionId}
                      </div>
                      <div className="text-xs text-gray-500">M-Pesa Receipt</div>
                    </div>

                    <div>
                      <span className="font-medium text-gray-600">Customer:</span>
                      <div className="font-semibold">{transaction.customerName}</div>
                      <div className="text-gray-500 font-mono">{transaction.phoneNumber}</div>
                    </div>

                    <div>
                      <span className="font-medium text-gray-600">Order Number:</span>
                      <div>
                        {transaction.isConnectedToOrder ? (
                          <div className="flex flex-col">
                            <span className="font-bold text-blue-600">
                              {transaction.connectedOrderId?.orderNumber}
                            </span>
                            <span className="text-xs text-green-600">Connected</span>
                          </div>
                        ) : (
                          <div className="flex flex-col">
                            <span className="text-orange-600 font-medium">Not Connected</span>
                            <span className="text-xs text-gray-500">Needs connection</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <span className="font-medium text-gray-600">Amount Paid:</span>
                      <div className="font-bold text-green-700 text-lg">
                        KES {transaction.amountPaid.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {format(new Date(transaction.transactionDate), 'MMM dd, HH:mm')}
                      </div>
                    </div>
                    
                    <div className="flex justify-end items-center">
                      {!transaction.isConnectedToOrder ? (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              size="sm" 
                              onClick={() => setSelectedTransaction(transaction)}
                              className="gap-2 bg-orange-600 hover:bg-orange-700"
                            >
                              <Link2 className="w-4 h-4" />
                              Connect to Order
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Connect M-Pesa Transaction</DialogTitle>
                              <DialogDescription>
                                Connect transaction {transaction.transactionId} (KES {transaction.amountPaid.toLocaleString()}) to an order
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="bg-blue-50 p-4 rounded-lg">
                                <h4 className="font-semibold mb-2 text-blue-800">Transaction Details:</h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <strong>Transaction ID:</strong> {transaction.transactionId}
                                  </div>
                                  <div>
                                    <strong>Amount Paid:</strong> KES {transaction.amountPaid.toLocaleString()}
                                  </div>
                                  <div>
                                    <strong>Customer Name:</strong> {transaction.customerName}
                                  </div>
                                  <div>
                                    <strong>Phone Number:</strong> {transaction.phoneNumber}
                                  </div>
                                  <div>
                                    <strong>Payment Date:</strong> {format(new Date(transaction.transactionDate), 'MMM dd, yyyy HH:mm')}
                                  </div>
                                  <div>
                                    <strong>Payment Type:</strong> {transaction.transactionType}
                                  </div>
                                </div>
                              </div>
                              
                              <div>
                                <h4 className="font-medium mb-2">Available Orders for Connection:</h4>
                                <div className="space-y-2 max-h-64 overflow-y-auto">
                                  {pendingOrders.map((order) => {
                                    const isExactMatch = order.totalAmount === transaction.amountPaid;
                                    const isPartialMatch = transaction.amountPaid < order.totalAmount;
                                    
                                    return (
                                      <div 
                                        key={order._id} 
                                        className={`flex items-center justify-between p-3 border rounded ${
                                          isExactMatch ? 'bg-green-50 border-green-200' : 
                                          isPartialMatch ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50'
                                        }`}
                                      >
                                        <div>
                                          <div className="font-medium flex items-center gap-2">
                                            {order.orderNumber}
                                            {isExactMatch && (
                                              <Badge variant="default" className="bg-green-600 text-xs">
                                                Exact Match
                                              </Badge>
                                            )}
                                            {isPartialMatch && (
                                              <Badge variant="secondary" className="bg-yellow-600 text-white text-xs">
                                                Partial Payment
                                              </Badge>
                                            )}
                                          </div>
                                          <div className="text-sm text-gray-600">
                                            {order.customer.name} - KES {order.totalAmount.toLocaleString()}
                                          </div>
                                          <div className="text-xs text-gray-500">
                                            {format(new Date(order.createdAt), 'MMM dd, yyyy')}
                                          </div>
                                          {isPartialMatch && (
                                            <div className="text-xs text-yellow-700 mt-1">
                                              Shortfall: KES {(order.totalAmount - transaction.amountPaid).toLocaleString()}
                                            </div>
                                          )}
                                        </div>
                                        <Button
                                          size="sm"
                                          onClick={() => connectToOrder(transaction.transactionId, order._id)}
                                          disabled={connecting}
                                          className="gap-2"
                                          variant={isExactMatch ? "default" : isPartialMatch ? "secondary" : "outline"}
                                        >
                                          {connecting ? (
                                            <RefreshCw className="w-4 h-4 animate-spin" />
                                          ) : (
                                            <Link2 className="w-4 h-4" />
                                          )}
                                          Connect
                                        </Button>
                                      </div>
                                    );
                                  })}
                                  {pendingOrders.length === 0 && (
                                    <p className="text-gray-500 text-center py-4">
                                      No pending orders found
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      ) : (
                        <Badge variant="default" className="bg-green-600">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Connected
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredTransactions.length === 0 && (
                <div className="text-center py-8">
                  <Smartphone className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">No M-Pesa transactions found</p>
                  <p className="text-sm text-gray-400">
                    Transactions will appear here when customers pay to till number 7092156
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
} 