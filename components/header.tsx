"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Search, Menu, User } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { CartButton } from "@/components/cart/cart-button"

export default function Header() {
  const pathname = usePathname()
  const { user, isAuthenticated } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-200 ${
        isScrolled ? "bg-white shadow-md" : "bg-white"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <div className="relative h-10 w-32">
                <Image
                  src="/placeholder.svg?height=40&width=128"
                  alt="DÓCAMPO"
                  width={128}
                  height={40}
                  className="object-contain"
                />
              </div>
              <span className="ml-2 text-xs text-green-500 hidden sm:inline-block">
                MARKET
                <br />
                PLACE
              </span>
            </Link>
          </div>

          <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="O QUE PROCURA..."
                className="pl-10 pr-4 py-2 rounded-full border-green-500 focus:border-green-600"
              />
              <Button
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 bg-green-500 hover:bg-green-600 rounded-full h-7 w-7"
              >
                <Search className="h-4 w-4 text-white" />
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <>
              <Link href="/produtos" className="hidden md:flex items-center text-green-500 font-medium">
                PRODUTOS
              </Link>
              <CartButton />
            </>
            {isAuthenticated ? (
              <>
                <Link href="/perfil">
                  <Button className="bg-green-500 hover:bg-green-600">
                    <User className="mr-2 h-4 w-4" />
                    MEU PERFIL
                  </Button>
                </Link>
                {user?.tipo === "admin" && (
                  <Link href="/admin">
                    <Button variant="outline" className="border-green-500 text-green-500">
                      ADMIN
                    </Button>
                  </Link>
                )}
              </>
            ) : (
              <Link href="/login">
                <Button className="bg-green-500 hover:bg-green-600">ENTRAR/REGISTO</Button>
              </Link>
            )}

            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <div className="flex flex-col gap-6 mt-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="O QUE PROCURA..."
                      className="pl-10 pr-4 py-2 rounded-full border-green-500 focus:border-green-600"
                    />
                  </div>

                  <nav className="flex flex-col gap-4">
                    <Link
                      href="/"
                      className={`text-lg font-medium ${pathname === "/" ? "text-green-500" : "text-gray-600"}`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Início
                    </Link>
                    <Link
                      href="/produtos"
                      className={`text-lg font-medium ${pathname === "/produtos" ? "text-green-500" : "text-gray-600"}`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Produtos
                    </Link>
                    {isAuthenticated ? (
                      <>
                        <Link
                          href="/perfil"
                          className={`text-lg font-medium ${pathname === "/perfil" ? "text-green-500" : "text-gray-600"}`}
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          Meu Perfil
                        </Link>
                        {user?.tipo === "admin" && (
                          <Link
                            href="/admin"
                            className={`text-lg font-medium ${pathname === "/admin" ? "text-green-500" : "text-gray-600"}`}
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            Painel Admin
                          </Link>
                        )}
                      </>
                    ) : (
                      <>
                        <Link
                          href="/login"
                          className={`text-lg font-medium ${pathname === "/login" ? "text-green-500" : "text-gray-600"}`}
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          Entrar
                        </Link>
                        <Link
                          href="/registro"
                          className={`text-lg font-medium ${pathname === "/registro" ? "text-green-500" : "text-gray-600"}`}
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          Registrar
                        </Link>
                      </>
                    )}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
