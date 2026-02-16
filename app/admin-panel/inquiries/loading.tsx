// This is the content for app/admin-panel/inquiries/loading.tsx
// It's the same skeleton component defined in inquiries/page.tsx for simplicity,
// but Next.js expects it in a separate file for route-level loading UI.

import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"

const ITEMS_PER_PAGE = 10 // Should match the page

export default function InquiriesLoading() {
  return (
    <div className="container mx-auto p-4">
      <header className="mb-6">
        <div className="h-9 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
      </header>
      <div className="mb-4 flex flex-col sm:flex-row gap-4">
        <div className="h-10 w-full md:w-[400px] bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        <div className="h-10 w-full sm:w-[180px] bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        <div className="h-10 w-full sm:w-auto bg-gray-200 dark:bg-gray-700 rounded animate-pulse px-10"></div>
      </div>
      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              {[...Array(6)].map((_, i) => (
                <TableHead key={i}>
                  <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(ITEMS_PER_PAGE)].map((_, i) => (
              <TableRow key={i}>
                {[...Array(6)].map((_, j) => (
                  <TableCell key={j}>
                    <div className="h-5 bg-gray-100 dark:bg-gray-800 rounded animate-pulse"></div>
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="mt-6 flex items-center justify-end space-x-2">
        <div className="h-9 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        <div className="h-9 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
      </div>
    </div>
  )
}
