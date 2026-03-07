export interface CheckinSummary {
  sleep: string
  fatigue: string
  soreParts: string[]
  availableMinutes: number
  notes: string
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}
