import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Skeleton className="h-10 w-64 mb-8" />

      {Array(3)
        .fill(0)
        .map((_, i) => (
          <div key={i} className="mb-6 border border-gray-800 rounded-lg p-4 flex flex-col md:flex-row gap-4">
            <Skeleton className="h-24 w-24 rounded-md" />
            <div className="flex-1">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2 mb-4" />
              <div className="flex justify-between items-center">
                <Skeleton className="h-8 w-28" />
                <Skeleton className="h-10 w-32" />
              </div>
            </div>
          </div>
        ))}

      <div className="mt-8 border-t border-gray-800 pt-4">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-8 w-28" />
        </div>
        <Skeleton className="h-12 w-full md:w-1/3 md:ml-auto" />
      </div>
    </div>
  )
}
