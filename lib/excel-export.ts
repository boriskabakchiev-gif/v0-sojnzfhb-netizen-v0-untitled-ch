import * as XLSX from "xlsx"

// Дефинираме типове за по-добра яснота
interface ExcelOrderItem {
  productId: string
  name: string
  quantity: number // Общо количество (включително безплатните)
  price: number
  categoryPath?: string // Пълният път на категорията (Категория > Подкатегория)
  freeCount?: number // Брой безплатни артикули
}

interface ExcelOrder {
  orderNumber: string
  customerName?: string
  customerEmail?: string
  customerPhone?: string
  orderDate: string
  totalAmount: number // Това е общата сума на поръчката, която трябва да е вече коригирана
  items: ExcelOrderItem[]
}

export function exportOrdersToExcel(ordersToExport: ExcelOrder[]) {
  const rows = []

  // Хедър ред
  rows.push([
    "Номер на поръчка",
    "Клиент",
    "Имейл на клиент",
    "Телефон на клиент",
    "Дата на поръчка",
    "Продукт",
    "Категория/Подкатегория",
    "Общо количество", // Променено за яснота
    "Ед. цена (€)",
    "Безплатни бр.",
    "Платено количество", // Нова колона за яснота
    "Сума за ред (€)", // Променено за яснота
  ])

  ordersToExport.forEach((order) => {
    order.items.forEach((item) => {
      let categoryDisplay = item.categoryPath || "Няма категория"
      if (typeof categoryDisplay === "string") {
        if (categoryDisplay.toLowerCase().includes("грешка")) {
          categoryDisplay = "Грешка в категорията"
        } else if (categoryDisplay.toLowerCase().includes("липсва")) {
          categoryDisplay = "Липсваща категория"
        }
      }

      const freeCount = item.freeCount || 0
      const paidQuantity = item.quantity - freeCount
      const lineTotal = typeof item.price === "number" ? item.price * paidQuantity : 0

      rows.push([
        order.orderNumber,
        order.customerName || "N/A",
        order.customerEmail || "N/A",
        order.customerPhone || "N/A",
        order.orderDate,
        item.name,
        categoryDisplay,
        item.quantity, // Общо количество
        typeof item.price === "number" ? item.price.toFixed(2) : "0.00", // Ед. цена
        freeCount, // Безплатни бройки
        paidQuantity, // Платено количество
        lineTotal.toFixed(2), // Сума за реда (коригирана)
      ])
    })

    // По желание: Добавяне на ред за обща сума на поръчката, ако има повече от един продукт
    // или ако искате изрично да покажете общата сума на поръчката от данните.
    // Засега това е пропуснато, тъй като всеки ред показва своята сума.
    // Ако искате да добавите обща сума на поръчката в края на нейните артикули:
    /*
    if (order.items.length > 1) { // или винаги, ако искате
      rows.push([
        "", "", "", "", "", "", "", "", "", "", 
        "Общо за поръчката:", 
        order.totalAmount.toFixed(2)
      ]);
    }
    */
  })

  const ws = XLSX.utils.aoa_to_sheet(rows)

  // Задаване на ширини на колоните (по желание)
  ws["!cols"] = [
    { wch: 18 }, // Номер на поръчка
    { wch: 25 }, // Клиент
    { wch: 25 }, // Имейл на клиент
    { wch: 15 }, // Телефон на клиент
    { wch: 15 }, // Дата на поръчка
    { wch: 40 }, // Продукт
    { wch: 30 }, // Категория/Подкатегория
    { wch: 15 }, // Общо количество
    { wch: 12 }, // Ед. цена
    { wch: 12 }, // Безплатни бр.
    { wch: 18 }, // Платено количество
    { wch: 15 }, // Сума за ред
  ]

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, "Поръчки")

  const date = new Date()
  const dateStr = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`
  const fileName = `Orders_Export_${dateStr}.xlsx`

  XLSX.writeFile(wb, fileName)
}
