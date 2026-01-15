"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { Star, User, UserCheck, Quote } from "lucide-react"

interface TestimonialCardProps {
  testimonial: {
    _id: string
    name: string
    role?: string
    content: string
    rating: number
    image?: string
    status?: string
    submittedAt?: string
    gender?: 'male' | 'female'
  }
}

const colorVariants = [
  { bg: 'from-primary/10 via-accent/5 to-primary/5', border: 'border-primary/30', accent: 'text-primary' },
  { bg: 'from-accent/10 via-primary/5 to-accent/5', border: 'border-accent/30', accent: 'text-accent' },
  { bg: 'from-purple-50 via-primary/5 to-purple-50', border: 'border-primary/30', accent: 'text-primary' },
]

export function TestimonialCard({ testimonial }: TestimonialCardProps) {
  // Assign color based on testimonial ID for consistency
  const colorIndex = parseInt(testimonial._id.slice(-1), 16) % 3
  const colors = colorVariants[colorIndex]

  // Gender-specific icon component with theme colors
  const GenderIcon = ({ gender }: { gender?: 'male' | 'female' }) => {
    if (gender === 'male') {
      return (
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center border-2 border-primary/30 shadow-md shrink-0">
          <User className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
        </div>
      )
    } else if (gender === 'female') {
      return (
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center border-2 border-accent/30 shadow-md shrink-0">
          <UserCheck className="w-6 h-6 sm:w-7 sm:h-7 text-accent" />
        </div>
      )
    } else {
      // Fallback for testimonials without gender
      return (
        <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br ${colors.bg} flex items-center justify-center border-2 ${colors.border} shadow-md shrink-0`}>
          <User className={`w-6 h-6 sm:w-7 sm:h-7 ${colors.accent}`} />
        </div>
      )
    }
  }

  return (
    <motion.div 
      className={`group relative bg-gradient-to-br ${colors.bg} ${colors.border} border-t-4 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 luxury-shadow h-full flex flex-col overflow-hidden`}
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      {/* Decorative background elements - hidden on mobile */}
      <div className="hidden sm:block absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary/5 to-transparent rounded-full -mr-12 -mt-12" />
      <div className="hidden sm:block absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-accent/5 to-transparent rounded-full -ml-10 -mb-10" />
      
      <div className="relative z-10 flex flex-col h-full">
        {/* Quote icon at top */}
        <div className="flex justify-between items-start mb-3 sm:mb-4">
          <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg ${colors.bg} flex items-center justify-center border ${colors.border} opacity-60`}>
            <Quote className={`w-4 h-4 sm:w-5 sm:h-5 ${colors.accent}`} />
          </div>
        </div>

        {/* Rating stars */}
        <div className="flex mb-3 sm:mb-4 gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 sm:w-5 sm:h-5 transition-all duration-200 ${
                i < testimonial.rating 
                  ? "fill-accent text-accent scale-110" 
                  : "fill-gray-200 text-gray-300"
              }`}
            />
          ))}
        </div>

        {/* Testimonial content */}
        <p className="text-gray-700 text-xs sm:text-sm flex-grow leading-relaxed mb-4 sm:mb-6 relative line-clamp-4">
          "{testimonial.content}"
        </p>

        {/* Author info */}
        <div className="flex items-center gap-3 sm:gap-4 mt-auto pt-3 sm:pt-4 border-t border-gray-200/50">
          <GenderIcon gender={testimonial.gender} />
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-sm sm:text-base text-gray-900 group-hover:text-primary transition-colors duration-300 truncate">
              {testimonial.name}
            </h4>
            <p className="text-gray-600 text-xs sm:text-sm font-medium">
              {testimonial.role || "Client"}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
