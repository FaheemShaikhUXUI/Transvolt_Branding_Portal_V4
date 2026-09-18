import { Metadata } from "next"
import { SavedPromptsNotesView } from "@/components/saved-prompts-notes/saved-prompts-notes-view"

export const metadata: Metadata = {
  title: "Saved Prompt & Notes | Graphics Library V2 | Transvolt Brand Portal",
  description:
    "Quick-reference storage and repository for prompts, copywriting guidelines, corporate notes, and links.",
}

export default function Page() {
  return <SavedPromptsNotesView />
}
