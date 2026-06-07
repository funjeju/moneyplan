'use client'
import Link from 'next/link'
import { calculateBenefitAchievement } from '@/lib/utils/card'
import { fmtMoney } from '@/lib/utils'
import type { CreditCard, ResponsibilityItem } from '@/lib/types'

interface Props {
  cards: CreditCard[]
  items: ResponsibilityItem[]
}

export function CardBenefitPanel({ cards, items }: Props) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold">카드 혜택 달성 현황</h2>
        <Link href="/cards" className="text-xs text-[#6C63FF]">전체 보기 →</Link>
      </div>
      <div className="space-y-4">
        {cards.map(card => {
          const achievements = calculateBenefitAchievement(card, items)
          const topAch = achievements.find(a => !a.isAchieved) ?? achievements[0]
          if (!topAch) return null

          return (
            <div key={card.id}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-medium">{card.name}</span>
                <span className={`text-xs font-semibold ${topAch.isAchieved ? 'text-green-500' : 'text-orange-500'}`}>
                  {Math.round(topAch.rate * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5 mb-1">
                <div
                  className={`h-1.5 rounded-full transition-all ${topAch.isAchieved ? 'bg-green-500' : 'bg-[#6C63FF]'}`}
                  style={{ width: `${Math.min(topAch.rate * 100, 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-400">
                {topAch.isAchieved
                  ? `✅ ${fmtMoney(topAch.estimatedDiscount)} 할인 예정`
                  : `${fmtMoney(topAch.remaining)} 더 쓰면 ${topAch.description} 달성`}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
