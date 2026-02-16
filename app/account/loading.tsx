import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="min-h-screen bg-black text-gray-100">
      {/* Header Skeleton */}
      <div className="border-b border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Skeleton className="h-8 w-8 rounded-md bg-gray-800" />
              <Skeleton className="h-6 w-32 bg-gray-800" />
            </div>
            <div className="hidden md:flex items-center space-x-8">
              {Array(5)
                .fill(0)
                .map((_, i) => (
                  <Skeleton key={i} className="h-4 w-20 bg-gray-800" />
                ))}
            </div>
            <div className="flex items-center space-x-4">
              <Skeleton className="hidden md:block h-10 w-48 bg-gray-800" />
              <Skeleton className="h-10 w-10 rounded-md bg-gray-800" />
              <Skeleton className="hidden md:block h-10 w-20 bg-gray-800" />
            </div>
          </div>
        </div>
      </div>

      {/* Page Header Skeleton */}
      <div className="py-6 bg-gray-950">
        <div className="container mx-auto px-4">
          <div className="flex items-center space-x-2 mb-4">
            <Skeleton className="h-4 w-16 bg-gray-800" />
            <Skeleton className="h-4 w-4 rounded-full bg-gray-800" />
            <Skeleton className="h-4 w-32 bg-gray-800" />
          </div>
          <Skeleton className="h-10 w-64 mb-2 bg-gray-800" />
        </div>
      </div>

      {/* Auth Form Skeleton */}
      <div className="py-12 bg-black">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <div className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800">
              <div className="flex border-b border-gray-800">
                <Skeleton className="h-12 w-1/2 bg-gray-800" />
                <Skeleton className="h-12 w-1/2 bg-gray-800" />
              </div>
              <div className="p-6 space-y-4">
                <Skeleton className="h-10 w-full bg-gray-800" />
                <Skeleton className="h-10 w-full bg-gray-800" />
                <Skeleton className="h-10 w-full bg-gray-800" />
                <Skeleton className="h-10 w-full bg-gray-800" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Skeleton */}
      <div className="bg-black border-t border-gray-800 pt-12 pb-8 mt-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            {Array(4)
              .fill(0)
              .map((_, i) => (
                <div key={i}>
                  <Skeleton className="h-6 w-40 mb-4 bg-gray-800" />
                  <div className="space-y-2">
                    {Array(5)
                      .fill(0)
                      .map((_, j) => (
                        <Skeleton key={j} className="h-4 w-32 bg-gray-800" />
                      ))}
                  </div>
                </div>
              ))}
          </div>
          <div className="border-t border-gray-800 pt-8">
            <Skeleton className="h-4 w-64 mx-auto bg-gray-800" />
          </div>
        </div>
      </div>
    </div>
  )
}
