"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2, AlertCircle, Info } from "lucide-react"
import { GoogleIcon } from "@/components/icons/google-icon"
import Link from "next/link"

import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Checkbox } from "@/components/ui/checkbox"

const formSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().default(false),
})

type FormValues = z.infer<typeof formSchema>

export default function SignInForm() {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [failedAttempts, setFailedAttempts] = useState(0)
  const { signIn, signInWithGoogle } = useAuth()
  const router = useRouter()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  })

  const onSubmit = async (data: FormValues) => {
    setError(null)
    setIsLoading(true)

    try {
      await signIn(data.email, data.password, data.rememberMe)

      // Check if there's a callback URL in the query parameters
      const searchParams = new URLSearchParams(window.location.search)
      const callbackUrl = searchParams.get("callbackUrl") || "/dashboard"

      router.push(callbackUrl)
    } catch (err: any) {
      // Increment failed attempts
      setFailedAttempts((prev) => prev + 1)

      // More specific error messages based on Firebase error codes
      if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password") {
        setError("Invalid email or password. Please try again.")
      } else if (err.code === "auth/too-many-requests") {
        setError("Too many failed login attempts. Please try again later or reset your password.")
      } else if (err.code === "auth/unauthorized-domain") {
        setError(
          "This domain is not authorized for authentication. Please add this domain to your Firebase project's authorized domains list.",
        )
      } else {
        setError("Failed to sign in. Please check your credentials.")
      }
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setError(null)
    setIsLoading(true)

    try {
      const rememberMe = form.getValues("rememberMe")
      await signInWithGoogle(rememberMe)

      // Check if there's a callback URL in the query parameters
      const searchParams = new URLSearchParams(window.location.search)
      const callbackUrl = searchParams.get("callbackUrl") || "/dashboard"

      router.push(callbackUrl)
    } catch (err: any) {
      console.error("Google sign in error:", err)

      if (err.code === "auth/popup-closed-by-user") {
        setError("Sign-in was cancelled. Please try again.")
      } else if (err.code === "auth/cancelled-popup-request") {
        setError("Another sign-in attempt is in progress. Please wait.")
      } else if (err.code === "auth/unauthorized-domain") {
        setError(
          "This domain is not authorized for authentication. Please add this domain to your Firebase project's authorized domains list.",
        )
      } else {
        setError("Failed to sign in with Google.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
        <CardDescription>Enter your credentials to access your account</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {failedAttempts >= 3 && (
          <Alert variant="warning" className="mb-4">
            <Info className="h-4 w-4" />
            <AlertDescription>
              Multiple failed login attempts detected.
              <Link href="/reset-password" className="ml-1 underline">
                Forgot your password?
              </Link>
            </AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="your@email.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Password</FormLabel>
                    <Button
                      variant="link"
                      className="p-0 h-auto text-sm"
                      onClick={() => router.push("/reset-password")}
                      type="button"
                    >
                      Forgot password?
                    </Button>
                  </div>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="rememberMe"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-2">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Remember me</FormLabel>
                  </div>
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </Form>
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
          </div>
        </div>
        <Button variant="outline" type="button" className="w-full" onClick={handleGoogleSignIn} disabled={isLoading}>
          <GoogleIcon className="mr-2 h-4 w-4" />
          Google
        </Button>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Button variant="link" className="p-0 h-auto" onClick={() => router.push("/sign-up")}>
            Sign up
          </Button>
        </p>
      </CardFooter>
    </Card>
  )
}
