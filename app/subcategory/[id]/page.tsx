import Link from "next/link"
import Image from "next/image"
import { ChevronRightIcon, Fish, Layers, ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  getCategories,
  getProductsBySubcategory,
  getSubcategories,
  getCategoryById,
  getActiveQuantityPromotionForSubcategory,
  getBatchProductRatings,
} from "@/lib/db"
import { SiteHeader } from "@/components/site-header"
import { CategoriesNavbar } from "@/components/categories-navbar"
import { getUser } from "@/lib/auth"
import { ProductCard } from "@/components/product-card"
import { SubcategoryFilterPanel } from "@/components/subcategory-filter-panel"

export default async function SubcategoryPage({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams: { minPrice?: string; maxPrice?: string; sort?: string }
}) {
  const subcategoryId = params.id
  console.log("[SubcategoryPage] Rendering. Subcategory ID:", subcategoryId, "Search Params:", searchParams)

  const allSubcategories = await getSubcategories()
  const subcategory = allSubcategories.find((sub) => sub.id === subcategoryId)

  const user = await getUser()
  const isLoggedIn = !!user
  console.log("[SubcategoryPage] User data:", JSON.stringify(user, null, 2))

  const subcategoryPromotion = await getActiveQuantityPromotionForSubcategory(subcategoryId, user?.customerType)
  console.log(
    `[SubcategoryPage] Fetched subcategoryPromotion for subcategory ${subcategoryId} and customerType ${user?.customerType}:`,
    JSON.stringify(subcategoryPromotion, null, 2),
  )

  if (!subcategory) {
    console.warn(`[SubcategoryPage] Subcategory with ID ${subcategoryId} not found.`)
    return (
      <div className="min-h-screen bg-gray-100 text-gray-800 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Подкатегорията не е намерена</h1>
          <p className="mb-6">Съжаляваме, но търсената от вас подкатегория не съществува.</p>
          <Button asChild className="bg-red-600 hover:bg-red-700 text-white">
            <Link href="/">Към началната страница</Link>
          </Button>
        </div>
      </div>
    )
  }
  console.log("[SubcategoryPage] Fetched subcategory:", subcategory?.title)

  const products = await getProductsBySubcategory(subcategoryId)
  console.log(`[SubcategoryPage] Found ${products.length} products for subcategory ${subcategoryId} initially.`)

  let filteredProducts = [...products]

  const minPriceParam = searchParams.minPrice ? Number.parseFloat(searchParams.minPrice) : undefined
  const maxPriceParam = searchParams.maxPrice ? Number.parseFloat(searchParams.maxPrice) : undefined

  if (minPriceParam !== undefined) {
    filteredProducts = filteredProducts.filter((product) => {
      const price = Number.parseFloat(product.price)
      return price >= minPriceParam
    })
    console.log(`[SubcategoryPage] Filtered by minPrice ${minPriceParam}: ${filteredProducts.length} products`)
  }

  if (maxPriceParam !== undefined) {
    filteredProducts = filteredProducts.filter((product) => {
      const price = Number.parseFloat(product.price)
      return price <= maxPriceParam
    })
    console.log(`[SubcategoryPage] Filtered by maxPrice ${maxPriceParam}: ${filteredProducts.length} products`)
  }

  const sortOption = searchParams.sort || "title-asc"
  // Sorting logic...
  switch (sortOption) {
    case "title-asc":
      filteredProducts.sort((a, b) => a.title.localeCompare(b.title))
      break
    case "title-desc":
      filteredProducts.sort((a, b) => b.title.localeCompare(a.title))
      break
    case "price-asc":
      filteredProducts.sort((a, b) => Number.parseFloat(a.price) - Number.parseFloat(b.price))
      break
    case "price-desc":
      filteredProducts.sort((a, b) => Number.parseFloat(b.price) - Number.parseFloat(a.price))
      break
    default:
      filteredProducts.sort((a, b) => a.title.localeCompare(b.title))
  }
  console.log(`[SubcategoryPage] Sorted products by ${sortOption}.`)
  console.log(
    `[SubcategoryPage] Final filteredProducts count: ${filteredProducts.length}. First product's promo data will use subcategoryPromotion.`,
  )

  // Fetch ratings for all products
  const productIds = filteredProducts.map((p) => p.objectid)
  const ratingsMap = await getBatchProductRatings(productIds)

  const categories = await getCategories()
  const parentCategoryId = subcategory.cateid
  const currentSubcategory = subcategory
  const parentCategory = parentCategoryId ? await getCategoryById(parentCategoryId) : null
  const siblingSubcategories = parentCategoryId
    ? allSubcategories.filter((sub) => sub.cateid === parentCategoryId && sub.id !== subcategoryId)
    : []

  const getCategoryImage = (category: { title: string; photourl?: string }) => {
    if (category?.photourl) return category.photourl
    const categoryImages: Record<string, string> = {
      Въдици: "/images/fishing-rod.png",
      Макари: "/images/fishing-reels.png",
      Примамки: "/images/fishing-lures.png",
      Куки: "/images/fishing-hooks.png",
      Влакна: "/images/fishing-line.png",
      Аксесоари: "/images/fishing-accessories.png",
      Облекло: "/images/fishing-clothing.png",
      Лодки: "/images/fishing-boat.png",
      Сонари: "/images/fish-finder.png",
      Чанти: "/images/fishing-bags.png",
    }
    return categoryImages[category?.title || ""] || "/images/category-default.png"
  }

  const isNewProduct = (createdAt: string) => {
    if (!createdAt) return false
    const productDate = new Date(createdAt)
    const twoWeeksAgo = new Date()
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)
    return productDate > twoWeeksAgo
  }

  const getRandomDiscount = () => {
    if (Math.random() < 0.2) {
      return Math.floor(Math.random() * 26) + 5
    }
    return 0
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800">
      <div className="bg-gray-950">
        <SiteHeader
          categories={categories}
          subcategories={allSubcategories}
          currentCategoryId={parentCategoryId}
          currentSubcategoryId={subcategoryId}
        />
      </div>
      <div className="bg-gray-900">
        <CategoriesNavbar currentCategoryId={parentCategoryId} />
      </div>
      <section className="relative py-12 bg-white border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
            <Link href="/" className="hover:text-red-600">
              Начало
            </Link>
            <ChevronRightIcon className="h-4 w-4" />
            {parentCategory && (
              <>
                <Link href={`/category/${parentCategory.id}`} className="hover:text-red-600">
                  {parentCategory.title}
                </Link>
                <ChevronRightIcon className="h-4 w-4" />
              </>
            )}
            <span className="text-red-600">{currentSubcategory.title}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            <div className="md:col-span-2">
              <h1 className="text-3xl md:text-4xl font-bold mb-3 text-gray-800">{currentSubcategory.title}</h1>
              {currentSubcategory.description && <p className="text-gray-600 mb-4">{currentSubcategory.description}</p>}
              <div className="flex items-center space-x-4 mt-6">
                {parentCategory && (
                  <Button asChild variant="outline" className="border-gray-300 hover:border-red-600 text-gray-700">
                    <Link href={`/category/${parentCategory.id}`} className="flex items-center">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Обратно към {parentCategory.title}
                    </Link>
                  </Button>
                )}
                <p className="text-red-600 font-medium">
                  {filteredProducts.length} {filteredProducts.length === 1 ? "продукт" : "продукта"} намерени
                </p>
              </div>
            </div>
            <div className="hidden md:block relative h-48 rounded-lg overflow-hidden">
              <Image
                src={
                  currentSubcategory.photourl ||
                  getCategoryImage(parentCategory || {}) ||
                  "/images/category-default.png"
                }
                alt={currentSubcategory.title}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-white/60 to-transparent"></div>
            </div>
          </div>
        </div>
      </section>
      {siblingSubcategories.length > 0 && (
        <section className="py-6 bg-gray-50 border-b border-gray-200">
          <div className="container mx-auto px-4">
            <div className="flex items-center mb-4">
              <Layers className="h-5 w-5 text-red-600 mr-2" />
              <h2 className="text-lg font-medium text-gray-800">Други подкатегории в {parentCategory?.title}</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              {siblingSubcategories.map(
                (
                  siblingSub, // Renamed subcategory to siblingSub to avoid conflict
                ) => (
                  <Link
                    key={siblingSub.id}
                    href={`/subcategory/${siblingSub.id}`}
                    className="px-4 py-2 bg-white hover:bg-gray-100 border border-gray-300 hover:border-red-600 rounded-md text-sm transition-colors text-gray-700"
                  >
                    {siblingSub.title}
                  </Link>
                ),
              )}
            </div>
          </div>
        </section>
      )}
      <section className="py-4 bg-gray-50">
        <div className="container mx-auto px-4">
          <SubcategoryFilterPanel
            subcategoryId={subcategoryId}
            minPrice={searchParams.minPrice}
            maxPrice={searchParams.maxPrice}
            sortOption={searchParams.sort || "title-asc"}
          />
        </div>
      </section>
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {filteredProducts.map((product) => {
                const rating = ratingsMap.get(product.objectid)
                return (
                  <ProductCard
                    key={product.objectid}
                    id={product.objectid}
                    title={product.title}
                    description={product.description}
                    price={Number(product.price)}
                    retailerprice={product.retailerprice ? Number(product.retailerprice) : undefined}
                    wholesalerprice={product.wholesalerprice ? Number(product.wholesalerprice) : undefined}
                    europe_price={product.europe_price ? Number(product.europe_price) : undefined}
                    price_eur={product.price_eur ? Number(product.price_eur) : undefined}
                    retailerprice_eur={product.retailerprice_eur ? Number(product.retailerprice_eur) : undefined}
                    wholesalerprice_eur={product.wholesalerprice_eur ? Number(product.wholesalerprice_eur) : undefined}
                    europe_price_eur={product.europe_price_eur ? Number(product.europe_price_eur) : undefined}
                    photourl={product.photourl}
                    isLoggedIn={isLoggedIn}
                    customerType={user?.customerType}
                    discountPercent={user?.discountPercent}
                    isNew={product.createdat ? isNewProduct(product.createdat) : false}
                    discount={getRandomDiscount()}
                    promo_buy_qty={subcategoryPromotion?.buy_quantity}
                    promo_free_qty={subcategoryPromotion?.free_quantity}
                    promo_description={subcategoryPromotion?.description}
                    averageRating={rating?.average_rating}
                    reviewCount={rating?.review_count}
                  />
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <h3 className="text-xl font-medium mb-2 text-gray-800">Няма намерени продукти</h3>
              <p className="text-gray-600 mb-6">В момента няма продукти в тази подкатегория.</p>
              {parentCategory && (
                <Button asChild className="bg-red-600 hover:bg-red-700 text-white mr-4">
                  <Link href={`/category/${parentCategory.id}`}>Към {parentCategory.title}</Link>
                </Button>
              )}
              <Button
                asChild
                variant="outline"
                className="border-amber-600 text-amber-600 hover:bg-amber-600 hover:text-white"
              >
                <Link href="/">Към началната страница</Link>
              </Button>
            </div>
          )}
        </div>
      </section>
      <footer className="bg-black border-t border-gray-800 pt-12 pb-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Fish className="h-6 w-6 text-red-500" />
                <span className="text-lg font-bold text-white">FishingPro</span>
              </div>
              <p className="text-gray-400 mb-4">Вашият надежден партньор за риболовни приключения от 2005 година.</p>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4 text-white">Категории</h3>
              <ul className="space-y-2">
                {categories.slice(0, 5).map((category) => (
                  <li key={category.id}>
                    <Link
                      href={`/category/${category.id}`}
                      className={`text-gray-400 hover:text-yellow-400 transition-colors ${
                        category.id === parentCategoryId ? "text-yellow-400" : ""
                      }`}
                    >
                      {category.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4 text-white">Информация</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-gray-400 hover:text-yellow-400 transition-colors">
                    За нас
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-400 hover:text-yellow-400 transition-colors">
                    Доставка
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-400 hover:text-yellow-400 transition-colors">
                    Условия ��а ползване
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4 text-white">Контакти</h3>
              <ul className="space-y-2">
                <li className="text-gray-400">Телефон: +359 88 123 4567</li>
                <li className="text-gray-400">Имейл: info@fishingpro.bg</li>
                <li className="text-gray-400">Работно време: 9:00 - 18:00</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8">
            <p className="text-center text-gray-500">© {new Date().getFullYear()} FishingPro. Всички права запазени.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
