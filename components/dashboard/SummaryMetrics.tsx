'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TrendingUp, Clock, AlertTriangle, CreditCard, ArrowRight, X } from 'lucide-react'
import { calculateBenefitAchievement } from '@/lib/utils/card'
import { fmtMoney, toMonthlyAmount, getDaysUntilPayment, getDaysUntilExpiry } from '@/lib/utils'
import { CATEGORY_META } from '@/lib/utils/category'
import { CategoryBadge } from '@/components/shared/CategoryBadge'
import type { ResponsibilityItem, CreditCard as CardType } from '@/lib/types'

interface Props {
  monthlyTotal: number
  urgentPaymentCount: number
  expiringCount: number
  expiringItems: ResponsibilityItem[]
  cards: CardType[]
  items: ResponsibilityItem[]
}

function fmtMixedTotals(items: ResponsibilityItem[]): string {
  const map: Record<string, number> = {}
  items.forEach(i => {
    const cur = i.currency ?? 'KRW'
    map[cur] = (map[cur] ?? 0) + toMonthlyAmount(i)
  })
  return Object.entries(map).map(([cur, amt]) => fmtMoney(amt, cur)).join(' + ')
}

type ModalType = 'spending' | 'urgent' | 'expiring' | 'card' | null

export function SummaryMetrics({ monthlyTotal, urgentPaymentCount, expiringCount, expiringItems, cards, items }: Props) {
  const [modal, setModal] = useState<ModalType>(null)
  const router = useRouter()

  const topCardAchievement = cards.length > 0
    ? cards.reduce((best, card) => {
        const achievements = calculateBenefitAchievement(card, items)
        const topRate = Math.max(...achievements.map(a => a.rate), 0)
        return topRate >= best.rate ? { card, rate: topRate } : best
      }, { card: cards[0], rate: -1 })
    : { card: null as CardType | null, rate: 0 }

  const activeItems = items.filter(i => i.status === 'active')
  const mixedTotal = fmtMixedTotals(activeItems)
  const urgentItems = activeItems.filter(i => {
    const d = getDaysUntilPayment(i)
    return d !== null && d <= 7
  }).sort((a, b) => getDaysUntilPayment(a)! - getDaysUntilPayment(b)!)

  const navigate = (path: string) => { setModal(null); router.push(path) }

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard
          icon={<TrendingUp size={18} className="text-[#6C63FF]" />}
          label="이번달 지출 예정"
          value={mixedTotal || fmtMoney(monthlyTotal)}
          sub="등록 항목 기준"
          onClick={() => setModal('spending')}
        />
        <MetricCard
          icon={<Clock size={18} className="text-[#6C63FF]" />}
          label="7일 내 납부"
          value={`${urgentPaymentCount}건`}
          sub="납부 예정"
          accent={urgentPaymentCount > 0 ? 'warning' : undefined}
          onClick={() => setModal('urgent')}
        />
        <MetricCard
          icon={<AlertTriangle size={18} className="text-red-500" />}
          label="만료 임박"
          value={`${expiringCount}건`}
          sub="90일 이내"
          accent={expiringCount > 0 ? 'danger' : undefined}
          onClick={() => setModal('expiring')}
        />
        <MetricCard
          icon={<CreditCard size={18} className="text-green-500" />}
          label="최고 카드 실적"
          value={topCardAchievement.card ? `${Math.round(topCardAchievement.rate * 100)}%` : '카드 미등록'}
          sub={topCardAchievement.card?.name ?? '카드를 등록해보세요'}
          accent={topCardAchievement.rate >= 1 ? 'success' : undefined}
          onClick={() => topCardAchievement.card ? navigate(`/cards`) : setModal('card')}
        />
      </div>

      {/* 모달 */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setModal(null)} />
          <div className="relative bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md max-h-[80vh] flex flex-col shadow-2xl">
            {/* 모달 헤더 */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-base font-semibold">
                {modal === 'spending' && '이번달 지출 예정'}
                {modal === 'urgent' && '7일 내 납부 예정'}
                {modal === 'expiring' && '만료 임박 항목'}
                {modal === 'card' && '카드 등록'}
              </h2>
              <button onClick={() => setModal(null)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                <X size={18} className="text-gray-400" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-4 space-y-2">
              {/* 이번달 지출 */}
              {modal === 'spending' && (
                activeItems.length === 0
                  ? <Empty text="등록된 항목이 없어요" />
                  : [...activeItems]
                      .sort((a, b) => toMonthlyAmount(b) - toMonthlyAmount(a))
                      .map(item => (
                        <ItemRow key={item.id} item={item} sub={fmtMoney(toMonthlyAmount(item), item.currency) + '/월'} onClick={() => navigate(`/items/${item.id}`)} />
                      ))
              )}

              {/* 7일 내 납부 */}
              {modal === 'urgent' && (
                urgentItems.length === 0
                  ? <Empty text="7일 내 납부 예정 항목이 없어요" />
                  : urgentItems.map(item => {
                      const d = getDaysUntilPayment(item)!
                      return (
                        <ItemRow
                          key={item.id} item={item}
                          sub={fmtMoney(item.amount, item.currency)}
                          badge={d === 0 ? '오늘' : `D-${d}`}
                          badgeColor={d === 0 ? 'red' : d <= 3 ? 'orange' : 'gray'}
                          onClick={() => navigate(`/items/${item.id}`)}
                        />
                      )
                    })
              )}

              {/* 만료 임박 */}
              {modal === 'expiring' && (
                expiringItems.length === 0
                  ? <Empty text="90일 이내 만료 항목이 없어요" />
                  : expiringItems.map(item => {
                      const d = getDaysUntilExpiry(item) ?? getDaysUntilPayment(item)
                      return (
                        <ItemRow
                          key={item.id} item={item}
                          sub={fmtMoney(item.amount, item.currency)}
                          badge={d !== null ? `${d}일 후` : ''}
                          badgeColor={d !== null && d <= 30 ? 'red' : 'orange'}
                          onClick={() => navigate(`/items/${item.id}`)}
                        />
                      )
                    })
              )}

              {/* 카드 미등록 */}
              {modal === 'card' && (
                <div className="text-center py-8 space-y-3">
                  <p className="text-sm text-gray-500">등록된 카드가 없어요</p>
                  <button
                    onClick={() => navigate('/cards')}
                    className="px-4 py-2 bg-[#6C63FF] text-white rounded-xl text-sm font-medium hover:bg-[#5a52e0] transition-colors"
                  >
                    카드 등록하러 가기
                  </button>
                </div>
              )}
            </div>

            {/* 전체 보기 링크 */}
            {(modal === 'spending' || modal === 'urgent') && (
              <div className="p-4 border-t border-gray-100">
                <button onClick={() => navigate('/items')} className="w-full flex items-center justify-center gap-1.5 text-sm text-[#6C63FF] font-medium hover:underline">
                  전체 항목 보기 <ArrowRight size={14} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

function ItemRow({ item, sub, badge, badgeColor = 'gray', onClick }: {
  item: ResponsibilityItem
  sub: string
  badge?: string
  badgeColor?: 'red' | 'orange' | 'gray'
  onClick: () => void
}) {
  const meta = CATEGORY_META[item.category]
  const badgeClass = { red: 'bg-red-100 text-red-600', orange: 'bg-orange-100 text-orange-600', gray: 'bg-gray-100 text-gray-500' }[badgeColor]
  return (
    <button onClick={onClick} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors text-left group">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: meta?.color }}>
        <span className="text-xs font-bold" style={{ color: meta?.textColor }}>{meta?.label?.[0]}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{item.name}</p>
        <p className="text-xs text-gray-400">{item.provider || meta?.label}</p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {badge && <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badgeClass}`}>{badge}</span>}
        <span className="text-sm font-semibold tabular-nums">{sub}</span>
        <ArrowRight size={14} className="text-gray-300 group-hover:text-[#6C63FF] transition-colors" />
      </div>
    </button>
  )
}

function Empty({ text }: { text: string }) {
  return <div className="text-center py-12 text-gray-400 text-sm">{text}</div>
}

function MetricCard({ icon, label, value, sub, accent, onClick }: {
  icon: React.ReactNode
  label: string
  value: React.ReactNode
  sub: string
  accent?: 'warning' | 'danger' | 'success'
  onClick?: () => void
}) {
  const accentClass = {
    warning: 'border-orange-200 bg-orange-50',
    danger: 'border-red-200 bg-red-50',
    success: 'border-green-200 bg-green-50',
  }[accent as string] ?? ''

  return (
    <button
      onClick={onClick}
      className={`w-full text-left bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer ${accentClass}`}
    >
      <div className="flex items-center gap-1.5 mb-3">
        {icon}
        <span className="text-xs text-gray-400">{label}</span>
      </div>
      <div className="text-2xl font-semibold tracking-tight tabular-nums mb-1">{value}</div>
      <div className="text-xs text-gray-400">{sub}</div>
    </button>
  )
}
