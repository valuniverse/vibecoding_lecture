'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Completion, Feedback } from '@/types/feedback'
import { cn } from '@/lib/utils'
import { Star } from 'lucide-react'

interface FeedbackFormProps {
  onSubmit: (feedback: Feedback) => void
  isLoading?: boolean
}

const COMPLETION_OPTIONS: { value: Completion; label: string }[] = [
  { value: '완료', label: '완료했어요' },
  { value: '부분', label: '일부만 했어요' },
  { value: '스킵', label: '못 했어요' },
]

export function FeedbackForm({ onSubmit, isLoading }: FeedbackFormProps) {
  const [completion, setCompletion] = useState<Completion | null>(null)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')

  const handleSubmit = () => {
    if (!completion || rating === 0) return
    onSubmit({ completion, rating, comment: comment || undefined })
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm font-medium">오늘 운동 어떻게 됐나요?</p>
        <div className="grid grid-cols-3 gap-2">
          {COMPLETION_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setCompletion(opt.value)}
              className={cn(
                'rounded-xl border py-3 text-sm transition-colors',
                completion === opt.value
                  ? 'border-primary bg-primary/10 text-primary font-medium'
                  : 'bg-card text-muted-foreground'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">만족도는요?</p>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button key={star} onClick={() => setRating(star)}>
              <Star
                className={cn(
                  'h-8 w-8 transition-colors',
                  star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'
                )}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">한마디 (선택)</p>
        <textarea
          className="w-full rounded-xl border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
          placeholder="오늘 운동 어땠나요?"
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </div>

      <Button
        className="w-full"
        onClick={handleSubmit}
        disabled={!completion || rating === 0 || isLoading}
      >
        {isLoading ? '저장 중...' : '저장하기'}
      </Button>
    </div>
  )
}
