"use client"

import { Clock } from "lucide-react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"

export default function AccountComingSoon() {
  const router = useRouter()
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#d1fae5] p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="bg-white border border-[#b2f2e9] rounded-3xl shadow-2xl p-10 flex flex-col items-center max-w-md w-full"
      >
        <div className="mb-6 flex items-center justify-center w-20 h-20 rounded-full bg-[#b2f2e9]">
          <Clock className="w-12 h-12 text-[#38a3a5] opacity-90" />
        </div>
        <h1 className="text-4xl font-extrabold text-[#38a3a5] mb-3 tracking-tight">Coming Soon</h1>
        <p className="text-gray-600 text-center mb-8 text-lg">
          The account management page is under construction.<br />
          Please check back soon for new features and updates!
        </p>
        <button
          onClick={() => router.back()}
          className="mt-2 px-8 py-3 rounded-xl bg-[#38a3a5] text-white font-semibold text-base shadow hover:bg-[#2d8c8c] transition-colors focus:outline-none focus:ring-2 focus:ring-[#38a3a5] focus:ring-offset-2"
        >
          Go Back
        </button>
                        </motion.div>
    </div>
  )
} 