# Backend Architecture - AI 웰니스 코치 (MVP)

## 1. 기술 스택

| 항목 | 선택 | 이유 |
|---|---|---|
| BaaS | Supabase | PostgreSQL 기반 DB, 인증, RLS, 실시간 기능 통합 |
| AI API | Anthropic Claude (claude-sonnet-4-6) | 체크인 대화 + 운동 추천 |
| API Layer | Next.js API Routes | Anthropic SDK 서버사이드 호출 (API 키 보호) |
| 배포 | Vercel | Next.js 통합 배포, 환경변수 관리 |

---

## 2. Database Schema

### 2-0. ERD (Entity Relationship Diagram)

```mermaid
erDiagram
    auth_users {
        uuid id PK
        text email
        jsonb user_metadata
    }

    profiles {
        uuid id PK_FK
        text nickname
        text goal
        text level
        text[] caution_parts
        timestamp created_at
    }

    checkins {
        uuid id PK
        uuid user_id FK
        date date
        jsonb summary
        timestamp created_at
    }

    workout_logs {
        uuid id PK
        uuid user_id FK
        date date
        jsonb routine
        text reason
        text completion
        int rating
        text comment
        timestamp created_at
    }

    auth_users ||--|| profiles : "1:1 (온보딩 완료 시 생성)"
    auth_users ||--o{ checkins : "1명의 유저는 여러 체크인을 가짐"
    auth_users ||--o{ workout_logs : "1명의 유저는 여러 운동 기록을 가짐"
```

**관계 요약:**
- `auth.users` 1 → 1 `profiles` : Google 로그인 후 온보딩 완료 시 생성 (profiles가 없으면 신규 유저)
- `auth.users` 1 → N `checkins` : 유저는 매일 1회 체크인
- `auth.users` 1 → N `workout_logs` : 유저는 매일 1회 운동 기록
- `checkins`와 `workout_logs`는 `date`로 같은 날 데이터를 연결 (직접 FK 없음)

---

## 3. Supabase 프로젝트 구성

### 3-1. 데이터베이스 테이블

#### `profiles`
`auth.users`와 1:1 연결되는 유저 프로필 테이블 (Supabase 표준 패턴).
Google 로그인 후 온보딩 완료 시 생성. `profiles` 레코드 없음 = 신규 유저.

```sql
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nickname text not null,
  goal text not null,           -- '체중감량' | '근력향상' | '체력유지' | '스트레스해소'
  level text not null,          -- '초급' | '중급' | '고급'
  caution_parts text[] default '{}',
  created_at timestamp default now()
);
```

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | uuid (PK, FK → auth.users) | Supabase Auth 유저 ID와 동일 |
| nickname | text | 표시 이름 |
| goal | text | 운동 목표 |
| level | text | 운동 경험 수준 |
| caution_parts | text[] | 부상/주의 신체 부위 목록 |
| created_at | timestamp | 가입 시각 |

---

#### `checkins`
데일리 체크인 완료 기록. AI가 추출한 컨디션 요약을 JSONB로 저장.

```sql
create table checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  date date not null,
  summary jsonb,
  created_at timestamp default now()
);
```

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | uuid (PK) | 체크인 식별자 |
| user_id | uuid (FK → users) | 유저 참조 |
| date | date | 체크인 날짜 (YYYY-MM-DD) |
| summary | jsonb | AI 추출 컨디션 요약 |
| created_at | timestamp | 기록 시각 |

**summary JSONB 스키마:**
```json
{
  "sleep": "7시간, 보통",
  "fatigue": "낮음",
  "soreParts": ["허리"],
  "availableMinutes": 30,
  "notes": "점심 후 운동 예정"
}
```

---

#### `workout_logs`
운동 수행 결과 + 피드백 저장. 체크인 이후 실제 운동 완료 시 생성.

```sql
create table workout_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  date date not null,
  routine jsonb,
  reason text,
  completion text,              -- '완료' | '부분' | '스킵'
  rating int,                   -- 1~5
  comment text,
  created_at timestamp default now()
);
```

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | uuid (PK) | 로그 식별자 |
| user_id | uuid (FK → users) | 유저 참조 |
| date | date | 운동 날짜 |
| routine | jsonb | AI 추천 루틴 목록 |
| reason | text | AI 추천 근거 1줄 |
| completion | text | 수행 여부 |
| rating | int | 만족도 (1~5) |
| comment | text | 선택 코멘트 |
| created_at | timestamp | 기록 시각 |

**routine JSONB 스키마:**
```json
[
  { "id": "1", "name": "스쿼트", "sets": 3, "reps": 12, "done": true },
  { "id": "2", "name": "플랭크", "sets": 3, "reps": "30초", "done": false }
]
```

---

### 3-2. Row Level Security (RLS)

```sql
-- profiles
alter table profiles enable row level security;
create policy "profiles_select_own" on profiles for select using (auth.uid() = id);
create policy "profiles_insert_own" on profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on profiles for update using (auth.uid() = id);

-- checkins
alter table checkins enable row level security;
create policy "checkins_select_own" on checkins for select using (auth.uid() = user_id);
create policy "checkins_insert_own" on checkins for insert with check (auth.uid() = user_id);

-- workout_logs
alter table workout_logs enable row level security;
create policy "workout_logs_select_own" on workout_logs for select using (auth.uid() = user_id);
create policy "workout_logs_insert_own" on workout_logs for insert with check (auth.uid() = user_id);
create policy "workout_logs_update_own" on workout_logs for update using (auth.uid() = user_id);
```

> RLS 적용 후 클라이언트에서 별도로 `user_id`를 전달할 필요 없음. Supabase가 세션의 `auth.uid()`를 자동으로 사용.

---

### 3-3. 인덱스

```sql
-- 날짜별 체크인 조회 최적화
create index checkins_user_date_idx on checkins(user_id, date);

-- 최근 운동 기록 조회 최적화
create index workout_logs_user_date_idx on workout_logs(user_id, date desc);
```

---

## 4. API Routes (Next.js)

Supabase에 직접 접근하지 않는 AI 연산은 Next.js API Route에서 처리. Anthropic API 키는 서버에서만 사용.

### POST `/api/checkin`

```
요청: { messages: ChatMessage[], userProfile: User, historySummary?: string }
응답: text/plain streaming (SSE-like)
```

**처리 흐름:**
1. 유저 프로필 + 최근 운동 기록 요약을 시스템 프롬프트에 삽입
2. Claude API streaming 호출
3. 텍스트 청크를 Response stream으로 전달
4. `[CHECKIN_COMPLETE]` 태그 감지 → JSON summary 추출 후 `[SUMMARY]{...}` 전송

**에러 처리:**
- API 키 없음 → 400
- Claude API 실패 → stream에 `[ERROR]...` 전송
- 크레딧 부족 → `[ERROR]Error: 400 {credit balance too low}` 반환

---

### POST `/api/recommend`

```
요청: { summary: CheckinSummary, userProfile: User, recentLogs: WorkoutLog[] }
응답: { routine: WorkoutItem[], reason: string, dietTip: string }
```

**처리 흐름:**
1. 체크인 요약 + 유저 프로필 + 최근 7일 로그를 프롬프트에 삽입
2. Claude API 호출 (non-streaming)
3. JSON 파싱 → 응답 반환

---

## 5. 데이터 흐름

```
[로그인]
Google 로그인 버튼 클릭
  → Supabase signInWithOAuth({ provider: 'google' })
  → Google OAuth 팝업 → 인증 완료
  → Supabase Auth 세션 발급 (access_token, refresh_token)
  → profiles 테이블에서 auth.uid()로 프로필 조회
    - 프로필 없음 (첫 로그인) → /onboarding
    - 프로필 있음             → /

[온보딩]
유저 입력 (닉네임/목표/레벨/주의부위)
  → Supabase INSERT profiles (id = auth.uid())

[데일리 체크인]
유저 메시지 입력
  → POST /api/checkin (messages + userProfile + historySummary)
  → Claude streaming 응답
  → [CHECKIN_COMPLETE] 감지
  → checkinStore.summary 저장
  → Supabase INSERT checkins (user_id, date, summary)
  → /dashboard 이동

[운동 추천]
/dashboard 진입
  → POST /api/recommend (summary + userProfile + recentLogs)
  → Claude → routine/reason/dietTip
  → workoutStore 저장
  → WorkoutCard/DietTip 렌더

[운동 수행]
workoutStore.routine 기반 체크리스트 수행
  → 각 항목 done 토글

[피드백]
completion/rating/comment 입력
  → Supabase INSERT workout_logs
  → checkinStore / workoutStore 초기화
  → / 이동

[홈 (재진입)]
  → Supabase SELECT checkins WHERE date = today (체크인 여부)
  → Supabase SELECT workout_logs ORDER BY date DESC LIMIT 7 (히스토리 요약)
  → 체크인 완료 여부에 따라 UI 분기
```

---

## 6. Google OAuth 설정 (Supabase 대시보드)

1. Supabase 대시보드 → Authentication → Providers → Google 활성화
2. Google Cloud Console에서 OAuth 2.0 클라이언트 ID 생성
   - 승인된 리디렉션 URI: `https://<project-id>.supabase.co/auth/v1/callback`
3. Client ID / Client Secret을 Supabase에 입력
4. Vercel 환경변수에 추가 (이미 설정된 Supabase URL/Key 사용, 별도 추가 불필요)

---

## 7. Supabase 클라이언트 설정

SSR(서버사이드 렌더링) 환경에서 `window` 접근 오류를 방지하기 위해 아래와 같이 설정.

```ts
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const isServer = typeof window === 'undefined'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: !isServer,
      autoRefreshToken: !isServer,
      detectSessionInUrl: !isServer,
    },
  }
)
```

---

## 8. 환경변수

| 변수명 | 위치 | 용도 |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | 클라이언트 + 서버 | Supabase 프로젝트 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 클라이언트 + 서버 | Supabase anon 공개 키 |
| `ANTHROPIC_API_KEY` | 서버 전용 | Claude API 인증 (API Route에서만 사용) |

> `ANTHROPIC_API_KEY`는 절대 클라이언트에 노출되면 안 됨. `NEXT_PUBLIC_` 접두어 사용 금지.

---

## 9. 향후 고려 사항

| 항목 | 현재 | 개선 방향 |
|---|---|---|
| 인증 | Google OAuth (Supabase Auth) | 카카오/애플 소셜 로그인 추가 |
| 보안 | RLS 적용 | Supabase Edge Functions로 민감 로직 이전 |
| 히스토리 요약 | 클라이언트에서 최근 로그 전달 | 서버에서 Supabase 조회 후 요약 |
| 알림 | 없음 | Supabase pg_cron + 이메일/푸시 |
| 실시간 | 없음 | Supabase Realtime (운동 공유 등) |
