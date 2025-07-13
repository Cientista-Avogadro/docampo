"use client"
import { useRouter } from "next/navigation"
import { useCart } from "@/components/cart/cart-context"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Trash2, ShoppingBag, Plus, Minus, ArrowRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Separator } from "@/components/ui/separator"

export default function CarrinhoPage() {
  const { items, removeItem, updateQuantity, clearCart, getTotal } = useCart()
  const { isAuthenticated } = useAuth()
  const router = useRouter()

  const handleProceedToCheckout = () => {
    if (!isAuthenticated) {
      router.push("/login?redirect=checkout")
    } else {
      router.push("/checkout")
    }
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Seu Carrinho</h1>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12 flex flex-col items-center">
              <ShoppingBag className="h-16 w-16 text-gray-300 mb-4" />
              <h2 className="text-xl font-medium mb-2">Seu carrinho está vazio</h2>
              <p className="text-gray-500 mb-6">Adicione produtos para continuar comprando</p>
              <Link href="/produtos">
                <Button className="bg-green-500 hover:bg-green-600">Ver Produtos</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Seu Carrinho</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Produtos</CardTitle>
              <Button variant="outline" size="sm" onClick={clearCart}>
                Limpar Carrinho
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center gap-4 py-4 border-b"
                  >
                    <div className="relative h-20 w-20 flex-shrink-0">
                      <Image
                        src={item.imagem || "/placeholder.svg"}
                        alt={item.nome}
                        fill
                        className="object-cover rounded-md"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{item.nome}</h3>
                      <p className="text-sm text-gray-500">Preço unitário: {item.preco.toFixed(2)} AOA</p>
                    </div>
                    <div className="flex items-center border rounded-md">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-none"
                        onClick={() => updateQuantity(item.id, item.quantidade - 1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center">{item.quantidade}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-none"
                        onClick={() => updateQuantity(item.id, item.quantidade + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="text-right min-w-[100px]">
                      <div className="font-bold">{(item.preco * item.quantidade).toFixed(2)} AOA</div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700 p-0 h-auto"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Remover
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Resumo do Pedido</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{getTotal().toFixed(2)} AOA</span>
                </div>
                <div className="flex justify-between">
                  <span>Frete</span>
                  <span>Grátis</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>{getTotal().toFixed(2)} AOA</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full bg-green-500 hover:bg-green-600" onClick={handleProceedToCheckout}>
                {isAuthenticated ? (
                  <>
                    Finalizar Compra
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                ) : (
                  <>
                    Entrar para Continuar
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
