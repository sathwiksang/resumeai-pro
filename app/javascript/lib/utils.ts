import { type ClassValue, clsx } from "clsx"

// Lightweight clsx replacement (no extra dependency needed)
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs)
}

export function scoreColor(score: number): string {
  if (score >= 85) return "text-success-600"
  if (score >= 70) return "text-brand-600"
  if (score >= 55) return "text-warning-600"
  return "text-danger-600"
}

export function scoreBgColor(score: number): string {
  if (score >= 85) return "bg-success-50"
  if (score >= 70) return "bg-brand-50"
  if (score >= 55) return "bg-warning-50"
  return "bg-danger-50"
}

export function scoreRingColor(score: number): string {
  if (score >= 85) return "#059669"
  if (score >= 70) return "#2563EB"
  if (score >= 55) return "#D97706"
  return "#DC2626"
}

export function gradeClass(grade: string): string {
  const map: Record<string, string> = {
    "A+": "grade-a-plus",
    "A": "grade-a",
    "B+": "grade-b-plus",
    "B": "grade-b",
    "C+": "grade-c-plus",
    "C": "grade-c",
    "D": "grade-d",
    "F": "grade-f",
  }
  return map[grade] || "grade-f"
}

export function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(dateString))
}

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (seconds < 60) return "just now"
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return formatDate(dateString)
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length) + "..."
}

export function initials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}
