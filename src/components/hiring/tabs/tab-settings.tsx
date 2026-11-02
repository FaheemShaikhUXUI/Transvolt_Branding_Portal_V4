"use client"

import React, { useState } from "react"
import {
  RecruitmentSettings,
  FormQuestionCategory,
  CandidateFormQuestion,
} from "@/lib/hiring/types"
import {
  Building2,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Save,
  Plus,
  Trash2,
  Sparkles,
  Sliders,
  FileQuestion,
  Settings2,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { QuestionFormBuilder } from "../question-form-builder"

interface TabSettingsProps {
  settings: RecruitmentSettings
  onUpdateSettings: (newSettings: RecruitmentSettings) => void
}

export function TabSettings({ settings, onUpdateSettings }: TabSettingsProps) {
  const [subTab, setSubTab] = useState<"general" | "questions">("questions")
  const [form, setForm] = useState<RecruitmentSettings>(settings)
  const [newDept, setNewDept] = useState("")
  const [newPos, setNewPos] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  const handleSaveGeneral = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      const res = await fetch("/api/hiring/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (data.success) {
        onUpdateSettings(data.settings)
        toast.success("Company & Recruitment settings saved successfully!")
      }
    } catch {
      toast.error("Failed to save settings.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveQuestions = async (updated: {
    questionCategories: FormQuestionCategory[]
    candidateQuestions: CandidateFormQuestion[]
  }) => {
    const updatedForm = {
      ...form,
      questionCategories: updated.questionCategories,
      candidateQuestions: updated.candidateQuestions,
    }
    setForm(updatedForm)

    try {
      const res = await fetch("/api/hiring/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedForm),
      })
      const data = await res.json()
      if (data.success) {
        onUpdateSettings(data.settings)
      }
    } catch (e) {
      console.error("Failed to save questions:", e)
      toast.error("Failed to persist questions to server.")
    }
  }

  const handleAddDept = () => {
    if (!newDept.trim() || form.departments.includes(newDept.trim())) return
    setForm({ ...form, departments: [...form.departments, newDept.trim()] })
    setNewDept("")
  }

  const handleRemoveDept = (dept: string) => {
    setForm({ ...form, departments: form.departments.filter((d) => d !== dept) })
  }

  const handleAddPos = () => {
    if (!newPos.trim() || form.positions.includes(newPos.trim())) return
    setForm({ ...form, positions: [...form.positions, newPos.trim()] })
    setNewPos("")
  }

  const handleRemovePos = (pos: string) => {
    setForm({ ...form, positions: form.positions.filter((p) => p !== pos) })
  }

  return (
    <div className="space-y-6">
      {/* Sub Tab Switcher: General vs Candidate's Questions Form */}
      <div className="p-1.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800/80 inline-flex items-center gap-1 border border-zinc-200/80 dark:border-zinc-700/60 shadow-2xs">
        <button
          type="button"
          onClick={() => setSubTab("questions")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            subTab === "questions"
              ? "bg-white dark:bg-zinc-900 text-[#548235] shadow-xs"
              : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900"
          }`}
        >
          <FileQuestion className="h-4 w-4 text-[#548235]" />
          <span>Candidate Form Questions</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#548235]/15 text-[#548235] font-semibold">
            {form.candidateQuestions?.length || 39} Questions
          </span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab("general")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            subTab === "general"
              ? "bg-white dark:bg-zinc-900 text-[#548235] shadow-xs"
              : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900"
          }`}
        >
          <Building2 className="h-4 w-4" />
          <span>General & Company Masters</span>
        </button>
      </div>

      {/* SUB-TAB 1: Candidate's Questions Form Builder */}
      {subTab === "questions" && (
        <QuestionFormBuilder
          settings={form}
          onSave={handleSaveQuestions}
        />
      )}

      {/* SUB-TAB 2: General & Company Coordinates */}
      {subTab === "general" && (
        <form onSubmit={handleSaveGeneral} className="space-y-6 max-w-4xl">
          {/* Company & HR Details */}
          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-2">
              <Building2 className="h-4 w-4 text-[#548235]" />
              Company & HR Official Coordinates
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Company Legal Name
                </label>
                <Input
                  value={form.companyName}
                  onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Recruitment Email Address
                </label>
                <Input
                  type="email"
                  value={form.recruitmentEmail}
                  onChange={(e) => setForm({ ...form, recruitmentEmail: e.target.value })}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  HR Contact Person
                </label>
                <Input
                  value={form.hrContactPerson}
                  onChange={(e) => setForm({ ...form, hrContactPerson: e.target.value })}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  HR Helpline Phone
                </label>
                <Input
                  value={form.hrContactPhone}
                  onChange={(e) => setForm({ ...form, hrContactPhone: e.target.value })}
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Office Address / In-Person Interview Reporting Location
              </label>
              <Input
                value={form.officeAddress}
                onChange={(e) => setForm({ ...form, officeAddress: e.target.value })}
                className="h-9 text-xs"
              />
            </div>
          </div>

          {/* Departments & Positions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Departments */}
            <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                Available Departments ({form.departments.length})
              </h3>

              <div className="flex gap-2">
                <Input
                  placeholder="e.g. Battery Intelligence"
                  value={newDept}
                  onChange={(e) => setNewDept(e.target.value)}
                  className="h-8 text-xs"
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={handleAddDept}
                  className="h-8 text-xs shrink-0 bg-[#548235] hover:bg-[#466e2c] text-white"
                >
                  <Plus className="h-3.5 w-3.5 mr-1" /> Add
                </Button>
              </div>

              <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto">
                {form.departments.map((d) => (
                  <span
                    key={d}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-xs font-medium text-zinc-700 dark:text-zinc-300"
                  >
                    {d}
                    <button
                      type="button"
                      onClick={() => handleRemoveDept(d)}
                      className="text-zinc-400 hover:text-red-500"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Positions */}
            <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                Job Positions Master ({form.positions.length})
              </h3>

              <div className="flex gap-2">
                <Input
                  placeholder="e.g. BMS Firmware Engineer"
                  value={newPos}
                  onChange={(e) => setNewPos(e.target.value)}
                  className="h-8 text-xs"
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={handleAddPos}
                  className="h-8 text-xs shrink-0 bg-[#548235] hover:bg-[#466e2c] text-white"
                >
                  <Plus className="h-3.5 w-3.5 mr-1" /> Add
                </Button>
              </div>

              <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto">
                {form.positions.map((p) => (
                  <span
                    key={p}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-xs font-medium text-zinc-700 dark:text-zinc-300"
                  >
                    {p}
                    <button
                      type="button"
                      onClick={() => handleRemovePos(p)}
                      className="text-zinc-400 hover:text-red-500"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isSaving}
              className="bg-[#548235] hover:bg-[#466e2c] text-white text-xs font-semibold px-6 h-9 shadow-md shadow-[#548235]/25"
            >
              <Save className="h-3.5 w-3.5 mr-1.5" />
              {isSaving ? "Saving..." : "Save Company Settings"}
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
