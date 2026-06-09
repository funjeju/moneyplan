# Life Responsibility OS — design.md
> UI/UX 디자인 시스템 및 컴포넌트 가이드

---

## 1. 디자인 철학

Life Responsibility OS는 금융 앱이 아니다. **생활 비서**다.

사용자가 앱을 열었을 때 느껴야 하는 감정:
> ❌ "관리해야 할 것이 많다"
> ✅ "다행이다. 얘가 기억하고 있네."

### 핵심 키워드
**추구:** Calm · Friendly · Personal · Trustworthy · Organized · Human

**절대 금지:** Corporate · Enterprise · Complex · Technical · Financial Trading · Admin Tool

### 레퍼런스 비율
- **70%** 여행 플래너 스타일 (Airbnb, TripAdvisor)
- **30%** 현대 SaaS 대시보드 (Linear, Notion)
- **0%** 금융 대시보드 (절대 참고하지 않는다)

---

## 2. 컬러 시스템

```css
:root {
  /* Brand */
  --color-primary: #6C63FF;
  --color-primary-hover: #5A52E8;
  --color-primary-light: #EEEDFE;
  --color-secondary: #8B7DFF;
  --color-accent: #FFB84D;

  /* Semantic */
  --color-success: #32C48D;
  --color-success-light: #E6F7F1;
  --color-warning: #FFB84D;
  --color-warning-light: #FFF5E0;
  --color-danger: #FF6B6B;
  --color-danger-light: #FFEEEE;
  --color-info: #4A90D9;
  --color-info-light: #E8F3FC;

  /* Background */
  --color-bg-base: #F8F9FC;
  --color-bg-card: #FFFFFF;
  --color-bg-secondary: #F3F4F8;
  --color-bg-hover: #F0F1F6;

  /* Border */
  --color-border: #ECEFF5;
  --color-border-strong: #D8DCE8;

  /* Text */
  --color-text-primary: #1A1D29;
  --color-text-secondary: #6B7280;
  --color-text-tertiary: #9CA3AF;
  --color-text-disabled: #C4C9D4;

  /* Category Colors */
  --cat-telecom-bg: #E6F1FB;      --cat-telecom-text: #0C447C;
  --cat-utility-bg: #EAF3DE;      --cat-utility-text: #27500A;
  --cat-insurance-bg: #FAEEDA;    --cat-insurance-text: #633806;
  --cat-subscription-bg: #EEEDFE; --cat-subscription-text: #3C3489;
  --cat-rental-bg: #FBEAF0;       --cat-rental-text: #72243E;
  --cat-tax-bg: #FCEBEB;          --cat-tax-text: #791F1F;
  --cat-penalty-bg: #FFF3E0;      --cat-penalty-text: #7C4700;
  --cat-vehicle-bg: #E8F5E9;      --cat-vehicle-text: #1B5E20;
  --cat-housing-bg: #F3E5F5;      --cat-housing-text: #4A148C;
  --cat-finance-bg: #E0F7FA;      --cat-finance-text: #006064;
  --cat-business-bg: #FFF8E1;     --cat-business-text: #F57F17;
  --cat-other-bg: #F1EFE8;        --cat-other-text: #444441;
}
```

---

## 3. 타이포그래피

```css
/* Font: Pretendard (한국어) + Inter (숫자/영문) */
@import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css');

:root {
  --font-sans: 'Pretendard', 'Inter', -apple-system, sans-serif;

  /* Scale */
  --text-xs: 11px;    line-height: 1.4;
  --text-sm: 13px;    line-height: 1.5;
  --text-base: 15px;  line-height: 1.6;
  --text-lg: 17px;    line-height: 1.5;
  --text-xl: 20px;    line-height: 1.4;
  --text-2xl: 24px;   line-height: 1.3;
  --text-3xl: 30px;   line-height: 1.2;

  /* Money amounts: tabular-nums for alignment */
  --font-mono: 'Pretendard', monospace;
  font-variant-numeric: tabular-nums;
}

/* 금액 표시는 항상 */
.amount { font-variant-numeric: tabular-nums; letter-spacing: -0.02em; }
```

---

## 4. 스페이싱 & 보더

```css
:root {
  /* Spacing */
  --space-1: 4px;   --space-2: 8px;   --space-3: 12px;
  --space-4: 16px;  --space-5: 20px;  --space-6: 24px;
  --space-8: 32px;  --space-10: 40px; --space-12: 48px;

  /* Border Radius */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 20px;
  --radius-2xl: 24px;   /* 카드 */
  --radius-full: 9999px; /* 뱃지, 칩 */

  /* Shadow */
  --shadow-xs: 0 1px 2px rgba(0,0,0,0.04);
  --shadow-sm: 0 2px 8px rgba(0,0,0,0.06);
  --shadow-md: 0 4px 16px rgba(0,0,0,0.08);
  --shadow-lg: 0 8px 32px rgba(0,0,0,0.10);
  --shadow-card: 0 2px 12px rgba(108,99,255,0.06), 0 1px 3px rgba(0,0,0,0.04);
}
```

---

## 5. 레이아웃 시스템

### 모바일 우선 레이아웃
```
Mobile (< 768px)
├── Bottom Navigation (5개 탭)
├── Full-width 카드
└── 단일 컬럼 레이아웃

Tablet (768px ~ 1024px)
├── Side Navigation (아이콘만)
├── 2컬럼 카드 그리드
└── 콘텐츠 영역 확장

Desktop (> 1024px)
├── Side Navigation (아이콘 + 레이블)
├── 3~4컬럼 카드 그리드
└── 우측 패널 (상세 + AI)
```

### 네비게이션 구조
```
모바일 바텀 탭:
[🏠 홈] [📋 항목] [💳 카드] [⚠️ 만료] [⚙️ 설정]

사이드바:
├── 홈 (전체 대시보드)
├── 전체 항목
├── 카테고리
│   ├── 통신
│   ├── 공과금
│   ├── 보험
│   ├── 구독
│   ├── 렌탈
│   ├── 세금
│   ├── 과태료
│   ├── 차량
│   ├── 주거
│   ├── 금융
│   └── 사업
├── 카드 관리
├── 해지·만료 관리
├── 리포트
└── 설정
```

---

## 6. 컴포넌트 가이드

### 6.1 Summary Metric Card (핵심 지표)
```tsx
// 사용 원칙: 숫자보다 맥락을 보여준다
// ✅ Good: "D-7 자동차보험 갱신"
// ❌ Bad:  "보험 6건"

<MetricCard
  label="이번달 지출 예정"
  value="183,000원"
  sub="3건 납부 예정"
  trend={{ type: 'increase', amount: 12000, label: '전월 대비' }}
  accent="warning"
/>
```

**스펙:**
- Border-radius: 20px
- Padding: 20px 24px
- Background: white
- Shadow: --shadow-card
- Hover: translateY(-1px) + shadow 강화
- 애니메이션: 150ms ease-out

### 6.2 Item Card (항목 카드)
```tsx
<ItemCard
  item={item}
  showDaysUntilPayment
  showExpiryBadge
  onClick={openDetail}
/>
```

**레이아웃:**
```
┌────────────────────────────────────────┐
│ [아이콘] 항목명           [카테고리 뱃지] │
│         부제 (명의 · 카드명)             │
│ ─────────────────────────────────────  │
│ 메모: ...                               │
│ 결제: 매월 25일                         │
│ 약정: 2026.03.01 (만료 89일 전 🟡)     │
│ ─────────────────────────────────────  │
│ 33,000원              ⚡ 7일 후 납부   │
└────────────────────────────────────────┘
```

### 6.3 카테고리 뱃지
```tsx
// Pill 형태, 카테고리 색상 적용
<CategoryBadge category="insurance" />
// → 🛡️ 보험 (배경: #FAEEDA, 텍스트: #633806)
```

### 6.4 D-day 뱃지 (납부일/만료일)
```tsx
// 납부일 기준
type DayBadgeVariant = 'critical' | 'warning' | 'notice' | 'safe' | 'overdue'

// 시각적 기준
// critical (≤3일): 빨간 배경 + 강조
// warning  (≤7일): 주황 배경 + 번개 아이콘
// notice  (≤14일): 초록 배경
// safe    (>14일): 회색 배경

<DayBadge daysUntil={7} type="payment" />   // ⚡ 7일 후
<DayBadge daysUntil={30} type="expiry" />   // 만료 30일 전
<DayBadge daysUntil={-3} type="expiry" />   // 🔴 만료됨
```

### 6.5 카드 혜택 달성 바
```tsx
<BenefitProgress
  description="월 30만 이상 시 통신비 1만원 할인"
  required={300000}
  achieved={248000}
  discount={10000}
/>
// → [████████░░] 82% (52,000원 더 쓰면 달성)
```

### 6.6 AI 입력 인터페이스
```tsx
// 홈 하단 고정 또는 플로팅 버튼
<AIInputBar
  placeholder="무엇을 도와드릴까요? (예: SKT 약정 언제 끝나?)"
  onSubmit={handleAIQuery}
  onImageUpload={handleImageUpload}
  onVoice={handleVoice}
/>
```

---

## 7. 페이지별 레이아웃

### 7.1 홈 (메인 대시보드) 레이아웃 순서
```
1. 인사 영역
   └── "안녕하세요, 홍길동님 👋  이번달 아직 놓치지 않으셨어요."

2. 긴급 알림 배너 (있을 때만)
   └── "⚠️ SKT 약정이 3일 후 종료됩니다 — 지금 확인"

3. 월간 요약 메트릭 (4개)
   ├── 이번달 지출 예정
   ├── 이번달 남은 납부 건수
   ├── 30일 내 만료 항목
   └── 카드 혜택 달성 현황

4. 이번달 납부 타임라인
   └── 오늘 ~ 월말 순서로 항목 나열

5. 카드 혜택 달성 현황
   └── 등록 카드별 실적 달성률

6. 카테고리 요약
   └── 12개 카테고리 그리드, 각 카테고리 월 지출 표시

7. AI 입력바 (하단 고정)
```

### 7.2 카테고리 대시보드 (`/categories/[slug]`)
```
1. 카테고리 헤더 (색상 + 아이콘 + 총 월 지출)
2. 요약 메트릭 (항목 수, 월 지출, 연간 지출, 만료 임박)
3. 서브카테고리 필터 탭
4. 항목 카드 목록 (납부일 순)
5. 이 카테고리 절약 팁 (있을 때)
```

### 7.3 카드 대시보드 (`/cards/[id]`)
```
1. 카드 시각화 (실제 카드처럼)
2. 이번달 실적 현황
   ├── 총 실적: 248,000원 / 300,000원 목표
   └── 진행 바
3. 혜택별 달성률
4. 이 카드로 결제 중인 항목 목록
5. 절약 시뮬레이션
   └── "이 항목을 이 카드로 옮기면 월 X원 추가 절약"
```

### 7.4 해지·만료 관리 (`/expiry`)
```
1. 긴급 처리 필요 (7일 이내)
2. 이번달 (30일 이내)
3. 3개월 이내
4. 자동갱신 주의 항목
   └── autoRenews: true 항목 중 90일 내 약정 종료
5. 이미 만료됨 (처리 필요)
```

---

## 8. 아이콘 시스템

**사용 라이브러리:** `lucide-react`

```typescript
// 카테고리 아이콘
import {
  Smartphone,      // 통신
  Zap,             // 공과금
  Shield,          // 보험
  Play,            // 구독
  Settings,        // 렌탈
  Receipt,         // 세금
  AlertTriangle,   // 과태료
  Car,             // 차량
  Home,            // 주거
  CreditCard,      // 금융
  Briefcase,       // 사업
  MoreHorizontal,  // 기타
} from 'lucide-react'

// UI 액션 아이콘
import {
  Plus, Edit2, Trash2, X, Check,
  Upload, Camera, Mic, MessageCircle,
  Bell, BellOff, ChevronRight,
  TrendingUp, TrendingDown,
  Calendar, Clock, AlertCircle,
  Sparkles,  // AI 입력
} from 'lucide-react'
```

**아이콘 스타일 원칙:**
- Stroke width: 1.5px (기본), 2px (강조)
- Size: 16px (인라인), 20px (카드), 24px (헤더), 32px (빈 상태)
- 기술적이거나 각진 아이콘 금지

---

## 9. 애니메이션

```css
/* 기본 트랜지션 */
.transition-fast    { transition: all 150ms ease-out; }
.transition-base    { transition: all 200ms ease-out; }
.transition-slow    { transition: all 300ms ease-out; }

/* 카드 hover */
.card-hover:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

/* 페이지 진입 */
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}
.animate-in { animation: fadeInUp 200ms ease-out; }

/* 금액 카운트업 */
/* react-countup 사용 권장 */

/* AI 로딩 점 */
@keyframes pulse { 0%,100% { opacity:0.3 } 50% { opacity:1 } }
```

**금지 애니메이션:** Bounce, Flash, Elastic, Shake

---

## 10. 빈 상태 (Empty State)

```tsx
// 항목 없음
<EmptyState
  icon={<Inbox size={40} />}
  title="아직 등록된 항목이 없어요"
  description="AI에게 말하거나, 영수증을 찍어서 시작해보세요"
  action={<Button>AI로 입력하기</Button>}
/>

// 만료 없음
<EmptyState
  icon={<CheckCircle size={40} color="var(--color-success)" />}
  title="곧 만료될 항목이 없어요"
  description="모든 계약이 안전합니다 ✅"
/>
```

---

## 11. shadcn/ui 컴포넌트 사용 지침

```bash
# 사용할 컴포넌트
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add input
npx shadcn-ui@latest add select
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add progress
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add sheet       # 모바일 사이드바
npx shadcn-ui@latest add drawer      # 모바일 상세 패널
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add command     # AI 검색 인터페이스
npx shadcn-ui@latest add calendar    # 납부일 캘린더
npx shadcn-ui@latest add popover
npx shadcn-ui@latest add separator
npx shadcn-ui@latest add skeleton    # 로딩 상태
```

**커스터마이징 원칙:**
- shadcn 기본 스타일 위에 디자인 토큰 덮어쓰기
- `components.json`에서 `cssVariables: true` 사용
- 모든 버튼 radius: `--radius-full` (pill 형태)
- 모든 카드 radius: `--radius-2xl`

---

## 12. Tailwind 커스텀 설정

```javascript
// tailwind.config.ts
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#6C63FF', hover: '#5A52E8', light: '#EEEDFE' },
        surface: { DEFAULT: '#FFFFFF', secondary: '#F8F9FC', tertiary: '#F3F4F8' },
      },
      borderRadius: {
        card: '24px',
        badge: '9999px',
      },
      boxShadow: {
        card: '0 2px 12px rgba(108,99,255,0.06), 0 1px 3px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 20px rgba(108,99,255,0.10), 0 2px 6px rgba(0,0,0,0.06)',
      },
      fontFamily: {
        sans: ['Pretendard', 'Inter', '-apple-system', 'sans-serif'],
      },
    },
  },
}
```
