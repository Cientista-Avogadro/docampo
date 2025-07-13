"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import {
  getOrdersByIntermediary,
  getOrdersForDelivery,
  getProductById,
  updateOrder,
  getUserById,
} from "@/lib/file-storage"
import { FileText, Truck, Check, FileDown, DollarSign } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type PedidosIntermediarioProps = {
  userId: string
}

export function PedidosIntermediario({ userId }: PedidosIntermediarioProps) {
  const [pedidos, setPedidos] = useState<any[]>([])
  const [pedidosDisponiveis, setPedidosDisponiveis] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPedido, setSelectedPedido] = useState<any>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("minhas-entregas")

  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        // Buscar pedidos atribuídos a este intermediário
        const pedidosData = await getOrdersByIntermediary(userId)

        // Buscar pedidos disponíveis para entrega (não atribuídos a nenhum intermediário)
        const pedidosDisponiveisData = await getOrdersForDelivery()

        // Ordenar pedidos do mais recente para o mais antigo
        pedidosData.sort((a, b) => new Date(b.dataPedido).getTime() - new Date(a.dataPedido).getTime())
        pedidosDisponiveisData.sort((a, b) => new Date(b.dataPedido).getTime() - new Date(a.dataPedido).getTime())

        // Obter informações detalhadas dos produtos, compradores e vendedores
        const pedidosDetalhados = await Promise.all(
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

            const comprador = await getUserById(pedido.compradorId)
            const vendedor = await getUserById(pedido.vendedorId)

            return {
              ...pedido,
              produtosDetalhados,
              comprador,
              vendedor,
            }
          }),
        )

        const pedidosDisponiveisDetalhados = await Promise.all(
          pedidosDisponiveisData.map(async (pedido) => {
            const produtosDetalhados = await Promise.all(
              pedido.produtos.map(async (item: any) => {
                const produto = await getProductById(item.produtoId)
                return {
                  ...item,
                  produto,
                }
              }),
            )

            const comprador = await getUserById(pedido.compradorId)
            const vendedor = await getUserById(pedido.vendedorId)

            return {
              ...pedido,
              produtosDetalhados,
              comprador,
              vendedor,
            }
          }),
        )

        setPedidos(pedidosDetalhados)
        setPedidosDisponiveis(pedidosDisponiveisDetalhados)
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

  const handleAcceptDelivery = async (pedidoId: string) => {
    try {
      const pedido = pedidosDisponiveis.find((p) => p.id === pedidoId)
      if (!pedido) return

      const updatedPedido = {
        ...pedido,
        intermediarioId: userId,
        statusEntrega: "aceito",
      }

      await updateOrder(updatedPedido)

      // Atualizar listas de pedidos
      setPedidosDisponiveis(pedidosDisponiveis.filter((p) => p.id !== pedidoId))

      const updatedPedidoWithDetails = {
        ...updatedPedido,
        comprador: pedido.comprador,
        vendedor: pedido.vendedor,
        produtosDetalhados: pedido.produtosDetalhados,
      }

      setPedidos([updatedPedidoWithDetails, ...pedidos])

      toast({
        title: "Entrega aceita",
        description: "Você aceitou realizar esta entrega.",
      })

      setIsDialogOpen(false)
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao aceitar a entrega.",
        variant: "destructive",
      })
    }
  }

  const handleStartDelivery = async (pedidoId: string) => {
    try {
      const pedido = pedidos.find((p) => p.id === pedidoId)
      if (!pedido) return

      const updatedPedido = {
        ...pedido,
        statusEntrega: "em_andamento",
      }

      await updateOrder(updatedPedido)

      setPedidos(
        pedidos.map((p) =>
          p.id === pedidoId
            ? {
                ...p,
                statusEntrega: "em_andamento",
              }
            : p,
        ),
      )

      toast({
        title: "Entrega iniciada",
        description: "A entrega foi iniciada com sucesso.",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao iniciar a entrega.",
        variant: "destructive",
      })
    }
  }

  const handleCompleteDelivery = async (pedidoId: string) => {
    try {
      const pedido = pedidos.find((p) => p.id === pedidoId)
      if (!pedido) return

      const updatedPedido = {
        ...pedido,
        statusEntrega: "entregue",
        dataEntrega: new Date().toISOString(),
      }

      await updateOrder(updatedPedido)

      setPedidos(
        pedidos.map((p) =>
          p.id === pedidoId
            ? {
                ...p,
                statusEntrega: "entregue",
                dataEntrega: new Date().toISOString(),
              }
            : p,
        ),
      )

      toast({
        title: "Entrega concluída",
        description: "A entrega foi marcada como concluída.",
      })

      setIsDialogOpen(false)
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao concluir a entrega.",
        variant: "destructive",
      })
    }
  }

  const handleGeneratePDF = (pedido: any) => {
    // Em um cenário real, aqui seria implementada a geração do PDF
    toast({
      title: "PDF gerado",
      description: "O PDF do pedido foi gerado com sucesso.",
    })
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Entregas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Carregando entregas...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Entregas</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="minhas-entregas">Minhas Entregas</TabsTrigger>
            <TabsTrigger value="entregas-disponiveis">Entregas Disponíveis</TabsTrigger>
            <TabsTrigger value="comissoes">Comissões</TabsTrigger>
          </TabsList>

          <TabsContent value="minhas-entregas">
            {pedidos.length === 0 ? (
              <div className="text-center py-8 flex flex-col items-center">
                <Truck className="h-12 w-12 text-gray-300 mb-2" />
                <p className="text-gray-500">Você ainda não tem entregas para realizar.</p>
                <Button
                  className="mt-4 bg-green-500 hover:bg-green-600"
                  onClick={() => setActiveTab("entregas-disponiveis")}
                >
                  Ver Entregas Disponíveis
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {pedidos.map((pedido) => (
                  <div key={pedido.id} className="border rounded-lg p-4">
                    <div className="flex flex-wrap justify-between items-start gap-2 mb-4">
                      <div>
                        <p className="font-medium">Pedido #{pedido.id.substring(6)}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(pedido.dataPedido).toLocaleDateString("pt-BR")}
                        </p>
                        <p className="text-sm">
                          Entrega para: <span className="font-medium">{pedido.comprador?.nome || "Cliente"}</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusEntregaBadge(pedido.statusEntrega)}
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

                    <div className="mt-4 pt-4 border-t flex flex-wrap justify-between items-center gap-2">
                      <div>
                        <div className="text-sm text-gray-500">Endereço de Entrega</div>
                        <div className="font-medium">{pedido.comprador?.morada}</div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-1"
                          onClick={() => handleGeneratePDF(pedido)}
                        >
                          <FileDown className="h-4 w-4" />
                          Gerar PDF
                        </Button>

                        {pedido.statusEntrega === "aceito" && (
                          <Button
                            size="sm"
                            className="bg-green-500 hover:bg-green-600"
                            onClick={() => handleStartDelivery(pedido.id)}
                          >
                            <Truck className="mr-1 h-4 w-4" />
                            Iniciar Entrega
                          </Button>
                        )}

                        {pedido.statusEntrega === "em_andamento" && (
                          <Button
                            size="sm"
                            className="bg-green-500 hover:bg-green-600"
                            onClick={() => handleCompleteDelivery(pedido.id)}
                          >
                            <Check className="mr-1 h-4 w-4" />
                            Confirmar Entrega
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="entregas-disponiveis">
            {pedidosDisponiveis.length === 0 ? (
              <div className="text-center py-8 flex flex-col items-center">
                <Truck className="h-12 w-12 text-gray-300 mb-2" />
                <p className="text-gray-500">Não há entregas disponíveis no momento.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {pedidosDisponiveis.map((pedido) => (
                  <div key={pedido.id} className="border rounded-lg p-4">
                    <div className="flex flex-wrap justify-between items-start gap-2 mb-4">
                      <div>
                        <p className="font-medium">Pedido #{pedido.id.substring(6)}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(pedido.dataPedido).toLocaleDateString("pt-BR")}
                        </p>
                        <p className="text-sm">
                          Entrega para: <span className="font-medium">{pedido.comprador?.nome || "Cliente"}</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                          Disponível
                        </Badge>
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

                    <div className="mt-4 pt-4 border-t flex flex-wrap justify-between items-center gap-2">
                      <div>
                        <div className="text-sm text-gray-500">Endereço de Entrega</div>
                        <div className="font-medium">{pedido.comprador?.morada}</div>
                        <div className="text-sm text-gray-500 mt-1">
                          Comissão:{" "}
                          <span className="font-medium text-green-600">{pedido.comissaoEntrega.toFixed(2)} AOA</span>
                        </div>
                      </div>

                      <Button
                        size="sm"
                        className="bg-green-500 hover:bg-green-600"
                        onClick={() => handleAcceptDelivery(pedido.id)}
                      >
                        <Check className="mr-1 h-4 w-4" />
                        Aceitar Entrega
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="comissoes">
            <div className="space-y-6">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <h3 className="text-lg font-medium">Suas Comissões</h3>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500">Total de comissões ganhas</p>
                    <p className="text-2xl font-bold text-green-600">
                      {pedidos
                        .filter((p) => p.statusEntrega === "entregue")
                        .reduce((total, p) => total + p.comissaoEntrega, 0)
                        .toFixed(2)}{" "}
                      AOA
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Entregas realizadas</p>
                    <p className="text-2xl font-bold text-green-600">
                      {pedidos.filter((p) => p.statusEntrega === "entregue").length}
                    </p>
                  </div>
                </div>
              </div>

              <h3 className="font-medium text-lg mb-3">Histórico de Comissões</h3>

              {pedidos.filter((p) => p.statusEntrega === "entregue").length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Você ainda não realizou nenhuma entrega.</p>
                </div>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Pedido
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Data
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Cliente
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Comissão
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {pedidos
                        .filter((p) => p.statusEntrega === "entregue")
                        .map((pedido) => (
                          <tr key={pedido.id}>
                            <td className="px-4 py-3 whitespace-nowrap">#{pedido.id.substring(6)}</td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              {new Date(pedido.dataEntrega || pedido.dataPedido).toLocaleDateString("pt-BR")}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">{pedido.comprador?.nome || "Cliente"}</td>
                            <td className="px-4 py-3 whitespace-nowrap font-medium text-green-600">
                              {pedido.comissaoEntrega.toFixed(2)} AOA
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              {pedido.comissaoPaga ? (
                                <Badge variant="outline" className="bg-green-100 text-green-800">
                                  Paga
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                                  Pendente
                                </Badge>
                              )}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[550px]">
            {selectedPedido && (
              <>
                <DialogHeader>
                  <DialogTitle>Detalhes da Entrega #{selectedPedido.id.substring(6)}</DialogTitle>
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
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Informações do Cliente</h4>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <p className="font-medium">{selectedPedido.comprador?.nome}</p>
                      <p className="text-sm">{selectedPedido.comprador?.email}</p>
                      <p className="text-sm">{selectedPedido.comprador?.telefone}</p>
                      <p className="text-sm">{selectedPedido.comprador?.morada}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Informações do Vendedor</h4>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <p className="font-medium">{selectedPedido.vendedor?.nome}</p>
                      <p className="text-sm">{selectedPedido.vendedor?.email}</p>
                      <p className="text-sm">{selectedPedido.vendedor?.telefone}</p>
                      <p className="text-sm">{selectedPedido.vendedor?.morada}</p>
                    </div>
                  </div>

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
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {selectedPedido.produtosDetalhados?.map((item: any, index: number) => (
                            <tr key={index}>
                              <td className="px-4 py-2 whitespace-nowrap">
                                {item.produto?.nome || "Produto indisponível"}
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap">{item.quantidade}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {selectedPedido.comissaoEntrega > 0 && (
                    <div className="bg-green-50 p-3 rounded-md border border-green-200">
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Comissão pela Entrega</h4>
                      <p className="text-lg font-bold text-green-600">
                        {selectedPedido.comissaoEntrega.toFixed(2)} AOA
                      </p>
                    </div>
                  )}
                </div>

                <DialogFooter>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => handleGeneratePDF(selectedPedido)}>
                      <FileDown className="mr-1 h-4 w-4" />
                      Gerar PDF
                    </Button>

                    {!selectedPedido.intermediarioId && (
                      <Button
                        className="bg-green-500 hover:bg-green-600"
                        onClick={() => handleAcceptDelivery(selectedPedido.id)}
                      >
                        <Check className="mr-1 h-4 w-4" />
                        Aceitar Entrega
                      </Button>
                    )}

                    {selectedPedido.statusEntrega === "aceito" && (
                      <Button
                        className="bg-green-500 hover:bg-green-600"
                        onClick={() => handleStartDelivery(selectedPedido.id)}
                      >
                        <Truck className="mr-1 h-4 w-4" />
                        Iniciar Entrega
                      </Button>
                    )}

                    {selectedPedido.statusEntrega === "em_andamento" && (
                      <Button
                        className="bg-green-500 hover:bg-green-600"
                        onClick={() => handleCompleteDelivery(selectedPedido.id)}
                      >
                        <Check className="mr-1 h-4 w-4" />
                        Confirmar Entrega
                      </Button>
                    )}
                  </div>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
