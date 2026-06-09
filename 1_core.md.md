# Life Responsibility OS — core.md
> **바이브 코딩 기준 문서 v1.0**
> 이 파일은 Claude Code가 프로젝트 전체를 이해하는 단일 진실 공급원(Single Source of Truth)이다.
> 모든 구현 결정은 이 파일의 철학과 데이터 모델을 기반으로 한다.


# 📁 프로젝트 구조
# core.md        ← 루트 (여기서 시작)
# docs/
#   auth.md
#   firebase.md
#   features.md
#   design.md
#   pages.md
#   cards.md
#   ai.md
---

## 1. 서비스 정의

### 한 줄 정의
사람이 살아가면서 발생하는 **모든 생활 책임(계약·구독·보험·세금·렌탈·공과금·과태료)**을 AI가 자동 구조화하고 한 곳에서 관리하는 **생활 재정 책임 관리 플랫폼**.

### 이 서비스는 무엇이 아닌가
- ❌ 가계부 (지출 기록 앱)
- ❌ 자산관리 서비스 (투자·대출·순자산)
- ❌ 마이데이터 서비스 (금융기관 연동 거래 조회)
- ❌ 가격 비교 서비스

### 이 서비스는 무엇인가
- ✅ **생활 계약 관리** — 약정 종료일, 자동갱신 시점, 계약 만기를 추적
- ✅ **지출 책임 관리** — 내가 무엇을 왜 얼마나 언제까지 내는지 파악
- ✅ **AI 자동 구조화** — 사진·문자·대화로 던지면 AI가 분류·정리
- ✅ **카드 혜택 최적화** — 실적 요건 달성률 및 할인 시뮬레이션
- ✅ **해지·갱신 관리** — D-day 기반 알림 및 자동갱신 방어

### 핵심 철학
> "사용자는 카테고리를 선택하지 않는다. 사용자는 정보를 던진다. AI가 구조화한다."

---

## 2. 기술 스택

```
Frontend     Next.js 14 (App Router) + TypeScript
UI           shadcn/ui + Tailwind CSS
Backend      Firebase (Firestore + Auth + Storage + Functions)
Hosting      Vercel
AI           Anthropic Claude API (claude-sonnet-4-20250514)
OCR          Claude Vision API (이미지 → 구조화 데이터)
Notifications Firebase Cloud Messaging + Vercel Cron Jobs
State        Zustand (클라이언트) + React Query (서버 상태)
```

### 프로젝트 구조
```
/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx               # 사이드바 + 상단바 공통 레이아웃
│   │   ├── page.tsx                 # 메인 대시보드 (전체 지출 총 보고서)
│   │   ├── items/
│   │   │   ├── page.tsx             # 전체 항목 목록
│   │   │   └── [id]/page.tsx        # 항목 상세
│   │   ├── categories/
│   │   │   └── [slug]/page.tsx      # 카테고리별 대시보드
│   │   ├── cards/
│   │   │   ├── page.tsx             # 카드별 대시보드
│   │   │   └── [id]/page.tsx        # 카드 상세 + 혜택 달성률
│   │   ├── expiry/page.tsx          # 해지·만료 관리 전용
│   │   ├── reports/page.tsx         # 월간·연간 리포트
│   │   └── settings/page.tsx        # 설정
│   └── api/
│       ├── ai/parse/route.ts        # AI 텍스트·이미지 파싱
│       ├── ai/chat/route.ts         # AI 대화 인터페이스
│       └── cron/notify/route.ts     # 만료 알림 크론
├── components/
│   ├── ui/                          # shadcn/ui 기본 컴포넌트
│   ├── dashboard/                   # 대시보드 전용 컴포넌트
│   ├── items/                       # 항목 카드·폼·목록
│   ├── cards/                       # 신용카드 관련 컴포넌트
│   ├── ai/                          # AI 입력 채널 컴포넌트
│   └── shared/                      # 공통 컴포넌트
├── lib/
│   ├── firebase.ts                  # Firebase 초기화
│   ├── anthropic.ts                 # Claude API 클라이언트
│   ├── utils/
│   │   ├── money.ts                 # 금액 포맷·환산 유틸
│   │   ├── date.ts                  # 날짜·D-day 유틸
│   │   └── category.ts              # 카테고리 메타데이터
│   └── types/
│       └── index.ts                 # 전체 TypeScript 타입 정의
├── stores/
│   ├── itemStore.ts                 # 항목 상태 (Zustand)
│   └── uiStore.ts                   # UI 상태
└── hooks/
    ├── useItems.ts                  # React Query 훅
    ├── useCards.ts
    └── useAI.ts
```

---

## 3. 데이터 모델 (Firestore)

### 3.1 `users/{userId}` — 사용자
```typescript
interface User {
  uid: string
  email: string
  displayName: string
  photoURL?: string
  settings: {
    notifyDaysBefore: number[]    // 알림 기준 일수 [7, 30, 90]
    currency: 'KRW'
    timezone: 'Asia/Seoul'
    defaultPaymentCardId?: string
  }
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

### 3.2 `users/{userId}/items/{itemId}` — 생활 책임 항목 (핵심 컬렉션)
```typescript
interface ResponsibilityItem {
  id: string
  userId: string

  // 기본 정보
  name: string                    // "KT 인터넷", "자동차보험"
  description?: string
  category: CategorySlug          // 아래 카테고리 enum 참조
  subcategory?: string            // 세부 분류 (예: 보험 > 실손)
  tags?: string[]                 // 사용자 자유 태그

  // 금액 정보
  amount: number                  // 실제 결제 금액 (원)
  originalAmount?: number         // 할인 전 원래 금액
  discountAmount?: number         // 할인 금액
  discountReason?: string         // 할인 사유 (약정할인, 카드할인 등)
  cycle: PaymentCycle             // 결제 주기
  dayOfMonth?: number             // 매월 N일 (monthly 기준)
  nextPaymentDate?: Timestamp     // 다음 결제 예정일

  // 결제 수단
  paymentCardId?: string          // 연결된 카드 ID (cards 컬렉션)
  paymentMethod?: string          // 카드명 직접 입력 (카드 미등록 시)
  paymentAccount?: string         // 계좌이체 시 계좌 정보
  isAutoPayment: boolean          // 자동이체 여부

  // 계약·약정 정보
  contractStartDate?: Timestamp
  contractEndDate?: Timestamp     // 약정·계약 종료일 ⭐ 핵심
  autoRenews: boolean             // 자동갱신 여부
  renewalNoticeDays?: number      // 해지 통보 필요 기간 (일)
  trialEndDate?: Timestamp        // 무료체험 종료일
  minimumContractMonths?: number  // 최소 약정 개월

  // 공급자 정보
  provider: string                // "KT", "삼성화재", "넷플릭스"
  providerUrl?: string
  providerPhone?: string
  accountNumber?: string          // 고객번호·계약번호

  // 담당자
  owner?: string                  // 명의 (홍길동, 배우자 등)
  ownerType?: 'self' | 'spouse' | 'parent' | 'child' | 'business'

  // 문서 첨부
  attachments?: Attachment[]

  // AI 파싱 메타
  aiParsed: boolean               // AI가 자동 파싱했는지
  aiConfidence?: number           // AI 파싱 신뢰도 0~1
  rawInput?: string               // 원본 입력 텍스트

  // 상태
  status: 'active' | 'expiring' | 'expired' | 'cancelled' | 'paused'
  isArchived: boolean

  // 메모
  memo?: string
  createdAt: Timestamp
  updatedAt: Timestamp
}

type CategorySlug =
  | 'telecom'      // 통신 (휴대폰, 인터넷, IPTV)
  | 'utility'      // 공과금 (전기, 수도, 가스, 관리비)
  | 'insurance'    // 보험 (실손, 자동차, 화재, 생명)
  | 'subscription' // 구독 (OTT, SaaS, 미디어)
  | 'rental'       // 렌탈 (정수기, 공기청정기, 안마의자)
  | 'tax'          // 세금 (재산세, 자동차세, 소득세)
  | 'penalty'      // 과태료·범칙금
  | 'vehicle'      // 차량 (보험, 검사, 하이패스)
  | 'housing'      // 주거 (월세, 관리비, 전세대출)
  | 'finance'      // 금융 (대출이자, 카드연회비)
  | 'business'     // 사업 (도메인, 서버, 클라우드, SaaS)
  | 'other'        // 기타

type PaymentCycle =
  | 'monthly'      // 매월
  | 'bimonthly'    // 2개월
  | 'quarterly'    // 분기 (3개월)
  | 'semiannual'   // 반기 (6개월)
  | 'yearly'       // 매년
  | 'once'         // 일회성

interface Attachment {
  id: string
  name: string
  url: string        // Firebase Storage URL
  type: 'contract' | 'receipt' | 'invoice' | 'certificate' | 'other'
  uploadedAt: Timestamp
}
```

### 3.3 `users/{userId}/cards/{cardId}` — 신용카드
```typescript
interface CreditCard {
  id: string
  userId: string

  // 카드 정보
  name: string                    // "신한 Deep Dream 카드"
  issuer: string                  // "신한카드"
  cardType: 'credit' | 'debit' | 'prepaid'
  last4Digits?: string
  color?: string                  // 카드 색상 (UI 표시용)
  network?: 'visa' | 'mastercard' | 'amex' | 'local'

  // 실적 요건 (혜택 계산용) ⭐
  benefits: CardBenefit[]

  // 이번달 현황
  monthlySpend?: number           // 이번달 누적 실적 (등록된 항목 기준 자동 계산)

  isActive: boolean
  isPrimary: boolean              // 주 결제카드 여부
  memo?: string
  createdAt: Timestamp
}

interface CardBenefit {
  id: string
  description: string             // "통신비 1만원 할인"
  conditionType: 'min_spend' | 'category_spend' | 'merchant'
  conditionAmount?: number        // 최소 실적 금액
  conditionCategory?: CategorySlug
  discountAmount?: number         // 고정 할인액
  discountRate?: number           // 할인율 (0.1 = 10%)
  discountCap?: number            // 최대 할인 한도
  applicableCategories?: CategorySlug[]
  applicableProviders?: string[]
  isActive: boolean
}
```

### 3.4 `users/{userId}/notifications/{notifId}` — 알림 기록
```typescript
interface NotificationRecord {
  id: string
  itemId: string
  type: 'expiry' | 'renewal' | 'payment' | 'trial_end' | 'benefit_threshold'
  message: string
  daysUntil: number
  isRead: boolean
  sentAt: Timestamp
}
```

---

## 4. 카테고리 메타데이터

```typescript
// lib/utils/category.ts
export const CATEGORY_META: Record<CategorySlug, CategoryMeta> = {
  telecom: {
    label: '통신',
    icon: 'Smartphone',
    color: '#E6F1FB',
    textColor: '#0C447C',
    subcategories: ['휴대폰', '인터넷', 'IPTV', '기업회선'],
    providers: ['SKT', 'KT', 'LG U+', 'SKB', 'KT인터넷', '알뜰폰'],
  },
  utility: {
    label: '공과금',
    icon: 'Zap',
    color: '#EAF3DE',
    textColor: '#27500A',
    subcategories: ['전기', '수도', '도시가스', '관리비', '주차'],
    providers: ['한국전력', '서울시 수도사업소', '도시가스'],
  },
  insurance: {
    label: '보험',
    icon: 'Shield',
    color: '#FAEEDA',
    textColor: '#633806',
    subcategories: ['실손', '건강', '암', '치아', '운전자', '자동차', '화재', '종신'],
    providers: ['삼성화재', '현대해상', 'KB손보', '메리츠화재', '한화생명'],
  },
  subscription: {
    label: '구독',
    icon: 'Play',
    color: '#EEEDFE',
    textColor: '#3C3489',
    subcategories: ['OTT', '음악', '클라우드', '뉴스', 'AI', '소프트웨어'],
    providers: ['넷플릭스', '유튜브', '디즈니+', '티빙', '왓챠', 'ChatGPT', 'Adobe'],
  },
  rental: {
    label: '렌탈',
    icon: 'Settings',
    color: '#FBEAF0',
    textColor: '#72243E',
    subcategories: ['정수기', '공기청정기', '비데', '안마의자', '렌터카'],
    providers: ['코웨이', '청호나이스', '쿠쿠', '바디프랜드'],
  },
  tax: {
    label: '세금',
    icon: 'Receipt',
    color: '#FCEBEB',
    textColor: '#791F1F',
    subcategories: ['재산세', '자동차세', '종합소득세', '부가세', '주민세'],
    providers: ['국세청', '지방자치단체'],
  },
  penalty: {
    label: '과태료',
    icon: 'AlertTriangle',
    color: '#FFF3E0',
    textColor: '#7C4700',
    subcategories: ['주정차', '속도위반', '신호위반', '환경'],
    providers: [],
  },
  vehicle: {
    label: '차량',
    icon: 'Car',
    color: '#E8F5E9',
    textColor: '#1B5E20',
    subcategories: ['자동차보험', '자동차세', '정기검사', '하이패스'],
    providers: ['삼성화재', '현대해상', '한국도로공사'],
  },
  housing: {
    label: '주거',
    icon: 'Home',
    color: '#F3E5F5',
    textColor: '#4A148C',
    subcategories: ['월세', '전세대출이자', '관리비', '장기수선'],
    providers: [],
  },
  finance: {
    label: '금융',
    icon: 'CreditCard',
    color: '#E0F7FA',
    textColor: '#006064',
    subcategories: ['대출이자', '카드연회비', '적금'],
    providers: [],
  },
  business: {
    label: '사업',
    icon: 'Briefcase',
    color: '#FFF8E1',
    textColor: '#F57F17',
    subcategories: ['도메인', '서버', '클라우드', 'SaaS', '임대료', 'PG'],
    providers: ['AWS', 'GCP', 'Vercel', 'Cloudflare', 'Cafe24'],
  },
  other: {
    label: '기타',
    icon: 'MoreHorizontal',
    color: '#F1EFE8',
    textColor: '#444441',
    subcategories: [],
    providers: [],
  },
}
```

---

## 5. 핵심 비즈니스 로직

### 5.1 월 환산 금액 계산
```typescript
// lib/utils/money.ts
export function toMonthlyAmount(item: ResponsibilityItem): number {
  const { amount, cycle } = item
  const multipliers: Record<PaymentCycle, number> = {
    monthly: 1,
    bimonthly: 0.5,
    quarterly: 1 / 3,
    semiannual: 1 / 6,
    yearly: 1 / 12,
    once: 0,
  }
  return Math.round(amount * (multipliers[cycle] ?? 1))
}

export function toYearlyAmount(item: ResponsibilityItem): number {
  const { amount, cycle } = item
  const multipliers: Record<PaymentCycle, number> = {
    monthly: 12,
    bimonthly: 6,
    quarterly: 4,
    semiannual: 2,
    yearly: 1,
    once: 1,
  }
  return Math.round(amount * (multipliers[cycle] ?? 1))
}
```

### 5.2 D-day 및 상태 계산
```typescript
// lib/utils/date.ts
export function getDaysUntilPayment(item: ResponsibilityItem): number {
  const today = new Date()
  const day = item.dayOfMonth ?? 1
  let target = new Date(today.getFullYear(), today.getMonth(), day)
  if (target <= today) {
    target = new Date(today.getFullYear(), today.getMonth() + 1, day)
  }
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

export function getDaysUntilExpiry(item: ResponsibilityItem): number | null {
  if (!item.contractEndDate) return null
  const diff = Math.ceil(
    (item.contractEndDate.toDate().getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  )
  return diff
}

export function getExpiryStatus(days: number | null): ExpiryStatus {
  if (days === null) return 'none'
  if (days < 0) return 'expired'
  if (days <= 7) return 'critical'
  if (days <= 30) return 'warning'
  if (days <= 90) return 'notice'
  return 'safe'
}

export type ExpiryStatus = 'none' | 'expired' | 'critical' | 'warning' | 'notice' | 'safe'
```

### 5.3 카드 혜택 달성률 계산
```typescript
// lib/utils/card.ts
export function calculateBenefitAchievement(
  card: CreditCard,
  items: ResponsibilityItem[]
): BenefitAchievement[] {
  const cardItems = items.filter(i => i.paymentCardId === card.id && i.status === 'active')
  const monthlyTotal = cardItems.reduce((sum, i) => sum + toMonthlyAmount(i), 0)

  return card.benefits.map(benefit => {
    const required = benefit.conditionAmount ?? 0
    const achieved = Math.min(monthlyTotal, required)
    const rate = required > 0 ? achieved / required : 1
    const estimatedDiscount = rate >= 1
      ? (benefit.discountAmount ?? Math.floor(monthlyTotal * (benefit.discountRate ?? 0)))
      : 0
    const remaining = Math.max(0, required - monthlyTotal)

    return {
      benefitId: benefit.id,
      description: benefit.description,
      required,
      achieved,
      rate,               // 0 ~ 1
      estimatedDiscount,
      remaining,          // 실적 부족 금액
      isAchieved: rate >= 1,
    }
  })
}
```

---

## 6. AI 파싱 인터페이스

### 6.1 텍스트 파싱 API (`/api/ai/parse`)
```typescript
// 요청
interface ParseRequest {
  type: 'text' | 'image'
  content: string          // 텍스트 or base64 이미지
  userId: string
}

// 응답
interface ParseResponse {
  items: Partial<ResponsibilityItem>[]
  confidence: number
  missingFields: string[][]  // 각 항목별 누락 필드
  followUpQuestions: string[] // AI가 묻고 싶은 후속 질문
}
```

### 6.2 AI 파싱 프롬프트 (핵심)
```
당신은 생활 재정 책임 관리 앱의 AI 비서입니다.
사용자가 입력한 텍스트 또는 이미지에서 정기 지출 및 계약 항목을 추출하세요.

추출 대상: 통신, 공과금, 보험, 구독, 렌탈, 세금, 과태료, 차량, 주거, 금융, 사업

각 항목에서 추출해야 할 정보:
- name: 항목명
- category: 카테고리 (telecom/utility/insurance/subscription/rental/tax/penalty/vehicle/housing/finance/business/other)
- provider: 공급 업체명
- amount: 금액 (숫자만)
- cycle: 결제 주기 (monthly/quarterly/yearly 등)
- dayOfMonth: 매월 결제일
- contractEndDate: 계약/약정 종료일 (ISO 날짜)
- autoRenews: 자동갱신 여부
- paymentMethod: 결제 카드/수단
- owner: 명의자

응답은 반드시 순수 JSON 배열만. 마크다운 없이.
신뢰도 낮은 필드는 null로.
```

---

## 7. Firebase 보안 규칙

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;

      match /items/{itemId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
      match /cards/{cardId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
      match /notifications/{notifId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

---

## 8. 환경 변수

```bash
# .env.local
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
FIREBASE_ADMIN_PRIVATE_KEY=
FIREBASE_ADMIN_CLIENT_EMAIL=
ANTHROPIC_API_KEY=
CRON_SECRET=
```

---

## 9. 개발 단계 (Phase)

### Phase 1 — MVP (4주)
- [ ] Firebase Auth (Google 로그인)
- [ ] 항목 CRUD (수동 입력)
- [ ] 메인 대시보드 (총합 + 납부일 임박 + 만료 임박)
- [ ] 카테고리별 뷰
- [ ] AI 텍스트 파싱 입력

### Phase 2 — 확장 (3주)
- [ ] 이미지 업로드 + OCR 파싱
- [ ] 신용카드 등록 + 혜택 달성률 계산
- [ ] 카드별 대시보드
- [ ] 해지·갱신 관리 전용 화면
- [ ] D-day 알림 (이메일/브라우저)

### Phase 3 — 고도화 (3주)
- [ ] AI 대화형 인터페이스 (채팅)
- [ ] 월간·연간 리포트
- [ ] 절약 분석 (중복 구독 탐지, 재약정 절약액)
- [ ] 가족 그룹 관리
- [ ] 사업자 전용 대시보드
