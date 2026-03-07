import { anthropic } from '@/lib/anthropic'
import { CHECKIN_SYSTEM_PROMPT } from '@/lib/prompts'
import { ChatMessage, CheckinSummary } from '@/types/checkin'
import { User } from '@/types/user'

export async function POST(req: Request) {
  const {
    messages,
    userProfile,
    historySummary,
  }: {
    messages: ChatMessage[]
    userProfile: User
    historySummary?: string
  } = await req.json()

  const systemPrompt = [
    CHECKIN_SYSTEM_PROMPT,
    `사용자 프로필: 닉네임=${userProfile.nickname}, 목표=${userProfile.goal}, 수준=${userProfile.level}, 주의부위=${userProfile.cautionParts.join(', ') || '없음'}`,
    historySummary ? `최근 운동 기록 요약: ${historySummary}` : '',
  ]
    .filter(Boolean)
    .join('\n\n')

  const stream = anthropic.messages.stream({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: systemPrompt,
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
  })

  const encoder = new TextEncoder()

  const readable = new ReadableStream({
    async start(controller) {
      let fullText = ''

      for await (const chunk of stream) {
        if (
          chunk.type === 'content_block_delta' &&
          chunk.delta.type === 'text_delta'
        ) {
          const text = chunk.delta.text
          fullText += text
          controller.enqueue(encoder.encode(text))
        }
      }

      // 체크인 완료 신호 감지 → summary 추출
      if (fullText.includes('[CHECKIN_COMPLETE]')) {
        try {
          const jsonMatch = fullText.match(/\{[\s\S]*\}/)
          if (jsonMatch) {
            const summary: CheckinSummary = JSON.parse(jsonMatch[0])
            controller.enqueue(
              encoder.encode(`\n[SUMMARY]${JSON.stringify(summary)}`)
            )
          }
        } catch {
          // JSON 파싱 실패 시 무시
        }
      }

      controller.close()
    },
  })

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
    },
  })
}
