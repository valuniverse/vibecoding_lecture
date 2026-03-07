'use client'

import { WorkoutItem } from '@/types/workout'
import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

interface WorkoutChecklistProps {
  routine: WorkoutItem[]
  onToggle: (id: string) => void
}

export function WorkoutChecklist({ routine, onToggle }: WorkoutChecklistProps) {
  return (
    <ul className="space-y-3">
      {routine.map((item) => (
        <li
          key={item.id}
          onClick={() => onToggle(item.id)}
          className={cn(
            'flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-colors',
            item.done ? 'border-primary/30 bg-primary/5' : 'bg-card'
          )}
        >
          <div
            className={cn(
              'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
              item.done ? 'border-primary bg-primary' : 'border-muted-foreground'
            )}
          >
            {item.done && <Check className="h-3 w-3 text-primary-foreground" />}
          </div>
          <div className="flex-1">
            <p className={cn('font-medium', item.done && 'line-through text-muted-foreground')}>
              {item.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {item.sets}세트 × {item.reps}{typeof item.reps === 'number' ? '회' : ''}
            </p>
          </div>
        </li>
      ))}
    </ul>
  )
}
