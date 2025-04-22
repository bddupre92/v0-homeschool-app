import { Skeleton } from "@/components/ui/skeleton"
import Navigation from "@/components/navigation"

export default function ScrollLoading() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1 flex flex-col">
        <div className="container px-4 py-4 md:py-6">
          {/* Tabs skeleton */}
          <div className="flex justify-center mb-6">
            <Skeleton className="h-10 w-64 rounded-lg" />
          </div>

          {/* Content skeleton */}
          <div className="flex flex-col items-center gap-8 pb-8">
            <div className="w-full max-w-3xl">
              <div className="border rounded-xl overflow-hidden bg-card">
                <Skeleton className="aspect-[4/3] md:aspect-[16/9] w-full" />
                <div className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-5/6 mb-4" />
                  <div className="flex gap-2 mb-4">
                    <Skeleton className="h-5 w-16 rounded-full" />
                    <Skeleton className="h-5 w-20 rounded-full" />
                    <Skeleton className="h-5 w-14 rounded-full" />
                  </div>
                  <div className="flex justify-between">
                    <div className="flex gap-3">
                      <Skeleton className="h-4 w-12" />
                      <Skeleton className="h-4 w-12" />
                      <Skeleton className="h-4 w-12" />
                    </div>
                    <Skeleton className="h-8 w-24 rounded-md" />
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full max-w-3xl">
              <div className="border rounded-xl overflow-hidden bg-card">
                <Skeleton className="aspect-[4/3] md:aspect-[16/9] w-full" />
                <div className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-5/6 mb-4" />
                  <div className="flex gap-2 mb-4">
                    <Skeleton className="h-5 w-16 rounded-full" />
                    <Skeleton className="h-5 w-20 rounded-full" />
                    <Skeleton className="h-5 w-14 rounded-full" />
                  </div>
                  <div className="flex justify-between">
                    <div className="flex gap-3">
                      <Skeleton className="h-4 w-12" />
                      <Skeleton className="h-4 w-12" />
                      <Skeleton className="h-4 w-12" />
                    </div>
                    <Skeleton className="h-8 w-24 rounded-md" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
