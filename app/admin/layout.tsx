"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  Tag,
  Settings,
  Menu,
  X,
  DollarSign,
  ImageIcon,
  BarChart,
  Calculator,
  MessageSquare,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Star,
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import { useAuth } from "@/hooks/useAuth"
import ProtectedRoute from "@/components/ProtectedRoute"

function AdminLayoutContent({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const { logout, user } = useAuth()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  // Close mobile sidebar on path change
  useEffect(() => {
    setIsMobileSidebarOpen(false)
  }, [pathname])

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

    // Set initial state
    handleResize()

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Add keyboard shortcut for logout (Ctrl+L)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === 'l') {
        event.preventDefault()
        logout()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [logout])

  // Skip rendering the admin layout on the login page only
  if (pathname === "/admin/login") {
    return <>{children}</>
  }

  const navItems = [
    { icon: LayoutDashboard, label: "Admin Overview", href: "/admin" },
    { icon: LayoutDashboard, label: "Dashboard", href: "/admin/dashboard" },
    { icon: ShoppingBag, label: "Orders", href: "/admin/orders" },
    { icon: Users, label: "Clients", href: "/admin/clients" },
    { icon: Users, label: "Employees", href: "/admin/employees" },
    { icon: Tag, label: "Services", href: "/admin/services" },
    { icon: Tag, label: "Promotions", href: "/admin/promotions" },
    { icon: ImageIcon, label: "Banners", href: "/admin/banners" },
    { icon: DollarSign, label: "Expenses", href: "/admin/expenses" },
    { icon: ImageIcon, label: "Gallery", href: "/admin/gallery" },
    { icon: BarChart, label: "Reports", href: "/admin/reports" },
    { icon: Users, label: "User Management", href: "/admin/users" },
    { icon: Calculator, label: "Laundry POS", href: "/admin/pos" },
    { icon: MessageSquare, label: "Contact", href: "/admin/contact" },
    { icon: Star, label: "Testimonials", href: "/admin/testimonials" },
    { icon: Settings, label: "Settings", href: "/admin/settings" },
  ]

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  const handleLogout = () => {
    setIsLoggingOut(true)
    logout()
  }

  return (
    <ProtectedRoute requireAdmin={true}>
      <div className="min-h-screen bg-secondary flex">
        {/* Mobile Overlay */}
        <AnimatePresence>
          {isMobileSidebarOpen && (
            <motion.div
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileSidebarOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Mobile Sidebar */}
        <AnimatePresence>
          {isMobileSidebarOpen && (
            <motion.div
              className="fixed inset-y-0 left-0 w-80 bg-white luxury-shadow z-50 lg:hidden"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", ease: "easeInOut", duration: 0.3 }}
            >
              <div className="flex flex-col h-full">
                {/* Mobile Header */}
                <div className="flex items-center justify-between p-4 border-b">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                      <LayoutDashboard className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-bold text-lg">Admin Panel</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsMobileSidebarOpen(false)}
                    className="rounded-full"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                {/* Mobile Navigation */}
                <div className="flex-1 overflow-y-auto p-4">
                  <nav className="space-y-2">
                    {navItems.map((item) => (
                      <Link key={item.href} href={item.href}>
                        <Button
                          variant="ghost"
                          className={`w-full justify-start gap-3 h-12 text-left ${
                            isActive(item.href)
                              ? "bg-primary/10 text-primary border-r-2 border-primary hover:bg-mint-green hover:text-white hover:border-mint-green"
                              : "hover:bg-mint-green-light hover:text-mint-green"
                          }`}
                          onClick={() => setIsMobileSidebarOpen(false)}
                        >
                          <item.icon className="h-5 w-5 flex-shrink-0" />
                          <span className="font-medium">{item.label}</span>
                        </Button>
                      </Link>
                    ))}
                  </nav>
                </div>

                {/* Mobile Footer */}
                <div className="p-4 border-t space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-3 h-12"
                    onClick={() => {
                      theme === "light" ? setTheme("dark") : setTheme("light")
                      setIsMobileSidebarOpen(false)
                    }}
                  >
                    {theme === "light" ? "🌙" : "☀️"}
                    {theme === "light" ? "Dark Mode" : "Light Mode"}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-3 h-12 text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                  >
                    <LogOut className="h-5 w-5" />
                    {isLoggingOut ? "Logging out..." : "Logout"}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Desktop Sidebar */}
        <motion.div
          className={`hidden lg:flex fixed inset-y-0 left-0 z-30 flex-col bg-white luxury-shadow transition-all duration-300 ${
            isCollapsed ? "w-16" : "w-64"
          }`}
          initial={{ x: "-100%" }}
          animate={{ x: 0 }}
          transition={{ type: "tween", ease: "easeInOut", duration: 0.3 }}
        >
          {/* Desktop Header */}
          <div className="flex items-center justify-between p-4 border-b">
            {!isCollapsed && (
              <motion.div
                className="flex items-center gap-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <LayoutDashboard className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-lg">Admin Panel</span>
              </motion.div>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="rounded-full ml-auto"
            >
              {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          </div>

          {/* Desktop Navigation */}
          <div className="flex-1 overflow-y-auto p-4">
            <nav className="space-y-2">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant="ghost"
                    className={`w-full justify-start gap-3 h-12 text-left group ${
                      isActive(item.href)
                        ? "bg-primary/10 text-primary border-r-2 border-primary hover:bg-mint-green hover:text-white hover:border-mint-green"
                        : "hover:bg-mint-green-light hover:text-mint-green"
                    }`}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    {!isCollapsed && <span className="font-medium">{item.label}</span>}
                  </Button>
                </Link>
              ))}
            </nav>
          </div>

          {/* Desktop Footer */}
          <div className="p-4 border-t space-y-3">
            <Button
              variant="outline"
              className={`w-full justify-start gap-3 h-12 ${isCollapsed ? "justify-center" : ""}`}
              onClick={() => theme === "light" ? setTheme("dark") : setTheme("light")}
              title={isCollapsed ? (theme === "light" ? "Dark Mode" : "Light Mode") : undefined}
            >
              {theme === "light" ? "🌙" : "☀️"}
              {!isCollapsed && (theme === "light" ? "Dark Mode" : "Light Mode")}
            </Button>
            <Button
              variant="outline"
              className={`w-full justify-start gap-3 h-12 text-red-600 hover:text-red-700 hover:bg-red-50 ${
                isCollapsed ? "justify-center" : ""
              }`}
              onClick={handleLogout}
              disabled={isLoggingOut}
              title={isCollapsed ? "Logout" : undefined}
            >
              <LogOut className="h-5 w-5" />
              {!isCollapsed && (isLoggingOut ? "Logging out..." : "Logout")}
            </Button>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className={`flex-1 transition-all duration-300 ${
          isCollapsed ? "lg:ml-16" : "lg:ml-64"
        }`}>
          {/* Top Bar */}
          <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b luxury-shadow">
            <div className="flex items-center justify-between p-4">
              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden rounded-full"
                onClick={() => setIsMobileSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>

              {/* Page Title */}
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-semibold text-gray-900">
                  {navItems.find(item => isActive(item.href))?.label || "Admin"}
                </h1>
              </div>

              {/* User Info */}
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600">
                  <span>Welcome,</span>
                  <span className="font-medium text-gray-900">
                    {user?.name || user?.email || "Admin"}
                  </span>
                </div>
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="w-4 h-4 text-primary" />
                </div>
              </div>
            </div>
          </div>

          {/* Page Content */}
          <main className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <AdminLayoutContent>{children}</AdminLayoutContent>
}
