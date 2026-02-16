import { SiteHeader } from "@/components/site-header"
import { CategoriesNavbar } from "@/components/categories-navbar"
import { getCategories, getSubcategories } from "@/lib/data"

export const metadata = {
  title: "Terms and Conditions - Madix Fishing Store",
  description: "Terms and conditions for using Madix fishing store services and products.",
}

export default async function TermsPage() {
  const categories = await getCategories()
  const subcategories = await getSubcategories()

  const englishCategories = categories.map((cat) => ({
    ...cat,
    title: cat.title_en || cat.title,
  }))

  const englishSubcategories = subcategories.map((subcat) => ({
    ...subcat,
    title: subcat.title_en || subcat.title,
  }))

  return (
    <>
      <SiteHeader categories={englishCategories} subcategories={englishSubcategories} isEnglish={true} />
      <CategoriesNavbar categories={englishCategories} isEnglish={true} />

      <main className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-6 md:py-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">Terms and Conditions</h1>

            <div className="prose prose-lg max-w-none">
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. General Provisions</h2>
                <p className="text-gray-700 mb-4">
                  These terms and conditions govern the use of our online fishing store and the purchase of products
                  offered through our website. By using our services, you agree to comply with these terms.
                </p>
                <p className="text-gray-700">
                  We reserve the right to modify these terms at any time. Changes will be effective immediately upon
                  posting on the website.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Orders and Payments</h2>
                <p className="text-gray-700 mb-4">
                  All orders are subject to availability and confirmation. We reserve the right to refuse or cancel any
                  order at our discretion.
                </p>
                <p className="text-gray-700 mb-4">
                  Prices are displayed in Bulgarian Lev (BGN) and include VAT where applicable. Payment must be made in
                  full before dispatch of goods.
                </p>
                <p className="text-gray-700">
                  We accept various payment methods including bank transfer, cash on delivery, and online payment
                  systems.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Delivery</h2>
                <p className="text-gray-700 mb-4">
                  We deliver throughout Bulgaria and to selected European countries. Delivery times and costs vary
                  depending on the destination and shipping method chosen.
                </p>
                <p className="text-gray-700 mb-4">
                  Standard delivery within Bulgaria takes 1-3 business days. Express delivery options are available for
                  urgent orders.
                </p>
                <p className="text-gray-700">
                  Risk of loss and title for products pass to you upon delivery to the carrier.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Returns and Complaints</h2>
                <p className="text-gray-700 mb-4">
                  You have the right to return products within 14 days of receipt without giving any reason, provided
                  the products are in their original condition and packaging.
                </p>
                <p className="text-gray-700 mb-4">
                  Custom-made or personalized products cannot be returned unless they are defective.
                </p>
                <p className="text-gray-700">
                  Return shipping costs are borne by the customer unless the return is due to our error or a defective
                  product.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Warranty</h2>
                <p className="text-gray-700 mb-4">
                  All products come with a manufacturer's warranty as specified by each brand. Warranty periods vary by
                  product type and manufacturer.
                </p>
                <p className="text-gray-700 mb-4">
                  Warranty claims must be accompanied by proof of purchase and are subject to manufacturer's terms and
                  conditions.
                </p>
                <p className="text-gray-700">
                  We act as an intermediary between customers and manufacturers for warranty claims.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Personal Data Protection</h2>
                <p className="text-gray-700 mb-4">
                  We collect and process personal data in accordance with applicable data protection laws and our
                  Privacy Policy.
                </p>
                <p className="text-gray-700 mb-4">
                  Personal data is used solely for order processing, delivery, and customer service purposes.
                </p>
                <p className="text-gray-700">
                  We do not share personal data with third parties except as necessary for order fulfillment or as
                  required by law.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Liability</h2>
                <p className="text-gray-700 mb-4">
                  Our liability is limited to the value of the products purchased. We are not liable for indirect,
                  consequential, or special damages.
                </p>
                <p className="text-gray-700 mb-4">
                  We make every effort to ensure product information is accurate, but we cannot guarantee complete
                  accuracy of all product descriptions and images.
                </p>
                <p className="text-gray-700">
                  Customers are responsible for using products safely and in accordance with manufacturer instructions.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Applicable Law</h2>
                <p className="text-gray-700 mb-4">
                  These terms and conditions are governed by Bulgarian law. Any disputes will be resolved by Bulgarian
                  courts.
                </p>
                <p className="text-gray-700">
                  If any provision of these terms is found to be invalid, the remaining provisions shall remain in full
                  force and effect.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Contact</h2>
                <p className="text-gray-700">For questions regarding these terms and conditions, please contact us.</p>
              </section>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
