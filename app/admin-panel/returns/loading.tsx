import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export default function ReturnsLoading() {
  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">
          <Skeleton className="h-9 w-[300px]" />
        </h2>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-6 w-[200px]" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="w-full">
              <div className="grid grid-cols-8 gap-4 px-4 py-2 border-b">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="h-6 w-20" />
                ))}
              </div>
              {Array.from({ length: 10 }).map((_, rowIndex) => (
                <div key={rowIndex} className="grid grid-cols-8 gap-4 px-4 py-3 border-b last:border-b-0">
                  {Array.from({ length: 8 }).map((_, colIndex) => (
                    <Skeleton key={`${rowIndex}-${colIndex}`} className="h-5 w-full" />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
