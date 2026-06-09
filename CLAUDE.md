@AGENTS.md

# Life Capsule — 프로젝트 컨텍스트

## 서비스 개요
생활비 책임 관리 플랫폼. 구독·보험·통신비·렌탈·세금·공과금 등 모든 정기 지출을 AI가 자동 파악하고 납부·만료일을 알려줌.  
→ 기획 상세: `1_core.md.md`, `docs/` 폴더

## 기술 스택
- **Frontend**: Next.js 14 App Router + TypeScript
- **UI**: shadcn/ui + Tailwind CSS v4
- **Backend**: Firebase (Firestore + Auth + Storage + FCM)
- **AI**: `@google/generative-ai` (Gemini 2.5 Flash) — `app/api/ai/`
- **Hosting**: Vercel (cron: `vercel.json` → 매일 9시 `/api/cron/notify`)
- **PWA**: manifest.json + service worker + VAPID 푸시

## 폴더 구조 핵심
```
app/
  (dashboard)/          # 로그인 사용자 실제 앱
    page.tsx            # 대시보드
    items/[id]/         # 항목 상세
    categories/[slug]/  # 카테고리별
    cards/, expiry/, stats/, settings/, notifications/
  demo/                 # 비로그인 체험 모드 (더미 데이터)
    items/[id]/         # SSG (generateStaticParams)
    categories/[slug]/  # SSG
  api/
    ai/parse, ai/chat   # Gemini AI
    cron/notify         # Firestore 알림 기록 (FCM 발송 미연결 ← TODO)
    push/               # FCM 구독
  (auth)/login, signup/

components/
  demo/                 # DemoSidebar, DemoBottomNav, DemoDashboardPage 등
  landing/              # LandingPage, LandingJsonLd, DemoPreviewModal
  dashboard/, items/, cards/, ai/

lib/
  demo-data.ts          # DEMO_ITEMS(30개), DEMO_CARDS(3개), DEMO_CHAT
  types/index.ts        # 전체 타입 (ResponsibilityItem, CategorySlug 등)
  utils/category.ts     # CATEGORY_META (12개 카테고리)
  firebase-admin.ts     # Admin SDK
```

## 카테고리 슬러그 (12개)
`telecom | utility | insurance | subscription | rental | tax | penalty | vehicle | housing | finance | business | other`

## 주요 타입
```typescript
type CategorySlug = 'telecom' | 'utility' | 'insurance' | 'subscription' | 'rental' | 'tax' | 'penalty' | 'vehicle' | 'housing' | 'finance' | 'business' | 'other'
type PaymentCycle = 'monthly' | 'bimonthly' | 'quarterly' | 'semiannual' | 'yearly' | 'once'
// Firestore 경로: users/{uid}/items/{id}, /cards/{id}, /notifications/{id}
```

## 알아야 할 주의사항
1. **Timestamp 직렬화**: Server→Client 전달 시 `.toDate().toISOString()` 변환 필수
2. **URL 기반 필터 동기화**: `useSearchParams` + `useEffect`로 state 싱크 필요
3. **데모 페이지**: `/demo/items/[id]`, `/demo/categories/[slug]`는 SSG (`generateStaticParams`)
4. **AI**: Gemini 2.5 Flash 사용 중 (`gemini-2.5-flash-preview-05-20`), Anthropic 아님

## 남은 TODO
`todo.md` 참고. 주요 항목:
- 🔴 Cron에서 FCM 실제 푸시 발송 미연결 (`app/api/cron/notify/route.ts`)
- 🔴 보관함(Trash) 페이지 없음 (삭제 Dialog에 문구만 있음)
- 🟡 `/demo/chat` 페이지 없음 (sitemap엔 있음)
- 🟡 월간 리포트 차트 (현재 stats는 단순 집계만)
