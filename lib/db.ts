import { neon, neonConfig, type NeonQueryFunction } from "@neondatabase/serverless"
import { unstable_cache as cache } from "next/cache"
import ws from "ws"

console.log("LIB/DB.TS: Module loading...")

// Конфигуриране на WebSocket
if (typeof process !== "undefined" && process.env && !process.env.NEXT_PUBLIC_VERCEL_URL) {
  neonConfig.webSocketConstructor = ws
  console.log("LIB/DB.TS: WebSocket configured with 'ws' for Node.js environment.")
} else if (typeof globalThis !== "undefined" && typeof globalThis.WebSocket !== "undefined") {
  neonConfig.webSocketConstructor = globalThis.WebSocket
  console.log("LIB/DB.TS: WebSocket configured with globalThis.WebSocket.")
} else {
  console.warn("LIB/DB.TS: WebSocket constructor could not be determined for Neon.")
}

// Конфигуриране на fetch
if (typeof fetch !== "undefined") {
  neonConfig.fetchFunction = fetch
  console.log("LIB/DB.TS: fetchFunction configured with global fetch.")
} else {
  console.warn("LIB/DB.TS: Global fetch function not available for Neon.")
}

let sql: NeonQueryFunction<false, false>
let dbInitialized = false
const DATABASE_URL = process.env.DATABASE_URL

if (!DATABASE_URL) {
  console.error(
    "LIB/DB.TS: FATAL - DATABASE_URL is not defined in environment variables. Database operations will fail.",
  )
  sql = (async (queryText: string, params?: any[]) => {
    console.error(
      "LIB/DB.TS: Mock SQL Query - Database not initialized (DATABASE_URL missing). Query:",
      queryText,
      "Params:",
      params,
    )
    return []
  }) as any
  dbInitialized = false
} else {
  try {
    console.log("LIB/DB.TS: Attempting to initialize Neon SQL with DATABASE_URL...")
    sql = neon(DATABASE_URL)
    dbInitialized = true
    console.log("LIB/DB.TS: Database connection configured successfully with Neon.")
  } catch (error) {
    console.error("LIB/DB.TS: FATAL - Error during Neon SQL initialization:", error)
    sql = (async (queryText: string, params?: any[]) => {
      console.error(
        "LIB/DB.TS: Mock SQL Query - Database initialization failed. Query:",
        queryText,
        "Params:",
        params,
        "Error:",
        error,
      )
      return []
    }) as any
    dbInitialized = false
  }
}

console.log(`LIB/DB.TS: dbInitialized status after setup: ${dbInitialized}`)

export { dbInitialized }

export function getPool() {
  if (!dbInitialized) {
    console.warn("LIB/DB.TS: getPool - Attempted to get pool, but database is not initialized.")
    return {
      query: async (text: string, params?: any[]) => {
        console.error("LIB/DB.TS: Mock Pool Query - Database not initialized. Query:", text, "Params:", params)
        return []
      },
    }
  }
  return {
    query: async (text: string, params?: any[]) => {
      try {
        const result = await sql.query(text, params)
        return result
      } catch (error) {
        console.error("LIB/DB.TS: Pool Query Error:", error)
        throw error
      }
    },
  }
}

export async function executeQueryWithRetry(query: string, params?: any[], maxRetries = 3) {
  if (!dbInitialized) {
    console.error("LIB/DB.TS: executeQueryWithRetry - Database not initialized. Cannot execute query:", query)
    return []
  }
  let retries = 0
  const correctedQuery = query.replace(/\bproducts\b/g, "new_products")

  while (retries < maxRetries) {
    try {
      return await sql.query(correctedQuery, params)
    } catch (error) {
      retries++
      console.error(`LIB/DB.TS: Query failed (attempt ${retries}/${maxRetries}):`, correctedQuery, params, error)
      if (retries >= maxRetries) {
        console.error(`LIB/DB.TS: All ${maxRetries} attempts failed for query. Giving up.`)
        throw error
      }
      await new Promise((resolve) => setTimeout(resolve, 500 * Math.pow(2, retries)))
    }
  }
  throw new Error("LIB/DB.TS: Failed to execute query after retries (unexpected state)")
}

// Categories
export async function getCategories(skipCache = false) {
  console.log(`LIB/DB.TS: getCategories called. skipCache: ${skipCache}, dbInitialized: ${dbInitialized}`)
  async function fetchCategories() {
    if (!dbInitialized) {
      console.error("LIB/DB.TS: fetchCategories - Database not initialized. Cannot fetch categories.")
      return []
    }
    try {
      console.log("LIB/DB.TS: fetchCategories - Извличане на категории от базата данни...")
      const result = await executeQueryWithRetry(`
    SELECT "Document ID" as id, title, title_en, description, photourl, pricefrom, wholesalerpricefrom, retailerpricefrom
    FROM categories
    WHERE (deleted = false OR deleted IS NULL)
    ORDER BY title ASC
  `)
      console.log("LIB/DB.TS: fetchCategories - Намерени категории:", result.length)
      return result || []
    } catch (error) {
      console.error("LIB/DB.TS: fetchCategories - Грешка при извличане на категории:", error)
      return []
    }
  }

  if (skipCache) {
    console.log("LIB/DB.TS: getCategories - Skipping cache for categories...")
    return fetchCategories()
  }

  try {
    return await cache(fetchCategories, ["categories-list-v4"], {
      revalidate: 60, // Намалих от 300 на 60 секунди
      tags: ["categories"],
    })()
  } catch (error) {
    console.error("LIB/DB.TS: getCategories - Cache error, fetching directly:", error)
    return fetchCategories()
  }
}

export async function getCategoryById(id: string) {
  console.log(`LIB/DB.TS: getCategoryById called. ID: ${id}, dbInitialized: ${dbInitialized}`)
  if (!dbInitialized) {
    console.error("LIB/DB.TS: getCategoryById - Database not initialized.")
    return null
  }
  if (!id) {
    console.error("LIB/DB.TS: getCategoryById - Category ID is undefined or null.")
    return null
  }
  try {
    const result = await executeQueryWithRetry(
      `
SELECT "Document ID" as id, title, title_en, description, photourl, pricefrom, wholesalerpricefrom, retailerpricefrom
FROM categories
WHERE "Document ID" = $1 AND (deleted = false OR deleted IS NULL)
`,
      [id],
    )
    return result[0] || null
  } catch (error) {
    console.error(`LIB/DB.TS: getCategoryById - Error fetching category ${id}:`, error)
    return null
  }
}

// Subcategories
export async function getSubcategories(categoryId?: string) {
  console.log(`LIB/DB.TS: getSubcategories called. categoryId: ${categoryId}, dbInitialized: ${dbInitialized}`)
  if (!dbInitialized) {
    console.error("LIB/DB.TS: getSubcategories - Database not initialized.")
    return []
  }
  try {
    let query
    const params: any[] = []
    if (categoryId) {
      query = `
  SELECT "Document ID" as id, cateid, title, title_en, description, photourl, pricefrom
  FROM subcategories
  WHERE cateid = $1 AND (deleted = false OR deleted IS NULL)
  ORDER BY title ASC
`
      params.push(categoryId)
    } else {
      query = `
  SELECT "Document ID" as id, cateid, title, title_en, description, photourl, pricefrom
  FROM subcategories
  WHERE (deleted = false OR deleted IS NULL)
  ORDER BY title ASC
`
    }
    const result = await executeQueryWithRetry(query, params)
    return result
  } catch (error) {
    console.error("LIB/DB.TS: Error fetching subcategories:", error)
    return []
  }
}

export async function getSubcategoryById(id: string) {
  console.log(`LIB/DB.TS: getSubcategoryById called. ID: ${id}, dbInitialized: ${dbInitialized}`)
  if (!dbInitialized) {
    console.error("LIB/DB.TS: getSubcategoryById - Database not initialized.")
    return null
  }
  if (!id) {
    console.warn("LIB/DB.TS: getSubcategoryById called with undefined or null id")
    return null
  }
  try {
    const result = await executeQueryWithRetry(
      `
SELECT "Document ID" as id, title, title_en, cateid 
FROM subcategories 
WHERE "Document ID" = $1 AND (deleted = false OR deleted IS NULL)
`,
      [id],
    )
    return result[0] || null
  } catch (error) {
    console.error(`LIB/DB.TS: Error fetching subcategory ${id}:`, error)
    return null
  }
}

// Products
export async function getProductById(id: string) {
  console.log(`LIB/DB.TS: getProductById called. ID: ${id}, dbInitialized: ${dbInitialized}`)
  if (!dbInitialized) {
    console.error("LIB/DB.TS: getProductById - Database not initialized.")
    return null
  }
  if (!id) {
    console.error("LIB/DB.TS: getProductById - Product ID is undefined or null.")
    return null
  }
  try {
    let result = await executeQueryWithRetry(`SELECT * FROM new_products WHERE "Document ID" = $1`, [id])
    if (result.length === 0) {
      result = await executeQueryWithRetry(`SELECT * FROM new_products WHERE objectid = $1`, [id])
    }
    if (result.length === 0 && id) {
      result = await executeQueryWithRetry(
        `SELECT * FROM new_products WHERE LOWER(title) = LOWER($1) ORDER BY createdat DESC LIMIT 1`,
        [id.toLowerCase()],
      )
    }
    return result[0] || null
  } catch (error) {
    console.error(`LIB/DB.TS: Error fetching product ${id}:`, error)
    return null
  }
}

// Users
export async function getUserByEmail(email: string) {
  console.log(`LIB/DB.TS: getUserByEmail called. Email: ${email}, dbInitialized: ${dbInitialized}`)
  if (!dbInitialized) {
    console.error("LIB/DB.TS: getUserByEmail - Database not initialized.")
    return null
  }
  if (!email) {
    console.error("LIB/DB.TS: getUserByEmail - Email is undefined or null.")
    return null
  }
  try {
    const result = await executeQueryWithRetry(
      `
SELECT id, name, email, password, role, approval_status
FROM users
WHERE email = $1
`,
      [email],
    )
    if (result[0]) {
      const customerResult = await executeQueryWithRetry(
        `
  SELECT type, discountpercent, storename, companyname
  FROM customers
  WHERE objectid = $1 AND (deleted = false OR deleted IS NULL)
`,
        [email],
      )
      const customer = customerResult[0]
      return {
        ...result[0],
        customerType: customer?.type || null,
        discountPercent: customer?.discountpercent || 0,
        storeName: customer?.storename || null,
        companyName: customer?.companyname || null,
      }
    }
    return null
  } catch (error) {
    console.error(`LIB/DB.TS: Error fetching user with email ${email}:`, error)
    return null
  }
}

// Customers
export async function getCustomerByEmail(email: string) {
  console.log(`LIB/DB.TS: getCustomerByEmail called. Email: ${email}, dbInitialized: ${dbInitialized}`)
  if (!dbInitialized) {
    console.error("LIB/DB.TS: getCustomerByEmail - Database not initialized.")
    return null
  }
  if (!email) {
    console.error("LIB/DB.TS: getCustomerByEmail - Email is undefined or null.")
    return null
  }
  try {
    const result = await executeQueryWithRetry(
      `
SELECT objectid, storename, companyname, phone, discountpercent, type
FROM customers
WHERE objectid = $1 AND (deleted = false OR deleted IS NULL)
`,
      [email],
    )
    return result[0] || null
  } catch (error) {
    console.error(`LIB/DB.TS: Error fetching customer with email ${email}:`, error)
    return null
  }
}

export async function getCustomerByPhone(phone: string) {
  console.log(`LIB/DB.TS: getCustomerByPhone called. Phone: ${phone}, dbInitialized: ${dbInitialized}`)
  if (!dbInitialized) {
    console.error("LIB/DB.TS: getCustomerByPhone - Database not initialized.")
    return null
  }
  if (!phone) {
    console.error("LIB/DB.TS: getCustomerByPhone - Phone is undefined or null.")
    return null
  }
  try {
    const result = await executeQueryWithRetry(
      `
SELECT objectid, storename, companyname, phone, discountpercent, type
FROM customers
WHERE phone = $1 AND (deleted = false OR deleted IS NULL)
LIMIT 1 
`,
      [phone],
    )
    return result[0] || null
  } catch (error) {
    console.error(`LIB/DB.TS: Error fetching customer with phone ${phone}:`, error)
    return null
  }
}

// Orders
// Тази функция вече е актуализирана да приема `identifier` (имейл или телефон)
// и да търси по `customer_email` ИЛИ `customer_phone` в `simple_orders`
export async function getOrdersByCustomer(identifier: string): Promise<any[]> {
  console.log(`LIB/DB.TS: getOrdersByCustomer called. Identifier: ${identifier}, dbInitialized: ${dbInitialized}`)
  if (!dbInitialized) {
    console.error("LIB/DB.TS: getOrdersByCustomer - Database not initialized.")
    return []
  }
  if (!identifier) {
    console.error("LIB/DB.TS: getOrdersByCustomer - Identifier is undefined or null.")
    return []
  }

  // Предполагаме, че `simple_orders` има колони `customer_email` и `customer_phone`
  // или една обща колона `customer_identifier`, която може да съдържа едно от двете.
  // За този пример, ще търсим и в двата потенциални колони, ако съществуват.
  // Адаптирайте заявката според вашата актуална схема на `simple_orders`.

  let queryText = `
    SELECT id as objectid, order_id as orderid, status, created_at as createdat, total_amount as bill, items
    FROM simple_orders
    WHERE `
  const queryParams: string[] = []

  if (identifier.includes("@")) {
    // Ако идентификаторът е имейл
    queryText += `customer_email = $1`
    queryParams.push(identifier)
    console.log(`LIB/DB.TS: getOrdersByCustomer - Searching orders by email: ${identifier}`)
  } else {
    // Ако идентификаторът е телефон
    queryText += `customer_phone = $1`
    queryParams.push(identifier)
    console.log(`LIB/DB.TS: getOrdersByCustomer - Searching orders by phone: ${identifier}`)

    // Допълнително: ако телефонът е намерен, може да искаме да намерим и свързания имейл
    // и да търсим поръчки и по него, ако `customer_email` е основният идентификатор в `simple_orders`
    // за някои поръчки. Това зависи от това как се записват поръчките.
    // Засега ще търсим само по телефон, ако идентификаторът не е имейл.
  }

  queryText += ` ORDER BY created_at DESC`

  try {
    const result = await executeQueryWithRetry(queryText, queryParams)
    console.log(`LIB/DB.TS: getOrdersByCustomer - Found ${result.length} orders for identifier ${identifier}.`)
    return result
  } catch (error) {
    console.error(`LIB/DB.TS: Error fetching orders for identifier ${identifier}:`, error)
    // Проверка за специфична грешка, ако колоните не съществуват
    if (error instanceof Error) {
      if (
        error.message.includes('column "customer_email" does not exist') ||
        error.message.includes('column "customer_phone" does not exist')
      ) {
        console.warn(
          `LIB/DB.TS: One or both columns 'customer_email' or 'customer_phone' might not exist in 'simple_orders' table. Please check schema.`,
        )
      }
    }
    return []
  }
}

export async function getOrderById(orderId: string) {
  console.log(`LIB/DB.TS: getOrderById called. Order ID: ${orderId}, dbInitialized: ${dbInitialized}`)
  if (!dbInitialized) {
    console.error("LIB/DB.TS: getOrderById - Database not initialized.")
    return null
  }
  if (!orderId) {
    console.error("LIB/DB.TS: getOrderById - Order ID is undefined or null.")
    return null
  }
  try {
    // Адаптирайте имената на колоните според вашата `simple_orders` таблица
    const result = await executeQueryWithRetry(
      `
SELECT 
  id as objectid, 
  order_id as orderid, 
  customer_email, -- или orderby
  customer_phone,
  status, 
  -- atdiscountrate, -- Ако имате такава колона
  delivery_address as deliveryto, 
  items as carts, -- Ако items е JSON с продуктите
  total_amount as bill, 
  created_at as createdat
FROM simple_orders 
WHERE order_id = $1 OR id::text = $1 -- Търсене по order_id или по primary key id
LIMIT 1
`,
      [orderId],
    )
    return result[0] || null
  } catch (error) {
    console.error(`LIB/DB.TS: Error fetching order ${orderId}:`, error)
    return null
  }
}

// Admin Dashboard related functions
export async function getAdminDashboardStats() {
  console.log(`LIB/DB.TS: getAdminDashboardStats called. dbInitialized: ${dbInitialized}`)
  if (!dbInitialized) {
    console.error("LIB/DB.TS: getAdminDashboardStats - Database not initialized.")
    return { productCount: 0, categoryCount: 0, subcategoryCount: 0, avgPrice: "0.00", monthlyData: [] }
  }
  try {
    const productsResult = await executeQueryWithRetry(`
SELECT COUNT(*) as total_products
FROM new_products
WHERE deleted = false OR deleted IS NULL
`)
    const productCount = productsResult[0]?.total_products || 0

    const categoriesResult = await executeQueryWithRetry(`
SELECT COUNT(*) as total_categories
FROM categories
WHERE deleted = false OR deleted IS NULL
`)
    const categoryCount = categoriesResult[0]?.total_categories || 0

    const subcategoriesResult = await executeQueryWithRetry(`
SELECT COUNT(*) as total_subcategories
FROM subcategories
WHERE deleted = false OR deleted IS NULL
`)
    const subcategoryCount = subcategoriesResult[0]?.total_subcategories || 0

    const avgPriceResult = await executeQueryWithRetry(`
SELECT AVG(CAST(price AS float)) as avg_price
FROM new_products
WHERE price IS NOT NULL AND (deleted = false OR deleted IS NULL)
`)
    const avgPrice = avgPriceResult[0]?.avg_price || 0

    const monthlyDataResult = await executeQueryWithRetry(`
SELECT 
  EXTRACT(MONTH FROM createdat) as month,
  COUNT(*) as count
FROM new_products
WHERE 
  createdat IS NOT NULL AND 
  EXTRACT(YEAR FROM createdat) = EXTRACT(YEAR FROM CURRENT_DATE) AND
  (deleted = false OR deleted IS NULL)
GROUP BY month
ORDER BY month ASC
`)

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const monthlyData = monthNames.map((name, i) => {
      const month = i + 1
      const resultItem = monthlyDataResult.find((item: any) => Number.parseInt(item.month) === month)
      return {
        name,
        count: resultItem ? Number.parseInt(resultItem.count) : 0,
      }
    })

    return {
      productCount,
      categoryCount,
      subcategoryCount,
      avgPrice: Number.parseFloat(avgPrice).toFixed(2),
      monthlyData,
    }
  } catch (error) {
    console.error("LIB/DB.TS: Error fetching admin dashboard stats:", error)
    return { productCount: 0, categoryCount: 0, subcategoryCount: 0, avgPrice: "0.00", monthlyData: [] }
  }
}

export async function getAdminProducts(page = 1, limit = 10, search = "", categoryId: string | null = null) {
  console.log(
    `LIB/DB.TS: getAdminProducts called. Page: ${page}, Limit: ${limit}, Search: ${search}, Category ID: ${categoryId}, dbInitialized: ${dbInitialized}`,
  )
  if (!dbInitialized) {
    console.error("LIB/DB.TS: getAdminProducts - Database not initialized.")
    return { products: [], pagination: { total: 0, pages: 0, page: 1, limit } }
  }
  try {
    const offset = (page - 1) * limit
    let countQuery = `SELECT COUNT(*) as count FROM new_products WHERE (deleted = false OR deleted IS NULL)`
    const queryParams: any[] = []
    let dataQuery = `SELECT * FROM new_products WHERE (deleted = false OR deleted IS NULL)`

    if (search) {
      const searchTerm = `%${search}%`
      countQuery += ` AND title ILIKE $${queryParams.length + 1}`
      dataQuery += ` AND title ILIKE $${queryParams.length + 1}`
      queryParams.push(searchTerm)
    }
    if (categoryId) {
      countQuery += ` AND cateid = $${queryParams.length + 1}`
      dataQuery += ` AND cateid = $${queryParams.length + 1}`
      queryParams.push(categoryId)
    }

    const countResult = await executeQueryWithRetry(countQuery, queryParams)
    const total = Number.parseInt(countResult[0]?.count || "0")

    dataQuery += ` ORDER BY createdat DESC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`
    queryParams.push(limit, offset)

    const result = await executeQueryWithRetry(dataQuery, queryParams)

    const products = await Promise.all(
      result.map(async (product: any) => {
        let category_title = "Без категория"
        if (product.cateid) {
          const cat = await getCategoryById(product.cateid)
          if (cat) category_title = cat.title
        }
        let subcategory_title = "Без подкатегория"
        if (product.subcateid) {
          const subcat = await getSubcategoryById(product.subcateid)
          if (subcat) subcategory_title = subcat.title
        }
        return {
          ...product,
          status: "Активен", // Assuming status logic needs to be defined
          category_title,
          subcategory_title,
        }
      }),
    )

    return {
      products,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    }
  } catch (error) {
    console.error("LIB/DB.TS: Error fetching admin products:", error)
    return { products: [], pagination: { total: 0, pages: 0, page: 1, limit } }
  }
}

export async function deleteProduct(id: string) {
  console.log(`LIB/DB.TS: deleteProduct called. ID: ${id}, dbInitialized: ${dbInitialized}`)
  if (!dbInitialized) {
    console.error("LIB/DB.TS: deleteProduct - Database not initialized.")
    return { success: false, error: "Database not initialized" }
  }
  if (!id) {
    console.error("LIB/DB.TS: deleteProduct - Product ID is undefined or null.")
    return { success: false, error: "Product ID is undefined or null" }
  }
  try {
    await executeQueryWithRetry(`UPDATE new_products SET deleted = true WHERE objectid = $1`, [id])
    return { success: true }
  } catch (error) {
    console.error(`LIB/DB.TS: Error deleting product ${id}:`, error)
    return { success: false, error: "Failed to delete product" }
  }
}

export async function getAdminCategories(page = 1, limit = 10, search = "", status: string | null = null) {
  console.log(
    `LIB/DB.TS: getAdminCategories called. Page: ${page}, Limit: ${limit}, Search: ${search}, Status: ${status}, dbInitialized: ${dbInitialized}`,
  )
  if (!dbInitialized) {
    console.error("LIB/DB.TS: getAdminCategories - Database not initialized.")
    return { categories: [], pagination: { total: 0, pages: 0, page: 1, limit } }
  }
  try {
    const offset = (page - 1) * limit
    let countQuery = `SELECT COUNT(*) as count FROM categories WHERE 1=1`
    const queryParams: any[] = []
    let dataQuery = `
SELECT "Document ID" as id, title, title_en, description, photourl, pricefrom, 
       wholesalerpricefrom, retailerpricefrom, createdat, deleted, slug 
FROM categories WHERE 1=1`

    if (search) {
      const searchTerm = `%${search}%`
      countQuery += ` AND title ILIKE $${queryParams.length + 1}`
      dataQuery += ` AND title ILIKE $${queryParams.length + 1}`
      queryParams.push(searchTerm)
    }
    if (status === "active") {
      countQuery += ` AND (deleted = false OR deleted IS NULL)`
      dataQuery += ` AND (deleted = false OR deleted IS NULL)`
    } else if (status === "inactive") {
      countQuery += ` AND deleted = true`
      dataQuery += ` AND deleted = true`
    }

    const countResult = await executeQueryWithRetry(countQuery, queryParams)
    const total = Number.parseInt(countResult[0]?.count || "0")

    dataQuery += ` ORDER BY title ASC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`
    queryParams.push(limit, offset)

    const categoriesResult = await executeQueryWithRetry(dataQuery, queryParams)

    const enrichedCategories = await Promise.all(
      categoriesResult.map(async (category: any) => {
        const productsCountResult = await executeQueryWithRetry(
          `SELECT COUNT(*) as count FROM new_products WHERE cateid = $1 AND (deleted = false OR deleted IS NULL)`,
          [category.id],
        )
        const subcategoriesCountResult = await executeQueryWithRetry(
          `SELECT COUNT(*) as count FROM subcategories WHERE cateid = $1 AND (deleted = false OR deleted IS NULL)`,
          [category.id],
        )
        return {
          ...category,
          productCount: Number.parseInt(productsCountResult[0]?.count || "0"),
          subcategoryCount: Number.parseInt(subcategoriesCountResult[0]?.count || "0"),
          status: category.deleted ? "Деактивирана" : "Активна",
        }
      }),
    )
    return {
      categories: enrichedCategories,
      pagination: { total, pages: Math.ceil(total / limit), page, limit },
    }
  } catch (error) {
    console.error("LIB/DB.TS: Error fetching admin categories:", error)
    return { categories: [], pagination: { total: 0, pages: 0, page: 1, limit } }
  }
}

export async function toggleCategoryStatus(id: string, currentStatus: boolean) {
  console.log(
    `LIB/DB.TS: toggleCategoryStatus called. ID: ${id}, Current Status: ${currentStatus}, dbInitialized: ${dbInitialized}`,
  )
  if (!dbInitialized) {
    console.error("LIB/DB.TS: toggleCategoryStatus - Database not initialized.")
    return { success: false, error: "Database not initialized" }
  }
  if (!id) {
    console.error("LIB/DB.TS: toggleCategoryStatus - Category ID is undefined or null.")
    return { success: false, error: "Category ID is undefined or null" }
  }
  try {
    await executeQueryWithRetry(`UPDATE categories SET deleted = $1 WHERE "Document ID" = $2`, [!currentStatus, id])
    return { success: true }
  } catch (error) {
    console.error(`LIB/DB.TS: Error updating category status ${id}:`, error)
    return { success: false, error: "Failed to update category status" }
  }
}

export async function deleteCategory(id: string) {
  console.log(`LIB/DB.TS: deleteCategory called. ID: ${id}, dbInitialized: ${dbInitialized}`)
  if (!dbInitialized) {
    console.error("LIB/DB.TS: deleteCategory - Database not initialized.")
    return { success: false, error: "Database not initialized" }
  }
  if (!id) {
    console.error("LIB/DB.TS: deleteCategory - Category ID is undefined or null.")
    return { success: false, error: "Category ID is undefined or null" }
  }
  try {
    await executeQueryWithRetry(`UPDATE categories SET deleted = true WHERE "Document ID" = $1`, [id])
    return { success: true }
  } catch (error) {
    console.error(`LIB/DB.TS: Error deleting category ${id}:`, error)
    return { success: false, error: "Failed to delete category" }
  }
}

export async function getRecentOrders(limit = 5) {
  console.log(`LIB/DB.TS: getRecentOrders called. Limit: ${limit}, dbInitialized: ${dbInitialized}`)
  if (!dbInitialized) {
    console.error("LIB/DB.TS: getRecentOrders - Database not initialized.")
    return []
  }
  try {
    // Адаптирайте имената на колоните според вашата `simple_orders` таблица
    const orders = await executeQueryWithRetry(
      `
SELECT 
  id as objectid, 
  order_id as orderid, 
  customer_email, -- или orderby
  customer_phone,
  status, 
  total_amount as bill, 
  created_at as createdat
FROM simple_orders
ORDER BY created_at DESC
LIMIT $1
`,
      [limit],
    )
    return Promise.all(
      orders.map(async (order: any) => {
        // Опит да се намери клиент по имейл или телефон
        let customerName = order.customer_email || order.customer_phone || "Unknown"
        if (order.customer_email) {
          const customerByEmail = await getCustomerByEmail(order.customer_email)
          if (customerByEmail) {
            customerName = customerByEmail.storename || customerByEmail.companyname || order.customer_email
          }
        } else if (order.customer_phone) {
          const customerByPhone = await getCustomerByPhone(order.customer_phone)
          if (customerByPhone) {
            customerName = customerByPhone.storename || customerByPhone.companyname || order.customer_phone
          }
        }

        return {
          id: order.orderid || order.objectid,
          customer: customerName,
          date: order.createdat ? new Date(order.createdat).toISOString().split("T")[0] : "Unknown",
          status: order.status || "Обработва се",
          amount: Number.parseFloat(order.bill || 0).toFixed(2),
        }
      }),
    )
  } catch (error) {
    console.error("LIB/DB.TS: Error fetching recent orders:", error)
    return []
  }
}

export async function getTopProducts(limit = 5) {
  console.log(`LIB/DB.TS: getTopProducts called. Limit: ${limit}, dbInitialized: ${dbInitialized}`)
  if (!dbInitialized) {
    console.error("LIB/DB.TS: getTopProducts - Database not initialized.")
    return []
  }
  try {
    const products = await executeQueryWithRetry(
      `
SELECT objectid as id, title, price
FROM new_products
WHERE (deleted = false OR deleted IS NULL)
ORDER BY price DESC -- This might need adjustment based on actual sales data
LIMIT $1
`,
      [limit],
    )
    return products.map((product: any) => ({
      id: product.id,
      name: product.title,
      sales: Math.floor(Math.random() * 30) + 1, // Placeholder sales data
      price: Number.parseFloat(product.price || 0).toFixed(2),
    }))
  } catch (error) {
    console.error("LIB/DB.TS: Error fetching top products:", error)
    return []
  }
}

export async function getHomePageImage(): Promise<string | null> {
  console.log(`LIB/DB.TS: getHomePageImage called. dbInitialized: ${dbInitialized}`)
  if (!dbInitialized) {
    console.error("LIB/DB.TS: getHomePageImage - Database not initialized.")
    return null
  }
  try {
    const result = await executeQueryWithRetry(`
      SELECT image_url
      FROM home_page_image
      WHERE is_active = true
      ORDER BY created_at DESC
      LIMIT 1
    `)
    return result[0]?.image_url || null
  } catch (error) {
    console.error("LIB/DB.TS: Error fetching home page image:", error)
    if (error instanceof Error && error.message.includes('relation "home_page_image" does not exist')) {
      console.warn("LIB/DB.TS: Table 'home_page_image' might not exist. Please run the setup script.")
    }
    return null
  }
}

export async function getHomePageImages() {
  console.log(`LIB/DB.TS: getHomePageImages called. dbInitialized: ${dbInitialized}`)
  if (!dbInitialized) {
    console.error("LIB/DB.TS: getHomePageImages - Database not initialized.")
    return []
  }
  try {
    const result = await executeQueryWithRetry(`
      SELECT id, image_url, is_active, created_at
      FROM home_page_image
      ORDER BY created_at DESC
    `)
    return result || []
  } catch (error) {
    console.error("LIB/DB.TS: Error fetching home page images:", error)
    return []
  }
}

export async function addHomePageImage(imageUrl: string) {
  console.log(`LIB/DB.TS: addHomePageImage called. imageUrl: ${imageUrl}, dbInitialized: ${dbInitialized}`)
  if (!dbInitialized) {
    console.error("LIB/DB.TS: addHomePageImage - Database not initialized.")
    return { success: false, error: "Database not initialized" }
  }
  try {
    const result = await executeQueryWithRetry(
      `INSERT INTO home_page_image (image_url, is_active) VALUES ($1, false) RETURNING *`,
      [imageUrl],
    )
    return { success: true, data: result[0] }
  } catch (error) {
    console.error("LIB/DB.TS: Error adding home page image:", error)
    return { success: false, error: "Failed to add image" }
  }
}

export async function setActiveHomePageImage(id: number) {
  console.log(`LIB/DB.TS: setActiveHomePageImage called. id: ${id}, dbInitialized: ${dbInitialized}`)
  if (!dbInitialized) {
    console.error("LIB/DB.TS: setActiveHomePageImage - Database not initialized.")
    return { success: false, error: "Database not initialized" }
  }
  try {
    // Transaction
    await executeQueryWithRetry("BEGIN", [])
    await executeQueryWithRetry(`UPDATE home_page_image SET is_active = false`, [])
    await executeQueryWithRetry(`UPDATE home_page_image SET is_active = true WHERE id = $1`, [id])
    await executeQueryWithRetry("COMMIT", [])
    return { success: true }
  } catch (error) {
    await executeQueryWithRetry("ROLLBACK", [])
    console.error(`LIB/DB.TS: Error setting active home page image ${id}:`, error)
    return { success: false, error: "Failed to set active image" }
  }
}

export async function deleteHomePageImage(id: number, url: string) {
  console.log(`LIB/DB.TS: deleteHomePageImage called. id: ${id}, url: ${url}, dbInitialized: ${dbInitialized}`)
  if (!dbInitialized) {
    console.error("LIB/DB.TS: deleteHomePageImage - Database not initialized.")
    return { success: false, error: "Database not initialized" }
  }
  try {
    await executeQueryWithRetry(`DELETE FROM home_page_image WHERE id = $1`, [id])
    return { success: true }
  } catch (error) {
    console.error("LIB/DB.TS: Error deleting home page image:", error)
    return { success: false, error: "Failed to delete image" }
  }
}

// Banner settings management functions
export async function getBannerSettings() {
  console.log(`LIB/DB.TS: getBannerSettings called. dbInitialized: ${dbInitialized}`)
  if (!dbInitialized) {
    console.error("LIB/DB.TS: getBannerSettings - Database not initialized.")
    return null
  }
  try {
    const result = await executeQueryWithRetry(`
      SELECT id, start_date, end_date, message, is_visible, created_at, updated_at
      FROM banner_settings
      ORDER BY id DESC
      LIMIT 1
    `)
    return result[0] || null
  } catch (error) {
    console.error("LIB/DB.TS: Error fetching banner settings:", error)
    if (error instanceof Error && error.message.includes('relation "banner_settings" does not exist')) {
      console.warn("LIB/DB.TS: Table 'banner_settings' might not exist. Please run the setup script.")
    }
    return null
  }
}

export async function updateBannerSettings(settings: {
  start_date: string
  end_date: string
  message: string
  is_visible: boolean
}) {
  console.log(`LIB/DB.TS: updateBannerSettings called. dbInitialized: ${dbInitialized}`)
  if (!dbInitialized) {
    console.error("LIB/DB.TS: updateBannerSettings - Database not initialized.")
    return { success: false, error: "Database not initialized" }
  }
  try {
    const result = await executeQueryWithRetry(
      `
      UPDATE banner_settings 
      SET start_date = $1, end_date = $2, message = $3, is_visible = $4, updated_at = CURRENT_TIMESTAMP
      WHERE id = (SELECT id FROM banner_settings ORDER BY id DESC LIMIT 1)
      RETURNING *
    `,
      [settings.start_date, settings.end_date, settings.message, settings.is_visible],
    )
    return { success: true, data: result[0] }
  } catch (error) {
    console.error("LIB/DB.TS: Error updating banner settings:", error)
    return { success: false, error: "Failed to update banner settings" }
  }
}

export async function toggleBannerVisibility(isVisible: boolean) {
  console.log(`LIB/DB.TS: toggleBannerVisibility called. isVisible: ${isVisible}, dbInitialized: ${dbInitialized}`)
  if (!dbInitialized) {
    console.error("LIB/DB.TS: toggleBannerVisibility - Database not initialized.")
    return { success: false, error: "Database not initialized" }
  }
  try {
    await executeQueryWithRetry(
      `
      UPDATE banner_settings 
      SET is_visible = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = (SELECT id FROM banner_settings ORDER BY id DESC LIMIT 1)
    `,
      [isVisible],
    )
    return { success: true }
  } catch (error) {
    console.error("LIB/DB.TS: Error toggling banner visibility:", error)
    return { success: false, error: "Failed to toggle banner visibility" }
  }
}

export async function checkProductsSchema() {
  console.log(`LIB/DB.TS: checkProductsSchema called. dbInitialized: ${dbInitialized}`)
  if (!dbInitialized) {
    console.error("LIB/DB.TS: checkProductsSchema - Database not initialized.")
    return null
  }
  try {
    const result = await executeQueryWithRetry(`
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'new_products'
AND column_name IN ('price', 'retailerprice', 'wholesalerprice', 'europe_price')
ORDER BY ordinal_position
`)
    const sampleProduct = await executeQueryWithRetry(`
SELECT objectid, title, price, retailerprice, wholesalerprice, europe_price
FROM new_products
WHERE wholesalerprice IS NOT NULL OR europe_price IS NOT NULL
LIMIT 1
`)
    return { schema: result, sample: sampleProduct.length > 0 ? sampleProduct[0] : null }
  } catch (error) {
    console.error("LIB/DB.TS: Error checking products schema:", error)
    return null
  }
}

export { sql }

export async function getProductsByCategory(categoryId: string) {
  console.log(`LIB/DB.TS: getProductsByCategory called. CategoryId: ${categoryId}, dbInitialized: ${dbInitialized}`)
  if (!dbInitialized) {
    console.error("LIB/DB.TS: getProductsByCategory - Database not initialized.")
    return []
  }
  try {
    const result = await executeQueryWithRetry(
      `
SELECT * 
FROM new_products
WHERE cateid = $1 AND (deleted = false OR deleted IS NULL)
ORDER BY title ASC
`,
      [categoryId],
    )
    return result
  } catch (error) {
    console.error(`LIB/DB.TS: Error fetching products by category ${categoryId}:`, error)
    return []
  }
}
export async function getFeaturedProducts(limit = 100) {
  console.log(`LIB/DB.TS: getFeaturedProducts called. Limit: ${limit}, dbInitialized: ${dbInitialized}`)
  if (!dbInitialized) {
    console.error("LIB/DB.TS: getFeaturedProducts - Database not initialized.")
    return []
  }
  try {
    const result = await executeQueryWithRetry(
      `
SELECT * 
FROM new_products
WHERE (deleted = false OR deleted IS NULL)
ORDER BY createdat DESC
LIMIT $1
`,
      [limit],
    )
    return result
  } catch (error) {
    console.error("LIB/DB.TS: Error fetching featured products:", error)
    return []
  }
}
export async function searchProducts(query: string) {
  console.log(`LIB/DB.TS: searchProducts called. Query: ${query}, dbInitialized: ${dbInitialized}`)
  if (!dbInitialized) {
    console.error("LIB/DB.TS: searchProducts - Database not initialized.")
    return []
  }
  try {
    const result = await executeQueryWithRetry(
      `
SELECT * 
FROM new_products
WHERE (title ILIKE $1 OR description ILIKE $1) AND (deleted = false OR deleted IS NULL)
ORDER BY title ASC
`,
      [`%${query}%`],
    )
    return result
  } catch (error) {
    console.error(`LIB/DB.TS: Error searching products with query ${query}:`, error)
    return []
  }
}
export async function getProductsBySubcategory(subcategoryId: string) {
  console.log(
    `LIB/DB.TS: getProductsBySubcategory called. SubcategoryId: ${subcategoryId}, dbInitialized: ${dbInitialized}`,
  )
  if (!dbInitialized) {
    console.error("LIB/DB.TS: getProductsBySubcategory - Database not initialized.")
    return []
  }
  try {
    const result = await executeQueryWithRetry(
      `
SELECT * 
FROM new_products
WHERE subcateid = $1 AND (deleted = false OR deleted IS NULL)
ORDER BY title ASC
`,
      [subcategoryId],
    )
    return result
  } catch (error) {
    console.error(`LIB/DB.TS: Error fetching products by subcategory ${subcategoryId}:`, error)
    return []
  }
}

export async function getActiveQuantityPromotionForSubcategory(
  subcategoryId: string | null | undefined,
  userCustomerType: string | null | undefined,
): Promise<{ buy_quantity: number; free_quantity: number; description?: string | null } | null> {
  console.log(
    `[DB getActiveQuantityPromotionForSubcategory] Called with subcategoryId: ${subcategoryId}, userCustomerType: ${userCustomerType}`,
  )
  if (!dbInitialized) {
    console.error("LIB/DB.TS: getActiveQuantityPromotionForSubcategory - Database not initialized.")
    return null
  }
  if (!subcategoryId) {
    console.warn("[DB getActiveQuantityPromotionForSubcategory] subcategoryId is null or undefined. Returning null.")
    return null
  }

  try {
    let promo = null

    // Robust normalization of customer type
    let normalizedUserCustomerType: string | null = null
    if (userCustomerType) {
      const lowerCaseType = userCustomerType.toLowerCase()
      if (lowerCaseType === "дребно") {
        normalizedUserCustomerType = "retailer"
        console.log(`[DB getActiveQuantityPromotionForSubcategory] Normalized 'дребно' to 'retailer'.`)
      } else {
        normalizedUserCustomerType = lowerCaseType
        console.log(
          `[DB getActiveQuantityPromotionForSubcategory] Normalized '${userCustomerType}' to '${lowerCaseType}'.`,
        )
      }
    } else {
      console.log(`[DB getActiveQuantityPromotionForSubcategory] userCustomerType is null or undefined.`)
    }

    if (normalizedUserCustomerType) {
      console.log(
        `[DB getActiveQuantityPromotionForSubcategory] Checking for specific promotion for customerType: ${normalizedUserCustomerType}`,
      )
      const specificPromoResult = await executeQueryWithRetry(
        `
      SELECT min_quantity, bonus_quantity, description
      FROM quantity_promotions
      WHERE subcategory_id = $1
        AND customer_type = $2
        AND is_active = true
        AND (deleted = false OR deleted IS NULL)
      ORDER BY created_at DESC
      LIMIT 1;
    `,
        [subcategoryId, normalizedUserCustomerType],
      )
      console.log(
        `[DB getActiveQuantityPromotionForSubcategory] Specific promo query result for ${subcategoryId} & ${normalizedUserCustomerType}:`,
        JSON.stringify(specificPromoResult, null, 2),
      )
      if (specificPromoResult.length > 0) {
        promo = specificPromoResult[0]
        console.log(
          "[DB getActiveQuantityPromotionForSubcategory] Found specific promotion:",
          JSON.stringify(promo, null, 2),
        )
      } else {
        console.log("[DB getActiveQuantityPromotionForSubcategory] No specific promotion found.")
      }
    } else {
      console.log(
        "[DB getActiveQuantityPromotionForSubcategory] userCustomerType is null or undefined after normalization. Skipping specific promotion check.",
      )
    }

    if (!promo) {
      console.log(
        "[DB getActiveQuantityPromotionForSubcategory] No specific promo found or userCustomerType was null. Checking for general promotion (customer_type IS NULL).",
      )
      const generalPromoResult = await executeQueryWithRetry(
        `
      SELECT min_quantity, bonus_quantity, description
      FROM quantity_promotions
      WHERE subcategory_id = $1
        AND customer_type IS NULL
        AND is_active = true
        AND (deleted = false OR deleted IS NULL)
      ORDER BY created_at DESC
      LIMIT 1;
    `,
        [subcategoryId],
      )
      console.log(
        `[DB getActiveQuantityPromotionForSubcategory] General promo query result for ${subcategoryId}:`,
        JSON.stringify(generalPromoResult, null, 2),
      )
      if (generalPromoResult.length > 0) {
        promo = generalPromoResult[0]
        console.log(
          "[DB getActiveQuantityPromotionForSubcategory] Found general promotion:",
          JSON.stringify(promo, null, 2),
        )
      } else {
        console.log("[DB getActiveQuantityPromotionForSubcategory] No general promotion found.")
      }
    }

    if (promo) {
      console.log(
        "[DB getActiveQuantityPromotionForSubcategory] Final promo object to return:",
        JSON.stringify(promo, null, 2),
      )
      return {
        buy_quantity: Number(promo.min_quantity),
        free_quantity: Number(promo.bonus_quantity),
        description: promo.description || null,
      }
    }
    console.log("[DB getActiveQuantityPromotionForSubcategory] No promotion found. Returning null.")
    return null
  } catch (error) {
    console.error(
      `LIB/DB.TS: Error fetching quantity promotion for subcategory ${subcategoryId} and customer type ${userCustomerType}:`,
      error,
    )
    if (
      error instanceof Error &&
      (error.message.includes('relation "quantity_promotions" does not exist') ||
        error.message.includes('column "subcategory_id" does not exist') ||
        error.message.includes('column "min_quantity" does not exist') ||
        error.message.includes('column "bonus_quantity" does not exist') ||
        error.message.includes('column "customer_type" does not exist'))
    ) {
      console.warn(
        `LIB/DB.TS: Table 'quantity_promotions' or its columns (subcategory_id, min_quantity, bonus_quantity, customer_type, is_active, deleted) might not exist or match. Please ensure it's created correctly.`,
      )
    }
    return null
  }
}

export async function updateHomePageImageUrl(id: number, newUrl: string) {
console.log(`LIB/DB.TS: updateHomePageImageUrl called. id: ${id}, newUrl: ${newUrl}, dbInitialized: ${dbInitialized}`)
  if (!dbInitialized) {
console.error("LIB/DB.TS: updateHomePageImageUrl - Database not initialized.")
  return { success: false, error: "Database not initialized" }
  }
  try {
    await executeQueryWithRetry(`UPDATE home_page_image SET image_url = $1 WHERE id = $2`, [newUrl, id])
    return { success: true }
  } catch (error) {
    console.error(`LIB/DB.TS: Error updating home page image URL for id ${id}:`, error)
    return { success: false, error: "Failed to update image URL" }
  }
}

// Hero Banner Carousel functions
export async function getHeroBanners() {
  console.log(`LIB/DB.TS: getHeroBanners called. dbInitialized: ${dbInitialized}`)
  if (!dbInitialized) {
    console.error("LIB/DB.TS: getHeroBanners - Database not initialized.")
    return []
  }
  try {
    const result = await executeQueryWithRetry(`
      SELECT id, image_url, is_active, sort_order, link_url, created_at
      FROM home_page_image
      WHERE is_active = true
      ORDER BY sort_order ASC, created_at DESC
    `)
    return result || []
  } catch (error) {
    console.error("LIB/DB.TS: Error fetching hero banners:", error)
    // Fallback: try without sort_order/link_url columns (pre-migration)
    try {
      const fallbackResult = await executeQueryWithRetry(`
        SELECT id, image_url, is_active, created_at
        FROM home_page_image
        WHERE is_active = true
        ORDER BY created_at DESC
      `)
      return (fallbackResult || []).map((r: any) => ({ ...r, sort_order: 0, link_url: null }))
    } catch {
      return []
    }
  }
}

export async function toggleBannerActive(id: number, isActive: boolean) {
  console.log(`LIB/DB.TS: toggleBannerActive called. id: ${id}, isActive: ${isActive}`)
  if (!dbInitialized) {
    return { success: false, error: "Database not initialized" }
  }
  try {
    await executeQueryWithRetry(`UPDATE home_page_image SET is_active = $1 WHERE id = $2`, [isActive, id])
    return { success: true }
  } catch (error) {
    console.error("LIB/DB.TS: Error toggling banner active:", error)
    return { success: false, error: "Failed to toggle banner" }
  }
}

export async function updateBannerSortOrder(id: number, sortOrder: number) {
  console.log(`LIB/DB.TS: updateBannerSortOrder called. id: ${id}, sortOrder: ${sortOrder}`)
  if (!dbInitialized) {
    return { success: false, error: "Database not initialized" }
  }
  try {
    await executeQueryWithRetry(`UPDATE home_page_image SET sort_order = $1 WHERE id = $2`, [sortOrder, id])
    return { success: true }
  } catch (error) {
    console.error("LIB/DB.TS: Error updating banner sort order:", error)
    return { success: false, error: "Failed to update sort order" }
  }
}

export async function updateBannerLinkUrl(id: number, linkUrl: string | null) {
  console.log(`LIB/DB.TS: updateBannerLinkUrl called. id: ${id}, linkUrl: ${linkUrl}`)
  if (!dbInitialized) {
    return { success: false, error: "Database not initialized" }
  }
  try {
    await executeQueryWithRetry(`UPDATE home_page_image SET link_url = $1 WHERE id = $2`, [linkUrl, id])
    return { success: true }
  } catch (error) {
    console.error("LIB/DB.TS: Error updating banner link URL:", error)
    return { success: false, error: "Failed to update link URL" }
  }
}

export async function getProducts({
  category,
  subcategory,
  search,
}: { category?: string; subcategory?: string; search?: string } = {}) {
  console.log(
    `LIB/DB.TS: getProducts called. Category: ${category}, Subcategory: ${subcategory}, Search: ${search}, dbInitialized: ${dbInitialized}`,
  )
  if (!dbInitialized) {
    console.error("LIB/DB.TS: getProducts - Database not initialized.")
    return []
  }
  try {
    let query = `
SELECT p.*, c.title as category_title, s.title as subcategory_title
FROM new_products p
LEFT JOIN categories c ON p.cateid = c."Document ID"
LEFT JOIN subcategories s ON p.subcateid = s."Document ID"
WHERE (p.deleted = false OR p.deleted IS NULL)
`
    const params: any[] = []
    if (category) {
      query += ` AND p.cateid = $${params.length + 1}`
      params.push(category)
    }
    if (subcategory) {
      query += ` AND p.subcateid = $${params.length + 1}`
      params.push(subcategory)
    }
    if (search) {
      query += ` AND (p.title ILIKE $${params.length + 1} OR p.description ILIKE $${params.length + 1})`
      params.push(`%${search}%`)
    }
    query += ` ORDER BY p.title ASC`
    const result = await executeQueryWithRetry(query, params)
    return result
  } catch (error) {
    console.error("LIB/DB.TS: Database error in getProducts:", error)
    return []
  }
}

export async function getTableSchema(tableName: string) {
  console.log(`LIB/DB.TS: getTableSchema called. Table: ${tableName}, dbInitialized: ${dbInitialized}`)
  if (!dbInitialized) {
    console.error("LIB/DB.TS: getTableSchema - Database not initialized.")
    return { columns: [] }
  }
  try {
    const result = await executeQueryWithRetry(
      `
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = $1
      ORDER BY ordinal_position
    `,
      [tableName],
    )
    return { columns: result || [] }
  } catch (error) {
    console.error(`LIB/DB.TS: Error fetching schema for table ${tableName}:`, error)
    return { columns: [] }
  }
}
