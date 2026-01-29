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

    // Only check and redirect if in standalone mode (installed app)
    // Don't interfere with regular web browsing
    if (window.matchMedia('(display-mode: standalone)').matches) {
      const installContext = localStorage.getItem('pwa-install-context')
      if (installContext === 'admin') {
        // Redirect to admin if installed as admin app
        window.location.href = '/admin'
        return
      }
    }

    // Unregister admin service worker if it exists
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => {
          if (registration.scope.includes('/admin')) {
            registration.unregister().then(() => {
              console.log('PWA (Client): Unregistered admin service worker')
            })
          }
        })
      })
    }

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('PWA: Service Worker registered')
          // Only store client installation context if in standalone mode
          if (window.matchMedia('(display-mode: standalone)').matches) {
            localStorage.setItem('pwa-install-context', 'client')
          }
        })
        .catch((error) => {
          console.log('PWA: Service Worker registration failed')
        })
    }

    // Handle app installed event
    const handleAppInstalled = () => {
      // Store client installation context only when app is actually installed
      localStorage.setItem('pwa-install-context', 'client')
    }

    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [pathname])

  // No UI - this component is invisible
  return null
} 