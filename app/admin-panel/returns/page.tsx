import { neon } from "@neondatabase/serverless"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"
import { DeleteReturnButton } from "@/components/delete-return-button" // Import the new component

export const dynamic = "force-dynamic"

interface OrderReturn {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  product_name: string
  quantity: number
  return_reason: string | null
  created_at: string
}

async function getOrderReturns(): Promise<OrderReturn[]> {
  try {
    const sql = neon(process.env.DATABASE_URL!)
    const returns = await sql`SELECT * FROM order_returns ORDER BY created_at DESC`
    return returns as OrderReturn[]
  } catch (error) {
    console.error("Error fetching order returns:", error)
    return []
  }
}

export default async function ReturnsPage() {
  const orderReturns = await getOrderReturns()

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Заявки за връщане на продукти</h2>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Всички заявки за връщане</CardTitle>
        </CardHeader>
        <CardContent>
          {orderReturns.length === 0 ? (
            <div className="text-center py-8 text-gray-500">Няма намерени заявки за връщане.</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Дата</TableHead>
                    <TableHead>Име</TableHead>
                    <TableHead>Фамилия</TableHead>
                    <TableHead>Имейл</TableHead>
                    <TableHead>Телефон</TableHead>
                    <TableHead>Продукт</TableHead>
                    <TableHead>Количество</TableHead>
                    <TableHead>Причина</TableHead>
                    <TableHead className="text-right">Действия</TableHead> {/* New column for actions */}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orderReturns.map((returnItem) => (
                    <TableRow key={returnItem.id}>
                      <TableCell>{format(new Date(returnItem.created_at), "dd.MM.yyyy HH:mm")}</TableCell>
                      <TableCell>{returnItem.first_name}</TableCell>
                      <TableCell>{returnItem.last_name}</TableCell>
                      <TableCell>{returnItem.email}</TableCell>
                      <TableCell>{returnItem.phone}</TableCell>
                      <TableCell>{returnItem.product_name}</TableCell>
                      <TableCell>{returnItem.quantity}</TableCell>
                      <TableCell>{returnItem.return_reason || "N/A"}</TableCell>
                      <TableCell className="text-right">
                        <DeleteReturnButton returnId={returnItem.id} /> {/* Use the new component */}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
