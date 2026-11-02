export type CandidateStatus =
  | "APPLICATION_PENDING"
  | "UNDER_REVIEW"
  | "CHANGES_REQUESTED"
  | "INTERVIEW_SCHEDULED"
  | "INTERVIEW_RESCHEDULED"
  | "INTERVIEW_COMPLETED"
  | "HIRED"
  | "NOT_SELECTED"

export type InterviewMode = "ONLINE" | "IN_PERSON"

export type InterviewPlatform =
  | "Google Meet"
  | "Microsoft Teams"
  | "Zoom"
  | "In-person"
  | "Other"

export type QuestionFieldType =
  | "TEXT" // Single line input
  | "PARAGRAPH" // Multi-line Textarea
  | "CHECKBOX" // Single confirmation checkbox
  | "MULTI_CHECKBOX" // Multiple checkbox selection
  | "DROPDOWN" // Select dropdown
  | "VOLUME_SLIDER" // Volume / proficiency slider (1-10 or custom range)
  | "YES_NO" // Radio / Switch Yes or No
  | "FILE_UPLOAD" // Document or Photo upload
  | "DATE" // Date picker

export interface FormQuestionCategory {
  id: string
  name: string
  description?: string
  order: number
}

export interface CandidateFormQuestion {
  id: string
  categoryId: string
  title: string
  description?: string
  fieldType: QuestionFieldType
  required: boolean
  placeholder?: string
  options?: string[] // For DROPDOWN and MULTI_CHECKBOX
  sliderConfig?: {
    min: number
    max: number
    step: number
    unit?: string // e.g. "/ 10" or "%"
    leftLabel?: string // e.g. "Basic"
    rightLabel?: string // e.g. "Mastery / Expert"
  }
  order: number
}

export interface EducationRecord {
  id: string
  highestQual: string
  degree: string
  specialization: string
  institution: string
  passingYear: string
  score: string
  certifications?: string
}

export interface LanguageProficiency {
  language: string
  read: boolean
  write: boolean
  speak: boolean
}

export interface FamilyMemberRecord {
  id: string
  name: string
  relation: string
  gender: string
  dob: string
}

export interface HealthWellBeingRecord {
  id: string
  name: string
  relation: string
  gender: string
  dob: string
  age: string
  healthIssue: string
}

export interface MediclaimMemberRecord {
  id: string
  name: string
  relation: string
  gender: string
  dob: string
}

export interface BankDetailsRecord {
  bankName: string
  accountNumber: string
  ifscCode: string
  branch: string
  chequePhotoUrl?: string
  chequePhotoName?: string
}

export interface DetailedEducationRecord {
  id: string
  level: "SSC" | "HSC" | "Diploma" | "Graduation" | "Post Graduate" | string
  passingYear: string
  courseType: "Full-Time" | "Part-Time" | "Correspondence" | string
  specialization: string
  institute: string
  percentage: string
  grade: string
  documentUrl?: string
  documentName?: string
}

export interface CertificationRecord {
  id: string
  certificateName: string
  specialization: string
  institute: string
  issueDate: string
  validity: string
  revalidationDate?: string
  documentUrl?: string
  documentName?: string
}

export interface DetailedExperienceRecord {
  id: string
  organizationName: string
  designation: string
  department: string
  reportingSupervisor: string
  dateOfJoining: string
  lastWorkingDate: string
  tenure: string
}

export interface ReferenceRecord {
  id?: string
  personName: string
  organizationName: string
  designation: string
  department: string
  contactNumber: string
  reportingSupervisor: string
  relationship: "Colleague" | "Friend" | "Relative" | string
}

export interface ColleagueContactRecord {
  id: string
  personName: string
  organizationName: string
  designation: string
  department: string
  contactNumber: string
  reportingSupervisor: string
}

export interface AdvanceCandidateForm {
  // Personal Details (24 fields)
  fullName: string
  fatherName: string
  motherName: string
  bloodGroup: string
  designation: string
  contactNumber: string
  emergencyContactNumber: string
  emergencyContactPerson: string
  emergencyContactRelation: string
  personalEmail: string
  currentAddress: string
  permanentAddress: string
  aadharNumber: string
  aadharDocUrl?: string
  aadharDocName?: string
  panNumber: string
  panDocUrl?: string
  panDocName?: string
  passportNumber: string
  passportDocUrl?: string
  passportDocName?: string
  gender: string
  drivingLicenseNumber: string
  drivingLicenseDocUrl?: string
  drivingLicenseDocName?: string
  dob: string
  placeOfBirth: string
  religion: string
  motherTongue: string
  languages: LanguageProficiency[]
  maritalStatus: "Single" | "Married" | "Separated" | "Widower" | "Widow" | string
  marriageDate?: string

  // Family, Health, Mediclaim
  familyDetails: FamilyMemberRecord[]
  healthWellBeing: HealthWellBeingRecord[]
  mediclaimCoverage: MediclaimMemberRecord[]

  // Bank
  bankDetails: BankDetailsRecord

  // Education & Certification
  educationDetails: DetailedEducationRecord[]
  certifications: CertificationRecord[]

  // Experience, Reference, Colleagues
  pastExperience: DetailedExperienceRecord[]
  references: ReferenceRecord[]
  colleagueContacts: ColleagueContactRecord[]

  // Uploads
  photoUrl?: string
  photoFileName?: string
  resumeUrl?: string
  resumeFileName?: string
  signatureUrl?: string
  signatureFileName?: string
  relievingLetterUrl?: string
  relievingLetterFileName?: string

  // Declaration
  declarationAccepted: boolean
  submittedAt?: string
}

export interface ExperienceRecord {
  id: string
  company: string
  designation: string
  duration: string
  responsibilities: string
  currentCtc?: string
  expectedCtc?: string
  noticePeriod?: string
  lastWorkingDay?: string
  reasonForLeaving?: string
  referenceContact?: string
}

export interface InterviewSchedule {
  roundNumber: number
  roundName: string
  date: string // YYYY-MM-DD
  startTime: string // HH:MM
  endTime: string // HH:MM
  mode: InterviewMode
  platform: InterviewPlatform
  meetingUrl?: string
  officeAddress?: string
  contactPerson: string
  contactPhone: string
  instructions?: string
  internalRemarks?: string
  scheduledAt: string
  scheduledBy: string
  previousSchedules?: Array<{
    date: string
    startTime: string
    endTime: string
    mode: InterviewMode
    platform: InterviewPlatform
    rescheduledAt: string
    rescheduledBy: string
    rescheduleReason: string
    meetingUrl?: string
    officeAddress?: string
  }>
}

export interface InterviewEvaluation {
  id: string
  roundName: string
  evaluatedBy: string
  evaluatedAt: string
  technicalRating: number // 1 to 5
  communicationRating: number // 1 to 5
  experienceRating: number // 1 to 5
  problemSolvingRating: number // 1 to 5
  confidenceRating: number // 1 to 5
  overallRating: number // 1 to 5
  strengths: string
  improvements: string
  interviewerRemarks: string
  recommendation: "NEXT_ROUND" | "ANOTHER_INTERVIEW" | "HOLD" | "HIRE" | "REJECT"
}

export interface InternalNote {
  id: string
  author: string
  createdAt: string
  note: string
}

export interface ActivityLog {
  id: string
  type: string
  description: string
  timestamp: string
  actor: string
}

export interface Candidate {
  id: string // e.g. "TV-HR-2026-001"
  token: string // Secure URL token e.g. "tv-rec-a8f9c1..."
  fullName: string
  email: string
  phone?: string
  appliedPosition: string
  department: string
  status: CandidateStatus
  
  // Invitation Details
  invitation: {
    sentAt: string
    sentBy: string
    deadline?: string
    emailStatus: "SENT" | "DELIVERED" | "OPENED"
    customMessage?: string
  }

  // Uploaded Documents
  documents?: {
    photoUrl?: string
    photoFileName?: string
    resumeUrl?: string
    resumeFileName?: string
    coverLetterUrl?: string
    coverLetterFileName?: string
    additionalDocs?: Array<{
      name: string
      url: string
      size: string
      uploadedAt: string
    }>
  }

  // Personal Information
  personalInfo?: {
    fullName: string
    fatherName: string
    dob: string
    gender: string
    mobile: string
    altMobile?: string
    email: string
    currentAddress: string
    permanentAddress: string
    city: string
    state: string
    pincode: string
    nationality: string
  }

  // Education Records
  education?: EducationRecord[]

  // Experience
  experience?: {
    isExperienced: boolean
    totalYears?: string
    records: ExperienceRecord[]
  }

  // Job Specific
  jobSpecific?: {
    positionApplied: string
    department: string
    preferredLocation: string
    relevantSkills: string
    technicalSkills: string
    toolsKnowledge: string
    whyTransvolt: string
    whyHireYou: string
    relevantExperience: string
    comfortableWithDuties: boolean
    willingToTravel: boolean
    additionalInfo?: string
  }

  // Dynamic Custom Questions Answers
  customAnswers?: Record<string, any>

  // Additional Information
  additionalInfo?: {
    languages: string[]
    englishProficiency: string
    drivingLicence: string
    portfolioUrl?: string
    linkedinUrl?: string
    emergencyContactName: string
    emergencyContactPhone: string
  }

  // Candidate Interview Preferences
  interviewPreferences?: {
    preferredDate: string
    preferredTime: string
    altDate?: string
    altTime?: string
    modePreference: InterviewMode
    notes?: string
  }

  // Submission metadata
  submission?: {
    submittedAt?: string
    declarationAccepted?: boolean
  }

  // Change request notes (if HR asks candidate for corrections)
  changeRequest?: {
    requestedAt: string
    requestedBy: string
    remarks: string
  }

  // Interview Schedule
  interviewSchedule?: InterviewSchedule

  // Interview Evaluations
  evaluations?: InterviewEvaluation[]

  // Final Decision
  decision?: {
    status?: "HIRED" | "NOT_SELECTED"
    decisionDate?: string
    decidedBy?: string
    rejectionReason?: string
    feedbackMessage?: string
    joiningDate?: string
    offeredDesignation?: string
    offeredDepartment?: string
    joiningInstructions?: string
  }

  // Internal HR Notes & Activity
  internalNotes?: InternalNote[]
  timeline?: ActivityLog[]

  // Advance Candidate Form Details
  advanceForm?: AdvanceCandidateForm

  createdAt: string
  updatedAt: string
}

export interface RecruitmentSettings {
  companyName: string
  hrContactPerson: string
  hrContactPhone: string
  officeAddress: string
  recruitmentEmail: string
  defaultDeadlineDays: number
  maxUploadSizeMb: number
  allowedFileTypes: string[]
  departments: string[]
  positions: string[]
  interviewPlatforms: InterviewPlatform[]
  questionCategories?: FormQuestionCategory[]
  candidateQuestions?: CandidateFormQuestion[]
}

export interface EmailLog {
  id: string
  candidateId: string
  candidateName: string
  recipientEmail: string
  subject: string
  type:
    | "INVITATION"
    | "INVITATION_REMINDER"
    | "SUBMISSION_CONFIRMATION"
    | "CHANGES_REQUESTED"
    | "INTERVIEW_SCHEDULED"
    | "INTERVIEW_RESCHEDULED"
    | "INTERVIEW_REMINDER"
    | "HIRED"
    | "NOT_SELECTED"
  sentAt: string
  status: "SENT" | "DELIVERED" | "FAILED"
  previewHtml?: string
  applicationUrl?: string
}
