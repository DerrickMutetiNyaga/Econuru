"use client"

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Users, 
  Package, 
  Settings, 
  DollarSign, 
  Megaphone, 
  MessageSquare,
  UserCheck,
  BarChart3,
  Shield,
  Crown,
  Home,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Star,
  ImageIcon,
  Calculator,
  FileText
} from 'lucide-react'
import ProtectedRoute from '@/components/ProtectedRoute'
import { useAuth } from '@/hooks/useAuth'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function AdminPage() {
  const { user, logout } = useAuth()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false)
        setIsCollapsed(false)
      } else {
        setIsSidebarOpen(true)
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const adminSections = [
    {
      title: "Dashboard",
      description: "Overview of your business metrics and performance",
      href: "/admin/dashboard",
      icon: BarChart3,
      color: "bg-gradient-to-br from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-700"
    },
    {
      title: "Orders",
      description: "Manage customer orders, track deliveries, and handle returns",
      href: "/admin/orders",
      icon: Package,
      color: "bg-gradient-to-br from-green-500 to-green-600",
      bgColor: "bg-green-50",
      textColor: "text-green-700"
    },
    {
      title: "Clients",
      description: "View and manage customer information and preferences",
      href: "/admin/clients",
      icon: Users,
      color: "bg-gradient-to-br from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      textColor: "text-purple-700"
    },
    {
      title: "Employees",
      description: "Manage your staff, schedules, and performance",
      href: "/admin/employees",
      icon: UserCheck,
      color: "bg-gradient-to-br from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
      textColor: "text-orange-700"
    },
    {
      title: "Services",
      description: "Configure laundry services, pricing, and packages",
      href: "/admin/services",
      icon: Settings,
      color: "bg-gradient-to-br from-indigo-500 to-indigo-600",
      bgColor: "bg-indigo-50",
      textColor: "text-indigo-700"
    },
    {
      title: "Promotions",
      description: "Create and manage special offers and discounts",
      href: "/admin/promotions",
      icon: Megaphone,
      color: "bg-gradient-to-br from-pink-500 to-pink-600",
      bgColor: "bg-pink-50",
      textColor: "text-pink-700"
    },
    {
      title: "Contact",
      description: "Manage customer inquiries and support tickets",
      href: "/admin/contact",
      icon: MessageSquare,
      color: "bg-gradient-to-br from-cyan-500 to-cyan-600",
      bgColor: "bg-cyan-50",
      textColor: "text-cyan-700"
    },
    {
      title: "Expenses",
      description: "Track business expenses and financial reports",
      href: "/admin/expenses",
      icon: DollarSign,
      color: "bg-gradient-to-br from-emerald-500 to-emerald-600",
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-700"
    },
    {
      title: "Gallery",
      description: "Manage your service photos and portfolio",
      href: "/admin/gallery",
      icon: ImageIcon,
      color: "bg-gradient-to-br from-violet-500 to-violet-600",
      bgColor: "bg-violet-50",
      textColor: "text-violet-700"
    },
    {
      title: "Reports",
      description: "Generate detailed business analytics and reports",
      href: "/admin/reports",
      icon: FileText,
      color: "bg-gradient-to-br from-slate-500 to-slate-600",
      bgColor: "bg-slate-50",
      textColor: "text-slate-700"
    },
    {
      title: "User Management",
      description: "Manage user accounts, roles, and permissions",
      href: "/admin/users",
      icon: Users,
      color: "bg-gradient-to-br from-rose-500 to-rose-600",
      bgColor: "bg-rose-50",
      textColor: "text-rose-700"
    },
    {
      title: "Laundry POS",
      description: "Point of sale system for in-store transactions",
      href: "/admin/pos",
      icon: Calculator,
      color: "bg-gradient-to-br from-amber-500 to-amber-600",
      bgColor: "bg-amber-50",
      textColor: "text-amber-700"
    },
    {
      title: "Testimonials",
      description: "Manage customer reviews and testimonials",
      href: "/admin/testimonials",
      icon: Star,
      color: "bg-gradient-to-br from-yellow-500 to-yellow-600",
      bgColor: "bg-yellow-50",
      textColor: "text-yellow-700"
    }
  ]

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Top Bar */}
        <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
          <div className="flex items-center justify-between p-4 lg:p-6">
            {/* Page Title */}
            <div className="flex items-center gap-3">
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Admin Overview</h1>
            </div>
            {/* User Info */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600">
                <span>Welcome,</span>
                <span className="font-medium text-gray-900">
                  {user?.name || user?.email || "Admin"}
                </span>
              </div>
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
                {user?.role === 'superadmin' ? (
                  <Crown className="h-5 w-5 text-yellow-500" />
                ) : (
                  <Shield className="h-5 w-5 text-blue-500" />
                )}
                <span className="text-sm font-medium text-gray-700">
                  {user?.name || user?.email}
                </span>
                <span className="text-xs text-gray-500 capitalize">
                  ({user?.role})
                </span>
              </div>
            </div>
          </div>
        </div>
        {/* Page Content */}
        <div className="p-4 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Welcome Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-[#d1fae5] rounded-2xl p-8"
            >
              <div className="flex items-center gap-4 mb-4">
                {user?.role === 'superadmin' ? (
                  <Crown className="h-8 w-8 text-yellow-300" />
                ) : (
                  <Shield className="h-8 w-8 text-blue-200" />
                )}
                <div>
                  <h2 className="text-2xl font-bold text-[#38a3a5]">Welcome back, {user?.name || 'Admin'}!</h2>
                  <p className="text-gray-600">Manage your luxury laundry business with ease</p>
                </div>
              </div>
            </motion.div>

            {/* Quick Stats */}
            {/* Removed quickStats cards as requested */}

            {/* Admin Sections */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Quick Access</h3>
                <p className="text-gray-600">Navigate to different sections of your admin panel</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {adminSections.map((section, index) => {
            const IconComponent = section.icon
            return (
                    <motion.div
                      key={section.href}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.1 + index * 0.05 }}
                    >
                      <Link href={section.href}>
                        <Card className="group hover:shadow-lg transition-all duration-200 cursor-pointer border-0 bg-white shadow-sm hover:shadow-md hover:-translate-y-1">
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-3">
                              <div className={`p-3 rounded-xl ${section.color} group-hover:scale-110 transition-transform`}>
                                <IconComponent className="h-6 w-6 text-white" />
                      </div>
                              <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                                {section.title}
                              </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                            <CardDescription className="text-sm leading-relaxed">
                      {section.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </Link>
                    </motion.div>
            )
          })}
        </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8"
            >
              <Link href="/admin/dashboard">
                <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-3 rounded-xl">
                  <BarChart3 className="mr-2 h-5 w-5" />
                  Go to Dashboard
            </Button>
          </Link>
          <Link href="/">
                <Button variant="outline" className="px-8 py-3 rounded-xl border-2 hover:bg-gray-50">
                  <Home className="mr-2 h-5 w-5" />
              Back to Website
            </Button>
          </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
} 