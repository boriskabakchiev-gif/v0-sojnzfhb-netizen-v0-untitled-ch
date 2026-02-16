import Link from "next/link"
import { getCategories } from "@/lib/db"

interface CategoriesNavbarProps {
  currentCategoryId?: string
  isEnglish?: boolean
  categories?: any[] // Add categories prop
}

export async function CategoriesNavbar({
  currentCategoryId,
  isEnglish = false,
  categories: propCategories,
}: CategoriesNavbarProps) {
  try {
    // Use provided categories or fetch them if not provided
    let categories = propCategories

    if (!categories) {
      console.log("CategoriesNavbar - No categories provided as props, fetching from database...")
      categories = await getCategories(true)
    } else {
      console.log("CategoriesNavbar - Using categories from props:", categories.length)
    }

    console.log("CategoriesNavbar - извлечени категории:", categories.length)
    console.log(
      "CategoriesNavbar - категории:",
      categories.map((c) => ({
        id: c.id,
        title: c.title,
        title_en: c.title_en,
      })),
    )

    // Филтрираме само активните категории с валидни ID-та
    const activeCategories = categories.filter((category) => category.id && category.title)

    if (activeCategories.length === 0) {
      console.warn("Няма активни категории за показване")
      return (
        <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 fixed top-[72px] left-0 right-0 w-full z-[9998] shadow-lg">
          <div className="container mx-auto px-4">
            <div className="flex space-x-6 py-4">
              <span className="text-gray-400 text-sm font-medium">
                {isEnglish ? "Loading categories..." : "Зареждане на категории..."}
              </span>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 fixed top-[60px] left-0 right-0 w-full z-[9998] shadow-lg backdrop-blur-sm">
        <div className="container mx-auto px-4 overflow-x-auto">
          <div className="flex space-x-8 py-4 whitespace-nowrap">
            {activeCategories.map((category) => {
              const categoryTitle = isEnglish ? category.title_en || category.title : category.title
              const isActive = category.id === currentCategoryId

              return (
                <Link
                  key={category.id}
                  href={isEnglish ? `/en/category/${category.id}` : `/category/${category.id}`}
                  className={`
                    relative text-sm font-semibold transition-all duration-300 flex-shrink-0 px-3 py-2 rounded-lg
                    ${
                      isActive
                        ? "text-yellow-400 bg-yellow-400/10 shadow-md border border-yellow-400/20"
                        : "text-gray-200 hover:text-yellow-300 hover:bg-gray-700/50"
                    }
                    hover:scale-105 hover:shadow-lg transform
                  `}
                >
                  {categoryTitle}
                  {isActive && (
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-yellow-400 rounded-full shadow-lg"></div>
                  )}
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error("Грешка при зареждане на категориите в навигацията:", error)
    return (
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 fixed top-[60px] left-0 right-0 w-full z-[9998] shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex space-x-6 py-4">
            <span className="text-red-400 text-sm font-medium">
              {isEnglish ? "Error loading categories" : "Грешка при зареждане на категориите"}
            </span>
          </div>
        </div>
      </div>
    )
  }
}
