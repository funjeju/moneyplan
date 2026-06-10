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
import { CategoryDonut } from '@/components/dashboard/CategoryDonut'
import { getDaysUntilPayment, getDaysUntilExpiry, toMonthlyAmount } from '@/lib/utils'

export default function DashboardPage() {
  const { user } = useAuth()
  const { items, isLoading } = useItems()
  const { data: expiringItems = [] } = useExpiringItems()
  const { cards } = useCards()

  const metrics = useMemo(() => {
    const activeItems = items.filter(i => i.status === 'active')
    const monthlyTotal = activeItems.reduce((sum, i) => sum + toMonthlyAmount(i), 0)
    const urgentPayments = activeItems.filter(i => {
      const d = getDaysUntilPayment(i)
      return d !== null && d <= 7
    })
    const urgentExpiry = expiringItems.filter(i => {
      const d = getDaysUntilExpiry(i)
      return d !== null && d <= 7
    })
    // once 항목 중 90일 이내 납부일 도래하는 것도 만료 임박으로 포함
    const onceUpcoming = activeItems.filter(i => {
      if (i.cycle !== 'once') return false
      const d = getDaysUntilPayment(i)
      return d !== null && d >= 0 && d <= 90
    })
    const expiringAll = [
      ...expiringItems,
      ...onceUpcoming.filter(u => !expiringItems.find(e => e.id === u.id)),
    ]
    return { monthlyTotal, urgentPayments, urgentExpiry, activeItems, expiringAll }
  }, [items, expiringItems])

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl h-24 animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <GreetingHeader
        userName={user?.displayName ?? ''}
        urgentCount={metrics.urgentExpiry.length + metrics.urgentPayments.length}
      />

      {metrics.urgentExpiry.length > 0 && (
        <UrgentBanner items={metrics.urgentExpiry} />
      )}

      <SummaryMetrics
        monthlyTotal={metrics.monthlyTotal}
        urgentPaymentCount={metrics.urgentPayments.length}
        expiringCount={metrics.expiringAll.length}
        expiringItems={metrics.expiringAll}
        cards={cards}
        items={items}
      />

      {/* 2컬럼: 왼쪽 도넛 차트, 오른쪽 납부일정+카드혜택 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <CategoryDonut items={metrics.activeItems} />
        <div className="space-y-4">
          <PaymentTimeline items={metrics.activeItems} />
          {cards.length > 0 && (
            <CardBenefitPanel cards={cards} items={items} />
          )}
        </div>
      </div>

      <CategoryGrid items={metrics.activeItems} />

      {items.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-4">📋</div>
          <p className="text-base font-medium">아직 등록된 항목이 없어요</p>
          <p className="text-sm mt-2">아래 AI 입력창에 말하거나 + 버튼으로 추가해보세요</p>
        </div>
      )}
    </div>
  )
}
