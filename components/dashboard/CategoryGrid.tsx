'use client'
import Link from 'next/link'
import { CATEGORY_META } from '@/lib/utils/category'
import { toMonthlyAmount, fmtMoney } from '@/lib/utils'
import type { ResponsibilityItem, CategorySlug } from '@/lib/types'
import * as Icons from 'lucide-react'

interface Props {
  items: ResponsibilityItem[]
}

export function CategoryGrid({ items }: Props) {
  const byCategory = items.reduce<Record<string, ResponsibilityItem[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = []
    acc[item.category].push(item)
    return acc
  }, {})

  const categories = Object.keys(CATEGORY_META) as CategorySlug[]
  const activeCategories = categories.filter(slug => (byCategory[slug]?.length ?? 0) > 0)

  if (activeCategories.length === 0) return null

  return (
    <div>
      <h2 className="text-sm font-semibold mb-3">카테고리별 현황</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {activeCategories.map(slug => {
          const meta = CATEGORY_META[slug]
          const catItems = byCategory[slug] ?? []
          const IconComponent = (Icons as any)[meta.icon] ?? Icons.MoreHorizontal
          // 통화별 합계
          const currMap: Record<string, number> = {}
          catItems.forEach(i => {
            const cur = i.currency ?? 'KRW'
            currMap[cur] = (currMap[cur] ?? 0) + toMonthlyAmount(i)
          })
          const totalStr = Object.entries(currMap)
            .map(([cur, amt]) => fmtMoney(amt, cur))
            .join(' + ')

          return (
            <Link
              key={slug}
              href={`/categories/${slug}`}
              className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: meta.color }}
                >
                  <IconComponent size={16} style={{ color: meta.textColor }} />
                </div>
                <span className="text-sm font-medium">{meta.label}</span>
              </div>
              <div className="text-base font-semibold tabular-nums leading-snug">{totalStr}</div>
              <div className="text-xs text-gray-400 mt-0.5">{catItems.length}건 / 월</div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
