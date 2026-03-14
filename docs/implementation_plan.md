# Implementation Plan - AI 웰니스 코치 (MVP)

## 현재 상태

- Next.js 16 + TypeScript + Tailwind CSS + shadcn/ui 세팅 완료
- 기본 레이아웃 (`app/layout.tsx`), ThemeProvider, Button 컴포넌트 존재
- Zustand, Supabase, Anthropic SDK 미설치

---

## Phase 0. 환경 세팅

### 0-1. 패키지 설치
```bash
pnpm add @anthropic-ai/sdk @supabase/supabase-js zustand
```

### 0-2. 환경변수 설정
```
# .env.local
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
ANTHROPIC_API_KEY=
```

### 0-3. Supabase 테이블 생성
```sql
-- profiles (auth.users와 1:1 연결, Google 로그인 연동)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nickname text not null,
  goal text not null,
  level text not null,
  caution_parts text[] default '{}',
  created_at timestamp default now()
);

-- RLS 활성화 및 정책
alter table profiles enable row level security;
create policy "profiles_select_own" on profiles for select using (auth.uid() = id);
create policy "profiles_insert_own" on profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on profiles for update using (auth.uid() = id);

-- checkins
create table checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  date date not null,
  summary jsonb,
  created_at timestamp default now()
);

alter table checkins enable row level security;
create policy "checkins_select_own" on checkins for select using (auth.uid() = user_id);
create policy "checkins_insert_own" on checkins for insert with check (auth.uid() = user_id);

-- workout_logs
create table workout_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  date date not null,
  routine jsonb,
  reason text,
  completion text,
  rating int,
  comment text,
  created_at timestamp default now()
);

alter table workout_logs enable row level security;
create policy "workout_logs_select_own" on workout_logs for select using (auth.uid() = user_id);
create policy "workout_logs_insert_own" on workout_logs for insert with check (auth.uid() = user_id);
create policy "workout_logs_update_own" on workout_logs for update using (auth.uid() = user_id);
```

### 0-4. 디렉토리 구조 생성
```
app/
├── (auth)/onboarding/page.tsx
├── (main)/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── checkin/page.tsx
│   ├── dashboard/page.tsx
│   ├── workout/page.tsx
│   ├── feedback/page.tsx
│   └── history/
│       ├── page.tsx
│       └── [date]/page.tsx
└── api/
    ├── checkin/route.ts
    └── recommend/route.ts

lib/
├── supabase.ts
├── anthropic.ts
└── prompts.ts

stores/
├── userStore.ts
├── checkinStore.ts
└── workoutStore.ts

types/
├── user.ts
├── checkin.ts
├── workout.ts
└── feedback.ts
```

---

## Phase 1. 기반 코드

### 1-1. 타입 정의 (`types/`)

**user.ts**
```ts
export type Goal = '체중감량' | '근력향상' | '체력유지' | '스트레스해소'
export type Level = '초급' | '중급' | '고급'

export interface User {
  id: string
  nickname: string
  goal: Goal
  level: Level
  cautionParts: string[]
}
```

**checkin.ts**
```ts
export interface CheckinSummary {
  sleep: string
  fatigue: string
  soreParts: string[]
  availableMinutes: number
  notes: string
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}
```

**workout.ts**
```ts
export interface WorkoutItem {
  id: string
  name: string
  sets: number
  reps: number | string
  done: boolean
}

export interface WorkoutRecommendation {
  routine: WorkoutItem[]
  reason: string
  dietTip: string
}
```

**feedback.ts**
```ts
export type Completion = '완료' | '부분' | '스킵'

export interface Feedback {
  completion: Completion
  rating: number
  comment?: string
}
```

### 1-2. 클라이언트 초기화 (`lib/`)

**supabase.ts**
```ts
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

**anthropic.ts**
```ts
import Anthropic from '@anthropic-ai/sdk'

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})
```

**prompts.ts**
```ts
// 체크인 시스템 프롬프트
export const CHECKIN_SYSTEM_PROMPT = `...`

// 운동 추천 시스템 프롬프트
export const RECOMMEND_SYSTEM_PROMPT = `...`
```

### 1-3. Zustand 스토어 (`stores/`)

구현 순서: `userStore` → `checkinStore` → `workoutStore`

---

## Phase 2. API Routes

### 2-1. POST `/api/checkin`
- 요청: `{ messages: ChatMessage[], userProfile: User, historySummary?: string }`
- Claude streaming 응답
- 마지막 메시지가 체크인 완료 신호인 경우 `summary` 추출해서 함께 반환

### 2-2. POST `/api/recommend`
- 요청: `{ summary: CheckinSummary, userProfile: User, recentLogs: WorkoutLog[] }`
- Claude 호출 → JSON 파싱
- 응답: `{ routine: WorkoutItem[], reason: string, dietTip: string }`

---

## Phase 3. 화면 구현 (순서)

### S-02 로그인 (`/login`)
- [ ] Google 로그인 버튼
- [ ] `supabase.auth.signInWithOAuth({ provider: 'google' })` 호출
- [ ] 로그인 완료 후 `profiles` 테이블에서 프로필 조회
  - 프로필 없음 → `/onboarding`
  - 프로필 있음 → `/`
- [ ] `middleware.ts`: 비로그인 상태에서 `/login` 외 접근 시 리다이렉트

### S-03 온보딩 (`/onboarding`)
- [ ] 닉네임 입력
- [ ] 목표 선택 (4지선다 버튼)
- [ ] 경험 선택 (3지선다 버튼)
- [ ] 주의 부위 다중 선택
- [ ] 저장 → Supabase `profiles` insert (id = auth.uid()) → `/` 이동

### S-04 홈 (`/`)
- [ ] 오늘 체크인 여부 확인 (Supabase 조회)
- [ ] 미완료: 체크인 배너 + 버튼
- [ ] 완료: 오늘 추천 요약 카드
- [ ] 최근 7일 완료 현황 도트 표시
- [ ] 히스토리 보기 링크

### S-05 데일리 체크인 (`/checkin`)
- [ ] ChatBubble 컴포넌트 (AI / 유저 말풍선)
- [ ] ChatInput 컴포넌트 (텍스트 + 전송)
- [ ] QuickReply 버튼 (상황별 빠른 응답)
- [ ] `useCheckin` 훅: `POST /api/checkin` 호출 + 스트리밍 렌더
- [ ] `isComplete=true` 감지 → `/dashboard` 이동

### S-06 추천 대시보드 (`/dashboard`)
- [ ] 페이지 진입 시 `POST /api/recommend` 호출
- [ ] ReasonBanner (추천 근거 1줄)
- [ ] WorkoutCard (루틴 목록, 예상 시간)
- [ ] DietTip (식단 팁 1줄)
- [ ] 운동 시작 버튼 → `/workout`
- [ ] 루틴 바꿔줘 버튼 → 재추천 (1회)

### S-07 운동 수행 (`/workout`)
- [ ] WorkoutChecklist (체크리스트, `workoutStore` 연동)
- [ ] WorkoutTimer (경과 시간)
- [ ] 운동 종료 버튼 → `/feedback`

### S-08 피드백 입력 (`/feedback`)
- [ ] 수행 여부 3지선다
- [ ] 별점 (StarRating)
- [ ] 코멘트 입력 (선택)
- [ ] 저장 → Supabase `workout_logs` insert → 스토어 초기화 → `/`

### S-09 히스토리 (`/history`)
- [ ] Supabase `workout_logs` 조회
- [ ] 날짜별 리스트 렌더
- [ ] 항목 클릭 → `/history/[date]`

### S-10 히스토리 상세 (`/history/[date]`)
- [ ] 해당 날짜 체크인 요약 + 운동 루틴 + 피드백 표시

---

## Phase 4. 마무리

- [ ] 로딩/에러 상태 처리 (각 페이지)
- [ ] 모바일 반응형 점검
- [ ] `middleware.ts`: 비로그인 → `/login`, 로그인+프로필없음 → `/onboarding` 리다이렉트
- [ ] Vercel 환경변수 확인 (Supabase URL/Key, Anthropic Key)
- [ ] Supabase 대시보드 Google OAuth 설정 확인
- [ ] 베타 테스트

---

## 구현 우선순위 요약

```
0. 환경 세팅 (패키지, env, Supabase 테이블 + RLS, Google OAuth 설정)
1. 타입 + lib + stores
2. API Routes (checkin, recommend)
3. 로그인 → 온보딩 → 홈 → 체크인 → 대시보드 → 운동 → 피드백 → 히스토리
4. 마무리 (middleware, 에러처리, 배포)
```
