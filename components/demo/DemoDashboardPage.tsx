'use client'
import { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { DEMO_ITEMS, DEMO_CARDS } from '@/lib/demo-data'
import { GreetingHeader } from '@/components/dashboard/GreetingHeader'
import { SummaryMetrics } from '@/components/dashboard/SummaryMetrics'
import { PaymentTimeline } from '@/components/dashboard/PaymentTimeline'
import { CardBenefitPanel } from '@/components/dashboard/CardBenefitPanel'
import { getDaysUntilPayment, getDaysUntilExpiry, toMonthlyAmount } from '@/lib/utils'

// UrgentBanner는 Link href가 /expiry 하드코딩이라 데모용 인라인 버전 사용
import { AlertTriangle, ChevronRight } from 'lucide-react'
import Link from 'next/link'

// CategoryGrid는 Link href가 /categories/:slug 하드코딩이라 데모용 버전 사용
import { CATEGORY_META } from '@/lib/utils/category'
import { fmtMoney } from '@/lib/utils'
import type { CategorySlug } from '@/lib/types'
import * as Icons from 'lucide-react'

function DemoUrgentBanner({ items }: { items: typeof DEMO_ITEMS }) {
  if (items.length === 0) return null
  const first = items[0]
  const days = getDaysUntilExpiry(first)
  return (
    <Link href={`/demo/items/${first.id}`}>
      <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3 hover:bg-red-100 transition-colors">
        <AlertTriangle size={18} className="text-red-500 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-red-700">
            {first.name}이(가) {days !== null && days < 0 ? '이미' : days !== null ? `${days}일 후` : ''} {first.autoRenews ? '자동갱신' : '만료'}됩니다
          </p>
          {items.length > 1 && (
            <p className="text-xs text-red-500 mt-0.5">외 {items.length - 1}건 더 확인하기 →</p>
          )}
        </div>
        <ChevronRight size={16} className="text-red-400 flex-shrink-0" />
      </div>
    </Link>
  )
}

function DemoCategoryGrid({ items }: { items: typeof DEMO_ITEMS }) {
  const byCategory = items.reduce<Record<string, typeof DEMO_ITEMS>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = []
    acc[item.category].push(item)
    return acc
  }, {})

  const categories = (Object.keys(CATEGORY_META) as CategorySlug[])
    .filter(slug => (byCategory[slug]?.length ?? 0) > 0)

  return (
    <div>
      <h2 className="text-sm font-semibold mb-3">카테고리별 현황</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {categories.map(slug => {
          const meta = CATEGORY_META[slug]
          const catItems = byCategory[slug] ?? []
          const monthly = catItems.reduce((s, i) => s + toMonthlyAmount(i), 0)
          const IconComponent = (Icons as any)[meta.icon] ?? Icons.MoreHorizontal
          return (
            <Link
              key={slug}
              href={`/demo/items?category=${slug}`}
              className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: meta.color }}>
                  <IconComponent size={16} style={{ color: meta.textColor }} />
                </div>
                <span className="text-sm font-medium">{meta.label}</span>
              </div>
              <div className="text-base font-semibold tabular-nums">{fmtMoney(monthly)}</div>
              <div className="text-xs text-gray-400 mt-0.5">{catItems.length}건 / 월</div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

export function DemoDashboardPage() {
  const activeItems = DEMO_ITEMS.filter(i => i.status === 'active')
  const monthlyTotal = activeItems.reduce((s, i) => s + toMonthlyAmount(i), 0)
  const urgentPayments = activeItems.filter(i => getDaysUntilPayment(i) <= 7)
  const expiringItems = DEMO_ITEMS.filter(i => {
    const d = getDaysUntilExpiry(i)
    return d !== null && d <= 90
  })
  const urgentExpiry = expiringItems.filter(i => {
    const d = getDaysUntilExpiry(i)
    return d !== null && d <= 7
  })

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <GreetingHeader
        userName="체험 중"
        urgentCount={urgentExpiry.length + urgentPayments.length}
      />

      {urgentExpiry.length > 0 && (
        <DemoUrgentBanner items={urgentExpiry} />
      )}

      <SummaryMetrics
        monthlyTotal={monthlyTotal}
        urgentPaymentCount={urgentPayments.length}
        expiringCount={expiringItems.length}
        cards={DEMO_CARDS}
        items={activeItems}
      />

      <PaymentTimeline items={activeItems} />

      {DEMO_CARDS.length > 0 && (
        <CardBenefitPanel cards={DEMO_CARDS} items={activeItems} />
      )}

      <DemoCategoryGrid items={activeItems} />

      {/* SEO */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-2">
        <h2 className="text-sm font-bold text-gray-700">Life Capsule 대시보드 — 생활비 한눈에 관리</h2>
        <p className="text-xs text-gray-400 leading-relaxed">
          구독·보험·통신비·렌탈·세금·공과금을 등록하면 이번 달 예상 지출, 납부 일정, 만료 임박 항목을 자동으로 계산합니다.
          카드 혜택 달성률, AI 절약 제안, 카테고리별 지출 현황을 한 화면에서 확인하세요.
        </p>
      </div>
    </div>
  )
}
