'use client'
import { CategoryBadge } from '@/components/shared/CategoryBadge'
import { DayBadge } from '@/components/shared/DayBadge'
import { CATEGORY_META } from '@/lib/utils/category'
import { getDaysUntilPayment, getDaysUntilExpiry, fmtMoney, fmtDate } from '@/lib/utils'
import type { ResponsibilityItem } from '@/lib/types'
import * as Icons from 'lucide-react'

const CYCLE_LABELS: Record<string, string> = {
  monthly: '매월', bimonthly: '2개월', quarterly: '분기',
  semiannual: '반기', yearly: '매년', once: '일회',
}

interface Props {
  item: ResponsibilityItem
  onClick?: () => void
}

export function ItemCard({ item, onClick }: Props) {
  const meta = CATEGORY_META[item.category]
  const IconComponent = (Icons as any)[meta.icon] ?? Icons.MoreHorizontal
  const daysUntilPayment = getDaysUntilPayment(item)
  const daysUntilExpiry = getDaysUntilExpiry(item)

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: meta.color }}
          >
            <IconComponent size={18} style={{ color: meta.textColor }} />
          </div>
          <div>
            <p className="text-sm font-medium leading-tight">{item.name}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {[item.owner, item.paymentMethod].filter(Boolean).join(' · ')}
            </p>
          </div>
        </div>
        <CategoryBadge category={item.category} />
      </div>

      <div className="space-y-1.5 text-xs">
        {item.memo && (
          <div className="flex justify-between">
            <span className="text-gray-400">메모</span>
            <span className="text-gray-700 font-medium truncate max-w-[160px]">{item.memo}</span>
          </div>
        )}
        {item.dayOfMonth && (
          <div className="flex justify-between">
            <span className="text-gray-400">결제</span>
            <span className="text-gray-700 font-medium">
              {CYCLE_LABELS[item.cycle]} {item.dayOfMonth}일
            </span>
          </div>
        )}
        {daysUntilExpiry !== null && (
          <div className="flex justify-between items-center">
            <span className="text-gray-400">약정 만료</span>
            <div className="flex items-center gap-1.5">
              <span className="font-medium">{fmtDate(item.contractEndDate)}</span>
              {daysUntilExpiry <= 90 && (
                <span className={`text-xs font-medium ${daysUntilExpiry < 0 ? 'text-red-500' : daysUntilExpiry <= 30 ? 'text-orange-500' : 'text-gray-400'}`}>
                  {daysUntilExpiry < 0 ? '만료됨' : `${daysUntilExpiry}일 후`}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
        <span className="text-base font-semibold tabular-nums">{fmtMoney(item.amount)}</span>
        <DayBadge days={daysUntilPayment} type="payment" />
      </div>
    </div>
  )
}
