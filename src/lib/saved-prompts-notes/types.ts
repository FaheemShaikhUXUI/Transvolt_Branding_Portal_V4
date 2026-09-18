export type SavedItemType = "prompt" | "note" | "link"

export interface SavedItem {
  id: string
  title: string
  content: string
  type: SavedItemType
  createdAt: string
  updatedAt: string
}
