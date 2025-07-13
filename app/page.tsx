import { Button } from "@/components/ui/button"
import Link from "next/link"
import { WeatherWidget } from "@/components/weather-widget"
import { HeroCarousel } from "@/components/hero-carousel"
import { PromotionBanner } from "@/components/promotion-banner"

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex justify-end">
        <WeatherWidget />
      </div>

      <div className="mb-8 flex flex-wrap gap-4 justify-center">
        <Link href="/registro?tipo=comprador">
          <Button className="bg-green-500 hover:bg-green-600 text-white font-medium px-6 py-6 rounded-full">
            COMPRADOR SINGULAR
          </Button>
        </Link>
        <Link href="/registro?tipo=empresa">
          <Button
            variant="outline"
            className="border-green-500 text-green-500 hover:bg-green-50 font-medium px-6 py-6 rounded-full"
          >
            SOU EMPRESA
          </Button>
        </Link>
      </div>

      <HeroCarousel />

      <PromotionBanner />
    </div>
  )
}
