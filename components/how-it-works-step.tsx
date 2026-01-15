"use client"

import { motion } from "framer-motion"
import { Calendar, Package, Sparkles, Truck } from "lucide-react"

interface HowItWorksStepProps {
  step: {
    id: number
    title: string
    description: string
    icon: string
  }
}

const stepIcons = {
  1: Calendar,
  2: Package,
  3: Sparkles,
  4: Truck,
}

const stepColors = [
  { bg: 'from-blue-50 to-primary/10', border: 'border-primary/30', iconBg: 'bg-primary/20', iconColor: 'text-primary' },
  { bg: 'from-purple-50 to-primary/10', border: 'border-primary/30', iconBg: 'bg-primary/20', iconColor: 'text-primary' },
  { bg: 'from-accent/10 to-primary/10', border: 'border-accent/30', iconBg: 'bg-accent/20', iconColor: 'text-accent' },
  { bg: 'from-green-50 to-primary/10', border: 'border-primary/30', iconBg: 'bg-primary/20', iconColor: 'text-primary' },
]

export function HowItWorksStep({ step }: HowItWorksStepProps) {
  const colors = stepColors[step.id - 1] || stepColors[0]
  const IconComponent = stepIcons[step.id as keyof typeof stepIcons] || Calendar

  return (
    <motion.div 
      className="relative group" 
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      <div className={`bg-gradient-to-br ${colors.bg} ${colors.border} border-t-4 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 luxury-shadow h-full relative overflow-hidden`}>
        {/* Decorative background pattern - hidden on mobile */}
        <div className="hidden sm:block absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/5 to-transparent rounded-full -mr-16 -mt-16" />
        
        <div className="relative z-10">
          {/* Icon with number */}
          <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-5">
            <div className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 ${colors.iconBg} rounded-lg sm:rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300 shrink-0`}>
              <IconComponent className={`w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 ${colors.iconColor}`} />
            </div>
            <div className={`w-10 h-10 sm:w-12 sm:h-12 ${colors.iconBg} rounded-full flex items-center justify-center border-2 ${colors.border} shrink-0`}>
              <span className="font-bold text-base sm:text-lg text-gray-700">{step.icon}</span>
            </div>
          </div>
          
          <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-gray-900 group-hover:text-primary transition-colors duration-300">
            {step.title}
          </h3>
          <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
            {step.description}
          </p>
        </div>
      </div>

      {/* Connector Arrow */}
      {step.id < 4 && (
        <motion.div 
          className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-20"
          initial={{ opacity: 0.5 }}
          whileHover={{ opacity: 1, x: 5 }}
          transition={{ duration: 0.3 }}
        >
          <div className="relative">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="14" fill="white" className="shadow-lg" />
              <path 
                d="M12 10L20 16L12 22" 
                stroke="#3C9D9B" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                className="group-hover:stroke-accent transition-colors duration-300"
              />
            </svg>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
