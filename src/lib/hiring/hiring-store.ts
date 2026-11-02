import fs from "fs"
import path from "path"
import {
  Candidate,
  RecruitmentSettings,
  EmailLog,
  InterviewSchedule,
  InterviewEvaluation,
  CandidateStatus,
  FormQuestionCategory,
  CandidateFormQuestion,
} from "./types"

const DATA_DIR = path.join(process.cwd(), ".data")
const HIRING_FILE = path.join(DATA_DIR, "hiring.json")

export const DEFAULT_QUESTION_CATEGORIES: FormQuestionCategory[] = [
  {
    id: "cat-personal",
    name: "1. Personal Details",
    description: "Candidate core personal information, addresses, identity proofs & languages",
    order: 1,
  },
  {
    id: "cat-family",
    name: "2. Family Details",
    description: "Immediate family member records, relations and birth details",
    order: 2,
  },
  {
    id: "cat-health",
    name: "3. Health and Well-Being",
    description: "Family health details, ongoing conditions, and medical declarations",
    order: 3,
  },
  {
    id: "cat-mediclaim",
    name: "4. Mediclaim Coverage (Immediate Family)",
    description: "Nominated beneficiaries for Transvolt corporate mediclaim insurance policy",
    order: 4,
  },
  {
    id: "cat-bank",
    name: "5. Bank Details",
    description: "Direct salary disbursement account, IFSC branch details & cancelled cheque",
    order: 5,
  },
  {
    id: "cat-education",
    name: "6. Education Details",
    description: "Academic history from SSC through Post Graduation with marksheets",
    order: 6,
  },
  {
    id: "cat-certification",
    name: "7. Certifications",
    description: "Professional certifications, issuing bodies, licenses, and validity",
    order: 7,
  },
  {
    id: "cat-experience",
    name: "8. Past Experience",
    description: "Chronological employment history, roles, reporting supervisors, and tenures",
    order: 8,
  },
  {
    id: "cat-reference",
    name: "9. Professional References",
    description: "Verifiable professional and personal character references",
    order: 9,
  },
  {
    id: "cat-colleagues",
    name: "10. Contacts of Colleagues from Last Organization",
    description: "Peer and coworker contact verifications from most recent workplace",
    order: 10,
  },
  {
    id: "cat-uploads",
    name: "11. Mandatory Document Uploads",
    description: "Official candidate photo, updated resume, digital signature, and relieving letter",
    order: 11,
  },
  {
    id: "cat-declaration",
    name: "12. Declaration & Legal Undertaking",
    description: "Formal information accuracy undertaking and company terms confirmation",
    order: 12,
  },
]

export const DEFAULT_CANDIDATE_QUESTIONS: CandidateFormQuestion[] = [
  // SECTION 1: Personal Details (24 questions)
  {
    id: "q-p-fullname",
    categoryId: "cat-personal",
    title: "1. Full Name",
    description: "Official name as registered on government identity proofs",
    fieldType: "TEXT",
    required: true,
    placeholder: "e.g. Vikramaditya Sharma",
    order: 1,
  },
  {
    id: "q-p-fathername",
    categoryId: "cat-personal",
    title: "2. Father's Name",
    description: "Full name of father",
    fieldType: "TEXT",
    required: true,
    placeholder: "e.g. Ramesh Chandra Sharma",
    order: 2,
  },
  {
    id: "q-p-mothername",
    categoryId: "cat-personal",
    title: "3. Mother's Name",
    description: "Full name of mother",
    fieldType: "TEXT",
    required: true,
    placeholder: "e.g. Shanti Devi Sharma",
    order: 3,
  },
  {
    id: "q-p-bloodgroup",
    categoryId: "cat-personal",
    title: "4. Blood Group",
    description: "Medical blood group for emergency safety records",
    fieldType: "DROPDOWN",
    required: true,
    options: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    order: 4,
  },
  {
    id: "q-p-designation",
    categoryId: "cat-personal",
    title: "5. Designation Applied For",
    description: "Position or title you are being considered for",
    fieldType: "TEXT",
    required: true,
    placeholder: "e.g. Senior EV Powertrain Engineer",
    order: 5,
  },
  {
    id: "q-p-contact",
    categoryId: "cat-personal",
    title: "6. Primary Contact Number",
    description: "10-digit mobile number for calls & WhatsApp",
    fieldType: "TEXT",
    required: true,
    placeholder: "+91 98765 43210",
    order: 6,
  },
  {
    id: "q-p-emer-contact",
    categoryId: "cat-personal",
    title: "7. Emergency Contact Number",
    description: "Alternate reachable number during emergencies",
    fieldType: "TEXT",
    required: true,
    placeholder: "+91 98765 00000",
    order: 7,
  },
  {
    id: "q-p-emer-person",
    categoryId: "cat-personal",
    title: "8. Emergency Contact Person Name",
    description: "Name of the person to contact during emergencies",
    fieldType: "TEXT",
    required: true,
    placeholder: "e.g. Ananya Sharma",
    order: 8,
  },
  {
    id: "q-p-emer-relation",
    categoryId: "cat-personal",
    title: "9. Emergency Contact Person Relationship",
    description: "Relationship with emergency contact",
    fieldType: "DROPDOWN",
    required: true,
    options: ["Spouse", "Father", "Mother", "Brother", "Sister", "Son", "Daughter", "Guardian", "Friend"],
    order: 9,
  },
  {
    id: "q-p-email",
    categoryId: "cat-personal",
    title: "10. Personal Email ID",
    description: "Primary personal email address for communications",
    fieldType: "TEXT",
    required: true,
    placeholder: "e.g. vikram.sharma@gmail.com",
    order: 10,
  },
  {
    id: "q-p-cur-address",
    categoryId: "cat-personal",
    title: "11. Current Address Full",
    description: "Complete present residential address with landmark and PIN code",
    fieldType: "PARAGRAPH",
    required: true,
    placeholder: "Flat / House No, Street, Area, City, State, PIN Code",
    order: 11,
  },
  {
    id: "q-p-perm-address",
    categoryId: "cat-personal",
    title: "12. Permanent Address Full",
    description: "Permanent native residence address",
    fieldType: "PARAGRAPH",
    required: true,
    placeholder: "Permanent address as per government documents",
    order: 12,
  },
  {
    id: "q-p-aadhar",
    categoryId: "cat-personal",
    title: "13. Aadhaar Card Number (Type & Upload)",
    description: "12-digit UIDAI number and clear front/back scan file",
    fieldType: "TEXT",
    required: true,
    placeholder: "XXXX XXXX XXXX",
    order: 13,
  },
  {
    id: "q-p-pan",
    categoryId: "cat-personal",
    title: "14. PAN Card Number (Type & Upload)",
    description: "10-digit alphanumeric Permanent Account Number & copy",
    fieldType: "TEXT",
    required: true,
    placeholder: "ABCDE1234F",
    order: 14,
  },
  {
    id: "q-p-passport",
    categoryId: "cat-personal",
    title: "15. Passport Number (Type & Upload)",
    description: "Indian / International Passport number & scan (if available)",
    fieldType: "TEXT",
    required: false,
    placeholder: "e.g. Z1234567",
    order: 15,
  },
  {
    id: "q-p-gender",
    categoryId: "cat-personal",
    title: "16. Gender",
    description: "Gender identity",
    fieldType: "DROPDOWN",
    required: true,
    options: ["Male", "Female", "Other"],
    order: 16,
  },
  {
    id: "q-p-dl",
    categoryId: "cat-personal",
    title: "17. Driving License Number (Type & Upload)",
    description: "Motor Vehicle Driving License number & scan",
    fieldType: "TEXT",
    required: false,
    placeholder: "e.g. MH0120200012345",
    order: 17,
  },
  {
    id: "q-p-dob",
    categoryId: "cat-personal",
    title: "18. Date of Birth",
    description: "Date of birth as on birth certificate / matriculation record",
    fieldType: "DATE",
    required: true,
    placeholder: "YYYY-MM-DD",
    order: 18,
  },
  {
    id: "q-p-pob",
    categoryId: "cat-personal",
    title: "19. Place of Birth",
    description: "City / Town and State of birth",
    fieldType: "TEXT",
    required: true,
    placeholder: "e.g. Mumbai, Maharashtra",
    order: 19,
  },
  {
    id: "q-p-religion",
    categoryId: "cat-personal",
    title: "20. Religion",
    description: "Religious background (optional / as per personal records)",
    fieldType: "TEXT",
    required: false,
    placeholder: "e.g. Hindu / Muslim / Christian / Sikh / Jain / Other",
    order: 20,
  },
  {
    id: "q-p-mother-tongue",
    categoryId: "cat-personal",
    title: "21. Mother Tongue",
    description: "Native primary language spoken at home",
    fieldType: "TEXT",
    required: true,
    placeholder: "e.g. Marathi / Hindi / Gujarati / English",
    order: 21,
  },
  {
    id: "q-p-languages",
    categoryId: "cat-personal",
    title: "22. Languages Known (Read, Write, Speak)",
    description: "Languages proficiency matrix with Read, Write, Speak capabilities",
    fieldType: "MULTI_CHECKBOX",
    required: true,
    options: ["English (Read/Write/Speak)", "Hindi (Read/Write/Speak)", "Marathi (Read/Write/Speak)", "Gujarati (Read/Write/Speak)"],
    order: 22,
  },
  {
    id: "q-p-marital-status",
    categoryId: "cat-personal",
    title: "23. Marital Status",
    description: "Current marital status",
    fieldType: "DROPDOWN",
    required: true,
    options: ["Single", "Married", "Separated", "Widower", "Widow"],
    order: 23,
  },
  {
    id: "q-p-marriage-date",
    categoryId: "cat-personal",
    title: "24. Marriage Date",
    description: "Date of marriage (applicable if married)",
    fieldType: "DATE",
    required: false,
    placeholder: "YYYY-MM-DD",
    order: 24,
  },

  // SECTION 2: Family Details
  {
    id: "q-fam-members",
    categoryId: "cat-family",
    title: "Family Member Details (Name, Relation, Gender, DOB)",
    description: "Details of up to 4 family members (add more using button)",
    fieldType: "TEXT",
    required: true,
    placeholder: "Person Name, Relation, Gender, DOB",
    order: 25,
  },

  // SECTION 3: Health and Well-Being
  {
    id: "q-health-wellbeing",
    categoryId: "cat-health",
    title: "Health & Well-Being Records (Name, Relation, Gender, DOB, Age, Health Issue)",
    description: "Health status and past medical conditions for family members",
    fieldType: "TEXT",
    required: false,
    placeholder: "Person Name, Relation, Gender, DOB, Age, Health Issue",
    order: 26,
  },

  // SECTION 4: Mediclaim Coverage
  {
    id: "q-mediclaim-members",
    categoryId: "cat-mediclaim",
    title: "Mediclaim Coverage for Immediate Family",
    description: "Nominated beneficiaries (up to 2 default, add more with button)",
    fieldType: "TEXT",
    required: true,
    placeholder: "Person Name, Relation, Gender, DOB",
    order: 27,
  },

  // SECTION 5: Bank Details
  {
    id: "q-bank-details",
    categoryId: "cat-bank",
    title: "Bank Account Details (Bank Name, Account No, IFSC, Branch, Cheque Photo)",
    description: "Salary account details and cancelled cheque upload",
    fieldType: "TEXT",
    required: true,
    placeholder: "Bank Name, A/C No, IFSC, Branch",
    order: 28,
  },

  // SECTION 6: Education Details
  {
    id: "q-edu-ssc",
    categoryId: "cat-education",
    title: "1. SSC (10th Standard) Details & Marksheet Upload",
    description: "Passing Year, Full/Part Time, Stream, Board/School, Percentage %, Grade & Upload",
    fieldType: "TEXT",
    required: true,
    order: 29,
  },
  {
    id: "q-edu-hsc",
    categoryId: "cat-education",
    title: "2. HSC (12th Standard) Details & Marksheet Upload",
    description: "Passing Year, Full/Part Time, Stream, Board/Junior College, Percentage %, Grade & Upload",
    fieldType: "TEXT",
    required: false,
    order: 30,
  },
  {
    id: "q-edu-diploma",
    categoryId: "cat-education",
    title: "3. Polytechnic / Technical Diploma & Marksheet Upload",
    description: "Passing Year, Full/Part Time, Stream, Institute, Percentage %, Grade & Upload",
    fieldType: "TEXT",
    required: false,
    order: 31,
  },
  {
    id: "q-edu-grad",
    categoryId: "cat-education",
    title: "4. Graduation (Degree) Details & Certificate Upload",
    description: "Passing Year, Full/Part Time, Stream/Specialization, University/College, Percentage %, Grade & Upload",
    fieldType: "TEXT",
    required: true,
    order: 32,
  },
  {
    id: "q-edu-pg",
    categoryId: "cat-education",
    title: "5. Post Graduation Details & Certificate Upload",
    description: "Passing Year, Full/Part Time, Specialization, University/Institute, Percentage %, Grade & Upload",
    fieldType: "TEXT",
    required: false,
    order: 33,
  },

  // SECTION 7: Certifications
  {
    id: "q-certifications",
    categoryId: "cat-certification",
    title: "Professional Certifications (Name, Specialization, Institute, Date, Validity, Upload)",
    description: "4 default certifications with document upload (add more with button)",
    fieldType: "TEXT",
    required: false,
    order: 34,
  },

  // SECTION 8: Past Experience
  {
    id: "q-past-experience",
    categoryId: "cat-experience",
    title: "Past Organizations Experience Details (2 Default + Add More)",
    description: "Organization Name, Designation, Department, Supervisor, DOJ, LWD, Tenure",
    fieldType: "TEXT",
    required: true,
    order: 35,
  },

  // SECTION 9: References
  {
    id: "q-references",
    categoryId: "cat-reference",
    title: "Professional References (Name, Org, Designation, Dept, Contact, Supervisor, Relationship)",
    description: "Verifiable references (Check: Colleague, Friend, Relative)",
    fieldType: "TEXT",
    required: true,
    order: 36,
  },

  // SECTION 10: Colleagues from Last Organization
  {
    id: "q-colleagues-contacts",
    categoryId: "cat-colleagues",
    title: "Contacts of Colleagues from Last Organization (3 Default + Add More)",
    description: "Colleague Name, Organization, Designation, Department, Contact No, Supervisor",
    fieldType: "TEXT",
    required: true,
    order: 37,
  },

  // SECTION 11: Mandatory Uploads
  {
    id: "q-uploads-mandatory",
    categoryId: "cat-uploads",
    title: "Candidate Photo, Resume, Signature, Relieving Letter",
    description: "4 critical recruitment document attachments",
    fieldType: "FILE_UPLOAD",
    required: true,
    order: 38,
  },

  // SECTION 12: Declaration & Legal Undertaking
  {
    id: "q-declaration",
    categoryId: "cat-declaration",
    title: "Transvolt Mobility Declaration & Confirmation Checkbox",
    description: "Legal accuracy statement and disciplinary policy acknowledgment",
    fieldType: "CHECKBOX",
    required: true,
    order: 39,
  },
]

const DEFAULT_SETTINGS: RecruitmentSettings = {
  companyName: "Transvolt Mobility Private Limited",
  hrContactPerson: "HR Recruitment Cell (Faheem S.)",
  hrContactPhone: "+91 98200 12345",
  officeAddress: "Transvolt Mobility HQ, 4th Floor, Tech Park, Powai, Mumbai, Maharashtra 400076",
  recruitmentEmail: "careers@transvoltmobility.com",
  defaultDeadlineDays: 7,
  maxUploadSizeMb: 10,
  allowedFileTypes: [".pdf", ".jpg", ".jpeg", ".png", ".doc", ".docx"],
  departments: [
    "Design & Branding",
    "EV Engineering & Powertrain",
    "Fleet Operations",
    "Software & IoT",
    "Sales & Business Development",
    "Battery Technology",
    "Supply Chain & Procurement",
    "Human Resources",
  ],
  positions: [
    "Senior EV Systems Engineer",
    "Lead UI/UX Designer",
    "Fleet Operations Manager",
    "Battery Safety Specialist",
    "Full Stack IoT Developer",
    "Branding & Marketing Specialist",
    "Field Quality Inspector",
    "B2B Key Account Manager",
  ],
  interviewPlatforms: ["Google Meet", "Microsoft Teams", "Zoom", "In-person", "Other"],
  questionCategories: DEFAULT_QUESTION_CATEGORIES,
  candidateQuestions: DEFAULT_CANDIDATE_QUESTIONS,
}

export interface HiringStorageData {
  candidates: Record<string, Candidate>
  settings: RecruitmentSettings
  emailLogs: EmailLog[]
}

// In-memory cache
let inMemoryData: HiringStorageData | null = null

function ensureStorageDir() {
  if (!fs.existsSync(DATA_DIR)) {
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true })
    } catch (err) {
      console.error("Failed to create data dir:", err)
    }
  }
}

function getInitialCandidates(): Record<string, Candidate> {
  const initial: Candidate[] = [
    {
      id: "TV-HR-2026-001",
      token: "tv-rec-vikram-9912a",
      fullName: "Vikram Sharma",
      email: "vikram.sharma.ev@gmail.com",
      phone: "+91 98201 44521",
      appliedPosition: "Senior EV Systems Engineer",
      department: "EV Engineering & Powertrain",
      status: "HIRED",
      invitation: {
        sentAt: "2026-10-10T10:30:00.000Z",
        sentBy: "HR Recruitment Cell",
        emailStatus: "OPENED",
      },
      documents: {
        photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
        photoFileName: "vikram_profile.jpg",
        resumeUrl: "#",
        resumeFileName: "Vikram_Sharma_EV_Resume.pdf",
      },
      personalInfo: {
        fullName: "Vikram Sharma",
        fatherName: "Rajendra Sharma",
        dob: "1994-06-15",
        gender: "Male",
        mobile: "+91 98201 44521",
        email: "vikram.sharma.ev@gmail.com",
        currentAddress: "Flat 402, Green Meadows, Powai",
        permanentAddress: "Flat 402, Green Meadows, Powai, Mumbai",
        city: "Mumbai",
        state: "Maharashtra",
        pincode: "400076",
        nationality: "Indian",
      },
      education: [
        {
          id: "edu-1",
          highestQual: "Post Graduation",
          degree: "M.Tech in Electric Vehicle Technology",
          specialization: "Battery Thermal Management",
          institution: "IIT Bombay",
          passingYear: "2018",
          score: "9.2 CGPA",
        },
      ],
      experience: {
        isExperienced: true,
        totalYears: "6.5 Years",
        records: [
          {
            id: "exp-1",
            company: "Mahindra Electric",
            designation: "Systems Engineer",
            duration: "2018 - 2024",
            responsibilities: "Managed BMS telemetry and motor controller integration.",
            currentCtc: "18 LPA",
            expectedCtc: "24 LPA",
            noticePeriod: "30 Days",
          },
        ],
      },
      jobSpecific: {
        positionApplied: "Senior EV Systems Engineer",
        department: "EV Engineering & Powertrain",
        preferredLocation: "Mumbai HQ",
        relevantSkills: "BMS, CAN Bus, Motor Controllers, Python, Matlab",
        technicalSkills: "High Voltage Architecture, Automotive Diagnostics",
        toolsKnowledge: "Vector CANoe, Altium Designer",
        whyTransvolt: "Transvolt is pioneering electric commercial transport at scale in India.",
        whyHireYou: "Over 6 years of hands-on EV powertrain validation experience.",
        relevantExperience: "Designed BMS algorithms for commercial transit buses.",
        comfortableWithDuties: true,
        willingToTravel: true,
      },
      additionalInfo: {
        languages: ["English", "Hindi", "Marathi"],
        englishProficiency: "Fluent",
        drivingLicence: "Yes (Four Wheeler)",
        linkedinUrl: "https://linkedin.com/in/vikramsharma-ev",
        emergencyContactName: "Rajendra Sharma (Father)",
        emergencyContactPhone: "+91 98201 99887",
      },
      interviewPreferences: {
        preferredDate: "2026-10-18",
        preferredTime: "11:00 AM",
        modePreference: "ONLINE",
      },
      interviewSchedule: {
        roundNumber: 2,
        roundName: "Technical & Leadership Round",
        date: "2026-10-20",
        startTime: "11:00 AM",
        endTime: "12:00 PM",
        mode: "ONLINE",
        platform: "Google Meet",
        meetingUrl: "https://meet.google.com/tv-vikram-tech",
        contactPerson: "Faheem S. (HR Lead)",
        contactPhone: "+91 98200 12345",
        instructions: "Please be ready to share past BMS architecture diagrams.",
        scheduledAt: "2026-10-16T14:00:00.000Z",
        scheduledBy: "HR Lead",
      },
      evaluations: [
        {
          id: "eval-1",
          roundName: "Technical & Leadership Round",
          evaluatedBy: "Chief Technology Officer",
          evaluatedAt: "2026-10-20T12:30:00.000Z",
          technicalRating: 5,
          communicationRating: 4,
          experienceRating: 5,
          problemSolvingRating: 5,
          confidenceRating: 4,
          overallRating: 5,
          strengths: "Exceptional mastery over EV powertrain telematics and battery safety protocols.",
          improvements: "None of significance; great fit for Transvolt architecture.",
          interviewerRemarks: "Strong hire recommendation. Fits our culture and technical bar.",
          recommendation: "HIRE",
        },
      ],
      decision: {
        status: "HIRED",
        decisionDate: "2026-10-24T16:00:00.000Z",
        decidedBy: "Managing Director & HR",
        joiningDate: "2026-11-15",
        offeredDesignation: "Lead EV Systems Architect",
        offeredDepartment: "EV Engineering & Powertrain",
        joiningInstructions: "Report to Powai HQ at 9:30 AM on 15 Nov with original certificates and ID proofs.",
      },
      internalNotes: [
        {
          id: "note-1",
          author: "Faheem S.",
          createdAt: "2026-10-24T16:30:00.000Z",
          note: "Offer letter issued and accepted. Joining confirmed for Nov 15th.",
        },
      ],
      timeline: [
        { id: "tl-1", type: "INVITED", description: "Application invitation sent", timestamp: "2026-10-10T10:30:00.000Z", actor: "HR" },
        { id: "tl-2", type: "SUBMITTED", description: "Candidate submitted completed application", timestamp: "2026-10-14T18:15:00.000Z", actor: "Candidate" },
        { id: "tl-3", type: "INTERVIEW_SCHEDULED", description: "Technical round scheduled on Google Meet", timestamp: "2026-10-16T14:00:00.000Z", actor: "HR" },
        { id: "tl-4", type: "EVALUATED", description: "Evaluation completed: 5/5 Stars", timestamp: "2026-10-20T12:30:00.000Z", actor: "CTO" },
        { id: "tl-5", type: "HIRED", description: "Offered Lead EV Systems Architect position", timestamp: "2026-10-24T16:00:00.000Z", actor: "HR" },
      ],
      createdAt: "2026-10-10T10:30:00.000Z",
      updatedAt: "2026-10-24T16:00:00.000Z",
    },
    {
      id: "TV-HR-2026-002",
      token: "tv-rec-ananya-4821b",
      fullName: "Ananya Deshmukh",
      email: "ananya.ux@transvolt-candidate.in",
      phone: "+91 97654 32190",
      appliedPosition: "Lead UI/UX Designer",
      department: "Design & Branding",
      status: "UNDER_REVIEW",
      invitation: {
        sentAt: "2026-10-25T11:00:00.000Z",
        sentBy: "Faheem S.",
        emailStatus: "OPENED",
      },
      documents: {
        photoUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80",
        photoFileName: "ananya_headshot.jpg",
        resumeUrl: "#",
        resumeFileName: "Ananya_Deshmukh_Design_Portfolio.pdf",
      },
      personalInfo: {
        fullName: "Ananya Deshmukh",
        fatherName: "Prakash Deshmukh",
        dob: "1997-03-22",
        gender: "Female",
        mobile: "+91 97654 32190",
        email: "ananya.ux@transvolt-candidate.in",
        currentAddress: "12, Palm Grove, Andheri West",
        permanentAddress: "12, Palm Grove, Andheri West, Mumbai",
        city: "Mumbai",
        state: "Maharashtra",
        pincode: "400053",
        nationality: "Indian",
      },
      education: [
        {
          id: "edu-2",
          highestQual: "Graduation",
          degree: "B.Des in Interaction Design",
          specialization: "User Experience & Digital Products",
          institution: "National Institute of Design (NID)",
          passingYear: "2019",
          score: "8.9 CGPA",
        },
      ],
      experience: {
        isExperienced: true,
        totalYears: "5 Years",
        records: [
          {
            id: "exp-2",
            company: "Ather Energy",
            designation: "Senior Product Designer",
            duration: "2021 - 2026",
            responsibilities: "Designed instrument cluster UI, dashboard telemetry and mobile app charging flows.",
            currentCtc: "16 LPA",
            expectedCtc: "21 LPA",
            noticePeriod: "45 Days",
          },
        ],
      },
      jobSpecific: {
        positionApplied: "Lead UI/UX Designer",
        department: "Design & Branding",
        preferredLocation: "Mumbai HQ",
        relevantSkills: "Figma, Design Systems, HMI Dashboard UI, Design Tokens",
        technicalSkills: "Prototyping, Usability Testing, Information Architecture",
        toolsKnowledge: "Figma, Principle, Adobe CC, Tailwind CSS",
        whyTransvolt: "Transvolt's branding portal and vehicle telematics are setting new design standards.",
        whyHireYou: "Proven track record in EV cluster UI and scalable corporate design systems.",
        relevantExperience: "Shipped 3 production instrument cluster interfaces for commercial electric trucks.",
        comfortableWithDuties: true,
        willingToTravel: false,
      },
      additionalInfo: {
        languages: ["English", "Hindi", "Marathi"],
        englishProficiency: "Fluent",
        drivingLicence: "Yes",
        portfolioUrl: "https://ananya-ux.design",
        emergencyContactName: "Prakash Deshmukh",
        emergencyContactPhone: "+91 98200 44321",
      },
      interviewPreferences: {
        preferredDate: "2026-11-03",
        preferredTime: "02:30 PM",
        modePreference: "ONLINE",
        notes: "Available weekday afternoons.",
      },
      submission: {
        submittedAt: "2026-10-28T15:20:00.000Z",
        declarationAccepted: true,
      },
      internalNotes: [
        {
          id: "note-2",
          author: "Faheem S.",
          createdAt: "2026-10-29T10:00:00.000Z",
          note: "Portfolio is top-tier. Great grasp of automotive aesthetics and clean design systems. Schedule round 1.",
        },
      ],
      timeline: [
        { id: "tl-201", type: "INVITED", description: "Application invitation sent", timestamp: "2026-10-25T11:00:00.000Z", actor: "HR" },
        { id: "tl-202", type: "SUBMITTED", description: "Candidate submitted completed application & portfolio", timestamp: "2026-10-28T15:20:00.000Z", actor: "Candidate" },
      ],
      createdAt: "2026-10-25T11:00:00.000Z",
      updatedAt: "2026-10-29T10:00:00.000Z",
    },
    {
      id: "TV-HR-2026-003",
      token: "tv-rec-rohan-5531c",
      fullName: "Rohan Patel",
      email: "rohan.patel.fleet@gmail.com",
      phone: "+91 99300 87654",
      appliedPosition: "Fleet Operations Manager",
      department: "Fleet Operations",
      status: "INTERVIEW_SCHEDULED",
      invitation: {
        sentAt: "2026-10-22T09:00:00.000Z",
        sentBy: "HR Cell",
        emailStatus: "OPENED",
      },
      documents: {
        photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
        photoFileName: "rohan_photo.jpg",
        resumeUrl: "#",
        resumeFileName: "Rohan_Patel_Fleet_Manager.pdf",
      },
      personalInfo: {
        fullName: "Rohan Patel",
        fatherName: "Kishore Patel",
        dob: "1992-11-04",
        gender: "Male",
        mobile: "+91 99300 87654",
        email: "rohan.patel.fleet@gmail.com",
        currentAddress: "C-201, Green Heights, Thane West",
        permanentAddress: "C-201, Green Heights, Thane West, Maharashtra",
        city: "Thane",
        state: "Maharashtra",
        pincode: "400601",
        nationality: "Indian",
      },
      education: [
        {
          id: "edu-3",
          highestQual: "Graduation",
          degree: "B.E. in Mechanical Engineering",
          specialization: "Automotive Maintenance",
          institution: "VJTI Mumbai",
          passingYear: "2014",
          score: "78%",
        },
      ],
      experience: {
        isExperienced: true,
        totalYears: "8 Years",
        records: [
          {
            id: "exp-3",
            company: "BluSmart Mobility",
            designation: "Assistant Fleet Manager",
            duration: "2020 - 2026",
            responsibilities: "Managed 450+ EV hubs, depot turnaround times, and driver scheduling.",
            currentCtc: "14 LPA",
            expectedCtc: "18 LPA",
            noticePeriod: "15 Days",
          },
        ],
      },
      jobSpecific: {
        positionApplied: "Fleet Operations Manager",
        department: "Fleet Operations",
        preferredLocation: "Navi Mumbai Hub",
        relevantSkills: "Fleet Telematics, Charger Depot Management, Route Optimization",
        technicalSkills: "EV Maintenance, Driver SLA, Vendor Management",
        toolsKnowledge: "Fleetx, Samsara, Excel Advanced",
        whyTransvolt: "Transvolt's expanding fleet network is the premier commercial EV opportunity.",
        whyHireYou: "Over 8 years managing commercial vehicle operations with 99.4% depot uptime.",
        relevantExperience: "Operated 450 EV commercial vans with turnaround time under 18 minutes.",
        comfortableWithDuties: true,
        willingToTravel: true,
      },
      additionalInfo: {
        languages: ["English", "Hindi", "Gujarati", "Marathi"],
        englishProficiency: "Professional",
        drivingLicence: "Yes (Commercial & Heavy)",
        emergencyContactName: "Kishore Patel",
        emergencyContactPhone: "+91 99300 11223",
      },
      interviewPreferences: {
        preferredDate: "2026-11-02",
        preferredTime: "11:30 AM",
        modePreference: "IN_PERSON",
      },
      interviewSchedule: {
        roundNumber: 1,
        roundName: "Hub Operations In-Person Assessment",
        date: "2026-11-02",
        startTime: "11:30 AM",
        endTime: "12:45 PM",
        mode: "IN_PERSON",
        platform: "In-person",
        officeAddress: "Transvolt Mobility HQ, 4th Floor, Powai Tech Park, Mumbai",
        contactPerson: "Faheem S. (HR Lead)",
        contactPhone: "+91 98200 12345",
        instructions: "Please report to Reception desk 15 minutes prior. Bring hard copy of resume.",
        scheduledAt: "2026-10-29T11:00:00.000Z",
        scheduledBy: "HR Cell",
      },
      timeline: [
        { id: "tl-301", type: "INVITED", description: "Application invitation sent", timestamp: "2026-10-22T09:00:00.000Z", actor: "HR" },
        { id: "tl-302", type: "SUBMITTED", description: "Application submitted", timestamp: "2026-10-26T14:30:00.000Z", actor: "Candidate" },
        { id: "tl-303", type: "APPROVED", description: "HR approved application for Round 1 interview", timestamp: "2026-10-29T11:00:00.000Z", actor: "HR" },
      ],
      createdAt: "2026-10-22T09:00:00.000Z",
      updatedAt: "2026-10-29T11:00:00.000Z",
    },
    {
      id: "TV-HR-2026-004",
      token: "tv-rec-neha-7721d",
      fullName: "Neha Verma",
      email: "neha.verma.battery@gmail.com",
      phone: "+91 98112 34567",
      appliedPosition: "Battery Safety Specialist",
      department: "Battery Technology",
      status: "APPLICATION_PENDING",
      invitation: {
        sentAt: "2026-10-29T14:00:00.000Z",
        sentBy: "HR Cell",
        deadline: "2026-11-05",
        emailStatus: "DELIVERED",
        customMessage: "Dear Neha, your profile in battery safety research at ARAI caught our eye. Please complete the application.",
      },
      timeline: [
        { id: "tl-401", type: "INVITED", description: "Invitation link generated and dispatched to neha.verma.battery@gmail.com", timestamp: "2026-10-29T14:00:00.000Z", actor: "HR" },
      ],
      createdAt: "2026-10-29T14:00:00.000Z",
      updatedAt: "2026-10-29T14:00:00.000Z",
    },
    {
      id: "TV-HR-2026-005",
      token: "tv-rec-aditya-3319e",
      fullName: "Aditya Kulkarni",
      email: "aditya.kulkarni@yahoo.com",
      phone: "+91 98220 99881",
      appliedPosition: "Branding & Marketing Specialist",
      department: "Design & Branding",
      status: "NOT_SELECTED",
      invitation: {
        sentAt: "2026-10-15T12:00:00.000Z",
        sentBy: "HR Cell",
        emailStatus: "OPENED",
      },
      documents: {
        photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80",
        photoFileName: "aditya.jpg",
        resumeUrl: "#",
        resumeFileName: "Aditya_Kulkarni_CV.pdf",
      },
      personalInfo: {
        fullName: "Aditya Kulkarni",
        fatherName: "Sharad Kulkarni",
        dob: "1998-08-10",
        gender: "Male",
        mobile: "+91 98220 99881",
        email: "aditya.kulkarni@yahoo.com",
        currentAddress: "Pune",
        permanentAddress: "Pune, Maharashtra",
        city: "Pune",
        state: "Maharashtra",
        pincode: "411038",
        nationality: "Indian",
      },
      education: [
        {
          id: "edu-5",
          highestQual: "Graduation",
          degree: "BBA in Marketing",
          specialization: "Digital Marketing",
          institution: "Pune University",
          passingYear: "2020",
          score: "68%",
        },
      ],
      experience: {
        isExperienced: true,
        totalYears: "2.5 Years",
        records: [
          {
            id: "exp-5",
            company: "Local Ad Agency",
            designation: "Marketing Executive",
            duration: "2022 - 2024",
            responsibilities: "Social media ad management.",
          },
        ],
      },
      decision: {
        status: "NOT_SELECTED",
        decisionDate: "2026-10-22T17:00:00.000Z",
        decidedBy: "Branding Head",
        rejectionReason: "Experience does not match commercial automotive B2B branding requirements.",
        feedbackMessage: "Candidate has primarily FMCG social media experience; Transvolt requires commercial fleet EV brand positioning expertise.",
      },
      timeline: [
        { id: "tl-501", type: "INVITED", description: "Application invitation sent", timestamp: "2026-10-15T12:00:00.000Z", actor: "HR" },
        { id: "tl-502", type: "SUBMITTED", description: "Application submitted", timestamp: "2026-10-18T16:00:00.000Z", actor: "Candidate" },
        { id: "tl-503", type: "NOT_SELECTED", description: "HR closed application as not selected", timestamp: "2026-10-22T17:00:00.000Z", actor: "HR" },
      ],
      createdAt: "2026-10-15T12:00:00.000Z",
      updatedAt: "2026-10-22T17:00:00.000Z",
    },
  ]

  const records: Record<string, Candidate> = {}
  initial.forEach((c) => {
    records[c.id] = c
  })
  return records
}

function loadStorage(): HiringStorageData {
  if (inMemoryData) return inMemoryData

  ensureStorageDir()
  if (fs.existsSync(HIRING_FILE)) {
    try {
      const content = fs.readFileSync(HIRING_FILE, "utf-8")
      const parsed = JSON.parse(content)
      const hasAdvanceCategories = parsed.settings?.questionCategories?.some((c: any) => c.id === "cat-personal")

      inMemoryData = {
        candidates: parsed.candidates || {},
        settings: {
          ...DEFAULT_SETTINGS,
          ...(parsed.settings || {}),
          questionCategories:
            hasAdvanceCategories && parsed.settings?.questionCategories?.length > 0
              ? parsed.settings.questionCategories
              : DEFAULT_QUESTION_CATEGORIES,
          candidateQuestions:
            hasAdvanceCategories && parsed.settings?.candidateQuestions?.length > 0
              ? parsed.settings.candidateQuestions
              : DEFAULT_CANDIDATE_QUESTIONS,
        },
        emailLogs: parsed.emailLogs || [],
      }
      return inMemoryData
    } catch (e) {
      console.error("Failed to parse hiring.json, initializing defaults:", e)
    }
  }

  inMemoryData = {
    candidates: getInitialCandidates(),
    settings: DEFAULT_SETTINGS,
    emailLogs: [
      {
        id: "em-1",
        candidateId: "TV-HR-2026-004",
        candidateName: "Neha Verma",
        recipientEmail: "neha.verma.battery@gmail.com",
        subject: "Transvolt Mobility — Application Invitation for Battery Safety Specialist",
        type: "INVITATION",
        sentAt: "2026-10-29T14:00:00.000Z",
        status: "DELIVERED",
        applicationUrl: "/apply/tv-rec-neha-7721d",
      },
    ],
  }
  saveStorage(inMemoryData)
  return inMemoryData
}

function saveStorage(data: HiringStorageData) {
  inMemoryData = data
  try {
    ensureStorageDir()
    fs.writeFileSync(HIRING_FILE, JSON.stringify(data, null, 2), "utf-8")
  } catch (err) {
    console.error("Failed to write hiring.json to disk:", err)
  }
}

// ---------------- Public Store Operations ---------------- //

export function getAllCandidates(): Candidate[] {
  const data = loadStorage()
  return Object.values(data.candidates).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
}

export function getCandidateById(id: string): Candidate | null {
  const data = loadStorage()
  return data.candidates[id] || null
}

export function getCandidateByToken(token: string): Candidate | null {
  const data = loadStorage()
  const found = Object.values(data.candidates).find((c) => c.token === token)
  return found || null
}

export function createInvitation(params: {
  fullName: string
  email: string
  appliedPosition: string
  department: string
  deadlineDays?: number
  customMessage?: string
  sentBy?: string
}): { candidate: Candidate; applicationUrl: string } {
  const data = loadStorage()
  const count = Object.keys(data.candidates).length + 1
  const id = `TV-HR-2026-${String(count).padStart(3, "0")}`
  
  // Secure random token
  const token = `tv-app-${Math.random().toString(36).substring(2, 10)}${Date.now().toString(36).substring(4)}`
  const now = new Date().toISOString()
  
  const deadlineDate = new Date()
  deadlineDate.setDate(deadlineDate.getDate() + (params.deadlineDays || data.settings.defaultDeadlineDays || 7))
  const deadline = deadlineDate.toISOString().split("T")[0]

  const newCandidate: Candidate = {
    id,
    token,
    fullName: params.fullName.trim(),
    email: params.email.trim().toLowerCase(),
    appliedPosition: params.appliedPosition,
    department: params.department,
    status: "APPLICATION_PENDING",
    invitation: {
      sentAt: now,
      sentBy: params.sentBy || data.settings.hrContactPerson,
      deadline,
      emailStatus: "SENT",
      customMessage: params.customMessage,
    },
    timeline: [
      {
        id: `tl-${Date.now()}`,
        type: "INVITED",
        description: `Invitation sent to ${params.email} for position ${params.appliedPosition}`,
        timestamp: now,
        actor: params.sentBy || "HR Recruitment",
      },
    ],
    createdAt: now,
    updatedAt: now,
  }

  data.candidates[id] = newCandidate

  // Log email
  const emailLog: EmailLog = {
    id: `em-${Date.now()}`,
    candidateId: id,
    candidateName: newCandidate.fullName,
    recipientEmail: newCandidate.email,
    subject: `Transvolt Mobility — Invitation to Apply for ${newCandidate.appliedPosition}`,
    type: "INVITATION",
    sentAt: now,
    status: "DELIVERED",
    applicationUrl: `/apply/${token}`,
  }
  data.emailLogs.unshift(emailLog)

  saveStorage(data)
  return { candidate: newCandidate, applicationUrl: `/apply/${token}` }
}

export function submitCandidateApplication(
  token: string,
  formData: {
    documents?: Candidate["documents"]
    personalInfo?: Candidate["personalInfo"]
    education?: Candidate["education"]
    experience?: Candidate["experience"]
    jobSpecific?: Candidate["jobSpecific"]
    customAnswers?: Record<string, any>
    additionalInfo?: Candidate["additionalInfo"]
    interviewPreferences?: Candidate["interviewPreferences"]
    advanceForm?: Candidate["advanceForm"]
  }
): Candidate | null {
  const data = loadStorage()
  const candidate = Object.values(data.candidates).find((c) => c.token === token)
  if (!candidate) return null

  const now = new Date().toISOString()

  if (formData.advanceForm) {
    const adv = formData.advanceForm
    candidate.advanceForm = adv
    candidate.fullName = adv.fullName || candidate.fullName
    candidate.phone = adv.contactNumber || candidate.phone
    candidate.email = adv.personalEmail || candidate.email

    candidate.personalInfo = {
      fullName: adv.fullName,
      fatherName: adv.fatherName,
      dob: adv.dob,
      gender: adv.gender,
      mobile: adv.contactNumber,
      altMobile: adv.emergencyContactNumber,
      email: adv.personalEmail,
      currentAddress: adv.currentAddress,
      permanentAddress: adv.permanentAddress,
      city: adv.placeOfBirth || "Mumbai",
      state: "Maharashtra",
      pincode: "",
      nationality: "Indian",
    }

    candidate.documents = {
      photoUrl: adv.photoUrl,
      photoFileName: adv.photoFileName,
      resumeUrl: adv.resumeUrl,
      resumeFileName: adv.resumeFileName,
      additionalDocs: [
        ...(adv.aadharDocUrl ? [{ name: `Aadhaar: ${adv.aadharNumber || ""}`, url: adv.aadharDocUrl, size: "Document", uploadedAt: now }] : []),
        ...(adv.panDocUrl ? [{ name: `PAN: ${adv.panNumber || ""}`, url: adv.panDocUrl, size: "Document", uploadedAt: now }] : []),
        ...(adv.passportDocUrl ? [{ name: `Passport: ${adv.passportNumber || ""}`, url: adv.passportDocUrl, size: "Document", uploadedAt: now }] : []),
        ...(adv.drivingLicenseDocUrl ? [{ name: `DL: ${adv.drivingLicenseNumber || ""}`, url: adv.drivingLicenseDocUrl, size: "Document", uploadedAt: now }] : []),
        ...(adv.bankDetails?.chequePhotoUrl ? [{ name: "Cancelled Cheque", url: adv.bankDetails.chequePhotoUrl, size: "Document", uploadedAt: now }] : []),
        ...(adv.signatureUrl ? [{ name: "Signature", url: adv.signatureUrl, size: "Signature", uploadedAt: now }] : []),
        ...(adv.relievingLetterUrl ? [{ name: "Relieving Letter", url: adv.relievingLetterUrl, size: "Document", uploadedAt: now }] : []),
      ],
    }

    if (adv.educationDetails && adv.educationDetails.length > 0) {
      candidate.education = adv.educationDetails.map((edu) => ({
        id: edu.id,
        highestQual: edu.level,
        degree: `${edu.level} — ${edu.specialization || "General"}`,
        specialization: edu.specialization,
        institution: edu.institute,
        passingYear: edu.passingYear,
        score: edu.percentage ? `${edu.percentage}% (${edu.grade || "Passed"})` : edu.grade || "",
      }))
    }

    if (adv.pastExperience && adv.pastExperience.length > 0) {
      candidate.experience = {
        isExperienced: true,
        totalYears: `${adv.pastExperience.length} Companies`,
        records: adv.pastExperience.map((exp) => ({
          id: exp.id,
          company: exp.organizationName,
          designation: exp.designation,
          duration: `${exp.dateOfJoining} to ${exp.lastWorkingDate || "Present"} (${exp.tenure})`,
          responsibilities: `Department: ${exp.department || "—"} | Reporting to: ${exp.reportingSupervisor || "—"}`,
        })),
      }
    }
  }

  if (formData.documents) candidate.documents = { ...candidate.documents, ...formData.documents }
  if (formData.personalInfo) candidate.personalInfo = { ...candidate.personalInfo, ...formData.personalInfo }
  if (formData.education) candidate.education = formData.education
  if (formData.experience) candidate.experience = formData.experience
  if (formData.jobSpecific) candidate.jobSpecific = formData.jobSpecific
  if (formData.customAnswers) candidate.customAnswers = formData.customAnswers
  if (formData.additionalInfo) candidate.additionalInfo = formData.additionalInfo
  if (formData.interviewPreferences) candidate.interviewPreferences = formData.interviewPreferences

  candidate.submission = {
    submittedAt: now,
    declarationAccepted: true,
  }
  candidate.status = "UNDER_REVIEW"
  candidate.phone = candidate.personalInfo?.mobile || candidate.phone
  candidate.updatedAt = now

  candidate.timeline = candidate.timeline || []
  candidate.timeline.unshift({
    id: `tl-${Date.now()}`,
    type: "SUBMITTED",
    description: "Application and supporting documents submitted by candidate",
    timestamp: now,
    actor: candidate.fullName,
  })

  // Email confirmation log
  data.emailLogs.unshift({
    id: `em-${Date.now()}`,
    candidateId: candidate.id,
    candidateName: candidate.fullName,
    recipientEmail: candidate.email,
    subject: `Transvolt Application Received — ID: ${candidate.id}`,
    type: "SUBMISSION_CONFIRMATION",
    sentAt: now,
    status: "DELIVERED",
    applicationUrl: `/apply/${token}`,
  })

  saveStorage(data)
  return candidate
}

export function approveAndScheduleInterview(
  id: string,
  schedule: {
    roundNumber?: number
    roundName?: string
    date: string
    startTime: string
    endTime: string
    mode: "ONLINE" | "IN_PERSON"
    platform: any
    meetingUrl?: string
    officeAddress?: string
    contactPerson?: string
    contactPhone?: string
    instructions?: string
    internalRemarks?: string
    actor?: string
  }
): Candidate | null {
  const data = loadStorage()
  const candidate = data.candidates[id]
  if (!candidate) return null

  const now = new Date().toISOString()
  const scheduleRecord: InterviewSchedule = {
    roundNumber: schedule.roundNumber || 1,
    roundName: schedule.roundName || "Round 1 Interview",
    date: schedule.date,
    startTime: schedule.startTime,
    endTime: schedule.endTime,
    mode: schedule.mode,
    platform: schedule.platform,
    meetingUrl: schedule.meetingUrl,
    officeAddress: schedule.officeAddress || data.settings.officeAddress,
    contactPerson: schedule.contactPerson || data.settings.hrContactPerson,
    contactPhone: schedule.contactPhone || data.settings.hrContactPhone,
    instructions: schedule.instructions,
    internalRemarks: schedule.internalRemarks,
    scheduledAt: now,
    scheduledBy: schedule.actor || "HR Recruitment",
  }

  candidate.interviewSchedule = scheduleRecord
  candidate.status = "INTERVIEW_SCHEDULED"
  candidate.updatedAt = now

  candidate.timeline = candidate.timeline || []
  candidate.timeline.unshift({
    id: `tl-${Date.now()}`,
    type: "INTERVIEW_SCHEDULED",
    description: `Interview scheduled on ${schedule.date} at ${schedule.startTime} (${schedule.mode})`,
    timestamp: now,
    actor: schedule.actor || "HR",
  })

  // Log email
  data.emailLogs.unshift({
    id: `em-${Date.now()}`,
    candidateId: candidate.id,
    candidateName: candidate.fullName,
    recipientEmail: candidate.email,
    subject: `Interview Confirmed with Transvolt Mobility — ${schedule.date} at ${schedule.startTime}`,
    type: "INTERVIEW_SCHEDULED",
    sentAt: now,
    status: "DELIVERED",
    applicationUrl: `/apply/${candidate.token}`,
  })

  saveStorage(data)
  return candidate
}

export function rescheduleInterview(
  id: string,
  rescheduleData: {
    date: string
    startTime: string
    endTime: string
    mode: "ONLINE" | "IN_PERSON"
    platform: any
    meetingUrl?: string
    officeAddress?: string
    instructions?: string
    rescheduleReason: string
    actor?: string
  }
): Candidate | null {
  const data = loadStorage()
  const candidate = data.candidates[id]
  if (!candidate || !candidate.interviewSchedule) return null

  const now = new Date().toISOString()
  const oldSchedule = candidate.interviewSchedule

  const previousEntry = {
    date: oldSchedule.date,
    startTime: oldSchedule.startTime,
    endTime: oldSchedule.endTime,
    mode: oldSchedule.mode,
    platform: oldSchedule.platform,
    rescheduledAt: now,
    rescheduledBy: rescheduleData.actor || "HR",
    rescheduleReason: rescheduleData.rescheduleReason,
    meetingUrl: oldSchedule.meetingUrl,
    officeAddress: oldSchedule.officeAddress,
  }

  const updatedPrevious = [
    ...(oldSchedule.previousSchedules || []),
    previousEntry,
  ]

  candidate.interviewSchedule = {
    ...oldSchedule,
    date: rescheduleData.date,
    startTime: rescheduleData.startTime,
    endTime: rescheduleData.endTime,
    mode: rescheduleData.mode,
    platform: rescheduleData.platform,
    meetingUrl: rescheduleData.meetingUrl || oldSchedule.meetingUrl,
    officeAddress: rescheduleData.officeAddress || oldSchedule.officeAddress,
    instructions: rescheduleData.instructions || oldSchedule.instructions,
    previousSchedules: updatedPrevious,
  }

  candidate.status = "INTERVIEW_RESCHEDULED"
  candidate.updatedAt = now

  candidate.timeline = candidate.timeline || []
  candidate.timeline.unshift({
    id: `tl-${Date.now()}`,
    type: "INTERVIEW_RESCHEDULED",
    description: `Interview rescheduled to ${rescheduleData.date} at ${rescheduleData.startTime}. Reason: ${rescheduleData.rescheduleReason}`,
    timestamp: now,
    actor: rescheduleData.actor || "HR",
  })

  // Email log
  data.emailLogs.unshift({
    id: `em-${Date.now()}`,
    candidateId: candidate.id,
    candidateName: candidate.fullName,
    recipientEmail: candidate.email,
    subject: `Updated Interview Schedule — Transvolt Mobility (${rescheduleData.date})`,
    type: "INTERVIEW_RESCHEDULED",
    sentAt: now,
    status: "DELIVERED",
    applicationUrl: `/apply/${candidate.token}`,
  })

  saveStorage(data)
  return candidate
}

export function recordInterviewEvaluation(
  id: string,
  evaluation: {
    roundName: string
    evaluatedBy: string
    technicalRating: number
    communicationRating: number
    experienceRating: number
    problemSolvingRating: number
    confidenceRating: number
    overallRating: number
    strengths: string
    improvements: string
    interviewerRemarks: string
    recommendation: "NEXT_ROUND" | "ANOTHER_INTERVIEW" | "HOLD" | "HIRE" | "REJECT"
  }
): Candidate | null {
  const data = loadStorage()
  const candidate = data.candidates[id]
  if (!candidate) return null

  const now = new Date().toISOString()
  const evalItem: InterviewEvaluation = {
    id: `eval-${Date.now()}`,
    roundName: evaluation.roundName,
    evaluatedBy: evaluation.evaluatedBy,
    evaluatedAt: now,
    technicalRating: evaluation.technicalRating,
    communicationRating: evaluation.communicationRating,
    experienceRating: evaluation.experienceRating,
    problemSolvingRating: evaluation.problemSolvingRating,
    confidenceRating: evaluation.confidenceRating,
    overallRating: evaluation.overallRating,
    strengths: evaluation.strengths,
    improvements: evaluation.improvements,
    interviewerRemarks: evaluation.interviewerRemarks,
    recommendation: evaluation.recommendation,
  }

  candidate.evaluations = candidate.evaluations || []
  candidate.evaluations.push(evalItem)
  candidate.status = "INTERVIEW_COMPLETED"
  candidate.updatedAt = now

  candidate.timeline = candidate.timeline || []
  candidate.timeline.unshift({
    id: `tl-${Date.now()}`,
    type: "EVALUATED",
    description: `Evaluation recorded for ${evaluation.roundName} with rating ${evaluation.overallRating}/5. Recommendation: ${evaluation.recommendation}`,
    timestamp: now,
    actor: evaluation.evaluatedBy,
  })

  saveStorage(data)
  return candidate
}

export function markCandidateHired(
  id: string,
  hiringDetails: {
    joiningDate: string
    offeredDesignation: string
    offeredDepartment: string
    joiningInstructions: string
    decidedBy?: string
  }
): Candidate | null {
  const data = loadStorage()
  const candidate = data.candidates[id]
  if (!candidate) return null

  const now = new Date().toISOString()
  candidate.status = "HIRED"
  candidate.decision = {
    status: "HIRED",
    decisionDate: now,
    decidedBy: hiringDetails.decidedBy || "HR Leadership",
    joiningDate: hiringDetails.joiningDate,
    offeredDesignation: hiringDetails.offeredDesignation,
    offeredDepartment: hiringDetails.offeredDepartment,
    joiningInstructions: hiringDetails.joiningInstructions,
  }
  candidate.updatedAt = now

  candidate.timeline = candidate.timeline || []
  candidate.timeline.unshift({
    id: `tl-${Date.now()}`,
    type: "HIRED",
    description: `Candidate marked HIRED as ${hiringDetails.offeredDesignation}. Joining date: ${hiringDetails.joiningDate}`,
    timestamp: now,
    actor: hiringDetails.decidedBy || "HR Leadership",
  })

  // Email log
  data.emailLogs.unshift({
    id: `em-${Date.now()}`,
    candidateId: candidate.id,
    candidateName: candidate.fullName,
    recipientEmail: candidate.email,
    subject: `Congratulations! Offer from Transvolt Mobility Pvt. Ltd.`,
    type: "HIRED",
    sentAt: now,
    status: "DELIVERED",
    applicationUrl: `/apply/${candidate.token}`,
  })

  saveStorage(data)
  return candidate
}

export function markCandidateRejected(
  id: string,
  rejection: {
    rejectionReason: string
    feedbackMessage?: string
    decidedBy?: string
  }
): Candidate | null {
  const data = loadStorage()
  const candidate = data.candidates[id]
  if (!candidate) return null

  const now = new Date().toISOString()
  candidate.status = "NOT_SELECTED"
  candidate.decision = {
    status: "NOT_SELECTED",
    decisionDate: now,
    decidedBy: rejection.decidedBy || "HR Recruitment",
    rejectionReason: rejection.rejectionReason,
    feedbackMessage: rejection.feedbackMessage,
  }
  candidate.updatedAt = now

  candidate.timeline = candidate.timeline || []
  candidate.timeline.unshift({
    id: `tl-${Date.now()}`,
    type: "NOT_SELECTED",
    description: `Application marked Not Selected. Reason: ${rejection.rejectionReason}`,
    timestamp: now,
    actor: rejection.decidedBy || "HR",
  })

  // Email log
  data.emailLogs.unshift({
    id: `em-${Date.now()}`,
    candidateId: candidate.id,
    candidateName: candidate.fullName,
    recipientEmail: candidate.email,
    subject: `Update regarding your Transvolt application — ${candidate.appliedPosition}`,
    type: "NOT_SELECTED",
    sentAt: now,
    status: "DELIVERED",
    applicationUrl: `/apply/${candidate.token}`,
  })

  saveStorage(data)
  return candidate
}

export function requestAdditionalInformation(
  id: string,
  params: {
    remarks: string
    requestedBy?: string
  }
): Candidate | null {
  const data = loadStorage()
  const candidate = data.candidates[id]
  if (!candidate) return null

  const now = new Date().toISOString()
  candidate.status = "CHANGES_REQUESTED"
  candidate.changeRequest = {
    requestedAt: now,
    requestedBy: params.requestedBy || "HR Recruitment",
    remarks: params.remarks,
  }
  candidate.updatedAt = now

  candidate.timeline = candidate.timeline || []
  candidate.timeline.unshift({
    id: `tl-${Date.now()}`,
    type: "CHANGES_REQUESTED",
    description: `HR requested additional details: ${params.remarks}`,
    timestamp: now,
    actor: params.requestedBy || "HR",
  })

  // Email log
  data.emailLogs.unshift({
    id: `em-${Date.now()}`,
    candidateId: candidate.id,
    candidateName: candidate.fullName,
    recipientEmail: candidate.email,
    subject: `Additional information requested — Transvolt Application ${candidate.id}`,
    type: "CHANGES_REQUESTED",
    sentAt: now,
    status: "DELIVERED",
    applicationUrl: `/apply/${candidate.token}`,
  })

  saveStorage(data)
  return candidate
}

export function addInternalNote(
  id: string,
  note: { author: string; note: string }
): Candidate | null {
  const data = loadStorage()
  const candidate = data.candidates[id]
  if (!candidate) return null

  const now = new Date().toISOString()
  candidate.internalNotes = candidate.internalNotes || []
  candidate.internalNotes.unshift({
    id: `note-${Date.now()}`,
    author: note.author,
    createdAt: now,
    note: note.note,
  })
  candidate.updatedAt = now

  saveStorage(data)
  return candidate
}

export function getRecruitmentSettings(): RecruitmentSettings {
  const data = loadStorage()
  return data.settings
}

export function updateRecruitmentSettings(
  updated: Partial<RecruitmentSettings>
): RecruitmentSettings {
  const data = loadStorage()
  data.settings = { ...data.settings, ...updated }
  saveStorage(data)
  return data.settings
}

export function getEmailLogs(): EmailLog[] {
  const data = loadStorage()
  return data.emailLogs
}

