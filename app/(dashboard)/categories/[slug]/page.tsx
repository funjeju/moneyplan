'use client'
import { useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useItems } from '@/hooks/useItems'
import { CATEGORY_META } from '@/lib/utils/category'
import { toMonthlyAmount, toYearlyAmount, fmtMoney } from '@/lib/utils'
import { ItemCard } from '@/components/items/ItemCard'
import type { CategorySlug } from '@/lib/types'

export default function CategoryPage() {
  const { slug } = useParams<{ slug: CategorySlug }>()
  const router = useRouter()
  const meta = CATEGORY_META[slug]
  const { items } = useItems(slug)

  const stats = useMemo(() => ({
    count: items.length,
    monthlyTotal: items.reduce((s, i) => s + toMonthlyAmount(i), 0),
    yearlyTotal: items.reduce((s, i) => s + toYearlyAmount(i), 0),
    expiringSoon: items.filter(i => {
      if (!i.contractEndDate) return false
      const d = i.contractEndDate as any
      const date = d.toDate ? d.toDate() : new Date(d)
      const days = Math.ceil((date.getTime() - Date.now()) / 86400000)
      return days >= 0 && days <= 90
    }).length,
  }), [items])

  if (!meta) return <div className="p-4">카테고리를 찾을 수 없습니다</div>

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
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

      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white rounded-xl p-3 border border-gray-100 text-center">
          <div className="text-xl font-semibold">{stats.count}</div>
          <div className="text-xs text-gray-400">등록 항목</div>
        </div>
        <div className="bg-white rounded-xl p-3 border border-gray-100 text-center">
          <div className="text-xl font-semibold tabular-nums">{fmtMoney(stats.monthlyTotal)}</div>
          <div className="text-xs text-gray-400">월 지출</div>
        </div>
        <div className={`rounded-xl p-3 border text-center ${stats.expiringSoon > 0 ? 'bg-orange-50 border-orange-200' : 'bg-white border-gray-100'}`}>
          <div className="text-xl font-semibold">{stats.expiringSoon}</div>
          <div className="text-xs text-gray-400">만료 임박</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {items.map(item => <ItemCard key={item.id} item={item} onClick={() => router.push(`/items/${item.id}`)} />)}
      </div>

      {items.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <div className="text-4xl mb-3">📭</div>
          <p className="text-sm">{meta.label} 항목이 없어요</p>
          <p className="text-xs mt-1">AI에게 말하거나 직접 추가해보세요</p>
        </div>
      )}
    </div>
  )
}
