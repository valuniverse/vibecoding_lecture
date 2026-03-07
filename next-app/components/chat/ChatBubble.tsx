import { cn } from '@/lib/utils'
import { ChatMessage } from '@/types/checkin'

export function ChatBubble({ message }: { message: ChatMessage }) {
  const isAI = message.role === 'assistant'
  const displayContent = message.content
    .replace(/\[CHECKIN_COMPLETE\][\s\S]*/, '')
    .trim()

  if (!displayContent) return null

  return (
    <div className={cn('flex', isAI ? 'justify-start' : 'justify-end')}>
      <div
        className={cn(
          'max-w-[80%] rounded-2xl px-4 py-2 text-sm',
          isAI
            ? 'bg-muted text-foreground rounded-tl-sm'
            : 'bg-primary text-primary-foreground rounded-tr-sm'
        )}
      >
        {displayContent}
      </div>
    </div>
  )
}
