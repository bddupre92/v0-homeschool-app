"use client"

import Link from "next/link"
import { Facebook, Twitter, Instagram, Youtube } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-muted py-12 mt-auto">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-4">HomeScholar</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Your all-in-one platform for homeschool resources, planning, and community.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-muted-foreground hover:text-foreground">
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground">
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground">
                <Youtube className="h-5 w-5" />
                <span className="sr-only">YouTube</span>
              </Link>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/resources" className="text-muted-foreground hover:text-foreground">
                  Browse Resources
                </Link>
              </li>
              <li>
                <Link href="/boards" className="text-muted-foreground hover:text-foreground">
                  Boards
                </Link>
              </li>
              <li>
                <Link href="/planner" className="text-muted-foreground hover:text-foreground">
                  Planner
                </Link>
              </li>
              <li>
                <Link href="/scroll" className="text-muted-foreground hover:text-foreground">
                  Discover
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">Community</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/community" className="text-muted-foreground hover:text-foreground">
                  Community Hub
                </Link>
              </li>
              <li>
                <Link href="/community/locations" className="text-muted-foreground hover:text-foreground">
                  Locations
                </Link>
              </li>
              <li>
                <Link href="/community/events" className="text-muted-foreground hover:text-foreground">
                  Events
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/terms-of-service" className="text-muted-foreground hover:text-foreground">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="text-muted-foreground hover:text-foreground">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <button
                  className="text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    // Open cookie preferences dialog
                    // This would need to be connected to your cookie consent component
                    window.dispatchEvent(new CustomEvent("open-cookie-preferences"))
                  }}
                >
                  Cookie Preferences
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} HomeScholar. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
