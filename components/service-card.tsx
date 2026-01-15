"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"

interface ServiceCardProps {
  service: {
    id: number
    title: string
    description: string
    icon: React.ReactNode
    price: string
    perUnit: string
  }
}

export function ServiceCard({ service }: ServiceCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  // Color gradients based on card index or create variety
  const colorVariants = [
    'from-primary/10 via-accent/5 to-primary/5',
    'from-accent/10 via-primary/5 to-accent/5',
    'from-primary/15 via-accent/10 to-primary/8',
    'from-accent/15 via-primary/10 to-accent/8',
  ]
  const borderColors = [
    'border-t-4 border-primary',
    'border-t-4 border-accent',
    'border-t-4 border-primary/80',
    'border-t-4 border-accent/80',
  ]
  
  // Use service id to consistently assign colors
  const colorIndex = typeof service.id === 'string' ? parseInt(service.id.slice(-1), 16) % 4 : service.id % 4

  return (
    <motion.div
      className={`relative h-[280px] sm:h-[300px] md:h-[320px] bg-gradient-to-br ${colorVariants[colorIndex]} ${borderColors[colorIndex]} rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 luxury-shadow overflow-hidden`}
      whileHover={{ y: -5 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex flex-col h-full bg-white/60 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 -m-2">
        <div className="mb-3 sm:mb-4">{service.icon}</div>
        <h3 className="text-lg sm:text-xl font-semibold mb-2 text-gray-900 line-clamp-2">{service.title}</h3>
        <p className="text-text-light text-xs sm:text-sm flex-grow line-clamp-3">{service.description}</p>
        <div className="mt-3 sm:mt-4 flex items-center justify-between">
          <div>
            <span className="text-lg sm:text-xl font-semibold text-primary">{service.price}</span>
            <span className="text-text-light text-xs"> {service.perUnit}</span>
          </div>
          <Button variant="ghost" size="sm" className="rounded-full p-0 w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 hover:bg-primary text-primary hover:text-white shrink-0">
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
        </div>
      </div>

      <motion.div
        className="absolute inset-0 bg-gradient-luxury p-4 sm:p-5 md:p-6 flex flex-col justify-between rounded-xl sm:rounded-2xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      >
        <div>
          <div className="mb-3 sm:mb-4 text-white">{service.icon}</div>
          <h3 className="text-lg sm:text-xl font-semibold mb-2 text-white line-clamp-2">{service.title}</h3>
          <p className="text-white/90 text-xs sm:text-sm line-clamp-3">{service.description}</p>
        </div>
        <div className="mt-3 sm:mt-4">
          <Link href="/book">
            <Button className="bg-white text-primary hover:bg-white/90 rounded-xl w-full text-sm sm:text-base py-2">Book Now</Button>
          </Link>
        </div>
      </motion.div>
    </motion.div>
  )
}
