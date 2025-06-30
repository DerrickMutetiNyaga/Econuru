"use client"

import React, { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { ShirtIcon, Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useAuth } from "@/hooks/useAuth"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"

function AdminLoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login, isAuthenticated, isAdmin } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Check for success message from signup
  useEffect(() => {
    const message = searchParams.get('message')
    if (message) {
      setSuccess(message)
    }
  }, [searchParams])

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      if (isAdmin) {
        router.push("/admin")
      } else {
        router.push("/dashboard") // Regular user dashboard
      }
    }
  }, [isAuthenticated, isAdmin, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("") // Clear success message when attempting login

    const result = await login(email, password)
    
    if (result.success) {
      // Check if the logged-in user has admin privileges
      if (result.user && (result.user.role === 'admin' || result.user.role === 'superadmin')) {
        setSuccess(result.message || "Login successful! Redirecting to admin panel...")
        router.push("/admin")
      } else {
        setError("Access denied. Admin privileges required for this area.")
        // Clear the auth data since user is not admin
        localStorage.removeItem('authToken')
        localStorage.removeItem('authUser')
      }
    } else if (result.pendingApproval) {
      router.push("/pending-approval")
    } else {
      setError(result.error || "Login failed")
    }
    
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center p-4">
      <motion.div
        className="w-full max-w-md bg-white rounded-2xl luxury-shadow overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="p-8">
          <div className="flex flex-col items-center justify-center mb-8">
            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center mb-4">
              <ShirtIcon className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-center">Admin Login</h1>
            <p className="text-text-light text-center mt-2">Access your admin dashboard</p>
          </div>

          {error && (
            <Alert className="mb-6 border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-600">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-6 border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-600">
                {success}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email Address
              </Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="luxury-input"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="luxury-input pr-10"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-light hover:text-text"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox id="remember" disabled={isLoading} />
                <Label htmlFor="remember" className="text-sm font-medium">
                  Remember me
                </Label>
              </div>
              <a href="#" className="text-sm font-medium text-primary hover:underline">
                Forgot password?
              </a>
            </div>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-white rounded-xl h-12"
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-text-light">
              Don't have an account?{" "}
              <Link href="/signup" className="font-medium text-primary hover:underline">
                Sign up here
              </Link>
            </p>
          </div>
        </div>

        <div className="p-6 bg-secondary border-t border-gray-100 text-center">
          <p className="text-sm text-text-light">
            Need help?{" "}
            <a href="#" className="font-medium text-primary hover:underline">
              Contact Support
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  )
}

export default function AdminLogin() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-secondary flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl luxury-shadow overflow-hidden p-8">
          <div className="flex flex-col items-center justify-center mb-8">
            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center mb-4">
              <ShirtIcon className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-center">Admin Login</h1>
            <p className="text-text-light text-center mt-2">Loading...</p>
          </div>
        </div>
      </div>
    }>
      <AdminLoginForm />
    </Suspense>
  )
}
