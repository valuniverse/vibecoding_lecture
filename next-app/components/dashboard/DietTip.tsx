import { Salad } from 'lucide-react'

export function DietTip({ tip }: { tip: string }) {
  return (
    <div className="flex items-start gap-2 rounded-xl border bg-card px-4 py-3">
      <Salad className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
      <p className="text-sm">{tip}</p>
    </div>
  )
}
