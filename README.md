# HomeScholar - Homeschool Resource Hub

HomeScholar is a comprehensive platform for homeschooling families to discover, organize, and share educational resources. Connect with other homeschoolers and track your progress all in one place.

## Features

- **Resource Library**: Browse and search thousands of homeschool resources
- **Boards**: Create and organize collections of resources
- **Planner**: Schedule and track your homeschool activities
- **Community**: Connect with other homeschoolers and join events
- **Personalized Recommendations**: Get AI-powered resource suggestions

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Firebase (Authentication, Firestore, Storage)
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18.x or higher
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

4. For server-side Firebase Admin SDK, create a service account key in the Firebase console and save it as `service-account.json` in the root directory.

5. Run the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

### Deploying to Vercel

1. Push your code to a GitHub repository.

2. Connect your repository to Vercel.

3. Configure the following environment variables in the Vercel dashboard:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
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
   - `ratings`

4. Set up Firebase Storage for file uploads.

5. Configure Firestore Rules for security.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
