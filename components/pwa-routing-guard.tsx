"use client"

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'

// Component to enforce PWA installation context routing
export function PWARoutingGuard() {
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    // Only enforce in standalone mode (installed app)
    // Don't interfere with regular web browsing
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    
    // Clear install context if not in standalone mode (shouldn't be set during web browsing)
    // This ensures regular web browsing isn't affected by stale localStorage values
    if (!isStandalone) {
      // Clear any install context that might have been set incorrectly
      const installContext = localStorage.getItem('pwa-install-context')
      if (installContext) {
        // Only clear if we're definitely not in standalone mode
        // Use a small delay to avoid race conditions
        const timeoutId = setTimeout(() => {
          if (!window.matchMedia('(display-mode: standalone)').matches) {
            localStorage.removeItem('pwa-install-context')
          }
        }, 100)
        return () => clearTimeout(timeoutId)
      }
      return
    }

    const installContext = localStorage.getItem('pwa-install-context')

    // If installed as admin app
    if (installContext === 'admin') {
      // Redirect to admin if trying to access client pages
      if (!pathname?.startsWith('/admin')) {
        router.replace('/admin')
      }
    }
    // If installed as client app
    else if (installContext === 'client') {
      // Redirect to home if trying to access admin pages
      if (pathname?.startsWith('/admin')) {
        router.replace('/')
      }
    }
    // If no context stored but in standalone mode, determine from current path
    else {
      if (pathname?.startsWith('/admin')) {
        localStorage.setItem('pwa-install-context', 'admin')
      } else {
        localStorage.setItem('pwa-install-context', 'client')
      }
    }
  }, [pathname, router])

  return null
}

