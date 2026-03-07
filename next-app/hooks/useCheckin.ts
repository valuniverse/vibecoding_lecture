'use client'

import { useRouter } from 'next/navigation'
import { useCheckinStore } from '@/stores/checkinStore'
import { useUserStore } from '@/stores/userStore'
import { CheckinSummary } from '@/types/checkin'

export function useCheckin() {
  const router = useRouter()
  const { messages, addMessage, setComplete, isComplete } = useCheckinStore()
  const user = useUserStore((s) => s.user)

  const sendMessage = async (text: string) => {
    if (!user) return

    const userMessage = { role: 'user' as const, content: text }
    addMessage(userMessage)

    const res = await fetch('/api/checkin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [...messages, userMessage],
        userProfile: user,
      }),
    })

    if (!res.body) return

    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let aiText = ''

    // AI 메시지 자리 확보
    addMessage({ role: 'assistant', content: '' })

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      aiText += decoder.decode(value, { stream: true })

      // 스트리밍 중 실시간 업데이트
      useCheckinStore.setState((state) => {
        const msgs = [...state.messages]
        msgs[msgs.length - 1] = { role: 'assistant', content: aiText }
        return { messages: msgs }
      })
    }

    // 완료 감지
    if (aiText.includes('[CHECKIN_COMPLETE]')) {
      const summaryMatch = aiText.match(/\[SUMMARY\](\{[\s\S]*\})/)
      if (summaryMatch) {
        try {
          const summary: CheckinSummary = JSON.parse(summaryMatch[1])
          setComplete(summary)
          setTimeout(() => router.push('/dashboard'), 800)
        } catch {}
      }
    }
  }

  return { messages, sendMessage, isComplete }
}
