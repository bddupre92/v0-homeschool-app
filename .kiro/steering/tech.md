# Technology Stack

## Framework & Runtime

- **Next.js 15** with App Router
- **React 19** with TypeScript
- **Node.js 18+** (Node.js 20+ recommended for React 19)

## Styling & UI

- **Tailwind CSS** with custom design system
- **Radix UI** components for accessibility
- **Framer Motion** for animations
- **Lucide React** for icons
- **Custom color palette**: sage, terracotta, honey themes

## Backend & Database

- **Firebase** ecosystem:
  - Authentication (Email/Password, Google)
  - Firestore (NoSQL database)
  - Storage (file uploads)
  - Admin SDK for server-side operations
- **Server Actions** for form handling and mutations

## External Services

- **Mapbox** for location services and mapping
- **AI SDK with Groq** for AI-powered features
- **Vercel Analytics** for performance monitoring
- **Sentry** for error tracking

## Development Tools

- **TypeScript** for type safety
- **ESLint** (disabled during builds for flexibility)
- **Tailwind CSS** with custom configuration
- **PWA** support with service worker

## Common Commands

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Environment Setup
# Create .env.local with Firebase config:
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

## Build Configuration

- Images are unoptimized for deployment flexibility
- TypeScript and ESLint errors ignored during builds
- CORS headers configured for development
- Security headers implemented in middleware
