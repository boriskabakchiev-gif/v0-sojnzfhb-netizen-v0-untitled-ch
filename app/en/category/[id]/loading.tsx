import { Skeleton } from "@/components/ui/skeleton"

export default function EnglishCategoryLoading() {
  return (
    <div className="min-h-screen bg-gray-100 text-gray-800">
      <div className="bg-gray-700">
        <div className="container mx-auto px-4 py-4">
          <Skeleton className="h-16 w-full" />
        </div>
      </div>
      <div className="bg-gray-600">
        <div className="container mx-auto px-4 py-2">
          <Skeleton className="h-10 w-full" />
        </div>
      </div>

      <section className="relative py-6 bg-white border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="grid grid-cols-1 gap-8 items-center">
            <div>
              <Skeleton className="h-10 w-64 mb-4" />
              <Skeleton className="h-4 w-full max-w-3xl mb-2" />
              <Skeleton className="h-4 w-full max-w-3xl mb-2" />
              <Skeleton className="h-6 w-48 mt-4" />
            </div>
          </div>
        </div>
      </section>

      <section className="py-6 bg-white border-b border-gray-200">
        <div className="container mx-auto px-4">
          <Skeleton className="h-8 w-48 mb-4" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center p-3 rounded-lg border border-gray-200">
                <Skeleton className="h-16 w-16 rounded-full mb-2" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-4 bg-gray-50">
        <div className="container mx-auto px-4">
          <Skeleton className="h-16 w-full rounded-lg" />
        </div>
      </section>

      <section className="pt-8 pb-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="border border-gray-200 bg-white rounded-lg overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <div className="p-4">
                  <Skeleton className="h-6 w-full mb-2" />
                  <Skeleton className="h-4 w-full mb-4" />
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-6 w-32 mb-4" />
                  <Skeleton className="h-9 w-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
