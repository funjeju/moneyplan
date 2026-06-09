'use client'
import Link from 'next/link'
import { CATEGORY_META } from '@/lib/utils/category'
import { toMonthlyAmount, fmtMoney } from '@/lib/utils'
import type { ResponsibilityItem, CategorySlug } from '@/lib/types'
import * as Icons from 'lucide-react'

interface Props {
  items: ResponsibilityItem[]
}

const DONUT_COLORS = [
  '#6C63FF', '#FF6584', '#43BCCD', '#F7B731', '#26de81',
  '#fd9644', '#a55eea', '#45aaf2', '#fc5c65', '#2bcbba',
]

export function CategoryDonut({ items }: Props) {
  const byCategory = items.reduce<Record<string, ResponsibilityItem[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = []
    acc[item.category].push(item)
    return acc
  }, {})

  const categoriesRaw = (Object.keys(CATEGORY_META) as CategorySlug[])
    .filter(slug => (byCategory[slug]?.length ?? 0) > 0)
    .map((slug, idx) => {
      const catItems = byCategory[slug] ?? []
      const total = catItems.reduce((s, i) => s + toMonthlyAmount(i), 0)
      return { slug, total, color: DONUT_COLORS[idx % DONUT_COLORS.length] }
    })
    .filter(c => c.total > 0)
    .sort((a, b) => b.total - a.total)

  const grandTotal = categoriesRaw.reduce((s, c) => s + c.total, 0)
  const categories = categoriesRaw.map(c => ({ ...c, pct: grandTotal > 0 ? c.total / grandTotal : 0 }))

  if (grandTotal === 0) return null

  // SVG donut
  const size = 180
  const cx = size / 2
  const cy = size / 2
  const r = 70
  const innerR = 46
  const gap = 2

  let cumAngle = -90
  const slices = categories.map(cat => {
    const pct = cat.total / grandTotal
    const angle = pct * 360
    const start = cumAngle
    cumAngle += angle + gap
    return { ...cat, pct, startAngle: start, sweepAngle: angle }
  })

  function polarToXY(angle: number, radius: number) {
    const rad = (angle * Math.PI) / 180
    return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) }
  }

  function describeArc(startAngle: number, sweepAngle: number) {
    if (sweepAngle <= 0) return ''
    const end = startAngle + sweepAngle
    const s1 = polarToXY(startAngle, r)
    const e1 = polarToXY(end, r)
    const s2 = polarToXY(end, innerR)
    const e2 = polarToXY(startAngle, innerR)
    const large = sweepAngle > 180 ? 1 : 0
    return [
      `M ${s1.x} ${s1.y}`,
      `A ${r} ${r} 0 ${large} 1 ${e1.x} ${e1.y}`,
      `L ${s2.x} ${s2.y}`,
      `A ${innerR} ${innerR} 0 ${large} 0 ${e2.x} ${e2.y}`,
      'Z',
    ].join(' ')
  }

  const topCategory = categories[0]
  const topMeta = CATEGORY_META[topCategory.slug]

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
      <h2 className="text-sm font-semibold mb-4">카테고리별 현황</h2>
      <div className="flex flex-col items-center gap-4">
        {/* 도넛 차트 */}
        <div className="relative">
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            {slices.map((s, i) => (
              <path
                key={i}
                d={describeArc(s.startAngle, s.sweepAngle - gap)}
                fill={s.color}
                opacity={0.9}
              />
            ))}
          </svg>
          {/* 중앙 텍스트 */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xs text-gray-400">최대</span>
            <span className="text-sm font-bold leading-tight" style={{ color: topMeta.textColor }}>
              {topMeta.label}
            </span>
            <span className="text-xs font-semibold text-gray-600 tabular-nums">
              {Math.round(topCategory.pct * 100)}%
            </span>
          </div>
        </div>

        {/* 범례 */}
        <div className="w-full space-y-1.5">
          {categories.map(cat => {
            const meta = CATEGORY_META[cat.slug]
            const IconComp = (Icons as any)[meta.icon] ?? Icons.MoreHorizontal
            return (
              <Link
                key={cat.slug}
                href={`/categories/${cat.slug}`}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: cat.color }} />
                <IconComp size={13} className="text-gray-400 flex-shrink-0" />
                <span className="text-xs text-gray-600 flex-1 group-hover:text-gray-900">{meta.label}</span>
                <span className="text-xs font-semibold tabular-nums text-gray-700">
                  {fmtMoney(cat.total)}
                </span>
                <span className="text-xs text-gray-400 w-8 text-right">
                  {Math.round(cat.pct * 100)}%
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
