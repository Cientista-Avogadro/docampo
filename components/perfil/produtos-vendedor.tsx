"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getProductsByVendor, getAllCategories, saveProduct, updateProduct } from "@/lib/file-storage"
import { Edit, Plus, Package } from "lucide-react"
import Image from "next/image"
import { useToast } from "@/components/ui/use-toast"
import { ImageUpload } from "@/components/image-upload"

type ProdutosVendedorProps = {
  userId: string
}

export function ProdutosVendedor({ userId }: ProdutosVendedorProps) {
  const [produtos, setProdutos] = useState<any[]>([])
  const [categorias, setCategorias] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    id: "",
    nome: "",
    descricao: "",
    preco: "",
    estoque: "",
    categoria: "",
    imagens: ["/placeholder.svg?height=200&width=200"],
  })
  const [isEditing, setIsEditing] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [produtosData, categoriasData] = await Promise.all([getProductsByVendor(userId), getAllCategories()])

        setProdutos(produtosData)
        setCategorias(categoriasData)
      } catch (error) {
        console.error("Erro ao carregar dados:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [userId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleImageUpload = (imageUrl: string) => {
    if (imageUrl) {
      setFormData({
        ...formData,
        imagens: [imageUrl],
      })
    } else {
      setFormData({
        ...formData,
        imagens: ["/placeholder.svg?height=200&width=200"],
      })
    }
  }

  const resetForm = () => {
    setFormData({
      id: "",
      nome: "",
      descricao: "",
      preco: "",
      estoque: "",
      categoria: "",
      imagens: ["/placeholder.svg?height=200&width=200"],
    })
    setIsEditing(false)
  }

  const handleEditProduto = (produto: any) => {
    setFormData({
      id: produto.id,
      nome: produto.nome,
      descricao: produto.descricao,
      preco: produto.preco.toString(),
      estoque: produto.estoque.toString(),
      categoria: produto.categoria,
      imagens: produto.imagens,
    })
    setIsEditing(true)
    setIsDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const produtoData = {
        id: isEditing ? formData.id : `product_${Date.now()}`,
        nome: formData.nome,
        descricao: formData.descricao,
        preco: Number.parseFloat(formData.preco),
        estoque: Number.parseInt(formData.estoque),
        categoria: formData.categoria,
        vendedorId: userId,
        imagens: formData.imagens,
        dataCadastro: isEditing ? produtos.find((p) => p.id === formData.id)?.dataCadastro : new Date().toISOString(),
      }

      if (isEditing) {
        await updateProduct(produtoData)
        setProdutos(produtos.map((p) => (p.id === produtoData.id ? produtoData : p)))
        toast({
          title: "Produto atualizado",
          description: "O produto foi atualizado com sucesso.",
        })
      } else {
        await saveProduct(produtoData)
        setProdutos([...produtos, produtoData])
        toast({
          title: "Produto cadastrado",
          description: "O produto foi cadastrado com sucesso.",
        })
      }

      setIsDialogOpen(false)
      resetForm()
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar o produto. Tente novamente.",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Meus Produtos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Carregando produtos...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Meus Produtos</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              className="bg-green-500 hover:bg-green-600"
              onClick={() => {
                resetForm()
                setIsDialogOpen(true)
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Produto
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>{isEditing ? "Editar Produto" : "Adicionar Novo Produto"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="nome">Nome do Produto</Label>
                  <Input id="nome" name="nome" value={formData.nome} onChange={handleChange} required />
                </div>

                <div>
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea
                    id="descricao"
                    name="descricao"
                    value={formData.descricao}
                    onChange={handleChange}
                    rows={3}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="preco">Preço (AOA)</Label>
                    <Input
                      id="preco"
                      name="preco"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.preco}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="estoque">Estoque</Label>
                    <Input
                      id="estoque"
                      name="estoque"
                      type="number"
                      min="0"
                      value={formData.estoque}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="categoria">Categoria</Label>
                  <Select value={formData.categoria} onValueChange={(value) => handleSelectChange("categoria", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categorias.map((categoria) => (
                        <SelectItem key={categoria.id} value={categoria.id}>
                          {categoria.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Imagem do Produto</Label>
                  <ImageUpload
                    onImageUpload={handleImageUpload}
                    existingImage={formData.imagens[0].startsWith("/api/images/") ? formData.imagens[0] : undefined}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    resetForm()
                    setIsDialogOpen(false)
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit" className="bg-green-500 hover:bg-green-600">
                  {isEditing ? "Atualizar" : "Adicionar"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {produtos.length === 0 ? (
          <div className="text-center py-8 flex flex-col items-center">
            <Package className="h-12 w-12 text-gray-300 mb-2" />
            <p className="text-gray-500">Você ainda não cadastrou nenhum produto.</p>
            <Button className="mt-4 bg-green-500 hover:bg-green-600" onClick={() => setIsDialogOpen(true)}>
              Adicionar Primeiro Produto
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {produtos.map((produto) => (
              <div key={produto.id} className="border rounded-lg overflow-hidden">
                <div className="relative h-40 w-full">
                  <Image
                    src={produto.imagens[0] || "/placeholder.svg"}
                    alt={produto.nome}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium">{produto.nome}</h3>
                    <Badge variant="outline" className="bg-green-100 text-green-800">
                      {categorias.find((c) => c.id === produto.categoria)?.nome || "Sem categoria"}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{produto.descricao}</p>
                  <div className="mt-2 flex justify-between items-center">
                    <p className="font-bold">{produto.preco.toFixed(2)} AOA</p>
                    <p className="text-sm text-gray-500">Estoque: {produto.estoque}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3 w-full"
                    onClick={() => handleEditProduto(produto)}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Editar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
