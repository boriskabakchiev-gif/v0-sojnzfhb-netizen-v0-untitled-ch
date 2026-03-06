import Link from "next/link"
import Image from "next/image"
import { ChevronRight, Tag, Package, Layers, Hash, CheckCircle2, Phone } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  getCategories,
  getCategoryById,
  getProductById,
  getProductsByCategory,
  getSubcategories,
  getActiveQuantityPromotionForSubcategory,
  getProductRatingSummary,
} from "@/lib/db"
import { StarRating } from "@/components/star-rating"
import { ProductReviewsSection } from "@/components/product-reviews-section"
import { getUser } from "@/lib/auth"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { CategoriesNavbar } from "@/components/categories-navbar"
import { ProductCard } from "@/components/product-card"
import { ProductQuantityControls } from "@/components/product-quantity-controls"

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

export default async function ProductPage({ params }: { params: { id: string } }) {
  try {
    const productId = params.id

    if (!productId || productId === "null" || productId === "undefined") {
      return (
        <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-6">
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 mb-3">
              Продуктът не е намерен
            </h1>
            <p className="text-neutral-500 mb-8 leading-relaxed">
              Съжаляваме, но търсеният от вас продукт не съществува.
            </p>
            <Button asChild className="rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white px-8 py-3">
              <Link href="/">Към началната страница</Link>
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
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 mb-3">
              Продуктът не е намерен
            </h1>
            <p className="text-neutral-500 mb-8 leading-relaxed">
              Съжаляваме, но търсеният от вас продукт не съществува.
            </p>
            <Button asChild className="rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white px-8 py-3">
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

    const ratingSummary = await getProductRatingSummary(product.objectid).catch(() => null)

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
      <div className="min-h-screen bg-neutral-50 text-neutral-900">
        <SiteHeader
          categories={categories}
          subcategories={allSubcategories}
          currentCategoryId={product?.cateid}
          isLoggedIn={isUserLoggedIn}
          userName={user?.name || user?.storeName || ""}
        />

        <CategoriesNavbar currentCategoryId={product?.cateid} isEnglish={false} />

        {/* Breadcrumb */}
        <div className="border-b border-neutral-200/60 py-3.5">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-1.5 text-sm text-neutral-400">
              <Link href="/" className="transition-colors hover:text-neutral-700">
                Начало
              </Link>
              <ChevronRight className="h-3.5 w-3.5" />
              {category && (
                <>
                  <Link href={`/category/${category.id || category.cateid}`} className="transition-colors hover:text-neutral-700">
                    {category.title}
                  </Link>
                  <ChevronRight className="h-3.5 w-3.5" />
                </>
              )}
              {subcategory && (
                <>
                  <Link href={`/subcategory/${subcategory.id}`} className="transition-colors hover:text-neutral-700">
                    {subcategory.title}
                  </Link>
                  <ChevronRight className="h-3.5 w-3.5" />
                </>
              )}
              <span className="text-neutral-700 font-medium truncate max-w-[200px]">{product.title}</span>
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
                        `/placeholder.svg?height=700&width=700&query=${encodeURIComponent(product.title || "fishing equipment")}`
                      }
                      alt={product.title}
                      fill
                      className="object-contain p-8 md:p-12"
                      priority
                      unoptimized
                    />

                    {/* Promo badge on image */}
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
                  {product.title}
                </h1>

                {/* Rating */}
                {ratingSummary && ratingSummary.review_count > 0 && (
                  <div className="mt-3">
                    <StarRating
                      rating={ratingSummary.average_rating}
                      size="md"
                      showValue
                      reviewCount={ratingSummary.review_count}
                      isEnglish={false}
                    />
                  </div>
                )}

                {/* Price Block */}
                <div className="mt-6 pb-6 border-b border-neutral-200/60">
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400 mb-2">
                    {getPriceLabel()}
                  </p>
                  {priceToDisplay !== null ? (
                    <div className="flex items-baseline gap-3">
                      {eurPrice !== null && (
                        <span className="text-4xl font-bold tracking-tight text-neutral-900">
                          {formatDisplayPrice(eurPrice)}
                          <span className="text-xl font-semibold text-neutral-500 ml-1">{"€"}</span>
                        </span>
                      )}
                      <span className="text-lg text-neutral-400 font-medium">
                        {formatDisplayPrice(priceToDisplay)} {"лв."}
                      </span>
                    </div>
                  ) : (
                    <span className="text-4xl font-bold text-neutral-300">N/A</span>
                  )}

                  {!isUserLoggedIn && (
                    <p className="text-sm text-neutral-500 mt-3 leading-relaxed">
                      Регистрирайте се или влезте в профила си за специални цени и отстъпки.
                    </p>
                  )}
                </div>

                {/* Description */}
                {product.description && (
                  <div className="mt-6 pb-6 border-b border-neutral-200/60">
                    <p className="text-neutral-600 leading-relaxed whitespace-pre-wrap text-[15px]">
                      {product.description}
                    </p>
                  </div>
                )}

                {/* Add to Cart */}
                <div className="mt-6 pb-6 border-b border-neutral-200/60">
                  <ProductQuantityControls
                    productId={product.objectid}
                    productTitle={product.title}
                    productPrice={priceToDisplay !== null ? priceToDisplay : 0}
                    photoUrl={product.photourl}
                    promo_buy_qty={finalPromoBuyQty}
                    promo_free_qty={finalPromoFreeQty}
                    disabled={priceToDisplay === null}
                  />
                </div>

                {/* Product Meta */}
                <div className="mt-6 space-y-3">
                  {category && (
                    <div className="flex items-center gap-3 text-sm">
                      <Layers className="h-4 w-4 text-neutral-400 shrink-0" />
                      <span className="text-neutral-500">Категория:</span>
                      <Link
                        href={`/category/${category.id || category.cateid}`}
                        className="font-medium text-neutral-700 hover:text-neutral-900 transition-colors"
                      >
                        {category.title}
                      </Link>
                    </div>
                  )}
                  {subcategory && (
                    <div className="flex items-center gap-3 text-sm">
                      <Package className="h-4 w-4 text-neutral-400 shrink-0" />
                      <span className="text-neutral-500">Подкатегория:</span>
                      <Link href={`/subcategory/${subcategory.id}`} className="font-medium text-neutral-700 hover:text-neutral-900 transition-colors">
                        {subcategory.title}
                      </Link>
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-sm">
                    <Hash className="h-4 w-4 text-neutral-400 shrink-0" />
                    <span className="text-neutral-500">Код на продукта:</span>
                    <span className="font-mono text-neutral-700">{product.objectid}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span className="text-neutral-500">Наличност:</span>
                    <span className="font-medium text-emerald-600">В наличност</span>
                  </div>
                </div>

                {/* Call Button */}
                <div className="mt-6 pt-6 border-t border-neutral-200/60">
                  <p className="text-sm text-neutral-500 mb-3">Имате въпроси? Обадете се на:</p>
                  <a
                    href="tel:+359894352204"
                    className="inline-flex items-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-colors"
                  >
                    <Phone className="h-5 w-5" />
                    +359 894 352 204
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Reviews Section */}
        <ProductReviewsSection productId={product.objectid} isEnglish={false} />

        {/* Similar Products */}
        {similarProducts.length > 0 && (
          <section className="py-12 md:py-16 border-t border-neutral-200/60">
            <div className="container mx-auto px-4">
              <div className="mb-10">
                <h2 className="text-2xl font-bold tracking-tight text-neutral-900">
                  Подобни продукти
                </h2>
                <p className="text-neutral-500 mt-1.5 text-sm">
                  Разгледайте други продукти от тази категория
                </p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
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
                      price={Number(similarProd.price) || 0}
                      retailerprice={Number(similarProd.retailerprice)}
                      wholesalerprice={Number(similarProd.wholesalerprice)}
                      europe_price={Number(similarProd.europe_price)}
                      photourl={similarProd.photourl}
                      isLoggedIn={isUserLoggedIn}
                      customerType={user?.customerType}
                      promo_buy_qty={similarProdPromotion?.buy_quantity}
                      promo_free_qty={similarProdPromotion?.free_quantity}
                      promo_description={similarProdPromoMsg}
                    />
                  )
                })}
              </div>
              {category && (
                <div className="mt-10 text-center">
                  <Button
                    asChild
                    variant="outline"
                    className="rounded-xl border-neutral-300 hover:bg-neutral-100 text-neutral-700 bg-transparent px-8 py-3 font-medium"
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

        <SiteFooter categories={categories || []} isEnglish={false} />
      </div>
    )
  } catch (error) {
    console.error("Error in product page:", error)
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8 bg-white rounded-2xl border border-neutral-200/60 shadow-sm">
          <h1 className="text-2xl font-bold tracking-tight text-red-600 mb-3">
            Грешка при зареждане на продукта
          </h1>
          <p className="text-neutral-500 mb-8 leading-relaxed">
            Възникна проблем при зареждането на информацията за този продукт. Моля, опитайте отново по-късно.
          </p>
          <Button asChild className="rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white px-8 py-3">
            <Link href="/">Към началната страница</Link>
          </Button>
        </div>
      </div>
    )
  }
}
