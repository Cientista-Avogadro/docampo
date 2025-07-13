"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

export const columns: ColumnDef<any>[] = [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => {
      const id: string = row.getValue("id")
      return <div className="font-medium">{id.substring(0, 8)}</div>
    },
  },
  {
    accessorKey: "nome",
    header: "Nome",
  },
  {
    accessorKey: "preco",
    header: "Preço",
    cell: ({ row }) => {
      const preco: number = row.getValue("preco")
      return <div>{preco.toFixed(2)} AOA</div>
    },
  },
  {
    accessorKey: "estoque",
    header: "Estoque",
  },
  {
    accessorKey: "categoria",
    header: "Categoria",
    cell: ({ row }) => {
      const categoria: string = row.getValue("categoria")
      return (
        <Badge variant="outline" className="bg-green-100 text-green-800">
          {categoria}
        </Badge>
      )
    },
  },
  {
    accessorKey: "dataCadastro",
    header: "Data de Cadastro",
    cell: ({ row }) => {
      const date: string = row.getValue("dataCadastro")
      if (!date) return "N/A"

      try {
        return format(new Date(date), "dd/MM/yyyy")
      } catch (error) {
        return "Data inválida"
      }
    },
  },
]
