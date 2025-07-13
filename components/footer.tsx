import Link from "next/link"
import Image from "next/image"

export default function Footer() {
  return (
    <footer className="bg-white border-t mt-12">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-green-500">DÓCAMPO</h3>
            <p className="text-sm">
              Um mercado digital onde o comércio de produtos agrícolas é fácil, rápido e transparente.
            </p>
            <div className="flex gap-2">
              <Link href="#" className="bg-green-100 p-2 rounded-full">
                <Image src="/placeholder.svg?height=24&width=24" alt="LinkedIn" width={24} height={24} />
              </Link>
              <Link href="#" className="bg-green-100 p-2 rounded-full">
                <Image src="/placeholder.svg?height=24&width=24" alt="Instagram" width={24} height={24} />
              </Link>
              <Link href="#" className="bg-green-100 p-2 rounded-full">
                <Image src="/placeholder.svg?height=24&width=24" alt="Facebook" width={24} height={24} />
              </Link>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-bold text-green-500">SOBRE A DÓCAMPO</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#" className="hover:underline">
                  A nossa empresa
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:underline">
                  A nossa equipa
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:underline">
                  FAQ's
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:underline">
                  Termos e Condições
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:underline">
                  Política de Privacidade
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-bold text-green-500">CONTACTE-NOS</h3>
            <p className="text-sm">+244 900 000 000</p>
            <p className="text-sm">docampo@campocacimbo.co.ao</p>
            <div className="flex gap-2">
              <button className="bg-green-500 hover:bg-green-600 text-white text-xs px-4 py-2 rounded-md">
                Posso ajudá-lo?
              </button>
              <button className="border border-green-500 p-2 rounded-md">
                <Image src="/placeholder.svg?height=24&width=24" alt="WhatsApp" width={24} height={24} />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t text-center text-xs text-gray-500">
          <p>© 2024 DÓCAMPO | Todos os direitos reservados</p>
        </div>
      </div>
    </footer>
  )
}
