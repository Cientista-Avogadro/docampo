import { getImage } from "@/lib/file-storage"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const imageId = params.id
  const imageData = await getImage(imageId)

  if (!imageData) {
    return new NextResponse("Imagem não encontrada", { status: 404 })
  }

  // Extrair o tipo MIME e os dados da imagem do Data URL
  const matches = imageData.match(/^data:([A-Za-z-+/]+);base64,(.+)$/)

  if (!matches || matches.length !== 3) {
    return new NextResponse("Formato de imagem inválido", { status: 400 })
  }

  const contentType = matches[1]
  const base64Data = matches[2]
  const buffer = Buffer.from(base64Data, "base64")

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  })
}
