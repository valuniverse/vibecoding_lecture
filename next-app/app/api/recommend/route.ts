import { anthropic } from '@/lib/anthropic'
import { RECOMMEND_SYSTEM_PROMPT } from '@/lib/prompts'
import { CheckinSummary } from '@/types/checkin'
import { WorkoutRecommendation } from '@/types/workout'
import { User } from '@/types/user'

interface RecentLog {
  date: string
  routine: { name: string }[]
  completion: string
  rating: number
}

export async function POST(req: Request) {
  const {
    summary,
    userProfile,
    recentLogs = [],
  }: {
    summary: CheckinSummary
    userProfile: User
    recentLogs?: RecentLog[]
  } = await req.json()

  const userContext = [
    `사용자 프로필: 닉네임=${userProfile.nickname}, 목표=${userProfile.goal}, 수준=${userProfile.level}, 주의부위=${userProfile.cautionParts.join(', ') || '없음'}`,
    `오늘 컨디션: 수면=${summary.sleep}, 피로도=${summary.fatigue}, 근육통=${summary.soreParts.join(', ')}, 가용시간=${summary.availableMinutes}분, 특이사항=${summary.notes || '없음'}`,
    recentLogs.length > 0
      ? `최근 운동 기록:\n${recentLogs
          .map(
            (l) =>
              `- ${l.date}: ${l.routine.map((r) => r.name).join(', ')} (완료=${l.completion}, 만족도=${l.rating})`
          )
          .join('\n')}`
      : '최근 운동 기록 없음',
  ].join('\n\n')

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: RECOMMEND_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userContext }],
  })

  const content = message.content[0]
  if (content.type !== 'text') {
    return Response.json({ error: '추천 생성 실패' }, { status: 500 })
  }

  try {
    const jsonMatch = content.text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('JSON not found')
    const recommendation: WorkoutRecommendation = JSON.parse(jsonMatch[0])
    return Response.json(recommendation)
  } catch {
    return Response.json({ error: '응답 파싱 실패' }, { status: 500 })
  }
}
