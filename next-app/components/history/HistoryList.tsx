import Link from 'next/link'
import { Star } from 'lucide-react'

interface HistoryEntry {
  date: string
  routineSummary: string
  completion: string
  rating: number
}

export function HistoryList({ entries }: { entries: HistoryEntry[] }) {
  if (entries.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        아직 운동 기록이 없어요.
      </p>
    )
  }

  return (
    <ul className="space-y-3">
      {entries.map((entry) => (
        <li key={entry.date}>
          <Link
            href={`/history/${entry.date}`}
            className="flex items-center gap-3 rounded-xl border bg-card p-4 transition-colors hover:bg-muted"
          >
            <div className="flex-1">
              <p className="text-sm font-medium">{entry.date}</p>
              <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
                {entry.routineSummary}
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span>{entry.rating}</span>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  )
}
