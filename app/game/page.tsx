import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { CategoriesNavbar } from "@/components/categories-navbar"
import { getCategories, getSubcategories } from "@/lib/db"
import { Gift, Trophy, Ticket, Users, Calendar, MapPin, Shield, AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata = {
  title: "Играй с Мадикс и спечели! | Madix Groundbaits",
  description: "Участвайте в нашата промоционална игра със скреч карта. Спечелете невероятни награди!",
}

export default async function GamePage() {
  const categories = await getCategories()
  const subcategories = await getSubcategories()

  const prizes = [
    { icon: <Gift className="h-8 w-8" />, name: "Пакет Юбилейна захранка", color: "from-pink-500 to-rose-600" },
    {
      icon: <Trophy className="h-8 w-8" />,
      name: "Рекламна шапка с лого Мадикс",
      color: "from-purple-500 to-indigo-600",
    },
    { icon: <Trophy className="h-8 w-8" />, name: "Халба за Бира с лого Мадикс", color: "from-blue-500 to-cyan-600" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-amber-50 text-gray-800 flex flex-col">
      <SiteHeader categories={categories || []} subcategories={subcategories || []} isEnglishProp={false} />
      <CategoriesNavbar categories={categories || []} isEnglish={false} />

      <main className="flex-1">
        {/* Hero Section - Game Style */}
        <section className="relative overflow-hidden bg-gradient-to-br from-amber-600 via-yellow-500 to-orange-600 py-20">
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden opacity-10">
            <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full animate-bounce"></div>
            <div className="absolute bottom-20 right-20 w-24 h-24 bg-white rounded-full animate-pulse"></div>
            <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-white rounded-full animate-ping"></div>
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center">
              <div className="inline-block mb-6">
                <Ticket className="h-16 w-16 md:h-24 md:w-24 text-white animate-bounce" />
              </div>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-6 text-white drop-shadow-2xl">
                Играй с Мадикс
                <br />и спечели!
              </h1>
              <p className="text-xl md:text-2xl text-white/95 font-bold max-w-3xl mx-auto drop-shadow-lg">
                Промоционална игра със скреч карта
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
                <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full border-2 border-white text-white font-bold">
                  <Calendar className="inline h-5 w-5 mr-2" />
                  01.03.2026 - 30.10.2026
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Prizes Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-5xl font-black mb-4 text-gray-900">Награди 🎁</h2>
              <p className="text-lg text-gray-600">
                Всички участници имат възможност да спечелят една от следните награди
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {prizes.map((prize, index) => (
                <Card
                  key={index}
                  className="relative overflow-hidden border-4 border-gray-200 hover:border-amber-500 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${prize.color} opacity-10`}></div>
                  <CardContent className="p-8 text-center relative z-10">
                    <div
                      className={`inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br ${prize.color} text-white mb-6 shadow-lg`}
                    >
                      {prize.icon}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">{prize.name}</h3>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How to Play Section */}
        <section className="py-16 bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-5xl font-black mb-4 text-gray-900">Как да играя? 🎮</h2>
              <p className="text-lg text-gray-600">Проста механика - моментални награди!</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <Card className="bg-white/80 backdrop-blur-sm border-4 border-white hover:shadow-2xl transition-all duration-300">
                <CardHeader>
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white text-2xl font-black mb-4">
                    1
                  </div>
                  <CardTitle className="text-2xl font-black text-gray-900">Направи поръчка</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 text-lg">
                    Всеки клиент, направил поръчка на стойност{" "}
                    <span className="font-bold text-green-600">8 евро или повече</span>, получава скреч карта
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-4 border-white hover:shadow-2xl transition-all duration-300">
                <CardHeader>
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-2xl font-black mb-4">
                    2
                  </div>
                  <CardTitle className="text-2xl font-black text-gray-900">Изтрий картата</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 text-lg">
                    Всяка скреч карта съдържа една от наградите.{" "}
                    <span className="font-bold text-blue-600">Изтрий и виж веднага</span> своята награда!
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-4 border-white hover:shadow-2xl transition-all duration-300">
                <CardHeader>
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-2xl font-black mb-4">
                    3
                  </div>
                  <CardTitle className="text-2xl font-black text-gray-900">Получи наградата</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 text-lg">
                    Наградите се <span className="font-bold text-amber-600">получават веднага в магазина</span>. Няма
                    чакане!
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="mt-12 text-center">
              <div className="inline-block bg-white rounded-2xl px-8 py-6 shadow-xl border-4 border-amber-400">
                <p className="text-2xl font-black text-gray-900">♾️ Неограничен брой участия!</p>
                <p className="text-gray-600 mt-2">Всяка поръчка над 8 евро = нова карта</p>
              </div>
            </div>
          </div>
        </section>

        {/* Game Details Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-5xl font-black mb-12 text-center text-gray-900">Детайли за играта 📋</h2>

              <div className="space-y-6">
                <Card className="border-l-8 border-amber-500 shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center text-2xl font-bold text-gray-900">
                      <Calendar className="h-7 w-7 mr-3 text-amber-600" />
                      Период на провеждане
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg text-gray-700">
                      Играта стартира на <span className="font-bold text-amber-600">01.03.2026 г.</span> и продължава до{" "}
                      <span className="font-bold text-amber-600">30.10.2026 г.</span> или до изчерпване на количествата
                      скреч карти.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-l-8 border-blue-500 shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center text-2xl font-bold text-gray-900">
                      <MapPin className="h-7 w-7 mr-3 text-blue-600" />
                      Място на провеждане
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg text-gray-700">
                      Играта се провежда в <span className="font-bold text-blue-600">Търговската мрежа</span>.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-l-8 border-green-500 shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center text-2xl font-bold text-gray-900">
                      <Users className="h-7 w-7 mr-3 text-green-600" />
                      Право на участие
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 text-lg text-gray-700">
                      <li className="flex items-start">
                        <span className="text-green-600 font-bold mr-2">✓</span>
                        <span>
                          В играта могат да участват всички лица, навършили <span className="font-bold">18 години</span>
                          , пребиваващи на територията на Република България.
                        </span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-red-600 font-bold mr-2">✗</span>
                        <span>
                          В играта нямат право да участват служители на Мадикс ЕООД, както и техните роднини от първа
                          степен.
                        </span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-l-8 border-purple-500 shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center text-2xl font-bold text-gray-900">
                      <Shield className="h-7 w-7 mr-3 text-purple-600" />
                      Организатор
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg text-gray-700">
                      <span className="font-bold text-purple-600">Мадикс ЕООД</span>
                      <br />
                      Седалище и адрес на управление: гр. Борово, ул. Любен Каравелов 14
                      <br />
                      ЕИК: 203410686
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Important Notes Section */}
        <section className="py-16 bg-gradient-to-br from-orange-100 via-amber-100 to-yellow-100">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-5xl font-black mb-12 text-center text-gray-900">Важна информация ⚠️</h2>

              <Card className="bg-white/90 backdrop-blur-sm border-4 border-orange-300 shadow-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center text-2xl font-bold text-gray-900">
                    <AlertCircle className="h-7 w-7 mr-3 text-orange-600" />
                    Допълнителни условия
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-amber-50 p-4 rounded-lg border-l-4 border-amber-500">
                    <p className="text-gray-800 font-medium">
                      Организаторът си запазва правото да променя правилата, наградите и условията на играта, като
                      промените ще бъдат публикувани своевременно на сайта www.madiks.bg
                    </p>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                    <p className="text-gray-800 font-medium">
                      Организаторът не носи отговорност за загубени или повредени скреч карти, както и за неспазени
                      срокове за използване на награди.
                    </p>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                    <p className="text-gray-800 font-medium">
                      Наградите не могат да бъдат заменяни за тяхната парична стойност.
                    </p>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-500">
                    <p className="text-gray-800 font-medium">Всяка скреч карта може да бъде използвана само веднъж.</p>
                  </div>

                  <div className="bg-pink-50 p-4 rounded-lg border-l-4 border-pink-500">
                    <p className="text-gray-800 font-medium">
                      Всички лични данни, предоставени от участниците, ще бъдат обработвани единствено за целите на
                      играта и връчването на наградите, в съответствие с Регламент (ЕС) 2016/679 (GDPR).
                    </p>
                  </div>
                </CardContent>
              </Card>

              <div className="mt-12 text-center">
                <Card className="inline-block bg-gradient-to-br from-green-500 to-green-600 text-white border-4 border-green-700 shadow-2xl">
                  <CardContent className="p-8">
                    <p className="text-2xl font-black mb-2">🎉 Участието в играта означава приемане на правилата</p>
                    <p className="text-lg font-medium opacity-90">
                      При възникване на спор, същият ще бъде решаван по взаимно съгласие, а при невъзможност – от
                      компетентния съд в Република България.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Official Name Section */}
        <section className="py-12 bg-gray-800 text-white">
          <div className="container mx-auto px-4 text-center">
            <h3 className="text-2xl md:text-3xl font-bold mb-2">
              ОФИЦИАЛНИ ПРАВИЛА ЗА УЧАСТИЕ В ПРОМОЦИОНАЛНАТА ИГРА НА PS COSMETICS
            </h3>
            <p className="text-xl text-amber-400 font-bold">"Играй с Мадикс и спечели!"</p>
          </div>
        </section>
      </main>

      <SiteFooter categories={categories || []} isEnglish={false} />
    </div>
  )
}
