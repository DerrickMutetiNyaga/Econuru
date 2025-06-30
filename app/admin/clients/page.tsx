"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import {
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Download,
  Plus,
  Mail,
  Phone,
  MapPin,
  User,
  RefreshCw,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function ClientsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedClient, setSelectedClient] = useState<any>(null)
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [newClient, setNewClient] = useState({ name: '', phone: '', email: '', address: '' })
  const [adding, setAdding] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [clientToDelete, setClientToDelete] = useState<any>(null)
  const [error, setError] = useState("")
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<any>(null)
  const [editForm, setEditForm] = useState({ name: '', phone: '', email: '', address: '' })
  const [editing, setEditing] = useState(false)
  const fileDownloadRef = useRef(null)
  const [submitting, setSubmitting] = useState(false)
  const [syncing, setSyncing] = useState(false)

  useEffect(() => {
    async function fetchClients() {
      setLoading(true)
      try {
        // Fetch customers from database
        const customersRes = await fetch('/api/customers')
        const customersData = await customersRes.json()
        const customers = customersData.customers || []
        
        // Fetch orders for additional data
        const ordersRes = await fetch('/api/orders')
        const ordersData = await ordersRes.json()
        const orders = ordersData.orders || []
        
        // Create a map of customers from database
        const customerMap = new Map()
        customers.forEach((customer: any) => {
          customerMap.set(customer.phone, {
            id: customer._id,
            clientNo: customer.phone.slice(-6),
            fullName: customer.name,
            phone: customer.phone,
            email: customer.email || '',
            address: customer.address || '',
            joinDate: customer.createdAt,
            lastOrder: customer.lastOrder || customer.createdAt,
            totalOrders: customer.totalOrders || 0,
            totalSpent: customer.totalSpent || 0,
            status: customer.status || 'active',
            avatar: '',
            monthlySpent: {},
            preferences: customer.preferences || [],
            notes: customer.notes || '',
            isFromDatabase: true,
          })
        })
        
        // Process orders and update customer data
        orders.forEach((order: any) => {
          const key = order.customer?.phone || order.customer?.email
          if (!key) return
          
          if (customerMap.has(key)) {
            // Update existing customer from database
            const customer = customerMap.get(key)
            customer.totalOrders += 1
            customer.totalSpent += order.totalAmount || 0
            if (new Date(order.createdAt) > new Date(customer.lastOrder)) {
              customer.lastOrder = order.createdAt
            }
          } else {
            // Create new customer from order
            customerMap.set(key, {
              id: key,
              clientNo: key.slice(-6),
              fullName: order.customer?.name || order.customer?.email || order.customer?.phone || 'Unknown',
              phone: order.customer?.phone || '',
              email: order.customer?.email || '',
              address: order.customer?.address || '',
              joinDate: order.createdAt,
              lastOrder: order.createdAt,
              totalOrders: 1,
              totalSpent: order.totalAmount || 0,
              status: 'active',
              avatar: '',
              monthlySpent: {},
              preferences: [],
              notes: '',
              isFromDatabase: false,
            })
          }
          
          // Track monthly spent
          const customer = customerMap.get(key)
          const d = new Date(order.createdAt)
          const ym = `${d.getFullYear()}-${d.getMonth()}`
          if (!customer.monthlySpent[ym]) customer.monthlySpent[ym] = 0
          customer.monthlySpent[ym] += order.totalAmount || 0
        })
        
        // Assign status and format data
        const now = new Date()
        const thisMonth = now.getMonth()
        const thisYear = now.getFullYear()
        const thisYM = `${thisYear}-${thisMonth}`
        
        const clientArr = Array.from(customerMap.values()).map((c: any) => {
          const join = new Date(c.joinDate)
          if (c.monthlySpent[thisYM] > 20000) {
            c.status = 'vip'
          } else if (join.getMonth() === thisMonth && join.getFullYear() === thisYear) {
            c.status = 'new'
          } else if (c.totalSpent > 1000) {
            c.status = 'premium'
          } else if (!c.isFromDatabase) {
            c.status = 'active'
          }
          
          c.totalSpent = `Ksh ${c.totalSpent.toLocaleString()}`
          return c
        })
        
        setClients(clientArr)
      } catch (error) {
        console.error('Error fetching clients:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchClients()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "vip":
        return "bg-yellow-400 text-white border-yellow-400"
      case "premium":
        return "bg-accent/10 text-accent border-accent"
      case "active":
        return "bg-green-100 text-green-800 border-green-200"
      case "new":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "inactive":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const filteredClients = clients.filter(
    (client) =>
      client.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone.includes(searchTerm) ||
      client.clientNo.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  function exportClientsToCSV() {
    const csvContent = [
      ['Client No', 'Full Name', 'Phone', 'Email', 'Address', 'Status', 'Total Orders', 'Total Spent', 'Join Date'],
      ...clients.map(client => [
        client.clientNo,
        client.fullName,
        client.phone,
        client.email,
        client.address,
        client.status,
        client.totalOrders,
        client.totalSpent,
        new Date(client.joinDate).toLocaleDateString()
      ])
    ].map(row => row.map(field => `"${field}"`).join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'clients.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  async function syncCustomers() {
    setSyncing(true)
    setError("")
    
    try {
      const response = await fetch('/api/customers/sync', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      })
      
      const data = await response.json()
      
      if (data.success) {
        // Refresh the clients list
        window.location.reload()
      } else {
        setError(data.message || 'Failed to sync customers')
      }
    } catch (error) {
      setError('Failed to sync customers. Please try again.')
    } finally {
      setSyncing(false)
    }
  }

  // Validation functions
  function validateClientData(clientData: any) {
    setError("")
    
    // Check for duplicate phone number
    if (clientData.phone && clients.some(c => c.phone === clientData.phone)) {
      setError("A client with this phone number already exists")
      return false
    }
    
    // Check for duplicate email
    if (clientData.email && clients.some(c => c.email === clientData.email)) {
      setError("A client with this email already exists")
      return false
    }
    
    // Validate phone number format (basic validation)
    if (clientData.phone && !/^[\d\s\-\+\(\)]+$/.test(clientData.phone)) {
      setError("Please enter a valid phone number")
      return false
    }
    
    // Validate email format (basic validation)
    if (clientData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientData.email)) {
      setError("Please enter a valid email address")
      return false
    }
    
    return true
  }

  // Delete client functions
  function openDeleteDialog(client: any) {
    setClientToDelete(client)
    setDeleteDialogOpen(true)
  }

  function handleDeleteClient() {
    if (!clientToDelete) return
    
    // Only allow deleting customers from database
    if (!clientToDelete.isFromDatabase) {
      setError("Cannot delete customers created from orders. Please add them manually first to manage them.")
      setDeleteDialogOpen(false)
      setClientToDelete(null)
      return
    }
    
    setSubmitting(true)
    
    fetch(`/api/customers/${clientToDelete.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        setClients(prev => prev.filter(c => c.id !== clientToDelete.id))
        setDeleteDialogOpen(false)
        setClientToDelete(null)
        setError("")
      } else {
        setError(data.message || 'Failed to delete client')
      }
    })
    .catch(error => {
      setError('Failed to delete client. Please try again.')
    })
    .finally(() => {
      setSubmitting(false)
    })
  }

  // Edit client functions
  function openEditDialog(client: any) {
    setEditingClient(client)
    setEditForm({
      name: client.fullName,
      phone: client.phone,
      email: client.email,
      address: client.address
    })
    setEditDialogOpen(true)
  }

  function handleEditClient(e: any) {
    e.preventDefault()
    setEditing(true)
    setError("")
    
    // Only allow editing customers from database
    if (!editingClient.isFromDatabase) {
      setError("Cannot edit customers created from orders. Please add them manually first.")
      setEditing(false)
      return
    }
    
    // Create a temporary client data for validation (excluding current client)
    const tempClientData = {
      ...editForm,
      id: editingClient.id
    }
    
    // Check for duplicates excluding the current client
    const otherClients = clients.filter(c => c.id !== editingClient.id)
    
    // Check for duplicate phone number
    if (tempClientData.phone && otherClients.some(c => c.phone === tempClientData.phone)) {
      setError("A client with this phone number already exists")
      setEditing(false)
      return
    }
    
    // Check for duplicate email
    if (tempClientData.email && otherClients.some(c => c.email === tempClientData.email)) {
      setError("A client with this email already exists")
      setEditing(false)
      return
    }
    
    // Validate phone number format
    if (tempClientData.phone && !/^[\d\s\-\+\(\)]+$/.test(tempClientData.phone)) {
      setError("Please enter a valid phone number")
      setEditing(false)
      return
    }
    
    // Validate email format
    if (tempClientData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(tempClientData.email)) {
      setError("Please enter a valid email address")
      setEditing(false)
      return
    }
    
    // Update via API
    fetch(`/api/customers/${editingClient.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
      body: JSON.stringify(editForm),
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        // Update the client in the list
        setClients(prev => prev.map(c => 
          c.id === editingClient.id 
            ? {
                ...c,
                fullName: editForm.name,
                phone: editForm.phone,
                email: editForm.email,
                address: editForm.address
              }
            : c
        ))
        setEditDialogOpen(false)
        setEditingClient(null)
        setEditForm({ name: '', phone: '', email: '', address: '' })
        setError("")
      } else {
        setError(data.message || 'Failed to update client')
      }
    })
    .catch(error => {
      setError('Failed to update client. Please try again.')
    })
    .finally(() => {
      setEditing(false)
    })
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Client Management</h1>
          <p className="text-text-light">Manage customer relationships and information</p>
        </div>
        <div className="flex gap-3 mt-4 md:mt-0">
          <Button variant="outline" className="rounded-xl" onClick={exportClientsToCSV}>
            <Download className="mr-2 w-4 h-4" />
            <a ref={fileDownloadRef} download="clients.csv" className="outline-none text-inherit no-underline">Export</a>
          </Button>
          <Button variant="outline" className="rounded-xl" onClick={syncCustomers} disabled={syncing}>
            <RefreshCw className={`mr-2 w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing...' : 'Sync'}
          </Button>
          <Button className="bg-accent hover:bg-accent/90 text-white rounded-xl" onClick={() => setShowAddDialog(true)}>
            <Plus className="mr-2 w-4 h-4" />
            Add Client
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <Card className="luxury-card">
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-2xl font-bold">{clients.length}</p>
              <p className="text-sm text-text-light">Total Clients</p>
            </div>
          </CardContent>
        </Card>
        <Card className="luxury-card">
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-2xl font-bold">{clients.filter((c) => c.status === "active").length}</p>
              <p className="text-sm text-text-light">Active Clients</p>
            </div>
          </CardContent>
        </Card>
        <Card className="luxury-card">
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-2xl font-bold">{clients.filter((c) => c.status === "premium").length}</p>
              <p className="text-sm text-text-light">Premium Clients</p>
            </div>
          </CardContent>
        </Card>
        <Card className="luxury-card">
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-2xl font-bold">{clients.filter((c) => c.status === "new").length}</p>
              <p className="text-sm text-text-light">New This Month</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="luxury-card">
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col md:flex-row gap-3 md:gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-light w-4 h-4" />
                <Input
                  placeholder="Search clients by name, email, phone, or client number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 luxury-input"
                />
              </div>
            </div>
            <Button variant="outline" className="rounded-xl">
              <Filter className="mr-2 w-4 h-4" />
              Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Clients Table */}
      <Card className="luxury-card">
        <CardHeader>
          <CardTitle>Clients ({filteredClients.length})</CardTitle>
          <CardDescription>Manage your customer database</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Mobile: Card list */}
          <div className="block md:hidden space-y-4">
            {filteredClients.map((client, index) => (
              <Card key={client.id} className="relative p-5 flex flex-col items-center gap-3 luxury-card bg-gradient-to-br from-white via-secondary to-accent/10 border-2 border-accent/20 shadow-lg">
                {/* Three dots menu at top right */}
                <div className="absolute top-3 right-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="rounded-full">
                        <MoreHorizontal className="w-5 h-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem 
                        onClick={() => openEditDialog(client)}
                        className={!client.isFromDatabase ? "opacity-50 cursor-not-allowed" : ""}
                        disabled={!client.isFromDatabase}
                      >
                        <Edit className="mr-2 w-4 h-4" />
                        Edit Client
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Phone className="mr-2 w-4 h-4" />
                        Call Client
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Mail className="mr-2 w-4 h-4" />
                        SMS Client
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className={`text-red-600 ${!client.isFromDatabase ? "opacity-50 cursor-not-allowed" : ""}`}
                        onClick={() => openDeleteDialog(client)}
                        disabled={!client.isFromDatabase}
                      >
                        <Trash2 className="mr-2 w-4 h-4" />
                        Delete Client
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <Avatar className="w-16 h-16 mb-2 mx-auto ring-2 ring-accent">
                  <AvatarImage src={client.avatar || "/placeholder.svg"} alt={client.fullName} />
                  <AvatarFallback className="text-lg">{client.fullName.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-center gap-1 w-full">
                  <div className="font-semibold text-responsive-lg">{client.fullName}</div>
                  <div className="text-xs text-text-light">{client.clientNo}</div>
                  <Badge className={`${getStatusColor(client.status)} mt-1 text-xs px-3 py-1 rounded-full`}>{client.status}</Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 w-full mt-2 text-xs text-text-light">
                  <span className="flex items-center gap-1 justify-center"><Phone className="w-4 h-4" />{client.phone}</span>
                  <span className="flex items-center gap-1 justify-center"><Mail className="w-4 h-4" />{client.email}</span>
                </div>
              </Card>
            ))}
          </div>
          {/* Desktop: Table */}
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client No</TableHead>
                  <TableHead>Full Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.map((client, index) => (
                  <motion.tr
                    key={client.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="hover:bg-secondary/50"
                  >
                    <TableCell className="font-medium">{client.clientNo}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={client.avatar || "/placeholder.svg"} alt={client.fullName} />
                          <AvatarFallback>
                            {client.fullName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{client.fullName}</div>
                          <div className="text-sm text-text-light">
                            Member since {new Date(client.joinDate).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-text-light" />
                        {client.phone}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Mail className="w-3 h-3 text-text-light" />
                        {client.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-start gap-1 max-w-[200px]">
                        <MapPin className="w-3 h-3 text-text-light mt-0.5 flex-shrink-0" />
                        <span className="text-sm truncate">{client.address}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getStatusColor(client.status)}`}>{client.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="rounded-full"
                              onClick={() => setSelectedClient(client)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl w-full p-2 sm:p-6">
                            <DialogHeader>
                              <DialogTitle>Client Profile - {selectedClient?.fullName}</DialogTitle>
                              <DialogDescription>Complete client information and history</DialogDescription>
                            </DialogHeader>
                            {selectedClient && (
                              <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                  <Avatar className="w-16 h-16">
                                    <AvatarImage
                                      src={selectedClient.avatar || "/placeholder.svg"}
                                      alt={selectedClient.fullName}
                                    />
                                    <AvatarFallback className="text-lg">
                                      {selectedClient.fullName
                                        .split(" ")
                                        .map((n: string) => n[0])
                                        .join("")}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <h3 className="text-xl font-semibold">{selectedClient.fullName}</h3>
                                    <p className="text-text-light">{selectedClient.clientNo}</p>
                                    <Badge className={`${getStatusColor(selectedClient.status)} mt-1`}>
                                      {selectedClient.status}
                                    </Badge>
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                  <div className="space-y-4">
                                    <div>
                                      <h4 className="font-semibold mb-2">Contact Information</h4>
                                      <div className="space-y-2 text-sm">
                                        <div className="flex items-center gap-2">
                                          <Phone className="w-4 h-4 text-primary" />
                                          {selectedClient.phone}
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <Mail className="w-4 h-4 text-primary" />
                                          {selectedClient.email}
                                        </div>
                                        <div className="flex items-start gap-2">
                                          <MapPin className="w-4 h-4 text-primary mt-0.5" />
                                          <span>{selectedClient.address}</span>
                                        </div>
                                      </div>
                                    </div>
                                    <div>
                                      <h4 className="font-semibold mb-2">Preferences</h4>
                                      <div className="flex flex-wrap gap-2">
                                        {selectedClient.preferences.map((pref: string, i: number) => (
                                          <Badge key={i} variant="outline" className="text-xs">
                                            {pref}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="space-y-4">
                                    <div>
                                      <h4 className="font-semibold mb-2">Statistics</h4>
                                      <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                          <span>Total Orders:</span>
                                          <span className="font-medium">{selectedClient.totalOrders}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span>Total Spent:</span>
                                          <span className="font-medium">{selectedClient.totalSpent}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span>Last Order:</span>
                                          <span className="font-medium">{selectedClient.lastOrder}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span>Join Date:</span>
                                          <span className="font-medium">
                                            {new Date(selectedClient.joinDate).toLocaleDateString()}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                    <div>
                                      <h4 className="font-semibold mb-2">Notes</h4>
                                      <p className="text-sm bg-secondary p-3 rounded-lg">{selectedClient.notes}</p>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex justify-end gap-3">
                                  <Button variant="outline" className="rounded-xl" onClick={() => openEditDialog(selectedClient)}>
                                    <Edit className="mr-2 w-4 h-4" />
                                    Edit Client
                                  </Button>
                                  <Button className="bg-accent hover:bg-accent/90 text-white rounded-xl">
                                    <Mail className="mr-2 w-4 h-4" />
                                    Send Message
                                  </Button>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="rounded-full">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => openEditDialog(client)}>
                              <Edit className="mr-2 w-4 h-4" />
                              Edit Client
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Phone className="mr-2 w-4 h-4" />
                              Call Client
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Mail className="mr-2 w-4 h-4" />
                              SMS Client
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600" onClick={() => openDeleteDialog(client)}>
                              <Trash2 className="mr-2 w-4 h-4" />
                              Delete Client
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md w-full p-0 overflow-hidden bg-gradient-to-br from-white via-secondary to-accent/10 rounded-2xl shadow-2xl">
          <div className="flex flex-col items-center p-6 luxury-card bg-transparent">
            <Avatar className="w-20 h-20 mb-4 ring-2 ring-accent bg-white">
              <AvatarFallback className="text-3xl">+</AvatarFallback>
            </Avatar>
            <DialogHeader className="w-full text-center mb-2">
              <DialogTitle className="text-2xl font-bold mb-1">Add New Client</DialogTitle>
              <DialogDescription className="text-text-light mb-4">Fill in the details below to add a new client to your database.</DialogDescription>
            </DialogHeader>
            <form onSubmit={async e => {
              e.preventDefault()
              setAdding(true)
              setError("")
              
              // Validate client data
              if (!validateClientData(newClient)) {
                setAdding(false)
                return
              }
              
              try {
                const response = await fetch('/api/customers', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                  },
                  body: JSON.stringify(newClient),
                })
                
                const data = await response.json()
                
                if (!data.success) {
                  setError(data.message || 'Failed to add client')
                  setAdding(false)
                  return
                }
                
                // Add the new client to the list
                const newClientData = {
                  id: data.customer._id,
                  clientNo: data.customer.phone.slice(-6),
                  fullName: data.customer.name,
                  phone: data.customer.phone,
                  email: data.customer.email || '',
                  address: data.customer.address || '',
                  joinDate: data.customer.createdAt,
                  lastOrder: data.customer.createdAt,
                  totalOrders: 0,
                  totalSpent: 0,
                  status: 'active',
                  avatar: '',
                  monthlySpent: {},
                  preferences: data.customer.preferences || [],
                  notes: data.customer.notes || '',
                  isFromDatabase: true,
                }
                
                setClients(prev => [newClientData, ...prev])
                setShowAddDialog(false)
                setNewClient({ name: '', phone: '', email: '', address: '' })
                setError("")
              } catch (error) {
                setError('Failed to add client. Please try again.')
              } finally {
                setAdding(false)
              }
            }} className="w-full space-y-4">
              <Input required placeholder="Full Name" value={newClient.name} onChange={e => setNewClient({ ...newClient, name: e.target.value })} className="luxury-input text-lg py-4" />
              <Input required placeholder="Phone" value={newClient.phone} onChange={e => setNewClient({ ...newClient, phone: e.target.value })} className="luxury-input text-lg py-4" />
              <Input placeholder="Email" value={newClient.email} onChange={e => setNewClient({ ...newClient, email: e.target.value })} className="luxury-input text-lg py-4" />
              <Input placeholder="Address" value={newClient.address} onChange={e => setNewClient({ ...newClient, address: e.target.value })} className="luxury-input text-lg py-4" />
              {error && <div className="text-red-500 text-sm text-center">{error}</div>}
              <div className="h-px bg-secondary my-2" />
              <div className="flex flex-col gap-2 w-full">
                <Button type="submit" className="w-full bg-accent text-white rounded-xl font-semibold shadow-lg py-3 text-lg" disabled={adding}>{adding ? 'Adding...' : 'Add Client'}</Button>
                <Button type="button" variant="outline" className="w-full rounded-xl" onClick={() => setShowAddDialog(false)} disabled={adding}>Cancel</Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Client</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{clientToDelete?.fullName}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {error && <div className="text-red-500 text-sm text-center">{error}</div>}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteClient} disabled={submitting}>
              {submitting ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Client Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md w-full p-0 overflow-hidden bg-gradient-to-br from-white via-secondary to-accent/10 rounded-2xl shadow-2xl">
          <div className="flex flex-col items-center p-6 luxury-card bg-transparent">
            <Avatar className="w-20 h-20 mb-4 ring-2 ring-accent bg-white">
              <AvatarFallback className="text-3xl">
                {editingClient?.fullName?.split(" ").map((n: string) => n[0]).join("") || "E"}
              </AvatarFallback>
            </Avatar>
            <DialogHeader className="w-full text-center mb-2">
              <DialogTitle className="text-2xl font-bold mb-1">Edit Client</DialogTitle>
              <DialogDescription className="text-text-light mb-4">Update the client information below.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditClient} className="w-full space-y-4">
              <Input 
                required 
                placeholder="Full Name" 
                value={editForm.name} 
                onChange={e => setEditForm({ ...editForm, name: e.target.value })} 
                className="luxury-input text-lg py-4" 
              />
              <Input 
                required 
                placeholder="Phone" 
                value={editForm.phone} 
                onChange={e => setEditForm({ ...editForm, phone: e.target.value })} 
                className="luxury-input text-lg py-4" 
              />
              <Input 
                placeholder="Email" 
                value={editForm.email} 
                onChange={e => setEditForm({ ...editForm, email: e.target.value })} 
                className="luxury-input text-lg py-4" 
              />
              <Input 
                placeholder="Address" 
                value={editForm.address} 
                onChange={e => setEditForm({ ...editForm, address: e.target.value })} 
                className="luxury-input text-lg py-4" 
              />
              {error && <div className="text-red-500 text-sm text-center">{error}</div>}
              <div className="h-px bg-secondary my-2" />
              <div className="flex flex-col gap-2 w-full">
                <Button type="submit" className="w-full bg-accent text-white rounded-xl font-semibold shadow-lg py-3 text-lg" disabled={editing}>
                  {editing ? 'Updating...' : 'Update Client'}
                </Button>
                <Button type="button" variant="outline" className="w-full rounded-xl" onClick={() => setEditDialogOpen(false)} disabled={editing}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
