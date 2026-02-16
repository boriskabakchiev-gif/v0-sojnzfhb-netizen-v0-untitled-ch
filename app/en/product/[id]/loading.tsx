import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function ProductLoading() {
  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 flex flex-col">
      {/* Header Skeleton */}
      <div className="bg-gray-700 h-20">
        <div className="container mx-auto px-4 h-full flex items-center justify-between">
          <Skeleton className="h-8 w-32 bg-gray-600" />
          <Skeleton className="h-8 w-64 bg-gray-600" />
          <Skeleton className="h-8 w-24 bg-gray-600" />
        </div>
      </div>

      {/* Categories Nav Skeleton */}
      <div className="bg-gray-600 h-12">
        <div className="container mx-auto px-4 h-full flex items-center space-x-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-6 w-20 bg-gray-500" />
          ))}
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1">
        <div className="container mx-auto px-4 py-6">
          {/* Breadcrumb skeleton */}
          <div className="flex items-center space-x-2 mb-6">
            <Skeleton className="h-4 w-12" />
            <span>/</span>
            <Skeleton className="h-4 w-20" />
            <span>/</span>
            <Skeleton className="h-4 w-32" />
          </div>

          {/* Product Details skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Product Image skeleton */}
            <div className="relative">
              <Skeleton className="aspect-square w-full rounded-lg" />
            </div>

            {/* Product Info skeleton */}
            <div className="space-y-6">
              <div>
                <Skeleton className="h-8 w-3/4 mb-2" />
                <div className="flex items-center space-x-2 mb-4">
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-5 w-5" />
                    ))}
                  </div>
                  <Skeleton className="h-4 w-12" />
                </div>
              </div>

              {/* Price skeleton */}
              <div className="space-y-3">
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-32" />
                </div>
                <Skeleton className="h-4 w-full" />
              </div>

              {/* Description skeleton */}
              <div>
                <Skeleton className="h-6 w-24 mb-2" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>

              {/* Add to Cart skeleton */}
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-10 w-10" />
                  <Skeleton className="h-6 w-8" />
                  <Skeleton className="h-10 w-10" />
                </div>
                <div className="flex space-x-4">
                  <Skeleton className="h-12 flex-1" />
                  <Skeleton className="h-12 w-12" />
                </div>
              </div>

              {/* Product Details skeleton */}
              <div className="space-y-3 pt-6 border-t">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                ))}
              </div>

              {/* Features skeleton */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="text-center">
                    <Skeleton className="h-8 w-8 mx-auto mb-2" />
                    <Skeleton className="h-4 w-16 mx-auto" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Related Products skeleton */}
          <section className="py-12">
            <div className="flex items-center justify-between mb-8">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-6 w-32" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="aspect-square w-full" />
                  <CardContent className="p-4">
                    <Skeleton className="h-5 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-6 w-20" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        </div>
      </main>

      {/* Footer Skeleton */}
      <div className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i}>
                <Skeleton className="h-6 w-24 mb-4 bg-gray-700" />
                <div className="space-y-2">
                  {[...Array(4)].map((_, j) => (
                    <Skeleton key={j} className="h-4 w-20 bg-gray-700" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
