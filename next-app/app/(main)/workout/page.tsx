'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useWorkoutStore } from '@/stores/workoutStore'
import { WorkoutChecklist } from '@/components/workout/WorkoutChecklist'
import { WorkoutTimer } from '@/components/workout/WorkoutTimer'
import { Button } from '@/components/ui/button'

export default function WorkoutPage() {
  const router = useRouter()
  const { routine, startedAt, toggleDone, start } = useWorkoutStore()

  useEffect(() => {
    start()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (routine.length === 0) {
    router.replace('/dashboard')
    return null
  }

  const doneCount = routine.filter((r) => r.done).length

  return (
    <div className="mx-auto max-w-md space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">운동 중</h1>
        <WorkoutTimer startedAt={startedAt} />
      </div>

      <div className="text-sm text-muted-foreground">
        {doneCount} / {routine.length} 완료
      </div>

      <WorkoutChecklist routine={routine} onToggle={toggleDone} />

      <Button
        className="w-full"
        variant={doneCount === routine.length ? 'default' : 'outline'}
        onClick={() => router.push('/feedback')}
      >
        {doneCount === routine.length ? '운동 완료! 🎉' : '운동 종료'}
      </Button>
    </div>
  )
}
