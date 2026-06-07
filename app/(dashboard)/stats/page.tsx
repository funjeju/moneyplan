'use client'
import { useMemo } from 'react'
import { useItems } from '@/hooks/useItems'
import { CATEGORY_META } from '@/lib/utils/category'
import { toMonthlyAmount, toYearlyAmount, fmtMoney } from '@/lib/utils'
import { TrendingUp, BarChart3, PieChart } from 'lucide-react'
import type { CategorySlug } from '@/lib/types'

interface CategoryStat {
  slug: CategorySlug
  label: string
  color: string
  textColor: string
  monthly: number
  count: number
}

export default function StatsPage() {
  const { items, isLoading } = useItems()

  const stats = useMemo(() => {
    const active = items.filter(i => i.status === 'active')
    const monthlyTotal = active.reduce((s, i) => s + toMonthlyAmount(i), 0)
    const yearlyTotal = active.reduce((s, i) => s + toYearlyAmount(i), 0)

    const byCategory: Record<string, CategoryStat> = {}
    for (const item of active) {
      const meta = CATEGORY_META[item.category]
      if (!byCategory[item.category]) {
        byCategory[item.category] = {
          slug: item.category,
          label: meta.label,
          color: meta.color,
          textColor: meta.textColor,
          monthly: 0,
          count: 0,
        }
      }
      byCategory[item.category].monthly += toMonthlyAmount(item)
      byCategory[item.category].count++
    }

    const categories = Object.values(byCategory)
      .sort((a, b) => b.monthly - a.monthly)
      .filter(c => c.monthly > 0)

    const top5 = active
      .slice()
      .sort((a, b) => toMonthlyAmount(b) - toMonthlyAmount(a))
      .slice(0, 5)

    const aiParsedCount = active.filter(i => i.aiParsed).length
    const autoPayCount = active.filter(i => i.isAutoPayment).length

    return { monthlyTotal, yearlyTotal, categories, top5, aiParsedCount, autoPayCount, totalCount: active.length }
  }, [items])

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse" />)}
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-xl font-semibold">지출 분석</h1>
        <p className="text-sm text-gray-400 mt-0.5">등록된 항목 기준 예상 지출</p>
      </div>

      {/* 총합 카드 */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gradient-to-br from-[#6C63FF] to-[#9B93FF] rounded-2xl p-5 text-white">
          <div className="flex items-center gap-1.5 mb-2">
            <TrendingUp size={15} />
            <span className="text-xs opacity-80">월 예상 지출</span>
          </div>
          <p className="text-2xl font-bold tabular-nums">{fmtMoney(stats.monthlyTotal)}</p>
          <p className="text-xs opacity-70 mt-1">항목 {stats.totalCount}개</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-1.5 mb-2 text-gray-500">
            <BarChart3 size={15} />
            <span className="text-xs">연 예상 지출</span>
          </div>
          <p className="text-2xl font-bold tabular-nums">{fmtMoney(stats.yearlyTotal)}</p>
          <p className="text-xs text-gray-400 mt-1">하루 평균 {fmtMoney(Math.round(stats.yearlyTotal / 365))}</p>
        </div>
      </div>

      {/* 카테고리별 지출 바차트 */}
      {stats.categories.length > 0 && (
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <PieChart size={16} className="text-gray-400" />
            <h2 className="text-sm font-semibold">카테고리별 월 지출</h2>
          </div>
          <div className="space-y-3">
            {stats.categories.map(cat => {
              const pct = stats.monthlyTotal > 0 ? (cat.monthly / stats.monthlyTotal) * 100 : 0
              return (
                <div key={cat.slug}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-sm" style={{ background: cat.color }} />
                      <span className="text-xs text-gray-600">{cat.label}</span>
                      <span className="text-xs text-gray-400">({cat.count}개)</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold tabular-nums">{fmtMoney(cat.monthly)}</span>
                      <span className="text-xs text-gray-400 ml-1">{pct.toFixed(1)}%</span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, background: cat.color }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* 지출 TOP 5 */}
      {stats.top5.length > 0 && (
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <h2 className="text-sm font-semibold mb-4">지출 TOP 5</h2>
          <div className="space-y-3">
            {stats.top5.map((item, i) => {
              const meta = CATEGORY_META[item.category]
              const monthly = toMonthlyAmount(item)
              return (
                <div key={item.id} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-gray-300 w-4 text-center">{i + 1}</span>
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-semibold"
                    style={{ background: meta.color, color: meta.textColor }}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.name}</p>
                    <p className="text-xs text-gray-400">{meta.label}</p>
                  </div>
                  <p className="text-sm font-semibold tabular-nums">{fmtMoney(monthly)}<span className="text-xs text-gray-400">/월</span></p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* 요약 인사이트 */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center">
          <p className="text-2xl font-bold text-[#6C63FF]">{stats.autoPayCount}</p>
          <p className="text-xs text-gray-400 mt-1">자동이체 항목</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center">
          <p className="text-2xl font-bold text-green-500">{stats.aiParsedCount}</p>
          <p className="text-xs text-gray-400 mt-1">AI 파싱 항목</p>
        </div>
      </div>

      {stats.totalCount === 0 && (
        <div className="text-center py-16 text-gray-400">
          <BarChart3 size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">항목을 추가하면 분석이 나타나요</p>
        </div>
      )}
    </div>
  )
}
