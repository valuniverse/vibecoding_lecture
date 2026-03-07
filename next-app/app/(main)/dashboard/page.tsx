'use client'

import { useRouter } from 'next/navigation'
import { useRecommend } from '@/hooks/useRecommend'
import { ReasonBanner } from '@/components/dashboard/ReasonBanner'
import { WorkoutCard } from '@/components/dashboard/WorkoutCard'
import { DietTip } from '@/components/dashboard/DietTip'
import { Button } from '@/components/ui/button'
import { useWorkoutStore } from '@/stores/workoutStore'

export default function DashboardPage() {
  const router = useRouter()
  const { routine, reason, dietTip } = useRecommend()
  const { setRecommendation } = useWorkoutStore()

  if (routine.length === 0) {
    return (
      <div className="flex h-svh items-center justify-center">
        <p className="text-sm text-muted-foreground">추천을 불러오는 중...</p>
      </div>
    )
  }

  const handleReroll = async () => {
    setRecommendation([], '', '')
  }

  return (
    <div className="mx-auto max-w-md space-y-4 p-6">
      <h1 className="text-xl font-bold">오늘의 추천</h1>
      <ReasonBanner reason={reason} />
      <WorkoutCard routine={routine} />
      <DietTip tip={dietTip} />

      <div className="flex gap-3 pt-2">
        <Button variant="outline" className="flex-1" onClick={handleReroll}>
          루틴 바꿔줘
        </Button>
        <Button className="flex-1" onClick={() => router.push('/workout')}>
          운동 시작
        </Button>
      </div>
    </div>
  )
}
