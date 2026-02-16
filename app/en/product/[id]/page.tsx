import { Suspense } from "react"
import Link from "next/link"
import Image from "next/image"
import { ChevronRight, Star, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { CategoriesNavbar } from "@/components/categories-navbar"
import { ProductCard } from "@/components/product-card"
import { ProductQuantityControls } from "@/components/product-quantity-controls"
import { getUser } from "@/lib/auth"
import {
  getCategories,
  getSubcategories,
  getProductById,
  getCategoryById,
  getSubcategoryById,
  getProductsByCategory,
  getActiveQuantityPromotionForSubcategory,
} from "@/lib/db"

export const dynamic = "force-dynamic"

interface ProductPageProps {
  params: {
    id: string
  }
}

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

async function ProductContent({ productId }: { productId: string }) {
  try {
    // Enhanced validation for product ID
    if (!productId || productId === "null" || productId === "undefined" || productId.trim() === "") {
      console.warn(`Invalid product ID received: ${productId}`)
      return (
        <div className="min-h-screen bg-gray-100 text-gray-800 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Product not found</h1>
            <p className="text-gray-600 mb-6">Sorry, but the product you are looking for does not exist.</p>
            <Button asChild className="bg-red-600 hover:bg-red-700 text-white">
              <Link href="/en">Back to homepage</Link>
            </Button>
          </div>
        </div>
      )
    }

    // Fetch product
    const product = await getProductById(productId)
    if (!product) {
      return (
        <div className="min-h-screen bg-gray-100 text-gray-800 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Product not found</h1>
            <p className="text-gray-600 mb-6">Sorry, but the product you are looking for does not exist.</p>
            <Button asChild className="bg-red-600 hover:bg-red-700 text-white">
              <Link href="/en">Back to homepage</Link>
            </Button>
          </div>
        </div>
      )
    }

    const categories = await getCategories().catch(() => [])
    const user = await getUser().catch(() => null)
    const isUserLoggedIn = !!user

    // Get subcategory promotion
    const subcategoryPromotion = await getActiveQuantityPromotionForSubcategory(product.subcateid, user?.customerType)

    // Get category and subcategory info
    const category = product?.cateid ? await getCategoryById(product.cateid).catch(() => null) : null
    const allSubcategories = await getSubcategories().catch(() => [])
    const subcategory = product?.subcateid ? await getSubcategoryById(product.subcateid).catch(() => null) : null

    // Get similar products
    const similarProducts = product?.cateid
      ? (await getProductsByCategory(product.cateid).catch(() => []))
          .filter((p) => p["Document ID"] !== product["Document ID"])
          .slice(0, 8)
      : []

    // Transform categories to use English titles
    const englishCategories = (categories || []).map((cat) => ({
      ...cat,
      title: cat.title_en || cat.title,
    }))

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

    const priceToDisplay = getBasePriceForCustomer()
    const eurPrice = convertBgnToEur(priceToDisplay)

    const getPriceLabel = (): string => {
      if (!isUserLoggedIn) return "Standard Price"
      const type = user?.customerType?.toLowerCase()
      if (isEuropeanCustomer()) {
        return priceToDisplay !== null ? "Price for European Customers" : "Price for European Customers (N/A)"
      }
      if (type === "wholesaler" || type === "едро") {
        return priceToDisplay !== null ? "Wholesale Price" : "Wholesale Price (N/A)"
      }
      if (type === "retailer" || type === "дребно") {
        return priceToDisplay !== null ? "Retail Price" : "Retail Price (N/A)"
      }
      return "Standard Price"
    }

    // Handle promotion logic
    let finalPromoBuyQty: number | null | undefined = null
    let finalPromoFreeQty: number | null | undefined = null
    let promotionDisplayMessage: string | null = null

    if (subcategoryPromotion && subcategoryPromotion.buy_quantity > 0 && subcategoryPromotion.free_quantity >= 0) {
      finalPromoBuyQty = subcategoryPromotion.buy_quantity
      finalPromoFreeQty = subcategoryPromotion.free_quantity

      if (subcategoryPromotion.description) {
        promotionDisplayMessage = subcategoryPromotion.description
      } else if (finalPromoFreeQty > 0) {
        promotionDisplayMessage = `Buy ${finalPromoBuyQty}, Get ${finalPromoFreeQty} Free!`
      } else if (finalPromoBuyQty > 0 && finalPromoFreeQty === 0) {
        promotionDisplayMessage = `Special offer when buying ${finalPromoBuyQty} pcs.`
      }
    }

    // Use English fields
    const displayTitle = product.title_en || product.title
    const displayDescription = product.description_en || product.description
    const categoryTitle = category?.title_en || category?.title
    const subcategoryTitle = subcategory?.title_en || subcategory?.title

    return (
      <div className="min-h-screen bg-gray-100 text-gray-800">
        {/* Header */}
        <div className="bg-gray-700">
          <SiteHeader
            categories={englishCategories}
            subcategories={allSubcategories}
            currentCategoryId={product?.cateid}
            isLoggedIn={isUserLoggedIn}
            userName={user?.name || user?.storeName || ""}
            isEnglish={true}
          />
          <CategoriesNavbar currentCategoryId={product?.cateid} isEnglish={true} />
        </div>

        {/* Breadcrumb */}
        <div className="bg-white border-b border-gray-200 py-4">
          <div className="container mx-auto px-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Link href="/en" className="hover:text-red-600">
                Home
              </Link>
              <ChevronRight className="h-4 w-4" />
              {category && (
                <>
                  <Link href={`/en/category/${category.id}`} className="hover:text-red-600">
                    {categoryTitle}
                  </Link>
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
              {subcategory && (
                <>
                  <Link href={`/en/subcategory/${subcategory.id}`} className="hover:text-red-600">
                    {subcategoryTitle}
                  </Link>
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
              <span className="text-red-600">{displayTitle}</span>
            </div>
          </div>
        </div>

        {/* Product Details */}
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {/* Product Image */}
              <div className="bg-white rounded-lg overflow-hidden shadow-sm">
                <Carousel className="w-full">
                  <CarouselContent>
                    <CarouselItem>
                      <div className="aspect-square relative">
                        <Image
                          src={
                            product.photourl ||
                            `/placeholder.svg?height=600&width=600&query=${encodeURIComponent(displayTitle || "fishing equipment")}`
                          }
                          alt={displayTitle}
                          fill
                          className="object-scale-down p-4"
                        />
                      </div>
                    </CarouselItem>
                  </CarouselContent>
                </Carousel>
              </div>

              {/* Product Info */}
              <div>
                <h1 className="text-3xl font-bold mb-4 text-gray-800">{displayTitle}</h1>

                {/* Rating */}
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

                {/* Price Section */}
                <div className="mb-6">
                  {isUserLoggedIn ? (
                    <>
                      <div className="text-sm text-gray-600 mb-1">{getPriceLabel()}</div>
                      <div className="flex flex-col">
                        <p className="text-3xl font-bold text-red-600">
                          {formatDisplayPrice(priceToDisplay)} {priceToDisplay !== null ? "BGN" : ""}
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
                      <p className="text-sm text-gray-600 mb-1">Standard Price</p>
                      <div className="flex flex-col">
                        <p className="text-3xl font-bold text-red-600">
                          {formatDisplayPrice(Number(product.price))} BGN
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
                        Register or log in to your profile for special prices and discounts.
                      </p>
                    </>
                  )}
                </div>

                {/* Description */}
                {displayDescription && (
                  <div className="mb-8">
                    <p className="text-gray-700 whitespace-pre-wrap">{displayDescription}</p>
                  </div>
                )}

                {/* Add to Cart */}
                <div className="mb-8">
                  <ProductQuantityControls
                    productId={product["Document ID"] || product.objectid}
                    productTitle={displayTitle}
                    productPrice={priceToDisplay !== null ? priceToDisplay : 0}
                    photoUrl={product.photourl}
                    promo_buy_qty={finalPromoBuyQty}
                    promo_free_qty={finalPromoFreeQty}
                    disabled={priceToDisplay === null}
                    isEnglish={true}
                  />
                </div>

                {/* Product Details */}
                <div className="border-t border-gray-200 pt-6">
                  {category && (
                    <div className="flex items-center text-gray-600 mb-2">
                      <span className="w-32">Category:</span>
                      <Link href={`/en/category/${category.id}`} className="text-red-600 hover:underline">
                        {categoryTitle}
                      </Link>
                    </div>
                  )}
                  {subcategory && (
                    <div className="flex items-center text-gray-600 mb-2">
                      <span className="w-32">Subcategory:</span>
                      <Link href={`/en/subcategory/${subcategory.id}`} className="text-red-600 hover:underline">
                        {subcategoryTitle}
                      </Link>
                    </div>
                  )}
                  <div className="flex items-center text-gray-600 mb-2">
                    <span className="w-32">Product Code:</span>
                    <span>{product["Document ID"] || product.objectid}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <span className="w-32">Availability:</span>
                    <span className="text-green-600">In Stock</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Similar Products */}
        {similarProducts.length > 0 && (
          <section className="py-12 bg-white">
            <div className="container mx-auto px-4">
              <h2 className="text-2xl font-bold mb-8 text-gray-800">Similar Products</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {similarProducts.map((similarProd) => (
                  <ProductCard
                    key={similarProd["Document ID"] || similarProd.objectid}
                    id={similarProd["Document ID"] || similarProd.objectid}
                    title={similarProd.title_en || similarProd.title}
                    description={similarProd.description_en || similarProd.description}
                    price={Number(similarProd.price) || 0}
                    retailerprice={Number(similarProd.retailerprice)}
                    wholesalerprice={Number(similarProd.wholesalerprice)}
                    europe_price={Number(similarProd.europe_price)}
                    photourl={similarProd.photourl}
                    isLoggedIn={isUserLoggedIn}
                    customerType={user?.customerType}
                    isEnglish={true}
                  />
                ))}
              </div>
              {category && (
                <div className="mt-8 text-center">
                  <Button
                    asChild
                    variant="outline"
                    className="border-gray-300 hover:bg-gray-100 text-gray-700 bg-transparent"
                  >
                    <Link href={`/en/category/${category.id}`}>View all products in {categoryTitle} category</Link>
                  </Button>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Footer */}
        <SiteFooter categories={englishCategories} isEnglish={true} />
      </div>
    )
  } catch (error) {
    console.error("Error loading product page:", error)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-4 text-red-600">Error loading product</h1>
          <p className="text-gray-600 mb-6">
            There was a problem loading the information for this product. Please try again later.
          </p>
          <Button asChild className="bg-red-600 hover:bg-red-700 text-white">
            <Link href="/en">Back to homepage</Link>
          </Button>
        </div>
      </div>
    )
  }
}

export default function EnglishProductPage({ params }: ProductPageProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading product...</p>
          </div>
        </div>
      }
    >
      <ProductContent productId={params.id} />
    </Suspense>
  )
}
