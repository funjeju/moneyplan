# Life Responsibility OS — pages.md
> 주요 페이지 컴포넌트 구현 가이드 (Next.js App Router)

---

## 1. 프로젝트 초기 설정

```bash
# 프로젝트 생성
npx create-next-app@latest life-responsibility-os \
  --typescript --tailwind --eslint --app --src-dir=false

# shadcn/ui 초기화
npx shadcn-ui@latest init
# → style: default, baseColor: slate, cssVariables: yes

# 필수 shadcn 컴포넌트 추가
npx shadcn-ui@latest add button card dialog input select \
  badge progress tabs sheet drawer toast command \
  calendar popover separator skeleton scroll-area

# 추가 패키지
npm install firebase firebase-admin @anthropic-ai/sdk \
  @tanstack/react-query zustand lucide-react \
  react-countup date-fns class-variance-authority
```

---

## 2. 루트 레이아웃 (`app/layout.tsx`)

```tsx
import type { Metadata } from 'next'
import { Providers } from '@/components/Providers'
import './globals.css'

export const metadata: Metadata = {
  title: 'Life Responsibility OS',
  description: '생활 재정 책임 관리 플랫폼',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  themeColor: '#6C63FF',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css"
        />
      </head>
      <body className="font-sans bg-surface antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
```

---

## 3. Providers (`components/Providers.tsx`)

```tsx
'use client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/contexts/AuthContext'
import { Toaster } from '@/components/ui/toaster'
import { useState } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
  }))

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  )
}
```

---

## 4. 대시보드 레이아웃 (`app/(dashboard)/layout.tsx`)

```tsx
import { Sidebar } from '@/components/layout/Sidebar'
import { BottomNav } from '@/components/layout/BottomNav'
import { AIInputBar } from '@/components/ai/AIInputBar'
import { AuthGuard } from '@/components/auth/AuthGuard'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-surface-secondary">
        {/* 데스크탑 사이드바 */}
        <Sidebar className="hidden lg:flex" />

        {/* 메인 콘텐츠 */}
        <main className="flex-1 lg:ml-64 pb-24 lg:pb-8">
          {children}
        </main>

        {/* 모바일 하단 네비게이션 */}
        <BottomNav className="lg:hidden" />

        {/* AI 입력바 (모바일: 하단 고정, 데스크탑: 사이드 패널) */}
        <AIInputBar />
      </div>
    </AuthGuard>
  )
}
```

---

## 5. 메인 대시보드 (`app/(dashboard)/page.tsx`)

```tsx
'use client'
import { useMemo } from 'react'
import { useItems, useExpiringItems } from '@/hooks/useItems'
import { useCards } from '@/hooks/useCards'
import { useAuth } from '@/hooks/useAuth'
import { GreetingHeader } from '@/components/dashboard/GreetingHeader'
import { SummaryMetrics } from '@/components/dashboard/SummaryMetrics'
import { UrgentBanner } from '@/components/dashboard/UrgentBanner'
import { PaymentTimeline } from '@/components/dashboard/PaymentTimeline'
import { CardBenefitPanel } from '@/components/dashboard/CardBenefitPanel'
import { CategoryGrid } from '@/components/dashboard/CategoryGrid'
import { toMonthlyAmount, getDaysUntilPayment, getDaysUntilExpiry } from '@/lib/utils'

export default function DashboardPage() {
  const { user } = useAuth()
  const { items, isLoading } = useItems()
  const { data: expiringItems = [] } = useExpiringItems()
  const { cards } = useCards()

  const metrics = useMemo(() => {
    const activeItems = items.filter(i => i.status === 'active')
    const monthlyTotal = activeItems.reduce((sum, i) => sum + toMonthlyAmount(i), 0)
    const urgentPayments = activeItems.filter(i => getDaysUntilPayment(i) <= 7)
    const urgentExpiry = expiringItems.filter(i => {
      const d = getDaysUntilExpiry(i)
      return d !== null && d <= 7
    })

    return { monthlyTotal, urgentPayments, urgentExpiry, activeItems }
  }, [items, expiringItems])

  if (isLoading) return <DashboardSkeleton />

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <GreetingHeader
        userName={user?.displayName ?? ''}
        urgentCount={metrics.urgentExpiry.length + metrics.urgentPayments.length}
      />

      {/* 긴급 알림 배너 */}
      {metrics.urgentExpiry.length > 0 && (
        <UrgentBanner items={metrics.urgentExpiry} />
      )}

      {/* 요약 메트릭 */}
      <SummaryMetrics
        monthlyTotal={metrics.monthlyTotal}
        urgentPaymentCount={metrics.urgentPayments.length}
        expiringCount={expiringItems.length}
        cards={cards}
        items={items}
      />

      {/* 이번달 납부 타임라인 */}
      <PaymentTimeline items={metrics.activeItems} />

      {/* 카드 혜택 현황 */}
      {cards.length > 0 && (
        <CardBenefitPanel cards={cards} items={items} />
      )}

      {/* 카테고리 요약 */}
      <CategoryGrid items={metrics.activeItems} />
    </div>
  )
}
```

---

## 6. SummaryMetrics 컴포넌트 (`components/dashboard/SummaryMetrics.tsx`)

```tsx
'use client'
import CountUp from 'react-countup'
import { TrendingUp, Clock, AlertTriangle, CreditCard } from 'lucide-react'
import { calculateBenefitAchievement } from '@/lib/utils/card'
import type { ResponsibilityItem, CreditCard as CardType } from '@/lib/types'

interface Props {
  monthlyTotal: number
  urgentPaymentCount: number
  expiringCount: number
  cards: CardType[]
  items: ResponsibilityItem[]
}

export function SummaryMetrics({ monthlyTotal, urgentPaymentCount, expiringCount, cards, items }: Props) {
  // 최고 달성률 카드 계산
  const topCardAchievement = cards.reduce((best, card) => {
    const achievements = calculateBenefitAchievement(card, items)
    const topRate = Math.max(...achievements.map(a => a.rate), 0)
    return topRate > best.rate ? { card, rate: topRate } : best
  }, { card: null as CardType | null, rate: 0 })

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <MetricCard
        icon={<TrendingUp size={18} className="text-primary" />}
        label="이번달 지출 예정"
        value={<><CountUp end={monthlyTotal} separator="," duration={0.8} />원</>}
        sub="등록 항목 기준"
      />
      <MetricCard
        icon={<Clock size={18} className="text-primary" />}
        label="7일 내 납부"
        value={`${urgentPaymentCount}건`}
        sub="납부 예정"
        accent={urgentPaymentCount > 0 ? 'warning' : undefined}
      />
      <MetricCard
        icon={<AlertTriangle size={18} className="text-danger" />}
        label="만료 임박"
        value={`${expiringCount}건`}
        sub="90일 이내"
        accent={expiringCount > 0 ? 'danger' : undefined}
      />
      <MetricCard
        icon={<CreditCard size={18} className="text-success" />}
        label="최고 카드 실적"
        value={topCardAchievement.card
          ? `${Math.round(topCardAchievement.rate * 100)}%`
          : '카드 미등록'}
        sub={topCardAchievement.card?.name ?? '카드를 등록해보세요'}
        accent={topCardAchievement.rate >= 1 ? 'success' : undefined}
      />
    </div>
  )
}

function MetricCard({ icon, label, value, sub, accent }: {
  icon: React.ReactNode
  label: string
  value: React.ReactNode
  sub: string
  accent?: 'warning' | 'danger' | 'success'
}) {
  const accentClass = {
    warning: 'border-warning/30 bg-warning/5',
    danger: 'border-danger/30 bg-danger/5',
    success: 'border-success/30 bg-success/5',
  }[accent ?? ''] ?? ''

  return (
    <div className={`bg-white rounded-2xl p-4 border border-border shadow-card transition-shadow hover:shadow-card-hover ${accentClass}`}>
      <div className="flex items-center gap-1.5 mb-3">
        {icon}
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <div className="text-2xl font-semibold tracking-tight tabular-nums mb-1">{value}</div>
      <div className="text-xs text-muted-foreground">{sub}</div>
    </div>
  )
}
```

---

## 7. 항목 카드 (`components/items/ItemCard.tsx`)

```tsx
'use client'
import { CategoryBadge } from '@/components/shared/CategoryBadge'
import { DayBadge } from '@/components/shared/DayBadge'
import { CATEGORY_META } from '@/lib/utils/category'
import { getDaysUntilPayment, getDaysUntilExpiry, toMonthlyAmount, fmtMoney, fmtDate } from '@/lib/utils'
import type { ResponsibilityItem } from '@/lib/types'
import * as Icons from 'lucide-react'

interface Props {
  item: ResponsibilityItem
  onClick?: () => void
}

export function ItemCard({ item, onClick }: Props) {
  const meta = CATEGORY_META[item.category]
  const IconComponent = (Icons as any)[meta.icon] ?? Icons.MoreHorizontal
  const daysUntilPayment = getDaysUntilPayment(item)
  const daysUntilExpiry = getDaysUntilExpiry(item)

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl p-4 border border-border shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all cursor-pointer"
    >
      {/* 헤더 */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: meta.color }}
          >
            <IconComponent size={18} style={{ color: meta.textColor }} />
          </div>
          <div>
            <p className="text-sm font-medium leading-tight">{item.name}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {[item.owner, item.paymentMethod].filter(Boolean).join(' · ')}
            </p>
          </div>
        </div>
        <CategoryBadge category={item.category} />
      </div>

      {/* 본문 */}
      <div className="space-y-1.5 text-xs">
        {item.memo && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">메모</span>
            <span className="text-foreground font-medium truncate max-w-[160px]">{item.memo}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-muted-foreground">결제</span>
          <span className="text-foreground font-medium">
            {CYCLE_LABELS[item.cycle]} {item.dayOfMonth}일
          </span>
        </div>
        {daysUntilExpiry !== null && (
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">약정 만료</span>
            <div className="flex items-center gap-1.5">
              <span className="font-medium">{fmtDate(item.contractEndDate)}</span>
              {daysUntilExpiry <= 90 && (
                <ExpiryMiniTag days={daysUntilExpiry} />
              )}
            </div>
          </div>
        )}
      </div>

      {/* 푸터 */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
        <span className="text-base font-semibold tabular-nums">{fmtMoney(item.amount)}</span>
        <DayBadge days={daysUntilPayment} type="payment" />
      </div>
    </div>
  )
}

function ExpiryMiniTag({ days }: { days: number }) {
  if (days < 0) return <span className="text-xs text-danger font-medium">만료됨</span>
  if (days <= 30) return <span className="text-xs text-warning font-medium">{days}일 후</span>
  return <span className="text-xs text-muted-foreground">{days}일 후</span>
}

const CYCLE_LABELS: Record<string, string> = {
  monthly: '매월', bimonthly: '2개월', quarterly: '분기',
  semiannual: '반기', yearly: '매년', once: '일회',
}
```

---

## 8. 해지·만료 관리 페이지 (`app/(dashboard)/expiry/page.tsx`)

```tsx
'use client'
import { useMemo } from 'react'
import { useItems } from '@/hooks/useItems'
import { getDaysUntilExpiry, getDaysUntilPayment } from '@/lib/utils'
import { ItemCard } from '@/components/items/ItemCard'
import { AlertTriangle, Clock, Calendar, RefreshCw, SkipBack } from 'lucide-react'

export default function ExpiryPage() {
  const { items } = useItems()

  const groups = useMemo(() => {
    const withExpiry = items.filter(i => i.contractEndDate)
    const days = (i: any) => getDaysUntilExpiry(i) ?? Infinity

    return {
      critical: withExpiry.filter(i => { const d = days(i); return d >= 0 && d <= 7 }),
      warning:  withExpiry.filter(i => { const d = days(i); return d > 7 && d <= 30 }),
      notice:   withExpiry.filter(i => { const d = days(i); return d > 30 && d <= 90 }),
      autoRenew: withExpiry.filter(i => i.autoRenews && days(i) <= 90 && days(i) >= 0),
      expired:  withExpiry.filter(i => days(i) < 0),
    }
  }, [items])

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-8">
      <div>
        <h1 className="text-xl font-semibold">해지·만료 관리</h1>
        <p className="text-sm text-muted-foreground mt-1">약정 종료 및 자동갱신 예정 항목을 관리하세요</p>
      </div>

      <ExpirySection
        icon={<AlertTriangle size={18} className="text-danger" />}
        title="즉시 처리 필요"
        subtitle="7일 이내 만료"
        items={groups.critical}
        emptyMsg="긴급 처리 항목이 없어요 ✅"
        accent="danger"
      />

      <ExpirySection
        icon={<Clock size={18} className="text-warning" />}
        title="이번달 처리 예정"
        subtitle="30일 이내 만료"
        items={groups.warning}
        emptyMsg="이번달 만료 항목이 없어요"
        accent="warning"
      />

      <ExpirySection
        icon={<Calendar size={18} className="text-primary" />}
        title="3개월 이내"
        subtitle="90일 이내 만료"
        items={groups.notice}
        emptyMsg="3개월 내 만료 항목이 없어요"
      />

      {groups.autoRenew.length > 0 && (
        <ExpirySection
          icon={<RefreshCw size={18} className="text-orange-500" />}
          title="⚠️ 자동갱신 주의"
          subtitle="자동갱신 예정 — 해지 원하면 미리 신청하세요"
          items={groups.autoRenew}
          accent="warning"
        />
      )}

      {groups.expired.length > 0 && (
        <ExpirySection
          icon={<SkipBack size={18} className="text-muted-foreground" />}
          title="이미 만료됨"
          subtitle="처리 또는 보관이 필요한 항목"
          items={groups.expired}
          accent="muted"
        />
      )}
    </div>
  )
}

function ExpirySection({ icon, title, subtitle, items, emptyMsg, accent }: {
  icon: React.ReactNode
  title: string
  subtitle: string
  items: any[]
  emptyMsg?: string
  accent?: string
}) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <div>
          <h2 className="text-sm font-semibold">{title}</h2>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
        {items.length > 0 && (
          <span className="ml-auto text-xs bg-surface-secondary px-2 py-0.5 rounded-full">
            {items.length}건
          </span>
        )}
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">{emptyMsg}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {items.map(item => <ItemCard key={item.id} item={item} />)}
        </div>
      )}
    </section>
  )
}
```

---

## 9. 카테고리 페이지 (`app/(dashboard)/categories/[slug]/page.tsx`)

```tsx
'use client'
import { useMemo } from 'react'
import { useParams } from 'next/navigation'
import { useItems } from '@/hooks/useItems'
import { CATEGORY_META } from '@/lib/utils/category'
import { toMonthlyAmount, toYearlyAmount, fmtMoney } from '@/lib/utils'
import { ItemCard } from '@/components/items/ItemCard'
import type { CategorySlug } from '@/lib/types'

export default function CategoryPage() {
  const { slug } = useParams<{ slug: CategorySlug }>()
  const meta = CATEGORY_META[slug]
  const { items } = useItems(slug)

  const stats = useMemo(() => ({
    count: items.length,
    monthlyTotal: items.reduce((s, i) => s + toMonthlyAmount(i), 0),
    yearlyTotal: items.reduce((s, i) => s + toYearlyAmount(i), 0),
    expiringSoon: items.filter(i => {
      if (!i.contractEndDate) return false
      const d = Math.ceil((new Date(i.contractEndDate as any).getTime() - Date.now()) / 86400000)
      return d >= 0 && d <= 90
    }).length,
  }), [items])

  if (!meta) return <div>카테고리를 찾을 수 없습니다</div>

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* 헤더 */}
      <div
        className="rounded-2xl p-6 mb-6"
        style={{ background: meta.color }}
      >
        <p className="text-sm font-medium mb-1" style={{ color: meta.textColor }}>
          {meta.label}
        </p>
        <p className="text-3xl font-bold tabular-nums" style={{ color: meta.textColor }}>
          {fmtMoney(stats.monthlyTotal)}<span className="text-lg font-medium">/월</span>
        </p>
        <p className="text-sm mt-1" style={{ color: meta.textColor + '99' }}>
          연간 {fmtMoney(stats.yearlyTotal)} 예상
        </p>
      </div>

      {/* 요약 메트릭 */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white rounded-xl p-3 border border-border text-center">
          <div className="text-xl font-semibold">{stats.count}</div>
          <div className="text-xs text-muted-foreground">등록 항목</div>
        </div>
        <div className="bg-white rounded-xl p-3 border border-border text-center">
          <div className="text-xl font-semibold tabular-nums">{fmtMoney(stats.monthlyTotal)}</div>
          <div className="text-xs text-muted-foreground">월 지출</div>
        </div>
        <div className={`rounded-xl p-3 border text-center ${stats.expiringSoon > 0 ? 'bg-warning/10 border-warning/30' : 'bg-white border-border'}`}>
          <div className="text-xl font-semibold">{stats.expiringSoon}</div>
          <div className="text-xs text-muted-foreground">만료 임박</div>
        </div>
      </div>

      {/* 항목 목록 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {items.map(item => <ItemCard key={item.id} item={item} />)}
      </div>

      {items.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <div className="text-4xl mb-3">📭</div>
          <p className="text-sm">{meta.label} 항목이 없어요</p>
          <p className="text-xs mt-1">AI에게 말하거나 직접 추가해보세요</p>
        </div>
      )}
    </div>
  )
}
```

---

## 10. 공통 유틸 (`lib/utils/index.ts`)

```typescript
import type { ResponsibilityItem } from '@/lib/types'

export function fmtMoney(n: number): string {
  return n.toLocaleString('ko-KR') + '원'
}

export function fmtDate(ts: any): string {
  if (!ts) return ''
  const d = ts.toDate ? ts.toDate() : new Date(ts)
  return `${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()}`
}

export function toMonthlyAmount(item: ResponsibilityItem): number {
  const m: Record<string, number> = {
    monthly: 1, bimonthly: 0.5, quarterly: 1/3,
    semiannual: 1/6, yearly: 1/12, once: 0,
  }
  return Math.round(item.amount * (m[item.cycle] ?? 1))
}

export function toYearlyAmount(item: ResponsibilityItem): number {
  const m: Record<string, number> = {
    monthly: 12, bimonthly: 6, quarterly: 4,
    semiannual: 2, yearly: 1, once: 1,
  }
  return Math.round(item.amount * (m[item.cycle] ?? 1))
}

export function getDaysUntilPayment(item: ResponsibilityItem): number {
  const today = new Date()
  const day = item.dayOfMonth ?? 1
  let target = new Date(today.getFullYear(), today.getMonth(), day)
  if (target <= today) target = new Date(today.getFullYear(), today.getMonth() + 1, day)
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

export function getDaysUntilExpiry(item: ResponsibilityItem): number | null {
  if (!item.contractEndDate) return null
  const d = item.contractEndDate as any
  const date = d.toDate ? d.toDate() : new Date(d)
  return Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
}
```
