import { create } from 'zustand'
import { ChatMessage, CheckinSummary } from '@/types/checkin'

interface CheckinStore {
  messages: ChatMessage[]
  isComplete: boolean
  summary: CheckinSummary | null
  addMessage: (message: ChatMessage) => void
  setComplete: (summary: CheckinSummary) => void
  reset: () => void
}

export const useCheckinStore = create<CheckinStore>((set) => ({
  messages: [],
  isComplete: false,
  summary: null,
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
  setComplete: (summary) => set({ isComplete: true, summary }),
  reset: () => set({ messages: [], isComplete: false, summary: null }),
}))
