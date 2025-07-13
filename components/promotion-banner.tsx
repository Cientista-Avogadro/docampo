import Link from "next/link"

export function PromotionBanner() {
  return (
    <div className="mt-8 bg-green-500 text-white text-center py-6 px-4 rounded-xl">
      <h2 className="text-xl md:text-2xl font-bold">REGISTE-SE AGORA E GANHE 15% DE DESCONTO NA PRIMEIRA COMPRA</h2>
      <Link href="/registro">
        <button className="mt-4 bg-white text-green-500 font-bold py-2 px-6 rounded-full hover:bg-green-50 transition-colors">
          REGISTRAR AGORA
        </button>
      </Link>
    </div>
  )
}
