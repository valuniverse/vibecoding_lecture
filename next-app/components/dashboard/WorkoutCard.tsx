import { Clock } from 'lucide-react'
import { WorkoutItem } from '@/types/workout'

export function WorkoutCard({ routine }: { routine: WorkoutItem[] }) {
  const estimatedMinutes = routine.length * 7

  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-semibold">오늘의 운동 루틴</h2>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>약 {estimatedMinutes}분</span>
        </div>
      </div>
      <ul className="space-y-2">
        {routine.map((item, i) => (
          <li key={item.id} className="flex items-center gap-3 text-sm">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
              {i + 1}
            </span>
            <span className="flex-1 font-medium">{item.name}</span>
            <span className="text-muted-foreground">
              {item.sets}세트 × {item.reps}{typeof item.reps === 'number' ? '회' : ''}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
