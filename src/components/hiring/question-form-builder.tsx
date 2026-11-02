"use client"

import React, { useState } from "react"
import {
  CandidateFormQuestion,
  FormQuestionCategory,
  QuestionFieldType,
  RecruitmentSettings,
} from "@/lib/hiring/types"
import {
  Sliders,
  CheckSquare,
  AlignLeft,
  Type,
  ChevronDown,
  ToggleLeft,
  ArrowUp,
  ArrowDown,
  Plus,
  Trash2,
  Edit2,
  Save,
  Eye,
  Settings2,
  ListFilter,
  Sparkles,
  HelpCircle,
  FolderPlus,
  Volume2,
  Check,
  FolderTree,
  Upload,
  Calendar,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { AdvanceCandidateFormView } from "./advance-candidate-form"

interface QuestionFormBuilderProps {
  settings: RecruitmentSettings
  onSave: (updated: {
    questionCategories: FormQuestionCategory[]
    candidateQuestions: CandidateFormQuestion[]
  }) => void
}

export function QuestionFormBuilder({ settings, onSave }: QuestionFormBuilderProps) {
  const [categories, setCategories] = useState<FormQuestionCategory[]>(
    settings.questionCategories || []
  )
  const [questions, setQuestions] = useState<CandidateFormQuestion[]>(
    settings.candidateQuestions || []
  )
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>("ALL")
  const [previewMode, setPreviewMode] = useState(false)

  // Question Add/Edit Modal
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<CandidateFormQuestion | null>(null)

  // Category Add/Edit Modal
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const [categoryName, setCategoryName] = useState("")
  const [categoryDesc, setCategoryDesc] = useState("")
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null)

  // Question Form Fields
  const [qTitle, setQTitle] = useState("")
  const [qCategoryId, setQCategoryId] = useState(categories[0]?.id || "cat-general")
  const [qFieldType, setQFieldType] = useState<QuestionFieldType>("TEXT")
  const [qRequired, setQRequired] = useState(true)
  const [qDescription, setQDescription] = useState("")
  const [qPlaceholder, setQPlaceholder] = useState("")
  const [qOptions, setQOptions] = useState<string[]>([])
  const [newOptionInput, setNewOptionInput] = useState("")

  // Volume Slider Config
  const [sliderMin, setSliderMin] = useState(1)
  const [sliderMax, setSliderMax] = useState(10)
  const [sliderUnit, setSliderUnit] = useState(" / 10")
  const [sliderLeftLabel, setSliderLeftLabel] = useState("Novice")
  const [sliderRightLabel, setSliderRightLabel] = useState("Expert Mastery")

  // Interactive preview state for testing volume sliders
  const [previewAnswers, setPreviewAnswers] = useState<Record<string, any>>({})

  // Open Question modal for creating
  const handleOpenAddQuestion = (presetType?: QuestionFieldType, presetCatId?: string) => {
    setEditingQuestion(null)
    setQTitle("")
    setQCategoryId(presetCatId || (activeCategoryFilter !== "ALL" ? activeCategoryFilter : categories[0]?.id || "cat-general"))
    setQFieldType(presetType || "TEXT")
    setQRequired(true)
    setQDescription("")
    setQPlaceholder("")
    setQOptions(
      presetType === "DROPDOWN" || presetType === "MULTI_CHECKBOX"
        ? ["Option 1", "Option 2", "Option 3"]
        : []
    )
    setSliderMin(1)
    setSliderMax(10)
    setSliderUnit(" / 10")
    setSliderLeftLabel("Basic / Novice")
    setSliderRightLabel("Expert / Mastery")
    setIsQuestionModalOpen(true)
  }

  // Open Question modal for editing
  const handleOpenEditQuestion = (q: CandidateFormQuestion) => {
    setEditingQuestion(q)
    setQTitle(q.title)
    setQCategoryId(q.categoryId)
    setQFieldType(q.fieldType)
    setQRequired(q.required)
    setQDescription(q.description || "")
    setQPlaceholder(q.placeholder || "")
    setQOptions(q.options || [])
    if (q.sliderConfig) {
      setSliderMin(q.sliderConfig.min)
      setSliderMax(q.sliderConfig.max)
      setSliderUnit(q.sliderConfig.unit || " / 10")
      setSliderLeftLabel(q.sliderConfig.leftLabel || "")
      setSliderRightLabel(q.sliderConfig.rightLabel || "")
    }
    setIsQuestionModalOpen(true)
  }

  // Save Question (Create or Update)
  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault()
    if (!qTitle.trim()) {
      toast.error("Please enter a question title.")
      return
    }

    const sliderConfig =
      qFieldType === "VOLUME_SLIDER"
        ? {
            min: sliderMin,
            max: sliderMax,
            step: 1,
            unit: sliderUnit,
            leftLabel: sliderLeftLabel,
            rightLabel: sliderRightLabel,
          }
        : undefined

    if (editingQuestion) {
      // Update existing
      setQuestions((prev) =>
        prev.map((item) =>
          item.id === editingQuestion.id
            ? {
                ...item,
                title: qTitle.trim(),
                categoryId: qCategoryId,
                fieldType: qFieldType,
                required: qRequired,
                description: qDescription.trim() || undefined,
                placeholder: qPlaceholder.trim() || undefined,
                options:
                  qFieldType === "DROPDOWN" || qFieldType === "MULTI_CHECKBOX"
                    ? qOptions
                    : undefined,
                sliderConfig,
              }
            : item
        )
      )
      toast.success("Question updated!")
    } else {
      // Add new
      const newQ: CandidateFormQuestion = {
        id: `q-${Date.now()}`,
        title: qTitle.trim(),
        categoryId: qCategoryId,
        fieldType: qFieldType,
        required: qRequired,
        description: qDescription.trim() || undefined,
        placeholder: qPlaceholder.trim() || undefined,
        options:
          qFieldType === "DROPDOWN" || qFieldType === "MULTI_CHECKBOX"
            ? qOptions
            : undefined,
        sliderConfig,
        order: questions.length + 1,
      }
      setQuestions((prev) => [...prev, newQ])
      toast.success("Question added!")
    }

    setIsQuestionModalOpen(false)
  }

  // Delete Question
  const handleDeleteQuestion = (id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id))
    toast.success("Question deleted.")
  }

  // REORDER QUESTIONS: Move Up
  const handleMoveQuestionUp = (index: number) => {
    if (index === 0) return
    const updated = [...questions]
    const temp = updated[index - 1]
    updated[index - 1] = updated[index]
    updated[index] = temp
    // Recalculate order values
    updated.forEach((q, idx) => (q.order = idx + 1))
    setQuestions(updated)
  }

  // REORDER QUESTIONS: Move Down
  const handleMoveQuestionDown = (index: number) => {
    if (index === questions.length - 1) return
    const updated = [...questions]
    const temp = updated[index + 1]
    updated[index + 1] = updated[index]
    updated[index] = temp
    // Recalculate order values
    updated.forEach((q, idx) => (q.order = idx + 1))
    setQuestions(updated)
  }

  // CATEGORY OPERATIONS
  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault()
    if (!categoryName.trim()) {
      toast.error("Please enter a category name.")
      return
    }

    if (editingCategoryId) {
      setCategories((prev) =>
        prev.map((c) =>
          c.id === editingCategoryId
            ? { ...c, name: categoryName.trim(), description: categoryDesc.trim() || undefined }
            : c
        )
      )
      toast.success("Category updated!")
    } else {
      const newCat: FormQuestionCategory = {
        id: `cat-${Date.now()}`,
        name: categoryName.trim(),
        description: categoryDesc.trim() || undefined,
        order: categories.length + 1,
      }
      setCategories((prev) => [...prev, newCat])
      toast.success(`Category "${newCat.name}" added!`)
    }

    setIsCategoryModalOpen(false)
    setCategoryName("")
    setCategoryDesc("")
    setEditingCategoryId(null)
  }

  const handleDeleteCategory = (catId: string) => {
    if (categories.length <= 1) {
      toast.error("At least one category is required.")
      return
    }
    const catToDelete = categories.find((c) => c.id === catId)
    const remainingCats = categories.filter((c) => c.id !== catId)
    const fallbackId = remainingCats[0]?.id || "cat-general"

    // Reassign questions in that category to fallback
    setQuestions((prev) =>
      prev.map((q) => (q.categoryId === catId ? { ...q, categoryId: fallbackId } : q))
    )
    setCategories(remainingCats)
    if (activeCategoryFilter === catId) setActiveCategoryFilter("ALL")
    toast.success(`Category "${catToDelete?.name}" removed. Questions moved to ${remainingCats[0]?.name}.`)
  }

  // Save entire configuration to backend
  const handleSaveAll = () => {
    onSave({
      questionCategories: categories,
      candidateQuestions: questions,
    })
    toast.success("Candidate Questions Form configuration successfully saved!")
  }

  // Filter questions for display
  const displayedQuestions =
    activeCategoryFilter === "ALL"
      ? questions
      : questions.filter((q) => q.categoryId === activeCategoryFilter)

  // Get field type friendly badge
  const getFieldTypeBadge = (type: QuestionFieldType) => {
    switch (type) {
      case "VOLUME_SLIDER":
        return (
          <Badge className="bg-purple-600 text-white text-[10px] gap-1">
            <Volume2 className="h-3 w-3" /> Volume / Slider
          </Badge>
        )
      case "CHECKBOX":
        return (
          <Badge className="bg-blue-600 text-white text-[10px] gap-1">
            <CheckSquare className="h-3 w-3" /> Check Box
          </Badge>
        )
      case "MULTI_CHECKBOX":
        return (
          <Badge className="bg-indigo-600 text-white text-[10px] gap-1">
            <CheckSquare className="h-3 w-3" /> Multi Check Box
          </Badge>
        )
      case "DROPDOWN":
        return (
          <Badge className="bg-teal-600 text-white text-[10px] gap-1">
            <ChevronDown className="h-3 w-3" /> Dropdown
          </Badge>
        )
      case "PARAGRAPH":
        return (
          <Badge className="bg-emerald-600 text-white text-[10px] gap-1">
            <AlignLeft className="h-3 w-3" /> Paragraph Text
          </Badge>
        )
      case "FILE_UPLOAD":
        return (
          <Badge className="bg-rose-600 text-white text-[10px] gap-1">
            <Upload className="h-3 w-3" /> File Upload
          </Badge>
        )
      case "DATE":
        return (
          <Badge className="bg-sky-600 text-white text-[10px] gap-1">
            <Calendar className="h-3 w-3" /> Date Picker
          </Badge>
        )
      case "YES_NO":
        return (
          <Badge className="bg-amber-600 text-white text-[10px] gap-1">
            <ToggleLeft className="h-3 w-3" /> Yes / No
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="text-[10px] gap-1">
            <Type className="h-3 w-3" /> Short Text
          </Badge>
        )
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Settings2 className="h-5 w-5 text-[#548235]" />
              Candidate Questions Form Builder
            </h2>
            <Badge variant="outline" className="text-[10px] bg-[#548235]/10 text-[#548235] border-[#548235]/30">
              {questions.length} Questions across {categories.length} Categories
            </Badge>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Customize, categorize, and reorder questions presented to applicants on their single application link.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Preview Toggle */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setPreviewMode(!previewMode)}
            className={`h-9 text-xs font-bold gap-1.5 px-3.5 shadow-xs transition-all ${
              previewMode
                ? "bg-[#548235] text-white hover:bg-[#466e2c] border-[#548235] ring-2 ring-[#548235]/30"
                : "bg-emerald-50 text-[#548235] border-emerald-300 dark:bg-emerald-950/40 dark:border-emerald-800 hover:bg-emerald-100"
            }`}
          >
            <Eye className="h-4 w-4" />
            {previewMode ? "Close Preview" : "Preview this Form"}
          </Button>

          {/* Add Category */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setEditingCategoryId(null)
              setCategoryName("")
              setCategoryDesc("")
              setIsCategoryModalOpen(true)
            }}
            className="h-9 text-xs font-semibold text-zinc-700 dark:text-zinc-300"
          >
            <FolderPlus className="h-3.5 w-3.5 mr-1 text-[#548235]" />
            + Category
          </Button>

          {/* Add Question Button */}
          <Button
            type="button"
            size="sm"
            onClick={() => handleOpenAddQuestion()}
            className="h-9 text-xs font-semibold bg-[#548235] hover:bg-[#466e2c] text-white shadow-xs"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Question
          </Button>
        </div>
      </div>

      {/* Quick Add Presets Bar */}
      <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-2 overflow-x-auto">
        <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider shrink-0">
          Smart Question Shortcuts:
        </span>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => handleOpenAddQuestion("VOLUME_SLIDER")}
            className="h-7 text-xs font-medium text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800 hover:bg-purple-50"
          >
            <Volume2 className="h-3.5 w-3.5 mr-1" /> + Volume / Slider
          </Button>

          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => handleOpenAddQuestion("CHECKBOX")}
            className="h-7 text-xs font-medium text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 hover:bg-blue-50"
          >
            <CheckSquare className="h-3.5 w-3.5 mr-1" /> + Check Box
          </Button>

          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => handleOpenAddQuestion("MULTI_CHECKBOX")}
            className="h-7 text-xs font-medium text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50"
          >
            <CheckSquare className="h-3.5 w-3.5 mr-1" /> + Multi-Check
          </Button>

          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => handleOpenAddQuestion("DROPDOWN")}
            className="h-7 text-xs font-medium text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800 hover:bg-teal-50"
          >
            <ChevronDown className="h-3.5 w-3.5 mr-1" /> + Dropdown
          </Button>

          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => handleOpenAddQuestion("FILE_UPLOAD")}
            className="h-7 text-xs font-medium text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800 hover:bg-rose-50"
          >
            <Upload className="h-3.5 w-3.5 mr-1" /> + File Upload
          </Button>

          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => handleOpenAddQuestion("DATE")}
            className="h-7 text-xs font-medium text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800 hover:bg-sky-50"
          >
            <Calendar className="h-3.5 w-3.5 mr-1" /> + Date
          </Button>

          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => handleOpenAddQuestion("PARAGRAPH")}
            className="h-7 text-xs font-medium text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50"
          >
            <AlignLeft className="h-3.5 w-3.5 mr-1" /> + Paragraph
          </Button>
        </div>
      </div>

      {/* Category Navigation Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveCategoryFilter("ALL")}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 ${
            activeCategoryFilter === "ALL"
              ? "bg-[#548235] text-white shadow-xs"
              : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100"
          }`}
        >
          <span>All Categories</span>
          <span className={`text-[10px] px-1.5 rounded-full ${activeCategoryFilter === "ALL" ? "bg-white/20 text-white" : "bg-zinc-100 dark:bg-zinc-800"}`}>
            {questions.length}
          </span>
        </button>

        {categories.map((cat) => {
          const catCount = questions.filter((q) => q.categoryId === cat.id).length
          const isSelected = activeCategoryFilter === cat.id
          return (
            <div
              key={cat.id}
              className={`flex items-center rounded-xl border transition-all shrink-0 ${
                isSelected
                  ? "bg-[#548235] border-[#548235] text-white shadow-xs"
                  : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100"
              }`}
            >
              <button
                type="button"
                onClick={() => setActiveCategoryFilter(cat.id)}
                className="px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5"
              >
                <span>{cat.name}</span>
                <span className={`text-[10px] px-1.5 rounded-full ${isSelected ? "bg-white/20 text-white" : "bg-zinc-100 dark:bg-zinc-800"}`}>
                  {catCount}
                </span>
              </button>

              <div className="pr-1 flex items-center">
                <button
                  type="button"
                  onClick={() => {
                    setEditingCategoryId(cat.id)
                    setCategoryName(cat.name)
                    setCategoryDesc(cat.description || "")
                    setIsCategoryModalOpen(true)
                  }}
                  className={`p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 ${isSelected ? "text-white" : "text-zinc-400"}`}
                  title="Edit Category Name"
                >
                  <Edit2 className="h-2.5 w-2.5" />
                </button>
                {categories.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleDeleteCategory(cat.id)}
                    className={`p-1 rounded hover:bg-red-500 hover:text-white ${isSelected ? "text-white/80" : "text-zinc-400"}`}
                    title="Delete Category"
                  >
                    <Trash2 className="h-2.5 w-2.5" />
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* ========================================================= */}
      {/* LIVE CANDIDATE FORM PREVIEW MODE                          */}
      {/* ========================================================= */}
      {previewMode ? (
        <div className="space-y-4 animate-in fade-in">
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[#548235]" />
              <div>
                <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
                  Interactive Candidate Form Preview Active
                </h4>
                <p className="text-xs text-emerald-700 dark:text-emerald-300">
                  Previewing the full Candidate Information Form exactly as experienced by applicants.
                </p>
              </div>
            </div>
            <Button
              size="sm"
              onClick={() => setPreviewMode(false)}
              className="bg-[#548235] hover:bg-[#466e2c] text-white text-xs font-bold"
            >
              Exit Preview & Return to Questions
            </Button>
          </div>

          <AdvanceCandidateFormView isPreview={true} />
        </div>
      ) : (
        /* ========================================================= */
        /* QUESTIONS LIST & REORDERING VIEW                          */
        /* ========================================================= */
        <div className="space-y-3">
          {displayedQuestions.map((q, idx) => {
            const cat = categories.find((c) => c.id === q.categoryId)
            const globalIndex = questions.findIndex((item) => item.id === q.id)

            return (
              <div
                key={q.id}
                className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
              >
                {/* Left Section: Reorder Controls & Question Info */}
                <div className="flex items-start gap-3">
                  {/* Reorder Buttons (Up & Down) */}
                  <div className="flex flex-col items-center gap-1 shrink-0 pt-0.5">
                    <button
                      type="button"
                      disabled={globalIndex === 0}
                      onClick={() => handleMoveQuestionUp(globalIndex)}
                      className="h-6 w-6 rounded-md border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                      title="Move Question Up"
                    >
                      <ArrowUp className="h-3 w-3" />
                    </button>
                    <span className="text-[10px] font-mono font-bold text-zinc-400">
                      Q{globalIndex + 1}
                    </span>
                    <button
                      type="button"
                      disabled={globalIndex === questions.length - 1}
                      onClick={() => handleMoveQuestionDown(globalIndex)}
                      className="h-6 w-6 rounded-md border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                      title="Move Question Down"
                    >
                      <ArrowDown className="h-3 w-3" />
                    </button>
                  </div>

                  {/* Question Title & Subtitles */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-xs text-zinc-900 dark:text-zinc-100">
                        {q.title}
                      </h4>
                      {q.required ? (
                        <span className="text-[10px] font-semibold text-red-500">
                          *Required
                        </span>
                      ) : (
                        <span className="text-[10px] text-zinc-400">Optional</span>
                      )}
                    </div>

                    {q.description && (
                      <p className="text-[11px] text-zinc-500 line-clamp-1">
                        {q.description}
                      </p>
                    )}

                    {/* Metadata tags */}
                    <div className="flex items-center gap-2 pt-1 flex-wrap">
                      {getFieldTypeBadge(q.fieldType)}
                      <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-medium">
                        📂 {cat?.name || "General"}
                      </span>
                      {q.fieldType === "VOLUME_SLIDER" && q.sliderConfig && (
                        <span className="text-[10px] font-mono text-purple-600 dark:text-purple-400">
                          Range: {q.sliderConfig.min} to {q.sliderConfig.max} ({q.sliderConfig.leftLabel || "Min"} → {q.sliderConfig.rightLabel || "Max"})
                        </span>
                      )}
                      {q.options && q.options.length > 0 && (
                        <span className="text-[10px] text-zinc-400">
                          {q.options.length} choices configured
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Section: Action Buttons */}
                <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenEditQuestion(q)}
                    className="h-8 text-xs font-medium px-2.5"
                  >
                    <Edit2 className="h-3.5 w-3.5 mr-1" /> Edit
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteQuestion(q.id)}
                    className="h-8 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 p-2"
                    title="Delete Question"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Persistent Save All Configuration Footer */}
      <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs flex items-center justify-between gap-3">
        <div className="text-xs text-zinc-500">
          Reordering, categories, and field options are synchronized with candidate links upon saving.
        </div>
        <Button
          type="button"
          onClick={handleSaveAll}
          className="bg-[#548235] hover:bg-[#466e2c] text-white text-xs font-bold px-6 h-9 shadow-md shadow-[#548235]/25 gap-2"
        >
          <Save className="h-4 w-4" />
          Save Questions Form
        </Button>
      </div>

      {/* ========================================================= */}
      {/* MODAL: ADD / EDIT QUESTION                                */}
      {/* ========================================================= */}
      <Dialog open={isQuestionModalOpen} onOpenChange={setIsQuestionModalOpen}>
        <DialogContent className="sm:max-w-xl w-full max-w-[95vw] p-0 overflow-hidden rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl">
          <div className="bg-gradient-to-r from-[#548235]/15 via-emerald-500/10 to-transparent p-5 border-b border-zinc-100 dark:border-zinc-800">
            <DialogTitle className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Sliders className="h-4 w-4 text-[#548235]" />
              {editingQuestion ? "Edit Candidate Question" : "Add Candidate Question"}
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-500 mt-0.5">
              Configure question text, category grouping, and smart field type.
            </DialogDescription>
          </div>

          <form onSubmit={handleSaveQuestion} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            {/* Question Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Question Text / Prompt <span className="text-red-500">*</span>
              </label>
              <Input
                required
                placeholder="e.g. Rate your familiarity with Battery Management Systems (BMS)"
                value={qTitle}
                onChange={(e) => setQTitle(e.target.value)}
                className="h-9 text-xs"
              />
            </div>

            {/* Category & Field Type Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Assign Category
                </label>
                <select
                  value={qCategoryId}
                  onChange={(e) => setQCategoryId(e.target.value)}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-2xs font-medium"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Smart Field Type
                </label>
                <select
                  value={qFieldType}
                  onChange={(e) => setQFieldType(e.target.value as QuestionFieldType)}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-2xs font-semibold"
                >
                  <option value="FILE_UPLOAD">File / Document Upload</option>
                  <option value="DATE">Date Picker (Calendar)</option>
                  <option value="VOLUME_SLIDER">Volume / Proficiency Slider (1-10)</option>
                  <option value="CHECKBOX">Check Box (Single Agreement)</option>
                  <option value="MULTI_CHECKBOX">Multi Check Box (Select Multiple)</option>
                  <option value="DROPDOWN">Dropdown (Select One)</option>
                  <option value="PARAGRAPH">Paragraph Text (Textarea)</option>
                  <option value="TEXT">Short Text (Single Line)</option>
                  <option value="YES_NO">Yes / No Switch</option>
                </select>
              </div>
            </div>

            {/* Subtitle / Helper Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Helper Instructions (Optional)
              </label>
              <Input
                placeholder="e.g. Adjust the gauge from 1 (Novice) to 10 (Mastery)"
                value={qDescription}
                onChange={(e) => setQDescription(e.target.value)}
                className="h-9 text-xs"
              />
            </div>

            {/* SMART OPTIONS CONFIGURATION FOR VOLUME SLIDER */}
            {qFieldType === "VOLUME_SLIDER" && (
              <div className="p-4 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800/40 space-y-3">
                <h5 className="text-xs font-bold text-purple-900 dark:text-purple-200 flex items-center gap-1.5">
                  <Volume2 className="h-4 w-4 text-purple-600" />
                  Volume / Slider Calibration
                </h5>

                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <label className="text-[11px] text-zinc-500 font-semibold">Min Value</label>
                    <Input
                      type="number"
                      value={sliderMin}
                      onChange={(e) => setSliderMin(Number(e.target.value))}
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-zinc-500 font-semibold">Max Value</label>
                    <Input
                      type="number"
                      value={sliderMax}
                      onChange={(e) => setSliderMax(Number(e.target.value))}
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-zinc-500 font-semibold">Unit</label>
                    <Input
                      value={sliderUnit}
                      onChange={(e) => setSliderUnit(e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[11px] text-zinc-500 font-semibold">Left Label (Min)</label>
                    <Input
                      value={sliderLeftLabel}
                      onChange={(e) => setSliderLeftLabel(e.target.value)}
                      placeholder="e.g. 1 - Novice"
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-zinc-500 font-semibold">Right Label (Max)</label>
                    <Input
                      value={sliderRightLabel}
                      onChange={(e) => setSliderRightLabel(e.target.value)}
                      placeholder="e.g. 10 - Expert"
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* SMART OPTIONS CONFIGURATION FOR DROPDOWN & MULTI-CHECKBOX */}
            {(qFieldType === "DROPDOWN" || qFieldType === "MULTI_CHECKBOX") && (
              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700 space-y-3">
                <h5 className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                  Configured Choices ({qOptions.length})
                </h5>

                <div className="flex gap-2">
                  <Input
                    placeholder="Type an option and click Add..."
                    value={newOptionInput}
                    onChange={(e) => setNewOptionInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        if (newOptionInput.trim() && !qOptions.includes(newOptionInput.trim())) {
                          setQOptions([...qOptions, newOptionInput.trim()])
                          setNewOptionInput("")
                        }
                      }
                    }}
                    className="h-8 text-xs"
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      if (newOptionInput.trim() && !qOptions.includes(newOptionInput.trim())) {
                        setQOptions([...qOptions, newOptionInput.trim()])
                        setNewOptionInput("")
                      }
                    }}
                    className="h-8 text-xs bg-[#548235] text-white"
                  >
                    + Add
                  </Button>
                </div>

                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                  {qOptions.map((opt, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white dark:bg-zinc-800 border text-xs"
                    >
                      {opt}
                      <button
                        type="button"
                        onClick={() => setQOptions(qOptions.filter((_, idx) => idx !== i))}
                        className="text-zinc-400 hover:text-red-500"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Mandatory Checkbox */}
            <div className="flex items-center gap-2 pt-2">
              <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={qRequired}
                  onChange={(e) => setQRequired(e.target.checked)}
                  className="rounded border-zinc-300 text-[#548235] h-4 w-4"
                />
                Mark as Mandatory Question (Candidate cannot submit without answering)
              </label>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
              <Button
                variant="outline"
                type="button"
                onClick={() => setIsQuestionModalOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-[#548235] hover:bg-[#466e2c] text-white text-xs font-semibold px-5 h-9"
              >
                {editingQuestion ? "Save Question" : "Add to Form"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ========================================================= */}
      {/* MODAL: ADD / EDIT CATEGORY                                */}
      {/* ========================================================= */}
      <Dialog open={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen}>
        <DialogContent className="sm:max-w-md w-full max-w-[95vw] p-0 overflow-hidden rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl">
          <div className="bg-gradient-to-r from-[#548235]/15 to-transparent p-5 border-b border-zinc-100 dark:border-zinc-800">
            <DialogTitle className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <FolderPlus className="h-4 w-4 text-[#548235]" />
              {editingCategoryId ? "Edit Question Category" : "Add Question Category"}
            </DialogTitle>
          </div>

          <form onSubmit={handleSaveCategory} className="p-5 space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Category Name <span className="text-red-500">*</span>
              </label>
              <Input
                required
                placeholder="e.g. Field Reliability & Depot Safety"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Short Description (Optional)
              </label>
              <Input
                placeholder="e.g. Evaluates candidate operational grit and depot readiness"
                value={categoryDesc}
                onChange={(e) => setCategoryDesc(e.target.value)}
                className="h-9 text-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <Button
                variant="outline"
                type="button"
                onClick={() => setIsCategoryModalOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-[#548235] hover:bg-[#466e2c] text-white text-xs font-semibold px-5 h-9"
              >
                {editingCategoryId ? "Save Changes" : "Create Category"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

