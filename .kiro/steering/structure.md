# Project Structure & Conventions

## Directory Organization

```
├── app/                    # Next.js App Router pages and layouts
│   ├── api/               # API routes
│   ├── actions/           # Server actions for data mutations
│   ├── [feature]/         # Feature-based page organization
│   └── globals.css        # Global styles
├── components/            # Reusable React components
│   ├── ui/               # Base UI components (Radix + custom)
│   ├── auth/             # Authentication-related components
│   └── [feature]/        # Feature-specific components
├── lib/                  # Utility libraries and configurations
│   ├── __tests__/        # Unit tests
│   └── tools/            # Specialized utility modules
├── hooks/                # Custom React hooks
├── contexts/             # React context providers
├── public/               # Static assets
└── styles/               # Additional stylesheets
```

## Naming Conventions

- **Files**: kebab-case (`user-profile.tsx`, `board-actions.ts`)
- **Components**: PascalCase (`UserProfile`, `BoardCard`)
- **Hooks**: camelCase with `use` prefix (`useFirestore`, `useAuth`)
- **Server Actions**: camelCase (`createBoard`, `updateUser`)
- **Types/Interfaces**: PascalCase (`User`, `BoardItem`)

## Component Patterns

### UI Components
- Use Radix UI as base with custom styling via `cn()` utility
- Implement variant-based styling with `class-variance-authority`
- Forward refs for proper component composition
- Export both component and variant functions

### Page Components
- Default export for page components
- Use loading.tsx and error.tsx for route-level states
- Implement proper metadata for SEO

### Server Actions
- Mark with `"use server"` directive
- Handle authentication via session cookies
- Return structured responses: `{ success: boolean, error?: string }`
- Use `revalidatePath()` for cache invalidation

## Authentication Patterns

- Client-side: Firebase Auth with React Context
- Server-side: Firebase Admin SDK with session cookies
- Protected routes use middleware + client-side guards
- Development mode bypasses auth (commented middleware)

## Data Patterns

- Firestore collections: `users`, `boards`, `boardItems`, `resources`, `events`
- Use Firebase Admin SDK for server actions
- Client-side queries via custom hooks (`useFirestore`)
- Implement optimistic updates where appropriate

## Styling Conventions

- Use Tailwind utility classes
- Custom design tokens: sage, terracotta, honey color palettes
- Responsive design with mobile-first approach
- Dark mode support via `next-themes`
- Use `cn()` utility for conditional classes

## Error Handling

- Global error boundaries for React errors
- Sentry integration for production error tracking
- Graceful fallbacks for missing Firebase config
- User-friendly error messages in forms and actions