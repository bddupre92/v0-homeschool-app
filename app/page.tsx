import Link from "next/link"
import Image from "next/image"
import { ArrowRight, BookOpen, Users, Calendar, Award } from "lucide-react"

import { Button } from "@/components/ui/button"
import Navigation from "@/components/navigation"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      {/* Hero Section */}
      <section className="hero-pattern py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                  Inspire Your <span className="text-primary">Homeschool</span> Journey
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  Discover, organize, and share homeschool resources. Connect with other homeschoolers and track your
                  progress all in one place.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button size="lg" className="gap-1" asChild>
                  <Link href="/sign-up">
                    Get Started
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/about">Learn More</Link>
                </Button>
              </div>
            </div>
            <div className="mx-auto lg:mx-0 relative aspect-video w-full max-w-[600px] overflow-hidden rounded-xl">
              <Image
                src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
                alt="Homeschooling setup with books and apple"
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/50 to-transparent">
                <Button variant="secondary" size="lg" className="gap-2" asChild>
                  <Link href="/about#video">
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                    Watch Video
                  </Link>
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
              <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">Key Features</div>
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Everything You Need</h2>
              <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed">
                Our platform provides all the tools you need to create an engaging and effective homeschool experience.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 mt-12">
            <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
              <div className="rounded-full bg-primary/10 p-3">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Curated Resources</h3>
              <p className="text-center text-muted-foreground">
                Access thousands of educational materials tailored to your curriculum.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
              <div className="rounded-full bg-secondary/10 p-3">
                <Users className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="text-xl font-bold">Community</h3>
              <p className="text-center text-muted-foreground">
                Connect with other homeschooling families to share ideas and support.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
              <div className="rounded-full bg-accent/10 p-3">
                <Calendar className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-xl font-bold">Planner</h3>
              <p className="text-center text-muted-foreground">
                Organize your homeschool schedule and track progress with our intuitive planner.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
              <div className="rounded-full bg-primary/10 p-3">
                <Award className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Achievement</h3>
              <p className="text-center text-muted-foreground">
                Track and celebrate your child's progress and milestones.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Content */}
      <section className="py-12 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Featured Resources</h2>
              <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed">
                Discover our most popular homeschooling resources and activities.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3 lg:gap-8 mt-8">
            {[
              {
                id: "1",
                title: "Nature Study: Exploring Your Backyard Ecosystem",
                tags: ["Elementary", "Science", "Montessori"],
                image:
                  "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
              },
              {
                id: "2",
                title: "Hands-On Fractions: Beyond the Worksheet",
                tags: ["Middle School", "Math", "Classical"],
                image:
                  "https://images.unsplash.com/photo-1588075592446-265fd1e6e76f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
              },
              {
                id: "3",
                title: "Creating a Literature-Rich Home Environment",
                tags: ["Elementary", "Language Arts", "Charlotte Mason"],
                image:
                  "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80",
              },
            ].map((resource) => (
              <div
                key={resource.id}
                className="group relative overflow-hidden rounded-lg border shadow-sm resource-card"
              >
                <div className="aspect-video w-full overflow-hidden">
                  <Image
                    src={resource.image || "/placeholder.svg"}
                    alt={resource.title}
                    width={600}
                    height={400}
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-bold line-clamp-1">{resource.title}</h3>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {resource.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <Link href={`/resources/${resource.id}`} className="absolute inset-0">
                  <span className="sr-only">View {resource.title}</span>
                </Link>
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-8">
            <Button variant="outline" className="gap-1" asChild>
              <Link href="/resources">
                View All Resources
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
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
              <Button size="lg" variant="secondary" className="gap-1" asChild>
                <Link href="/sign-up">
                  Get Started for Free
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  )
}
