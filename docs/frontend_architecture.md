# Frontend Architecture - AI 웰니스 코치 (MVP)

## 1. 기술 스택

| 항목 | 선택 | 이유 |
|---|---|---|
| 프레임워크 | Next.js 14 (App Router) | SSR/SSG, 라우팅, API Route 통합 |
| 언어 | TypeScript | 타입 안전성 |
| 스타일링 | Tailwind CSS | 빠른 UI 구성 |
| 상태 관리 | Zustand | 가볍고 단순한 전역 상태 |
| 서버 상태 | TanStack Query | API 캐싱 및 동기화 |
| AI 연동 | Anthropic SDK (claude-sonnet-4-6) | 체크인 대화, 운동 추천 |
| 백엔드/DB | Supabase | 인증, DB, Realtime |
| 배포 | Vercel | Next.js 최적화 배포 |

---

## 2. 디렉토리 구조

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx          # 로그인 화면 (Google OAuth)
│   │   └── onboarding/
│   │       └── page.tsx          # S-02, S-03 온보딩
│   ├── (main)/
│   │   ├── layout.tsx            # 하단 네비게이션 포함 레이아웃
│   │   ├── page.tsx              # S-04 홈
│   │   ├── checkin/
│   │   │   └── page.tsx          # S-05 데일리 체크인
│   │   ├── dashboard/
│   │   │   └── page.tsx          # S-06 추천 대시보드
│   │   ├── workout/
│   │   │   └── page.tsx          # S-07 운동 수행
│   │   ├── feedback/
│   │   │   └── page.tsx          # S-08 피드백 입력
│   │   └── history/
│   │       ├── page.tsx          # S-09 히스토리 목록
│   │       └── [date]/
│   │           └── page.tsx      # S-10 히스토리 상세
│   └── api/
│       ├── checkin/
│       │   └── route.ts          # AI 체크인 대화 API
│       └── recommend/
│           └── route.ts          # AI 운동 추천 API
│
├── components/
│   ├── ui/                       # 공통 UI 컴포넌트
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── StarRating.tsx
│   │   └── Badge.tsx
│   ├── chat/                     # 체크인 대화 관련
│   │   ├── ChatBubble.tsx        # AI/유저 말풍선
│   │   ├── ChatInput.tsx         # 텍스트 입력 + 전송
│   │   └── QuickReply.tsx        # 빠른 응답 버튼
│   ├── dashboard/                # 추천 대시보드 관련
│   │   ├── ReasonBanner.tsx      # 추천 근거 1줄
│   │   ├── WorkoutCard.tsx       # 운동 루틴 카드
│   │   └── DietTip.tsx           # 식단 팁
│   ├── workout/                  # 운동 수행 관련
│   │   ├── WorkoutChecklist.tsx  # 운동 체크리스트
│   │   └── WorkoutTimer.tsx      # 경과 시간 타이머
│   ├── feedback/
│   │   └── FeedbackForm.tsx      # 피드백 입력 폼
│   └── history/
│       ├── HistoryList.tsx       # 날짜별 기록 리스트
│       └── HistoryDetail.tsx     # 상세 기록
│
├── stores/                       # Zustand 전역 상태
│   ├── userStore.ts              # 유저 프로필
│   ├── checkinStore.ts           # 체크인 대화 상태
│   └── workoutStore.ts           # 오늘의 운동 루틴 + 수행 상태
│
├── hooks/                        # 커스텀 훅
│   ├── useCheckin.ts             # 체크인 AI 대화 로직
│   ├── useRecommend.ts           # 운동 추천 fetch
│   └── useHistory.ts             # 히스토리 조회
│
├── lib/
│   ├── supabase.ts               # Supabase 클라이언트
│   ├── anthropic.ts              # Anthropic 클라이언트
│   └── prompts.ts                # AI 프롬프트 템플릿
│
└── types/
    ├── user.ts
    ├── checkin.ts
    ├── workout.ts
    └── feedback.ts
```

---

## 3. 라우팅 구조

```
/                    → 로그인 여부 확인 → 홈 or 로그인으로 리다이렉트
/login               → Google 로그인 화면
/onboarding          → 첫 로그인 후 프로필 등록
/checkin             → S-05 데일리 체크인
/dashboard           → S-06 추천 대시보드
/workout             → S-07 운동 수행
/feedback            → S-08 피드백 입력
/history             → S-09 히스토리 목록
/history/[date]      → S-10 히스토리 상세
```

---

## 4. 상태 관리

### userStore
```ts
{
  // Supabase Auth 세션
  session: Session | null       // supabase.auth.getSession()으로 초기화

  // 앱 프로필 (profiles 테이블)
  user: {
    id: string                  // auth.uid()와 동일
    nickname: string
    goal: '체중감량' | '근력향상' | '체력유지' | '스트레스해소'
    level: '초급' | '중급' | '고급'
    cautionParts: string[]
  } | null
}
```

### checkinStore
```ts
{
  messages: { role: 'user' | 'assistant', content: string }[]
  isComplete: boolean
  summary: {
    sleep: string
    fatigue: string
    soreParts: string[]
    availableMinutes: number
    notes: string
  } | null
}
```

### workoutStore
```ts
{
  routine: {
    id: string
    name: string
    sets: number
    reps: number | string
    done: boolean
  }[]
  reason: string
  dietTip: string
  startedAt: Date | null
}
```

---

## 5. API Routes

### POST /api/checkin
- Claude API 호출 (streaming)
- 이전 대화 메시지 + 유저 프로필 + 히스토리 요약을 컨텍스트로 전달
- 응답: AI 메시지 스트림

### POST /api/recommend
- 체크인 요약 + 유저 프로필 + 최근 운동 기록을 컨텍스트로 전달
- Claude API 호출
- 응답: `{ routine[], reason, dietTip }`

---

## 6. 데이터 흐름

```
[체크인 페이지]
유저 입력 → checkinStore.messages 추가
          → POST /api/checkin (메시지 배열 전송)
          → AI 응답 스트리밍 → ChatBubble 렌더
          → isComplete=true → /dashboard로 이동

[추천 대시보드]
페이지 진입 → POST /api/recommend (checkinStore.summary 전송)
           → workoutStore에 routine, reason, dietTip 저장
           → WorkoutCard, DietTip 렌더

[운동 수행]
workoutStore.routine 읽기
각 운동 체크 → workoutStore.routine[i].done = true
종료 → /feedback으로 이동

[피드백]
FeedbackForm 제출 → Supabase workout_logs 테이블에 저장
                  → checkinStore, workoutStore 초기화
                  → /로 이동
```

---

## 7. Supabase 테이블 구조

### users
| 컬럼 | 타입 |
|---|---|
| id | uuid (PK) |
| nickname | text |
| goal | text |
| level | text |
| caution_parts | text[] |
| created_at | timestamp |

### checkins
| 컬럼 | 타입 |
|---|---|
| id | uuid (PK) |
| user_id | uuid (FK) |
| date | date |
| summary | jsonb |
| created_at | timestamp |

### workout_logs
| 컬럼 | 타입 |
|---|---|
| id | uuid (PK) |
| user_id | uuid (FK) |
| date | date |
| routine | jsonb |
| reason | text |
| completion | text |
| rating | int |
| comment | text |
| created_at | timestamp |
