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
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "tipo",
    header: "Tipo",
    cell: ({ row }) => {
      const tipo: string = row.getValue("tipo")

      let badgeClass = ""
      let label = ""

      switch (tipo) {
        case "admin":
          badgeClass = "bg-purple-100 text-purple-800"
          label = "Administrador"
          break
        case "comprador":
          badgeClass = "bg-blue-100 text-blue-800"
          label = "Comprador"
          break
        case "vendedor":
          badgeClass = "bg-green-100 text-green-800"
          label = "Vendedor"
          break
        case "intermediario":
          badgeClass = "bg-orange-100 text-orange-800"
          label = "Intermediário"
          break
        default:
          badgeClass = "bg-gray-100 text-gray-800"
          label = tipo
      }

      return (
        <Badge variant="outline" className={badgeClass}>
          {label}
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
