"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { ShirtIcon, Menu, X, User, ShoppingBag, Phone, MapPin } from "lucide-react"

import { Button } from "@/components/ui/button"

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isContactVisible, setIsContactVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Show contact info on larger screens
  useEffect(() => {
    const handleResize = () => {
      setIsContactVisible(window.innerWidth >= 768)
    }
    
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const navLinks = [
    { title: "Home", href: "/" },
    { title: "Services & Pricing", href: "/services" },
    { title: "How It Works", href: "/how-it-works" },
    { title: "Gallery", href: "/gallery" },
    { title: "Contact Us", href: "/contact" },
  ]

  return (
    <>
      <motion.header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
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
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <ShirtIcon className="w-5 h-5 text-white" />
              </div>
              <span className="font-playfair font-bold text-lg sm:text-xl group-hover:text-primary transition-colors">
                Eco Nuru
              </span>
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
                <Button className="bg-[#e2b15b] hover:bg-[#c9982a] text-white rounded-xl px-6 py-2 font-semibold shadow transition-colors">
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
              <Link href="/" className="flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                  <ShirtIcon className="w-5 h-5 text-white" />
                </div>
                <span className="font-playfair font-bold text-xl">Eco Nuru</span>
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
                    className="bg-[#e2b15b] hover:bg-[#c9982a] text-white rounded-xl w-full max-w-xs py-3"
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
    </>
  )
}
