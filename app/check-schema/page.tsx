import { checkProductsSchema } from "@/lib/db"

export default async function CheckSchemaPage() {
  const schemaInfo = await checkProductsSchema()

  return (
    <div className="min-h-screen bg-black text-gray-100 p-8">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-8">Проверка на схемата на продуктите</h1>

        <div className="bg-gray-900 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Колони за цени:</h2>
          <pre className="bg-gray-800 p-4 rounded overflow-x-auto">
            {JSON.stringify(schemaInfo?.schema || [], null, 2)}
          </pre>
        </div>

        <div className="bg-gray-900 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Примерен продукт:</h2>
          <pre className="bg-gray-800 p-4 rounded overflow-x-auto">
            {JSON.stringify(schemaInfo?.sample || [], null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
}
