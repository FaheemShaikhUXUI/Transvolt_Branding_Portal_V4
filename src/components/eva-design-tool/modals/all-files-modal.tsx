"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Folder,
  FileText,
  Search,
  Filter,
  Plus,
  Download,
  MoreVertical,
  Bookmark,
  Archive,
  Check,
} from "lucide-react"
import { FileItem } from "@/types/eva-editor"
import { toast } from "sonner"

interface AllFilesModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onOpenSavedPrompts?: () => void
}

const INITIAL_FILES: FileItem[] = [
  {
    srNo: 1,
    id: "f-1",
    name: "Brand Guidelines & Rules",
    type: "Folder",
    itemCountOrSize: "2 folders, 3 files",
    dateModified: "Sep 15, 2025",
    color: "#10b981",
  },
  {
    srNo: 2,
    id: "f-2",
    name: "Corporate Stationery",
    type: "Folder",
    itemCountOrSize: "4 folders, 5 files",
    dateModified: "Sep 15, 2025",
    color: "#8b5cf6",
  },
  {
    srNo: 3,
    id: "f-3",
    name: "Nadhydbdfvbfdva",
    type: "Folder",
    itemCountOrSize: "Empty",
    dateModified: "Sep 16, 2025",
    color: "#3b82f6",
  },
  {
    srNo: 4,
    id: "f-4",
    name: "Marketing & Expo Campaigns",
    type: "Folder",
    itemCountOrSize: "11 folders, 5 files",
    dateModified: "Sep 16, 2025",
    color: "#f97316",
  },
  {
    srNo: 5,
    id: "f-5",
    name: "Official Logos & Vector Kits",
    type: "Folder",
    itemCountOrSize: "2 folders, 5 files",
    dateModified: "Sep 17, 2025",
    color: "#3b82f6",
  },
  {
    srNo: 6,
    id: "f-6",
    name: "sdvewdescdewdc",
    type: "Folder",
    itemCountOrSize: "Empty",
    dateModified: "Sep 18, 2025",
    color: "#3b82f6",
  },
  {
    srNo: 7,
    id: "f-7",
    name: "Transvolt_Design_Repository_Overview.pdf",
    type: "PDF",
    itemCountOrSize: "852 KB",
    dateModified: "Sep 18, 2025",
    color: "#ef4444",
  },
]

export function AllFilesModal({
  open,
  onOpenChange,
  onOpenSavedPrompts,
}: AllFilesModalProps) {
  const [files, setFiles] = React.useState<FileItem[]>(INITIAL_FILES)
  const [searchQuery, setSearchQuery] = React.useState("")

  const filteredFiles = files.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleCreateFolder = () => {
    const name = prompt("Enter folder name:")
    if (!name) return
    const newFolder: FileItem = {
      srNo: files.length + 1,
      id: `f-${Date.now()}`,
      name,
      type: "Folder",
      itemCountOrSize: "Empty",
      dateModified: "Just now",
      color: "#3b82f6",
    }
    setFiles([newFolder, ...files])
    toast.success(`Folder "${name}" created!`)
  }

  const handleExportZip = () => {
    toast.info("Preparing ZIP archive of all design assets...")
    setTimeout(() => {
      toast.success("Design assets bundle downloaded as ZIP!")
    }, 1200)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[88vh] overflow-hidden flex flex-col p-6 rounded-2xl">
        <DialogHeader className="flex flex-row items-center justify-between border-b border-border/70 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-amber-500/15 text-amber-500">
              <Folder className="h-4 w-4 fill-amber-500" />
            </div>
            <DialogTitle className="text-lg font-bold text-foreground">
              All Files
            </DialogTitle>
          </div>

          <div className="flex items-center gap-2">
            {/* Search Input */}
            <div className="relative w-52 sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search files & folders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 text-xs h-8 rounded-lg bg-background/80"
              />
            </div>

            {/* Filter */}
            <Button variant="outline" size="sm" className="h-8 gap-1 text-xs border-border/70">
              <Filter className="h-3.5 w-3.5 text-muted-foreground" />
              Filter
            </Button>

            {/* Saved Prompt & Notes */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onOpenChange(false)
                onOpenSavedPrompts?.()
              }}
              className="h-8 gap-1.5 text-xs border-border/70 hover:border-emerald-500/40"
            >
              <Bookmark className="h-3.5 w-3.5 text-emerald-600" />
              Saved Prompt & Notes
            </Button>

            {/* New Folder (Green Button as in screenshot) */}
            <Button
              size="sm"
              onClick={handleCreateFolder}
              className="h-8 gap-1.5 text-xs bg-[#10b981] hover:bg-[#059669] text-white font-semibold rounded-lg shadow-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              New Folder
            </Button>
          </div>
        </DialogHeader>

        {/* ─── Files Table ────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto overlay-scrollbar py-2 text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border/60 text-muted-foreground text-[11px] font-bold uppercase tracking-wider">
                <th className="py-2.5 px-3 w-14">Sr. No.</th>
                <th className="py-2.5 px-3">Name</th>
                <th className="py-2.5 px-3 w-28">Type</th>
                <th className="py-2.5 px-3 w-36">Size / Count</th>
                <th className="py-2.5 px-3 w-32">Date Modified</th>
                <th className="py-2.5 px-3 w-16 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 font-medium">
              {filteredFiles.map((file, idx) => (
                <tr
                  key={file.id}
                  className="hover:bg-muted/40 transition-colors group cursor-pointer"
                  onClick={() => {
                    toast.info(`Opening ${file.name}...`)
                  }}
                >
                  <td className="py-3 px-3 text-muted-foreground">{idx + 1}</td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2.5">
                      {file.type === "Folder" ? (
                        <Folder
                          className="h-4 w-4 shrink-0"
                          style={{ fill: file.color || "#3b82f6", color: file.color || "#3b82f6" }}
                        />
                      ) : (
                        <FileText
                          className="h-4 w-4 shrink-0"
                          style={{ color: file.color || "#ef4444" }}
                        />
                      )}
                      <span className="font-semibold text-foreground group-hover:text-[#10b981] transition-colors">
                        {file.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-muted-foreground">{file.type}</span>
                  </td>
                  <td className="py-3 px-3 text-muted-foreground">{file.itemCountOrSize}</td>
                  <td className="py-3 px-3 text-muted-foreground">{file.dateModified}</td>
                  <td className="py-3 px-3 text-center">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation()
                        toast.info(`Actions for ${file.name}`)
                      }}
                      className="h-7 w-7 text-muted-foreground hover:text-foreground"
                    >
                      <MoreVertical className="h-3.5 w-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ─── Bottom Actions Bar ─────────────────────────────────── */}
        <div className="pt-3 border-t border-border/70 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleExportZip}
            className="gap-2 text-xs text-muted-foreground hover:text-foreground font-semibold"
          >
            <Archive className="h-4 w-4" />
            Export All Files in Zip
          </Button>

          <Button
            size="sm"
            onClick={() => {
              onOpenChange(false)
              toast.success("Files saved successfully!")
            }}
            className="px-6 h-9 bg-[#10b981] hover:bg-[#059669] text-white font-bold rounded-xl shadow-xs"
          >
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
