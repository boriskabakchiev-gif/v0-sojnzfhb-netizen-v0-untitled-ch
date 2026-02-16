import { Skeleton } from "@/components/ui/skeleton"
import { SiteHeader } from "@/components/site-header"

export default function CategoryLoading() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header - Keep dark */}
      <div className="bg-gray-700">
        <SiteHeader categories={[]} subcategories={[]} />
      </div>

      {/* Динамична лента с категории - Keep dark */}
      <div className="bg-gray-600">
        <div className="container mx-auto px-4 overflow-x-auto">
          <div className="flex space-x-6 py-3 whitespace-nowrap">
            {Array(6)
              .fill(0)
              .map((_, i) => (
                <Skeleton key={i} className="h-5 w-24 bg-gray-500" />
              ))}
          </div>
        </div>
      </div>

      {/* Category Header */}
      <section className="relative py-6 bg-white border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
            <Skeleton className="h-4 w-16 bg-gray-300" />
            <Skeleton className="h-4 w-4 rounded-full bg-gray-300" />
            <Skeleton className="h-4 w-24 bg-gray-300" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            <div className="md:col-span-2">
              <Skeleton className="h-10 w-64 mb-4 bg-gray-300" />
              <Skeleton className="h-4 w-full max-w-3xl mb-2 bg-gray-300" />
              <Skeleton className="h-4 w-full max-w-3xl mb-2 bg-gray-300" />
              <Skeleton className="h-4 w-1/2 max-w-3xl bg-gray-300" />
            </div>
            <div className="hidden md:block">
              <Skeleton className="h-48 w-full rounded-lg bg-gray-300" />
            </div>
          </div>
        </div>
      </section>

      {/* Subcategories Grid */}
      <section className="py-6 bg-white border-b border-gray-200">
        <div className="container mx-auto px-4">
          <Skeleton className="h-8 w-40 mb-4 bg-gray-300" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array(6)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="flex flex-col items-center p-3 rounded-lg border border-gray-200">
                  <Skeleton className="w-16 h-16 rounded-full mb-2 bg-gray-300" />
                  <Skeleton className="h-4 w-16 bg-gray-300" />
                </div>
              ))}
          </div>
        </div>
      </section>

      {/* Filter Panel */}
      <section className="py-4 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex flex-wrap gap-4">
              <Skeleton className="h-10 w-40 bg-gray-300" />
              <Skeleton className="h-10 w-40 bg-gray-300" />
              <Skeleton className="h-10 w-40 bg-gray-300" />
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="pt-8 pb-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
            {Array(10)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <Skeleton className="h-40 w-full bg-gray-300" />
                  <div className="p-4">
                    <Skeleton className="h-5 w-full mb-2 bg-gray-300" />
                    <Skeleton className="h-4 w-3/4 mb-4 bg-gray-300" />
                    <Skeleton className="h-6 w-1/2 mb-2 bg-gray-300" />
                    <Skeleton className="h-8 w-full bg-gray-300" />
                  </div>
                </div>
              ))}
          </div>
        </div>
      </section>
    </div>
  )
}
