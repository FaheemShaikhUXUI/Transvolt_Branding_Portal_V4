import { CanvasObject, DocumentSettings, ToolType } from "@/types/eva-editor"

export type EditorCommandType =
  | "CREATE_OBJECT"
  | "CREATE_OBJECTS"
  | "DELETE_OBJECT"
  | "UPDATE_OBJECT"
  | "MOVE_OBJECT"
  | "RESIZE_OBJECT"
  | "ROTATE_OBJECT"
  | "SET_FILL"
  | "SET_STROKE"
  | "SET_OPACITY"
  | "SET_TEXT"
  | "SET_SHADOW"
  | "SET_BLEND_MODE"
  | "DUPLICATE_OBJECT"
  | "ALIGN_OBJECT"
  | "BRING_TO_FRONT"
  | "SEND_TO_BACK"
  | "CHANGE_BACKGROUND"
  | "SELECT_OBJECT"
  | "CHANGE_TOOL"
  | "OPEN_MODAL"
  | "TOGGLE_RULERS"
  | "SET_ORIENTATION"
  | "CLEAR_CANVAS"
  | "AUTO_REFINE_CANVAS"
  | "UNDO"
  | "REDO"
  | "ZOOM"

export interface EditorCommand {
  type: EditorCommandType
  payload?: any
  description?: string
}

export interface EditorHistoryEntry {
  objects: CanvasObject[]
  selectedIds: string[]
  settings: DocumentSettings
  actionDescription: string
}

export class EditorCommandBus {
  private history: EditorHistoryEntry[] = []
  private historyIndex: number = -1
  private maxHistory: number = 50

  public pushState(
    objects: CanvasObject[],
    selectedIds: string[],
    settings: DocumentSettings,
    description: string = "Action"
  ) {
    // If we branched after an undo, truncate redo stack
    if (this.historyIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.historyIndex + 1)
    }

    // Deep clone state snapshot
    const entry: EditorHistoryEntry = {
      objects: JSON.parse(JSON.stringify(objects)),
      selectedIds: [...selectedIds],
      settings: JSON.parse(JSON.stringify(settings)),
      actionDescription: description,
    }

    this.history.push(entry)
    if (this.history.length > this.maxHistory) {
      this.history.shift()
    } else {
      this.historyIndex++
    }
  }

  public canUndo(): boolean {
    return this.historyIndex > 0
  }

  public canRedo(): boolean {
    return this.historyIndex < this.history.length - 1
  }

  public undo(): EditorHistoryEntry | null {
    if (!this.canUndo()) return null
    this.historyIndex--
    return JSON.parse(JSON.stringify(this.history[this.historyIndex]))
  }

  public redo(): EditorHistoryEntry | null {
    if (!this.canRedo()) return null
    this.historyIndex++
    return JSON.parse(JSON.stringify(this.history[this.historyIndex]))
  }

  public getCurrentHistoryDescription(): string {
    if (this.historyIndex >= 0 && this.historyIndex < this.history.length) {
      return this.history[this.historyIndex].actionDescription
    }
    return "Initial State"
  }
}
