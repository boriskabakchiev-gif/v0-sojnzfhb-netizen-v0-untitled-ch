"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PhoneIcon, MailIcon, ClockIcon } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { CategoriesNavbar } from "@/components/categories-navbar"

interface ContactPageProps {
  categories: any[]
  subcategories: any[]
}

export default function ContactPageClient({ categories, subcategories }: ContactPageProps) {
  return (
    <>
      <SiteHeader categories={categories} subcategories={subcategories} isEnglish={true} />
      <CategoriesNavbar isEnglish={true} categories={categories} />

      <div className="min-h-screen bg-gray-50 text-gray-800 pt-8 pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">Contact Us</h1>
              <p className="text-lg text-gray-600 text-center mb-10 md:mb-12">
                Have questions or need help? Don't hesitate to contact us. Our team is available to assist you.
              </p>
            </div>

            {/* Main Contact Information Section */}
            <div className="max-w-md mx-auto space-y-8">
              {" "}
              {/* Improved container */}
              <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-gray-900 flex items-center">
                    <ClockIcon className="h-6 w-6 mr-3 text-red-600" />
                    Working Hours
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-gray-700">
                  <p>
                    <span className="font-medium text-gray-800">Working hours:</span> 08:00 - 17:00
                  </p>
                  <p>
                    <span className="font-medium text-gray-800">Days off:</span> Saturday and Sunday
                  </p>
                </CardContent>
              </Card>
              <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 w-full">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-gray-900 text-center">Direct Contact</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-center">
                  <div className="flex flex-col items-center">
                    <a href="tel:+359894352204" aria-label="Call +359 894 352204" className="inline-block">
                      <div className="bg-red-100 p-3 rounded-full mb-2 hover:bg-red-200 transition-colors">
                        <PhoneIcon className="h-7 w-7 text-red-600" />
                      </div>
                    </a>
                    <h3 className="font-medium text-gray-900 mb-1">Phone</h3>
                    <a href="tel:+359894352204" className="text-red-600 hover:text-red-700 transition-colors">
                      +359 894 352204
                    </a>
                  </div>
                  <div className="flex flex-col items-center">
                    <a href="mailto:info@madiks.bg" aria-label="Send email to info@madiks.bg" className="inline-block">
                      <div className="bg-red-100 p-3 rounded-full mb-2 hover:bg-red-200 transition-colors">
                        <MailIcon className="h-7 w-7 text-red-600" />
                      </div>
                    </a>
                    <h3 className="font-medium text-gray-900 mb-1">Email</h3>
                    <a href="mailto:info@madiks.bg" className="text-red-600 hover:text-red-700 transition-colors">
                      info@madiks.bg
                    </a>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Why Choose Us?</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-gray-600">
                    <li className="flex items-start">
                      <span className="inline-block w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      High quality products at competitive prices
                    </li>
                    <li className="flex items-start">
                      <span className="inline-block w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Fast and reliable delivery
                    </li>
                    <li className="flex items-start">
                      <span className="inline-block w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Professional customer service
                    </li>
                    <li className="flex items-start">
                      <span className="inline-block w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Years of experience in the industry
                    </li>
                    <li className="flex items-start">
                      <span className="inline-block w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Individual approach to each client
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
