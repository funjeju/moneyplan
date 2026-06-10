'use client'
import { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useItems } from '@/hooks/useItems'
import { fmtMoney } from '@/lib/utils'
import { CATEGORY_META } from '@/lib/utils/category'
import { CategoryBadge } from '@/components/shared/CategoryBadge'
import { Button } from '@/components/ui/button'
import { XCircle, RotateCcw } from 'lucide-react'
import * as Icons from 'lucide-react'
import type { ResponsibilityItem } from '@/lib/types'

function fmtDateSimple(ts: any): string {
  if (!ts) return ''
  const d = ts.toDate ? ts.toDate() : new Date(ts)
  return `${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()}`
}

const CYCLE_LABELS: Record<string, string> = {
  monthly: '매월', bimonthly: '2개월마다', quarterly: '분기별',
  semiannual: '반기별', yearly: '매년', once: '일회성',
}

export default function CancelledPage() {
  const router = useRouter()
  const { items, updateItem } = useItems()

  const cancelledItems = useMemo(
    () => items
      .filter(i => i.status === 'cancelled')
      .sort((a, b) => {
        const aDate = (a.cancelledAt as any)?.toDate?.() ?? new Date(0)
        const bDate = (b.cancelledAt as any)?.toDate?.() ?? new Date(0)
        return bDate.getTime() - aDate.getTime()
      }),
    [items]
  )

  const handleRestore = (item: ResponsibilityItem) => {
    updateItem({ id: item.id, data: { status: 'active', cancelledAt: undefined as any, cancellationReason: undefined } })
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-red-50 rounded-2xl flex items-center justify-center">
          <XCircle size={20} className="text-red-400" />
        </div>
        <div>
          <h1 className="text-xl font-semibold">중단된 항목</h1>
          <p className="text-sm text-gray-400">{cancelledItems.length}건</p>
        </div>
      </div>

      {cancelledItems.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-4xl mb-3">🚫</div>
          <p className="text-sm">중단된 항목이 없어요</p>
          <p className="text-xs mt-1">항목 상세에서 중단 버튼을 눌러주세요</p>
        </div>
      ) : (
        <div className="space-y-3">
          {cancelledItems.map(item => {
            const meta = CATEGORY_META[item.category]
            const IconComponent = (Icons as any)[meta?.icon] ?? Icons.MoreHorizontal
            return (
              <div key={item.id} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm opacity-80">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 grayscale" style={{ background: meta?.color }}>
                    <IconComponent size={18} style={{ color: meta?.textColor }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium line-through text-gray-400">{item.name}</span>
                      <CategoryBadge category={item.category} size="sm" />
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {item.provider && `${item.provider} · `}
                      {CYCLE_LABELS[item.cycle]} ·{' '}
                      중단일: <span className="font-medium text-red-400">{fmtDateSimple(item.cancelledAt) || '미기록'}</span>
                    </p>
                    {item.cancellationReason && (
                      <p className="text-xs text-gray-400 mt-0.5">사유: {item.cancellationReason}</p>
                    )}
                    <p className="text-sm font-semibold tabular-nums mt-1 text-gray-400">
                      {fmtMoney(item.amount, item.currency)} / {CYCLE_LABELS[item.cycle]}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleRestore(item)}
                      className="p-1.5 text-gray-400 hover:text-[#6C63FF] rounded-lg hover:bg-[#6C63FF]/10 transition-colors"
                      title="다시 활성화"
                    >
                      <RotateCcw size={15} />
                    </button>
                    <button
                      onClick={() => router.push(`/items/${item.id}`)}
                      className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1 rounded-lg hover:bg-gray-50"
                    >
                      상세
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
