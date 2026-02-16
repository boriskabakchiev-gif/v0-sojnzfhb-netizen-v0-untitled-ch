import { getCategories, getSubcategories, getProductsByCategory } from "@/lib/data"
import { sql } from "@vercel/postgres"

// Променям дебъг страницата, за да използва new_products вместо products
export default async function DebugPage() {
  const categories = await getCategories()
  const allSubcategories = await getSubcategories()

  // Директно изпълняваме заявка към new_products вместо products
  const productsQuery = `
    SELECT * FROM new_products 
    WHERE (deleted = false OR deleted IS NULL)
    LIMIT 10
  `

  let products = []
  try {
    const result = await sql.query(productsQuery)
    products = result.rows
    console.log(`Успешно извлечени ${products.length} продукта от new_products`)
  } catch (error) {
    console.error("Database error:", error)
  }

  // Опитваме се да вземем продукти от категориите
  const categoryProducts = await Promise.all(
    categories.slice(0, 3).map(async (category) => {
      const products = await getProductsByCategory(category.id)
      return {
        categoryId: category.id,
        categoryTitle: category.title,
        productsCount: products.length,
        products: products.slice(0, 2), // Показваме само първите 2 продукта за по-кратък изход
      }
    }),
  )

  return (
    <div className="p-8 bg-black text-white">
      <h1 className="text-2xl font-bold mb-4">Дебъг информация</h1>

      <div className="mb-8">
        <h2 className="text-xl font-bold mb-2">Категории ({categories.length})</h2>
        <table className="w-full mb-4 border-collapse">
          <thead>
            <tr className="bg-gray-800">
              <th className="p-2 text-left border border-gray-700">id</th>
              <th className="p-2 text-left border border-gray-700">title</th>
              <th className="p-2 text-left border border-gray-700">Type</th>
              <th className="p-2 text-left border border-gray-700">Линк</th>
              <th className="p-2 text-left border border-gray-700">Брой подкатегории</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category, index) => {
              const subcats = allSubcategories.filter((s) => s.cateid === category.id)

              return (
                <tr key={index} className={index % 2 === 0 ? "bg-gray-900" : "bg-gray-950"}>
                  <td className="p-2 border border-gray-700">{category.id || "null/undefined"}</td>
                  <td className="p-2 border border-gray-700">{category.title}</td>
                  <td className="p-2 border border-gray-700">{typeof category.id}</td>
                  <td className="p-2 border border-gray-700">
                    <a
                      href={`/category/${category.id}`}
                      className="text-blue-400 hover:underline"
                      target="_blank"
                      rel="noreferrer"
                    >
                      /category/{category.id}
                    </a>
                  </td>
                  <td className="p-2 border border-gray-700">{subcats.length}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-bold mb-2">Директно извлечени продукти от new_products ({products.length})</h2>
        {products.length > 0 ? (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-800">
                <th className="p-2 text-left border border-gray-700">ID</th>
                <th className="p-2 text-left border border-gray-700">Заглавие</th>
                <th className="p-2 text-left border border-gray-700">Цена</th>
                <th className="p-2 text-left border border-gray-700">cateid</th>
              </tr>
            </thead>
            <tbody>
              {products.slice(0, 5).map((product, idx) => (
                <tr key={idx} className="bg-gray-950">
                  <td className="p-2 border border-gray-700">{product.objectid}</td>
                  <td className="p-2 border border-gray-700">{product.title}</td>
                  <td className="p-2 border border-gray-700">{product.price} лв.</td>
                  <td className="p-2 border border-gray-700">{product.cateid}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-yellow-400">Няма намерени продукти или възникна грешка</p>
        )}
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-bold mb-2">Пример продукти по категории</h2>
        {categoryProducts.map((catProducts, index) => (
          <div key={index} className="mb-6 p-4 bg-gray-900 rounded-md">
            <h3 className="text-lg font-bold mb-2">
              Категория: {catProducts.categoryTitle} (ID: {catProducts.categoryId})
            </h3>
            <p className="mb-2">Брой продукти: {catProducts.productsCount}</p>

            {catProducts.productsCount > 0 ? (
              <div>
                <h4 className="text-md font-semibold mb-1">Примерни продукти:</h4>
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-800">
                      <th className="p-2 text-left border border-gray-700">ID</th>
                      <th className="p-2 text-left border border-gray-700">Заглавие</th>
                      <th className="p-2 text-left border border-gray-700">Цена</th>
                      <th className="p-2 text-left border border-gray-700">cateid</th>
                    </tr>
                  </thead>
                  <tbody>
                    {catProducts.products.map((product, idx) => (
                      <tr key={idx} className="bg-gray-950">
                        <td className="p-2 border border-gray-700">{product.objectid}</td>
                        <td className="p-2 border border-gray-700">{product.title}</td>
                        <td className="p-2 border border-gray-700">{product.price} лв.</td>
                        <td className="p-2 border border-gray-700">{product.cateid}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-yellow-400">Няма намерени продукти</p>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4">
        <p className="text-gray-400">
          Тази страница е само за дебъгване и не трябва да бъде достъпна за потребителите.
        </p>
      </div>
    </div>
  )
}
