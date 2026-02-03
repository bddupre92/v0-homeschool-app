import { Skeleton } from "@/components/ui/skeleton"

export default function AboutLoading() {
  return (
    <div className="container px-4 md:px-6 py-12">
      <Skeleton className="h-12 w-[300px] mb-6" />
      <Skeleton className="h-6 w-full max-w-[600px] mb-10" />

      <div className="space-y-8">
        <div>
          <Skeleton className="h-8 w-[200px] mb-4" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4" />
        </div>

        <div>
          <Skeleton className="h-8 w-[200px] mb-4" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4" />
        </div>

        <div>
          <Skeleton className="h-8 w-[200px] mb-4" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4" />
        </div>

        <div className="aspect-video w-full overflow-hidden rounded-xl border">
          <Skeleton className="h-full w-full" />
        </div>

        <div className="flex justify-center">
          <Skeleton className="h-10 w-[150px]" />
        </div>
      </div>
    </div>
  )
}
