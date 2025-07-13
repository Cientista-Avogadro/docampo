"use client"

import { ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/components/cart/cart-context"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

export function CartButton() {
  const { getItemsCount } = useCart()
  const itemCount = getItemsCount()

  return (
    <Link href="/carrinho">
      <Button variant="outline" className="relative">
        <ShoppingCart className="h-5 w-5 mr-2" />
        Carrinho
        {itemCount > 0 && <Badge className="absolute -top-2 -right-2 bg-green-500 text-white">{itemCount}</Badge>}
      </Button>
    </Link>
  )
}
