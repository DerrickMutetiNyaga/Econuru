'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Phone, 
  User, 
  DollarSign,
  Calendar,
  Receipt,
  X,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PendingTransaction {
  _id: string;
  transactionId: string;
  mpesaReceiptNumber: string;
  transactionDate: string;
  phoneNumber: string;
  amountPaid: number;
  transactionType: string;
  customerName: string;
  notes: string;
  confirmationStatus: string;
  order?: {
    _id: string;
    orderNumber: string;
    customer: {
      name: string;
      phone: string;
    };
    totalAmount: number;
    amountPaid: number;
    paymentStatus: string;
  };
}

interface UnmatchedTransaction {
  _id: string;
  transactionId: string;
  mpesaReceiptNumber: string;
  transactionDate: string;
  phoneNumber: string;
  amountPaid: number;
  transactionType: string;
  customerName: string;
  notes: string;
  confirmationStatus: string;
}

export default function PendingPaymentsPage() {
  const { token } = useAuth();
  const { toast } = useToast();
  
  const [pendingTransactions, setPendingTransactions] = useState<PendingTransaction[]>([]);
  const [unmatchedTransactions, setUnmatchedTransactions] = useState<UnmatchedTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Confirmation dialog state
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<PendingTransaction | null>(null);
  const [confirmedCustomerName, setConfirmedCustomerName] = useState('');
  const [confirmationNotes, setConfirmationNotes] = useState('');
  const [confirming, setConfirming] = useState(false);
  
  // Rejection dialog state
  const [rejectionDialogOpen, setRejectionDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejecting, setRejecting] = useState(false);

  const fetchPendingTransactions = async () => {
    try {
      setRefreshing(true);
      const response = await fetch('/api/admin/payments/pending', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      
      if (data.success) {
        setPendingTransactions(data.pendingTransactions || []);
        setUnmatchedTransactions(data.unmatchedTransactions || []);
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to fetch pending transactions',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error fetching pending transactions:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch pending transactions',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchPendingTransactions();
    }
  }, [token]);

  const handleConfirmTransaction = (transaction: PendingTransaction) => {
    setSelectedTransaction(transaction);
    setConfirmedCustomerName(transaction.order?.customer.name || '');
    setConfirmationNotes('');
    setConfirmationDialogOpen(true);
  };

  const handleRejectTransaction = (transaction: PendingTransaction) => {
    setSelectedTransaction(transaction);
    setRejectionReason('');
    setRejectionDialogOpen(true);
  };

  const confirmTransaction = async () => {
    if (!selectedTransaction || !confirmedCustomerName.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please enter the customer name',
        variant: 'destructive',
      });
      return;
    }

    try {
      setConfirming(true);
      const response = await fetch('/api/admin/payments/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          transactionId: selectedTransaction._id,
          confirmedCustomerName: confirmedCustomerName.trim(),
          confirmationNotes: confirmationNotes.trim(),
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        toast({
          title: 'Transaction Confirmed',
          description: `Payment of KES ${selectedTransaction.amountPaid} confirmed for ${confirmedCustomerName}`,
          variant: 'default',
        });
        
        // Remove from pending list
        setPendingTransactions(prev => 
          prev.filter(t => t._id !== selectedTransaction._id)
        );
        
        setConfirmationDialogOpen(false);
        setSelectedTransaction(null);
        setConfirmedCustomerName('');
        setConfirmationNotes('');
      } else {
        toast({
          title: 'Confirmation Failed',
          description: data.error || 'Failed to confirm transaction',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error confirming transaction:', error);
      toast({
        title: 'Error',
        description: 'Failed to confirm transaction',
        variant: 'destructive',
      });
    } finally {
      setConfirming(false);
    }
  };

  const rejectTransaction = async () => {
    if (!selectedTransaction) return;

    try {
      setRejecting(true);
      const response = await fetch('/api/admin/payments/reject', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          transactionId: selectedTransaction._id,
          rejectionReason: rejectionReason.trim(),
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        toast({
          title: 'Transaction Rejected',
          description: `Payment of KES ${selectedTransaction.amountPaid} has been rejected`,
          variant: 'default',
        });
        
        // Remove from pending list
        setPendingTransactions(prev => 
          prev.filter(t => t._id !== selectedTransaction._id)
        );
        
        setRejectionDialogOpen(false);
        setSelectedTransaction(null);
        setRejectionReason('');
      } else {
        toast({
          title: 'Rejection Failed',
          description: data.error || 'Failed to reject transaction',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error rejecting transaction:', error);
      toast({
        title: 'Error',
        description: 'Failed to reject transaction',
        variant: 'destructive',
      });
    } finally {
      setRejecting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>Loading pending transactions...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Pending Payment Confirmations</h1>
            <p className="text-gray-600 mt-1">
              Verify customer names before confirming M-Pesa payments
            </p>
          </div>
          
          <Button
            onClick={fetchPendingTransactions}
            disabled={refreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Confirmations</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingTransactions.length}</div>
              <p className="text-xs text-muted-foreground">
                Transactions awaiting verification
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unmatched Transactions</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{unmatchedTransactions.length}</div>
              <p className="text-xs text-muted-foreground">
                Transactions needing manual linking
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pending Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                KES {(pendingTransactions.reduce((sum, t) => sum + t.amountPaid, 0) + 
                      unmatchedTransactions.reduce((sum, t) => sum + t.amountPaid, 0)).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Total amount pending confirmation
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Pending Transactions with Order Matches */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Matched Transactions - Awaiting Confirmation
          </h2>
          
          {pendingTransactions.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-gray-500">
                <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No pending confirmations at the moment</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {pendingTransactions.map((transaction) => (
                <Card key={transaction._id} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Transaction Details */}
                      <div>
                        <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                          <Receipt className="w-5 h-5 text-blue-600" />
                          Transaction Details
                        </h3>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Receipt Number:</span>
                            <span className="font-mono font-medium">{transaction.mpesaReceiptNumber}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Amount:</span>
                            <span className="font-bold text-green-600">KES {transaction.amountPaid.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Phone:</span>
                            <span className="font-mono">{transaction.phoneNumber}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Date:</span>
                            <span>{formatDate(transaction.transactionDate)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Type:</span>
                            <Badge variant="outline">{transaction.transactionType}</Badge>
                          </div>
                        </div>
                      </div>

                      {/* Order Details */}
                      {transaction.order && (
                        <div>
                          <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                            <DollarSign className="w-5 h-5 text-green-600" />
                            Matched Order
                          </h3>
                          
                          <div className="space-y-2 text-sm mb-4">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Order Number:</span>
                              <span className="font-mono font-medium">{transaction.order.orderNumber}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Customer:</span>
                              <span className="font-medium">{transaction.order.customer.name}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Order Total:</span>
                              <span className="font-bold">KES {transaction.order.totalAmount.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Already Paid:</span>
                              <span className="font-medium">KES {transaction.order.amountPaid.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Payment Status:</span>
                              <Badge className={
                                transaction.order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                                transaction.order.paymentStatus === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }>
                                {transaction.order.paymentStatus}
                              </Badge>
                            </div>
                          </div>

                          {/* Verification Question */}
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                            <div className="flex items-center gap-2 mb-2">
                              <User className="w-4 h-4 text-blue-600" />
                              <span className="font-medium text-blue-800">Customer Name Verification</span>
                            </div>
                            <p className="text-sm text-blue-700">
                              Please ask the customer: <strong>"What's your name?"</strong>
                            </p>
                            <p className="text-xs text-blue-600 mt-1">
                              Expected: {transaction.order.customer.name}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <Separator className="my-4" />
                    <div className="flex justify-end gap-3">
                      <Button
                        variant="outline"
                        onClick={() => handleRejectTransaction(transaction)}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                      <Button
                        onClick={() => handleConfirmTransaction(transaction)}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Confirm Payment
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Unmatched Transactions */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            Unmatched Transactions
          </h2>
          
          {unmatchedTransactions.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-gray-500">
                <CheckCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No unmatched transactions</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {unmatchedTransactions.map((transaction) => (
                <Card key={transaction._id} className="border-l-4 border-l-orange-500">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-lg mb-2">Unmatched Payment</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Receipt:</span>
                            <p className="font-mono font-medium">{transaction.mpesaReceiptNumber}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Amount:</span>
                            <p className="font-bold text-green-600">KES {transaction.amountPaid.toLocaleString()}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Phone:</span>
                            <p className="font-mono">{transaction.phoneNumber}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Date:</span>
                            <p>{formatDate(transaction.transactionDate)}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        <Badge variant="outline" className="border-orange-200 text-orange-700">
                          Needs Manual Linking
                        </Badge>
                        <Button size="sm" variant="outline">
                          Find Order
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={confirmationDialogOpen} onOpenChange={setConfirmationDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Confirm Payment
            </DialogTitle>
            <DialogDescription>
              Verify the customer name before confirming this M-Pesa payment
            </DialogDescription>
          </DialogHeader>

          {selectedTransaction && (
            <div className="space-y-4">
              {/* Transaction Summary */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-bold text-green-600">KES {selectedTransaction.amountPaid.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phone:</span>
                    <span className="font-mono">{selectedTransaction.phoneNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Receipt:</span>
                    <span className="font-mono">{selectedTransaction.mpesaReceiptNumber}</span>
                  </div>
                  {selectedTransaction.order && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Order:</span>
                      <span className="font-mono">{selectedTransaction.order.orderNumber}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Customer Name Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Name (as confirmed by customer)
                </label>
                <Input
                  value={confirmedCustomerName}
                  onChange={(e) => setConfirmedCustomerName(e.target.value)}
                  placeholder="Enter the name the customer provided"
                  className="w-full"
                />
                {selectedTransaction.order && (
                  <p className="text-xs text-gray-500 mt-1">
                    Expected: {selectedTransaction.order.customer.name}
                  </p>
                )}
              </div>

              {/* Optional Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (optional)
                </label>
                <Input
                  value={confirmationNotes}
                  onChange={(e) => setConfirmationNotes(e.target.value)}
                  placeholder="Any additional notes..."
                  className="w-full"
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => setConfirmationDialogOpen(false)}
              disabled={confirming}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmTransaction}
              disabled={confirming || !confirmedCustomerName.trim()}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {confirming ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Confirming...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Confirm Payment
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rejection Dialog */}
      <Dialog open={rejectionDialogOpen} onOpenChange={setRejectionDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <X className="w-5 h-5 text-red-600" />
              Reject Payment
            </DialogTitle>
            <DialogDescription>
              Reject this payment if the customer name doesn't match or other issues
            </DialogDescription>
          </DialogHeader>

          {selectedTransaction && (
            <div className="space-y-4">
              {/* Transaction Summary */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-bold">KES {selectedTransaction.amountPaid.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phone:</span>
                    <span className="font-mono">{selectedTransaction.phoneNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Receipt:</span>
                    <span className="font-mono">{selectedTransaction.mpesaReceiptNumber}</span>
                  </div>
                </div>
              </div>

              {/* Rejection Reason */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Rejection
                </label>
                <Input
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g., Customer name doesn't match, wrong amount, etc."
                  className="w-full"
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => setRejectionDialogOpen(false)}
              disabled={rejecting}
            >
              Cancel
            </Button>
            <Button
              onClick={rejectTransaction}
              disabled={rejecting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {rejecting ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Rejecting...
                </>
              ) : (
                <>
                  <X className="w-4 h-4 mr-2" />
                  Reject Payment
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 