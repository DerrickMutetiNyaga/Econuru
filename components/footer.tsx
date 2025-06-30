import Link from "next/link"
import Image from "next/image"
import { ShirtIcon, Mail, Phone, MapPin, Instagram, Facebook, Twitter } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function Footer() {
  return (
    <footer className="bg-secondary pt-16 pb-8">
      <div className="container px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <Link href="/" className="flex items-center mb-6">
              <div className="h-12">
                <Image 
                  src="/econurulogo.svg" 
                  alt="Eco Nuru Logo" 
                  width={144} 
                  height={48} 
                  className="object-contain h-full w-auto"
                />
              </div>
            </Link>
            <p className="text-text-light mb-4">
              For years we've been there for your laundry needs. Now it's no longer just about laundry but the whole home care revolution. Your go-to premium service of choice.
            </p>
            <p className="text-primary font-semibold text-sm mb-6">
              "To a greener tomorrow, one service at a time"
            </p>
            <div className="flex gap-4">
              <Link href="#" className="p-2 rounded-full bg-white hover:bg-white/80 transition-colors luxury-shadow">
                <Instagram className="w-5 h-5 text-text" />
              </Link>
              <Link href="#" className="p-2 rounded-full bg-white hover:bg-white/80 transition-colors luxury-shadow">
                <Facebook className="w-5 h-5 text-text" />
              </Link>
              <Link href="#" className="p-2 rounded-full bg-white hover:bg-white/80 transition-colors luxury-shadow">
                <Twitter className="w-5 h-5 text-text" />
              </Link>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-6">Quick Links</h3>
            <ul className="space-y-4">
              <li>
                <Link href="/services" className="text-text-light hover:text-primary transition-colors">
                  Services & Pricing
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="text-text-light hover:text-primary transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-text-light hover:text-primary transition-colors">
                  FAQs
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-text-light hover:text-primary transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-6">Contact</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary mt-0.5" />
                <span className="text-text-light">
                  Westlands, Nairobi
                  <br />
                  Kenya
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-primary" />
                <Link href="tel:+254757883799" className="text-text-light hover:text-primary transition-colors">
                  +254 757 883 799
                </Link>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary" />
                <Link
                  href="mailto:econuruservices@gmail.com"
                  className="text-text-light hover:text-primary transition-colors"
                >
                  econuruservices@gmail.com
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-6">Newsletter</h3>
            <p className="text-text-light mb-4">Subscribe to receive updates, access to exclusive deals, and more.</p>
            <div className="flex flex-col gap-3">
              <Input
                type="email"
                placeholder="Enter your email"
                className="bg-white border-0 luxury-shadow rounded-xl"
              />
              <Button className="bg-accent hover:bg-accent/90 text-white rounded-xl w-full">Subscribe</Button>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-text-light">
            © {new Date().getFullYear()} Eco Nuru Services. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="/privacy" className="text-sm text-text-light hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-sm text-text-light hover:text-primary transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
