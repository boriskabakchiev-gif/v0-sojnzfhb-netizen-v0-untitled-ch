import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function ContactLoading() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header Skeleton */}
          <div className="text-center mb-12">
            <Skeleton className="h-10 w-64 mx-auto mb-6" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form Skeleton */}
            <Card className="shadow-lg">
              <CardHeader>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-72" />
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Skeleton className="h-4 w-20 mb-2" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <div>
                    <Skeleton className="h-4 w-16 mb-2" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>
                <div>
                  <Skeleton className="h-4 w-16 mb-2" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div>
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div>
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-32 w-full" />
                </div>
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>

            {/* Contact Information Skeleton */}
            <div className="space-y-8">
              <Card className="shadow-lg">
                <CardHeader>
                  <Skeleton className="h-6 w-40" />
                </CardHeader>
                <CardContent className="space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-56" />
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader>
                  <Skeleton className="h-6 w-32 mx-auto" />
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="flex flex-col items-center">
                    <Skeleton className="h-12 w-12 rounded-full mb-2" />
                    <Skeleton className="h-4 w-16 mb-1" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <div className="flex flex-col items-center">
                    <Skeleton className="h-12 w-12 rounded-full mb-2" />
                    <Skeleton className="h-4 w-12 mb-1" />
                    <Skeleton className="h-4 w-28" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-start">
                      <Skeleton className="h-2 w-2 rounded-full mt-2 mr-3" />
                      <Skeleton className="h-4 flex-1" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Additional Information Skeleton */}
          <div className="mt-12 text-center">
            <Card>
              <CardContent className="pt-6">
                <Skeleton className="h-8 w-48 mx-auto mb-4" />
                <Skeleton className="h-4 w-96 mx-auto mb-6" />
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Skeleton className="h-10 w-24" />
                  <Skeleton className="h-10 w-28" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
