"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { getAllProducts, getAllCategories } from "@/lib/file-storage"
import { Search, Filter, ShoppingCart, Plus, Minus } from "lucide-react"
import Image from "next/image"
import { useCart } from "@/components/cart/cart-context"

export default function ProdutosPage() {
  const [produtos, setProdutos] = useState<any[]>([])
  const [categorias, setCategorias] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { addItem } = useCart()

  // Filtros
  const [searchTerm, setSearchTerm] = useState("")
  const [categoriaFiltro, setCategoriaFiltro] = useState("")
  const [precoMin, setPrecoMin] = useState("")
  const [precoMax, setPrecoMax] = useState("")
  const [showFilters, setShowFilters] = useState(false)

  // Quantidades para adicionar ao carrinho
  const [quantities, setQuantities] = useState<Record<string, number>>({})

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [produtosData, categoriasData] = await Promise.all([getAllProducts(), getAllCategories()])

        setProdutos(produtosData)
        setCategorias(categoriasData)

        // Inicializar quantidades
        const initialQuantities: Record<string, number> = {}
        produtosData.forEach((produto) => {
          initialQuantities[produto.id] = 1
        })
        setQuantities(initialQuantities)
      } catch (error) {
        console.error("Erro ao carregar dados:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const filteredProdutos = produtos.filter((produto) => {
    // Filtro por nome
    if (searchTerm && !produto.nome.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }

    // Filtro por categoria
    if (categoriaFiltro && categoriaFiltro !== "all" && produto.categoria !== categoriaFiltro) {
      return false
    }

    // Filtro por preço mínimo
    if (precoMin && produto.preco < Number.parseFloat(precoMin)) {
      return false
    }

    // Filtro por preço máximo
    if (precoMax && produto.preco > Number.parseFloat(precoMax)) {
      return false
    }

    return true
  })

  const handleResetFilters = () => {
    setSearchTerm("")
    setCategoriaFiltro("")
    setPrecoMin("")
    setPrecoMax("")
  }

  const handleAddToCart = (produto: any) => {
    addItem({
      id: produto.id,
      nome: produto.nome,
      preco: produto.preco,
      quantidade: quantities[produto.id],
      vendedorId: produto.vendedorId,
      imagem: produto.imagens[0] || "/placeholder.svg",
    })
  }

  const updateQuantity = (id: string, value: number) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: Math.max(1, value),
    }))
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Produtos</h1>
        <div className="text-center py-12">Carregando produtos...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Produtos</h1>

      <div className="mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative w-full md:w-2/3">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Pesquisar produtos..."
              className="pl-10 pr-4 py-2 rounded-md border-green-200 focus:border-green-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Button
            variant="outline"
            className="flex items-center gap-2 md:ml-auto"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4" />
            Filtros
          </Button>
        </div>

        {showFilters && (
          <div className="mt-4 p-4 border rounded-md bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Categoria</label>
                <Select value={categoriaFiltro} onValueChange={setCategoriaFiltro}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas as categorias" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as categorias</SelectItem>
                    {categorias.map((categoria) => (
                      <SelectItem key={categoria.id} value={categoria.id}>
                        {categoria.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Preço mínimo</label>
                <Input
                  type="number"
                  placeholder="Preço mínimo"
                  value={precoMin}
                  onChange={(e) => setPrecoMin(e.target.value)}
                  className="border-green-200 focus:border-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Preço máximo</label>
                <Input
                  type="number"
                  placeholder="Preço máximo"
                  value={precoMax}
                  onChange={(e) => setPrecoMax(e.target.value)}
                  className="border-green-200 focus:border-green-500"
                />
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <Button variant="outline" className="mr-2" onClick={handleResetFilters}>
                Limpar filtros
              </Button>
            </div>
          </div>
        )}
      </div>

      {filteredProdutos.length === 0 ? (
        <div className="text-center py-12">
          <ShoppingCart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-medium mb-2">Nenhum produto encontrado</h2>
          <p className="text-gray-500">Tente ajustar os filtros ou pesquisar por outro termo.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProdutos.map((produto) => (
            <Card key={produto.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <div className="relative h-48 w-full">
                <Image
                  src={produto.imagens[0] || "/placeholder.svg"}
                  alt={produto.nome}
                  fill
                  className="object-cover"
                />
              </div>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium line-clamp-2">{produto.nome}</h3>
                  <Badge variant="outline" className="bg-green-100 text-green-800 ml-2 shrink-0">
                    {categorias.find((c) => c.id === produto.categoria)?.nome || "Categoria"}
                  </Badge>
                </div>
                <p className="text-sm text-gray-500 mb-3 line-clamp-2">{produto.descricao}</p>
                <div className="flex justify-between items-center mb-3">
                  <p className="font-bold text-lg">{produto.preco.toFixed(2)} AOA</p>
                  <div className="text-sm text-gray-500">Estoque: {produto.estoque}</div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center border rounded-md">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-none"
                      onClick={() => updateQuantity(produto.id, quantities[produto.id] - 1)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center">{quantities[produto.id]}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-none"
                      onClick={() => updateQuantity(produto.id, quantities[produto.id] + 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>

                  <Button
                    size="sm"
                    className="bg-green-500 hover:bg-green-600"
                    onClick={() => handleAddToCart(produto)}
                  >
                    <ShoppingCart className="h-4 w-4 mr-1" />
                    Adicionar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
