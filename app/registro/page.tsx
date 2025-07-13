"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"
import { saveUser } from "@/lib/file-storage"
import Link from "next/link"

export default function RegistroPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const tipoParam = searchParams.get("tipo")

  const [formData, setFormData] = useState({
    tipo: tipoParam === "empresa" ? "vendedor" : tipoParam || "comprador",
    nif: "",
    nome: "",
    dataNascimento: "",
    telefone: "",
    morada: "",
    codigoPostal: "",
    email: "",
    senha: "",
    aceitaTermos: false,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    })
  }

  const handleRadioChange = (value: string) => {
    setFormData({
      ...formData,
      tipo: value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.aceitaTermos) {
      toast({
        title: "Erro no formulário",
        description: "Você precisa aceitar os termos e condições para continuar.",
        variant: "destructive",
      })
      return
    }

    try {
      // Gerar ID único para o usuário
      const userId = `user_${Date.now()}`
      const userData = {
        id: userId,
        ...formData,
        dataCadastro: new Date().toISOString(),
      }

      // Salvar usuário no sistema de arquivos
      await saveUser(userData)

      toast({
        title: "Cadastro realizado com sucesso!",
        description: "Você já pode fazer login na plataforma.",
      })

      // Redirecionar para a página de login
      router.push("/login")
    } catch (error) {
      toast({
        title: "Erro ao cadastrar",
        description: "Ocorreu um erro ao processar seu cadastro. Tente novamente.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg border border-green-100 p-6">
        <h1 className="text-2xl font-bold text-center mb-6">Criar Conta</h1>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <Label className="text-base font-medium mb-2 block">EU SOU:</Label>
            <RadioGroup value={formData.tipo} onValueChange={handleRadioChange} className="flex gap-8">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="comprador" id="comprador" />
                <Label htmlFor="comprador" className="text-green-600 font-medium">
                  COMPRADOR
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="vendedor" id="vendedor" />
                <Label htmlFor="vendedor" className="text-green-600 font-medium">
                  VENDEDOR
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="intermediario" id="intermediario" />
                <Label htmlFor="intermediario" className="text-green-600 font-medium">
                  INTERMEDIÁRIO
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="nif">NIF</Label>
              <Input
                id="nif"
                name="nif"
                value={formData.nif}
                onChange={handleChange}
                placeholder="Insira o seu NIF"
                className="border-green-200 focus:border-green-500"
                required
              />
            </div>
            <div>
              <Label htmlFor="dataNascimento">DATA DE NASCIMENTO</Label>
              <Input
                id="dataNascimento"
                name="dataNascimento"
                value={formData.dataNascimento}
                onChange={handleChange}
                type="date"
                className="border-green-200 focus:border-green-500"
                required
              />
            </div>
            <div>
              <Label htmlFor="nome">NOME</Label>
              <Input
                id="nome"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                placeholder="Nome completo"
                className="border-green-200 focus:border-green-500"
                required
              />
            </div>
            <div>
              <Label htmlFor="telefone">TELEFONE</Label>
              <Input
                id="telefone"
                name="telefone"
                value={formData.telefone}
                onChange={handleChange}
                placeholder="Seu número de telefone"
                className="border-green-200 focus:border-green-500"
                required
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="morada">MORADA</Label>
              <Input
                id="morada"
                name="morada"
                value={formData.morada}
                onChange={handleChange}
                placeholder="Endereço completo"
                className="border-green-200 focus:border-green-500"
                required
              />
            </div>
            <div>
              <Label htmlFor="codigoPostal">CÓDIGO POSTAL</Label>
              <Input
                id="codigoPostal"
                name="codigoPostal"
                value={formData.codigoPostal}
                onChange={handleChange}
                placeholder="Código postal"
                className="border-green-200 focus:border-green-500"
                required
              />
            </div>
            <div>
              <Label htmlFor="email">EMAIL</Label>
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
              <Label htmlFor="senha">PALAVRA-PASSE</Label>
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
          </div>

          <div className="mt-6 flex items-center space-x-2">
            <Checkbox
              id="termos"
              name="aceitaTermos"
              checked={formData.aceitaTermos}
              onCheckedChange={(checked) => setFormData({ ...formData, aceitaTermos: checked as boolean })}
            />
            <Label htmlFor="termos" className="text-sm">
              Concordo com os{" "}
              <Link href="#" className="text-green-500 hover:underline">
                Termos
              </Link>{" "}
              e{" "}
              <Link href="#" className="text-green-500 hover:underline">
                Política de Privacidade
              </Link>{" "}
              DÓCAMPO
            </Label>
          </div>

          <Button type="submit" className="mt-6 w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3">
            GRAVAR
          </Button>
        </form>
      </div>
    </div>
  )
}
