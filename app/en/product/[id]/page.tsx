import { Suspense } from "react"
import Link from "next/link"
import Image from "next/image"
import { ChevronRight, Tag, Package, Layers, Hash, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
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

function formatDisplayPrice(price: number | null | undefined): string {
  if (price === null || price === undefined || isNaN(Number(price))) {
    return "N/A"
  }
  return Number(price).toFixed(2)
}

function convertBgnToEur(bgnPrice: number | null | undefined): number | null {
  if (bgnPrice === null || bgnPrice === undefined || isNaN(Number(bgnPrice))) {
    return null
  }
  return Number(bgnPrice) / 1.96
}

async function ProductContent({ productId }: { productId: string }) {
  try {
    if (!productId || productId === "null" || productId === "undefined" || productId.trim() === "") {
      return (
        <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-6">
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 mb-3">Product not found</h1>
            <p className="text-neutral-500 mb-8 leading-relaxed">
              Sorry, but the product you are looking for does not exist.
            </p>
            <Button asChild className="rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white px-8 py-3">
              <Link href="/en">Back to homepage</Link>
            </Button>
          </div>
        </div>
      )
    }

    const product = await getProductById(productId)
    if (!product) {
      return (
        <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-6">
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 mb-3">Product not found</h1>
            <p className="text-neutral-500 mb-8 leading-relaxed">
              Sorry, but the product you are looking for does not exist.
            </p>
            <Button asChild className="rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white px-8 py-3">
              <Link href="/en">Back to homepage</Link>
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
    const subcategory = product?.subcateid ? await getSubcategoryById(product.subcateid).catch(() => null) : null

    const similarProducts = product?.cateid
      ? (await getProductsByCategory(product.cateid).catch(() => []))
          .filter((p) => p["Document ID"] !== product["Document ID"])
          .slice(0, 8)
      : []

    const englishCategories = (categories || []).map((cat) => ({
      ...cat,
      title: cat.title_en || cat.title,
    }))

    const isEuropeanCustomer = () => {
      const type = user?.customerType?.toLowerCase()
      return type === "european" || type === "europen"
    }

    const getBasePriceForCustomer = (): number | null => {
      if (!isUserLoggedIn) {
        return Number(product.price)
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
        return Number(product.price)
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

    const displayTitle = product.title_en || product.title
    const displayDescription = product.description_en || product.description
    const categoryTitle = category?.title_en || category?.title
    const subcategoryTitle = subcategory?.title_en || subcategory?.title

    return (
      <div className="min-h-screen bg-neutral-50 text-neutral-900">
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
        <div className="border-b border-neutral-200/60 py-3.5">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-1.5 text-sm text-neutral-400">
              <Link href="/en" className="transition-colors hover:text-neutral-700">
                Home
              </Link>
              <ChevronRight className="h-3.5 w-3.5" />
              {category && (
                <>
                  <Link href={`/en/category/${category.id}`} className="transition-colors hover:text-neutral-700">
                    {categoryTitle}
                  </Link>
                  <ChevronRight className="h-3.5 w-3.5" />
                </>
              )}
              {subcategory && (
                <>
                  <Link href={`/en/subcategory/${subcategory.id}`} className="transition-colors hover:text-neutral-700">
                    {subcategoryTitle}
                  </Link>
                  <ChevronRight className="h-3.5 w-3.5" />
                </>
              )}
              <span className="text-neutral-700 font-medium truncate max-w-[200px]">{displayTitle}</span>
            </div>
          </div>
        </div>

        {/* Product Detail Section */}
        <section className="py-10 md:py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">

              {/* Image Gallery */}
              <div className="relative">
                <div className="sticky top-8">
                  <div className="aspect-square relative rounded-3xl bg-white border border-neutral-200/60 overflow-hidden shadow-sm">
                    <Image
                      src={
                        product.photourl ||
                        `/placeholder.svg?height=700&width=700&query=${encodeURIComponent(displayTitle || "fishing equipment")}`
                      }
                      alt={displayTitle}
                      fill
                      className="object-contain p-8 md:p-12"
                      priority
                    />

                    {promotionDisplayMessage && (
                      <div className="absolute left-4 top-4 z-10">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500 px-3 py-1.5 text-xs font-semibold tracking-wide text-white shadow-lg shadow-amber-500/20">
                          <Tag className="h-3.5 w-3.5" />
                          {promotionDisplayMessage}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Product Info */}
              <div className="flex flex-col">
                {/* Title */}
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-neutral-900 leading-tight text-balance">
                  {displayTitle}
                </h1>

                {/* Price Block */}
                <div className="mt-6 pb-6 border-b border-neutral-200/60">
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400 mb-2">
                    {getPriceLabel()}
                  </p>
                  {isUserLoggedIn ? (
                    <>
                      {priceToDisplay !== null ? (
                        <div className="flex items-baseline gap-3">
                          <span className="text-4xl font-bold tracking-tight text-neutral-900">
                            {formatDisplayPrice(priceToDisplay)}
                            <span className="text-xl font-semibold text-neutral-500 ml-1">BGN</span>
                          </span>
                          {eurPrice !== null && (
                            <span className="text-lg text-neutral-400 font-medium">
                              {formatDisplayPrice(eurPrice)} {"€"}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-4xl font-bold text-neutral-300">N/A</span>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="flex items-baseline gap-3">
                        <span className="text-4xl font-bold tracking-tight text-neutral-900">
                          {formatDisplayPrice(Number(product.price))}
                          <span className="text-xl font-semibold text-neutral-500 ml-1">BGN</span>
                        </span>
                        <span className="text-lg text-neutral-400 font-medium">
                          {formatDisplayPrice(convertBgnToEur(Number(product.price)))} {"€"}
                        </span>
                      </div>
                      <p className="text-sm text-neutral-500 mt-3 leading-relaxed">
                        Register or log in to your profile for special prices and discounts.
                      </p>
                    </>
                  )}
                </div>

                {/* Description */}
                {displayDescription && (
                  <div className="mt-6 pb-6 border-b border-neutral-200/60">
                    <p className="text-neutral-600 leading-relaxed whitespace-pre-wrap text-[15px]">
                      {displayDescription}
                    </p>
                  </div>
                )}

                {/* Add to Cart */}
                <div className="mt-6 pb-6 border-b border-neutral-200/60">
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

                {/* Product Meta */}
                <div className="mt-6 space-y-3">
                  {category && (
                    <div className="flex items-center gap-3 text-sm">
                      <Layers className="h-4 w-4 text-neutral-400 shrink-0" />
                      <span className="text-neutral-500">Category:</span>
                      <Link href={`/en/category/${category.id}`} className="font-medium text-neutral-700 hover:text-neutral-900 transition-colors">
                        {categoryTitle}
                      </Link>
                    </div>
                  )}
                  {subcategory && (
                    <div className="flex items-center gap-3 text-sm">
                      <Package className="h-4 w-4 text-neutral-400 shrink-0" />
                      <span className="text-neutral-500">Subcategory:</span>
                      <Link href={`/en/subcategory/${subcategory.id}`} className="font-medium text-neutral-700 hover:text-neutral-900 transition-colors">
                        {subcategoryTitle}
                      </Link>
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-sm">
                    <Hash className="h-4 w-4 text-neutral-400 shrink-0" />
                    <span className="text-neutral-500">Product Code:</span>
                    <span className="font-mono text-neutral-700">{product["Document ID"] || product.objectid}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span className="text-neutral-500">Availability:</span>
                    <span className="font-medium text-emerald-600">In Stock</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Similar Products */}
        {similarProducts.length > 0 && (
          <section className="py-12 md:py-16 border-t border-neutral-200/60">
            <div className="container mx-auto px-4">
              <div className="mb-10">
                <h2 className="text-2xl font-bold tracking-tight text-neutral-900">Similar Products</h2>
                <p className="text-neutral-500 mt-1.5 text-sm">
                  Browse other products from this category
                </p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
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
                <div className="mt-10 text-center">
                  <Button
                    asChild
                    variant="outline"
                    className="rounded-xl border-neutral-300 hover:bg-neutral-100 text-neutral-700 bg-transparent px-8 py-3 font-medium"
                  >
                    <Link href={`/en/category/${category.id}`}>View all products in {categoryTitle} category</Link>
                  </Button>
                </div>
              )}
            </div>
          </section>
        )}

        <SiteFooter categories={englishCategories} isEnglish={true} />
      </div>
    )
  } catch (error) {
    console.error("Error loading product page:", error)
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8 bg-white rounded-2xl border border-neutral-200/60 shadow-sm">
          <h1 className="text-2xl font-bold tracking-tight text-red-600 mb-3">Error loading product</h1>
          <p className="text-neutral-500 mb-8 leading-relaxed">
            There was a problem loading the information for this product. Please try again later.
          </p>
          <Button asChild className="rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white px-8 py-3">
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
        <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
          <div className="text-center">
            <div className="h-10 w-10 rounded-full border-2 border-neutral-200 border-t-neutral-600 animate-spin mx-auto mb-4" />
            <p className="text-neutral-500 text-sm">Loading product...</p>
          </div>
        </div>
      }
    >
      <ProductContent productId={params.id} />
    </Suspense>
  )
}
