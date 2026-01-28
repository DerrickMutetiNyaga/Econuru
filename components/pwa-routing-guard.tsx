"use client"

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'

// Component to enforce PWA installation context routing
export function PWARoutingGuard() {
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    // Only enforce in standalone mode (installed app)
    if (!window.matchMedia('(display-mode: standalone)').matches) {
      return
    }

    const installContext = localStorage.getItem('pwa-install-context')

    // If installed as admin app
    if (installContext === 'admin') {
      // Redirect to admin login if trying to access client pages
      if (!pathname?.startsWith('/admin')) {
        router.replace('/admin/login')
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

