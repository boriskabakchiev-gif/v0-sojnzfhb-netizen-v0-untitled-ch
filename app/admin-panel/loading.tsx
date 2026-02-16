import { RefreshCw } from "lucide-react"

export default function Loading() {
  return (
    <div className="flex justify-center items-center h-[calc(100vh-100px)]">
      <RefreshCw className="h-12 w-12 animate-spin text-red-500" />
    </div>
  )
}
