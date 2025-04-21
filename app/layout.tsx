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

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
})

export const metadata = {
  title: "HomeScholar - Your Homeschool Resource Hub",
  description:
    "Discover, organize, and share homeschool resources. Connect with other homeschoolers and track your progress all in one place.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "HomeScholar",
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
    url: "https://homescholar.vercel.app",
    title: "HomeScholar - Your Homeschool Resource Hub",
    description: "Discover, organize, and share homeschool resources.",
    siteName: "HomeScholar",
    images: [
      {
        url: "https://homescholar.vercel.app/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "HomeScholar",
      },
    ],
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
            <AuthProvider>
              <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
                <Suspense>
                  {children}
                  <AIAssistant />
                </Suspense>
                <ServiceWorkerRegister />
              </ThemeProvider>
            </AuthProvider>
          </AnalyticsProvider>
        </CacheProvider>
      </body>
    </html>
  )
}
