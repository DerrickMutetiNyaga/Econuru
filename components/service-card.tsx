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

  return (
    <motion.div
      className="relative h-[320px] bg-white rounded-2xl p-6 luxury-shadow overflow-hidden"
      whileHover={{ y: -5 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex flex-col h-full">
        <div className="mb-4">{service.icon}</div>
        <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
        <p className="text-text-light text-sm flex-grow">{service.description}</p>
        <div className="mt-4 flex items-center justify-between">
          <div>
            <span className="text-xl font-semibold">{service.price}</span>
            <span className="text-text-light text-xs"> {service.perUnit}</span>
          </div>
          <Button variant="ghost" size="sm" className="rounded-full p-0 w-10 h-10">
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <motion.div
        className="absolute inset-0 bg-gradient-luxury p-6 flex flex-col justify-between"
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      >
        <div>
          <div className="mb-4 text-white">{service.icon}</div>
          <h3 className="text-xl font-semibold mb-2 text-white">{service.title}</h3>
          <p className="text-white/90 text-sm">{service.description}</p>
        </div>
        <div className="mt-4">
          <Link href="/book">
            <Button className="bg-white text-primary hover:bg-white/90 rounded-xl w-full">Book Now</Button>
          </Link>
        </div>
      </motion.div>
    </motion.div>
  )
}
