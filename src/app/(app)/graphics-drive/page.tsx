import { Metadata } from "next"
import { GraphicsDrivePage } from "@/components/graphics-drive/graphics-drive-page"

export const metadata: Metadata = {
  title: "Graphics Drive | Transvolt Brand Portal",
  description:
    "Google Drive & Windows Explorer style hierarchical asset manager with infinite nested folders and file upload storage.",
}

export default function Page() {
  return <GraphicsDrivePage />
}
