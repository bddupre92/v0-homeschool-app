import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { adminAuth } from "./firebase-admin"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Firebase",
      credentials: {
        token: { label: "Token", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.token) return null

        try {
          // Verify the Firebase token
          const decodedToken = await adminAuth.verifyIdToken(credentials.token)

          // Return the user data
          return {
            id: decodedToken.uid,
            name: decodedToken.name || decodedToken.email?.split("@")[0] || "User",
            email: decodedToken.email,
            image: decodedToken.picture || null,
          }
        } catch (error) {
          console.error("Error verifying Firebase token:", error)
          return null
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/sign-in",
    error: "/sign-in",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string
      }
      return session
    },
  },
}
