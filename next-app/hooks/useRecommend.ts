'use client'

import { useEffect } from 'react'
import { useCheckinStore } from '@/stores/checkinStore'
import { useUserStore } from '@/stores/userStore'
import { useWorkoutStore } from '@/stores/workoutStore'

export function useRecommend() {
  const summary = useCheckinStore((s) => s.summary)
  const user = useUserStore((s) => s.user)
  const { routine, reason, dietTip, setRecommendation } = useWorkoutStore()

  useEffect(() => {
    if (!summary || !user || routine.length > 0) return

    fetch('/api/recommend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ summary, userProfile: user }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.routine) {
          setRecommendation(data.routine, data.reason, data.dietTip)
        }
      })
  }, [summary, user, routine.length, setRecommendation])

  return { routine, reason, dietTip }
}
