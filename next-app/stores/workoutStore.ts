import { create } from 'zustand'
import { WorkoutItem } from '@/types/workout'

interface WorkoutStore {
  routine: WorkoutItem[]
  reason: string
  dietTip: string
  startedAt: Date | null
  setRecommendation: (routine: WorkoutItem[], reason: string, dietTip: string) => void
  toggleDone: (id: string) => void
  start: () => void
  reset: () => void
}

export const useWorkoutStore = create<WorkoutStore>((set) => ({
  routine: [],
  reason: '',
  dietTip: '',
  startedAt: null,
  setRecommendation: (routine, reason, dietTip) =>
    set({ routine, reason, dietTip }),
  toggleDone: (id) =>
    set((state) => ({
      routine: state.routine.map((item) =>
        item.id === id ? { ...item, done: !item.done } : item
      ),
    })),
  start: () => set({ startedAt: new Date() }),
  reset: () =>
    set({ routine: [], reason: '', dietTip: '', startedAt: null }),
}))
