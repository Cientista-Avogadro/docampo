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
    accessorKey: "compradorId",
    header: "Comprador",
    cell: ({ row }) => {
      const id: string = row.getValue("compradorId")
      return <div>{id.substring(0, 8)}</div>
    },
  },
  {
    accessorKey: "vendedorId",
    header: "Vendedor",
    cell: ({ row }) => {
      const id: string = row.getValue("vendedorId")
      return <div>{id.substring(0, 8)}</div>
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status: string = row.getValue("status")

      let badgeClass = ""
      let label = ""

      switch (status) {
        case "pendente":
          badgeClass = "bg-yellow-100 text-yellow-800"
          label = "Pendente"
          break
        case "aceito":
          badgeClass = "bg-blue-100 text-blue-800"
          label = "Aceito"
          break
        case "em_transporte":
          badgeClass = "bg-purple-100 text-purple-800"
          label = "Em Transporte"
          break
        case "entregue":
          badgeClass = "bg-green-100 text-green-800"
          label = "Entregue"
          break
        case "cancelado":
          badgeClass = "bg-red-100 text-red-800"
          label = "Cancelado"
          break
        default:
          badgeClass = "bg-gray-100 text-gray-800"
          label = status
      }

      return (
        <Badge variant="outline" className={badgeClass}>
          {label}
        </Badge>
      )
    },
  },
  {
    accessorKey: "total",
    header: "Total",
    cell: ({ row }) => {
      const total: number = row.getValue("total")
      return <div className="font-medium">{total.toFixed(2)} AOA</div>
    },
  },
  {
    accessorKey: "dataPedido",
    header: "Data do Pedido",
    cell: ({ row }) => {
      const date: string = row.getValue("dataPedido")
      if (!date) return "N/A"

      try {
        return format(new Date(date), "dd/MM/yyyy")
      } catch (error) {
        return "Data inválida"
      }
    },
  },
]
