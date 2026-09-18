import { Metadata } from "next"
import { GraphicsLibraryV2Page } from "@/components/graphics-library-v2/graphics-library-v2-page"

export const metadata: Metadata = {
  title: "Graphics Library V2 | Transvolt Brand Portal",
  description:
    "Google Drive & Windows Explorer style hierarchical asset manager with infinite nested folders and file upload storage.",
}

export default function Page() {
  return <GraphicsLibraryV2Page />
}
