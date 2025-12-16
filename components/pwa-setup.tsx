"use client"

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

// Minimal PWA setup - registers service worker without any UI changes
// Skips registration on admin pages (admin has its own PWA setup)
export function PWASetup() {
  const pathname = usePathname()

  useEffect(() => {
    // Don't register service worker on admin pages
    if (pathname?.startsWith('/admin')) {
      return
    }

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('PWA: Service Worker registered')
        })
        .catch((error) => {
          console.log('PWA: Service Worker registration failed')
        })
    }
  }, [pathname])

  // No UI - this component is invisible
  return null
} 