'use client'
import { useMemo } from 'react'
import { Progress } from '@/components/ui/progress'
import { Check, AlertCircle, ArrowRight } from 'lucide-react'
import { calculateBenefitAchievement } from '@/lib/utils/card'
import { toMonthlyAmount, fmtMoney } from '@/lib/utils'

function itemBelongsToCard(item: ResponsibilityItem, card: CreditCard): boolean {
  if (item.paymentCardId === card.id) return true
  if (!item.paymentMethod) return false
  const method = item.paymentMethod.toLowerCase()
  const keyword = card.name.toLowerCase().split(/[\s(]/)[0]
  return keyword.length >= 2 && method.includes(keyword)
}
import { ItemCard } from '@/components/items/ItemCard'
import type { CreditCard, ResponsibilityItem } from '@/lib/types'

interface Props {
  card: CreditCard
  allItems: ResponsibilityItem[]
}

export function CardDetail({ card, allItems }: Props) {
  const cardItems = useMemo(
    () => allItems.filter(i => (i.status === 'active' || i.status === 'paid') && itemBelongsToCard(i, card)),
    [allItems, card]
  )

  const monthlyTotal = useMemo(
    () => cardItems.reduce((sum, i) => sum + toMonthlyAmount(i), 0),
    [cardItems]
  )

  const achievements = useMemo(
    () => calculateBenefitAchievement(card, allItems),
    [card, allItems]
  )

  const simulations = useMemo(() => {
    if (achievements.every(a => a.isAchieved)) return []
    const unachieved = achievements.filter(a => !a.isAchieved)
    const otherItems = allItems.filter(i => i.status === 'active' && !itemBelongsToCard(i, card))

    return unachieved.flatMap(ach => {
      const needed = ach.remaining
      const candidates = otherItems
        .map(item => ({ item, monthly: toMonthlyAmount(item) }))
        .filter(c => c.monthly > 0)
        .sort((a, b) => Math.abs(a.monthly - needed) - Math.abs(b.monthly - needed))
        .slice(0, 2)

      return candidates.map(c => ({
        benefit: ach.description,
        item: c.item,
        newMonthly: monthlyTotal + c.monthly,
        gain: ach.estimatedDiscount,
      }))
    })
  }, [achievements, allItems, card.id, monthlyTotal])

  return (
    <div className="space-y-6">
      <div
        className="rounded-2xl p-6 text-white shadow-lg"
        style={{ background: `linear-gradient(135deg, ${card.color ?? '#1A1D29'}, ${card.color ?? '#1A1D29'}bb)` }}
      >
        <div className="flex flex-col h-full justify-between">
          <div className="text-sm opacity-70">{card.issuer}</div>
          <div className="mt-8">
            <div className="text-lg font-semibold">{card.name}</div>
            {card.last4Digits && (
              <div className="text-sm opacity-60 mt-1">•••• •••• •••• {card.last4Digits}</div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
        <h3 className="text-sm font-semibold mb-3">이번달 실적</h3>
        <div className="text-2xl font-bold tabular-nums mb-1">{fmtMoney(monthlyTotal)}</div>
        <p className="text-xs text-gray-400 mb-4">{cardItems.length}개 항목 기준</p>

        {achievements.length > 0 ? (
          <div className="space-y-3">
            {achievements.map(ach => (
              <div key={ach.benefitId}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    {ach.isAchieved
                      ? <Check size={13} className="text-green-500" />
                      : <AlertCircle size={13} className="text-orange-500" />}
                    <span className="text-xs font-medium">{ach.description}</span>
                  </div>
                  <span className="text-xs text-gray-400">{Math.round(ach.rate * 100)}%</span>
                </div>
                <Progress value={Math.min(ach.rate * 100, 100)} className="h-1.5" />
                {!ach.isAchieved && ach.remaining > 0 && (
                  <p className="text-xs text-gray-400 mt-1">
                    {fmtMoney(ach.remaining)} 더 쓰면 {fmtMoney(ach.estimatedDiscount)} 할인 달성
                  </p>
                )}
                {ach.isAchieved && (
                  <p className="text-xs text-green-500 mt-1">✅ {fmtMoney(ach.estimatedDiscount)} 할인 예정</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-400">등록된 혜택 조건이 없습니다</p>
        )}
      </div>

      {simulations.length > 0 && (
        <div className="bg-[#6C63FF]/5 rounded-2xl p-4 border border-[#6C63FF]/20">
          <h3 className="text-sm font-semibold text-[#6C63FF] mb-3">💡 절약 시뮬레이션</h3>
          <div className="space-y-2.5">
            {simulations.map((sim, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <ArrowRight size={14} className="text-[#6C63FF] mt-0.5 flex-shrink-0" />
                <p className="text-xs">
                  <span className="font-medium">{sim.item.name}</span>을 이 카드로 변경하면
                  <br />
                  실적 {fmtMoney(sim.newMonthly)} 달성 →
                  <span className="text-[#6C63FF] font-medium"> {sim.benefit}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-sm font-semibold mb-3">결제 중인 항목 ({cardItems.length}개)</h3>
        {cardItems.length > 0 ? (
          <div className="space-y-2">
            {cardItems.map(item => (
              <div key={item.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <span className="text-sm">{item.name}</span>
                <span className="text-sm font-medium tabular-nums">{fmtMoney(toMonthlyAmount(item))}/월</span>
              </div>
            ))}
            <div className="flex items-center justify-between pt-2 font-semibold">
              <span className="text-sm">합계</span>
              <span className="text-sm tabular-nums text-[#6C63FF]">{fmtMoney(monthlyTotal)}/월</span>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-400 text-center py-4">이 카드로 결제 중인 항목이 없어요</p>
        )}
      </div>
    </div>
  )
}
