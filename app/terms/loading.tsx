export default function Loading() {
  return (
    <div className="min-h-screen bg-white">
      <div className="animate-pulse">
        <div className="h-16 bg-gray-200"></div>
        <div className="h-12 bg-gray-100"></div>
        <div className="container mx-auto px-4 py-8">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
