import { Metadata } from "next"
import { EvaDesignTool } from "@/components/eva-design-tool/eva-design-tool"

export const metadata: Metadata = {
  title: "Eva Design Tool | Transvolt Brand Portal",
  description: "Professional vector design editor with voice-driven Eva Bot AI design assistant.",
}

export default function EvaDesignToolPage() {
  return <EvaDesignTool />
}
