"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { ShirtIcon, Menu, X, User, ShoppingBag, Phone, MapPin, Home, Grid3X3, Download, Calendar, MessageCircle } from "lucide-react"

import { Button } from "@/components/ui/button"

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isContactVisible, setIsContactVisible] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showInstallButton, setShowInstallButton] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Show contact info on larger screens and detect mobile
  useEffect(() => {
    const handleResize = () => {
      setIsContactVisible(window.innerWidth >= 768)
      setIsMobile(window.innerWidth < 768)
    }
    
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // PWA Install functionality
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowInstallButton(true)
    }

    const handleAppInstalled = () => {
      setShowInstallButton(false)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const choiceResult = await deferredPrompt.userChoice
      if (choiceResult.outcome === 'accepted') {
        setShowInstallButton(false)
      }
      setDeferredPrompt(null)
    }
  }

  const navLinks = [
    { title: "Home", href: "/" },
    { title: "Services & Pricing", href: "/services" },
    { title: "How It Works", href: "/how-it-works" },
    { title: "Gallery", href: "/gallery" },
    { title: "Contact Us", href: "/contact" },
  ]

  const mobileNavItems = [
    { title: "Home", href: "/", icon: Home },
    { title: "Services", href: "/services", icon: Grid3X3 },
    { title: "Book", href: "/book", icon: Calendar },
    { title: "Gallery", href: "/gallery", icon: ShoppingBag },
    { title: "Contact", href: "/contact", icon: MessageCircle },
  ]

  return (
    <>
      {/* Desktop Header */}
      <motion.header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isMobile ? 'hidden' : ''} ${
          isScrolled 
            ? "bg-gray-50/95 backdrop-blur-md luxury-shadow py-4" 
            : "bg-gray-50/90 backdrop-blur-sm py-5"
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center group">
              <div className="h-12 group-hover:scale-110 transition-transform duration-200">
                <Image 
                  src="/logoeco.png" 
                  alt="Eco Nuru Logo" 
                  width={144} 
                  height={48} 
                  className="object-contain h-full w-auto"
                />
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.title}
                  href={link.href}
                  className="text-sm font-medium hover:text-primary transition-colors relative group"
                >
                  {link.title}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
                </Link>
              ))}
            </nav>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-4">
              {/* Contact Info */}
              {isContactVisible && (
                <div className="hidden xl:flex items-center gap-4 text-sm text-gray-600 mr-4">
                  <div className="flex items-center gap-1">
                    <Phone className="w-4 h-4" />
                    <span>+254 757 883 799</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>Westlands, Nairobi</span>
                  </div>
                </div>
              )}
              
              <Link href="/account">
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10">
                  <User className="w-5 h-5" />
                </Button>
              </Link>
              <Link href="/book">
                <Button className="bg-[#2E7D32] hover:bg-[#1B5E20] text-white rounded-xl px-6 py-2 font-semibold shadow transition-colors">
                  Book Now
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden rounded-full hover:bg-primary/10"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </Button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="fixed inset-0 bg-white z-50 flex flex-col lg:hidden"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
          >
            {/* Mobile Header */}
            <div className="container mx-auto px-4 py-5 flex items-center justify-between border-b">
              <Link href="/" className="flex items-center" onClick={() => setIsMobileMenuOpen(false)}>
                <div className="h-12">
                  <Image 
                    src="/logoeco.png" 
                    alt="Eco Nuru Logo" 
                    width={144} 
                    height={48} 
                    className="object-contain h-full w-auto"
                  />
                </div>
              </Link>

              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full hover:bg-primary/10" 
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <X className="w-6 h-6" />
              </Button>
            </div>

            {/* Mobile Navigation */}
            <div className="flex-1 flex flex-col justify-center px-4">
              <nav className="flex flex-col gap-6 items-center">
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * i }}
                  >
                    <Link
                      href={link.href}
                      className="text-2xl font-medium hover:text-primary transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {link.title}
                    </Link>
                  </motion.div>
                ))}
              </nav>

              {/* Mobile Contact Info */}
              <motion.div
                className="mt-8 flex flex-col gap-4 items-center text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="w-4 h-4" />
                  <span>+254 757 883 799</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>Westlands, Nairobi</span>
                </div>
              </motion.div>

              {/* Mobile Actions */}
              <motion.div
                className="mt-10 flex flex-col gap-4 items-center w-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <div className="flex items-center gap-4 mb-4">
                  <Link href="/account" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <User className="w-5 h-5" />
                    </Button>
                  </Link>
                </div>
                
                <Link href="/book">
                  <Button 
                    className="bg-[#2E7D32] hover:bg-[#1B5E20] text-white rounded-xl w-full max-w-xs py-3"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Book Now
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary/5 rounded-xl w-full max-w-xs py-3"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  My Account
                </Button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <motion.div
          className="fixed bottom-0 left-0 right-0 z-50"
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          {/* Background with notch for bubble */}
          <div className="relative bg-white border-t border-gray-200 shadow-lg pb-2">
            {/* Main navigation container */}
            <div className="flex items-end justify-around pt-2 pb-1 px-4">
              {/* Left side nav items */}
              <Link
                href="/"
                className="flex flex-col items-center justify-center py-1 group active:bg-gray-50 rounded-lg px-3 transition-all"
              >
                <Home className="w-5 h-5 text-gray-600 group-hover:text-[#2E7D32] transition-colors" />
                <span className="text-xs text-gray-600 group-hover:text-[#2E7D32] transition-colors mt-1 font-medium">
                  Home
                </span>
              </Link>

              <Link
                href="/services"
                className="flex flex-col items-center justify-center py-1 group active:bg-gray-50 rounded-lg px-3 transition-all"
              >
                <Grid3X3 className="w-5 h-5 text-gray-600 group-hover:text-[#2E7D32] transition-colors" />
                <span className="text-xs text-gray-600 group-hover:text-[#2E7D32] transition-colors mt-1 font-medium">
                  Services
                </span>
              </Link>

              {/* Center bubble button */}
              <motion.div
                className="relative flex flex-col items-center -mt-8"
                initial={{ scale: 0, y: 30 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2, type: "spring", stiffness: 150, damping: 8 }}
              >
                <Link
                  href="/book"
                  className="group relative"
                >
                  {/* Outer glow effect */}
                  <div className="absolute -inset-2 bg-[#2E7D32] rounded-full blur-lg opacity-20 group-active:opacity-30 transition-opacity"></div>
                  
                  {/* Middle bubble effect */}
                  <div className="absolute -inset-1 bg-[#2E7D32] rounded-full blur-md opacity-25 group-active:scale-110 transition-transform"></div>
                  
                  {/* Main button with enhanced shadow */}
                  <div className="relative w-14 h-14 bg-gradient-to-br from-[#2E7D32] via-[#2E7D32] to-[#1B5E20] rounded-full flex items-center justify-center shadow-2xl border-2 border-white group-active:scale-95 transition-all">
                    {/* Inner glow */}
                    <div className="absolute inset-1 bg-gradient-to-br from-white/20 to-transparent rounded-full"></div>
                    <ShirtIcon className="w-6 h-6 text-white relative z-10" />
                  </div>
                  
                  {/* Button label with enhanced styling */}
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 bg-white rounded-full px-3 py-1 shadow-lg border border-gray-200">
                    <span className="text-xs font-bold text-[#2E7D32] whitespace-nowrap">
                      Book
                    </span>
                  </div>
                </Link>
              </motion.div>

              {/* Right side nav items */}
              <Link
                href="/gallery"
                className="flex flex-col items-center justify-center py-1 group active:bg-gray-50 rounded-lg px-3 transition-all"
              >
                <ShoppingBag className="w-5 h-5 text-gray-600 group-hover:text-[#2E7D32] transition-colors" />
                <span className="text-xs text-gray-600 group-hover:text-[#2E7D32] transition-colors mt-1 font-medium">
                  Gallery
                </span>
              </Link>

              <Link
                href="/contact"
                className="flex flex-col items-center justify-center py-1 group active:bg-gray-50 rounded-lg px-3 transition-all"
              >
                <MessageCircle className="w-5 h-5 text-gray-600 group-hover:text-[#2E7D32] transition-colors" />
                <span className="text-xs text-gray-600 group-hover:text-[#2E7D32] transition-colors mt-1 font-medium">
                  Contact
                </span>
              </Link>
            </div>

            {/* Safe area for home indicator */}
            <div className="h-1"></div>
          </div>
          
          {/* PWA Install Button */}
          {showInstallButton && (
            <motion.div
              className="absolute -top-16 right-4 z-10"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.5 }}
            >
              <Button
                onClick={handleInstallClick}
                className="bg-[#2E7D32] hover:bg-[#1B5E20] text-white rounded-full w-12 h-12 p-0 shadow-lg"
                title="Install App"
              >
                <Download className="w-5 h-5" />
              </Button>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Mobile Top Header (Simplified) */}
      {isMobile && (
        <motion.div
          className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-200"
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-between px-4 py-3">
            <Link href="/" className="flex items-center">
              <div className="h-8">
                <Image 
                  src="/logoeco.png" 
                  alt="Eco Nuru Logo" 
                  width={96} 
                  height={32} 
                  className="object-contain h-full w-auto"
                />
              </div>
            </Link>
            
            <div className="flex items-center gap-2">
              {showInstallButton && (
                <Button
                  onClick={handleInstallClick}
                  variant="ghost"
                  size="sm"
                  className="text-[#2E7D32] hover:bg-[#2E7D32]/10"
                >
                  <Download className="w-4 h-4 mr-1" />
                  Install
                </Button>
              )}
              <Link href="/account">
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10">
                  <User className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      )}

      {/* Mobile Content Padding */}
      {isMobile && (
        <div className="h-14 bg-transparent"></div>
      )}
    </>
  )
}
