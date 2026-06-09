'use client'
import { getDaysUntilPayment, fmtMoney } from '@/lib/utils'
import { CATEGORY_META } from '@/lib/utils/category'
import type { ResponsibilityItem } from '@/lib/types'

interface Props {
  items: ResponsibilityItem[]
}

export function PaymentTimeline({ items }: Props) {
  const sorted = [...items]
    .filter(i => i.dayOfMonth)
    .sort((a, b) => getDaysUntilPayment(a) - getDaysUntilPayment(b))
    .slice(0, 8)

  if (sorted.length === 0) return null

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
      <h2 className="text-sm font-semibold mb-4">이번달 납부 일정</h2>
      <div className="space-y-3">
        {sorted.map(item => {
          const days = getDaysUntilPayment(item)
          const meta = CATEGORY_META[item.category]
          return (
            <div key={item.id} className="flex items-center gap-3">
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: meta.textColor }}
              />
              <span className={`text-xs font-medium w-12 flex-shrink-0 ${
                days <= 3 ? 'text-red-500' : days <= 7 ? 'text-orange-500' : 'text-gray-400'
              }`}>
                D+{days}
              </span>
              <span className="text-xs flex-1 truncate">{item.name}</span>
              <span className="text-xs font-semibold tabular-nums">{fmtMoney(item.amount, item.currency)}</span>
              {item.paymentMethod && (
                <span className="text-xs text-gray-400 hidden sm:block">{item.paymentMethod}</span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
