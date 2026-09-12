import { Metadata } from "next"
import { GraphicsLibraryPage } from "@/components/graphics-repository/graphics-repository-page"

export const metadata: Metadata = {
  title: "Graphics Library | Transvolt Brand Portal",
  description: "Centralised library for storing and managing approved Transvolt graphics and creative files.",
}

export default function Page() {
  return <GraphicsLibraryPage />
}
