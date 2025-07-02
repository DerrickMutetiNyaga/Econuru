"use client"

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  MapPin,
  Package,
  DollarSign,
  Eye,
  Edit,
  Trash2,
  Plus,
  ArrowUpDown,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Download,
  CalendarDays,
  CalendarRange,
  CalendarCheck,
  Grid3X3,
  List,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Order {
  _id: string;
  orderNumber: string;
  customer: {
    name: string;
    phone: string;
    email?: string;
    address?: string;
  };
  services: Array<{
    serviceId: string;
    serviceName: string;
    quantity: number;
    price: string;
  }>;
  pickupDate?: string;
  pickupTime?: string;
  notes?: string;
  location: string;
  totalAmount: number;
  pickDropAmount?: number;
  discount?: number;
  paymentStatus?: 'unpaid' | 'paid' | 'partially_paid' | 'pending' | 'failed';
  amountPaid?: number;
  laundryStatus?: 'to-be-picked' | 'picked' | 'in-progress' | 'ready' | 'delivered';
  status: 'pending' | 'confirmed' | 'in-progress' | 'ready' | 'delivered' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  promoCode?: string;
  promoDiscount?: number;
  mpesaPayment?: {
    checkoutRequestId?: string;
    mpesaReceiptNumber?: string;
    transactionDate?: Date;
    phoneNumber?: string;
    amountPaid?: number;
    resultCode?: number;
    resultDescription?: string;
    paymentInitiatedAt?: Date;
    paymentCompletedAt?: Date;
  };
}

const statusColors = {
  pending: 'bg-amber-100 text-amber-800 border border-amber-200',
  confirmed: 'bg-blue-100 text-blue-800 border border-blue-200',
  'in-progress': 'bg-orange-100 text-orange-800 border border-orange-200',
  ready: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
  delivered: 'bg-purple-100 text-purple-800 border border-purple-200',
  cancelled: 'bg-red-100 text-red-800 border border-red-200',
};

const statusIcons = {
  pending: AlertCircle,
  confirmed: CheckCircle,
  'in-progress': Loader2,
  ready: CheckCircle,
  delivered: CheckCircle,
  cancelled: XCircle,
};

export default function OrdersPage() {
  const { isAdmin, logout, isLoading, token } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [laundryStatusFilter, setLaundryStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(9);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  // M-Pesa payment states
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [orderForPayment, setOrderForPayment] = useState<Order | null>(null);
  const [paymentPhone, setPaymentPhone] = useState('');
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [initiatingPayment, setInitiatingPayment] = useState(false);
  const [checkingPayment, setCheckingPayment] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      logout();
    }
  }, [isAdmin, isLoading, logout]);

  if (!isAdmin) return null;

  // Fetch orders
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/orders', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
        setFilteredOrders(data.orders || []);
      } else {
        console.error('Failed to fetch orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchOrders();
    }
  }, [token]);

  // Filter and sort orders
  useEffect(() => {
    let filtered = orders;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer.phone.includes(searchTerm) ||
        order.customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Apply laundry status filter
    if (laundryStatusFilter !== 'all') {
      filtered = filtered.filter(order => (order.laundryStatus || 'to-be-picked') === laundryStatusFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'orderNumber':
          aValue = a.orderNumber;
          bValue = b.orderNumber;
          break;
        case 'customerName':
          aValue = a.customer.name;
          bValue = b.customer.name;
          break;
        case 'totalAmount':
          aValue = a.totalAmount;
          bValue = b.totalAmount;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        default:
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredOrders(filtered);
    // Reset to first page when filters change
    setCurrentPage(1);
  }, [orders, searchTerm, statusFilter, laundryStatusFilter, sortBy, sortOrder]);

  // Pagination logic
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  const goToPage = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setViewDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusIcon = (status: string) => {
    const IconComponent = statusIcons[status as keyof typeof statusIcons];
    return IconComponent ? <IconComponent className="w-4 h-4" /> : null;
  };

  const handleAcceptOrder = async (order: Order) => {
    try {
      setUpdating(true);
      const response = await fetch(`/api/orders/${order._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: 'confirmed',
          laundryStatus: 'to-be-picked'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(prevOrders => 
          prevOrders.map(o => o._id === order._id ? data.order : o)
        );
        if (selectedOrder?._id === order._id) {
          setSelectedOrder(data.order);
        }
      } else {
        const errorData = await response.json();
        toast({
          title: 'Failed to accept order',
          description: errorData?.error || 'Unknown error',
          variant: 'destructive',
        });
        console.error('Failed to accept order', errorData);
      }
    } catch (error) {
      toast({
        title: 'Error accepting order',
        description: error instanceof Error ? error.message : String(error),
        variant: 'destructive',
      });
      console.error('Error accepting order:', error);
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateOrder = async (orderId: string, updateData: Partial<Order>) => {
    try {
      setUpdating(true);
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        const data = await response.json();
        // Update the order in the local state
        setOrders(prevOrders => 
          prevOrders.map(o => o._id === orderId ? data.order : o)
        );
        if (selectedOrder?._id === orderId) {
          setSelectedOrder(data.order);
        }
      } else {
        console.error('Failed to update order');
      }
    } catch (error) {
      console.error('Error updating order:', error);
    } finally {
      setUpdating(false);
    }
  };

  const handleEditOrder = (order: Order) => {
    // Redirect to POS system with order ID for editing
    router.push(`/admin/pos?editOrder=${order._id}`);
  };

  const handleDeleteOrder = async (order: Order) => {
    setOrderToDelete(order);
    setDeleteDialogOpen(true);
  };

  // M-Pesa Payment Functions
  const handleInitiatePayment = (order: Order) => {
    setOrderForPayment(order);
    setPaymentPhone(order.customer.phone);
    setPaymentAmount(order.totalAmount);
    setPaymentDialogOpen(true);
  };

  const initiateSTKPush = async () => {
    if (!orderForPayment || !paymentPhone || !paymentAmount) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all payment details',
        variant: 'destructive',
      });
      return;
    }

    try {
      setInitiatingPayment(true);

      const response = await fetch('/api/mpesa/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          orderId: orderForPayment._id,
          phoneNumber: paymentPhone,
          amount: paymentAmount,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Payment Initiated',
          description: data.customerMessage || 'STK push sent to customer',
          variant: 'default',
        });

        // Update order status in local state
        setOrders(prevOrders =>
          prevOrders.map(order =>
            order._id === orderForPayment._id
              ? { ...order, paymentStatus: 'pending' as const }
              : order
          )
        );

        setPaymentDialogOpen(false);
        setOrderForPayment(null);
        setPaymentPhone('');
        setPaymentAmount(0);

        // Start polling for payment status
        pollPaymentStatus(data.checkoutRequestId);
      } else {
        toast({
          title: 'Payment Failed',
          description: data.error || 'Failed to initiate payment',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error initiating payment:', error);
      toast({
        title: 'Error',
        description: 'Failed to initiate payment',
        variant: 'destructive',
      });
    } finally {
      setInitiatingPayment(false);
    }
  };

  const pollPaymentStatus = async (checkoutRequestId: string) => {
    let attempts = 0;
    const maxAttempts = 30; // Poll for 5 minutes (30 * 10 seconds)

    const poll = async () => {
      try {
        setCheckingPayment(true);
        const response = await fetch(`/api/mpesa/status/${checkoutRequestId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        const data = await response.json();
        
        if (data.success && data.order) {
          const updatedOrder = data.order;
          
          // Update order in local state
          setOrders(prevOrders =>
            prevOrders.map(order =>
              order._id === updatedOrder._id
                ? { ...order, paymentStatus: updatedOrder.paymentStatus, mpesaPayment: updatedOrder.mpesaPayment }
                : order
            )
          );

          // Check if payment is completed (success or failure)
          if (updatedOrder.paymentStatus === 'paid' || updatedOrder.paymentStatus === 'failed') {
            setCheckingPayment(false);
            
            toast({
              title: updatedOrder.paymentStatus === 'paid' ? 'Payment Successful' : 'Payment Failed',
              description: updatedOrder.paymentStatus === 'paid' 
                ? `Payment completed. Receipt: ${updatedOrder.mpesaPayment?.mpesaReceiptNumber || 'N/A'}`
                : `Payment failed: ${updatedOrder.mpesaPayment?.resultDescription || 'Unknown error'}`,
              variant: updatedOrder.paymentStatus === 'paid' ? 'default' : 'destructive',
            });
            
            return; // Stop polling
          }
        }

        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, 10000); // Poll every 10 seconds
        } else {
          setCheckingPayment(false);
          toast({
            title: 'Payment Status Unknown',
            description: 'Payment status check timed out. Please check manually.',
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('Error checking payment status:', error);
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, 10000);
        } else {
          setCheckingPayment(false);
        }
      }
    };

    poll();
  };

  const checkPaymentStatus = async (order: Order) => {
    if (!order.mpesaPayment?.checkoutRequestId) {
      toast({
        title: 'No Payment Request',
        description: 'No M-Pesa payment request found for this order',
        variant: 'destructive',
      });
      return;
    }

    try {
      setCheckingPayment(true);
      const response = await fetch(`/api/mpesa/status/${order.mpesaPayment.checkoutRequestId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      
      if (data.success && data.order) {
        const updatedOrder = data.order;
        
        // Update order in local state
        setOrders(prevOrders =>
          prevOrders.map(o =>
            o._id === updatedOrder._id
              ? { ...o, paymentStatus: updatedOrder.paymentStatus, mpesaPayment: updatedOrder.mpesaPayment }
              : o
          )
        );

        toast({
          title: 'Payment Status Updated',
          description: `Payment status: ${updatedOrder.paymentStatus}`,
          variant: 'default',
        });
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to check payment status',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
      toast({
        title: 'Error',
        description: 'Failed to check payment status',
        variant: 'destructive',
      });
    } finally {
      setCheckingPayment(false);
    }
  };

  const confirmDeleteOrder = async () => {
    if (!orderToDelete) return;
    
    try {
      setDeleting(true);
      const response = await fetch(`/api/orders/${orderToDelete._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error('Failed to parse response as JSON:', jsonError);
        data = { success: false, error: 'Invalid response from server' };
      }
      
      if (response.ok && data.success) {
        // Remove the order from the local state
        setOrders(prevOrders => prevOrders.filter(order => order._id !== orderToDelete._id));
        setFilteredOrders(prevOrders => prevOrders.filter(order => order._id !== orderToDelete._id));
        setDeleteDialogOpen(false);
        setOrderToDelete(null);
        
        // Show success toast
        toast({
          title: "Order Deleted",
          description: `Order ${orderToDelete.orderNumber} has been successfully deleted.`,
          variant: "default",
        });
      } else {
        console.error('Failed to delete order:', {
          status: response.status,
          statusText: response.statusText,
          data: data,
          orderId: orderToDelete._id
        });
        // Show error toast with more specific message
        toast({
          title: "Delete Failed",
          description: data.error || `Failed to delete order. Status: ${response.status}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error deleting order:', error);
      // Show error toast
      toast({
        title: "Delete Failed",
        description: "An error occurred while deleting the order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  const exportToCSV = (ordersToExport: Order[], filename: string) => {
    // Define CSV headers
    const headers = [
      'Order Number',
      'Customer Name',
      'Customer Phone',
      'Customer Email',
      'Customer Address',
      'Location',
      'Services',
      'Total Amount',
      'Pick & Drop Amount',
      'Discount',
      'Payment Status',
      'Laundry Status',
      'Order Status',
      'Pickup Date',
      'Pickup Time',
      'Notes',
      'Created Date',
      'Updated Date',
      'Promo Code',
      'Promo Discount'
    ];

    // Convert orders to CSV rows
    const csvRows = [headers.join(',')];

    ordersToExport.forEach(order => {
      const services = order.services.map(service => 
        `${service.serviceName} (${service.quantity}x Ksh${service.price})`
      ).join('; ');

      const row = [
        order.orderNumber,
        order.customer.name,
        order.customer.phone,
        order.customer.email || '',
        order.customer.address || '',
        order.location,
        services,
        order.totalAmount,
        order.pickDropAmount || 0,
        order.discount || 0,
        order.paymentStatus || 'unpaid',
        order.laundryStatus || 'to-be-picked',
        order.status,
        order.pickupDate || '',
        order.pickupTime || '',
        order.notes || '',
        new Date(order.createdAt).toLocaleDateString(),
        new Date(order.updatedAt).toLocaleDateString(),
        order.promoCode || '-',
        order.promoDiscount ? `Ksh ${order.promoDiscount}` : '-'
      ].map(field => `"${field}"`).join(',');

      csvRows.push(row);
    });

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleExportAll = () => {
    if (filteredOrders.length === 0) {
      toast({
        title: "No Orders to Export",
        description: "There are no orders to export.",
        variant: "destructive",
      });
      return;
    }

    setExporting(true);
    try {
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `orders_export_${timestamp}.csv`;
      exportToCSV(filteredOrders, filename);
      
      toast({
        title: "Export Successful",
        description: `${filteredOrders.length} orders exported to ${filename}`,
        variant: "default",
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export orders. Please try again.",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  const handleExportCurrentPage = () => {
    if (currentOrders.length === 0) {
      toast({
        title: "No Orders to Export",
        description: "There are no orders on the current page to export.",
        variant: "destructive",
      });
      return;
    }

    setExporting(true);
    try {
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `orders_page_${currentPage}_${timestamp}.csv`;
      exportToCSV(currentOrders, filename);
      
      toast({
        title: "Export Successful",
        description: `${currentOrders.length} orders from page ${currentPage} exported to ${filename}`,
        variant: "default",
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export orders. Please try again.",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  // Helper function to filter orders by time period
  const filterOrdersByTimePeriod = (period: 'today' | 'week' | 'month' | 'all') => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return filteredOrders.filter(order => {
      const orderDate = new Date(order.createdAt);
      
      switch (period) {
        case 'today':
          return orderDate >= today;
        case 'week':
          const weekAgo = new Date(today);
          weekAgo.setDate(today.getDate() - 7);
          return orderDate >= weekAgo;
        case 'month':
          const monthAgo = new Date(today);
          monthAgo.setMonth(today.getMonth() - 1);
          return orderDate >= monthAgo;
        case 'all':
        default:
          return true;
      }
    });
  };

  // Export functions for different time periods
  const handleExportToday = () => {
    const todayOrders = filterOrdersByTimePeriod('today');
    
    if (todayOrders.length === 0) {
      toast({
        title: "No Orders to Export",
        description: "There are no orders from today to export.",
        variant: "destructive",
      });
      return;
    }

    setExporting(true);
    try {
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `orders_today_${timestamp}.csv`;
      exportToCSV(todayOrders, filename);
      
      toast({
        title: "Export Successful",
        description: `${todayOrders.length} orders from today exported to ${filename}`,
        variant: "default",
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export orders. Please try again.",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  const handleExportThisWeek = () => {
    const weekOrders = filterOrdersByTimePeriod('week');
    
    if (weekOrders.length === 0) {
      toast({
        title: "No Orders to Export",
        description: "There are no orders from this week to export.",
        variant: "destructive",
      });
      return;
    }

    setExporting(true);
    try {
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `orders_this_week_${timestamp}.csv`;
      exportToCSV(weekOrders, filename);
      
      toast({
        title: "Export Successful",
        description: `${weekOrders.length} orders from this week exported to ${filename}`,
        variant: "default",
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export orders. Please try again.",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  const handleExportThisMonth = () => {
    const monthOrders = filterOrdersByTimePeriod('month');
    
    if (monthOrders.length === 0) {
      toast({
        title: "No Orders to Export",
        description: "There are no orders from this month to export.",
        variant: "destructive",
      });
      return;
    }

    setExporting(true);
    try {
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `orders_this_month_${timestamp}.csv`;
      exportToCSV(monthOrders, filename);
      
      toast({
        title: "Export Successful",
        description: `${monthOrders.length} orders from this month exported to ${filename}`,
        variant: "default",
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export orders. Please try again.",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Orders</h1>
          <p className="text-gray-600 text-lg">
            Manage and track all customer orders
            {filteredOrders.length > 0 && (
              <span className="ml-2 text-sm bg-mint-green/10 text-mint-green px-2 py-1 rounded-full">
                {filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''}
                {filteredOrders.length > ordersPerPage && (
                  <span className="ml-1">
                    (Page {currentPage} of {totalPages})
                  </span>
                )}
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={fetchOrders}
            className="flex items-center gap-2 border-gray-300 hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
          
          {/* Export Buttons */}
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  disabled={exporting || filteredOrders.length === 0}
                  className="flex items-center gap-2 border-blue-300 text-blue-600 hover:bg-blue-50"
                >
                  {exporting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem 
                  onClick={handleExportAll}
                  disabled={exporting || filteredOrders.length === 0}
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export All Orders
                  <span className="ml-auto text-xs text-gray-500">
                    ({filteredOrders.length})
                  </span>
                </DropdownMenuItem>
                
                <DropdownMenuItem 
                  onClick={handleExportCurrentPage}
                  disabled={exporting || currentOrders.length === 0}
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export Current Page
                  <span className="ml-auto text-xs text-gray-500">
                    ({currentOrders.length})
                  </span>
                </DropdownMenuItem>
                
                <DropdownMenuItem className="h-px bg-gray-200 my-1" />
                
                <DropdownMenuItem 
                  onClick={handleExportToday}
                  disabled={exporting || filterOrdersByTimePeriod('today').length === 0}
                  className="flex items-center gap-2"
                >
                  <CalendarCheck className="w-4 h-4" />
                  Export Today's Orders
                  <span className="ml-auto text-xs text-gray-500">
                    ({filterOrdersByTimePeriod('today').length})
                  </span>
                </DropdownMenuItem>
                
                <DropdownMenuItem 
                  onClick={handleExportThisWeek}
                  disabled={exporting || filterOrdersByTimePeriod('week').length === 0}
                  className="flex items-center gap-2"
                >
                  <CalendarRange className="w-4 h-4" />
                  Export This Week's Orders
                  <span className="ml-auto text-xs text-gray-500">
                    ({filterOrdersByTimePeriod('week').length})
                  </span>
                </DropdownMenuItem>
                
                <DropdownMenuItem 
                  onClick={handleExportThisMonth}
                  disabled={exporting || filterOrdersByTimePeriod('month').length === 0}
                  className="flex items-center gap-2"
                >
                  <CalendarDays className="w-4 h-4" />
                  Export This Month's Orders
                  <span className="ml-auto text-xs text-gray-500">
                    ({filterOrdersByTimePeriod('month').length})
                  </span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {/* View Toggle - Only visible on laptops and desktops */}
          <div className="hidden lg:flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className={`h-8 px-3 ${
                viewMode === 'grid' 
                  ? 'bg-white text-mint-green shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className={`h-8 px-3 ${
                viewMode === 'list' 
                  ? 'bg-white text-mint-green shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
          
          <Button 
            className="bg-mint-green hover:bg-mint-green/90 text-white shadow-lg"
            onClick={() => router.push('/admin/pos')}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Order
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-white to-gray-50">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-gray-300 focus:border-mint-green focus:ring-mint-green"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="border-gray-300 focus:border-mint-green focus:ring-mint-green">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="ready">Ready</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select value={laundryStatusFilter} onValueChange={setLaundryStatusFilter}>
              <SelectTrigger className="border-gray-300 focus:border-mint-green focus:ring-mint-green">
                <SelectValue placeholder="Laundry Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Laundry Status</SelectItem>
                <SelectItem value="to-be-picked">To Be Picked</SelectItem>
                <SelectItem value="picked">Picked</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="ready">Ready</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="border-gray-300 focus:border-mint-green focus:ring-mint-green">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">Date Created</SelectItem>
                <SelectItem value="orderNumber">Order Number</SelectItem>
                <SelectItem value="customerName">Customer Name</SelectItem>
                <SelectItem value="totalAmount">Total Amount</SelectItem>
                <SelectItem value="status">Status</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="flex items-center gap-2 border-gray-300 hover:bg-gray-50"
            >
              <ArrowUpDown className="w-4 h-4" />
              {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Orders Display */}
      {viewMode === 'grid' ? (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {currentOrders.map((order) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer group border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 h-full flex flex-col justify-between">
                  <CardHeader className="pb-3 relative overflow-hidden">
                    {/* Status Badges */}
                    <div className="absolute top-4 right-4 z-10 flex flex-col gap-1">
                      <Badge className={`${statusColors[order.status]} flex items-center gap-1 px-2 py-1 font-semibold shadow-sm text-xs`}>
                        {getStatusIcon(order.status)}
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                      <Badge className={`text-xs px-2 py-1 ${
                        (order.paymentStatus || 'unpaid') === 'paid' 
                          ? 'bg-green-100 text-green-800 border-green-200' 
                          : (order.paymentStatus || 'unpaid') === 'partially_paid'
                          ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                          : (order.paymentStatus || 'unpaid') === 'pending'
                          ? 'bg-blue-100 text-blue-800 border-blue-200'
                          : (order.paymentStatus || 'unpaid') === 'failed'
                          ? 'bg-red-100 text-red-800 border-red-200'
                          : 'bg-gray-100 text-gray-800 border-gray-200'
                      }`}>
                        {(order.paymentStatus || 'unpaid') === 'partially_paid' ? 'Partial' : (order.paymentStatus || 'unpaid').charAt(0).toUpperCase() + (order.paymentStatus || 'unpaid').slice(1)}
                        {(order.paymentStatus || 'unpaid') === 'partially_paid' && order.amountPaid && (
                          <span className="ml-1 text-xs">
                            ({order.amountPaid.toLocaleString()}/{order.totalAmount.toLocaleString()})
                          </span>
                        )}
                      </Badge>
                      {order.promoCode && (
                        <Badge className="bg-green-100 text-green-800 border-green-200 text-xs px-2 py-1 font-semibold shadow-sm flex items-center gap-1">
                          <span>Promo:</span>
                          <span className="font-mono">{order.promoCode}</span>
                          {order.promoDiscount ? (
                            <span className="ml-1">-Ksh {order.promoDiscount.toLocaleString()}</span>
                          ) : null}
                        </Badge>
                      )}
                    </div>
                    
                    {/* Order Number with Icon */}
                    <div className="flex items-start justify-between pr-20">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 bg-mint-green rounded-lg flex items-center justify-center">
                            <Package className="w-4 h-4 text-white" />
                          </div>
                          <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            {order.orderNumber}
                          </CardTitle>
                        </div>
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(order.createdAt)}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Customer Info */}
                    <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-blue-600" />
                          <span className="font-semibold text-blue-900 text-sm">Customer</span>
                        </div>
                        <Badge className={`text-xs px-2 py-1 ${
                          (order.laundryStatus || 'to-be-picked') === 'delivered' 
                            ? 'bg-green-100 text-green-800 border-green-200'
                            : (order.laundryStatus || 'to-be-picked') === 'ready'
                            ? 'bg-blue-100 text-blue-800 border-blue-200'
                            : (order.laundryStatus || 'to-be-picked') === 'in-progress'
                            ? 'bg-orange-100 text-orange-800 border-orange-200'
                            : (order.laundryStatus || 'to-be-picked') === 'picked'
                            ? 'bg-purple-100 text-purple-800 border-purple-200'
                            : 'bg-gray-100 text-gray-800 border-gray-200'
                        }`}>
                          {(order.laundryStatus || 'to-be-picked').split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <p className="font-medium text-gray-900 text-sm">{order.customer.name}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <Phone className="w-3 h-3" />
                          <span>{order.customer.phone}</span>
                        </div>
                        {order.customer.email && (
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <Mail className="w-3 h-3" />
                            <span className="truncate">{order.customer.email}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Services Summary */}
                    <div className="bg-green-50 rounded-lg p-3 border border-green-100">
                      <div className="flex items-center gap-2 mb-2">
                        <Package className="w-4 h-4 text-green-600" />
                        <span className="font-semibold text-green-900 text-sm">Services</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">
                          {order.services.length} service{order.services.length !== 1 ? 's' : ''}
                        </span>
                        <span className="text-xs text-gray-500">
                          {order.services.reduce((total, service) => total + service.quantity, 0)} items
                        </span>
                      </div>
                    </div>

                    {/* Financial Summary */}
                    <div className="bg-amber-50 rounded-lg p-3 border border-amber-100">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="w-4 h-4 text-amber-600" />
                        <span className="font-semibold text-amber-900 text-sm">Financial</span>
                        {order.promoCode && (
                          <Badge className="bg-green-100 text-green-800 border-green-200 text-xs px-2 py-1 font-semibold shadow-sm flex items-center gap-1 ml-2">
                            <span>Promo:</span>
                            <span className="font-mono">{order.promoCode}</span>
                            {order.promoDiscount ? (
                              <span className="ml-1">-Ksh {order.promoDiscount.toLocaleString()}</span>
                            ) : null}
                          </Badge>
                        )}
                      </div>
                      <div className="space-y-1">
                        {(order.pickDropAmount || 0) > 0 && (
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-600">Pick & Drop:</span>
                            <span className="text-blue-600 font-medium">+Ksh {(order.pickDropAmount || 0).toLocaleString()}</span>
                          </div>
                        )}
                        {(order.discount || 0) > 0 && (
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-600">Discount:</span>
                            <span className="text-red-600 font-medium">-Ksh {(order.discount || 0).toLocaleString()}</span>
                          </div>
                        )}
                        {(order.promoDiscount || 0) > 0 && (
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-600">Promo Discount:</span>
                            <span className="text-green-600 font-medium">-Ksh {(order.promoDiscount || 0).toLocaleString()}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-xs pt-1 border-t border-amber-200">
                          <span className="text-gray-700 font-medium">Total:</span>
                          <span className="text-mint-green font-bold">Ksh {(order.totalAmount || 0).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Status Information */}
                    <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-100">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-indigo-600" />
                        <span className="font-semibold text-indigo-900 text-sm">Status</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-600">Payment:</span>
                          <Badge className={`text-xs px-2 py-1 ${
                            (order.paymentStatus || 'unpaid') === 'paid' 
                              ? 'bg-green-100 text-green-800 border-green-200' 
                              : (order.paymentStatus || 'unpaid') === 'partially_paid'
                              ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                              : (order.paymentStatus || 'unpaid') === 'pending'
                              ? 'bg-blue-100 text-blue-800 border-blue-200'
                              : (order.paymentStatus || 'unpaid') === 'failed'
                              ? 'bg-red-100 text-red-800 border-red-200'
                              : 'bg-gray-100 text-gray-800 border-gray-200'
                          }`}>
                            {(order.paymentStatus || 'unpaid') === 'partially_paid' ? 'Partial' : (order.paymentStatus || 'unpaid').charAt(0).toUpperCase() + (order.paymentStatus || 'unpaid').slice(1)}
                          </Badge>
                          {(order.paymentStatus || 'unpaid') === 'partially_paid' && order.amountPaid && (
                            <div className="text-xs text-yellow-700 mt-1">
                              KES {order.amountPaid.toLocaleString()} of KES {order.totalAmount.toLocaleString()}
                            </div>
                          )}
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-600">Laundry:</span>
                          <Badge className={`text-xs px-2 py-1 ${
                            (order.laundryStatus || 'to-be-picked') === 'delivered' 
                              ? 'bg-green-100 text-green-800 border-green-200'
                              : (order.laundryStatus || 'to-be-picked') === 'ready'
                              ? 'bg-blue-100 text-blue-800 border-blue-200'
                              : (order.laundryStatus || 'to-be-picked') === 'in-progress'
                              ? 'bg-orange-100 text-orange-800 border-orange-200'
                              : (order.laundryStatus || 'to-be-picked') === 'picked'
                              ? 'bg-purple-100 text-purple-800 border-purple-200'
                              : 'bg-gray-100 text-gray-800 border-gray-200'
                          }`}>
                            {(order.laundryStatus || 'to-be-picked').split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Pickup Info */}
                    {order.pickupDate && (
                      <div className="bg-purple-50 rounded-lg p-3 border border-purple-100">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="w-4 h-4 text-purple-600" />
                          <span className="font-semibold text-purple-900 text-sm">Pickup</span>
                        </div>
                        <div className="text-sm text-gray-700">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>{order.pickupDate}</span>
                          </div>
                          {order.pickupTime && (
                            <div className="flex items-center gap-1 mt-1">
                              <Clock className="w-3 h-3" />
                              <span>{order.pickupTime}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Total Amount */}
                    <div className="bg-gradient-to-r from-mint-green to-green-500 rounded-lg p-4 text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium opacity-90">Total Amount</p>
                          <p className="text-2xl font-bold">
                            Ksh {(order.totalAmount || 0).toLocaleString()}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewOrder(order);
                          }}
                          className="text-white hover:bg-white/20"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      {order.status === 'pending' && (
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAcceptOrder(order);
                          }}
                          disabled={updating}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                        >
                          {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                          Accept Order
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditOrder(order);
                        }}
                        className="flex-1 border-mint-green text-mint-green hover:bg-mint-green hover:text-white"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteOrder(order);
                        }}
                        className="flex-1 border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </Button>
                    </div>

                    {/* Payment Actions */}
                    <div className="flex gap-2 pt-2">
                      {(order.paymentStatus === 'unpaid' || order.paymentStatus === 'failed' || order.paymentStatus === 'partially_paid') && (
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleInitiatePayment(order);
                          }}
                          disabled={initiatingPayment}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          {initiatingPayment ? <Loader2 className="w-4 h-4 animate-spin" /> : <DollarSign className="w-4 h-4" />}
                          {order.paymentStatus === 'partially_paid' ? 'Request Balance' : 'Request Payment'}
                        </Button>
                      )}
                      {order.paymentStatus === 'pending' && order.mpesaPayment?.checkoutRequestId && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            checkPaymentStatus(order);
                          }}
                          disabled={checkingPayment}
                          className="flex-1 border-orange-600 text-orange-600 hover:bg-orange-600 hover:text-white"
                        >
                          {checkingPayment ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                          Check Status
                        </Button>
                      )}
                      {order.paymentStatus === 'paid' && order.mpesaPayment?.mpesaReceiptNumber && (
                        <div className="flex-1 bg-green-50 border border-green-200 rounded-md p-2">
                          <p className="text-xs text-green-800 font-medium">
                            Receipt: {order.mpesaPayment.mpesaReceiptNumber}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        /* List View */
        <div className="space-y-4">
          <AnimatePresence>
            {currentOrders.map((order) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group border-0 shadow-md bg-gradient-to-r from-white to-gray-50">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      {/* Order Info */}
                      <div className="flex items-center gap-6 flex-1">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-mint-green rounded-lg flex items-center justify-center">
                            <Package className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                              {order.orderNumber}
                            </h3>
                            <p className="text-sm text-gray-500 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(order.createdAt)}
                            </p>
                          </div>
                        </div>

                        {/* Customer Info */}
                        <div className="flex items-center gap-4">
                          <div>
                            <p className="font-medium text-gray-900">{order.customer.name}</p>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Phone className="w-3 h-3" />
                              <span>{order.customer.phone}</span>
                            </div>
                          </div>
                        </div>

                        {/* Services Summary */}
                        <div className="text-center">
                          <p className="font-medium text-gray-900">{order.services.length} services</p>
                          <p className="text-sm text-gray-600">
                            {order.services.reduce((total, service) => total + service.quantity, 0)} items
                          </p>
                        </div>

                        {/* Status Badges */}
                        <div className="flex flex-col gap-2">
                          <Badge className={`${statusColors[order.status]} flex items-center gap-1 px-3 py-1 font-semibold shadow-sm`}>
                            {getStatusIcon(order.status)}
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </Badge>
                          <Badge className={`text-xs px-2 py-1 ${
                            (order.paymentStatus || 'unpaid') === 'paid' 
                              ? 'bg-green-100 text-green-800 border-green-200' 
                              : (order.paymentStatus || 'unpaid') === 'partially_paid'
                              ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                              : (order.paymentStatus || 'unpaid') === 'pending'
                              ? 'bg-blue-100 text-blue-800 border-blue-200'
                              : (order.paymentStatus || 'unpaid') === 'failed'
                              ? 'bg-red-100 text-red-800 border-red-200'
                              : 'bg-gray-100 text-gray-800 border-gray-200'
                          }`}>
                            {(order.paymentStatus || 'unpaid') === 'partially_paid' ? 'Partial' : (order.paymentStatus || 'unpaid').charAt(0).toUpperCase() + (order.paymentStatus || 'unpaid').slice(1)}
                            {(order.paymentStatus || 'unpaid') === 'partially_paid' && order.amountPaid && (
                              <span className="ml-1">
                                ({order.amountPaid.toLocaleString()}/{order.totalAmount.toLocaleString()})
                              </span>
                            )}
                          </Badge>
                        </div>

                        {/* Total Amount */}
                        <div className="text-right">
                          <p className="text-2xl font-bold text-mint-green">
                            Ksh {(order.totalAmount || 0).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 ml-6">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewOrder(order);
                          }}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {order.status === 'pending' && (
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAcceptOrder(order);
                            }}
                            disabled={updating}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                            Accept
                          </Button>
                        )}
                        
                        {/* Payment Actions */}
                        {(order.paymentStatus === 'unpaid' || order.paymentStatus === 'failed' || order.paymentStatus === 'partially_paid') && (
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleInitiatePayment(order);
                            }}
                            disabled={initiatingPayment}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                            title={order.paymentStatus === 'partially_paid' ? 'Request Balance Payment' : 'Request Payment'}
                          >
                            {initiatingPayment ? <Loader2 className="w-4 h-4 animate-spin" /> : <DollarSign className="w-4 h-4" />}
                          </Button>
                        )}
                        {order.paymentStatus === 'pending' && order.mpesaPayment?.checkoutRequestId && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              checkPaymentStatus(order);
                            }}
                            disabled={checkingPayment}
                            className="border-orange-600 text-orange-600 hover:bg-orange-600 hover:text-white"
                          >
                            {checkingPayment ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                          </Button>
                        )}
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditOrder(order);
                          }}
                          className="border-mint-green text-mint-green hover:bg-mint-green hover:text-white"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteOrder(order);
                          }}
                          className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Pagination Controls */}
      {filteredOrders.length > ordersPerPage && (
        <div className="flex items-center justify-between bg-white rounded-lg shadow-lg p-4 border border-gray-200">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              Showing {indexOfFirstOrder + 1} to {Math.min(indexOfLastOrder, filteredOrders.length)} of {filteredOrders.length} orders
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
              className="flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => goToPage(page)}
                  className={`w-8 h-8 p-0 ${
                    currentPage === page 
                      ? 'bg-mint-green hover:bg-mint-green/90 text-white' 
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </Button>
              ))}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {currentOrders.length === 0 && !loading && (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
          <p className="text-gray-500 mb-6">
            {searchTerm || statusFilter !== 'all' 
              ? 'Try adjusting your search or filter criteria'
              : 'Get started by creating your first order'
            }
          </p>
          {!searchTerm && statusFilter === 'all' && (
            <Button 
              className="bg-mint-green hover:bg-mint-green/90 text-white"
              onClick={() => router.push('/admin/pos')}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create First Order
            </Button>
          )}
        </div>
      )}

      {/* Order Details Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900">
              Order Details - {selectedOrder?.orderNumber}
            </DialogTitle>
            <DialogDescription>
              Complete information about this order
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Header */}
              <div className="bg-gradient-to-r from-mint-green to-green-500 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold">{selectedOrder.orderNumber}</h3>
                    <p className="text-sm opacity-90">
                      Created on {formatDate(selectedOrder.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge className={`${
                      (selectedOrder.paymentStatus || 'unpaid') === 'paid' 
                        ? 'bg-green-100 text-green-800 border-green-200' 
                        : (selectedOrder.paymentStatus || 'unpaid') === 'partially_paid'
                        ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                        : (selectedOrder.paymentStatus || 'unpaid') === 'pending'
                        ? 'bg-blue-100 text-blue-800 border-blue-200'
                        : (selectedOrder.paymentStatus || 'unpaid') === 'failed'
                        ? 'bg-red-100 text-red-800 border-red-200'
                        : 'bg-gray-100 text-gray-800 border-gray-200'
                    }`}>
                      {(selectedOrder.paymentStatus || 'unpaid') === 'partially_paid' ? 'Partial Payment' : (selectedOrder.paymentStatus || 'unpaid').charAt(0).toUpperCase() + (selectedOrder.paymentStatus || 'unpaid').slice(1)}
                      {(selectedOrder.paymentStatus || 'unpaid') === 'partially_paid' && selectedOrder.amountPaid && (
                        <span className="ml-2 text-xs">
                          (KES {selectedOrder.amountPaid.toLocaleString()}/{selectedOrder.totalAmount.toLocaleString()})
                        </span>
                      )}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Customer Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Customer Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="text-sm text-gray-500">Name</h5>
                      <p className="font-semibold">{selectedOrder.customer.name}</p>
                    </div>
                    <div>
                      <h5 className="text-sm text-gray-500">Phone</h5>
                      <p className="font-semibold">{selectedOrder.customer.phone}</p>
                    </div>
                    {selectedOrder.customer.email && (
                      <div>
                        <h5 className="text-sm text-gray-500">Email</h5>
                        <p className="font-semibold">{selectedOrder.customer.email}</p>
                      </div>
                    )}
                    {selectedOrder.customer.address && (
                      <div>
                        <h5 className="text-sm text-gray-500">Address</h5>
                        <p className="font-semibold">{selectedOrder.customer.address}</p>
                      </div>
                    )}
                    <div>
                      <h5 className="text-sm text-gray-500">Location</h5>
                      <p className="font-semibold">{selectedOrder.location}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Services */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Services ({selectedOrder.services.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {selectedOrder.services.map((service, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-semibold">{service.serviceName}</p>
                          <p className="text-sm text-gray-600">Quantity: {service.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">Ksh {parseFloat(service.price).toLocaleString()}</p>
                          <p className="text-sm text-gray-600">
                            Total: Ksh {(parseFloat(service.price) * service.quantity).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Financial Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Financial Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>Ksh {(selectedOrder.totalAmount - (selectedOrder.pickDropAmount || 0) + (selectedOrder.discount || 0)).toLocaleString()}</span>
                    </div>
                    {(selectedOrder.pickDropAmount || 0) > 0 && (
                      <div>
                        <h5 className="text-sm text-gray-500">Pick & Drop</h5>
                        <p className="font-semibold text-blue-600">+Ksh {(selectedOrder.pickDropAmount || 0).toLocaleString()}</p>
                      </div>
                    )}
                    {(selectedOrder.discount || 0) > 0 && (
                      <div>
                        <h5 className="text-sm text-gray-500">Discount</h5>
                        <p className="font-semibold text-red-600">-Ksh {(selectedOrder.discount || 0).toLocaleString()}</p>
                      </div>
                    )}
                    <div className="border-t pt-3">
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total Amount:</span>
                        <span className="text-mint-green">Ksh {(selectedOrder.totalAmount || 0).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Status Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Status Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="text-sm text-gray-500">Payment Status</h5>
                      <Badge className={`${
                        (selectedOrder.paymentStatus || 'unpaid') === 'paid' 
                          ? 'bg-green-100 text-green-800 border-green-200' 
                          : (selectedOrder.paymentStatus || 'unpaid') === 'partially_paid'
                          ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                          : (selectedOrder.paymentStatus || 'unpaid') === 'pending'
                          ? 'bg-blue-100 text-blue-800 border-blue-200'
                          : (selectedOrder.paymentStatus || 'unpaid') === 'failed'
                          ? 'bg-red-100 text-red-800 border-red-200'
                          : 'bg-gray-100 text-gray-800 border-gray-200'
                      }`}>
                        {(selectedOrder.paymentStatus || 'unpaid') === 'partially_paid' ? 'Partial Payment' : (selectedOrder.paymentStatus || 'unpaid').charAt(0).toUpperCase() + (selectedOrder.paymentStatus || 'unpaid').slice(1)}
                      </Badge>
                      {(selectedOrder.paymentStatus || 'unpaid') === 'partially_paid' && selectedOrder.amountPaid && (
                        <div className="text-sm text-yellow-700 mt-2">
                          <strong>Amount Paid:</strong> KES {selectedOrder.amountPaid.toLocaleString()} of KES {selectedOrder.totalAmount.toLocaleString()}
                          <br />
                          <strong>Outstanding:</strong> KES {(selectedOrder.totalAmount - selectedOrder.amountPaid).toLocaleString()}
                        </div>
                      )}
                    </div>
                    <div>
                      <h5 className="text-sm text-gray-500">Laundry Status</h5>
                      <Badge className={`${
                        (selectedOrder.laundryStatus || 'to-be-picked') === 'delivered' 
                          ? 'bg-green-100 text-green-800 border-green-200'
                          : (selectedOrder.laundryStatus || 'to-be-picked') === 'ready'
                          ? 'bg-blue-100 text-blue-800 border-blue-200'
                          : (selectedOrder.laundryStatus || 'to-be-picked') === 'in-progress'
                          ? 'bg-orange-100 text-orange-800 border-orange-200'
                          : (selectedOrder.laundryStatus || 'to-be-picked') === 'picked'
                          ? 'bg-purple-100 text-purple-800 border-purple-200'
                          : 'bg-gray-100 text-gray-800 border-gray-200'
                      }`}>
                        {(selectedOrder.laundryStatus || 'to-be-picked').split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Pickup Information */}
              {(selectedOrder.pickupDate || selectedOrder.pickupTime) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      Pickup Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {selectedOrder.pickupDate && (
                        <div>
                          <h5 className="text-sm text-gray-500">Pickup Date</h5>
                          <p className="font-semibold">{selectedOrder.pickupDate}</p>
                        </div>
                      )}
                      {selectedOrder.pickupTime && (
                        <div>
                          <h5 className="text-sm text-gray-500">Pickup Time</h5>
                          <p className="font-semibold">{selectedOrder.pickupTime}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Notes */}
              {selectedOrder.notes && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5" />
                      Notes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">{selectedOrder.notes}</p>
                  </CardContent>
                </Card>
              )}

              {/* Promo Code and Promo Discount */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Promo Code
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{selectedOrder.promoCode || '-'}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Promo Discount
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{selectedOrder.promoDiscount ? `Ksh ${selectedOrder.promoDiscount}` : '-'}</p>
                </CardContent>
              </Card>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-600" />
              Confirm Delete
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Are you sure you want to delete this order? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {orderToDelete && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-700">Order Number:</span>
                  <span className="text-sm font-bold text-gray-900">{orderToDelete.orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-700">Customer:</span>
                  <span className="text-sm font-bold text-gray-900">{orderToDelete.customer.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-700">Total Amount:</span>
                  <span className="text-sm font-bold text-gray-900">Ksh {orderToDelete.totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-700">Status:</span>
                  <Badge className={`text-xs px-2 py-1 ${statusColors[orderToDelete.status]}`}>
                    {orderToDelete.status.charAt(0).toUpperCase() + orderToDelete.status.slice(1)}
                  </Badge>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => {
                setDeleteDialogOpen(false);
                setOrderToDelete(null);
              }}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteOrder}
              disabled={deleting}
              className="flex items-center gap-2"
            >
              {deleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Delete Order
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* M-Pesa Payment Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-blue-600" />
              Initiate M-Pesa Payment
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Send STK push request to customer for payment
            </DialogDescription>
          </DialogHeader>

          {orderForPayment && (
            <div className="space-y-4">
              {/* Order Details */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-700">Order:</span>
                    <span className="text-sm font-bold text-gray-900">{orderForPayment.orderNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-700">Customer:</span>
                    <span className="text-sm font-bold text-gray-900">{orderForPayment.customer.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-700">Original Amount:</span>
                    <span className="text-sm font-bold text-gray-900">Ksh {orderForPayment.totalAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Payment Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <Input
                    type="tel"
                    value={paymentPhone}
                    onChange={(e) => setPaymentPhone(e.target.value)}
                    placeholder="254712345678"
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter phone number in format: 254712345678
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Amount (Ksh)
                  </label>
                  <Input
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(Number(e.target.value))}
                    min="1"
                    max={orderForPayment.totalAmount}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Maximum: Ksh {orderForPayment.totalAmount.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Payment Status */}
              {orderForPayment.mpesaPayment?.checkoutRequestId && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-yellow-800">
                    <strong>Previous Request ID:</strong> {orderForPayment.mpesaPayment.checkoutRequestId}
                  </p>
                  {orderForPayment.mpesaPayment.resultDescription && (
                    <p className="text-sm text-yellow-800 mt-1">
                      <strong>Status:</strong> {orderForPayment.mpesaPayment.resultDescription}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => {
                setPaymentDialogOpen(false);
                setOrderForPayment(null);
                setPaymentPhone('');
                setPaymentAmount(0);
              }}
              disabled={initiatingPayment}
            >
              Cancel
            </Button>
            <Button
              onClick={initiateSTKPush}
              disabled={initiatingPayment || !paymentPhone || !paymentAmount}
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
            >
              {initiatingPayment ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending STK...
                </>
              ) : (
                <>
                  <DollarSign className="w-4 h-4" />
                  Send STK Push
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 