"use client"

import { useState, useEffect } from "react"
import { Cloud, Sun } from "lucide-react"

export function WeatherWidget() {
  const [weather, setWeather] = useState({
    temp: "25°C",
    condition: "Sol",
  })

  // Simulação de dados de clima
  useEffect(() => {
    // Em um cenário real, aqui seria feita uma chamada a uma API de clima
    const mockWeather = {
      temp: "25°C",
      condition: "Sol",
    }

    setWeather(mockWeather)
  }, [])

  return (
    <div className="flex items-center gap-1 text-sm">
      {weather.condition === "Sol" ? (
        <Sun className="h-5 w-5 text-yellow-500" />
      ) : (
        <Cloud className="h-5 w-5 text-blue-500" />
      )}
      <span>{weather.temp}</span>
      <span className="text-gray-500">{weather.condition}</span>
    </div>
  )
}
