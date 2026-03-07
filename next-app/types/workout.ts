export interface WorkoutItem {
  id: string
  name: string
  sets: number
  reps: number | string
  done: boolean
}

export interface WorkoutRecommendation {
  routine: WorkoutItem[]
  reason: string
  dietTip: string
}
