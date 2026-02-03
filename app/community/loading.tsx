import { Skeleton } from "@/components/ui/skeleton"

export default function CommunityLoading() {
  return (
    <div className="container px-4 md:px-6 py-8">
      <Skeleton className="h-10 w-[200px] mb-6" />

      <Skeleton className="h-12 w-full mb-8" />

      <div className="space-y-4 mb-6">
        <Skeleton className="h-16 w-full rounded-lg" />
        <Skeleton className="h-16 w-full rounded-lg" />
        <Skeleton className="h-16 w-full rounded-lg" />
        <Skeleton className="h-16 w-full rounded-lg" />
      </div>

      <Skeleton className="h-10 w-full" />
    </div>
  )
}
