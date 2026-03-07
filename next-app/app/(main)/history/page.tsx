'use client'

export const dynamic = 'force-dynamic'

import { useHistory } from '@/hooks/useHistory'
import { HistoryList } from '@/components/history/HistoryList'

export default function HistoryPage() {
  const { logs, isLoading } = useHistory()

  const entries = logs.map((log) => ({
    date: log.date,
    routineSummary: log.routine.map((r) => r.name).join(', '),
    completion: log.completion,
    rating: log.rating,
  }))

  return (
    <div className="mx-auto max-w-md space-y-4 p-6">
      <h1 className="text-xl font-bold">운동 기록</h1>
      {isLoading ? (
        <p className="py-12 text-center text-sm text-muted-foreground">불러오는 중...</p>
      ) : (
        <HistoryList entries={entries} />
      )}
    </div>
  )
}
