'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useUserStore } from '@/stores/userStore'

export interface WorkoutLog {
  id: string
  date: string
  routine: { id: string; name: string; sets: number; reps: number | string; done: boolean }[]
  reason: string
  completion: string
  rating: number
  comment?: string
  checkin_summary?: {
    sleep: string
    fatigue: string
    soreParts: string[]
    availableMinutes: number
  }
}

export function useHistory() {
  const user = useUserStore((s) => s.user)
  const [logs, setLogs] = useState<WorkoutLog[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    supabase
      .from('workout_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .then(({ data }) => {
        if (data) setLogs(data as WorkoutLog[])
        setIsLoading(false)
      })
  }, [user])

  return { logs, isLoading }
}
