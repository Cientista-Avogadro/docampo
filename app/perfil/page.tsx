"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { updateUser } from "@/lib/file-storage"
import { PedidosComprador } from "@/components/perfil/pedidos-comprador"
import { ProdutosVendedor } from "@/components/perfil/produtos-vendedor"
import { PedidosVendedor } from "@/components/perfil/pedidos-vendedor"
import { PedidosIntermediario } from "@/components/perfil/pedidos-intermediario"

export default function PerfilPage() {
  const router = useRouter()
  const { user, isAuthenticated, logout } = useAuth()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    morada: "",
    codigoPostal: "",
  })

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    if (user) {
      setFormData({
        nome: user.nome || "",
        email: user.email || "",
        telefone: user.telefone || "",
        morada: user.morada || "",
        codigoPostal: user.codigoPostal || "",
      })
    }
  }, [isAuthenticated, user, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) return

    try {
      const updatedUser = {
        ...user,
        ...formData,
      }

      await updateUser(updatedUser)

      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram atualizadas com sucesso.",
      })
    } catch (error) {
      toast({
        title: "Erro ao atualizar",
        description: "Ocorreu um erro ao atualizar seu perfil. Tente novamente.",
        variant: "destructive",
      })
    }
  }

  if (!user) {
    return <div className="container mx-auto p-8 text-center">Carregando...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Meu Perfil</h1>

      <Tabs defaultValue="info">
        <TabsList className="mb-6">
          <TabsTrigger value="info">Informações Pessoais</TabsTrigger>

          {user.tipo === "comprador" && <TabsTrigger value="pedidos">Meus Pedidos</TabsTrigger>}

          {user.tipo === "vendedor" && (
            <>
              <TabsTrigger value="produtos">Meus Produtos</TabsTrigger>
              <TabsTrigger value="pedidos">Pedidos Recebidos</TabsTrigger>
            </>
          )}

          {user.tipo === "intermediario" && <TabsTrigger value="entregas">Entregas</TabsTrigger>}
        </TabsList>

        <TabsContent value="info">
          <Card>
            <CardHeader>
              <CardTitle>Informações Pessoais</CardTitle>
              <CardDescription>Atualize suas informações de perfil abaixo.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="nome">Nome Completo</Label>
                    <Input
                      id="nome"
                      name="nome"
                      value={formData.nome}
                      onChange={handleChange}
                      className="border-green-200 focus:border-green-500"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      type="email"
                      className="border-green-200 focus:border-green-500"
                    />
                  </div>

                  <div>
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input
                      id="telefone"
                      name="telefone"
                      value={formData.telefone}
                      onChange={handleChange}
                      className="border-green-200 focus:border-green-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="morada">Morada</Label>
                    <Input
                      id="morada"
                      name="morada"
                      value={formData.morada}
                      onChange={handleChange}
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
                      className="border-green-200 focus:border-green-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-4">
                  <Button type="submit" className="bg-green-500 hover:bg-green-600">
                    Salvar Alterações
                  </Button>
                </div>
              </form>

              <Separator className="my-6" />

              <div>
                <h3 className="text-lg font-medium mb-4">Ações da Conta</h3>
                <div className="flex flex-wrap gap-4">
                  <Button
                    variant="outline"
                    className="border-red-300 text-red-500 hover:bg-red-50"
                    onClick={() => logout()}
                  >
                    Sair da Conta
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {user.tipo === "comprador" && (
          <TabsContent value="pedidos">
            <PedidosComprador userId={user.id} />
          </TabsContent>
        )}

        {user.tipo === "vendedor" && (
          <>
            <TabsContent value="produtos">
              <ProdutosVendedor userId={user.id} />
            </TabsContent>

            <TabsContent value="pedidos">
              <PedidosVendedor userId={user.id} />
            </TabsContent>
          </>
        )}

        {user.tipo === "intermediario" && (
          <TabsContent value="entregas">
            <PedidosIntermediario userId={user.id} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
