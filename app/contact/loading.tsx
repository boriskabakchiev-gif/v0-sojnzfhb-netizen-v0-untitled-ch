import { Skeleton } from "@/components/ui/skeleton"

export default function ContactLoading() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-10 w-3/4 md:w-1/2 bg-gray-300 mx-auto mb-6" />
          <Skeleton className="h-6 w-full max-w-2xl bg-gray-200 mx-auto mb-10 md:mb-12" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white p-6 rounded-xl shadow-lg">
                <div className="flex items-center mb-4">
                  <Skeleton className="h-8 w-8 rounded-full bg-gray-300 mr-3" />
                  <Skeleton className="h-6 w-32 bg-gray-300" />
                </div>
                <Skeleton className="h-4 w-full bg-gray-200 mb-2" />
                <Skeleton className="h-4 w-3/4 bg-gray-200 mb-2" />
                <Skeleton className="h-4 w-1/2 bg-gray-200" />
              </div>
            ))}
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg w-full">
            <Skeleton className="h-6 w-40 bg-gray-300 mx-auto mb-6" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[1, 2].map((i) => (
                <div key={i} className="flex flex-col items-center">
                  <Skeleton className="h-12 w-12 rounded-full bg-gray-300 mb-2" />
                  <Skeleton className="h-5 w-20 bg-gray-300 mb-1" />
                  <Skeleton className="h-4 w-32 bg-gray-200" />
                </div>
              ))}
            </div>
          </div>

          {/* Skeleton for Map (if you add it) */}
          {/* <div className="mt-12 md:mt-16">
            <Skeleton className="h-8 w-1/2 bg-gray-300 mx-auto mb-6" />
            <Skeleton className="h-64 md:h-96 w-full bg-gray-200 rounded-xl" />
          </div> */}
        </div>
      </div>
    </div>
  )
}
