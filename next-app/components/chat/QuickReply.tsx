import { Button } from '@/components/ui/button'

interface QuickReplyProps {
  options: string[]
  onSelect: (text: string) => void
  disabled?: boolean
}

export function QuickReply({ options, onSelect, disabled }: QuickReplyProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <Button
          key={option}
          variant="outline"
          size="sm"
          className="rounded-full text-xs"
          onClick={() => onSelect(option)}
          disabled={disabled}
        >
          {option}
        </Button>
      ))}
    </div>
  )
}
