import { Star } from 'lucide-react'
import { WorkoutItem } from '@/types/workout'
import { Completion } from '@/types/feedback'

interface HistoryDetailProps {
  date: string
  checkinSummary: {
    sleep: string
    fatigue: string
    soreParts: string[]
    availableMinutes: number
  }
  routine: WorkoutItem[]
  completion: Completion
  rating: number
  comment?: string
}

export function HistoryDetail({
  date, checkinSummary, routine, completion, rating, comment,
}: HistoryDetailProps) {
  return (
    <div className="space-y-6">
      <h1 className="text-lg font-semibold">{date}</h1>

      <div className="rounded-xl border bg-card p-4 space-y-2">
        <p className="text-sm font-medium">그날의 컨디션</p>
        <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
          <span>수면: {checkinSummary.sleep}</span>
          <span>피로도: {checkinSummary.fatigue}</span>
          <span>근육통: {checkinSummary.soreParts.join(', ')}</span>
          <span>가용시간: {checkinSummary.availableMinutes}분</span>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-4 space-y-2">
        <p className="text-sm font-medium">운동 루틴</p>
        <ul className="space-y-1">
          {routine.map((item) => (
            <li key={item.id} className="text-sm text-muted-foreground">
              {item.name} · {item.sets}세트 × {item.reps}{typeof item.reps === 'number' ? '회' : ''}
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-xl border bg-card p-4 space-y-2">
        <p className="text-sm font-medium">피드백</p>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-muted-foreground">{completion}</span>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={`h-4 w-4 ${s <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`}
              />
            ))}
          </div>
        </div>
        {comment && <p className="text-sm text-muted-foreground">{comment}</p>}
      </div>
    </div>
  )
}
