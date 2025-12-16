"use client"

import { useEffect, useState } from 'react'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'

// Admin PWA setup - registers admin service worker and handles install prompt
export function AdminPWASetup() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showInstallButton, setShowInstallButton] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
      return
    }

    // Register admin service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw-admin.js')
        .then((registration) => {
          console.log('PWA (Admin): Service Worker registered')
        })
        .catch((error) => {
          console.log('PWA (Admin): Service Worker registration failed', error)
        })
    }

    // Handle install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowInstallButton(true)
    }

    const handleAppInstalled = () => {
      setShowInstallButton(false)
      setDeferredPrompt(null)
      setIsInstalled(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const choiceResult = await deferredPrompt.userChoice
      if (choiceResult.outcome === 'accepted') {
        setShowInstallButton(false)
        setIsInstalled(true)
      }
      setDeferredPrompt(null)
    }
  }

  // Don't show anything if already installed or no prompt available
  if (isInstalled || !showInstallButton) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button
        onClick={handleInstallClick}
        className="bg-primary hover:bg-primary/90 text-white shadow-lg flex items-center gap-2"
        size="sm"
      >
        <Download className="h-4 w-4" />
        Install Admin App
      </Button>
    </div>
  )
}

