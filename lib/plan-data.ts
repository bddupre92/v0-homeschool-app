export interface DemoChild {
  id: string
  name: string
  age: number
  grade: string
  learningStyle: string
}

export interface HourSummary {
  subject: string
  total_hours: number
  session_count: number
  last_logged: string
}

export interface Filing {
  id: string
  filing_type: string
  status: string
  due_date: string
  filed_date: string | null
}

export const DEMO_CHILDREN: DemoChild[] = [
  { id: "1", name: "Emma", age: 8, grade: "3rd", learningStyle: "Visual & Hands-On" },
  { id: "2", name: "Liam", age: 6, grade: "1st", learningStyle: "Kinesthetic" },
]

export const DEMO_HOUR_SUMMARY: HourSummary[] = [
  { subject: "Reading", total_hours: 29.5, session_count: 28, last_logged: "2026-03-22" },
  { subject: "Language Arts", total_hours: 33, session_count: 25, last_logged: "2026-03-22" },
  { subject: "Mathematics", total_hours: 57.5, session_count: 40, last_logged: "2026-03-21" },
  { subject: "Social Studies", total_hours: 14.5, session_count: 12, last_logged: "2026-03-20" },
  { subject: "Science", total_hours: 63.5, session_count: 35, last_logged: "2026-03-22" },
  { subject: "Health", total_hours: 2.5, session_count: 5, last_logged: "2026-03-15" },
  { subject: "Physical Education", total_hours: 54.5, session_count: 50, last_logged: "2026-03-22" },
  { subject: "Art", total_hours: 16, session_count: 15, last_logged: "2026-03-19" },
  { subject: "Music", total_hours: 8.5, session_count: 10, last_logged: "2026-03-18" },
  { subject: "Technology", total_hours: 8.5, session_count: 8, last_logged: "2026-03-17" },
  { subject: "Life Skills", total_hours: 24, session_count: 20, last_logged: "2026-03-21" },
  { subject: "History", total_hours: 14.5, session_count: 12, last_logged: "2026-03-20" },
]

export const DEMO_FILINGS: Filing[] = [
  { id: "1", filing_type: "Letter of Intent", status: "filed", due_date: "2025-09-01", filed_date: "2025-08-15" },
  { id: "2", filing_type: "Q1 Quarterly Report", status: "filed", due_date: "2025-12-31", filed_date: "2025-12-20" },
  { id: "3", filing_type: "Q2 Quarterly Report", status: "pending", due_date: "2026-03-31", filed_date: null },
  { id: "4", filing_type: "Annual Assessment", status: "pending", due_date: "2026-06-30", filed_date: null },
]
