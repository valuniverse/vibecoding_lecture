'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useRef } from 'react'
import { useCheckin } from '@/hooks/useCheckin'
import { ChatBubble } from '@/components/chat/ChatBubble'
import { ChatInput } from '@/components/chat/ChatInput'
import { QuickReply } from '@/components/chat/QuickReply'

const QUICK_REPLIES = ['피곤해요', '괜찮아요', '30분 가능', '1시간 가능', '없어요']

export default function CheckinPage() {
  const { messages, sendMessage, isComplete } = useCheckin()
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // 첫 진입 시 AI 인사
  useEffect(() => {
    if (messages.length === 0) {
      sendMessage('안녕하세요, 오늘 체크인 시작할게요.')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const isLoading =
    messages.length > 0 &&
    messages[messages.length - 1].role === 'assistant' &&
    messages[messages.length - 1].content === ''

  return (
    <div className="flex h-svh flex-col">
      <header className="border-b px-6 py-4">
        <h1 className="font-semibold">오늘의 체크인</h1>
      </header>

      <div className="flex-1 space-y-4 overflow-y-auto p-6">
        {messages.map((msg, i) => (
          <ChatBubble key={i} message={msg} />
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="rounded-2xl bg-muted px-4 py-2 text-sm text-muted-foreground">
              ...
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="space-y-3 border-t p-4">
        <QuickReply options={QUICK_REPLIES} onSelect={sendMessage} disabled={isComplete || isLoading} />
        <ChatInput onSend={sendMessage} disabled={isComplete || isLoading} />
      </div>
    </div>
  )
}
