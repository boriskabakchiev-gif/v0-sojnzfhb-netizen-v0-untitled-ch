import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ShieldCheck,
  DollarSign,
  Users,
  Truck,
  Factory,
  Globe,
  TrendingUp,
  CheckCircle,
  Store,
  Briefcase,
  BarChart,
  Building,
  BadgeCheck,
  Rocket,
} from "lucide-react"
import type { Metadata } from "next"
import Image from "next/image"
import { SiteHeader } from "@/components/site-header"
import { CategoriesNavbar } from "@/components/categories-navbar"
import { getCategories, getSubcategories } from "@/lib/db"

export const metadata: Metadata = {
  title: "About Us | Madix Groundbaits",
  description:
    "Learn more about Madix's history, our values and commitment to quality. Manufacturing groundbaits and fishing bait since 1996.",
}

export default async function AboutPage() {
  // Fetch categories and subcategories for navigation
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

  const principles = [
    {
      icon: <ShieldCheck className="w-8 h-8 text-yellow-600" />,
      title: "High Quality",
      description:
        "We maintain consistently high quality of our products through supplier selection and constant quality control at every stage of production.",
    },
    {
      icon: <DollarSign className="w-8 h-8 text-yellow-600" />,
      title: "Attractive Prices",
      description:
        "We offer prices that are aligned with the economic situation and living standards without affecting the quality of the final products.",
    },
    {
      icon: <Users className="w-8 h-8 text-yellow-600" />,
      title: "Integrity",
      description:
        "Over the years we have built an image as a fair partner who works to build long-term business relationships with our clients.",
    },
    {
      icon: <Truck className="w-8 h-8 text-yellow-600" />,
      title: "Free Delivery",
      description: "We provide free transport to every retail outlet in the country.",
    },
  ]

  const milestones = [
    {
      year: "1996",
      title: "Foundation",
      event:
        "Madix company was established as a small family business focused on the production of groundbaits and fishing bait.",
      icon: <CheckCircle className="w-5 h-5 text-green-500" />,
    },
    {
      year: "1999",
      title: "First team and larger facility",
      event: "Expanding the team with the first employees and moving to a larger premises.",
      icon: <Users className="w-5 h-5 text-blue-500" />,
    },
    {
      year: "2003",
      title: "First major clients",
      event: "Some of the largest retailers in Bulgaria began distributing our products throughout the country.",
      icon: <Store className="w-5 h-5 text-orange-500" />,
    },
    {
      year: "2009",
      title: "First clients outside Bulgaria",
      event: "We started cooperation with a large Romanian company, producing part of our products under their brand.",
      icon: <Globe className="w-5 h-5 text-cyan-500" />,
    },
    {
      year: "2012",
      title: "Market expansion",
      event: "We entered several European countries with the Madix brand.",
      icon: <TrendingUp className="w-5 h-5 text-purple-500" />,
    },
    {
      year: "2014",
      title: "Own factory",
      event:
        "We purchased a former soft drink factory with an area of 900 sq.m. and after a short renovation we installed two production lines and started working there.",
      icon: <Factory className="w-5 h-5 text-gray-600" />,
    },
    {
      year: "2018",
      title: "New market expansion",
      event: "We appeared at several European exhibitions and quickly found many new clients throughout Europe.",
      icon: <Briefcase className="w-5 h-5 text-indigo-500" />,
    },
    {
      year: "2022",
      title: "Scale breakthrough",
      event:
        "Some of the largest companies in Europe trusted us and we started producing for various brands in our factory. The volumes became large and the need for reorganization, a larger team and built-up area became urgent.",
      icon: <BarChart className="w-5 h-5 text-red-500" />,
    },
    {
      year: "2023",
      title: "Factory expansion",
      event:
        "The need for built-up area forced us to expand the production area by another 400 sq.m and install 500 sq.m. of mobile halls for raw material storage.",
      icon: <Building className="w-5 h-5 text-teal-500" />,
    },
    {
      year: "Today",
      title: "Established name in Europe",
      event:
        "Today we are an established name in the fishing industry throughout Europe. We have clients from almost every EU country. We have established ourselves as a reliable partner in the production of private label products.",
      icon: <BadgeCheck className="w-5 h-5 text-yellow-500" />,
    },
    {
      year: "The Future",
      title: "Looking ahead",
      event:
        "We have always worked with a long-term perspective and have sought sustainable rather than rapid growth. After 30 years of accumulated experience from two generations managing the family business, we look ahead more confident than ever. Despite the dynamic times we live in, we at Madix are building the future of the company believing that integrity and professionalism will always be in fashion.",
      icon: <Rocket className="w-5 h-5 text-pink-500" />,
    },
  ]

  return (
    <>
      <SiteHeader categories={englishCategories} subcategories={englishSubcategories} isEnglish={true} />
      <CategoriesNavbar isEnglish={true} categories={englishCategories} />

      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-12 md:py-16">
          {/* Hero Section */}
          <section className="mb-16 text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 mb-4">
              Meet <span className="text-yellow-600">Madix Groundbaits</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              Since 1996, we combine passion for fishing with the production of high-quality groundbaits and bait,
              turning hobby into profession.
            </p>
          </section>

          {/* Story Section */}
          <Card className="mb-16 shadow-xl overflow-hidden">
            <div className="md:flex">
              <div className="md:w-1/2 bg-gray-100 flex items-center justify-center p-4">
                <Image
                  src="/images/design-mode/new-madiks.png"
                  alt="Madix Groundbaits Logo"
                  width={400}
                  height={250}
                  className="object-contain"
                />
              </div>
              <div className="md:w-1/2 p-8 md:p-10">
                <CardHeader className="p-0 mb-6">
                  <CardTitle className="text-3xl font-bold text-gray-800">Our Concept</CardTitle>
                </CardHeader>
                <CardContent className="p-0 text-gray-700 space-y-5 leading-relaxed text-base">
                  <p>
                    The main activity of the company is the production of groundbaits and fishing bait. Over the years,
                    we have expanded our product range to meet the needs of every angler, using only high-quality raw
                    materials. The precise proportions in the various recipes have been refined to achieve optimal
                    effectiveness.
                  </p>
                  <p>
                    We tirelessly continue to seek ever newer and more effective solutions so that our products can be
                    useful in every situation that arises during fishing.
                  </p>
                </CardContent>
              </div>
            </div>
          </Card>

          {/* Milestones Section */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-800 text-center mb-10">Key Milestones in Our Development</h2>
            <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:h-full before:w-0.5 before:bg-gray-300 md:before:mx-auto md:before:left-0 md:before:right-0">
              {milestones.map((milestone, index) => (
                <div key={index} className="relative flex items-center md:justify-normal md:odd:flex-row-reverse group">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-gray-300 bg-gray-50 group-hover:border-yellow-500 text-gray-500 group-hover:text-yellow-600 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 transition-colors">
                    {milestone.icon}
                  </div>
                  <div className="w-full ml-6 md:ml-0 md:w-[calc(50%-2.5rem)] md:px-6">
                    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                      <CardContent className="p-6">
                        <p className="text-sm text-gray-500 mb-1">{milestone.year}</p>
                        <p className="font-bold text-yellow-600 text-lg mb-2">{milestone.title}</p>
                        <p className="text-gray-600 text-sm">{milestone.event}</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Principles Section */}
          <section>
            <h2 className="text-3xl font-bold text-gray-800 text-center mb-12">Our Principles</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {principles.map((principle, index) => (
                <Card
                  key={index}
                  className="shadow-lg hover:shadow-xl transition-shadow duration-300 text-center flex flex-col items-center"
                >
                  <CardHeader className="pb-3 pt-6">
                    <div className="bg-yellow-100 p-4 rounded-full mb-3 inline-block">{principle.icon}</div>
                    <CardTitle className="text-xl font-semibold text-gray-800">{principle.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-gray-600 text-sm px-2">{principle.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        </div>
      </div>
    </>
  )
}
