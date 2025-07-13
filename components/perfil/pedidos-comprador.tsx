"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { getOrdersByBuyer, getProductById, updateOrder, getUserById } from "@/lib/file-storage"
import { FileText, ShoppingBag, Check } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

type PedidosCompradorProps = {
  userId: string
}

export function PedidosComprador({ userId }: PedidosCompradorProps) {
  const [pedidos, setPedidos] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPedido, setSelectedPedido] = useState<any>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        const pedidosData = await getOrdersByBuyer(userId)

        // Ordenar pedidos do mais recente para o mais antigo
        pedidosData.sort((a, b) => new Date(b.dataPedido).getTime() - new Date(a.dataPedido).getTime())

        // Obter informações detalhadas dos produtos e intermediários
        const pedidosComProdutos = await Promise.all(
          pedidosData.map(async (pedido) => {
            const produtosDetalhados = await Promise.all(
              pedido.produtos.map(async (item: any) => {
                const produto = await getProductById(item.produtoId)
                return {
                  ...item,
                  produto,
                }
              }),
            )

            const vendedor = await getUserById(pedido.vendedorId)
            const intermediario = pedido.intermediarioId ? await getUserById(pedido.intermediarioId) : null

            return {
              ...pedido,
              produtosDetalhados,
              vendedor,
              intermediario,
            }
          }),
        )

        setPedidos(pedidosComProdutos)
      } catch (error) {
        console.error("Erro ao carregar pedidos:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPedidos()
  }, [userId])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pendente":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
            Pendente
          </Badge>
        )
      case "aceito":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800">
            Aceito
          </Badge>
        )
      case "em_transporte":
        return (
          <Badge variant="outline" className="bg-purple-100 text-purple-800">
            Em Transporte
          </Badge>
        )
      case "entregue":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800">
            Entregue
          </Badge>
        )
      case "cancelado":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800">
            Cancelado
          </Badge>
        )
      default:
        return <Badge variant="outline">Desconhecido</Badge>
    }
  }

  const getStatusEntregaBadge = (status: string | null) => {
    if (!status) return null

    switch (status) {
      case "pendente":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
            Pendente
          </Badge>
        )
      case "aceito":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800">
            Aceito
          </Badge>
        )
      case "em_andamento":
        return (
          <Badge variant="outline" className="bg-purple-100 text-purple-800">
            Em Andamento
          </Badge>
        )
      case "entregue":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800">
            Entregue
          </Badge>
        )
      default:
        return <Badge variant="outline">Desconhecido</Badge>
    }
  }

  const handleViewDetails = (pedido: any) => {
    setSelectedPedido(pedido)
    setIsDialogOpen(true)
  }

  const handleConfirmReceived = async (pedidoId: string) => {
    try {
      const pedido = pedidos.find((p) => p.id === pedidoId)
      if (!pedido) return

      const updatedPedido = {
        ...pedido,
        status: "entregue",
        statusEntrega: "entregue",
        dataEntrega: new Date().toISOString(),
      }

      await updateOrder(updatedPedido)

      setPedidos(
        pedidos.map((p) =>
          p.id === pedidoId
            ? {
                ...p,
                status: "entregue",
                statusEntrega: "entregue",
                dataEntrega: new Date().toISOString(),
              }
            : p,
        ),
      )

      toast({
        title: "Recebimento confirmado",
        description: "Você confirmou o recebimento do pedido.",
      })

      setIsDialogOpen(false)
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao confirmar o recebimento.",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Meus Pedidos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Carregando pedidos...</div>
        </CardContent>
      </Card>
    )
  }

  if (pedidos.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Meus Pedidos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 flex flex-col items-center">
            <ShoppingBag className="h-12 w-12 text-gray-300 mb-2" />
            <p className="text-gray-500">Você ainda não fez nenhum pedido.</p>
            <Button className="mt-4 bg-green-500 hover:bg-green-600">Explorar Produtos</Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Meus Pedidos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {pedidos.map((pedido) => (
            <div key={pedido.id} className="border rounded-lg p-4">
              <div className="flex flex-wrap justify-between items-start gap-2 mb-4">
                <div>
                  <p className="font-medium">Pedido #{pedido.id.substring(6)}</p>
                  <p className="text-sm text-gray-500">{new Date(pedido.dataPedido).toLocaleDateString("pt-BR")}</p>
                  <p className="text-sm">
                    Vendedor: <span className="font-medium">{pedido.vendedor?.nome || "Vendedor"}</span>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(pedido.status)}
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1"
                    onClick={() => handleViewDetails(pedido)}
                  >
                    <FileText className="h-4 w-4" />
                    <span>Detalhes</span>
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                {pedido.produtosDetalhados.slice(0, 2).map((item: any, index: number) => (
                  <div key={index} className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="font-medium">{item.produto?.nome || "Produto indisponível"}</div>
                      <div className="text-sm text-gray-500">x{item.quantidade}</div>
                    </div>
                    <div className="font-medium">{(item.precoUnitario * item.quantidade).toFixed(2)} AOA</div>
                  </div>
                ))}
                {pedido.produtosDetalhados.length > 2 && (
                  <div className="text-sm text-gray-500">+ {pedido.produtosDetalhados.length - 2} mais produtos...</div>
                )}
              </div>

              {pedido.entrega && (
                <div className="mt-3 pt-3 border-t">
                  <div className="flex justify-between items-center">
                    <div className="text-sm">
                      <span className="text-gray-500">Status da entrega:</span>{" "}
                      {pedido.intermediario ? (
                        <>
                          <span className="font-medium">{getStatusEntregaBadge(pedido.statusEntrega)}</span>
                          {pedido.statusEntrega !== "pendente" && (
                            <span className="ml-2">
                              por <span className="font-medium">{pedido.intermediario.nome}</span>
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-yellow-600">Aguardando intermediário</span>
                      )}
                    </div>

                    {pedido.statusEntrega === "em_andamento" && (
                      <Button
                        size="sm"
                        className="bg-green-500 hover:bg-green-600"
                        onClick={() => handleConfirmReceived(pedido.id)}
                      >
                        <Check className="mr-1 h-4 w-4" />
                        Confirmar Recebimento
                      </Button>
                    )}
                  </div>
                </div>
              )}

              <div className="mt-4 pt-4 border-t flex justify-between items-center">
                <div className="text-sm text-gray-500">Total</div>
                <div className="font-bold text-lg">{pedido.total.toFixed(2)} AOA</div>
              </div>
            </div>
          ))}
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[550px]">
            {selectedPedido && (
              <>
                <DialogHeader>
                  <DialogTitle>Detalhes do Pedido #{selectedPedido.id.substring(6)}</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Data do Pedido</h4>
                      <p>{new Date(selectedPedido.dataPedido).toLocaleDateString("pt-BR")}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Status</h4>
                      <div>{getStatusBadge(selectedPedido.status)}</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Informações do Vendedor</h4>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <p className="font-medium">{selectedPedido.vendedor?.nome}</p>
                      <p className="text-sm">{selectedPedido.vendedor?.email}</p>
                      <p className="text-sm">{selectedPedido.vendedor?.telefone}</p>
                    </div>
                  </div>

                  {selectedPedido.entrega && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Informações da Entrega</h4>
                      <div className="bg-gray-50 p-3 rounded-md">
                        <div className="flex justify-between items-center mb-2">
                          <p className="font-medium">Status da entrega:</p>
                          <div>{getStatusEntregaBadge(selectedPedido.statusEntrega)}</div>
                        </div>

                        {selectedPedido.intermediario ? (
                          <>
                            <p className="text-sm font-medium mt-2">Entregador:</p>
                            <p className="text-sm">{selectedPedido.intermediario.nome}</p>
                            <p className="text-sm">{selectedPedido.intermediario.telefone}</p>
                          </>
                        ) : (
                          <p className="text-sm text-yellow-600">Aguardando um intermediário aceitar a entrega</p>
                        )}

                        {selectedPedido.dataEntrega && (
                          <div className="mt-2">
                            <p className="text-sm font-medium">Data de entrega:</p>
                            <p className="text-sm">
                              {new Date(selectedPedido.dataEntrega).toLocaleDateString("pt-BR")}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Produtos</h4>
                    <div className="border rounded-md overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Produto
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Qtd
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Preço
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Total
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {selectedPedido.produtosDetalhados.map((item: any, index: number) => (
                            <tr key={index}>
                              <td className="px-4 py-2 whitespace-nowrap">
                                {item.produto?.nome || "Produto indisponível"}
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap">{item.quantidade}</td>
                              <td className="px-4 py-2 whitespace-nowrap">{item.precoUnitario.toFixed(2)} AOA</td>
                              <td className="px-4 py-2 whitespace-nowrap">
                                {(item.precoUnitario * item.quantidade).toFixed(2)} AOA
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="font-medium">Total</span>
                    <span className="font-bold text-lg">{selectedPedido.total.toFixed(2)} AOA</span>
                  </div>
                </div>

                <DialogFooter>
                  {selectedPedido.statusEntrega === "em_andamento" && (
                    <Button
                      className="bg-green-500 hover:bg-green-600"
                      onClick={() => handleConfirmReceived(selectedPedido.id)}
                    >
                      <Check className="mr-1 h-4 w-4" />
                      Confirmar Recebimento
                    </Button>
                  )}
                  {selectedPedido.statusEntrega !== "em_andamento" && (
                    <Button onClick={() => setIsDialogOpen(false)}>Fechar</Button>
                  )}
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
