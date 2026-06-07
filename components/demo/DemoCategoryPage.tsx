'use client'
import { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { DEMO_ITEMS } from '@/lib/demo-data'
import { CATEGORY_META } from '@/lib/utils/category'
import { toMonthlyAmount, toYearlyAmount, fmtMoney, getDaysUntilExpiry } from '@/lib/utils'
import { ItemCard } from '@/components/items/ItemCard'
import type { CategorySlug } from '@/lib/types'
import Link from 'next/link'

interface Props { slug: CategorySlug }

export function DemoCategoryPage({ slug }: Props) {
  const router = useRouter()
  const meta = CATEGORY_META[slug]

  const items = useMemo(
    () => DEMO_ITEMS.filter(i => i.category === slug),
    [slug]
  )

  const stats = useMemo(() => ({
    count: items.length,
    monthlyTotal: items.reduce((s, i) => s + toMonthlyAmount(i), 0),
    yearlyTotal: items.reduce((s, i) => s + toYearlyAmount(i), 0),
    expiringSoon: items.filter(i => {
      const d = getDaysUntilExpiry(i)
      return d !== null && d >= 0 && d <= 90
    }).length,
  }), [items])

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="rounded-2xl p-6 mb-6" style={{ background: meta.color }}>
        <p className="text-sm font-medium mb-1" style={{ color: meta.textColor }}>{meta.label}</p>
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

      {items.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-4xl mb-3">📭</div>
          <p className="text-sm">{meta.label} 항목이 없어요</p>
          <Link href="/signup" className="text-xs text-[#6C63FF] mt-2 inline-block hover:underline">
            회원가입 후 직접 추가해보세요 →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {items.map(item => (
            <ItemCard key={item.id} item={item} onClick={() => router.push(`/demo/items/${item.id}`)} />
          ))}
        </div>
      )}
    </div>
  )
}
