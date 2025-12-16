"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { useInView } from "react-intersection-observer"
import { Shirt, Timer, Sparkles, TrendingUp, Shield, Truck, Clock, Star, Check, ArrowRight, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

interface Service {
  _id: string;
  name: string;
  description: string;
  category: string;
  price: string;
  turnaround: string;
  active: boolean;
  featured: boolean;
  image: string;
  features: string[];
  createdAt: string;
  updatedAt: string;
}

export default function ServicesPage() {
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [services, setServices] = useState<Service[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [heroRef, heroInView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  // Removed intersection observer - was causing services not to display

  const categories = [
    { id: "all", name: "All Services" },
    { id: "dry-cleaning", name: "Dry Cleaning" },
    { id: "wash-fold", name: "Wash & Fold" },
    { id: "luxury", name: "Luxury Care" },
    { id: "business", name: "Business" },
    { id: "home-cleaning", name: "Home Cleaning" },
    { id: "business-cleaning", name: "Business Cleaning" },
  ]

  // Fetch services from database
  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/services')
      
      if (!response.ok) {
        // Check if response is HTML (error page) instead of JSON
        const contentType = response.headers.get('content-type')
        if (contentType && contentType.includes('text/html')) {
          const text = await response.text()
          console.error('❌ Server returned HTML error page:', text.substring(0, 200))
          throw new Error(`Server error: ${response.status}. Check server logs for details.`)
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      // Check content type before parsing
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text()
        console.error('❌ Expected JSON but got:', contentType, text.substring(0, 200))
        throw new Error('Invalid response format')
      }
      
      const data = await response.json()
      console.log('📦 Services API response:', data)
      
      if (data.success && data.services) {
        console.log(`📦 Raw services from API:`, data.services)
        
        // Show all services where active is not explicitly false
        // (includes true, undefined, or null - defaults to showing them)
        const activeServices = data.services.filter((service: Service) => {
          const isActive = service.active !== false
          console.log(`Service "${service.name}": active=${service.active}, willShow=${isActive}`)
          return isActive
        })
        
        console.log(`✅ Found ${activeServices.length} active services out of ${data.services.length} total`)
        
        // If no active services but we have services, show all (for debugging)
        if (activeServices.length === 0 && data.services.length > 0) {
          console.warn('⚠️ No active services found, showing all services for debugging')
          setServices(data.services)
        } else {
          setServices(activeServices)
        }
        
        // Force a re-render check
        console.log('🔄 Setting services state, count:', activeServices.length || data.services.length)
      } else if (data.error) {
        console.error('❌ API returned error:', data.error)
        setError(data.error || 'Failed to fetch services')
        setServices([])
      } else {
        console.warn('⚠️ Unexpected response format:', data)
        setError('Unexpected response from server')
        setServices([])
      }
    } catch (error: any) {
      console.error('❌ Error fetching services:', error)
      setError(error.message || 'Failed to fetch services. Please try again later.')
      setServices([])
    } finally {
      setIsLoading(false)
    }
  }

  const filteredServices =
    selectedCategory === "all" 
      ? services 
      : services.filter((service) => service.category === selectedCategory)


  const getIconForCategory = (category: string) => {
    switch (category) {
      case 'dry-cleaning':
        return <Shirt className="w-8 h-8 text-accent" />
      case 'wash-fold':
        return <Timer className="w-8 h-8 text-accent" />
      case 'luxury':
        return <Sparkles className="w-8 h-8 text-accent" />
      case 'business':
        return <TrendingUp className="w-8 h-8 text-accent" />
      case 'home-cleaning':
        return <Shield className="w-8 h-8 text-accent" />
      case 'business-cleaning':
        return <Truck className="w-8 h-8 text-accent" />
      default:
        return <Shirt className="w-8 h-8 text-accent" />
    }
  }

  const features = [
    {
      icon: <Clock className="w-6 h-6 text-primary" />,
      title: "Fast Turnaround",
      description: "Most items ready within 24-48 hours",
    },
    {
      icon: <Shield className="w-6 h-6 text-primary" />,
      title: "Quality Guarantee",
      description: "100% satisfaction or we'll make it right",
    },
    {
      icon: <Truck className="w-6 h-6 text-primary" />,
      title: "Free Pickup & Delivery",
      description: "Convenient service right to your door",
    },
    {
      icon: <Star className="w-6 h-6 text-primary" />,
      title: "Expert Care",
      description: "Trained professionals with years of experience",
    },
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <motion.section
        ref={heroRef}
        className="relative pt-32 pb-20 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={heroInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.8 }}
      >
        <div className="container px-4 md:px-6">
          <div className="text-center max-w-4xl mx-auto">
            <motion.h1
              className="text-4xl md:text-5xl font-bold mb-6 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Our Services & Pricing
            </motion.h1>
            <motion.p
              className="text-lg text-text-light max-w-2xl mx-auto mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Experience the perfect blend of traditional craftsmanship and modern technology. Every garment receives
              personalized attention and expert care.
            </motion.p>
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <Link href="/book">
                <Button size="lg" className="bg-accent hover:bg-accent/90 text-white rounded-xl px-8">
                  Book Service Now
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="border-primary text-primary hover:bg-primary/5 rounded-xl px-8"
              >
                Get Quote
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-1/4 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-accent/5 rounded-full blur-3xl -z-10"></div>
      </motion.section>

      {/* Features Section */}
      <section className="py-16 bg-secondary">
        <div className="container px-4 md:px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="text-center p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-text-light text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20">
        <div className="container px-4 md:px-6">
          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                className={`rounded-full ${
                  selectedCategory === category.id
                    ? "bg-accent hover:bg-accent/90 text-white"
                    : "border-primary text-primary hover:bg-primary/5"
                }`}
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.name}
              </Button>
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-center py-8 mb-8">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md mx-auto">
                <p className="text-red-800 font-medium mb-2">Error Loading Services</p>
                <p className="text-red-600 text-sm">{error}</p>
                <Button
                  onClick={() => {
                    setError(null)
                    fetchServices()
                  }}
                  className="mt-4"
                  variant="outline"
                  size="sm"
                >
                  Retry
                </Button>
              </div>
            </div>
          )}

          {/* Services Grid */}
          {isLoading ? (
            <div className="text-center py-12">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-text-light">Loading services...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600 text-lg">Error: {error}</p>
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-text-light text-lg">No services found for this category.</p>
              <p className="text-text-light text-sm mt-2">Please check back later or contact us for more information.</p>
              <p className="text-text-light text-xs mt-4">Debug: services={services.length}, filtered={filteredServices.length}, category={selectedCategory}</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredServices.map((service, index) => (
              <motion.div
                  key={service._id}
                  className="group relative"
                initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                  <div className="relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all duration-300 group-hover:-translate-y-2">
                    {/* Service Image */}
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={service.image || "/placeholder.svg"}
                        alt={service.name}
                    fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                      {service.featured && (
                        <div className="absolute top-4 left-4">
                          <Badge className="bg-accent text-white border-0">Featured</Badge>
                </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                    </div>

                    {/* Service Content */}
                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          {getIconForCategory(service.category)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{service.name}</h3>
                          <p className="text-text-light text-sm">{service.turnaround}</p>
                    </div>
                  </div>

                      <p className="text-text-light text-sm mb-4 line-clamp-2">{service.description}</p>

                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <span className="text-2xl font-bold text-primary">{service.price}</span>
                          <span className="text-text-light text-sm ml-1">
                            {service.category === "home-cleaning" || service.category === "business-cleaning" 
                              ? " per sqm" 
                              : " per kg"}
                          </span>
                        </div>
                        <Link href="/book">
                          <Button size="sm" className="bg-accent hover:bg-accent/90 text-white rounded-xl">
                            Book Now
                          </Button>
                        </Link>
                      </div>

                      {/* Features */}
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm text-text">Features:</h4>
                        <ul className="text-xs text-text-light space-y-1">
                          {service.features.slice(0, 3).map((feature, idx) => (
                            <li key={idx} className="flex items-center">
                              <Check className="w-3 h-3 text-accent mr-2 flex-shrink-0" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                </div>
              </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}
