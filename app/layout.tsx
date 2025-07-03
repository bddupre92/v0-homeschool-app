import type React from "react"
import { Inter, Fraunces } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/contexts/auth-context"
import { AnalyticsProvider } from "@/lib/analytics"
import { CacheProvider } from "@/lib/cache"
import AIAssistant from "@/components/ai-assistant"
import ServiceWorkerRegister from "./sw-register"
import { Suspense } from "react"
import "./globals.css"
import { CookieConsent } from "@/components/cookie-consent"
import { Footer } from "@/components/footer"
import { ErrorTrackingProvider } from "@/lib/error-tracking"
import { PerformanceMonitoringProvider } from "@/lib/performance-monitoring"
import { SessionInitializer } from "@/components/session-initializer"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
})

export const metadata = {
  title: "AtoZ Family - Your Homeschool Resource Hub",
  description:
    "Discover, organize, and share homeschool resources with AtoZ Family. Connect with other homeschoolers and track your progress all in one place.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "AtoZ Family",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://atozfamily.org",
    title: "AtoZ Family - Your Homeschool Resource Hub",
    description: "Discover, organize, and share homeschool resources with AtoZ Family.",
    siteName: "AtoZ Family",
    images: [
      {
        url: "https://atozfamily.org/images/atozfamily-hero.jpg",
        width: 1200,
        height: 630,
        alt: "AtoZ Family Homeschool Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AtoZ Family - Your Homeschool Resource Hub",
    description: "Discover, organize, and share homeschool resources with AtoZ Family.",
    images: ["https://atozfamily.org/images/atozfamily-hero.jpg"],
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="theme-color" content="#ffffff" />
      </head>
      <body className={`${inter.variable} ${fraunces.variable} font-sans`}>
        <CacheProvider>
          <AnalyticsProvider>
            <ErrorTrackingProvider>
              <PerformanceMonitoringProvider>
                <AuthProvider>
                  <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
                    <Suspense>
                      {children}
                      <AIAssistant />
                    </Suspense>
                    <ServiceWorkerRegister />
                    <Footer />
                    <CookieConsent />
                    <SessionInitializer />
                  </ThemeProvider>
                </AuthProvider>
              </PerformanceMonitoringProvider>
            </ErrorTrackingProvider>
          </AnalyticsProvider>
        </CacheProvider>
      </body>
    </html>
  )
}
