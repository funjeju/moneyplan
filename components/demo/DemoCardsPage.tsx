'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { DEMO_CARDS, DEMO_ITEMS } from '@/lib/demo-data'
import { calculateBenefitAchievement, getTotalExpectedSavings } from '@/lib/utils/card'
import { fmtMoney } from '@/lib/utils'
import { CardDetail } from '@/components/cards/CardDetail'
import { Plus, Lock, X } from 'lucide-react'
import Link from 'next/link'
import type { CreditCard } from '@/lib/types'

export function DemoCardsPage() {
  const activeItems = DEMO_ITEMS.filter(i => i.status === 'active')
  const totalSavings = getTotalExpectedSavings(DEMO_CARDS, activeItems)
  const [selectedCard, setSelectedCard] = useState<CreditCard | null>(null)

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">카드 관리</h1>
          {totalSavings > 0 && (
            <p className="text-sm text-green-500 mt-0.5">이번달 예상 혜택: {fmtMoney(totalSavings)}</p>
          )}
        </div>
        <Link
          href="/signup"
          className="flex items-center gap-1.5 text-xs px-3 py-2 bg-[#6C63FF] text-white rounded-xl hover:bg-[#5A52E8] transition-colors"
        >
          <Plus size={13} /> <Lock size={11} /> 카드 추가
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {DEMO_CARDS.map(card => {
          const achievements = calculateBenefitAchievement(card, activeItems)
          const topRate = Math.max(...achievements.map(a => a.rate), 0)
          return (
            <button
              key={card.id}
              onClick={() => setSelectedCard(card)}
              className="text-left rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              <div
                className="p-4 text-white"
                style={{ background: `linear-gradient(135deg, ${card.color ?? '#1A1D29'}, ${card.color ?? '#1A1D29'}bb)` }}
              >
                <p className="text-xs opacity-70">{card.issuer}</p>
                <p className="text-sm font-semibold mt-1">{card.name}</p>
              </div>
              <div className="bg-white p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">혜택 달성률</span>
                  <span className={`text-xs font-semibold ${topRate >= 1 ? 'text-green-500' : 'text-orange-500'}`}>
                    {Math.round(topRate * 100)}%
                  </span>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* 카드 상세 모달 */}
      {selectedCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSelectedCard(null)} />
          <div className="relative bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold">{selectedCard.name}</h2>
              <button onClick={() => setSelectedCard(null)} className="p-1.5 rounded-lg hover:bg-gray-100">
                <X size={16} />
              </button>
            </div>
            <div className="p-4">
              <CardDetail card={selectedCard} allItems={activeItems} />
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 bg-white rounded-2xl border border-gray-100 p-5 space-y-2">
        <h2 className="text-sm font-bold text-gray-700">Life Capsule 카드 혜택 관리</h2>
        <p className="text-xs text-gray-400 leading-relaxed">
          1,100개 이상의 국내 카드 데이터베이스를 기반으로 내 생활비 패턴에 맞는 최적 카드를 추천합니다.
          통신비·구독·보험·렌탈 등 자동결제 항목의 카드 혜택 달성률을 자동 계산하고, 최대 절약 가능 금액을 알려드립니다.
        </p>
      </div>
    </div>
  )
}
