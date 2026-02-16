import { SiteHeader } from "@/components/site-header"
import { CategoriesNavbar } from "@/components/categories-navbar"
import { getCategories, getSubcategories } from "@/lib/data"

export const metadata = {
  title: "Privacy Policy - Madix Fishing Store",
  description: "Privacy policy for Madix fishing store. Learn how we collect, use and protect your personal data.",
}

export default async function PrivacyPage() {
  const categories = await getCategories()
  const subcategories = await getSubcategories()

  // Transform categories to use English titles
  const englishCategories = (categories || []).map((category) => ({
    ...category,
    title: category.title_en || category.title,
  }))

  // Transform subcategories to use English titles
  const englishSubcategories = (subcategories || []).map((subcategory) => ({
    ...subcategory,
    title: subcategory.title_en || subcategory.title,
  }))

  return (
    <>
      <SiteHeader categories={englishCategories} subcategories={englishSubcategories} isEnglish={true} />
      <CategoriesNavbar categories={englishCategories} isEnglish={true} />

      <main className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-6 md:py-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>

            <div className="prose prose-lg max-w-none">
              <p className="text-gray-600 mb-8">
                Last updated:{" "}
                {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
              </p>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. General Provisions</h2>
                <p className="text-gray-700 mb-4">
                  This Privacy Policy describes how we collect, use, process and protect your personal data when you use
                  our website and services. We are committed to protecting your privacy and ensuring the security of
                  your personal information.
                </p>
                <p className="text-gray-700">
                  By using our website, you agree to the collection and use of information in accordance with this
                  policy.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Collection of Personal Data</h2>
                <p className="text-gray-700 mb-4">
                  We collect personal data that you voluntarily provide to us when you:
                </p>
                <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                  <li>Register an account on our website</li>
                  <li>Place an order for products</li>
                  <li>Subscribe to our newsletter</li>
                  <li>Contact us through our contact forms</li>
                  <li>Participate in surveys or promotions</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Types of Data Collected</h2>
                <p className="text-gray-700 mb-4">The types of personal data we may collect include:</p>
                <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                  <li>Name and contact information (email address, phone number)</li>
                  <li>Billing and shipping addresses</li>
                  <li>Payment information (processed securely through third-party providers)</li>
                  <li>Order history and preferences</li>
                  <li>Website usage data and analytics</li>
                  <li>Device information and IP address</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Use of Personal Data</h2>
                <p className="text-gray-700 mb-4">We use your personal data for the following purposes:</p>
                <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                  <li>Processing and fulfilling your orders</li>
                  <li>Providing customer support and responding to inquiries</li>
                  <li>Sending order confirmations and shipping notifications</li>
                  <li>Improving our website and services</li>
                  <li>Sending marketing communications (with your consent)</li>
                  <li>Preventing fraud and ensuring security</li>
                  <li>Complying with legal obligations</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Sharing of Personal Data</h2>
                <p className="text-gray-700 mb-4">
                  We do not sell, trade, or rent your personal data to third parties. We may share your information only
                  in the following circumstances:
                </p>
                <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                  <li>With service providers who assist us in operating our website and conducting business</li>
                  <li>With shipping companies for order delivery</li>
                  <li>With payment processors for transaction processing</li>
                  <li>When required by law or to protect our rights</li>
                  <li>In case of business transfer or merger</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Data Storage</h2>
                <p className="text-gray-700 mb-4">
                  We retain your personal data only for as long as necessary to fulfill the purposes outlined in this
                  policy or as required by law. When data is no longer needed, we securely delete or anonymize it.
                </p>
                <p className="text-gray-700">
                  Your data is stored on secure servers with appropriate technical and organizational measures to
                  protect against unauthorized access, alteration, disclosure, or destruction.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Data Security</h2>
                <p className="text-gray-700 mb-4">
                  We implement appropriate security measures to protect your personal data against unauthorized access,
                  alteration, disclosure, or destruction. These measures include:
                </p>
                <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                  <li>SSL encryption for data transmission</li>
                  <li>Secure server infrastructure</li>
                  <li>Regular security audits and updates</li>
                  <li>Access controls and authentication</li>
                  <li>Employee training on data protection</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Cookies</h2>
                <p className="text-gray-700 mb-4">
                  Our website uses cookies to enhance your browsing experience. Cookies are small text files stored on
                  your device that help us:
                </p>
                <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                  <li>Remember your preferences and settings</li>
                  <li>Analyze website traffic and usage patterns</li>
                  <li>Provide personalized content and recommendations</li>
                  <li>Ensure website security and functionality</li>
                </ul>
                <p className="text-gray-700">
                  You can control cookie settings through your browser preferences. However, disabling cookies may
                  affect website functionality.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Your Rights</h2>
                <p className="text-gray-700 mb-4">You have the following rights regarding your personal data:</p>
                <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                  <li>Right to access your personal data</li>
                  <li>Right to rectify inaccurate or incomplete data</li>
                  <li>Right to erase your personal data</li>
                  <li>Right to restrict processing of your data</li>
                  <li>Right to data portability</li>
                  <li>Right to object to processing</li>
                  <li>Right to withdraw consent</li>
                </ul>
                <p className="text-gray-700">
                  To exercise these rights, please contact us using the information provided below.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Third-Party Links</h2>
                <p className="text-gray-700">
                  Our website may contain links to third-party websites. We are not responsible for the privacy
                  practices or content of these external sites. We encourage you to review the privacy policies of any
                  third-party websites you visit.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Changes to This Policy</h2>
                <p className="text-gray-700">
                  We may update this Privacy Policy from time to time to reflect changes in our practices or legal
                  requirements. We will notify you of any significant changes by posting the updated policy on our
                  website with a new effective date.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Contact Us</h2>
                <p className="text-gray-700">
                  If you have any questions about this Privacy Policy or wish to exercise your rights regarding your
                  personal data, please contact us.
                </p>
              </section>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
