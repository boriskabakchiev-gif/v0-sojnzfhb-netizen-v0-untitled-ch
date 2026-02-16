import ReturnForm from "@/components/return-form"
import { SiteHeader } from "@/components/site-header"
// import { SiteFooter } from "@/components/site-footer" // Removed this import
import { getCategories, getSubcategories } from "@/lib/data"
import { CategoriesNavbar } from "@/components/categories-navbar"

export const metadata = {
  title: "Shipping and Returns",
  description: "Information about shipping and product return form.",
}

export default async function EnglishDeliveryReturnsPage() {
  const categories = await getCategories()
  const subcategories = await getSubcategories()

  // Transform categories and subcategories to use English titles
  const englishCategories = (categories || []).map((category) => ({
    ...category,
    title: category.title_en || category.title,
  }))
  const englishSubcategories = (subcategories || []).map((subcategory) => ({
    ...subcategory,
    title: subcategory.title_en || subcategory.title,
  }))

  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader categories={englishCategories} subcategories={englishSubcategories} isEnglish={true} />
      <CategoriesNavbar categories={englishCategories} isEnglish={true} />
      <main className="flex-1 container mx-auto px-4 py-8 md:py-12 mt-16">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-8">Shipping and Returns</h1>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Shipping and Returns Information</h2>
          <div className="prose max-w-none">
            <p>
              <strong>1. Delivery</strong> - Delivery is carried out to the address specified by the user and is at
              their expense. Deliveries are made via Econt courier company, and payment is made through the "cash on
              delivery" service. The delivery cost is automatically calculated by the Econt website (
              <a
                href="http://www.econt.com/tariff-calculator/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                http://www.econt.com/tariff-calculator/
              </a>
              ) depending on the weight of the goods. If the client wishes to use another courier company or for
              "delivery on demand", please specify this in the comments field.
            </p>
            <p>
              <strong>2. Delivery Time</strong> - Deliveries of fishing tackle are carried out within 5 business days.
            </p>
            <p>
              <strong>3. Right of Return</strong> - The consumer has the right within 14 days to unconditionally
              withdraw from a distance contract or an off-premises contract, without paying any costs, except for those
              for delivery in case they have chosen a different delivery method than the standard cheapest one for the
              trader, as well as the costs for returning the goods.
            </p>
            <p>
              The product can only be returned in an undamaged condition and in its preserved original packaging. Please
              do not damage the original packaging !!!
            </p>
            <p>
              If you wish to exercise your right of return, please contact us by phone: +359 894 722 344 or by e-mail:{" "}
              <a href="mailto:sales@myfish.bg" className="text-blue-600 hover:underline">
                sales@myfish.bg
              </a>{" "}
              and we will send you Annex №6 of the Consumer Protection Act, with which to return the goods.
            </p>
            <p>In case of refusal of the goods, we will cover the transport costs only if:</p>
            <ul className="list-disc pl-6">
              <li>the pre-agreed delivery period has not been met;</li>
              <li>the delivered goods clearly do not correspond to what the client ordered;</li>
              <li>the price does not correspond to the offered one;</li>
            </ul>
            <p className="mt-4">Greetings from the Madix team !!!</p>
          </div>
        </section>
        <section>
          <h2 className="text-2xl font-semibold mb-4">Product Return Request</h2>
          <ReturnForm isEnglish={true} />
        </section>
      </main>
      {/* <SiteFooter categories={englishCategories} isEnglish={true} /> Removed this line */}
    </div>
  )
}
