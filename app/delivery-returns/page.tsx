import ReturnForm from "@/components/return-form"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { getCategories, getSubcategories } from "@/lib/data"

export const metadata = {
  title: "Доставка и Връщане",
  description: "Информация за доставка и форма за връщане на продукти.",
}

export default async function DeliveryReturnsPage() {
  const categories = await getCategories()
  const subcategories = await getSubcategories()

  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader categories={categories} subcategories={subcategories} />
      <main className="flex-1 container mx-auto px-4 py-8 md:py-12">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-8">Доставка и Връщане</h1>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Информация за Доставка и Връщане</h2>
          <div className="prose max-w-none">
            <p>
              <strong>1. Доставка</strong> - Доставката се извършва на посочен от потребителя адрес е за негова сметка.
              Доставките се извършват чрез куриерска фирма Еконт, а плащането чрез услугата "наложен платеж". Стойността
              на доставката се изчислява автоматично от сайта на Еконт (
              <a
                href="http://www.econt.com/tariff-calculator/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                http://www.econt.com/tariff-calculator/
              </a>
              ) в зависимост килограмите на стоката. По желание от страна на клиента за друга куриерска фирма или за
              доставка "до поискване" моля да уточните това в полето пояснение.
            </p>
            <p>
              <strong>2. Срок на доставка</strong> - Доставките на рибарски принадлежности се извършват в рамките на 5
              работни дни.
            </p>
            <p>
              <strong>3. Право на връщане</strong> - Потребителят има право в срок от 14 дни да се откаже безусловно от
              договор от разстояние или от договор извън търговски обект, без да заплаща каквито и да е разходи, с
              изключение на тези за доставка в случай, че е избрал различен от стандартния най - евтин за търговеца
              начин за доставяне на поръчката, както и разходите за връщането на стоката обратно.
            </p>
            <p>
              Продуктът може да бъде върнат само в ненарушена цялост и в запазена оригинална опаковка. Моля не
              повреждайте оригиналната опаковка !!!
            </p>
            <p>
              Ако желаете да се възползвате от правото си на връщане моля свържете се с нас на тел. +359 894 722 344 или
              на e-mail:{" "}
              <a href="mailto:sales@myfish.bg" className="text-blue-600 hover:underline">
                sales@myfish.bg
              </a>{" "}
              и ние ще Ви изпратим приложение №6 от ЗЗП , с който да върнете стоката.
            </p>
            <p>При отказ на стоката ние ще поемем транспортните разходи само в случай, че :</p>
            <ul className="list-disc pl-6">
              <li>не е спазен предварително уговорения срок за доставка;</li>
              <li>доставената стока явно не съответства на поръчаната от клиента;</li>
              <li>цената не съответства на оферираната;</li>
            </ul>
            <p className="mt-4">Поздрави от екипа на Мадикс !!!</p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Заявка за Връщане на Продукт</h2>
          <ReturnForm isEnglish={false} />
        </section>
      </main>
      <SiteFooter categories={categories} />
    </div>
  )
}
