"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useCart } from "@/components/cart/cart-context"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { saveOrder } from "@/lib/file-storage"
import { ArrowLeft, CreditCard, Landmark, Wallet, Truck } from "lucide-react"
import Link from "next/link"

export default function CheckoutPage() {
  const { items, getTotal, clearCart } = useCart()
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState("cartao")
  const [wantsDelivery, setWantsDelivery] = useState(true)
  const [formData, setFormData] = useState({
    numeroCartao: "",
    nomeCartao: "",
    validade: "",
    cvv: "",
    endereco: user?.morada || "",
    cidade: "",
    codigoPostal: user?.codigoPostal || "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isAuthenticated || !user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para finalizar a compra.",
        variant: "destructive",
      })
      router.push("/login?redirect=checkout")
      return
    }

    if (items.length === 0) {
      toast({
        title: "Erro",
        description: "Seu carrinho está vazio.",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)

    try {
      // Agrupar itens por vendedor
      const itemsByVendor: Record<string, any[]> = {}

      items.forEach((item) => {
        if (!itemsByVendor[item.vendedorId]) {
          itemsByVendor[item.vendedorId] = []
        }

        itemsByVendor[item.vendedorId].push({
          produtoId: item.id,
          quantidade: item.quantidade,
          precoUnitario: item.preco,
        })
      })

      // Criar um pedido para cada vendedor
      const orderPromises = Object.entries(itemsByVendor).map(([vendedorId, produtos]) => {
        const total = produtos.reduce((sum, item) => sum + item.quantidade * item.precoUnitario, 0)

        // Calcular comissão de entrega (10% do valor total)
        const comissaoEntrega = wantsDelivery ? total * 0.1 : 0

        const orderData = {
          id: `order_${Date.now()}_${vendedorId.substring(0, 4)}`,
          compradorId: user.id,
          vendedorId: vendedorId,
          intermediarioId: null, // Será atribuído posteriormente se houver entrega
          produtos: produtos,
          status: "pendente",
          total: total,
          dataPedido: new Date().toISOString(),
          dataEntrega: null,
          endereco: formData.endereco,
          cidade: formData.cidade,
          codigoPostal: formData.codigoPostal,
          metodoPagamento: paymentMethod,
          entrega: wantsDelivery,
          statusEntrega: wantsDelivery ? "pendente" : null,
          comissaoEntrega: comissaoEntrega,
          comissaoPaga: false,
        }

        return saveOrder(orderData)
      })

      await Promise.all(orderPromises)

      // Simular processamento de pagamento
      await new Promise((resolve) => setTimeout(resolve, 2000))

      toast({
        title: "Compra realizada com sucesso!",
        description: "Seu pedido foi registrado e está sendo processado.",
      })

      clearCart()
      router.push("/perfil?tab=pedidos")
    } catch (error) {
      console.error("Erro ao processar compra:", error)
      toast({
        title: "Erro ao processar compra",
        description: "Ocorreu um erro ao processar sua compra. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  if (!isAuthenticated) {
    router.push("/login?redirect=checkout")
    return null
  }

  if (items.length === 0) {
    router.push("/carrinho")
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/carrinho" className="flex items-center text-green-500 hover:underline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para o carrinho
        </Link>
      </div>

      <h1 className="text-2xl font-bold mb-6">Finalizar Compra</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit}>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Endereço de Entrega</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="endereco">Endereço Completo</Label>
                  <Input
                    id="endereco"
                    name="endereco"
                    value={formData.endereco}
                    onChange={handleChange}
                    required
                    className="border-green-200 focus:border-green-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="cidade">Cidade</Label>
                    <Input
                      id="cidade"
                      name="cidade"
                      value={formData.cidade}
                      onChange={handleChange}
                      required
                      className="border-green-200 focus:border-green-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="codigoPostal">Código Postal</Label>
                    <Input
                      id="codigoPostal"
                      name="codigoPostal"
                      value={formData.codigoPostal}
                      onChange={handleChange}
                      required
                      className="border-green-200 focus:border-green-500"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <Switch id="delivery" checked={wantsDelivery} onCheckedChange={setWantsDelivery} />
                  <Label htmlFor="delivery" className="flex items-center cursor-pointer">
                    <Truck className="mr-2 h-4 w-4 text-green-500" />
                    Quero receber em casa (serviço de entrega)
                  </Label>
                </div>
                {wantsDelivery && (
                  <p className="text-sm text-gray-500">
                    Um intermediário será designado para entregar seu pedido. Uma taxa de 10% será adicionada ao valor
                    total.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Método de Pagamento</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-4">
                  <div className="flex items-center space-x-2 border rounded-md p-3 cursor-pointer hover:bg-gray-50 [&:has(:checked)]:bg-green-50 [&:has(:checked)]:border-green-500">
                    <RadioGroupItem value="cartao" id="cartao" />
                    <Label htmlFor="cartao" className="flex items-center cursor-pointer">
                      <CreditCard className="mr-2 h-5 w-5 text-green-500" />
                      Cartão de Crédito/Débito
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-md p-3 cursor-pointer hover:bg-gray-50 [&:has(:checked)]:bg-green-50 [&:has(:checked)]:border-green-500">
                    <RadioGroupItem value="transferencia" id="transferencia" />
                    <Label htmlFor="transferencia" className="flex items-center cursor-pointer">
                      <Landmark className="mr-2 h-5 w-5 text-green-500" />
                      Transferência Bancária
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-md p-3 cursor-pointer hover:bg-gray-50 [&:has(:checked)]:bg-green-50 [&:has(:checked)]:border-green-500">
                    <RadioGroupItem value="dinheiro" id="dinheiro" />
                    <Label htmlFor="dinheiro" className="flex items-center cursor-pointer">
                      <Wallet className="mr-2 h-5 w-5 text-green-500" />
                      Dinheiro na Entrega
                    </Label>
                  </div>
                </RadioGroup>

                {paymentMethod === "cartao" && (
                  <div className="mt-6 space-y-4">
                    <div>
                      <Label htmlFor="numeroCartao">Número do Cartão</Label>
                      <Input
                        id="numeroCartao"
                        name="numeroCartao"
                        value={formData.numeroCartao}
                        onChange={handleChange}
                        placeholder="1234 5678 9012 3456"
                        required={paymentMethod === "cartao"}
                        className="border-green-200 focus:border-green-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="nomeCartao">Nome no Cartão</Label>
                      <Input
                        id="nomeCartao"
                        name="nomeCartao"
                        value={formData.nomeCartao}
                        onChange={handleChange}
                        required={paymentMethod === "cartao"}
                        className="border-green-200 focus:border-green-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="validade">Data de Validade</Label>
                        <Input
                          id="validade"
                          name="validade"
                          value={formData.validade}
                          onChange={handleChange}
                          placeholder="MM/AA"
                          required={paymentMethod === "cartao"}
                          className="border-green-200 focus:border-green-500"
                        />
                      </div>
                      <div>
                        <Label htmlFor="cvv">CVV</Label>
                        <Input
                          id="cvv"
                          name="cvv"
                          value={formData.cvv}
                          onChange={handleChange}
                          placeholder="123"
                          required={paymentMethod === "cartao"}
                          className="border-green-200 focus:border-green-500"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="lg:hidden">
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Resumo do Pedido</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>{getTotal().toFixed(2)} AOA</span>
                    </div>
                    {wantsDelivery && (
                      <div className="flex justify-between">
                        <span>Taxa de Entrega (10%)</span>
                        <span>{(getTotal() * 0.1).toFixed(2)} AOA</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Frete</span>
                      <span>Grátis</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>{wantsDelivery ? (getTotal() * 1.1).toFixed(2) : getTotal().toFixed(2)} AOA</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full bg-green-500 hover:bg-green-600" disabled={isProcessing}>
                    {isProcessing ? "Processando..." : "Finalizar Compra"}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </form>
        </div>

        <div className="hidden lg:block">
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle>Resumo do Pedido</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Itens ({items.length})</h3>
                  <div className="space-y-2 max-h-60 overflow-auto pr-2">
                    {items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span>
                          {item.nome} x {item.quantidade}
                        </span>
                        <span>{(item.preco * item.quantidade).toFixed(2)} AOA</span>
                      </div>
                    ))}
                  </div>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{getTotal().toFixed(2)} AOA</span>
                </div>
                {wantsDelivery && (
                  <div className="flex justify-between">
                    <span>Taxa de Entrega (10%)</span>
                    <span>{(getTotal() * 0.1).toFixed(2)} AOA</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Frete</span>
                  <span>Grátis</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>{wantsDelivery ? (getTotal() * 1.1).toFixed(2) : getTotal().toFixed(2)} AOA</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                type="submit"
                form="checkout-form"
                className="w-full bg-green-500 hover:bg-green-600"
                disabled={isProcessing}
                onClick={handleSubmit}
              >
                {isProcessing ? "Processando..." : "Finalizar Compra"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
