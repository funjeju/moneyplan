'use client'
import { ChevronRight } from 'lucide-react'
import { CategoryBadge } from '@/components/shared/CategoryBadge'
import { CATEGORY_META } from '@/lib/utils/category'
import { fmtMoney, toMonthlyAmount } from '@/lib/utils'

function groupByCurrency(items: ResponsibilityItem[]) {
  const map: Record<string, number> = {}
  items.forEach(i => {
    const cur = i.currency ?? 'KRW'
    map[cur] = (map[cur] ?? 0) + toMonthlyAmount(i)
  })
  return map
}
import type { ItemGroup, ResponsibilityItem } from '@/lib/types'
import * as Icons from 'lucide-react'

interface Props {
  group: ItemGroup
  items: ResponsibilityItem[]
  onClick?: () => void
}

export function GroupCard({ group, items, onClick }: Props) {
  const meta = CATEGORY_META[group.category]
  const IconComponent = (Icons as any)[meta?.icon] ?? Icons.Package
  const currencyTotals = groupByCurrency(items)
  const positiveItems = items.filter(i => i.amount >= 0)
  const discountItems = items.filter(i => i.amount < 0)

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: meta?.color }}
          >
            <IconComponent size={18} style={{ color: meta?.textColor }} />
          </div>
          <div>
            <p className="text-sm font-medium leading-tight">{group.name}</p>
            <p className="text-xs text-gray-400 mt-0.5">{group.provider}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <CategoryBadge category={group.category} />
          <ChevronRight size={16} className="text-gray-300" />
        </div>
      </div>

      <div className="flex flex-wrap gap-1 mb-3">
        {positiveItems.map(item => (
          <span key={item.id} className="text-xs bg-gray-50 text-gray-500 px-2 py-0.5 rounded-full">
            {item.name} {fmtMoney(item.amount, item.currency)}
          </span>
        ))}
        {discountItems.map(item => (
          <span key={item.id} className="text-xs bg-blue-50 text-blue-500 px-2 py-0.5 rounded-full">
            {item.name} {fmtMoney(item.amount, item.currency)}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <span className="text-xs text-gray-400">{items.length}개 항목</span>
        <div className="text-right">
          {Object.entries(currencyTotals).map(([cur, amt]) => (
            <div key={cur} className={`text-base font-semibold tabular-nums leading-tight ${amt < 0 ? 'text-blue-500' : ''}`}>
              {fmtMoney(amt, cur)}
              <span className="text-xs text-gray-400 font-normal">/월</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
