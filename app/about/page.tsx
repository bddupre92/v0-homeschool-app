import Link from "next/link"

import { Button } from "@/components/ui/button"
import Navigation from "@/components/navigation"
import { Footer } from "@/components/footer"

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1">
        <section className="py-12 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">About HomeScholar</h1>
                <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed">
                  Your all-in-one platform for homeschool resources, planning, and community.
                </p>
              </div>
            </div>

            <div className="mx-auto max-w-3xl mt-12 space-y-8">
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Our Mission</h2>
                <p className="text-muted-foreground">
                  HomeScholar was created to support homeschooling families by providing a comprehensive platform that
                  brings together resources, planning tools, and community connections in one place. We believe that
                  homeschooling should be accessible, engaging, and effective for every family.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Our Story</h2>
                <p className="text-muted-foreground">
                  Founded by a team of homeschooling parents and educators, HomeScholar was born out of the need for a
                  better way to organize homeschool resources and connect with other families. We understand the
                  challenges and joys of homeschooling, and we're committed to creating tools that make your homeschool
                  journey smoother and more enjoyable.
                </p>
              </div>

              <div className="space-y-4" id="video">
                <h2 className="text-2xl font-bold">See HomeScholar in Action</h2>
                <div className="aspect-video w-full overflow-hidden rounded-xl border">
                  <div className="flex items-center justify-center h-full bg-muted">
                    <p className="text-muted-foreground">Video coming soon</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-center mt-8">
                <Button asChild>
                  <Link href="/sign-up">Get Started Today</Link>
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
