'use client'

import { useRouter } from 'next/navigation'
import { useUserStore } from '@/stores/userStore'
import { useCheckinStore } from '@/stores/checkinStore'
import { Button } from '@/components/ui/button'
import { useEffect } from 'react'

export default function HomePage() {
  const router = useRouter()
  const user = useUserStore((s) => s.user)
  const isComplete = useCheckinStore((s) => s.isComplete)

  useEffect(() => {
    if (!user) router.replace('/onboarding')
  }, [user, router])

  if (!user) return null

  return (
    <div className="mx-auto max-w-md space-y-6 p-6">
      <div>
        <h1 className="text-xl font-bold">안녕하세요, {user.nickname}님 👋</h1>
        <p className="mt-1 text-sm text-muted-foreground">오늘도 건강한 하루 보내세요.</p>
      </div>

      {/* 체크인 배너 */}
      <div className="rounded-xl border bg-card p-5">
        {isComplete ? (
          <div className="space-y-3">
            <p className="font-medium">오늘 체크인 완료! 🎉</p>
            <Button className="w-full" onClick={() => router.push('/dashboard')}>
              오늘 추천 보기
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="font-medium">오늘 체크인 아직 안 했어요</p>
            <p className="text-sm text-muted-foreground">
              오늘 컨디션을 알려주면 맞춤 운동을 추천해드려요.
            </p>
            <Button className="w-full" onClick={() => router.push('/checkin')}>
              체크인 하기
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
