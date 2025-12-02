// API Configuration
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://smyvnutonzuxmihmxnar.supabase.co"
export const SUPABASE_KEY =
  import.meta.env.VITE_SUPABASE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNteXZudXRvbnp1eG1paG14bmFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwOTgxMDQsImV4cCI6MjA3NzY3NDEwNH0.fePFVjs1zlxaoTUu2tFGfgqTe3CsU01iR_hklzUOLfc"

// Zone ranges from bot MAIN3.py
export const ZONE_RANGES = {
  C: { start: 3, end: 7 },
  D: { start: 1, end: 10 },
  E: { start: 12, end: 21 },
  F: { start: 28, end: 51 },
  G: { start: 57, end: 80 },
  H: { start: 86, end: 109 },
} as const

export type ZoneLetter = keyof typeof ZONE_RANGES
