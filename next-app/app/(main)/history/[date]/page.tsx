'use client'

export const dynamic = 'force-dynamic'

import { use } from 'react'
import { useHistory } from '@/hooks/useHistory'
import { HistoryDetail } from '@/components/history/HistoryDetail'
import { Completion } from '@/types/feedback'

export default function HistoryDetailPage({ params }: { params: Promise<{ date: string }> }) {
  const { date } = use(params)
  const { logs, isLoading } = useHistory()

  const log = logs.find((l) => l.date === date)

  if (isLoading) {
    return (
      <div className="flex h-svh items-center justify-center">
        <p className="text-sm text-muted-foreground">불러오는 중...</p>
      </div>
    )
  }

  if (!log) {
    return (
      <div className="flex h-svh items-center justify-center">
        <p className="text-sm text-muted-foreground">기록을 찾을 수 없어요.</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-md p-6">
      <HistoryDetail
        date={log.date}
        checkinSummary={log.checkin_summary ?? { sleep: '-', fatigue: '-', soreParts: [], availableMinutes: 0 }}
        routine={log.routine}
        completion={log.completion as Completion}
        rating={log.rating}
        comment={log.comment}
      />
    </div>
  )
}
