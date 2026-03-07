import { Lightbulb } from 'lucide-react'

export function ReasonBanner({ reason }: { reason: string }) {
  return (
    <div className="flex items-start gap-2 rounded-xl bg-primary/10 px-4 py-3">
      <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
      <p className="text-sm text-primary">{reason}</p>
    </div>
  )
}
