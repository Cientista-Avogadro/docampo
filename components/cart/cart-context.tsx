"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useToast } from "@/components/ui/use-toast"

type CartItem = {
  id: string
  nome: string
  preco: number
  quantidade: number
  vendedorId: string
  imagem: string
}

type CartContextType = {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantidade: number) => void
  clearCart: () => void
  getTotal: () => number
  getItemsCount: () => number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const { toast } = useToast()

  // Carregar carrinho do localStorage quando o componente montar
  useEffect(() => {
    const storedCart = localStorage.getItem("cart")
    if (storedCart) {
      try {
        setItems(JSON.parse(storedCart))
      } catch (error) {
        console.error("Erro ao carregar carrinho:", error)
        localStorage.removeItem("cart")
      }
    }
  }, [])

  // Salvar carrinho no localStorage quando mudar
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(items))
  }, [items])

  const addItem = (item: CartItem) => {
    setItems((prevItems) => {
      // Verificar se o item já existe no carrinho
      const existingItemIndex = prevItems.findIndex((i) => i.id === item.id)

      if (existingItemIndex >= 0) {
        // Se o item já existe, atualizar a quantidade
        const updatedItems = [...prevItems]
        updatedItems[existingItemIndex].quantidade += item.quantidade

        toast({
          title: "Produto atualizado",
          description: `Quantidade de ${item.nome} atualizada no carrinho.`,
        })

        return updatedItems
      } else {
        // Se o item não existe, adicionar ao carrinho
        toast({
          title: "Produto adicionado",
          description: `${item.nome} foi adicionado ao carrinho.`,
        })

        return [...prevItems, item]
      }
    })
  }

  const removeItem = (id: string) => {
    setItems((prevItems) => {
      const itemToRemove = prevItems.find((item) => item.id === id)
      if (itemToRemove) {
        toast({
          title: "Produto removido",
          description: `${itemToRemove.nome} foi removido do carrinho.`,
        })
      }
      return prevItems.filter((item) => item.id !== id)
    })
  }

  const updateQuantity = (id: string, quantidade: number) => {
    if (quantidade <= 0) {
      removeItem(id)
      return
    }

    setItems((prevItems) => prevItems.map((item) => (item.id === id ? { ...item, quantidade } : item)))
  }

  const clearCart = () => {
    setItems([])
    toast({
      title: "Carrinho limpo",
      description: "Todos os produtos foram removidos do carrinho.",
    })
  }

  const getTotal = () => {
    return items.reduce((total, item) => total + item.preco * item.quantidade, 0)
  }

  const getItemsCount = () => {
    return items.reduce((count, item) => count + item.quantidade, 0)
  }

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        getTotal,
        getItemsCount,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart deve ser usado dentro de um CartProvider")
  }
  return context
}
