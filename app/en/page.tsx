import Link from "next/link"
import Image from "next/image"
import { TrendingUp, Award, Gift, Globe, Truck, BadgePercent, ShieldCheck, Handshake } from "lucide-react"
import { CategoriesNavbar } from "@/components/categories-navbar"
import { Button } from "@/components/ui/button"
import { getCategories, getSubcategories, getHomePageImage } from "@/lib/db"
import { SiteHeader } from "@/components/site-header"
import { getUser } from "@/lib/auth"
import { sql } from "@/lib/db"
import { ProductCard } from "@/components/product-card"

// Маркираме страницата като динамична
export const dynamic = "force-dynamic"

export default async function EnglishHome() {
  const locale = "en" // English locale

  // Fetch data from the database
  const categories = await getCategories()
  const allSubcategories = await getSubcategories()
  const homePageImageUrl = await getHomePageImage()

  // Transform categories to use English titles, with proper null checking
  const englishCategories = (categories || []).map((category) => ({
    ...category,
    title: category.title_en || category.title, // Use title_en if available, fallback to title
  }))

  // Use fetched URL or a fallback
  const heroImageUrl =
    homePageImageUrl ||
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/20250510_1413_%D0%A0%D0%B5%D0%BA%D0%BB%D0%B0%D0%BC%D0%B5%D0%BD%20%D0%B1%D0%B0%D0%BD%D0%B5%D1%80%20%D0%B7%D0%B0%D1%85%D1%80%D0%B0%D0%BD%D0%BA%D0%B8_remix_01jtwyb7wwfm9ak0k3cm6xegsp-brtsohEHLLbW96IHzoNdSM5bsYa1G4.png"

  // Извличане на информация за потребителя
  const user = await getUser()
  const isLoggedIn = !!user
  const userRole = user?.role || null

  // Calculate products for exactly 4 rows on desktop (lg breakpoint has 4 columns)
  const desktopColumns = 4
  const numberOfRows = 4
  const totalProducts = desktopColumns * numberOfRows // 16 products for 4 rows on desktop

  // Извличане на точно определен брой произволни продукта за 4 реда на десктоп
  const featuredProducts = await sql`
SELECT 
objectid as id, 
title_en, 
description_en, 
price, 
retailerprice, 
wholesalerprice, 
photourl,
createdat
FROM new_products
WHERE deleted = false
ORDER BY RANDOM()
LIMIT ${totalProducts}
`

  // Извличане на продукти за всяка категория, за да вземем снимки
  const categoryProductsMap = new Map()

  for (const category of englishCategories) {
    try {
      const products = await sql`
SELECT objectid, photourl
FROM new_products
WHERE cateid = ${category.id} AND photourl IS NOT NULL AND photourl != ''
LIMIT 1
`
      if (products.length > 0) {
        categoryProductsMap.set(category.id, products[0].photourl)
      }
    } catch (error) {
      console.error(`Error fetching products for category ${category.id}:`, error)
    }
  }

  // Проверяваме дали потребителят е логнат
  const isUserLoggedIn = !!user

  // Функция за избор на подходяща снимка според категорията
  const getCategoryImage = (category: { id: string; title: string; photourl?: string }) => {
    // Първо проверяваме дали имаме снимка на продукт от тази категория
    const productImage = categoryProductsMap.get(category.id)
    if (productImage) return productImage

    // Ако имаме снимка на категорията, използваме нея
    if (category.photourl) return category.photourl

    // Съпоставяме категориите със съответните изображения
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

    // Връщаме специфично изображение ако има съвпадение, иначе използваме общо
    return categoryImages[category.title] || "/images/category-default.png"
  }

  // Функция за определяне дали продуктът е нов (създаден през последните 14 дни)
  const isNewProduct = (createdAt: string) => {
    const productDate = new Date(createdAt)
    const twoWeeksAgo = new Date()
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)
    return productDate > twoWeeksAgo
  }

  // Функция за генериране на случайна отстъпка за някои продукти
  const getRandomDiscount = () => {
    // 20% от продуктите ще имат отстъпка
    if (Math.random() < 0.2) {
      // Отстъпки между 5% и 30%
      return Math.floor(Math.random() * 26) + 5
    }
    return 0
  }

  return (
    <div className="bg-gray-100 text-gray-800">
      {/* Header - променен на по-светъл сив */}
      <div className="bg-gray-700">
        <SiteHeader categories={englishCategories} subcategories={allSubcategories || []} />

        {/* Динамична лента с категории, която се обновява при всяко зареждане */}
        <CategoriesNavbar isEnglish={true} />
      </div>

      {/* Hero Section - с новото изображение като background */}
      <section
        className="relative bg-amber-800 text-white"
        style={{
          backgroundImage: `url('${heroImageUrl}')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent"></div>

        {/* Content container with responsive padding */}
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col justify-center min-h-[60vh] md:min-h-[70vh] py-16 md:py-24 lg:py-32">
            <div className="max-w-xl md:max-w-2xl">
              <div className="inline-block mb-4 rounded-full bg-amber-600/30 px-3 py-1 text-sm font-medium text-amber-200 backdrop-blur-sm">
                Professional fishing tackle
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 text-white leading-tight">
                Welcome to the world of <span className="text-amber-400">fishing</span>
              </h1>
              <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 text-amber-100 md:pr-16 leading-relaxed">
                High-quality products from Bulgaria's largest groundbait factory
              </p>
            </div>
          </div>
        </div>

        {/* Статистики секция - responsive grid */}
        <div className="relative z-10 backdrop-blur-md bg-black/30 border-t border-amber-800/50">
          <div className="container mx-auto py-4 sm:py-6 px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              <div className="text-center">
                <div className="flex items-center justify-center mb-1 sm:mb-2">
                  <Award className="h-5 w-5 sm:h-6 sm:w-6 text-amber-400 mr-2" />
                  <span className="text-xl sm:text-2xl font-bold text-white">30</span>
                </div>
                <p className="text-xs sm:text-sm text-amber-200">Years of experience</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-1 sm:mb-2">
                  <Gift className="h-5 w-5 sm:h-6 sm:w-6 text-amber-400 mr-2" />
                  <span className="text-xl sm:text-2xl font-bold text-white">1000+</span>
                </div>
                <p className="text-xs sm:text-sm text-amber-200">Products</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-1 sm:mb-2">
                  <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-amber-400 mr-2" />
                  <span className="text-xl sm:text-2xl font-bold text-white">2M+</span>
                </div>
                <p className="text-xs sm:text-sm text-amber-200">Satisfied customers annually</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-1 sm:mb-2">
                  <Globe className="h-5 w-5 sm:h-6 sm:w-6 text-amber-400 mr-2" />
                  <span className="text-xl sm:text-2xl font-bold text-white">10+</span>
                </div>
                <p className="text-xs sm:text-sm text-amber-200">Export countries</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories - обновена секция със снимки на продукти от категориите - по-светъл фон */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 sm:mb-12">
            <div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-3 text-gray-800">Our categories</h2>
              <p className="text-sm sm:text-base text-gray-600 max-w-2xl">
                Explore our rich collection of fishing tackle, organized into convenient categories
              </p>
            </div>
          </div>

          {/* Обновен grid с 2 колони по подразбиране, дори на мобилни устройства */}
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
            {englishCategories.map((category) => (
              <Link key={category.id} href={`/en/category/${category.id}`}>
                <div className="group relative overflow-hidden rounded-xl shadow-md border border-gray-200 h-full transition-all duration-300 hover:shadow-lg hover:border-gray-300">
                  <div className="aspect-[4/3] relative bg-white">
                    <Image
                      src={getCategoryImage(category) || "/placeholder.svg"}
                      alt={category.title}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="object-contain transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/70 via-gray-900/40 to-transparent opacity-80 group-hover:opacity-70 transition-opacity duration-300"></div>
                  </div>
                  <div className="absolute bottom-0 left-0 p-3 sm:p-4 w-full z-10">
                    <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold mb-1 sm:mb-2 md:mb-4 text-white group-hover:text-amber-400 transition-colors duration-300 line-clamp-2">
                      {category.title}
                    </h3>
                    <div className="flex items-center justify-between">
                      <Button
                        className="bg-amber-600 hover:bg-amber-700 text-white py-1 px-2 md:py-2 md:px-4 rounded-full text-xs sm:text-sm"
                        size="sm"
                      >
                        View
                      </Button>
                      <span className="text-xs md:text-sm text-gray-200 group-hover:text-white transition-colors duration-300">
                        {Math.floor(Math.random() * 100) + 50}+
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Products Section - Improved Design - по-светъл фон */}
      <section className="py-12 sm:py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 sm:mb-12">
            <div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-3 text-gray-800">
                Featured products
              </h2>
              <p className="text-sm sm:text-base text-gray-600 max-w-2xl">
                Discover our selection of high-quality fishing products, specially selected for you
              </p>
            </div>
          </div>

          {/* Products grid - Оптимизиран за точно 4 реда на десктоп */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {(featuredProducts || []).map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                title={product.title_en || product.title || "Product"}
                description={product.description_en || product.description || ""}
                price={product.price}
                retailerprice={product.retailerprice}
                wholesalerprice={product.wholesalerprice}
                photourl={product.photourl}
                isLoggedIn={isLoggedIn}
                customerType={user?.customerType}
                discountPercent={user?.discountPercent}
                isNew={product.createdat ? isNewProduct(product.createdat) : false}
                discount={getRandomDiscount()}
                isEnglish={true}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Social Media Section - New Section */}
      <section className="py-12 sm:py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-4 text-gray-800">Follow us</h2>
            <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">
              Stay up to date with our news, promotions and fishing tips
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 max-w-4xl mx-auto">
            {/* Facebook */}
            <a
              href="https://www.facebook.com/madiksbg"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 group"
            >
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-blue-600 group-hover:text-blue-700 transition-colors"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-800 group-hover:text-blue-600 transition-colors">Facebook</h3>
              <p className="text-sm text-gray-500 mt-1">@madiksbg</p>
            </a>

            {/* YouTube */}
            <a
              href="https://www.youtube.com/@madixltd2794"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 group"
            >
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-red-600 group-hover:text-red-700 transition-colors"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M21.582,6.186c-0.23-0.86-0.908-1.538-1.768-1.768C18.254,4,12,4,12,4S5.746,4,4.186,4.418 c-0.86,0.23-1.538,0.908-1.768,1.768C2,7.746,2,12,2,12s0,4.254,0.418,5.814c0.23,0.86,0.908,1.538,1.768,1.768 C5.746,20,12,20,12,20s6.254,0,7.814-0.418c0.861-0.23,1.538-0.908,1.768-1.768C22,16.254,22,12,22,12S22,7.746,21.582,6.186z M10,15.464V8.536L16,12L10,15.464z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-800 group-hover:text-red-600 transition-colors">YouTube</h3>
              <p className="text-sm text-gray-500 mt-1">@madixltd2794</p>
            </a>

            {/* TikTok */}
            <a
              href="https://www.tiktok.com/@madixltd"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 group"
            >
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-black group-hover:text-gray-700 transition-colors"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-800 group-hover:text-gray-700 transition-colors">TikTok</h3>
              <p className="text-sm text-gray-500 mt-1">@madixltd</p>
            </a>

            {/* Instagram */}
            <a
              href="https://www.instagram.com/madiks.bg/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 group"
            >
              <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-purple-600 group-hover:text-purple-700 transition-colors"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2c2.717 0 3.056.01 4.122.06 1.065.05 1.79.217 2.428.465.66.254 1.216.598 1.772 1.153.509.5.902 1.105 1.153 1.772.247.637.415 1.363.465 2.428.047 1.066.06 1.405.06 4.122 0 2.717-.01 3.056-.06 4.122-.05 1.065-.218 1.79-.465 2.428a4.883 4.883 0 0 1-1.153 1.772c-.5.508-1.105.902-1.772 1.153-.637.247-1.363.415-2.428.465-1.066.047-1.405.06-4.122.06-2.717 0-3.056-.01-4.122-.06-1.065-.05-1.79-.218-2.428-.465a4.89 4.89 0 0 1-1.772-1.153 4.904 4.904 0 0 1-1.153-1.772c-.247-.637-.415-1.363-.465-2.428C2.013 15.056 2 14.717 2 12c0-2.717.01-3.056.06-4.122.05-1.066.218-1.79.465-2.428.254-.66.598-1.216 1.153-1.772.5-.509 1.105-.902 1.772-1.153.637-.247 1.363-.415 2.428-.465C8.944 2.013 9.283 2 12 2zm0 1.8c-2.67 0-2.986.01-4.04.058-.976.045-1.505.207-1.858.344-.466.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.048 1.055-.058 1.37-.058 4.041 0 2.67.01 2.986.058 4.04.045.977.207 1.505.344 1.858.182.466.398.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058 2.67 0 2.986-.01 4.04-.058.977-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353-.3-.882-.344-1.857.048-1.055.058-1.37.058-4.041 0-2.67-.01-2.986-.058-4.04-.045-.977-.207-1.505-.344-1.858a3.097 3.097 0 0 0-.748-1.15 3.098 3.098 0 0 0-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.055-.048-1.37-.058-4.041-.058zm0 3.08a5.12 5.12 0 1 1 0 10.24 5.12 5.12 0 0 1 0-10.24zm0 8.44a3.32 3.32 0 1 0 0-6.64 3.32 3.32 0 0 0 0 6.64zm6.52-8.66a1.2 1.2 0 1 1-2.4 0 1.2 1.2 0 0 1 2.4 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-800 group-hover:text-purple-600 transition-colors">
                Instagram
              </h3>
              <p className="text-sm text-gray-500 mt-1">@madiks.bg</p>
            </a>
          </div>
        </div>
      </section>

      {/* Benefits Section - New Section - по-светъл фон */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-4 text-gray-800">Why choose us?</h2>
            <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">
              We are more than manufacturers - we are your partner in fishing adventures
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300 flex flex-col items-center text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-amber-100 flex items-center justify-center mb-4 sm:mb-6">
                <Truck className="h-6 w-6 sm:h-8 sm:w-8 text-amber-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-4 text-gray-800">Free transport</h3>
              <p className="text-sm sm:text-base text-gray-600">
                We provide free transport to every retail outlet in the country.
              </p>
            </div>

            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300 flex flex-col items-center text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-amber-100 flex items-center justify-center mb-4 sm:mb-6">
                <BadgePercent className="h-6 w-6 sm:h-8 sm:w-8 text-amber-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-4 text-gray-800">Competitive prices</h3>
              <p className="text-sm sm:text-base text-gray-600">
                We offer prices that are adapted to the economic situation and the standard of living without affecting
                the quality of the final products.
              </p>
            </div>

            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300 flex flex-col items-center text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-amber-100 flex items-center justify-center mb-4 sm:mb-6">
                <ShieldCheck className="h-6 w-6 sm:h-8 sm:w-8 text-amber-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-4 text-gray-800">High quality</h3>
              <p className="text-sm sm:text-base text-gray-600">
                We maintain a consistently high quality of our products by selecting suppliers and constantly quality
                controlling every stage of production.
              </p>
            </div>

            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300 flex flex-col items-center text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-amber-100 flex items-center justify-center mb-4 sm:mb-6">
                <Handshake className="h-6 w-6 sm:h-8 sm:w-8 text-amber-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-4 text-gray-800">Correctness</h3>
              <p className="text-sm sm:text-base text-gray-600">
                Over the years, we have built an image as a correct partner who works to build long-term business
                relationships with its customers.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
