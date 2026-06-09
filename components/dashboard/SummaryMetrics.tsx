'use client'
import { TrendingUp, Clock, AlertTriangle, CreditCard } from 'lucide-react'
import { calculateBenefitAchievement } from '@/lib/utils/card'
import { fmtMoney, toMonthlyAmount } from '@/lib/utils'
import type { ResponsibilityItem, CreditCard as CardType } from '@/lib/types'

interface Props {
  monthlyTotal: number
  urgentPaymentCount: number
  expiringCount: number
  cards: CardType[]
  items: ResponsibilityItem[]
}

function fmtMixedTotals(items: ResponsibilityItem[]): string {
  const map: Record<string, number> = {}
  items.forEach(i => {
    const cur = i.currency ?? 'KRW'
    map[cur] = (map[cur] ?? 0) + toMonthlyAmount(i)
  })
  return Object.entries(map)
    .map(([cur, amt]) => fmtMoney(amt, cur))
    .join(' + ')
}

export function SummaryMetrics({ monthlyTotal, urgentPaymentCount, expiringCount, cards, items }: Props) {
  const topCardAchievement = cards.reduce((best, card) => {
    const achievements = calculateBenefitAchievement(card, items)
    const topRate = Math.max(...achievements.map(a => a.rate), 0)
    return topRate > best.rate ? { card, rate: topRate } : best
  }, { card: null as CardType | null, rate: 0 })

  const activeItems = items.filter(i => i.status === 'active')
  const mixedTotal = fmtMixedTotals(activeItems)

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <MetricCard
        icon={<TrendingUp size={18} className="text-[#6C63FF]" />}
        label="이번달 지출 예정"
        value={mixedTotal || fmtMoney(monthlyTotal)}
        sub="등록 항목 기준"
      />
      <MetricCard
        icon={<Clock size={18} className="text-[#6C63FF]" />}
        label="7일 내 납부"
        value={`${urgentPaymentCount}건`}
        sub="납부 예정"
        accent={urgentPaymentCount > 0 ? 'warning' : undefined}
      />
      <MetricCard
        icon={<AlertTriangle size={18} className="text-red-500" />}
        label="만료 임박"
        value={`${expiringCount}건`}
        sub="90일 이내"
        accent={expiringCount > 0 ? 'danger' : undefined}
      />
      <MetricCard
        icon={<CreditCard size={18} className="text-green-500" />}
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
    warning: 'border-orange-200 bg-orange-50',
    danger: 'border-red-200 bg-red-50',
    success: 'border-green-200 bg-green-50',
  }[accent as string] ?? ''

  return (
    <div className={`bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow ${accentClass}`}>
      <div className="flex items-center gap-1.5 mb-3">
        {icon}
        <span className="text-xs text-gray-400">{label}</span>
      </div>
      <div className="text-2xl font-semibold tracking-tight tabular-nums mb-1">{value}</div>
      <div className="text-xs text-gray-400">{sub}</div>
    </div>
  )
}
