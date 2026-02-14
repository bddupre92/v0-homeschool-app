# HomeScholar - Homeschool Resource Hub

HomeScholar is a comprehensive platform for homeschooling families to discover, organize, and share educational resources. Connect with other homeschoolers and track your progress all in one place.

## Features

- **Resource Library**: Browse and search thousands of homeschool resources
- **Boards**: Create and organize collections of resources with full CRUD operations
  - Create boards with titles and descriptions
  - Real-time form validation and error handling
  - Server-side data persistence with Firebase
  - Loading states and user feedback
- **Planner**: Schedule and track your homeschool activities
- **Community**: Connect with other homeschoolers and join events
- **Personalized Recommendations**: Get AI-powered resource suggestions

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Firebase (Authentication, Firestore, Storage)
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18.x or higher (Node.js 20+ recommended for React 19)
- npm or yarn
- Firebase account

### Installation

1. Clone the repository:
   \`\`\`bash
   git clone https://github.com/yourusername/homescholar.git
   cd homescholar
   \`\`\`

2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. Create a `.env.local` file in the root directory with your Firebase configuration:
   \`\`\`
   NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
   NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
   \`\`\`

   **Important**: 
   - Replace the placeholder values with your actual Firebase configuration from the Firebase Console
   - The application automatically detects demo/placeholder values and will run in development mode
   - If Firebase environment variables are missing or contain demo values, the app will display warnings and run with limited functionality
   - Session management and authentication tokens are handled gracefully when Firebase is unavailable
   - For production deployment, ensure all Firebase values are properly configured

4. For server-side Firebase Admin SDK, create a service account key in the Firebase console and save it as `service-account.json` in the root directory.

5. Run the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Testing

The project uses a comprehensive testing strategy with Vitest for unit/integration testing and custom scripts for production readiness.

### Running Tests

```bash
# Development Testing
npm run test              # Run tests in watch mode
npm run test:run          # Run tests once
npm run test:ui           # Run tests with UI

# Production Testing
npm run test:generate     # Generate missing test files
npm run test:production   # Run comprehensive production test suite
npm run test:all          # Run complete test pipeline (generate → unit → integration → production → build)

# Production Readiness
npm run production-check  # Check production readiness
npm run pre-deploy        # Complete pre-deployment validation
```

### Test Structure

- **Unit Tests**: Located in `lib/__tests__/` for utilities and services
  - `firebase.test.ts`: Firebase configuration and initialization
  - `session.test.ts`: Session management and token handling
  - `firebase-admin.test.ts`: Firebase Admin SDK functionality
  - `auth-context.test.tsx`: Authentication context and flows
  - `boards.test.tsx`: Board creation and management functionality
- **Component Tests**: Auto-generated tests for React components with React Testing Library
- **Integration Tests**: Test authentication flows and Firebase integration
- **Production Tests**: Comprehensive production readiness validation
  - Page compilation and rendering tests
  - API route validation
  - Build process verification
  - Security and accessibility checks
- **E2E Tests**: Full user journey testing (planned)

### Test Generation

The project includes automated test generation for components and pages without existing tests:

```bash
npm run test:generate
```

This will create basic test files for:
- Pages without corresponding test files
- Components missing test coverage
- Integration test scaffolding

### Writing Tests

Tests follow the Arrange-Act-Assert pattern:

```typescript
import { describe, it, expect } from 'vitest'

describe('Component', () => {
  it('should render correctly', () => {
    // Arrange
    const props = { title: 'Test' }
    
    // Act
    render(<Component {...props} />)
    
    // Assert
    expect(screen.getByText('Test')).toBeInTheDocument()
  })
})
```

## Deployment

### Deploying to Vercel

1. Push your code to a GitHub repository.

2. Connect your repository to Vercel.

3. Configure the following environment variables in the Vercel dashboard:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
   - `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
   - `GOOGLE_CALENDAR_CLIENT_ID`
   - `GOOGLE_CALENDAR_CLIENT_SECRET`
   - `GOOGLE_GENAI_API_KEY`
   - `FIREBASE_ADMIN_PROJECT_ID`
   - `FIREBASE_ADMIN_CLIENT_EMAIL`
   - `FIREBASE_ADMIN_PRIVATE_KEY`

4. Deploy your application.

## Firebase Setup

1. Create a new Firebase project at [https://console.firebase.google.com/](https://console.firebase.google.com/).

2. Enable Authentication with Email/Password and Google providers.

3. Create a Firestore database with the following collections:
   - `users`
   - `boards`
   - `boardItems`
   - `resources`
   - `lessons`
   - `events`
   - `eventAttendees`
   - `groups`
   - `groupMembers`
   - `curricula`
   - `stateRequirements`
   - `ratings`

4. Set up Firebase Storage for file uploads.

5. Configure Firestore Rules for security.

6. Enable Firebase AI Logic (Gemini) in the Firebase Console.
   - Ensure the Firebase project has access to Gemini models.
   - The app uses the Firebase web SDK to access Gemini via AI Logic.

7. (Optional) Configure Firebase Genkit for server-side AI workflows.
   - Set a `GOOGLE_GENAI_API_KEY` environment variable for the Genkit Google AI plugin.
   - Deploy Genkit flows alongside the app as needed.

## Google Maps Setup (Community Locations)

1. Create a Google Cloud project and enable the Maps JavaScript API.
2. Create an API key and add it to your environment as `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`.
3. Restart the dev server so the Community → Locations map can load.

## Google Calendar Sync (Planner)

1. Create OAuth credentials in Google Cloud and add authorized redirect URI:
   `https://<your-domain>/api/google-calendar/callback`
2. Add `GOOGLE_CALENDAR_CLIENT_ID` and `GOOGLE_CALENDAR_CLIENT_SECRET` to your environment.
3. Connect the planner from the UI to enable two-way sync.

### Build Environment Handling

The application automatically detects build environments and uses mock Firebase services to prevent initialization issues during deployment:

- **Vercel Preview Builds**: Detected via `NODE_ENV=production` and `VERCEL_ENV≠production`
- **Next.js Build Phase**: Detected via `NEXT_PHASE=phase-production-build`
- **Development**: Uses minimal Firebase config or mocks when credentials are unavailable

This ensures reliable builds even when Firebase credentials are not available during the build process.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
