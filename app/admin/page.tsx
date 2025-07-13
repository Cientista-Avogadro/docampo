"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getAllUsers, getAllProducts, getAllCategories, getAllOrders } from "@/lib/file-storage"
import { BarChart, DollarSign, Package, Users } from "lucide-react"
import { DataTable } from "@/components/data-table"
import { columns as userColumns } from "@/components/admin/user-columns"
import { columns as productColumns } from "@/components/admin/product-columns"
import { columns as orderColumns } from "@/components/admin/order-columns"

export default function AdminPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()

  const [users, setUsers] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalCategories: 0,
    totalSales: 0,
  })

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    // Verificar se o usuário é admin
    if (user?.tipo !== "admin") {
      router.push("/perfil")
      return
    }

    const fetchData = async () => {
      try {
        const usersData = await getAllUsers()
        const productsData = await getAllProducts()
        const categoriesData = await getAllCategories()
        const ordersData = await getAllOrders()

        setUsers(usersData)
        setProducts(productsData)
        setCategories(categoriesData)
        setOrders(ordersData)

        // Calcular estatísticas
        const totalSales = ordersData.reduce((acc, order) => acc + order.total, 0)

        setStats({
          totalUsers: usersData.length,
          totalProducts: productsData.length,
          totalCategories: categoriesData.length,
          ries: categoriesData.length,
          totalSales: totalSales,
        })
      } catch (error) {
        console.error("Erro ao carregar dados:", error)
      }
    }

    fetchData()
  }, [isAuthenticated, user, router])

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Painel Administrativo</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Produtos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Categorias</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCategories}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Vendas</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSales.toFixed(2)} AOA</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users">
        <TabsList className="mb-6">
          <TabsTrigger value="users">Usuários</TabsTrigger>
          <TabsTrigger value="products">Produtos</TabsTrigger>
          <TabsTrigger value="orders">Pedidos</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Usuários Cadastrados</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable columns={userColumns} data={users} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle>Produtos Cadastrados</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable columns={productColumns} data={products} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Pedidos Realizados</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable columns={orderColumns} data={orders} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
