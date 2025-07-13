"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const slides = [
  {
    id: 1,
    image: "/placeholder.svg?height=400&width=1200",
    title: "OS PRODUTORES ESTÃO A EXPANDIR OS SEUS NEGÓCIOS",
    subtitle: "REGISTE-SE E RECEBA OS PRODUTOS DIRETAMENTE DO PRODUTOR",
  },
  {
    id: 2,
    image: "/placeholder.svg?height=400&width=1200",
    title: "PRODUTOS FRESCOS E DE QUALIDADE",
    subtitle: "DIRETAMENTE DOS MELHORES PRODUTORES PARA SUA MESA",
  },
  {
    id: 3,
    image: "/placeholder.svg?height=400&width=1200",
    title: "APOIE OS PRODUTORES LOCAIS",
    subtitle: "CONTRIBUA PARA O DESENVOLVIMENTO DA AGRICULTURA LOCAL",
  },
]

export function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0)

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1))
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1))
  }

  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide()
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative overflow-hidden rounded-xl">
      <div className="relative h-[300px] md:h-[400px] w-full">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={cn(
              "absolute inset-0 transition-opacity duration-1000",
              index === currentSlide ? "opacity-100" : "opacity-0",
            )}
          >
            <Image
              src={slide.image || "/placeholder.svg"}
              alt={slide.title}
              fill
              className="object-cover"
              priority={index === 0}
            />
            <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center text-center p-6">
              <h2 className="text-white text-2xl md:text-4xl font-bold mb-2 max-w-3xl">{slide.title}</h2>
              <p className="text-white text-sm md:text-base max-w-2xl">{slide.subtitle}</p>
            </div>
          </div>
        ))}
      </div>

      <Button
        variant="outline"
        size="icon"
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full h-8 w-8 md:h-10 md:w-10"
        onClick={prevSlide}
      >
        <ChevronLeft className="h-4 w-4 md:h-6 md:w-6" />
        <span className="sr-only">Anterior</span>
      </Button>

      <Button
        variant="outline"
        size="icon"
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full h-8 w-8 md:h-10 md:w-10"
        onClick={nextSlide}
      >
        <ChevronRight className="h-4 w-4 md:h-6 md:w-6" />
        <span className="sr-only">Próximo</span>
      </Button>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            className={cn(
              "h-2 w-2 rounded-full transition-all",
              index === currentSlide ? "bg-white w-4" : "bg-white/50",
            )}
            onClick={() => setCurrentSlide(index)}
          />
        ))}
      </div>
    </div>
  )
}
