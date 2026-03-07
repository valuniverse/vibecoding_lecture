'use client'

export const dynamic = 'force-dynamic'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { FeedbackForm } from '@/components/feedback/FeedbackForm'
import { Feedback } from '@/types/feedback'
import { useUserStore } from '@/stores/userStore'
import { useWorkoutStore } from '@/stores/workoutStore'
import { useCheckinStore } from '@/stores/checkinStore'
import { supabase } from '@/lib/supabase'

export default function FeedbackPage() {
  const router = useRouter()
  const user = useUserStore((s) => s.user)
  const { routine, reason, reset: resetWorkout } = useWorkoutStore()
  const { summary, reset: resetCheckin } = useCheckinStore()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (feedback: Feedback) => {
    if (!user) return
    setIsLoading(true)

    await supabase.from('workout_logs').insert({
      user_id: user.id,
      date: new Date().toISOString().split('T')[0],
      routine,
      reason,
      completion: feedback.completion,
      rating: feedback.rating,
      comment: feedback.comment,
      checkin_summary: summary,
    })

    resetWorkout()
    resetCheckin()
    router.push('/')
  }

  return (
    <div className="mx-auto max-w-md space-y-6 p-6">
      <h1 className="text-xl font-bold">운동 후 피드백</h1>
      <FeedbackForm onSubmit={handleSubmit} isLoading={isLoading} />
    </div>
  )
}
