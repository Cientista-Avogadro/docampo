"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/context/auth-context"
import Link from "next/link"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Info } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { login } = useAuth()

  const [formData, setFormData] = useState({
    email: "",
    senha: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const success = await login(formData.email, formData.senha)

      if (success) {
        toast({
          title: "Login realizado com sucesso!",
          description: "Bem-vindo de volta à plataforma DÓCAMPO.",
        })

        router.push("/perfil")
      } else {
        toast({
          title: "Falha no login",
          description: "Email ou senha incorretos. Tente novamente.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erro no login",
        description: "Ocorreu um erro ao processar seu login. Tente novamente.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto bg-white rounded-lg border border-green-100 p-8">
        <h1 className="text-2xl font-bold text-center mb-6">Entrar na Plataforma</h1>

        <Alert className="mb-6 bg-blue-50 border-blue-200">
          <Info className="h-4 w-4 text-blue-500" />
          <AlertTitle>Acesso ao Painel Admin</AlertTitle>
          <AlertDescription>
            Para acessar o painel de administrador, use:
            <br />
            Email: admin@docampo.com
            <br />
            Senha: admin123
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              type="email"
              placeholder="Seu email"
              className="border-green-200 focus:border-green-500"
              required
            />
          </div>

          <div>
            <Label htmlFor="senha">Senha</Label>
            <Input
              id="senha"
              name="senha"
              value={formData.senha}
              onChange={handleChange}
              type="password"
              placeholder="Sua senha"
              className="border-green-200 focus:border-green-500"
              required
            />
          </div>

          <Button type="submit" className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3">
            ENTRAR
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Não tem uma conta?{" "}
            <Link href="/registro" className="text-green-500 hover:underline font-medium">
              Registre-se agora
            </Link>
          </p>
          <p className="text-sm text-gray-600 mt-2">
            <Link href="/recuperar-senha" className="text-green-500 hover:underline">
              Esqueceu sua senha?
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
