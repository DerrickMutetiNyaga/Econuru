"use client"

import { motion } from "framer-motion"

interface HowItWorksStepProps {
  step: {
    id: number
    title: string
    description: string
    icon: string
  }
}

export function HowItWorksStep({ step }: HowItWorksStepProps) {
  return (
    <motion.div className="relative" whileHover={{ scale: 1.03 }}>
      <div className="bg-white rounded-2xl p-6 luxury-shadow h-full">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <span className="font-space-grotesk font-bold text-primary">{step.icon}</span>
        </div>
        <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
        <p className="text-text-light text-sm">{step.description}</p>
      </div>

      {step.id < 4 && (
        <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 5L16 12L9 19" stroke="#3C9D9B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      )}
    </motion.div>
  )
}
