// === Shared TypeScript Interfaces for ResumeAI Pro ===

export interface Organization {
  id: number
  name: string
  subdomain: string
  plan: "free" | "pro" | "enterprise"
  monthly_analysis_limit: number
  analyses_used_this_month: number
  subscription_status: string
  plan_limits: PlanLimits
  usage: UsageSummary
  settings: Record<string, unknown>
}

export interface PlanLimits {
  analyses: number
  resumes: number
  jds: number
  members: number
}

export interface UsageSummary {
  resumes: { used: number; limit: number }
  job_descriptions: { used: number; limit: number }
  members: { used: number; limit: number }
  analyses: { used: number; limit: number }
}

export interface User {
  id: number
  organization_id: number
  email_address: string
  first_name: string
  last_name: string
  role: "candidate" | "recruiter" | "admin"
  avatar_url: string | null
  preferences: Record<string, unknown>
}

export interface Resume {
  id: number
  organization_id: number
  user_id: number
  filename: string
  content_type: string
  raw_text: string | null
  parsed_data: ParsedResumeData
  status: "pending" | "parsing" | "parsed" | "extracting" | "ready" | "error"
  error_message: string | null
  created_at: string
  updated_at: string
}

export interface ParsedResumeData {
  contact?: {
    name: string
    email: string
    phone?: string
    location?: string
    linkedin?: string | null
    github?: string | null
    portfolio?: string | null
  }
  summary?: string
  skills?: {
    technical: string[]
    soft: string[]
    tools: string[]
    certifications: string[]
  }
  experience?: ExperienceEntry[]
  education?: EducationEntry[]
  projects?: ProjectEntry[]
  languages?: string[]
}

export interface ExperienceEntry {
  title: string
  company: string
  location?: string | null
  start_date: string
  end_date: string
  achievements: string[]
}

export interface EducationEntry {
  degree: string
  institution: string
  graduation_date: string
  gpa?: string | null
  honors?: string | null
}

export interface ProjectEntry {
  name: string
  description: string
  technologies: string[]
}

export interface JobDescription {
  id: number
  organization_id: number
  user_id: number
  title: string
  company: string | null
  description: string
  requirements: Record<string, unknown>
  required_skills: string[]
  preferred_skills: string[]
  status: "pending" | "extracting" | "ready" | "error"
  created_at: string
  updated_at: string
}

export interface ResumeScore {
  id: number
  resume_id: number
  job_description_id: number
  user_id: number
  overall_score: number
  grade: string
  keyword_score: number
  semantic_score: number
  skills_score: number
  experience_score: number
  education_score: number
  format_score: number
  keyword_analysis: KeywordAnalysis
  skills_analysis: Record<string, unknown>
  experience_analysis: Record<string, unknown>
  recommendations: Recommendation[]
  strengths: string[]
  weaknesses: string[]
  llm_model: string
  llm_tokens_used: number
  processing_time_seconds: number
  status: "queued" | "analyzing" | "completed" | "error"
  error_message: string | null
  created_at: string
  updated_at: string
  resume?: Resume
  job_description?: JobDescription
}

export interface KeywordAnalysis {
  score: number
  required_match_rate: number
  matched: KeywordMatch[]
  missing: string[]
  partial: KeywordMatch[]
}

export interface KeywordMatch {
  term: string
  location: string
  weight?: number
  similarity?: number
}

export interface Recommendation {
  priority: "critical" | "high" | "medium" | "low"
  category: string
  title: string
  description: string
  action_items: string[]
  estimated_effort: "quick_fix" | "moderate" | "significant"
  impact_score: number
}

export interface Invitation {
  id: number
  email: string
  role: "candidate" | "recruiter" | "admin"
  status: "pending" | "accepted" | "declined" | "expired"
  invited_by: string
  expires_at: string
  accepted_at: string | null
  created_at: string
}

export interface BillingEvent {
  id: number
  event_type: string
  status: string
  created_at: string
}

// === Notifications ===
export interface AppNotification {
  id: number
  type: "score" | "error"
  status: string
  message: string
  score_id: number
  overall_score: number | null
  grade: string | null
  created_at: string
}

// === Inertia Shared Props ===
export interface SharedProps {
  [key: string]: unknown
  auth: {
    user: User | null
    organization: Organization | null
  }
  flash: {
    notice?: string
    alert?: string
  }
  notifications: AppNotification[]
}

// === Pagination ===
export interface PaginationMeta {
  current_page: number
  total_pages: number
  total_count: number
  per_page: number
}
