import Link from "next/link"
import Image from "next/image"
import { ChevronRight, Star, Tag } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  getCategories,
  getCategoryById,
  getProductById,
  getProductsByCategory,
  getSubcategories,
  getActiveQuantityPromotionForSubcategory,
} from "@/lib/db"
import { getUser } from "@/lib/auth"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { CategoriesNavbar } from "@/components/categories-navbar"
import { ProductCard } from "@/components/product-card"
import { ProductQuantityControls } from "@/components/product-quantity-controls"
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel"

// Helper function to format price, ensuring "N/A" for null/undefined prices
function formatDisplayPrice(price: number | null | undefined): string {
  if (price === null || price === undefined || isNaN(Number(price))) {
    return "N/A"
  }
  return Number(price).toFixed(2)
}

// Helper function to convert BGN to EUR
function convertBgnToEur(bgnPrice: number | null | undefined): number | null {
  if (bgnPrice === null || bgnPrice === undefined || isNaN(Number(bgnPrice))) {
    return null
  }
  return Number(bgnPrice) / 1.96 // 1 EUR = 1.96 BGN
}

export default async function ProductPage({ params }: { params: { id: string } }) {
  try {
    const productId = params.id

    if (!productId || productId === "null" || productId === "undefined") {
      return (
        <div className="min-h-screen bg-gray-100 text-gray-800 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Продуктът не е намерен</h1>
            <p className="text-gray-600 mb-6">Съжаляваме, но търсеният от вас продукт не съществува.</p>
            <Button asChild className="bg-red-600 hover:bg-red-700 text-white">
              <Link href="/">Към началната страница</Link>
            </Button>
          </div>
        </div>
      )
    }

    const product = await getProductById(productId)

    if (!product) {
      return (
        <div className="min-h-screen bg-gray-100 text-gray-800 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Продуктът не е намерен</h1>
            <p className="text-gray-600 mb-6">Съжаляваме, но търсеният от вас продукт не съществува.</p>
            <Button asChild className="bg-red-600 hover:bg-red-700 text-white">
              <Link href="/">Към началната страница</Link>
            </Button>
          </div>
        </div>
      )
    }

    const categories = await getCategories().catch(() => [])
    const user = await getUser().catch(() => null)
    const isUserLoggedIn = !!user

    const subcategoryPromotion = await getActiveQuantityPromotionForSubcategory(product.subcateid, user?.customerType)

    const category = product?.cateid ? await getCategoryById(product.cateid).catch(() => null) : null
    const allSubcategories = await getSubcategories().catch(() => [])
    const subcategory = product?.subcateid ? allSubcategories.find((sub) => sub.id === product.subcateid) : null

    const similarProducts = product?.cateid
      ? (await getProductsByCategory(product.cateid).catch(() => []))
          .filter((p) => p.objectid !== product.objectid)
          .slice(0, 8)
      : []

    const isEuropeanCustomer = () => {
      const type = user?.customerType?.toLowerCase()
      return type === "european" || type === "europen"
    }

    // Determines the base price according to customer type, without personal discounts
    const getBasePriceForCustomer = (): number | null => {
      if (!isUserLoggedIn) {
        return Number(product.price) // Standard price for guests
      }
      const type = user?.customerType?.toLowerCase()

      if (isEuropeanCustomer()) {
        return product.europe_price !== undefined && product.europe_price !== null ? Number(product.europe_price) : null
      } else if (type === "wholesaler" || type === "едро") {
        return product.wholesalerprice !== undefined && product.wholesalerprice !== null
          ? Number(product.wholesalerprice)
          : null
      } else if (type === "retailer" || type === "дребно") {
        return product.retailerprice !== undefined && product.retailerprice !== null
          ? Number(product.retailerprice)
          : null
      } else {
        return Number(product.price) // Standard price for other logged-in users
      }
    }

    const priceToDisplay = getBasePriceForCustomer() // This is the price without personal discount
    const eurPrice = convertBgnToEur(priceToDisplay)

    const getPriceLabel = (): string => {
      if (!isUserLoggedIn) return "Стандартна цена"
      const type = user?.customerType?.toLowerCase()
      if (isEuropeanCustomer()) {
        return priceToDisplay !== null ? "Цена за европейски клиенти" : "Цена за европейски клиенти (N/A)"
      }
      if (type === "wholesaler" || type === "едро") {
        return priceToDisplay !== null ? "Цена за търговци на едро" : "Цена за търговци на едро (N/A)"
      }
      if (type === "retailer" || type === "дребно") {
        return priceToDisplay !== null ? "Цена за търговци на дребно" : "Цена за търговци на дребно (N/A)"
      }
      return "Стандартна цена"
    }

    let finalPromoBuyQty: number | null | undefined = null
    let finalPromoFreeQty: number | null | undefined = null
    let promotionDisplayMessage: string | null = null

    if (subcategoryPromotion && subcategoryPromotion.buy_quantity > 0 && subcategoryPromotion.free_quantity >= 0) {
      finalPromoBuyQty = subcategoryPromotion.buy_quantity
      finalPromoFreeQty = subcategoryPromotion.free_quantity
      if (subcategoryPromotion.description) {
        promotionDisplayMessage = subcategoryPromotion.description
      } else if (finalPromoFreeQty > 0) {
        promotionDisplayMessage = `Купи ${finalPromoBuyQty}, Вземи ${finalPromoFreeQty} безплатно!`
      } else if (finalPromoBuyQty > 0 && finalPromoFreeQty === 0) {
        promotionDisplayMessage = `Специална оферта при покупка на ${finalPromoBuyQty} бр.`
      }
    }

    return (
      <div className="min-h-screen bg-gray-100 text-gray-800">
        <SiteHeader
          categories={categories}
          subcategories={allSubcategories}
          currentCategoryId={product?.cateid}
          isLoggedIn={isUserLoggedIn}
          userName={user?.name || user?.storeName || ""}
        />

        <CategoriesNavbar currentCategoryId={product?.cateid} isEnglish={false} />

        <div className="bg-white border-b border-gray-200 py-4">
          <div className="container mx-auto px-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Link href="/" className="hover:text-red-600">
                Начало
              </Link>
              <ChevronRight className="h-4 w-4" />
              {category && (
                <>
                  <Link href={`/category/${category.id || category.cateid}`} className="hover:text-red-600">
                    {category.title}
                  </Link>
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
              {subcategory && (
                <>
                  <Link href={`/subcategory/${subcategory.id}`} className="hover:text-red-600">
                    {subcategory.title}
                  </Link>
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
              <span className="text-red-600">{product.title}</span>
            </div>
          </div>
        </div>

        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="bg-white rounded-lg overflow-hidden shadow-sm">
                <Carousel className="w-full">
                  <CarouselContent>
                    <CarouselItem>
                      <div className="aspect-square relative">
                        <Image
                          src={
                            product.photourl ||
                            `/placeholder.svg?height=600&width=600&query=${encodeURIComponent(product.title || "fishing equipment")}`
                          }
                          alt={product.title}
                          fill
                          className="object-scale-down p-4"
                        />
                      </div>
                    </CarouselItem>
                  </CarouselContent>
                </Carousel>
              </div>

              <div>
                <h1 className="text-3xl font-bold mb-4 text-gray-800">{product.title}</h1>
                <div className="flex items-center mb-4">
                  {Array(4)
                    .fill(0)
                    .map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  {Array(1)
                    .fill(0)
                    .map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-gray-300" />
                    ))}
                  <span className="ml-2 text-gray-600">(4.0)</span>
                </div>

                <div className="mb-6">
                  {isUserLoggedIn ? (
                    <>
                      <div className="text-sm text-gray-600 mb-1">{getPriceLabel()}</div>
                      <div className="flex flex-col">
                        <p className="text-3xl font-bold text-red-600">
                          {formatDisplayPrice(priceToDisplay)} {priceToDisplay !== null ? "лв." : ""}
                        </p>
                        {eurPrice !== null && <p className="text-xl text-gray-600">{formatDisplayPrice(eurPrice)} €</p>}
                      </div>
                      {promotionDisplayMessage && (
                        <div className="mt-2 flex items-center">
                          <Tag className="h-4 w-4 mr-1 text-green-600" />
                          <p className="text-sm font-semibold text-green-700">{promotionDisplayMessage}</p>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-gray-600 mb-1">Стандартна цена</p>
                      <div className="flex flex-col">
                        <p className="text-3xl font-bold text-red-600">
                          {formatDisplayPrice(Number(product.price))} лв.
                        </p>
                        <p className="text-xl text-gray-600">
                          {formatDisplayPrice(convertBgnToEur(Number(product.price)))} €
                        </p>
                      </div>
                      {promotionDisplayMessage && (
                        <div className="mt-2 flex items-center">
                          <Tag className="h-4 w-4 mr-1 text-green-600" />
                          <p className="text-sm font-semibold text-green-700">{promotionDisplayMessage}</p>
                        </div>
                      )}
                      <p className="text-gray-700 text-sm mt-2">
                        Регистрирайте се или влезте в профила си за специални цени и отстъпки.
                      </p>
                    </>
                  )}
                </div>

                <div className="mb-8">
                  <p className="text-gray-700 whitespace-pre-wrap">{product.description}</p>
                </div>
                <div className="mb-8">
                  <ProductQuantityControls
                    productId={product.objectid}
                    productTitle={product.title}
                    // Pass 0 if priceToDisplay is null, or actual price
                    productPrice={priceToDisplay !== null ? priceToDisplay : 0}
                    photoUrl={product.photourl}
                    promo_buy_qty={finalPromoBuyQty}
                    promo_free_qty={finalPromoFreeQty}
                    // Disable controls if price is N/A (null)
                    disabled={priceToDisplay === null}
                  />
                </div>
                <div className="border-t border-gray-200 pt-6">
                  {category && (
                    <div className="flex items-center text-gray-600 mb-2">
                      <span className="w-32">Категория:</span>
                      <Link
                        href={`/category/${category.id || category.cateid}`}
                        className="text-red-600 hover:underline"
                      >
                        {category.title}
                      </Link>
                    </div>
                  )}
                  {subcategory && (
                    <div className="flex items-center text-gray-600 mb-2">
                      <span className="w-32">Подкатегория:</span>
                      <Link href={`/subcategory/${subcategory.id}`} className="text-red-600 hover:underline">
                        {subcategory.title}
                      </Link>
                    </div>
                  )}
                  <div className="flex items-center text-gray-600 mb-2">
                    <span className="w-32">Код на продукта:</span>
                    <span>{product.objectid}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <span className="w-32">Наличност:</span>
                    <span className="text-green-600">В наличност</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {similarProducts.length > 0 && (
          <section className="py-12 bg-white">
            <div className="container mx-auto px-4">
              <h2 className="text-2xl font-bold mb-8 text-gray-800">Подобни продукти</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {similarProducts.map(async (similarProd) => {
                  const similarProdPromotion = await getActiveQuantityPromotionForSubcategory(
                    similarProd.subcateid,
                    user?.customerType,
                  )
                  let similarProdPromoMsg: string | null = null
                  if (
                    similarProdPromotion &&
                    similarProdPromotion.buy_quantity > 0 &&
                    similarProdPromotion.free_quantity >= 0
                  ) {
                    if (similarProdPromotion.description) {
                      similarProdPromoMsg = similarProdPromotion.description
                    } else if (similarProdPromotion.free_quantity > 0) {
                      similarProdPromoMsg = `Купи ${similarProdPromotion.buy_quantity}, Вземи ${similarProdPromotion.free_quantity} безплатно!`
                    } else if (similarProdPromotion.buy_quantity > 0 && similarProdPromotion.free_quantity === 0) {
                      similarProdPromoMsg = `Специална оферта при покупка на ${similarProdPromotion.buy_quantity} бр.`
                    }
                  }

                  return (
                    <ProductCard
                      key={similarProd.objectid}
                      id={similarProd.objectid}
                      title={similarProd.title}
                      description={similarProd.description}
                      price={Number(similarProd.price) || 0} // Standard price
                      retailerprice={Number(similarProd.retailerprice)}
                      wholesalerprice={Number(similarProd.wholesalerprice)}
                      europe_price={Number(similarProd.europe_price)}
                      photourl={similarProd.photourl}
                      isLoggedIn={isUserLoggedIn}
                      customerType={user?.customerType}
                      // discountPercent is no longer used for price calculation in ProductCard
                      promo_buy_qty={similarProdPromotion?.buy_quantity}
                      promo_free_qty={similarProdPromotion?.free_quantity}
                      promo_description={similarProdPromoMsg}
                    />
                  )
                })}
              </div>
              {category && (
                <div className="mt-8 text-center">
                  <Button
                    asChild
                    variant="outline"
                    className="border-gray-300 hover:bg-gray-100 text-gray-700 bg-transparent"
                  >
                    <Link href={`/category/${category.id || category.cateid}`}>
                      Вижте всички продукти в категория {category.title}
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Footer */}
        <SiteFooter categories={categories || []} isEnglish={false} />
      </div>
    )
  } catch (error) {
    console.error("Error in product page:", error)
    return (
      <div className="min-h-screen bg-gray-100 text-gray-800 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
          <h1 className="text-3xl font-bold mb-4 text-red-600">Грешка при зареждане на продукта</h1>
          <p className="text-gray-600 mb-6">
            Възникна проблем при зареждането на информацията за този продукт. Моля, опитайте отново по-късно.
          </p>
          <Button asChild className="bg-red-600 hover:bg-red-700 text-white">
            <Link href="/">Към началната страница</Link>
          </Button>
        </div>
      </div>
    )
  }
}
