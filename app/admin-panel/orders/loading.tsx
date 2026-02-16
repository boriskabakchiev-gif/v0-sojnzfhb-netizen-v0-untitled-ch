import { RefreshCw } from "lucide-react"

export default function OrdersLoading() {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="h-8 w-64 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="h-10 flex-1 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-10 w-full md:w-[200px] bg-gray-200 rounded animate-pulse"></div>
      </div>

      <div className="flex justify-center items-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-500">Зареждане на поръчки...</span>
      </div>
    </div>
  )
}
