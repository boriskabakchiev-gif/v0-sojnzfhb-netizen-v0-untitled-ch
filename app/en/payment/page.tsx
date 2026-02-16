import { SiteHeader } from "@/components/site-header"
import { CategoriesNavbar } from "@/components/categories-navbar"
import { getCategories, getSubcategories, transformCategoriesToEnglish } from "@/lib/data"

export const metadata = {
  title: "Payment - Madix",
  description: "Information about the payment process and order conditions in the Madix online store.",
}

export const dynamic = "force-dynamic"

export default async function EnPaymentPage() {
  const categories = await getCategories()
  const allSubcategories = await getSubcategories()

  const englishCategories = transformCategoriesToEnglish(categories)

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader categories={englishCategories} subcategories={allSubcategories} isEnglish={true} />
      <CategoriesNavbar categories={englishCategories} isEnglish={true} />
      <main className="flex-1 container mx-auto px-4 py-8 mt-16">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">Payment</h1>

        <div className="max-w-3xl mx-auto space-y-6 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">1. REGISTRATION</h2>
            <p>Registration on the fishing website is NOT required to place an order.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">2. SHOPPING CART</h2>
            <p>
              Below the product photos and description, there is a <strong>BUY</strong> button, as well as an option to
              specify the desired quantity for purchase. Clicking this button adds the selected quantity of the product
              to a virtual "shopping cart". The contents of the cart are saved until you decide to proceed with the
              purchase. You can view the contents of the cart, add new products, or remove those you do not want. The
              price indicated is for one item and does NOT include the delivery cost to your specified address. From the{" "}
              <strong>CONTINUE SHOPPING</strong> button, you can return to the store and add products to your order.
              Before proceeding to payment, you have the option to use discount codes - coupon code or voucher code, by
              clicking the respective button. Through the <strong>PAYMENT</strong> button, you proceed to the final step
              of shopping.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">3. PAYMENT</h2>
            <p>
              Clicking the <strong>PAYMENT</strong> button takes you to the order procedure, which includes:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>Registering or completing the order as a guest</li>
              <li>Entering a correct and accurate address, first name, last name, and mobile phone number</li>
              <li>Payment and delivery details</li>
              <li>
                When completing the order, you can leave a comment or specific requirement regarding the delivery method
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">4. ORDER CONFIRMATION</h2>
            <p>Our operator will contact you at the provided phone number to confirm the order.</p>
            <p>
              The terms for ordering, delivery, and payment comply with the conditions specified in the Consumer
              Protection Act.
            </p>
            <p>
              An order is an act of action that the consumer makes freely, by their own choice, and binds the consumer
              and the Madix online store with the force of a contract.
            </p>
            <p>
              Payment for the ordered goods is not an advance payment and is accepted as a deposit for the full amount
              of the final product price.
            </p>
            <p>
              Any personal information provided by the consumer or person using the site with free access will be used
              in accordance with the Personal Data Protection Act, and its provision by the consumer is entirely
              voluntary.
            </p>
            <p className="mt-6 text-center font-semibold">Greetings from the Madix team !!!</p>
          </section>
        </div>
      </main>
    </div>
  )
}
