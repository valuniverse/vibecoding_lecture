'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import { useUserStore } from '@/stores/userStore'
import { Goal, Level } from '@/types/user'

const GOALS: Goal[] = ['체중감량', '근력향상', '체력유지', '스트레스해소']
const LEVELS: Level[] = ['초급', '중급', '고급']
const PARTS = ['어깨', '허리', '무릎', '손목']

export default function OnboardingPage() {
  const router = useRouter()
  const setUser = useUserStore((s) => s.setUser)

  const [nickname, setNickname] = useState('')
  const [goal, setGoal] = useState<Goal | null>(null)
  const [level, setLevel] = useState<Level | null>(null)
  const [cautionParts, setCautionParts] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const togglePart = (part: string) =>
    setCautionParts((prev) =>
      prev.includes(part) ? prev.filter((p) => p !== part) : [...prev, part]
    )

  const handleSubmit = async () => {
    if (!nickname || !goal || !level) return
    setIsLoading(true)

    const { data, error } = await supabase
      .from('users')
      .insert({ nickname, goal, level, caution_parts: cautionParts })
      .select()
      .single()

    if (!error && data) {
      setUser({ id: data.id, nickname, goal, level, cautionParts })
      router.push('/')
    }
    setIsLoading(false)
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h1 className="text-2xl font-bold">안녕하세요! 👋</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            맞춤 운동 코칭을 위해 간단히 알려주세요.
          </p>
        </div>

        {/* 닉네임 */}
        <div className="space-y-2">
          <p className="text-sm font-medium">이름 (닉네임)</p>
          <input
            className="w-full rounded-xl border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
            placeholder="홍길동"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
          />
        </div>

        {/* 목표 */}
        <div className="space-y-2">
          <p className="text-sm font-medium">운동 목표</p>
          <div className="grid grid-cols-2 gap-2">
            {GOALS.map((g) => (
              <button
                key={g}
                onClick={() => setGoal(g)}
                className={cn(
                  'rounded-xl border py-3 text-sm transition-colors',
                  goal === g ? 'border-primary bg-primary/10 text-primary font-medium' : 'bg-card'
                )}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* 경험 */}
        <div className="space-y-2">
          <p className="text-sm font-medium">운동 경험</p>
          <div className="grid grid-cols-3 gap-2">
            {LEVELS.map((l) => (
              <button
                key={l}
                onClick={() => setLevel(l)}
                className={cn(
                  'rounded-xl border py-3 text-sm transition-colors',
                  level === l ? 'border-primary bg-primary/10 text-primary font-medium' : 'bg-card'
                )}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* 주의 부위 */}
        <div className="space-y-2">
          <p className="text-sm font-medium">주의 부위 (선택)</p>
          <div className="flex flex-wrap gap-2">
            {PARTS.map((part) => (
              <button
                key={part}
                onClick={() => togglePart(part)}
                className={cn(
                  'rounded-full border px-4 py-1.5 text-sm transition-colors',
                  cautionParts.includes(part)
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'bg-card text-muted-foreground'
                )}
              >
                {part}
              </button>
            ))}
          </div>
        </div>

        <Button
          className="w-full"
          onClick={handleSubmit}
          disabled={!nickname || !goal || !level || isLoading}
        >
          {isLoading ? '저장 중...' : '시작하기'}
        </Button>
      </div>
    </div>
  )
}
