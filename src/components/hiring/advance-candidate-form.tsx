"use client"

import React, { useState, useEffect } from "react"
import {
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CreditCard,
  Building2,
  GraduationCap,
  Award,
  Briefcase,
  Users,
  ShieldCheck,
  Upload,
  CheckCircle2,
  Trash2,
  Plus,
  AlertCircle,
  FileText,
  HeartPulse,
  Heart,
  ChevronRight,
  ChevronLeft,
  Eye,
  Check,
  Camera,
  FileCheck,
  Download,
  Info,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import {
  Candidate,
  AdvanceCandidateForm,
  LanguageProficiency,
  FamilyMemberRecord,
  HealthWellBeingRecord,
  MediclaimMemberRecord,
  BankDetailsRecord,
  DetailedEducationRecord,
  CertificationRecord,
  DetailedExperienceRecord,
  ReferenceRecord,
  ColleagueContactRecord,
} from "@/lib/hiring/types"

interface AdvanceCandidateFormProps {
  candidate?: Candidate | null
  token?: string
  isPreview?: boolean
  onSubmitted?: (updatedCandidate: Candidate) => void
}

export function AdvanceCandidateFormView({
  candidate,
  token,
  isPreview = false,
  onSubmitted,
}: AdvanceCandidateFormProps) {
  const [activeSection, setActiveSection] = useState<number>(1)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [uploadingField, setUploadingField] = useState<string | null>(null)

  // SECTION 1: Personal Details (24 Fields)
  const [fullName, setFullName] = useState(candidate?.personalInfo?.fullName || candidate?.fullName || "")
  const [fatherName, setFatherName] = useState(candidate?.personalInfo?.fatherName || "")
  const [motherName, setMotherName] = useState("")
  const [bloodGroup, setBloodGroup] = useState("B+")
  const [designation, setDesignation] = useState(candidate?.appliedPosition || "")
  const [contactNumber, setContactNumber] = useState(candidate?.personalInfo?.mobile || candidate?.phone || "")
  const [emergencyContactNumber, setEmergencyContactNumber] = useState(candidate?.personalInfo?.altMobile || "")
  const [emergencyContactPerson, setEmergencyContactPerson] = useState(candidate?.additionalInfo?.emergencyContactName || "")
  const [emergencyContactRelation, setEmergencyContactRelation] = useState("Parent")
  const [personalEmail, setPersonalEmail] = useState(candidate?.personalInfo?.email || candidate?.email || "")
  const [currentAddress, setCurrentAddress] = useState(candidate?.personalInfo?.currentAddress || "")
  const [permanentAddress, setPermanentAddress] = useState(candidate?.personalInfo?.permanentAddress || "")
  
  // Documents & Identifications (Type & Upload)
  const [aadharNumber, setAadharNumber] = useState("")
  const [aadharDocUrl, setAadharDocUrl] = useState("")
  const [aadharDocName, setAadharDocName] = useState("")

  const [panNumber, setPanNumber] = useState("")
  const [panDocUrl, setPanDocUrl] = useState("")
  const [panDocName, setPanDocName] = useState("")

  const [passportNumber, setPassportNumber] = useState("")
  const [passportDocUrl, setPassportDocUrl] = useState("")
  const [passportDocName, setPassportDocName] = useState("")

  const [gender, setGender] = useState("Male")

  const [drivingLicenseNumber, setDrivingLicenseNumber] = useState("")
  const [drivingLicenseDocUrl, setDrivingLicenseDocUrl] = useState("")
  const [drivingLicenseDocName, setDrivingLicenseDocName] = useState("")

  const [dob, setDob] = useState(candidate?.personalInfo?.dob || "1998-05-15")
  const [placeOfBirth, setPlaceOfBirth] = useState("Mumbai, Maharashtra")
  const [religion, setReligion] = useState("Hindu")
  const [motherTongue, setMotherTongue] = useState("Marathi")

  // Languages Known (4 default options with Read, Write, Speak ticks + can add more)
  const [languages, setLanguages] = useState<LanguageProficiency[]>([
    { language: "English", read: true, write: true, speak: true },
    { language: "Hindi", read: true, write: true, speak: true },
    { language: "Marathi", read: true, write: true, speak: true },
    { language: "Gujarati", read: true, write: false, speak: true },
  ])
  const [newLangName, setNewLangName] = useState("")

  const [maritalStatus, setMaritalStatus] = useState("Single")
  const [marriageDate, setMarriageDate] = useState("")

  // SECTION 2: Family Details (Default 4 options + add more)
  const [familyDetails, setFamilyDetails] = useState<FamilyMemberRecord[]>([
    { id: "fam-1", name: "", relation: "Father", gender: "Male", dob: "" },
    { id: "fam-2", name: "", relation: "Mother", gender: "Female", dob: "" },
    { id: "fam-3", name: "", relation: "Spouse", gender: "Female", dob: "" },
    { id: "fam-4", name: "", relation: "Child", gender: "Male", dob: "" },
  ])

  // SECTION 3: For Health and Well Being (Default 4 options + add more)
  const [healthWellBeing, setHealthWellBeing] = useState<HealthWellBeingRecord[]>([
    { id: "hwb-1", name: "", relation: "Self", gender: "Male", dob: "", age: "27", healthIssue: "None" },
    { id: "hwb-2", name: "", relation: "Father", gender: "Male", dob: "", age: "58", healthIssue: "None" },
    { id: "hwb-3", name: "", relation: "Mother", gender: "Female", dob: "", age: "54", healthIssue: "None" },
    { id: "hwb-4", name: "", relation: "Spouse", gender: "Female", dob: "", age: "26", healthIssue: "None" },
  ])

  // SECTION 4: Mediclaim Coverage (Immediate Family) (Default 2 options + add more)
  const [mediclaimCoverage, setMediclaimCoverage] = useState<MediclaimMemberRecord[]>([
    { id: "med-1", name: "", relation: "Self", gender: "Male", dob: "" },
    { id: "med-2", name: "", relation: "Spouse", gender: "Female", dob: "" },
  ])

  // SECTION 5: Bank Details
  const [bankDetails, setBankDetails] = useState<BankDetailsRecord>({
    bankName: "",
    accountNumber: "",
    ifscCode: "",
    branch: "",
    chequePhotoUrl: "",
    chequePhotoName: "",
  })

  // SECTION 6: Education Details (SSC, HSC, Diploma, Graduation, Post Graduate + Add More)
  const [educationDetails, setEducationDetails] = useState<DetailedEducationRecord[]>([
    {
      id: "edu-ssc",
      level: "SSC",
      passingYear: "2014",
      courseType: "Full-Time",
      specialization: "General Science & Maths",
      institute: "State Board School",
      percentage: "84.5",
      grade: "Distinction",
      documentUrl: "",
      documentName: "",
    },
    {
      id: "edu-hsc",
      level: "HSC",
      passingYear: "2016",
      courseType: "Full-Time",
      specialization: "Science (PCM)",
      institute: "Junior Science College",
      percentage: "78.2",
      grade: "First Class",
      documentUrl: "",
      documentName: "",
    },
    {
      id: "edu-diploma",
      level: "Diploma",
      passingYear: "",
      courseType: "Full-Time",
      specialization: "Automobile / Mechanical",
      institute: "",
      percentage: "",
      grade: "",
      documentUrl: "",
      documentName: "",
    },
    {
      id: "edu-grad",
      level: "Graduation",
      passingYear: "2020",
      courseType: "Full-Time",
      specialization: "B.E. Mechanical / Electrical / Automobile",
      institute: "University Technical Campus",
      percentage: "76.0",
      grade: "First Class Distinction",
      documentUrl: "",
      documentName: "",
    },
    {
      id: "edu-pg",
      level: "Post Graduate",
      passingYear: "",
      courseType: "Full-Time",
      specialization: "M.Tech EV / Power Electronics",
      institute: "",
      percentage: "",
      grade: "",
      documentUrl: "",
      documentName: "",
    },
  ])

  // SECTION 7: Certification (Default 4 options + add more)
  const [certifications, setCertifications] = useState<CertificationRecord[]>([
    {
      id: "cert-1",
      certificateName: "High Voltage EV Safety & ISO 26262",
      specialization: "Electric Vehicle Safety",
      institute: "ARAI / SAE India",
      issueDate: "2023-04-10",
      validity: "5 Years",
      revalidationDate: "2028-04-10",
      documentUrl: "",
      documentName: "",
    },
    {
      id: "cert-2",
      certificateName: "Battery Management System Diagnostics",
      specialization: "Li-Ion Diagnostics",
      institute: "National Skill Council",
      issueDate: "2022-09-15",
      validity: "Lifetime",
      revalidationDate: "",
      documentUrl: "",
      documentName: "",
    },
    {
      id: "cert-3",
      certificateName: "",
      specialization: "",
      institute: "",
      issueDate: "",
      validity: "",
      revalidationDate: "",
      documentUrl: "",
      documentName: "",
    },
    {
      id: "cert-4",
      certificateName: "",
      specialization: "",
      institute: "",
      issueDate: "",
      validity: "",
      revalidationDate: "",
      documentUrl: "",
      documentName: "",
    },
  ])

  // SECTION 8: Past Experience (Default 2 options + add more)
  const [pastExperience, setPastExperience] = useState<DetailedExperienceRecord[]>([
    {
      id: "exp-1",
      organizationName: "Tata Motors Commercial Vehicles Ltd.",
      designation: "Assistant Engineer — Fleet Electrification",
      department: "Electric Mobility Engineering",
      reportingSupervisor: "Sanjay Kulkarni (Senior Manager)",
      dateOfJoining: "2022-01-10",
      lastWorkingDate: "2024-03-31",
      tenure: "2 Years 2 Months",
    },
    {
      id: "exp-2",
      organizationName: "Mahindra Electric Mobility Ltd.",
      designation: "Graduate Engineer Trainee",
      department: "Powertrain Integration",
      reportingSupervisor: "Pooja Shah (Lead Engineer)",
      dateOfJoining: "2020-08-01",
      lastWorkingDate: "2021-12-20",
      tenure: "1 Year 4 Months",
    },
  ])

  // SECTION 9: Reference
  const [reference, setReference] = useState<ReferenceRecord>({
    personName: "Dr. Rajesh Menon",
    organizationName: "Tata Motors CV",
    designation: "Chief Technical Officer",
    department: "R&D Powertrain",
    contactNumber: "+91 98201 54321",
    reportingSupervisor: "Yes (Direct Head)",
    relationship: "Colleague",
  })

  // SECTION 10: Contacts of Colleagues from Last Organization (Default 3 options + add more)
  const [colleagueContacts, setColleagueContacts] = useState<ColleagueContactRecord[]>([
    {
      id: "col-1",
      personName: "Amitabh Sen",
      organizationName: "Tata Motors CV",
      designation: "Fleet Quality Lead",
      department: "Fleet Operations",
      contactNumber: "+91 98192 11223",
      reportingSupervisor: "Peer Colleague",
    },
    {
      id: "col-2",
      personName: "Meghna Nair",
      organizationName: "Tata Motors CV",
      designation: "Diagnostics Engineer",
      department: "Telematics & BMS",
      contactNumber: "+91 98334 44556",
      reportingSupervisor: "Peer Colleague",
    },
    {
      id: "col-3",
      personName: "Rohan Deshmukh",
      organizationName: "Tata Motors CV",
      designation: "Depot Service Manager",
      department: "Field Engineering",
      contactNumber: "+91 98771 99887",
      reportingSupervisor: "Site Supervisor",
    },
  ])

  // SECTION 11: Mandatory Uploads
  const [photoUrl, setPhotoUrl] = useState("")
  const [photoFileName, setPhotoFileName] = useState("")

  const [resumeUrl, setResumeUrl] = useState("")
  const [resumeFileName, setResumeFileName] = useState("")

  const [signatureUrl, setSignatureUrl] = useState("")
  const [signatureFileName, setSignatureFileName] = useState("")

  const [relievingLetterUrl, setRelievingLetterUrl] = useState("")
  const [relievingLetterFileName, setRelievingLetterFileName] = useState("")

  // SECTION 12: Declaration & Confirmation
  const [declarationAccepted, setDeclarationAccepted] = useState(false)

  // Initialize from existing candidate data if available
  useEffect(() => {
    if (!candidate) return

    if (candidate.advanceForm) {
      const adv = candidate.advanceForm
      setFullName(adv.fullName || "")
      setFatherName(adv.fatherName || "")
      setMotherName(adv.motherName || "")
      setBloodGroup(adv.bloodGroup || "B+")
      setDesignation(adv.designation || candidate.appliedPosition || "")
      setContactNumber(adv.contactNumber || "")
      setEmergencyContactNumber(adv.emergencyContactNumber || "")
      setEmergencyContactPerson(adv.emergencyContactPerson || "")
      setEmergencyContactRelation(adv.emergencyContactRelation || "Parent")
      setPersonalEmail(adv.personalEmail || "")
      setCurrentAddress(adv.currentAddress || "")
      setPermanentAddress(adv.permanentAddress || "")

      setAadharNumber(adv.aadharNumber || "")
      setAadharDocUrl(adv.aadharDocUrl || "")
      setAadharDocName(adv.aadharDocName || "")

      setPanNumber(adv.panNumber || "")
      setPanDocUrl(adv.panDocUrl || "")
      setPanDocName(adv.panDocName || "")

      setPassportNumber(adv.passportNumber || "")
      setPassportDocUrl(adv.passportDocUrl || "")
      setPassportDocName(adv.passportDocName || "")

      setGender(adv.gender || "Male")
      setDrivingLicenseNumber(adv.drivingLicenseNumber || "")
      setDrivingLicenseDocUrl(adv.drivingLicenseDocUrl || "")
      setDrivingLicenseDocName(adv.drivingLicenseDocName || "")

      setDob(adv.dob || "1998-05-15")
      setPlaceOfBirth(adv.placeOfBirth || "")
      setReligion(adv.religion || "")
      setMotherTongue(adv.motherTongue || "")
      if (adv.languages && adv.languages.length > 0) setLanguages(adv.languages)
      setMaritalStatus(adv.maritalStatus || "Single")
      setMarriageDate(adv.marriageDate || "")

      if (adv.familyDetails && adv.familyDetails.length > 0) setFamilyDetails(adv.familyDetails)
      if (adv.healthWellBeing && adv.healthWellBeing.length > 0) setHealthWellBeing(adv.healthWellBeing)
      if (adv.mediclaimCoverage && adv.mediclaimCoverage.length > 0) setMediclaimCoverage(adv.mediclaimCoverage)
      if (adv.bankDetails) setBankDetails(adv.bankDetails)
      if (adv.educationDetails && adv.educationDetails.length > 0) setEducationDetails(adv.educationDetails)
      if (adv.certifications && adv.certifications.length > 0) setCertifications(adv.certifications)
      if (adv.pastExperience && adv.pastExperience.length > 0) setPastExperience(adv.pastExperience)
      if (adv.references && adv.references.length > 0) setReference(adv.references[0])
      if (adv.colleagueContacts && adv.colleagueContacts.length > 0) setColleagueContacts(adv.colleagueContacts)

      setPhotoUrl(adv.photoUrl || "")
      setPhotoFileName(adv.photoFileName || "")
      setResumeUrl(adv.resumeUrl || "")
      setResumeFileName(adv.resumeFileName || "")
      setSignatureUrl(adv.signatureUrl || "")
      setSignatureFileName(adv.signatureFileName || "")
      setRelievingLetterUrl(adv.relievingLetterUrl || "")
      setRelievingLetterFileName(adv.relievingLetterFileName || "")

      setDeclarationAccepted(adv.declarationAccepted || false)
    } else {
      // Hydrate from base candidate profile
      if (candidate.personalInfo) {
        setFullName(candidate.personalInfo.fullName || candidate.fullName)
        setFatherName(candidate.personalInfo.fatherName || "")
        setContactNumber(candidate.personalInfo.mobile || candidate.phone || "")
        setEmergencyContactNumber(candidate.personalInfo.altMobile || "")
        setPersonalEmail(candidate.personalInfo.email || candidate.email)
        setCurrentAddress(candidate.personalInfo.currentAddress || "")
        setPermanentAddress(candidate.personalInfo.permanentAddress || "")
        setGender(candidate.personalInfo.gender || "Male")
        setDob(candidate.personalInfo.dob || "1998-05-15")
      }
      if (candidate.documents) {
        setPhotoUrl(candidate.documents.photoUrl || "")
        setPhotoFileName(candidate.documents.photoFileName || "")
        setResumeUrl(candidate.documents.resumeUrl || "")
        setResumeFileName(candidate.documents.resumeFileName || "")
      }
      setDesignation(candidate.appliedPosition || "")
    }
  }, [candidate])

  // Helper for generic file upload
  const handleGenericFileUpload = async (
    file: File,
    fieldKey: string,
    onSuccess: (url: string, name: string) => void
  ) => {
    setUploadingField(fieldKey)
    const formData = new FormData()
    formData.append("file", file)
    formData.append("type", fieldKey)

    const loadingToast = toast.loading(`Uploading ${file.name}...`)
    try {
      const res = await fetch("/api/hiring/upload", {
        method: "POST",
        body: formData,
      })
      const data = await res.json()
      if (!data.success) {
        throw new Error(data.error || "Upload failed")
      }
      onSuccess(data.url, data.fileName)
      toast.success(`${file.name} uploaded successfully!`, { id: loadingToast })
    } catch (err: any) {
      toast.error(err.message || "Upload failed", { id: loadingToast })
    } finally {
      setUploadingField(null)
    }
  }

  // Submit Handler
  const handleSubmitForm = async () => {
    if (!declarationAccepted) {
      toast.error("Please confirm and accept the legal declaration checkbox before submitting.")
      return
    }

    if (!fullName.trim() || !contactNumber.trim() || !personalEmail.trim()) {
      toast.error("Please ensure Full Name, Contact Number, and Personal Email ID are filled.")
      setActiveSection(1)
      return
    }

    if (isPreview) {
      toast.info("This is an interactive Preview mode for HR testing. Form responses are validated successfully!")
      return
    }

    setIsSubmitting(true)

    const advanceFormPayload: AdvanceCandidateForm = {
      fullName: fullName.trim(),
      fatherName: fatherName.trim(),
      motherName: motherName.trim(),
      bloodGroup,
      designation: designation.trim() || candidate?.appliedPosition || "",
      contactNumber: contactNumber.trim(),
      emergencyContactNumber: emergencyContactNumber.trim(),
      emergencyContactPerson: emergencyContactPerson.trim(),
      emergencyContactRelation,
      personalEmail: personalEmail.trim().toLowerCase(),
      currentAddress: currentAddress.trim(),
      permanentAddress: permanentAddress.trim() || currentAddress.trim(),

      aadharNumber: aadharNumber.trim(),
      aadharDocUrl,
      aadharDocName,

      panNumber: panNumber.trim(),
      panDocUrl,
      panDocName,

      passportNumber: passportNumber.trim(),
      passportDocUrl,
      passportDocName,

      gender,
      drivingLicenseNumber: drivingLicenseNumber.trim(),
      drivingLicenseDocUrl,
      drivingLicenseDocName,

      dob,
      placeOfBirth: placeOfBirth.trim(),
      religion: religion.trim(),
      motherTongue: motherTongue.trim(),
      languages,
      maritalStatus,
      marriageDate: maritalStatus === "Married" ? marriageDate : undefined,

      familyDetails,
      healthWellBeing,
      mediclaimCoverage,
      bankDetails,

      educationDetails,
      certifications,

      pastExperience,
      references: [reference],
      colleagueContacts,

      photoUrl,
      photoFileName,
      resumeUrl,
      resumeFileName,
      signatureUrl,
      signatureFileName,
      relievingLetterUrl,
      relievingLetterFileName,

      declarationAccepted: true,
      submittedAt: new Date().toISOString(),
    }

    try {
      const res = await fetch(`/api/hiring/public/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          advanceForm: advanceFormPayload,
          personalInfo: {
            fullName: fullName.trim(),
            fatherName: fatherName.trim(),
            dob,
            gender,
            mobile: contactNumber.trim(),
            altMobile: emergencyContactNumber.trim(),
            email: personalEmail.trim().toLowerCase(),
            currentAddress: currentAddress.trim(),
            permanentAddress: permanentAddress.trim() || currentAddress.trim(),
            city: placeOfBirth || "Mumbai",
            state: "Maharashtra",
            pincode: "",
            nationality: "Indian",
          },
        }),
      })

      const data = await res.json()
      if (!data.success) {
        throw new Error(data.error || "Failed to submit candidate form.")
      }

      toast.success("Advance Candidate Form successfully submitted! Your profile is now under review.")
      if (onSubmitted && data.candidate) {
        onSubmitted(data.candidate)
      }
      window.scrollTo({ top: 0, behavior: "smooth" })
    } catch (err: any) {
      toast.error(err.message || "Failed to submit form.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Section Navigation Tabs
  const sections = [
    { id: 1, title: "Personal Details", icon: User, count: "24 Items" },
    { id: 2, title: "Family & Health", icon: HeartPulse, count: "Family, Health, Mediclaim" },
    { id: 3, title: "Bank Details", icon: CreditCard, count: "Salary Account & Cheque" },
    { id: 4, title: "Education & Certs", icon: GraduationCap, count: "SSC to PG & Certificates" },
    { id: 5, title: "Experience & References", icon: Briefcase, count: "Past Jobs & Verification" },
    { id: 6, title: "Uploads & Declaration", icon: FileCheck, count: "Documents & Signature" },
  ]

  return (
    <div className="space-y-6">
      {/* Banner / Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 text-white shadow-xl relative overflow-hidden border border-zinc-700/60">
        <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none">
          <ShieldCheck className="h-64 w-64 text-[#548235]" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-extrabold text-sm tracking-widest text-[#548235] uppercase bg-[#548235]/20 px-2.5 py-0.5 rounded-full border border-[#548235]/40">
                Transvolt Mobility Pvt. Ltd.
              </span>
              {isPreview && (
                <Badge className="bg-amber-500 text-black text-[10px] font-bold">
                  HR Interactive Preview Mode
                </Badge>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Official Candidate Information Form
            </h1>
            <p className="text-xs text-zinc-300 max-w-2xl leading-relaxed">
              Please complete all required fields accurately. All personal, academic, banking, and professional details are collected for Transvolt HR onboarding and verified records.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/15 text-xs shrink-0 space-y-1">
            <div className="text-zinc-400 text-[11px]">Applied Designation:</div>
            <div className="font-bold text-white text-sm">
              {designation || candidate?.appliedPosition || "Engineering & Operations"}
            </div>
            <div className="text-[10px] text-zinc-400 font-mono">
              Ref ID: {candidate?.id || "TV-HR-PREVIEW"}
            </div>
          </div>
        </div>

        {/* Section Navigation Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pt-6 scrollbar-none">
          {sections.map((sec) => {
            const Icon = sec.icon
            const isCurrent = activeSection === sec.id
            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => setActiveSection(sec.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                  isCurrent
                    ? "bg-[#548235] text-white shadow-md shadow-[#548235]/30 ring-2 ring-white/20"
                    : "bg-white/10 text-zinc-300 hover:bg-white/20 hover:text-white"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{sec.title}</span>
                <span className="text-[10px] opacity-75 hidden sm:inline-block">({sec.count})</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: PERSONAL DETAILS (24 FIELDS)                                   */}
      {/* ========================================================================= */}
      {activeSection === 1 && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6 animate-in fade-in">
          <div className="border-b border-zinc-100 dark:border-zinc-800 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <User className="h-5 w-5 text-[#548235]" />
                1. Personal Details (24 Comprehensive Information Points)
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Full legal name, addresses, emergency contacts, government identity proofs, and languages.
              </p>
            </div>
            <Badge variant="outline" className="text-xs bg-[#548235]/10 text-[#548235] border-[#548235]/30">
              Step 1 of 6
            </Badge>
          </div>

          {/* Fields Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
            {/* 1. Full Name */}
            <div className="space-y-1.5">
              <label className="font-semibold text-zinc-700 dark:text-zinc-300">
                1. Full Name <span className="text-rose-500">*</span>
              </label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Candidate's Full Name"
                className="h-9 text-xs"
              />
            </div>

            {/* 2. Father's Name */}
            <div className="space-y-1.5">
              <label className="font-semibold text-zinc-700 dark:text-zinc-300">
                2. Father's Name <span className="text-rose-500">*</span>
              </label>
              <Input
                value={fatherName}
                onChange={(e) => setFatherName(e.target.value)}
                placeholder="Father's Full Name"
                className="h-9 text-xs"
              />
            </div>

            {/* 3. Mother's Name */}
            <div className="space-y-1.5">
              <label className="font-semibold text-zinc-700 dark:text-zinc-300">
                3. Mother's Name <span className="text-rose-500">*</span>
              </label>
              <Input
                value={motherName}
                onChange={(e) => setMotherName(e.target.value)}
                placeholder="Mother's Full Name"
                className="h-9 text-xs"
              />
            </div>

            {/* 4. Blood Group */}
            <div className="space-y-1.5">
              <label className="font-semibold text-zinc-700 dark:text-zinc-300">
                4. Blood Group <span className="text-rose-500">*</span>
              </label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-2xs font-medium"
              >
                {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
                  <option key={bg} value={bg}>
                    {bg}
                  </option>
                ))}
              </select>
            </div>

            {/* 5. Designation */}
            <div className="space-y-1.5">
              <label className="font-semibold text-zinc-700 dark:text-zinc-300">
                5. Designation
              </label>
              <Input
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                placeholder="Applied Position / Title"
                className="h-9 text-xs font-semibold"
              />
            </div>

            {/* 6. Contact Number */}
            <div className="space-y-1.5">
              <label className="font-semibold text-zinc-700 dark:text-zinc-300">
                6. Contact Number <span className="text-rose-500">*</span>
              </label>
              <Input
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                placeholder="+91 XXXXX XXXXX"
                className="h-9 text-xs font-mono"
              />
            </div>

            {/* 7. Emergency Contact Number */}
            <div className="space-y-1.5">
              <label className="font-semibold text-zinc-700 dark:text-zinc-300">
                7. Emergency Contact Number <span className="text-rose-500">*</span>
              </label>
              <Input
                value={emergencyContactNumber}
                onChange={(e) => setEmergencyContactNumber(e.target.value)}
                placeholder="+91 Alternate Number"
                className="h-9 text-xs font-mono"
              />
            </div>

            {/* 8. Emergency Contact Person */}
            <div className="space-y-1.5">
              <label className="font-semibold text-zinc-700 dark:text-zinc-300">
                8. Emergency Contact Person <span className="text-rose-500">*</span>
              </label>
              <Input
                value={emergencyContactPerson}
                onChange={(e) => setEmergencyContactPerson(e.target.value)}
                placeholder="Person to contact in emergency"
                className="h-9 text-xs"
              />
            </div>

            {/* 9. Emergency Contact Person Relationship */}
            <div className="space-y-1.5">
              <label className="font-semibold text-zinc-700 dark:text-zinc-300">
                9. Emergency Contact Relationship <span className="text-rose-500">*</span>
              </label>
              <select
                value={emergencyContactRelation}
                onChange={(e) => setEmergencyContactRelation(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-2xs font-medium"
              >
                {["Parent", "Spouse", "Sibling", "Child", "Guardian", "Relative", "Friend"].map((rel) => (
                  <option key={rel} value={rel}>
                    {rel}
                  </option>
                ))}
              </select>
            </div>

            {/* 10. Personal Email ID */}
            <div className="space-y-1.5 sm:col-span-2 md:col-span-1">
              <label className="font-semibold text-zinc-700 dark:text-zinc-300">
                10. Personal Email ID <span className="text-rose-500">*</span>
              </label>
              <Input
                type="email"
                value={personalEmail}
                onChange={(e) => setPersonalEmail(e.target.value)}
                placeholder="candidate@domain.com"
                className="h-9 text-xs"
              />
            </div>

            {/* 16. Gender */}
            <div className="space-y-1.5">
              <label className="font-semibold text-zinc-700 dark:text-zinc-300">
                16. Gender <span className="text-rose-500">*</span>
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-2xs font-medium"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* 18. Date of Birth */}
            <div className="space-y-1.5">
              <label className="font-semibold text-zinc-700 dark:text-zinc-300">
                18. Date of Birth <span className="text-rose-500">*</span>
              </label>
              <Input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="h-9 text-xs"
              />
            </div>

            {/* 19. Place of Birth */}
            <div className="space-y-1.5">
              <label className="font-semibold text-zinc-700 dark:text-zinc-300">
                19. Place of Birth
              </label>
              <Input
                value={placeOfBirth}
                onChange={(e) => setPlaceOfBirth(e.target.value)}
                placeholder="City, State"
                className="h-9 text-xs"
              />
            </div>

            {/* 20. Religion */}
            <div className="space-y-1.5">
              <label className="font-semibold text-zinc-700 dark:text-zinc-300">
                20. Religion
              </label>
              <Input
                value={religion}
                onChange={(e) => setReligion(e.target.value)}
                placeholder="Religion"
                className="h-9 text-xs"
              />
            </div>

            {/* 21. Mother Tongue */}
            <div className="space-y-1.5">
              <label className="font-semibold text-zinc-700 dark:text-zinc-300">
                21. Mother Tongue
              </label>
              <Input
                value={motherTongue}
                onChange={(e) => setMotherTongue(e.target.value)}
                placeholder="Native Language"
                className="h-9 text-xs"
              />
            </div>

            {/* 23. Marital Status */}
            <div className="space-y-1.5">
              <label className="font-semibold text-zinc-700 dark:text-zinc-300">
                23. Marital Status <span className="text-rose-500">*</span>
              </label>
              <select
                value={maritalStatus}
                onChange={(e) => setMaritalStatus(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-2xs font-medium"
              >
                {["Single", "Married", "Separated", "Widower", "Widow"].map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            {/* 24. Marriage Date */}
            {maritalStatus === "Married" && (
              <div className="space-y-1.5">
                <label className="font-semibold text-zinc-700 dark:text-zinc-300">
                  24. Marriage Date
                </label>
                <Input
                  type="date"
                  value={marriageDate}
                  onChange={(e) => setMarriageDate(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>
            )}
          </div>

          {/* Addresses */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
            <div className="space-y-1.5">
              <label className="font-semibold text-zinc-700 dark:text-zinc-300">
                11. Current Address Full <span className="text-rose-500">*</span>
              </label>
              <Textarea
                rows={2}
                value={currentAddress}
                onChange={(e) => setCurrentAddress(e.target.value)}
                placeholder="Flat/House No, Building, Street, City, State, PIN Code"
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-zinc-700 dark:text-zinc-300">
                  12. Permanent Address Full <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setPermanentAddress(currentAddress)}
                  className="text-[11px] text-[#548235] hover:underline font-medium"
                >
                  Same as current
                </button>
              </div>
              <Textarea
                rows={2}
                value={permanentAddress}
                onChange={(e) => setPermanentAddress(e.target.value)}
                placeholder="Permanent native residence address"
                className="text-xs"
              />
            </div>
          </div>

          {/* 4 Identity Documents (Type & Upload) */}
          <div className="border-t border-zinc-200 dark:border-zinc-800 pt-5 space-y-4">
            <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-[#548235]" />
              Government Identity Proofs (Type Number & Upload Document)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* 13. Aadhar Card */}
              <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                    13. Aadhaar Card Number & Upload <span className="text-rose-500">*</span>
                  </label>
                  {aadharDocUrl && (
                    <Badge variant="outline" className="border-emerald-500 text-emerald-600 bg-emerald-50 text-[10px]">
                      Uploaded
                    </Badge>
                  )}
                </div>
                <Input
                  value={aadharNumber}
                  onChange={(e) => setAadharNumber(e.target.value)}
                  placeholder="12-digit Aadhaar Number (XXXX XXXX XXXX)"
                  className="h-8 text-xs font-mono"
                />
                <div className="flex items-center gap-2 pt-1">
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          handleGenericFileUpload(file, "aadhar", (url, name) => {
                            setAadharDocUrl(url)
                            setAadharDocName(name)
                          })
                        }
                      }}
                    />
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800">
                      <Upload className="h-3.5 w-3.5 text-[#548235]" />
                      {aadharDocUrl ? "Replace File" : "Upload Aadhaar (PDF/Image)"}
                    </span>
                  </label>
                  {aadharDocName && (
                    <span className="text-[11px] text-zinc-500 truncate max-w-[160px]">
                      {aadharDocName}
                    </span>
                  )}
                </div>
              </div>

              {/* 14. PAN Card */}
              <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                    14. PAN Card Number & Upload <span className="text-rose-500">*</span>
                  </label>
                  {panDocUrl && (
                    <Badge variant="outline" className="border-emerald-500 text-emerald-600 bg-emerald-50 text-[10px]">
                      Uploaded
                    </Badge>
                  )}
                </div>
                <Input
                  value={panNumber}
                  onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                  placeholder="10-digit PAN (ABCDE1234F)"
                  className="h-8 text-xs font-mono uppercase"
                />
                <div className="flex items-center gap-2 pt-1">
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          handleGenericFileUpload(file, "pan", (url, name) => {
                            setPanDocUrl(url)
                            setPanDocName(name)
                          })
                        }
                      }}
                    />
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800">
                      <Upload className="h-3.5 w-3.5 text-[#548235]" />
                      {panDocUrl ? "Replace File" : "Upload PAN (PDF/Image)"}
                    </span>
                  </label>
                  {panDocName && (
                    <span className="text-[11px] text-zinc-500 truncate max-w-[160px]">
                      {panDocName}
                    </span>
                  )}
                </div>
              </div>

              {/* 15. Passport Card */}
              <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                    15. Passport Number & Upload (Optional)
                  </label>
                  {passportDocUrl && (
                    <Badge variant="outline" className="border-emerald-500 text-emerald-600 bg-emerald-50 text-[10px]">
                      Uploaded
                    </Badge>
                  )}
                </div>
                <Input
                  value={passportNumber}
                  onChange={(e) => setPassportNumber(e.target.value)}
                  placeholder="Passport Number (e.g. Z1234567)"
                  className="h-8 text-xs font-mono"
                />
                <div className="flex items-center gap-2 pt-1">
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          handleGenericFileUpload(file, "passport", (url, name) => {
                            setPassportDocUrl(url)
                            setPassportDocName(name)
                          })
                        }
                      }}
                    />
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800">
                      <Upload className="h-3.5 w-3.5 text-zinc-500" />
                      {passportDocUrl ? "Replace File" : "Upload Passport Copy"}
                    </span>
                  </label>
                  {passportDocName && (
                    <span className="text-[11px] text-zinc-500 truncate max-w-[160px]">
                      {passportDocName}
                    </span>
                  )}
                </div>
              </div>

              {/* 17. Driving License */}
              <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                    17. Driving License Number & Upload (Optional)
                  </label>
                  {drivingLicenseDocUrl && (
                    <Badge variant="outline" className="border-emerald-500 text-emerald-600 bg-emerald-50 text-[10px]">
                      Uploaded
                    </Badge>
                  )}
                </div>
                <Input
                  value={drivingLicenseNumber}
                  onChange={(e) => setDrivingLicenseNumber(e.target.value)}
                  placeholder="DL Number (e.g. MH0120200012345)"
                  className="h-8 text-xs font-mono"
                />
                <div className="flex items-center gap-2 pt-1">
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          handleGenericFileUpload(file, "dl", (url, name) => {
                            setDrivingLicenseDocUrl(url)
                            setDrivingLicenseDocName(name)
                          })
                        }
                      }}
                    />
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800">
                      <Upload className="h-3.5 w-3.5 text-zinc-500" />
                      {drivingLicenseDocUrl ? "Replace File" : "Upload DL Copy"}
                    </span>
                  </label>
                  {drivingLicenseDocName && (
                    <span className="text-[11px] text-zinc-500 truncate max-w-[160px]">
                      {drivingLicenseDocName}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 22. Language Known Matrix (4 Options with tick of Read, Write, Speak) */}
          <div className="border-t border-zinc-200 dark:border-zinc-800 pt-5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                  22. Languages Known (Select Read, Write, Speak for Each Language)
                </label>
                <p className="text-[11px] text-zinc-500">
                  Default 4 common languages configured with checkboxes. Add more languages using button.
                </p>
              </div>
            </div>

            <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-zinc-100 dark:bg-zinc-800/70 text-zinc-700 dark:text-zinc-300 font-semibold border-b border-zinc-200 dark:border-zinc-800">
                  <tr>
                    <th className="py-2.5 px-4">Language</th>
                    <th className="py-2.5 px-4 text-center">Read</th>
                    <th className="py-2.5 px-4 text-center">Write</th>
                    <th className="py-2.5 px-4 text-center">Speak</th>
                    <th className="py-2.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {languages.map((item, idx) => (
                    <tr key={idx} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/40">
                      <td className="py-2 px-4 font-bold text-zinc-800 dark:text-zinc-200">
                        {item.language}
                      </td>
                      <td className="py-2 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={item.read}
                          onChange={(e) => {
                            const updated = [...languages]
                            updated[idx].read = e.target.checked
                            setLanguages(updated)
                          }}
                          className="rounded border-zinc-300 text-[#548235] h-4 w-4 accent-[#548235]"
                        />
                      </td>
                      <td className="py-2 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={item.write}
                          onChange={(e) => {
                            const updated = [...languages]
                            updated[idx].write = e.target.checked
                            setLanguages(updated)
                          }}
                          className="rounded border-zinc-300 text-[#548235] h-4 w-4 accent-[#548235]"
                        />
                      </td>
                      <td className="py-2 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={item.speak}
                          onChange={(e) => {
                            const updated = [...languages]
                            updated[idx].speak = e.target.checked
                            setLanguages(updated)
                          }}
                          className="rounded border-zinc-300 text-[#548235] h-4 w-4 accent-[#548235]"
                        />
                      </td>
                      <td className="py-2 px-4 text-right">
                        {languages.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setLanguages(languages.filter((_, i) => i !== idx))}
                            className="text-rose-500 hover:text-rose-700 p-1"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Add Language Row */}
              <div className="p-3 bg-zinc-50 dark:bg-zinc-800/30 flex items-center gap-2 border-t border-zinc-200 dark:border-zinc-800">
                <Input
                  value={newLangName}
                  onChange={(e) => setNewLangName(e.target.value)}
                  placeholder="Add other language (e.g. German, French, Tamil)..."
                  className="h-8 text-xs max-w-xs"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    if (!newLangName.trim()) return
                    setLanguages([...languages, { language: newLangName.trim(), read: true, write: true, speak: true }])
                    setNewLangName("")
                  }}
                  className="h-8 text-xs font-semibold gap-1"
                >
                  <Plus className="h-3.5 w-3.5 text-[#548235]" /> Add Language
                </Button>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button
              type="button"
              onClick={() => setActiveSection(2)}
              className="bg-[#548235] hover:bg-[#466e2c] text-white text-xs font-bold gap-1.5"
            >
              Next: Family & Health <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2: FAMILY & HEALTH (FAMILY, HEALTH & MEDICLAIM)                   */}
      {/* ========================================================================= */}
      {activeSection === 2 && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-8 animate-in fade-in">
          <div className="border-b border-zinc-100 dark:border-zinc-800 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <HeartPulse className="h-5 w-5 text-[#548235]" />
                2. Family Details, Health & Mediclaim Coverage
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Immediate family details, health and well-being records, and mediclaim insurance beneficiaries.
              </p>
            </div>
            <Badge variant="outline" className="text-xs bg-[#548235]/10 text-[#548235] border-[#548235]/30">
              Step 2 of 6
            </Badge>
          </div>

          {/* SUB-SECTION A: Family Details (Default 4 options + can add more) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-[#548235]" />
                  Family Details (Starts with 4 options, can add more)
                </h3>
                <p className="text-[11px] text-zinc-500">
                  Person Name, Relation, Gender, Date of Birth
                </p>
              </div>

              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() =>
                  setFamilyDetails([
                    ...familyDetails,
                    { id: `fam-${Date.now()}`, name: "", relation: "Relative", gender: "Male", dob: "" },
                  ])
                }
                className="h-7 text-xs font-semibold gap-1 text-[#548235] border-[#548235]/30"
              >
                <Plus className="h-3 w-3" /> Add Family Member
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {familyDetails.map((fam, idx) => (
                <div
                  key={fam.id || idx}
                  className="p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-850/40 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-zinc-700 dark:text-zinc-300">
                      Member #{idx + 1}
                    </span>
                    {familyDetails.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setFamilyDetails(familyDetails.filter((_, i) => i !== idx))}
                        className="text-rose-500 hover:text-rose-700"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-zinc-400">A) Person Name</label>
                      <Input
                        value={fam.name}
                        onChange={(e) => {
                          const updated = [...familyDetails]
                          updated[idx].name = e.target.value
                          setFamilyDetails(updated)
                        }}
                        placeholder="Full Name"
                        className="h-8 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-zinc-400">B) Relation</label>
                      <Input
                        value={fam.relation}
                        onChange={(e) => {
                          const updated = [...familyDetails]
                          updated[idx].relation = e.target.value
                          setFamilyDetails(updated)
                        }}
                        placeholder="e.g. Father, Mother"
                        className="h-8 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-zinc-400">C) Gender</label>
                      <select
                        value={fam.gender}
                        onChange={(e) => {
                          const updated = [...familyDetails]
                          updated[idx].gender = e.target.value
                          setFamilyDetails(updated)
                        }}
                        className="w-full h-8 rounded-md border border-input bg-background px-2 text-xs"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-zinc-400">D) DOB</label>
                      <Input
                        type="date"
                        value={fam.dob}
                        onChange={(e) => {
                          const updated = [...familyDetails]
                          updated[idx].dob = e.target.value
                          setFamilyDetails(updated)
                        }}
                        className="h-8 text-xs"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SUB-SECTION B: For Health and Well Being (Default 4 options + can add more) */}
          <div className="border-t border-zinc-200 dark:border-zinc-800 pt-5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-1.5">
                  <Heart className="h-4 w-4 text-rose-500" />
                  For Health and Well Being (Starts with 4 options, can add more)
                </h3>
                <p className="text-[11px] text-zinc-500">
                  Person Name, Relation, Gender, DOB, Age, Health Issue
                </p>
              </div>

              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() =>
                  setHealthWellBeing([
                    ...healthWellBeing,
                    {
                      id: `hwb-${Date.now()}`,
                      name: "",
                      relation: "Family",
                      gender: "Male",
                      dob: "",
                      age: "",
                      healthIssue: "None",
                    },
                  ])
                }
                className="h-7 text-xs font-semibold gap-1 text-rose-600 border-rose-200"
              >
                <Plus className="h-3 w-3" /> Add Health Record
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {healthWellBeing.map((hwb, idx) => (
                <div
                  key={hwb.id || idx}
                  className="p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-rose-50/20 dark:bg-rose-950/10 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-zinc-700 dark:text-zinc-300">
                      Record #{idx + 1}
                    </span>
                    {healthWellBeing.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setHealthWellBeing(healthWellBeing.filter((_, i) => i !== idx))}
                        className="text-rose-500 hover:text-rose-700"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    <div>
                      <label className="text-[10px] text-zinc-400">A) Person Name</label>
                      <Input
                        value={hwb.name}
                        onChange={(e) => {
                          const updated = [...healthWellBeing]
                          updated[idx].name = e.target.value
                          setHealthWellBeing(updated)
                        }}
                        placeholder="Person Name"
                        className="h-8 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-zinc-400">B) Relation</label>
                      <Input
                        value={hwb.relation}
                        onChange={(e) => {
                          const updated = [...healthWellBeing]
                          updated[idx].relation = e.target.value
                          setHealthWellBeing(updated)
                        }}
                        placeholder="Relation"
                        className="h-8 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-zinc-400">C) Gender</label>
                      <select
                        value={hwb.gender}
                        onChange={(e) => {
                          const updated = [...healthWellBeing]
                          updated[idx].gender = e.target.value
                          setHealthWellBeing(updated)
                        }}
                        className="w-full h-8 rounded-md border border-input bg-background px-2 text-xs"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-zinc-400">D) DOB</label>
                      <Input
                        type="date"
                        value={hwb.dob}
                        onChange={(e) => {
                          const updated = [...healthWellBeing]
                          updated[idx].dob = e.target.value
                          setHealthWellBeing(updated)
                        }}
                        className="h-8 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-zinc-400">E) Age</label>
                      <Input
                        value={hwb.age}
                        onChange={(e) => {
                          const updated = [...healthWellBeing]
                          updated[idx].age = e.target.value
                          setHealthWellBeing(updated)
                        }}
                        placeholder="e.g. 52"
                        className="h-8 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-zinc-400">F) Health Issue</label>
                      <Input
                        value={hwb.healthIssue}
                        onChange={(e) => {
                          const updated = [...healthWellBeing]
                          updated[idx].healthIssue = e.target.value
                          setHealthWellBeing(updated)
                        }}
                        placeholder="e.g. None / BP / Diabetes"
                        className="h-8 text-xs"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SUB-SECTION C: Mediclaim Coverage (Immediate Family) (Default 2 options + can add more) */}
          <div className="border-t border-zinc-200 dark:border-zinc-800 pt-5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-blue-600" />
                  Mediclaim Coverage (For Immediate Family) (Default 2 options + can add more)
                </h3>
                <p className="text-[11px] text-zinc-500">
                  Nominated immediate dependents for corporate group insurance coverage.
                </p>
              </div>

              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() =>
                  setMediclaimCoverage([
                    ...mediclaimCoverage,
                    { id: `med-${Date.now()}`, name: "", relation: "Child", gender: "Male", dob: "" },
                  ])
                }
                className="h-7 text-xs font-semibold gap-1 text-blue-600 border-blue-200"
              >
                <Plus className="h-3 w-3" /> Add Beneficiary
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {mediclaimCoverage.map((med, idx) => (
                <div
                  key={med.id || idx}
                  className="p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-blue-50/20 dark:bg-blue-950/10 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-zinc-700 dark:text-zinc-300">
                      Beneficiary #{idx + 1}
                    </span>
                    {mediclaimCoverage.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setMediclaimCoverage(mediclaimCoverage.filter((_, i) => i !== idx))}
                        className="text-rose-500 hover:text-rose-700"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-zinc-400">A) Person Name</label>
                      <Input
                        value={med.name}
                        onChange={(e) => {
                          const updated = [...mediclaimCoverage]
                          updated[idx].name = e.target.value
                          setMediclaimCoverage(updated)
                        }}
                        placeholder="Dependent Name"
                        className="h-8 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-zinc-400">B) Relation</label>
                      <Input
                        value={med.relation}
                        onChange={(e) => {
                          const updated = [...mediclaimCoverage]
                          updated[idx].relation = e.target.value
                          setMediclaimCoverage(updated)
                        }}
                        placeholder="Spouse / Child"
                        className="h-8 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-zinc-400">C) Gender</label>
                      <select
                        value={med.gender}
                        onChange={(e) => {
                          const updated = [...mediclaimCoverage]
                          updated[idx].gender = e.target.value
                          setMediclaimCoverage(updated)
                        }}
                        className="w-full h-8 rounded-md border border-input bg-background px-2 text-xs"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-zinc-400">D) DOB</label>
                      <Input
                        type="date"
                        value={med.dob}
                        onChange={(e) => {
                          const updated = [...mediclaimCoverage]
                          updated[idx].dob = e.target.value
                          setMediclaimCoverage(updated)
                        }}
                        className="h-8 text-xs"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setActiveSection(1)}
              className="text-xs"
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Previous: Personal Details
            </Button>
            <Button
              type="button"
              onClick={() => setActiveSection(3)}
              className="bg-[#548235] hover:bg-[#466e2c] text-white text-xs font-bold gap-1.5"
            >
              Next: Bank Details <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 3: BANK DETAILS                                                   */}
      {/* ========================================================================= */}
      {activeSection === 3 && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6 animate-in fade-in">
          <div className="border-b border-zinc-100 dark:border-zinc-800 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-[#548235]" />
                3. Bank Details for Salary Account & Cheque Photo Upload
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Official banking details for monthly payroll disbursement and expense reimbursements.
              </p>
            </div>
            <Badge variant="outline" className="text-xs bg-[#548235]/10 text-[#548235] border-[#548235]/30">
              Step 3 of 6
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* 1. Bank Full Name */}
            <div className="space-y-1.5">
              <label className="font-semibold text-zinc-700 dark:text-zinc-300">
                1. Bank Full Name <span className="text-rose-500">*</span>
              </label>
              <Input
                value={bankDetails.bankName}
                onChange={(e) => setBankDetails({ ...bankDetails, bankName: e.target.value })}
                placeholder="e.g. HDFC Bank Ltd. / State Bank of India"
                className="h-9 text-xs"
              />
            </div>

            {/* 2. Account Number */}
            <div className="space-y-1.5">
              <label className="font-semibold text-zinc-700 dark:text-zinc-300">
                2. Account Number <span className="text-rose-500">*</span>
              </label>
              <Input
                value={bankDetails.accountNumber}
                onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                placeholder="e.g. 50100234567890"
                className="h-9 text-xs font-mono"
              />
            </div>

            {/* 3. IFSC Code */}
            <div className="space-y-1.5">
              <label className="font-semibold text-zinc-700 dark:text-zinc-300">
                3. IFSC Code <span className="text-rose-500">*</span>
              </label>
              <Input
                value={bankDetails.ifscCode}
                onChange={(e) => setBankDetails({ ...bankDetails, ifscCode: e.target.value.toUpperCase() })}
                placeholder="e.g. HDFC0001234"
                className="h-9 text-xs font-mono uppercase"
              />
            </div>

            {/* 4. Branch */}
            <div className="space-y-1.5">
              <label className="font-semibold text-zinc-700 dark:text-zinc-300">
                4. Branch Name & City <span className="text-rose-500">*</span>
              </label>
              <Input
                value={bankDetails.branch}
                onChange={(e) => setBankDetails({ ...bankDetails, branch: e.target.value })}
                placeholder="e.g. Powai Branch, Mumbai"
                className="h-9 text-xs"
              />
            </div>
          </div>

          {/* Upload Cheque Book Photo / Cancelled Cheque */}
          <div className="p-5 rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-850/40 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                  <Upload className="h-4 w-4 text-[#548235]" />
                  Upload Cheque Book Photo / Cancelled Cheque
                </h4>
                <p className="text-[11px] text-zinc-500">
                  Please upload a clear photograph or scanned copy of a cancelled cheque or front page of bank passbook.
                </p>
              </div>
              {bankDetails.chequePhotoUrl && (
                <Badge variant="outline" className="border-emerald-500 text-emerald-600 bg-emerald-50 text-[10px]">
                  Uploaded
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-3">
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept=".png,.jpg,.jpeg,.pdf"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      handleGenericFileUpload(file, "bank_cheque", (url, name) => {
                        setBankDetails((prev) => ({
                          ...prev,
                          chequePhotoUrl: url,
                          chequePhotoName: name,
                        }))
                      })
                    }
                  }}
                />
                <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-bold text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 shadow-xs">
                  <Upload className="h-4 w-4 text-[#548235]" />
                  {bankDetails.chequePhotoUrl ? "Replace Cheque Photo" : "Choose Cheque File (PDF/Image)"}
                </span>
              </label>

              {bankDetails.chequePhotoName && (
                <span className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">
                  {bankDetails.chequePhotoName}
                </span>
              )}
            </div>

            {bankDetails.chequePhotoUrl && bankDetails.chequePhotoUrl.startsWith("data:image") && (
              <div className="mt-2 p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 max-w-xs">
                <img
                  src={bankDetails.chequePhotoUrl}
                  alt="Cheque Preview"
                  className="rounded-lg object-contain h-28 w-full"
                />
              </div>
            )}
          </div>

          <div className="flex justify-between pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setActiveSection(2)}
              className="text-xs"
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Previous: Family & Health
            </Button>
            <Button
              type="button"
              onClick={() => setActiveSection(4)}
              className="bg-[#548235] hover:bg-[#466e2c] text-white text-xs font-bold gap-1.5"
            >
              Next: Education & Certs <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 4: EDUCATION & CERTIFICATIONS                                     */}
      {/* ========================================================================= */}
      {activeSection === 4 && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-8 animate-in fade-in">
          <div className="border-b border-zinc-100 dark:border-zinc-800 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-[#548235]" />
                4. Education Details (SSC to PG) & Professional Certifications
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Academic qualifications with marksheet scans and accredited industry certifications.
              </p>
            </div>
            <Badge variant="outline" className="text-xs bg-[#548235]/10 text-[#548235] border-[#548235]/30">
              Step 4 of 6
            </Badge>
          </div>

          {/* Education Details List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-1.5">
                  <GraduationCap className="h-4 w-4 text-[#548235]" />
                  Educational Qualifications (Type & Upload Marksheet)
                </h3>
                <p className="text-[11px] text-zinc-500">
                  SSC, HSC, Diploma, Graduation, Post-Graduate (add more using button)
                </p>
              </div>

              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() =>
                  setEducationDetails([
                    ...educationDetails,
                    {
                      id: `edu-${Date.now()}`,
                      level: "Additional Qualification",
                      passingYear: "",
                      courseType: "Full-Time",
                      specialization: "",
                      institute: "",
                      percentage: "",
                      grade: "",
                      documentUrl: "",
                      documentName: "",
                    },
                  ])
                }
                className="h-7 text-xs font-semibold gap-1 text-[#548235] border-[#548235]/30"
              >
                <Plus className="h-3 w-3" /> Add Additional Qualification
              </Button>
            </div>

            <div className="space-y-3">
              {educationDetails.map((edu, idx) => (
                <div
                  key={edu.id || idx}
                  className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-850/40 space-y-3 text-xs"
                >
                  <div className="flex items-center justify-between border-b border-zinc-200/60 dark:border-zinc-700/60 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-[#548235] bg-[#548235]/10 px-2.5 py-0.5 rounded-lg border border-[#548235]/20">
                        {edu.level}
                      </span>
                      <span className="text-zinc-400 font-medium">Qualification #{idx + 1}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {edu.documentUrl && (
                        <Badge variant="outline" className="border-emerald-500 text-emerald-600 bg-emerald-50 text-[10px]">
                          Marksheet Attached
                        </Badge>
                      )}
                      {educationDetails.length > 3 && (
                        <button
                          type="button"
                          onClick={() => setEducationDetails(educationDetails.filter((_, i) => i !== idx))}
                          className="text-rose-500 hover:text-rose-700 p-1"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                    <div>
                      <label className="text-[10px] text-zinc-400">Passing Year</label>
                      <Input
                        value={edu.passingYear}
                        onChange={(e) => {
                          const updated = [...educationDetails]
                          updated[idx].passingYear = e.target.value
                          setEducationDetails(updated)
                        }}
                        placeholder="e.g. 2020"
                        className="h-8 text-xs font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-zinc-400">Course Type</label>
                      <select
                        value={edu.courseType}
                        onChange={(e) => {
                          const updated = [...educationDetails]
                          updated[idx].courseType = e.target.value
                          setEducationDetails(updated)
                        }}
                        className="w-full h-8 rounded-md border border-input bg-background px-2 text-xs"
                      >
                        <option value="Full-Time">Full-Time</option>
                        <option value="Part-Time">Part-Time</option>
                        <option value="Correspondence">Correspondence</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-[10px] text-zinc-400">Stream / Specialization</label>
                      <Input
                        value={edu.specialization}
                        onChange={(e) => {
                          const updated = [...educationDetails]
                          updated[idx].specialization = e.target.value
                          setEducationDetails(updated)
                        }}
                        placeholder="e.g. Mechanical / Electrical"
                        className="h-8 text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-zinc-400">Percentage %</label>
                      <Input
                        value={edu.percentage}
                        onChange={(e) => {
                          const updated = [...educationDetails]
                          updated[idx].percentage = e.target.value
                          setEducationDetails(updated)
                        }}
                        placeholder="e.g. 78.5"
                        className="h-8 text-xs font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-zinc-400">Grade</label>
                      <Input
                        value={edu.grade}
                        onChange={(e) => {
                          const updated = [...educationDetails]
                          updated[idx].grade = e.target.value
                          setEducationDetails(updated)
                        }}
                        placeholder="e.g. First Class"
                        className="h-8 text-xs"
                      />
                    </div>
                  </div>

                  {/* Institute Name & Marksheet Upload Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-end pt-1">
                    <div className="sm:col-span-2">
                      <label className="text-[10px] text-zinc-400">Institute / College / Board Name</label>
                      <Input
                        value={edu.institute}
                        onChange={(e) => {
                          const updated = [...educationDetails]
                          updated[idx].institute = e.target.value
                          setEducationDetails(updated)
                        }}
                        placeholder="Full School / College / University Name"
                        className="h-8 text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-zinc-400 block mb-1">Upload Marksheet</label>
                      <label className="cursor-pointer block">
                        <input
                          type="file"
                          accept=".pdf,.png,.jpg,.jpeg"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              handleGenericFileUpload(file, `edu_${edu.level}`, (url, name) => {
                                const updated = [...educationDetails]
                                updated[idx].documentUrl = url
                                updated[idx].documentName = name
                                setEducationDetails(updated)
                              })
                            }
                          }}
                        />
                        <span className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800">
                          <Upload className="h-3.5 w-3.5 text-[#548235]" />
                          {edu.documentName ? "Replace Marksheet" : `Upload ${edu.level} Doc`}
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Certifications (Default 4 options + can add more) */}
          <div className="border-t border-zinc-200 dark:border-zinc-800 pt-5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="h-4 w-4 text-purple-600" />
                  Certifications (4 Options default, add more with button; Type & Upload)
                </h3>
                <p className="text-[11px] text-zinc-500">
                  Certificate Name, Specialization, Institute, Date, Validity, Re-validation Date & Scan
                </p>
              </div>

              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() =>
                  setCertifications([
                    ...certifications,
                    {
                      id: `cert-${Date.now()}`,
                      certificateName: "",
                      specialization: "",
                      institute: "",
                      issueDate: "",
                      validity: "",
                      revalidationDate: "",
                      documentUrl: "",
                      documentName: "",
                    },
                  ])
                }
                className="h-7 text-xs font-semibold gap-1 text-purple-600 border-purple-200"
              >
                <Plus className="h-3 w-3" /> Add Certification
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {certifications.map((cert, idx) => (
                <div
                  key={cert.id || idx}
                  className="p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-purple-50/20 dark:bg-purple-950/10 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-zinc-700 dark:text-zinc-300">
                      Certificate #{idx + 1}
                    </span>
                    {certifications.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setCertifications(certifications.filter((_, i) => i !== idx))}
                        className="text-rose-500 hover:text-rose-700"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="col-span-2">
                      <label className="text-[10px] text-zinc-400">Certificate Name</label>
                      <Input
                        value={cert.certificateName}
                        onChange={(e) => {
                          const updated = [...certifications]
                          updated[idx].certificateName = e.target.value
                          setCertifications(updated)
                        }}
                        placeholder="Certificate Title"
                        className="h-8 text-xs font-medium"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-zinc-400">Specialization</label>
                      <Input
                        value={cert.specialization}
                        onChange={(e) => {
                          const updated = [...certifications]
                          updated[idx].specialization = e.target.value
                          setCertifications(updated)
                        }}
                        placeholder="Domain / Field"
                        className="h-8 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-zinc-400">Institute / Body</label>
                      <Input
                        value={cert.institute}
                        onChange={(e) => {
                          const updated = [...certifications]
                          updated[idx].institute = e.target.value
                          setCertifications(updated)
                        }}
                        placeholder="Issuing Institute"
                        className="h-8 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-zinc-400">Issue Date</label>
                      <Input
                        type="date"
                        value={cert.issueDate}
                        onChange={(e) => {
                          const updated = [...certifications]
                          updated[idx].issueDate = e.target.value
                          setCertifications(updated)
                        }}
                        className="h-8 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-zinc-400">Validity / Re-validation</label>
                      <Input
                        value={cert.validity}
                        onChange={(e) => {
                          const updated = [...certifications]
                          updated[idx].validity = e.target.value
                          setCertifications(updated)
                        }}
                        placeholder="e.g. 5 Years / Lifetime"
                        className="h-8 text-xs"
                      />
                    </div>
                  </div>

                  {/* Upload Certificate Scan */}
                  <div className="flex items-center gap-2 pt-1">
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept=".pdf,.png,.jpg,.jpeg"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            handleGenericFileUpload(file, `cert_${idx}`, (url, name) => {
                              const updated = [...certifications]
                              updated[idx].documentUrl = url
                              updated[idx].documentName = name
                              setCertifications(updated)
                            })
                          }
                        }}
                      />
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800">
                        <Upload className="h-3.5 w-3.5 text-purple-600" />
                        {cert.documentName ? "Replace File" : "Upload Certificate"}
                      </span>
                    </label>
                    {cert.documentName && (
                      <span className="text-[11px] text-zinc-500 truncate max-w-[150px]">
                        {cert.documentName}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setActiveSection(3)}
              className="text-xs"
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Previous: Bank Details
            </Button>
            <Button
              type="button"
              onClick={() => setActiveSection(5)}
              className="bg-[#548235] hover:bg-[#466e2c] text-white text-xs font-bold gap-1.5"
            >
              Next: Experience & References <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 5: EXPERIENCE & REFERENCES                                        */}
      {/* ========================================================================= */}
      {activeSection === 5 && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-8 animate-in fade-in">
          <div className="border-b border-zinc-100 dark:border-zinc-800 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-[#548235]" />
                5. Past Experience, References & Colleague Contacts
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Detailed work history, character reference verification, and peer colleagues contact details.
              </p>
            </div>
            <Badge variant="outline" className="text-xs bg-[#548235]/10 text-[#548235] border-[#548235]/30">
              Step 5 of 6
            </Badge>
          </div>

          {/* Past Experience (With 2 options + can add more) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-1.5">
                  <Briefcase className="h-4 w-4 text-[#548235]" />
                  Past Experience (With 2 default options, can add more)
                </h3>
                <p className="text-[11px] text-zinc-500">
                  Organization Name, Designation, Department, Reporting Supervisor, Date of Joining, Last Working Date, Tenure
                </p>
              </div>

              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() =>
                  setPastExperience([
                    ...pastExperience,
                    {
                      id: `exp-${Date.now()}`,
                      organizationName: "",
                      designation: "",
                      department: "",
                      reportingSupervisor: "",
                      dateOfJoining: "",
                      lastWorkingDate: "",
                      tenure: "",
                    },
                  ])
                }
                className="h-7 text-xs font-semibold gap-1 text-[#548235] border-[#548235]/30"
              >
                <Plus className="h-3 w-3" /> Add Organization
              </Button>
            </div>

            <div className="space-y-3">
              {pastExperience.map((exp, idx) => (
                <div
                  key={exp.id || idx}
                  className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-850/40 space-y-3 text-xs"
                >
                  <div className="flex items-center justify-between border-b border-zinc-200/60 dark:border-zinc-700/60 pb-2">
                    <span className="font-extrabold text-zinc-800 dark:text-zinc-200">
                      Organization #{idx + 1}
                    </span>
                    {pastExperience.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setPastExperience(pastExperience.filter((_, i) => i !== idx))}
                        className="text-rose-500 hover:text-rose-700"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                    <div className="sm:col-span-2">
                      <label className="text-[10px] text-zinc-400">1. Organization Name</label>
                      <Input
                        value={exp.organizationName}
                        onChange={(e) => {
                          const updated = [...pastExperience]
                          updated[idx].organizationName = e.target.value
                          setPastExperience(updated)
                        }}
                        placeholder="Company / Employer Name"
                        className="h-8 text-xs font-semibold"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-zinc-400">2. Designation</label>
                      <Input
                        value={exp.designation}
                        onChange={(e) => {
                          const updated = [...pastExperience]
                          updated[idx].designation = e.target.value
                          setPastExperience(updated)
                        }}
                        placeholder="Role / Job Title"
                        className="h-8 text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-zinc-400">3. Department</label>
                      <Input
                        value={exp.department}
                        onChange={(e) => {
                          const updated = [...pastExperience]
                          updated[idx].department = e.target.value
                          setPastExperience(updated)
                        }}
                        placeholder="Department / Team"
                        className="h-8 text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-zinc-400">4. Reporting Supervisor</label>
                      <Input
                        value={exp.reportingSupervisor}
                        onChange={(e) => {
                          const updated = [...pastExperience]
                          updated[idx].reportingSupervisor = e.target.value
                          setPastExperience(updated)
                        }}
                        placeholder="Supervisor Name & Title"
                        className="h-8 text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-zinc-400">5. Date of Joining</label>
                      <Input
                        type="date"
                        value={exp.dateOfJoining}
                        onChange={(e) => {
                          const updated = [...pastExperience]
                          updated[idx].dateOfJoining = e.target.value
                          setPastExperience(updated)
                        }}
                        className="h-8 text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-zinc-400">6. Last Working Date</label>
                      <Input
                        type="date"
                        value={exp.lastWorkingDate}
                        onChange={(e) => {
                          const updated = [...pastExperience]
                          updated[idx].lastWorkingDate = e.target.value
                          setPastExperience(updated)
                        }}
                        className="h-8 text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-zinc-400">7. Tenure</label>
                      <Input
                        value={exp.tenure}
                        onChange={(e) => {
                          const updated = [...pastExperience]
                          updated[idx].tenure = e.target.value
                          setPastExperience(updated)
                        }}
                        placeholder="e.g. 2 Years 3 Months"
                        className="h-8 text-xs"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Reference */}
          <div className="border-t border-zinc-200 dark:border-zinc-800 pt-5 space-y-3">
            <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="h-4 w-4 text-emerald-600" />
              Professional Reference
            </h3>

            <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-emerald-50/20 dark:bg-emerald-950/10 space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                <div>
                  <label className="text-[10px] text-zinc-400">1. Person Name</label>
                  <Input
                    value={reference.personName}
                    onChange={(e) => setReference({ ...reference, personName: e.target.value })}
                    placeholder="Reference Full Name"
                    className="h-8 text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-zinc-400">2. Organization Name</label>
                  <Input
                    value={reference.organizationName}
                    onChange={(e) => setReference({ ...reference, organizationName: e.target.value })}
                    placeholder="Company Name"
                    className="h-8 text-xs"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-zinc-400">3. Designation</label>
                  <Input
                    value={reference.designation}
                    onChange={(e) => setReference({ ...reference, designation: e.target.value })}
                    placeholder="Designation"
                    className="h-8 text-xs"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-zinc-400">4. Department</label>
                  <Input
                    value={reference.department}
                    onChange={(e) => setReference({ ...reference, department: e.target.value })}
                    placeholder="Department"
                    className="h-8 text-xs"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-zinc-400">5. Contact Number</label>
                  <Input
                    value={reference.contactNumber}
                    onChange={(e) => setReference({ ...reference, contactNumber: e.target.value })}
                    placeholder="+91 Contact No"
                    className="h-8 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-zinc-400">6. Reporting Supervisor</label>
                  <Input
                    value={reference.reportingSupervisor}
                    onChange={(e) => setReference({ ...reference, reportingSupervisor: e.target.value })}
                    placeholder="Reporting role"
                    className="h-8 text-xs"
                  />
                </div>
              </div>

              {/* 7. How are you related (Check: Colleague, Friend, Relative) */}
              <div className="pt-2 border-t border-zinc-200/60 dark:border-zinc-800 flex items-center gap-4">
                <span className="text-zinc-600 dark:text-zinc-400 font-semibold text-[11px]">
                  7. How are you related?
                </span>
                {["Colleague", "Friend", "Relative"].map((type) => (
                  <label key={type} className="flex items-center gap-1.5 cursor-pointer font-medium text-xs">
                    <input
                      type="radio"
                      name="ref_relation"
                      checked={reference.relationship === type}
                      onChange={() => setReference({ ...reference, relationship: type })}
                      className="accent-[#548235]"
                    />
                    {type}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Contacts of Colleagues from Last Organization (With 3 options + can add more) */}
          <div className="border-t border-zinc-200 dark:border-zinc-800 pt-5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-blue-600" />
                  Contacts of Colleagues from Last Organization (With 3 options, can add more)
                </h3>
                <p className="text-[11px] text-zinc-500">
                  Peer verification contacts from your most recent organization.
                </p>
              </div>

              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() =>
                  setColleagueContacts([
                    ...colleagueContacts,
                    {
                      id: `col-${Date.now()}`,
                      personName: "",
                      organizationName: "",
                      designation: "",
                      department: "",
                      contactNumber: "",
                      reportingSupervisor: "",
                    },
                  ])
                }
                className="h-7 text-xs font-semibold gap-1 text-blue-600 border-blue-200"
              >
                <Plus className="h-3 w-3" /> Add Colleague
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              {colleagueContacts.map((col, idx) => (
                <div
                  key={col.id || idx}
                  className="p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-blue-50/20 dark:bg-blue-950/10 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-zinc-700 dark:text-zinc-300">
                      Colleague #{idx + 1}
                    </span>
                    {colleagueContacts.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setColleagueContacts(colleagueContacts.filter((_, i) => i !== idx))}
                        className="text-rose-500 hover:text-rose-700"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div>
                      <label className="text-[10px] text-zinc-400">1. Person Name</label>
                      <Input
                        value={col.personName}
                        onChange={(e) => {
                          const updated = [...colleagueContacts]
                          updated[idx].personName = e.target.value
                          setColleagueContacts(updated)
                        }}
                        placeholder="Colleague Name"
                        className="h-8 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-zinc-400">2. Organization</label>
                      <Input
                        value={col.organizationName}
                        onChange={(e) => {
                          const updated = [...colleagueContacts]
                          updated[idx].organizationName = e.target.value
                          setColleagueContacts(updated)
                        }}
                        placeholder="Last Company Name"
                        className="h-8 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-zinc-400">3. Designation & Department</label>
                      <Input
                        value={col.designation}
                        onChange={(e) => {
                          const updated = [...colleagueContacts]
                          updated[idx].designation = e.target.value
                          setColleagueContacts(updated)
                        }}
                        placeholder="e.g. Lead Engineer, Battery Team"
                        className="h-8 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-zinc-400">4. Contact Number</label>
                      <Input
                        value={col.contactNumber}
                        onChange={(e) => {
                          const updated = [...colleagueContacts]
                          updated[idx].contactNumber = e.target.value
                          setColleagueContacts(updated)
                        }}
                        placeholder="+91 Mobile No"
                        className="h-8 text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setActiveSection(4)}
              className="text-xs"
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Previous: Education & Certs
            </Button>
            <Button
              type="button"
              onClick={() => setActiveSection(6)}
              className="bg-[#548235] hover:bg-[#466e2c] text-white text-xs font-bold gap-1.5"
            >
              Next: Uploads & Declaration <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 6: UPLOADS & DECLARATION                                          */}
      {/* ========================================================================= */}
      {activeSection === 6 && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-8 animate-in fade-in">
          <div className="border-b border-zinc-100 dark:border-zinc-800 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <FileCheck className="h-5 w-5 text-[#548235]" />
                6. Mandatory Document Uploads & Formal Declaration
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Attach photograph, latest resume, digital signature, relieving letter, and accept company undertaking.
              </p>
            </div>
            <Badge variant="outline" className="text-xs bg-[#548235]/10 text-[#548235] border-[#548235]/30">
              Final Step 6 of 6
            </Badge>
          </div>

          {/* 4 Mandatory Uploads Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 1. Candidate Photo */}
            <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-850/40 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                  <Camera className="h-4 w-4 text-[#548235]" />
                  1. Candidate Profile Photo <span className="text-rose-500">*</span>
                </label>
                {photoUrl && (
                  <Badge variant="outline" className="border-emerald-500 text-emerald-600 bg-emerald-50 text-[10px]">
                    Photo Attached
                  </Badge>
                )}
              </div>

              {photoUrl && (
                <div className="flex items-center gap-3">
                  <img
                    src={photoUrl}
                    alt="Candidate Preview"
                    className="h-16 w-16 rounded-xl object-cover border border-zinc-300 dark:border-zinc-700 shadow-xs"
                  />
                  <div className="text-xs truncate max-w-[180px]">
                    <span className="font-semibold block">{photoFileName || "Candidate Photo"}</span>
                    <span className="text-emerald-600 text-[11px]">Ready for submission</span>
                  </div>
                </div>
              )}

              <label className="cursor-pointer block">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      handleGenericFileUpload(file, "photo", (url, name) => {
                        setPhotoUrl(url)
                        setPhotoFileName(name)
                      })
                    }
                  }}
                />
                <span className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-bold hover:bg-zinc-100 dark:hover:bg-zinc-800 shadow-xs">
                  <Upload className="h-4 w-4 text-[#548235]" />
                  {photoUrl ? "Change Photo" : "Upload Candidate Photograph (JPG/PNG)"}
                </span>
              </label>
            </div>

            {/* 2. Latest Resume */}
            <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-850/40 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                  <FileText className="h-4 w-4 text-blue-600" />
                  2. Latest Resume / CV <span className="text-rose-500">*</span>
                </label>
                {resumeUrl && (
                  <Badge variant="outline" className="border-emerald-500 text-emerald-600 bg-emerald-50 text-[10px]">
                    Resume Attached
                  </Badge>
                )}
              </div>

              {resumeUrl && (
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs">
                  <FileCheck className="h-5 w-5 text-emerald-600 shrink-0" />
                  <span className="font-semibold truncate">{resumeFileName || "Latest Resume PDF"}</span>
                </div>
              )}

              <label className="cursor-pointer block">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      handleGenericFileUpload(file, "resume", (url, name) => {
                        setResumeUrl(url)
                        setResumeFileName(name)
                      })
                    }
                  }}
                />
                <span className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-bold hover:bg-zinc-100 dark:hover:bg-zinc-800 shadow-xs">
                  <Upload className="h-4 w-4 text-blue-600" />
                  {resumeUrl ? "Replace Resume" : "Upload Latest Resume (PDF)"}
                </span>
              </label>
            </div>

            {/* 3. Signature */}
            <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-850/40 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-indigo-600" />
                  3. Digital Signature <span className="text-rose-500">*</span>
                </label>
                {signatureUrl && (
                  <Badge variant="outline" className="border-emerald-500 text-emerald-600 bg-emerald-50 text-[10px]">
                    Signature Attached
                  </Badge>
                )}
              </div>

              {signatureUrl && (
                <div className="p-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center gap-3">
                  <img
                    src={signatureUrl}
                    alt="Signature"
                    className="h-10 max-w-[120px] object-contain"
                  />
                  <span className="text-xs text-zinc-500 truncate">{signatureFileName}</span>
                </div>
              )}

              <label className="cursor-pointer block">
                <input
                  type="file"
                  accept=".png,.jpg,.jpeg,.pdf"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      handleGenericFileUpload(file, "signature", (url, name) => {
                        setSignatureUrl(url)
                        setSignatureFileName(name)
                      })
                    }
                  }}
                />
                <span className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-bold hover:bg-zinc-100 dark:hover:bg-zinc-800 shadow-xs">
                  <Upload className="h-4 w-4 text-indigo-600" />
                  {signatureUrl ? "Replace Signature" : "Upload Signature Image (PNG/JPG)"}
                </span>
              </label>
            </div>

            {/* 4. Last Organization Relieving Letter */}
            <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-850/40 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                  <FileText className="h-4 w-4 text-amber-600" />
                  4. Last Organization Relieving Letter (Optional)
                </label>
                {relievingLetterUrl && (
                  <Badge variant="outline" className="border-emerald-500 text-emerald-600 bg-emerald-50 text-[10px]">
                    Letter Attached
                  </Badge>
                )}
              </div>

              {relievingLetterUrl && (
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs">
                  <FileCheck className="h-5 w-5 text-emerald-600 shrink-0" />
                  <span className="font-semibold truncate">{relievingLetterFileName}</span>
                </div>
              )}

              <label className="cursor-pointer block">
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.doc"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      handleGenericFileUpload(file, "relieving_letter", (url, name) => {
                        setRelievingLetterUrl(url)
                        setRelievingLetterFileName(name)
                      })
                    }
                  }}
                />
                <span className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-bold hover:bg-zinc-100 dark:hover:bg-zinc-800 shadow-xs">
                  <Upload className="h-4 w-4 text-amber-600" />
                  {relievingLetterUrl ? "Replace Letter" : "Upload Relieving Letter (PDF)"}
                </span>
              </label>
            </div>
          </div>

          {/* Transvolt Official Legal Declaration */}
          <div className="p-6 rounded-3xl border-2 border-[#548235]/40 bg-[#548235]/5 dark:bg-[#548235]/10 space-y-4">
            <div className="space-y-1">
              <span className="text-[11px] font-black uppercase tracking-wider text-[#548235]">
                Official Legal Undertaking
              </span>
              <h4 className="text-sm font-black text-zinc-900 dark:text-zinc-100">
                Transvolt Mobility Pvt. Ltd. — Declaration
              </h4>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed font-serif italic">
              "Dear Sir, Madam,
              <br />
              <br />
              I hereby declare that the information furnished above is true to the best of my knowledge. I understand that any misrepresentation or non-disclosure may lead to disciplinary action as per company policy. I agree to update HR immediately incase of any change in the above information during my employment."
            </div>

            {/* Confirmation Check Box */}
            <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border-2 border-emerald-500/40 cursor-pointer shadow-xs transition-all hover:border-[#548235]">
              <input
                type="checkbox"
                checked={declarationAccepted}
                onChange={(e) => setDeclarationAccepted(e.target.checked)}
                className="mt-0.5 rounded border-zinc-300 text-[#548235] h-5 w-5 accent-[#548235]"
              />
              <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 leading-normal">
                I solemnly confirm and agree to the above Transvolt Mobility Pvt. Ltd. declaration and authorize HR verification of all provided documents.
              </span>
            </label>
          </div>

          {/* SUBMIT BUTTON */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setActiveSection(5)}
              className="text-xs w-full sm:w-auto"
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Previous: Experience & References
            </Button>

            <Button
              type="button"
              disabled={isSubmitting}
              onClick={handleSubmitForm}
              className="w-full sm:w-auto px-8 py-6 rounded-2xl bg-gradient-to-r from-[#548235] to-emerald-600 hover:from-[#466e2c] hover:to-emerald-700 text-white font-extrabold text-sm shadow-xl shadow-[#548235]/30 transform active:scale-95 transition-all gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Submitting Application...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-5 w-5" />
                  SUBMIT APPLICATION
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

