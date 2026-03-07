'use client'

import { useEffect, useState } from 'react'
import { Timer } from 'lucide-react'

export function WorkoutTimer({ startedAt }: { startedAt: Date | null }) {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    if (!startedAt) return
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAt.getTime()) / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [startedAt])

  const mm = String(Math.floor(elapsed / 60)).padStart(2, '0')
  const ss = String(elapsed % 60).padStart(2, '0')

  return (
    <div className="flex items-center gap-2 text-muted-foreground">
      <Timer className="h-4 w-4" />
      <span className="font-mono text-sm">{mm}:{ss}</span>
    </div>
  )
}
