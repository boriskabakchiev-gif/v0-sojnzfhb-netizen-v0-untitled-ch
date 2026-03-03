import Link from "next/link"
import { getCategories } from "@/lib/db"

interface CategoriesNavbarProps {
  currentCategoryId?: string
  isEnglish?: boolean
  categories?: any[]
}

export async function CategoriesNavbar({
  currentCategoryId,
  isEnglish = false,
  categories: propCategories,
}: CategoriesNavbarProps) {
  try {
    let categories = propCategories

    if (!categories) {
      console.log("CategoriesNavbar - No categories provided as props, fetching from database...")
      categories = await getCategories(true)
    } else {
      console.log("CategoriesNavbar - Using categories from props:", categories.length)
    }

    console.log("CategoriesNavbar - categories:", categories.length)

    const activeCategories = categories.filter((category) => category.id && category.title)

    if (activeCategories.length === 0) {
      console.warn("No active categories")
      return (
        <div className="bg-neutral-950 fixed top-[56px] sm:top-[64px] left-0 right-0 w-full z-[9998] border-b border-white/[0.06]">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="flex items-center h-11">
              <span className="text-neutral-500 text-sm">
                {isEnglish ? "Loading categories..." : "Зареждане на категории..."}
              </span>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className="bg-neutral-950/95 backdrop-blur-xl fixed top-[56px] sm:top-[64px] left-0 right-0 w-full z-[9998] border-b border-white/[0.06]">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-1 h-11 overflow-x-auto scrollbar-none">
            {activeCategories.map((category) => {
              const categoryTitle = isEnglish
                ? category.title_en || category.title
                : category.title
              const isActive = category.id === currentCategoryId

              return (
                <Link
                  key={category.id}
                  href={isEnglish ? `/en/category/${category.id}` : `/category/${category.id}`}
                  className={`
                    relative flex-shrink-0 px-3 py-1.5 rounded-full text-[13px] font-medium
                    transition-all duration-200 whitespace-nowrap
                    ${
                      isActive
                        ? "bg-white text-neutral-900"
                        : "text-neutral-400 hover:text-white hover:bg-white/[0.08]"
                    }
                  `}
                >
                  {categoryTitle}
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error("Error loading categories:", error)
    return (
      <div className="bg-neutral-950 fixed top-[56px] sm:top-[64px] left-0 right-0 w-full z-[9998] border-b border-white/[0.06]">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center h-11">
            <span className="text-red-400 text-sm">
              {isEnglish ? "Error loading categories" : "Грешка при зареждане на категориите"}
            </span>
          </div>
        </div>
      </div>
    )
  }
}
