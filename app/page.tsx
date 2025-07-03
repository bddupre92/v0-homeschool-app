import Link from "next/link"
import Image from "next/image"
import { ArrowRight, BookOpen, Users, Calendar, Award, PlayCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import Navigation from "@/components/navigation"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navigation />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-background">
          <div className="absolute inset-0 bg-[url('/plus-pattern.svg')] bg-repeat opacity-5"></div>
          <div className="container relative px-4 md:px-6 py-16 md:py-24">
            <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-4xl font-bold font-display tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Inspire Your <span className="text-primary">Homeschool</span> Journey
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Discover, organize, and share homeschool resources. Connect with other homeschoolers and track your
                    progress all in one place.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button size="lg" asChild>
                    <Link href="/sign-up">
                      Get Started
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link href="/about">Learn More</Link>
                  </Button>
                </div>
              </div>
              <div className="mx-auto lg:mx-0 relative aspect-video w-full max-w-[600px] overflow-hidden rounded-xl shadow-2xl">
                <Image
                  src="/images/atozfamily-hero.jpg"
                  alt="A child's desk with books, an apple, and learning blocks"
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/30 to-transparent">
                  <Button variant="secondary" size="lg" className="gap-2">
                    <PlayCircle className="h-6 w-6" />
                    Watch Video
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-12 md:py-24 bg-muted/50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm font-medium">Key Features</div>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Everything You Need</h2>
                <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed">
                  Our platform provides all the tools you need to create an engaging and effective homeschool
                  experience.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 sm:grid-cols-2 md:grid-cols-4">
              <div className="flex flex-col items-center space-y-3 text-center">
                <div className="rounded-full bg-primary/10 p-4">
                  <BookOpen className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Curated Resources</h3>
                <p className="text-muted-foreground">
                  Access thousands of educational materials tailored to your curriculum.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-3 text-center">
                <div className="rounded-full bg-primary/10 p-4">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Community</h3>
                <p className="text-muted-foreground">
                  Connect with other homeschooling families to share ideas and support.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-3 text-center">
                <div className="rounded-full bg-primary/10 p-4">
                  <Calendar className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Planner</h3>
                <p className="text-muted-foreground">
                  Organize your schedule and track progress with our intuitive planner.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-3 text-center">
                <div className="rounded-full bg-primary/10 p-4">
                  <Award className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Achievement</h3>
                <p className="text-muted-foreground">Track and celebrate your child's progress and milestones.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 md:py-24 bg-primary text-primary-foreground">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Ready to Transform Your Homeschool?</h2>
                <p className="max-w-[700px] md:text-xl/relaxed">
                  Join thousands of families who are creating engaging and effective homeschool experiences.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button size="lg" variant="secondary" asChild>
                  <Link href="/sign-up">
                    Get Started for Free
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
