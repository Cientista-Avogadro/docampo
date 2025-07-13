// Simulação de armazenamento baseado em arquivos
// Em um cenário real, isso seria implementado com o sistema de arquivos do Node.js

// Tipos de dados
type User = {
  id: string
  tipo: string
  nome: string
  email: string
  senha: string
  [key: string]: any
}

type Product = {
  id: string
  nome: string
  descricao: string
  preco: number
  estoque: number
  categoria: string
  vendedorId: string
  imagens: string[]
  dataCadastro: string
}

type Category = {
  id: string
  nome: string
  descricao: string
}

type Order = {
  id: string
  compradorId: string
  vendedorId: string
  intermediarioId: string | null
  produtos: {
    produtoId: string
    quantidade: number
    precoUnitario: number
  }[]
  status: "pendente" | "aceito" | "em_transporte" | "entregue" | "cancelado"
  total: number
  dataPedido: string
  dataEntrega: string | null
  entrega: boolean
  statusEntrega: "pendente" | "aceito" | "em_andamento" | "entregue" | null
  comissaoEntrega: number
  comissaoPaga: boolean
}

// Armazenamento em memória (simulando arquivos)
const users: User[] = []
const products: Product[] = []
const categories: Category[] = []
const orders: Order[] = []

// Armazenamento de imagens (simulando um sistema de arquivos)
const imageStorage: Record<string, string> = {}

// Funções para usuários
export async function saveUser(userData: User): Promise<User> {
  // Verificar se o email já existe
  const existingUser = users.find((user) => user.email === userData.email)
  if (existingUser) {
    throw new Error("Email já cadastrado")
  }

  users.push(userData)
  return userData
}

export async function updateUser(userData: User): Promise<User> {
  const index = users.findIndex((user) => user.id === userData.id)
  if (index === -1) {
    throw new Error("Usuário não encontrado")
  }

  users[index] = userData
  return userData
}

export async function getUserById(id: string): Promise<User | null> {
  return users.find((user) => user.id === id) || null
}

export async function getUserByEmail(email: string): Promise<User | null> {
  return users.find((user) => user.email === email) || null
}

export async function getAllUsers(): Promise<User[]> {
  return users
}

// Funções para produtos
export async function saveProduct(productData: Product): Promise<Product> {
  products.push(productData)
  return productData
}

export async function updateProduct(productData: Product): Promise<Product> {
  const index = products.findIndex((product) => product.id === productData.id)
  if (index === -1) {
    throw new Error("Produto não encontrado")
  }

  products[index] = productData
  return productData
}

export async function getProductById(id: string): Promise<Product | null> {
  return products.find((product) => product.id === id) || null
}

export async function getProductsByVendor(vendorId: string): Promise<Product[]> {
  return products.filter((product) => product.vendedorId === vendorId)
}

export async function getAllProducts(): Promise<Product[]> {
  return products
}

// Funções para categorias
export async function saveCategory(categoryData: Category): Promise<Category> {
  categories.push(categoryData)
  return categoryData
}

export async function getCategoryById(id: string): Promise<Category | null> {
  return categories.find((category) => category.id === id) || null
}

export async function getAllCategories(): Promise<Category[]> {
  return categories
}

// Funções para pedidos
export async function saveOrder(orderData: Order): Promise<Order> {
  orders.push(orderData)

  // Em um cenário real, aqui seria enviada uma notificação ao vendedor
  console.log(`Novo pedido ${orderData.id} registrado para o vendedor ${orderData.vendedorId}`)

  return orderData
}

export async function updateOrder(orderData: Order): Promise<Order> {
  const index = orders.findIndex((order) => order.id === orderData.id)
  if (index === -1) {
    throw new Error("Pedido não encontrado")
  }

  orders[index] = orderData
  return orderData
}

export async function getOrderById(id: string): Promise<Order | null> {
  return orders.find((order) => order.id === id) || null
}

export async function getOrdersByBuyer(buyerId: string): Promise<Order[]> {
  return orders.filter((order) => order.compradorId === buyerId)
}

export async function getOrdersBySeller(sellerId: string): Promise<Order[]> {
  return orders.filter((order) => order.vendedorId === sellerId)
}

export async function getOrdersByIntermediary(intermediaryId: string): Promise<Order[]> {
  return orders.filter((order) => order.intermediarioId === intermediaryId)
}

export async function getOrdersForDelivery(): Promise<Order[]> {
  return orders.filter((order) => order.entrega && order.statusEntrega === "pendente")
}

export async function getAllOrders(): Promise<Order[]> {
  return orders
}

// Funções para imagens
export async function saveImage(imageId: string, imageData: string): Promise<string> {
  imageStorage[imageId] = imageData
  return imageId
}

export async function getImage(imageId: string): Promise<string | null> {
  return imageStorage[imageId] || null
}

// Inicializar com alguns dados de exemplo
export function initializeData() {
  // Usuário admin
  users.push({
    id: "admin_1",
    tipo: "admin",
    nome: "Administrador",
    email: "admin@docampo.com",
    senha: "admin123",
    dataCadastro: new Date().toISOString(),
  })

  // Alguns vendedores
  users.push({
    id: "vendor_1",
    tipo: "vendedor",
    nome: "João Silva",
    email: "joao@exemplo.com",
    senha: "senha123",
    telefone: "+244 900 111 222",
    morada: "Rua das Flores, 123",
    codigoPostal: "1000-001",
    dataCadastro: new Date().toISOString(),
  })

  // Alguns compradores
  users.push({
    id: "buyer_1",
    tipo: "comprador",
    nome: "Maria Santos",
    email: "maria@exemplo.com",
    senha: "senha123",
    telefone: "+244 900 333 444",
    morada: "Avenida Central, 456",
    codigoPostal: "1000-002",
    dataCadastro: new Date().toISOString(),
  })

  // Alguns intermediários
  users.push({
    id: "intermediary_1",
    tipo: "intermediario",
    nome: "Carlos Oliveira",
    email: "carlos@exemplo.com",
    senha: "senha123",
    telefone: "+244 900 555 666",
    morada: "Rua do Comércio, 789",
    codigoPostal: "1000-003",
    dataCadastro: new Date().toISOString(),
  })

  // Algumas categorias
  categories.push({
    id: "category_1",
    nome: "Frutas",
    descricao: "Frutas frescas de produtores locais",
  })

  categories.push({
    id: "category_2",
    nome: "Vegetais",
    descricao: "Vegetais frescos e orgânicos",
  })

  categories.push({
    id: "category_3",
    nome: "Grãos",
    descricao: "Grãos e cereais de alta qualidade",
  })

  // Alguns produtos
  products.push({
    id: "product_1",
    nome: "Tomates Orgânicos",
    descricao: "Tomates frescos cultivados sem pesticidas",
    preco: 5.99,
    estoque: 100,
    categoria: "category_2",
    vendedorId: "vendor_1",
    imagens: ["/placeholder.svg?height=200&width=200"],
    dataCadastro: new Date().toISOString(),
  })

  products.push({
    id: "product_2",
    nome: "Bananas",
    descricao: "Bananas maduras e doces",
    preco: 3.49,
    estoque: 150,
    categoria: "category_1",
    vendedorId: "vendor_1",
    imagens: ["/placeholder.svg?height=200&width=200"],
    dataCadastro: new Date().toISOString(),
  })

  // Alguns pedidos
  orders.push({
    id: "order_1",
    compradorId: "buyer_1",
    vendedorId: "vendor_1",
    intermediarioId: "intermediary_1",
    produtos: [
      {
        produtoId: "product_1",
        quantidade: 5,
        precoUnitario: 5.99,
      },
      {
        produtoId: "product_2",
        quantidade: 3,
        precoUnitario: 3.49,
      },
    ],
    status: "aceito",
    total: 40.42,
    dataPedido: new Date().toISOString(),
    dataEntrega: null,
    entrega: true,
    statusEntrega: "aceito",
    comissaoEntrega: 5.0,
    comissaoPaga: false,
  })
}

// Inicializar dados
initializeData()
