"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Upload, X } from "lucide-react"
import Image from "next/image"
import { saveImage } from "@/lib/file-storage"

interface ImageUploadProps {
  onImageUpload: (imageUrl: string) => void
  existingImage?: string
}

export function ImageUpload({ onImageUpload, existingImage }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(existingImage || null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)

    try {
      // Ler o arquivo como Data URL
      const reader = new FileReader()
      reader.onloadend = async () => {
        const base64String = reader.result as string

        // Gerar um ID único para a imagem
        const imageId = `img_${Date.now()}`

        // Salvar a imagem no armazenamento
        await saveImage(imageId, base64String)

        // Usar o ID da imagem como URL
        const imageUrl = `/api/images/${imageId}`

        setPreview(base64String)
        onImageUpload(imageUrl)
        setIsUploading(false)
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error("Erro ao fazer upload da imagem:", error)
      setIsUploading(false)
    }
  }

  const handleRemoveImage = () => {
    setPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    onImageUpload("")
  }

  return (
    <div className="space-y-2">
      <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" ref={fileInputRef} />

      {preview ? (
        <div className="relative h-40 w-full">
          <Image src={preview || "/placeholder.svg"} alt="Preview" fill className="object-cover rounded-md" />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8 rounded-full"
            onClick={handleRemoveImage}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div
          className="border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center justify-center cursor-pointer hover:border-green-500 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-10 w-10 text-gray-400 mb-2" />
          <p className="text-sm text-gray-500">Clique para fazer upload de uma imagem</p>
          <p className="text-xs text-gray-400 mt-1">PNG, JPG, GIF até 5MB</p>
        </div>
      )}

      {!preview && (
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          {isUploading ? "Enviando..." : "Selecionar Imagem"}
        </Button>
      )}
    </div>
  )
}
