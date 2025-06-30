"use client"

import { motion } from "framer-motion"
import { useInView } from "react-intersection-observer"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { HowItWorksStep } from "@/components/how-it-works-step"
import { Clock, Shield, Truck, Star, Check, ArrowRight, Calendar, Package, Sparkles, Heart } from "lucide-react"

export default function HowItWorksPage() {
  const [heroRef, heroInView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  const [stepsRef, stepsInView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  const [featuresRef, featuresInView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  const [ctaRef, ctaInView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  const howItWorksSteps = [
    {
      id: 1,
      title: "Schedule Pickup",
      description: "Book a convenient time slot through our app or website. Choose from multiple time windows that fit your schedule.",
      icon: "01",
    },
    {
      id: 2,
      title: "We Collect",
      description: "Our uniformed staff arrives at your doorstep with premium laundry bags. No need to be home - we'll collect from your designated location.",
      icon: "02",
    },
    {
      id: 3,
      title: "Expert Processing",
      description: "Your items receive specialized care in our state-of-the-art facility. Each garment is treated according to its specific fabric requirements.",
      icon: "03",
    },
    {
      id: 4,
      title: "Delivery",
      description: "We return your freshly cleaned items, beautifully presented and ready to wear. Same convenient pickup location.",
      icon: "04",
    },
  ]

  const detailedSteps = [
    {
      iconName: "Calendar",
      title: "Easy Booking",
      description: "Book your pickup in seconds through our intuitive app or website. Choose your preferred time slot and we'll confirm within minutes.",
      features: ["24/7 online booking", "Flexible time slots", "Instant confirmation", "Reschedule anytime"]
    },
    {
      iconName: "Package",
      title: "Smart Collection",
      description: "Our professional team arrives at your doorstep with eco-friendly laundry bags. We handle everything from collection to sorting.",
      features: ["Professional uniformed staff", "Eco-friendly bags", "Contactless pickup", "Secure handling"]
    },
    {
      iconName: "Sparkles",
      title: "Premium Processing",
      description: "Your garments receive expert care in our state-of-the-art facility using premium detergents and specialized equipment.",
      features: ["Fabric-specific treatment", "Premium detergents", "Advanced equipment", "Quality inspection"]
    },
    {
      iconName: "Truck",
      title: "Reliable Delivery",
      description: "We return your items beautifully presented and ready to wear. Same convenient location for pickup and delivery.",
      features: ["Same location delivery", "Beautiful presentation", "On-time delivery", "Quality guarantee"]
    }
  ]

  const benefits = [
    {
      iconName: "Clock",
      title: "Time Saving",
      description: "Save 3-4 hours per week on laundry chores"
    },
    {
      iconName: "Shield",
      title: "Quality Guarantee",
      description: "100% satisfaction or we'll make it right"
    },
    {
      iconName: "Star",
      title: "Expert Care",
      description: "Trained professionals with years of experience"
    },
    {
      iconName: "Heart",
      title: "Eco-Friendly",
      description: "Environmentally conscious cleaning methods"
    }
  ]

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case "Calendar":
        return <Calendar className="w-8 h-8 text-primary" />
      case "Package":
        return <Package className="w-8 h-8 text-primary" />
      case "Sparkles":
        return <Sparkles className="w-8 h-8 text-primary" />
      case "Truck":
        return <Truck className="w-8 h-8 text-primary" />
      case "Clock":
        return <Clock className="w-6 h-6 text-accent" />
      case "Shield":
        return <Shield className="w-6 h-6 text-accent" />
      case "Star":
        return <Star className="w-6 h-6 text-accent" />
      case "Heart":
        return <Heart className="w-6 h-6 text-accent" />
      default:
        return <Calendar className="w-8 h-8 text-primary" />
    }
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
              className="text-4xl md:text-5xl font-bold mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              How It Works
            </motion.h1>
            <motion.p
              className="text-lg text-text-light max-w-2xl mx-auto mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Experience the perfect blend of convenience and luxury. Our streamlined process ensures your garments receive the care they deserve while saving you valuable time.
            </motion.p>
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <Link href="/book">
                <Button size="lg" className="bg-accent hover:bg-accent/90 text-white rounded-xl px-8">
                  Book Your First Pickup
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="border-primary text-primary hover:bg-primary/5 rounded-xl px-8"
              >
                View Our Services
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-1/4 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-accent/5 rounded-full blur-3xl -z-10"></div>
      </motion.section>

      {/* Simple Steps Section */}
      <section ref={stepsRef} className="py-20 bg-secondary">
        <div className="container px-4 md:px-6">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={stepsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple 4-Step Process</h2>
            <p className="text-text-light max-w-2xl mx-auto">
              From booking to delivery, we've streamlined every step for maximum convenience.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {howItWorksSteps.map((step, index) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 20 }}
                animate={stepsInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.1 * index }}
              >
                <HowItWorksStep step={step} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Detailed Process Section */}
      <section ref={featuresRef} className="py-20">
        <div className="container px-4 md:px-6">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={featuresInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What Makes Us Different</h2>
            <p className="text-text-light max-w-2xl mx-auto">
              Every step of our process is designed with your convenience and garment care in mind.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12">
            {detailedSteps.map((step, index) => (
              <motion.div
                key={index}
                className="flex gap-6"
                initial={{ opacity: 0, y: 20 }}
                animate={featuresInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.1 * index }}
              >
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    {getIconComponent(step.iconName)}
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                  <p className="text-text-light mb-4">{step.description}</p>
                  <ul className="space-y-2">
                    {step.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-accent" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gradient-to-br from-primary/5 via-accent/3 to-primary/8">
        <div className="container px-4 md:px-6">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Our Service</h2>
            <p className="text-text-light max-w-2xl mx-auto">
              Experience the benefits of professional laundry care without leaving your home.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-2xl p-6 luxury-shadow text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
              >
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  {getIconComponent(benefit.iconName)}
                </div>
                <h3 className="text-lg font-semibold mb-2">{benefit.title}</h3>
                <p className="text-text-light text-sm">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section ref={ctaRef} className="py-20">
        <div className="container px-4 md:px-6">
          <motion.div
            className="p-8 bg-secondary rounded-2xl luxury-shadow"
            initial={{ opacity: 0, y: 20 }}
            animate={ctaInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-bold mb-4">Ready to Experience Premium Laundry Service?</h3>
                <p className="text-text-light mb-6">
                  Schedule your first pickup today and enjoy $20 off your first order with code{" "}
                  <span className="font-semibold text-accent">WELCOME20</span>.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/book">
                    <Button size="lg" className="bg-accent hover:bg-accent/90 text-white rounded-xl px-8">
                      Book Your Pickup <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                  <Link href="/services">
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-primary text-primary hover:bg-primary/5 rounded-xl px-8"
                    >
                      View Services
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="relative h-[200px] lg:h-[250px] rounded-xl overflow-hidden">
                <Image
                  src="/placeholder.svg?height=250&width=500&text=Premium+Service"
                  alt="Premium Laundry Service"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
} 