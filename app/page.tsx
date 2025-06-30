"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion"
import { useInView } from "react-intersection-observer"
import {
  ShirtIcon,
  Shirt,
  Timer,
  Sparkles,
  TrendingUp,
  Star,
  ChevronRight,
  Instagram,
  Facebook,
  Twitter,
  Loader2,
  MessageSquare,
  ArrowRight,
  CheckCircle,
  Users,
  Award,
  Shield,
  Leaf,
  Calendar,
  ChevronLeft,
  ImageIcon,
  Clock,
  Truck,
  User,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { TestimonialCard } from "@/components/testimonial-card"
import { ServiceCard } from "@/components/service-card"
import { HowItWorksStep } from "@/components/how-it-works-step"
import { TestimonialSubmissionForm } from "@/components/testimonial-submission-form"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

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

interface Testimonial {
  _id: string;
  name: string;
  role?: string;
  content: string;
  rating: number;
  image?: string;
  status: string;
  submittedAt: string;
  gender?: 'male' | 'female';
}

interface Promotion {
  _id: string;
  title: string;
  promoCode: string;
  description: string;
  discount: number;
  discountType: 'percentage' | 'fixed';
  startDate: string;
  endDate: string;
  status: 'active' | 'scheduled' | 'expired' | 'paused';
  usageCount: number;
  usageLimit: number;
  bannerImage: string;
  minOrderAmount: number;
  maxDiscount: number;
  createdAt: string;
  updatedAt: string;
}

interface GalleryItem {
  _id: string;
  title: string;
  description?: string;
  imageUrl: string;
  category: 'before-after' | 'services' | 'facility' | 'team' | 'other';
  status: 'active' | 'inactive';
  featured: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

const BADGE_ICON_MAP = {
  tshirt: <Shirt className="w-5 h-5" />,
  clock: <Clock className="w-5 h-5" />,
  leaf: <Leaf className="w-5 h-5" />,
  star: <Star className="w-5 h-5" />,
  check: <CheckCircle className="w-5 h-5" />,
  eco: <Leaf className="w-5 h-5" />,
  sparkles: <Sparkles className="w-5 h-5" />,
  shield: <Shield className="w-5 h-5" />,
  truck: <Truck className="w-5 h-5" />,
  user: <User className="w-5 h-5" />,
}

interface Banner {
  _id: string
  title: string
  description: string
  bannerImage: string
  isActive: boolean
  position: number
  button1?: { text: string; link: string }
  button2?: { text: string; link: string }
  badges?: { title: string; icon: string }[]
  reviewSnippet?: { rating: number; reviewCount: number; text: string }
}

// Professional Econuru Preloader Component
const EconuruPreloader = ({ isLoading }: { isLoading: boolean }) => {
  const [progress, setProgress] = useState(0)
  const [loadingStep, setLoadingStep] = useState(0)

  const loadingSteps = [
    "Initializing Econuru Services...",
    "Loading premium content...",
    "Preparing your experience...",
    "Almost ready to serve you..."
  ]

  useEffect(() => {
    if (isLoading) {
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) return prev
          return prev + Math.random() * 20
        })
      }, 150)

      const stepInterval = setInterval(() => {
        setLoadingStep(prev => (prev + 1) % loadingSteps.length)
      }, 1000)

      return () => {
        clearInterval(progressInterval)
        clearInterval(stepInterval)
      }
    } else {
      setProgress(100)
    }
  }, [isLoading])

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-white via-blue-50/30 to-purple-50/20"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        >
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              className="absolute top-20 left-20 w-32 h-32 rounded-full bg-blue-100/40"
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 4, repeat: Infinity }}
            />
            <motion.div
              className="absolute bottom-20 right-20 w-24 h-24 rounded-full bg-purple-100/40"
              animate={{ scale: [1.2, 1, 1.2], opacity: [0.6, 0.3, 0.6] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            <motion.div
              className="absolute top-1/2 left-10 w-16 h-16 rounded-full bg-accent/20"
              animate={{ y: [-20, 20, -20], x: [-10, 10, -10] }}
              transition={{ duration: 5, repeat: Infinity }}
            />
          </div>
          
          <div className="relative z-10 text-center max-w-md mx-auto px-6">
            {/* Econuru Logo Animation */}
            <motion.div
              className="mb-8"
              initial={{ scale: 0.3, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: "backOut" }}
            >
              {/* Outer rotating ring */}
              <div className="relative w-28 h-28 mx-auto mb-6">
                <motion.div
                  className="absolute inset-0 rounded-full border-4 border-accent/20"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                />
                <motion.div
                  className="absolute inset-2 rounded-full border-2 border-purple-300/40"
                  animate={{ rotate: -360 }}
                  transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                />
                
                {/* Center logo container */}
                <div className="absolute inset-4 rounded-full bg-white shadow-xl flex items-center justify-center">
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ duration: 1, delay: 0.3, ease: "backOut" }}
                    className="w-10 h-10"
                  >
                    <svg viewBox="0 0 310.71 229.22" className="w-full h-full">
                      <g>
                        <polygon fill="#2E7D32" points="310.71 114.62 310.71 221.29 288.86 221.29 288.86 118.29 160.78 31.77 11.79 132.41 0 108.52 39.37 81.92 38.78 81.92 38.78 36.53 68.8 36.53 68.8 62.03 160.64 0 160.78 .26 160.9 0 288.86 86.44 289.91 87.16 310.71 114.62"/>
                        <g>
                          <circle fill="#2E7D32" cx="152.4" cy="181.83" r="47.39"/>
                          <circle fill="#2E7D32" cx="141.16" cy="97.39" r="28.57"/>
                          <circle fill="#2E7D32" cx="193.55" cy="110.29" r="12.15"/>
                        </g>
                      </g>
                    </svg>
                  </motion.div>
                </div>
                
                {/* Floating particles */}
                {[0, 1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 rounded-full bg-accent/60"
                    style={{
                      top: '50%',
                      left: '50%',
                      transformOrigin: `${40 + i * 5}px 0px`,
                    }}
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 4 + i,
                      repeat: Infinity,
                      ease: "linear",
                      delay: i * 0.5
                    }}
                  />
                ))}
              </div>
              
              {/* Econuru Brand Text */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <h1 className="text-4xl font-playfair font-bold text-gray-800 mb-2 tracking-wide">
                  Econuru
                </h1>
                <p className="text-accent font-medium text-sm tracking-wider uppercase">
                  Premium Laundry Services
                </p>
              </motion.div>
            </motion.div>

            {/* Loading Progress */}
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 1 }}
            >
              {/* Progress Bar */}
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-4 shadow-inner">
                <motion.div
                  className="h-full bg-gradient-to-r from-accent via-purple-500 to-accent bg-size-200 rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                  style={{
                    backgroundSize: "200% 100%",
                  }}
                />
              </div>
              
              {/* Progress Percentage */}
              <div className="text-right mb-3">
                <span className="text-sm font-semibold text-gray-600">
                  {Math.round(progress)}%
                </span>
              </div>
            </motion.div>

            {/* Loading Steps */}
            <motion.div
              className="min-h-[60px] flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1.2 }}
            >
              <motion.p
                key={loadingStep}
                className="text-gray-700 text-base font-medium"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                {loadingSteps[loadingStep]}
              </motion.p>
            </motion.div>

            {/* Animated dots */}
            <motion.div
              className="flex justify-center space-x-2 mt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1.4 }}
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-3 h-3 rounded-full bg-accent"
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.4, 1, 0.4],
                  }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </motion.div>

            {/* Quality Badge */}
            <motion.div
              className="mt-8 inline-flex items-center gap-2 px-4 py-2 bg-white/80 rounded-full shadow-md"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 1.6 }}
            >
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span className="text-xs font-medium text-gray-600">Premium Quality</span>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default function Home() {
  const [scrollY, setScrollY] = useState(0)
  const [featuredServices, setFeaturedServices] = useState<Service[]>([])
  const [isLoadingServices, setIsLoadingServices] = useState(true)
  const [isTestimonialModalOpen, setIsTestimonialModalOpen] = useState(false)
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [isLoadingTestimonials, setIsLoadingTestimonials] = useState(true)
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [isLoadingPromotions, setIsLoadingPromotions] = useState(true)
  const [currentPromotionIndex, setCurrentPromotionIndex] = useState(0)
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([])
  const [isLoadingGallery, setIsLoadingGallery] = useState(true)
  const [gallerySlide, setGallerySlide] = useState(0);
  const [banners, setBanners] = useState<Banner[]>([])
  const [currentBanner, setCurrentBanner] = useState(0)
  const [isLoadingBanners, setIsLoadingBanners] = useState(true)
  
  // Page loading state for preloader
  const [isPageLoading, setIsPageLoading] = useState(true)
  const [initialLoadComplete, setInitialLoadComplete] = useState(false)

  const [heroRef, heroInView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  const [servicesRef, servicesInView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  const [howItWorksRef, howItWorksInView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  const [promotionsRef, promotionsInView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  const [testimonialsRef, testimonialsInView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  const { scrollY: framerScrollY } = useScroll()
  const heroY = useTransform(framerScrollY, [0, 300], [0, 100])
  const servicesY = useTransform(framerScrollY, [0, 300], [0, 50])

  const heroInViewRef = useRef(false)
  const servicesInViewRef = useRef(false)
  const howItWorksInViewRef = useRef(false)
  const promotionsInViewRef = useRef(false)
  const testimonialsInViewRef = useRef(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect()
        heroInViewRef.current = rect.top < window.innerHeight && rect.bottom > 0
      }
      if (servicesRef.current) {
        const rect = servicesRef.current.getBoundingClientRect()
        servicesInViewRef.current = rect.top < window.innerHeight && rect.bottom > 0
      }
      if (howItWorksRef.current) {
        const rect = howItWorksRef.current.getBoundingClientRect()
        howItWorksInViewRef.current = rect.top < window.innerHeight && rect.bottom > 0
      }
      if (promotionsRef.current) {
        const rect = promotionsRef.current.getBoundingClientRect()
        promotionsInViewRef.current = rect.top < window.innerHeight && rect.bottom > 0
      }
      if (testimonialsRef.current) {
        const rect = testimonialsRef.current.getBoundingClientRect()
        testimonialsInViewRef.current = rect.top < window.innerHeight && rect.bottom > 0
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Initial page loading sequence
  useEffect(() => {
    const initializePage = async () => {
      setIsPageLoading(true)
      
      try {
        // Load critical content first (banners for hero section)
        await fetchBanners()
        
        // Small delay for smooth UX
        setTimeout(() => {
          setInitialLoadComplete(true)
          setIsPageLoading(false)
          
          // Load secondary content in background
          loadSecondaryContent()
        }, 1200) // Minimum loading time for smooth experience
        
      } catch (error) {
        console.error('Error during initial load:', error)
        setIsPageLoading(false)
        setInitialLoadComplete(true)
      }
    }
    
    initializePage()
  }, [])

  // Load secondary content after main page is shown
  const loadSecondaryContent = async () => {
    try {
      await Promise.allSettled([
        fetchFeaturedServices(),
        fetchTestimonials(),
        fetchPromotions(),
        fetchGalleryItems()
      ])
    } catch (error) {
      console.error('Error loading secondary content:', error)
    }
  }

  const fetchFeaturedServices = async () => {
    try {
      const response = await fetch('/api/services')
      const data = await response.json()
      
      if (data.success) {
        // Filter for featured and active services, limit to 4
        const featured = data.services
          .filter((service: Service) => service.featured && service.active)
          .slice(0, 4)
        setFeaturedServices(featured)
      }
    } catch (error) {
      console.error('Error fetching featured services:', error)
    } finally {
      setIsLoadingServices(false)
    }
  }

  const fetchTestimonials = async () => {
    try {
      setIsLoadingTestimonials(true)
      const response = await fetch("/api/testimonials")
      const data = await response.json()
      if (data.success) {
        setTestimonials(data.data)
      }
    } catch (error) {
      console.error("Error fetching testimonials:", error)
    } finally {
      setIsLoadingTestimonials(false)
    }
  }

  const fetchPromotions = async () => {
    try {
      setIsLoadingPromotions(true)
      const response = await fetch('/api/promotions')
      const data = await response.json()
      
      if (data.success) {
        // Filter for active promotions only
        const activePromotions = data.promotions.filter((promotion: Promotion) => promotion.status === 'active')
        setPromotions(activePromotions)
      }
    } catch (error) {
      console.error('Error fetching promotions:', error)
    } finally {
      setIsLoadingPromotions(false)
    }
  }

  const fetchGalleryItems = async () => {
    try {
      setIsLoadingGallery(true)
      const response = await fetch('/api/gallery?status=active&featured=true')
      const data = await response.json()
      
      console.log('Gallery API response:', data)
      
      if (data.success) {
        // Get up to 8 featured and active gallery items
        let featuredItems = data.gallery
          .filter((item: GalleryItem) => item.featured && item.status === 'active')
          .sort((a: GalleryItem, b: GalleryItem) => a.order - b.order)
          .slice(0, 8)
        
        // If no featured items, get all active items
        if (featuredItems.length === 0) {
          console.log('No featured items found, showing all active items')
          featuredItems = data.gallery
            .filter((item: GalleryItem) => item.status === 'active')
            .sort((a: GalleryItem, b: GalleryItem) => a.order - b.order)
            .slice(0, 8)
        }
        
        console.log('Filtered gallery items:', featuredItems)
        setGalleryItems(featuredItems)
      }
    } catch (error) {
      console.error('Error fetching gallery items:', error)
    } finally {
      setIsLoadingGallery(false)
    }
  }

  const fetchBanners = async (retryCount = 0) => {
    try {
      console.log(`🚀 Homepage: Banner fetch attempt ${retryCount + 1}...`)
      setIsLoadingBanners(true)
      
      const response = await fetch('/api/banners?active=true', {
        headers: {
          'Cache-Control': 'no-cache',
          'Priority': 'high'
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      if (data.success && data.banners.length > 0) {
        console.log(`✅ SUCCESS: Banners loaded in ${retryCount + 1} attempts (${data.banners.length} items)`)
        setBanners(data.banners)
        setIsLoadingBanners(false)
        return // Success - stop retrying
      } else {
        throw new Error('No banners found in response')
      }
    } catch (error) {
      console.error(`❌ Banner fetch attempt ${retryCount + 1} failed:`, error)
      
      // Retry logic - keep trying until success
      if (retryCount < 10) { // Max 10 retries
        const delay = Math.min(1000 * Math.pow(1.5, retryCount), 5000) // Exponential backoff, max 5s
        console.log(`🔄 Retrying in ${delay}ms... (attempt ${retryCount + 2}/10)`)
        
        setTimeout(() => {
          fetchBanners(retryCount + 1)
        }, delay)
      } else {
        console.error('💥 All banner fetch attempts failed - using fallback')
        setBanners([{
          _id: 'fallback',
          title: 'Premium Laundry Services',
          description: 'Experience the finest in garment care with our professional laundry and dry cleaning services. We deliver quality that exceeds expectations.',
          bannerImage: '/placeholder.jpg',
          isActive: true,
          position: 1
        }])
        setIsLoadingBanners(false)
      }
    }
  }

  // Slider navigation functions
  const nextPromotion = () => {
    setCurrentPromotionIndex((prev) => 
      prev === promotions.length - 1 ? 0 : prev + 1
    )
  }

  const prevPromotion = () => {
    setCurrentPromotionIndex((prev) => 
      prev === 0 ? promotions.length - 1 : prev - 1
    )
  }

  const goToPromotion = (index: number) => {
    setCurrentPromotionIndex(index)
  }

  // Auto-advance slider every 5 seconds
  useEffect(() => {
    if (promotions.length > 1) {
      const interval = setInterval(() => {
        nextPromotion()
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [promotions.length, currentPromotionIndex])

  // Auto-advance banner slider every 7 seconds
  useEffect(() => {
    if (banners.length > 1) {
      const interval = setInterval(() => {
        setCurrentBanner((prev) => (prev + 1) % banners.length)
      }, 7000)
      return () => clearInterval(interval)
    }
  }, [banners.length])

  // Slider navigation for gallery
  const nextGallerySlide = () => {
    setGallerySlide((prev) => (prev + 1) % galleryItems.length);
  };
  const prevGallerySlide = () => {
    setGallerySlide((prev) => (prev - 1 + galleryItems.length) % galleryItems.length);
  };

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
        return <Shirt className="w-8 h-8 text-accent" />
      case 'business-cleaning':
        return <TrendingUp className="w-8 h-8 text-accent" />
      default:
        return <Shirt className="w-8 h-8 text-accent" />
    }
  }

  const getPriceUnit = (category: string) => {
    return category === "home-cleaning" || category === "business-cleaning" ? "per sqm" : "per kg"
  }

  const howItWorksSteps = [
    {
      id: 1,
      title: "Schedule Pickup",
      description: "Book a convenient time slot through our app or website.",
      icon: "01",
    },
    {
      id: 2,
      title: "We Collect",
      description: "Our uniformed staff arrives at your doorstep with premium laundry bags.",
      icon: "02",
    },
    {
      id: 3,
      title: "Expert Processing",
      description: "Your items receive specialized care in our state-of-the-art facility.",
      icon: "03",
    },
    {
      id: 4,
      title: "Delivery",
      description: "We return your freshly cleaned items, beautifully presented.",
      icon: "04",
    },
  ]

  // Only use real testimonials from database
  const displayTestimonials = testimonials

  return (
    <>
      {/* Econuru Preloader */}
      <EconuruPreloader isLoading={isPageLoading} />
      
      {/* Main Page Content */}
      <AnimatePresence>
        {!isPageLoading && (
          <motion.div
            className="min-h-screen bg-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <Navbar />

            {/* Dynamic Hero/Banner Section */}
      <motion.section
        ref={heroRef}
        className="relative pt-24 pb-20 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={heroInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.8 }}
      >
                      <div className="container px-4 md:px-6">
                {banners.length > 0 ? (
            <div className="relative">
              <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
                {/* Banner Content */}
                <motion.div
                  className="flex flex-col gap-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={heroInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-playfair font-bold tracking-tight">
                    {banners[currentBanner].title}
                  </h1>
                  <p className="text-lg text-text-light max-w-[600px]">
                    {banners[currentBanner].description}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 mt-4">
                    {banners[currentBanner].button1 && banners[currentBanner].button1.text && (
                      <Link href={banners[currentBanner].button1.link}>
                        <Button size="lg" className="bg-accent hover:bg-accent/90 text-white rounded-xl px-8">
                          {banners[currentBanner].button1.text}
                        </Button>
                      </Link>
                    )}
                    {banners[currentBanner].button2 && banners[currentBanner].button2.text && (
                      <Link href={banners[currentBanner].button2.link}>
                        <Button
                          size="lg"
                          variant="outline"
                          className="border-primary text-primary hover:bg-primary/5 rounded-xl px-8"
                        >
                          {banners[currentBanner].button2.text}
                        </Button>
                      </Link>
                    )}
                  </div>
                  {/* Review Snippet */}
                  {banners[currentBanner].reviewSnippet && (
                    <div className="flex items-center gap-4 mt-6">
                      <div className="flex -space-x-2">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className="w-8 h-8 rounded-full border-2 border-white overflow-hidden bg-gray-200 flex items-center justify-center">
                            <User className="w-5 h-5 text-gray-400" />
                          </div>
                        ))}
                      </div>
                      <div className="text-sm">
                        <span className="font-semibold">{banners[currentBanner].reviewSnippet.rating}/5</span> from over <span className="font-semibold">{banners[currentBanner].reviewSnippet.reviewCount.toLocaleString()}</span> reviews
                        {banners[currentBanner].reviewSnippet.text && (
                          <span className="ml-2 italic">{banners[currentBanner].reviewSnippet.text}</span>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
                {/* Banner Image with floating badges */}
                <motion.div
                  className="relative"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={heroInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  <div className="relative h-[400px] md:h-[500px] w-full rounded-2xl overflow-hidden luxury-shadow">
                    {banners[currentBanner].bannerImage ? (
                      <img
                        src={banners[currentBanner].bannerImage}
                        alt={banners[currentBanner].title}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <ImageIcon className="h-16 w-16 text-gray-400" />
                      </div>
                    )}
                    {/* Floating badges on image */}
                    {banners[currentBanner].badges && banners[currentBanner].badges.length > 0 && (
                      <>
                        {banners[currentBanner].badges[0] && (
                          <div className="absolute top-6 right-6 bg-white p-4 rounded-xl luxury-shadow flex items-center gap-2">
                            {BADGE_ICON_MAP[banners[currentBanner].badges[0].icon] || <ImageIcon className="w-5 h-5" />}
                            <div>
                              <p className="text-sm font-medium">{banners[currentBanner].badges[0].title}</p>
                            </div>
                          </div>
                        )}
                        {banners[currentBanner].badges[1] && (
                          <div className="absolute bottom-6 left-6 bg-white p-4 rounded-xl luxury-shadow flex items-center gap-2">
                            {BADGE_ICON_MAP[banners[currentBanner].badges[1].icon] || <ImageIcon className="w-5 h-5" />}
                            <div>
                              <p className="text-sm font-medium">{banners[currentBanner].badges[1].title}</p>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </motion.div>
              </div>
              {/* Banner Slider Controls */}
              {banners.length > 1 && (
                <div className="absolute left-1/2 -translate-x-1/2 bottom-0 flex gap-2 mt-6">
                  {banners.map((_, idx) => (
                    <button
                      key={idx}
                      className={`w-3 h-3 rounded-full border-2 ${currentBanner === idx ? 'bg-primary border-primary' : 'bg-white border-gray-300'}`}
                      onClick={() => setCurrentBanner(idx)}
                      aria-label={`Go to banner ${idx + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-96 text-gray-400">
              <ImageIcon className="h-16 w-16 mr-4" />
              <span>No banners to display</span>
            </div>
          )}
        </div>
        {/* Decorative elements */}
        <div className="absolute top-1/4 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-accent/5 rounded-full blur-3xl -z-10"></div>
      </motion.section>

      {/* Services Section */}
      <section ref={servicesRef} className="py-12 bg-gradient-to-br from-primary/5 via-accent/3 to-primary/8">
        <div className="container px-4 md:px-6">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={servicesInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Services & Pricing</h2>
            <p className="text-text-light max-w-2xl mx-auto">
              Tailored solutions for your garment care needs, delivered with uncompromising attention to detail.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {isLoadingServices ? (
              // Loading state
              Array.from({ length: 4 }).map((_, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={servicesInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.1 * index }}
                  className="relative h-[320px] bg-white rounded-2xl p-6 luxury-shadow overflow-hidden flex items-center justify-center"
                >
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </motion.div>
              ))
            ) : featuredServices.length > 0 ? (
              featuredServices.map((service, index) => (
                <motion.div
                  key={service._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={servicesInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.1 * index }}
                >
                  <ServiceCard 
                    service={{
                      id: service._id,
                      title: service.name,
                      description: service.description,
                      icon: getIconForCategory(service.category),
                      price: service.price,
                      perUnit: getPriceUnit(service.category),
                    }} 
                  />
                </motion.div>
              ))
            ) : (
              // No featured services found
              <div className="col-span-full text-center py-12">
                <p className="text-text-light text-lg">No featured services available at the moment.</p>
              </div>
            )}
          </div>

          <motion.div
            className="mt-12 text-center"
            initial={{ opacity: 0 }}
            animate={servicesInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Link href="/services">
              <Button variant="outline" className="border-primary text-primary hover:bg-primary/5 rounded-xl px-8">
                View All Services <ChevronRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section ref={howItWorksRef} className="py-12">
        <div className="container px-4 md:px-6">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={howItWorksInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-text-light max-w-2xl mx-auto">
              A seamless experience from pickup to delivery, designed with your convenience in mind.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {howItWorksSteps.map((step, index) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 20 }}
                animate={howItWorksInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.1 * index }}
              >
                <HowItWorksStep step={step} />
              </motion.div>
            ))}
          </div>

          <motion.div
            className="mt-16 p-8 bg-secondary rounded-2xl luxury-shadow"
            initial={{ opacity: 0, y: 20 }}
            animate={howItWorksInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            {promotions.length > 0 ? (
              <div className="relative">
                {/* Multiple promotions slider */}
                <div className="relative">
                  {/* Current promotion */}
                  <motion.div
                    key={currentPromotionIndex}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="grid lg:grid-cols-2 gap-8 items-center"
                  >
                    <div>
                      <h3 className="text-2xl font-bold mb-4">{promotions[currentPromotionIndex].title}</h3>
                      <p className="text-text-light mb-6">
                        {promotions[currentPromotionIndex].description}
                        {promotions[currentPromotionIndex].promoCode && (
                          <span className="font-semibold text-accent ml-1">{promotions[currentPromotionIndex].promoCode}</span>
                        )}
                      </p>
                      <Link href="/book">
                        <Button size="lg" className="bg-accent hover:bg-accent/90 text-white rounded-xl px-8">
                          Book Your Pickup
                        </Button>
                      </Link>
                    </div>
                    {promotions[currentPromotionIndex].bannerImage && (
                      <div className="relative h-[200px] lg:h-[250px] rounded-xl overflow-hidden">
                        <Image
                          src={promotions[currentPromotionIndex].bannerImage}
                          alt={promotions[currentPromotionIndex].title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                  </motion.div>

                  {/* Dots indicator */}
                  <div className="flex justify-center mt-6 space-x-2">
                    {promotions.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => goToPromotion(index)}
                        className={`w-3 h-3 rounded-full transition-all duration-200 ${
                          index === currentPromotionIndex
                            ? 'bg-accent scale-125'
                            : 'bg-gray-300 hover:bg-gray-400'
                        }`}
                        aria-label={`Go to promotion ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section ref={testimonialsRef} className="py-20 bg-secondary">
        <div className="container px-4 md:px-6">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={testimonialsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Clients Say</h2>
            <p className="text-text-light max-w-2xl mx-auto mb-6">
              Don't just take our word for it. Hear from our satisfied clients about their experience.
            </p>
            
            <Dialog open={isTestimonialModalOpen} onOpenChange={setIsTestimonialModalOpen}>
              <DialogTrigger asChild>
                <Button className="bg-accent hover:bg-accent/90 text-white rounded-xl px-6 py-2">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Add Your Testimonial
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Share Your Experience</DialogTitle>
                  <DialogDescription>
                    Tell us about your experience with Eco Nuru Services. Your feedback helps others make informed decisions.
                  </DialogDescription>
                </DialogHeader>
                <TestimonialSubmissionForm onClose={() => setIsTestimonialModalOpen(false)} />
              </DialogContent>
            </Dialog>
          </motion.div>

          {isLoadingTestimonials ? (
            // Loading state
            <div className="grid md:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={testimonialsInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.1 * index }}
                  className="bg-white rounded-2xl p-6 luxury-shadow h-full flex items-center justify-center"
                >
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </motion.div>
              ))}
            </div>
          ) : displayTestimonials.length > 0 ? (
            // Show real testimonials
            <div className="grid md:grid-cols-3 gap-6">
              {displayTestimonials.map((testimonial, index) => (
                <motion.div
                  key={testimonial._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={testimonialsInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.1 * index }}
                >
                  <TestimonialCard testimonial={testimonial} />
                </motion.div>
              ))}
            </div>
          ) : (
            // No testimonials yet
            <motion.div
              className="text-center py-16"
              initial={{ opacity: 0, y: 20 }}
              animate={testimonialsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6 }}
            >
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <MessageSquare className="w-12 h-12 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-primary">Be the First to Share Your Experience</h3>
              <p className="text-text-light text-lg max-w-md mx-auto mb-8">
                We're excited to hear from our valued customers. Share your experience and help others discover our premium laundry service.
              </p>
              <Button 
                className="bg-accent hover:bg-accent/90 text-white rounded-xl px-6 py-2"
                onClick={() => setIsTestimonialModalOpen(true)}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Share Your Experience
              </Button>
            </motion.div>
          )}

          {displayTestimonials.length > 0 && (
            <motion.div
              className="mt-12 flex justify-center"
              initial={{ opacity: 0 }}
              animate={testimonialsInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-5 h-5 fill-accent text-accent" />
                  ))}
                </div>
                <span className="font-semibold">4.9</span>
                <span className="text-text-light">from {displayTestimonials.length}+ reviews</span>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* Social Media & Gallery Preview Section */}
      <section className="py-16">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Follow Our Journey</h2>
            <p className="text-text-light">
              Connect with us on social media for tips, updates, and behind-the-scenes content.
            </p>
          </div>

          <div className="flex justify-center gap-6 mb-10">
            <Link href="#" className="p-3 rounded-full bg-secondary hover:bg-secondary/80 transition-colors">
              <Instagram className="w-6 h-6 text-text" />
            </Link>
            <Link href="#" className="p-3 rounded-full bg-secondary hover:bg-secondary/80 transition-colors">
              <Facebook className="w-6 h-6 text-text" />
            </Link>
            <Link href="#" className="p-3 rounded-full bg-secondary hover:bg-secondary/80 transition-colors">
              <Twitter className="w-6 h-6 text-text" />
            </Link>
          </div>

          {/* Gallery Images Preview */}
          {isLoadingGallery ? (
            <div className="mt-10 grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="aspect-square rounded-xl overflow-hidden luxury-shadow bg-secondary animate-pulse">
                  <div className="w-full h-full bg-gray-200"></div>
                </div>
              ))}
            </div>
          ) : galleryItems.length > 0 ? (
            <div className="mt-10 grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {galleryItems.slice(0, 8).map((item, index) => (
                <div
                  key={item._id}
                  className="aspect-square rounded-xl overflow-hidden luxury-shadow bg-white relative"
                  style={{ cursor: 'default' }}
                >
                  <Image
                    src={item.imageUrl}
                    alt={item.title}
                    width={300}
                    height={300}
                    className="object-cover w-full h-full"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-black/40 text-white p-2 text-xs truncate">
                    {item.title}
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {/* Gallery Preview - Link to Gallery Page */}
          <div className="mt-12 text-center">
            <Link href="/gallery">
              <Button variant="outline" className="border-primary text-primary hover:bg-primary/5 rounded-xl px-8">
                <ImageIcon className="w-4 h-4 mr-2" />
                View Our Gallery
              </Button>
            </Link>
          </div>
        </div>
      </section>

                  <Footer />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
