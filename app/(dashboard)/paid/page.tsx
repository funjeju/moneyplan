'use client'
import { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useItems } from '@/hooks/useItems'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/hooks/useAuth'
import { fmtMoney } from '@/lib/utils'
import { CATEGORY_META } from '@/lib/utils/category'
import { CategoryBadge } from '@/components/shared/CategoryBadge'
import { Button } from '@/components/ui/button'
import { CheckCircle2, RotateCcw, Receipt } from 'lucide-react'
import * as Icons from 'lucide-react'
import type { ResponsibilityItem } from '@/lib/types'

function fmtDateSimple(ts: any): string {
  if (!ts) return ''
  const d = ts.toDate ? ts.toDate() : new Date(ts)
  return `${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()}`
}

export default function PaidPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { items, updateItem } = useItems()
  const qc = useQueryClient()

  const paidItems = useMemo(
    () => items
      .filter(i => i.status === 'paid')
      .sort((a, b) => {
        const aDate = (a.paidAt as any)?.toDate?.() ?? new Date(a.paidAt as any) ?? new Date(0)
        const bDate = (b.paidAt as any)?.toDate?.() ?? new Date(b.paidAt as any) ?? new Date(0)
        return bDate.getTime() - aDate.getTime()
      }),
    [items]
  )

  const handleUnpay = (item: ResponsibilityItem) => {
    updateItem({ id: item.id, data: { status: 'active', paidAt: undefined as any, receiptUrl: undefined } })
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-green-50 rounded-2xl flex items-center justify-center">
          <CheckCircle2 size={20} className="text-green-500" />
        </div>
        <div>
          <h1 className="text-xl font-semibold">납부 완료</h1>
          <p className="text-sm text-gray-400">{paidItems.length}건</p>
        </div>
      </div>

      {paidItems.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-4xl mb-3">✅</div>
          <p className="text-sm">납부완료 처리된 항목이 없어요</p>
          <p className="text-xs mt-1">항목 상세에서 납부완료 버튼을 눌러주세요</p>
        </div>
      ) : (
        <div className="space-y-3">
          {paidItems.map(item => {
            const meta = CATEGORY_META[item.category]
            const IconComponent = (Icons as any)[meta?.icon] ?? Icons.MoreHorizontal
            return (
              <div key={item.id} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: meta?.color }}>
                    <IconComponent size={18} style={{ color: meta?.textColor }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium">{item.name}</span>
                      <CategoryBadge category={item.category} size="sm" />
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {item.provider && `${item.provider} · `}
                      납부일: <span className="font-medium text-green-600">{fmtDateSimple(item.paidAt)}</span>
                    </p>
                    <p className="text-base font-semibold tabular-nums mt-1">
                      {fmtMoney(item.amount, item.currency)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {item.receiptUrl && (
                      <a href={item.receiptUrl} target="_blank" rel="noopener noreferrer"
                        className="p-1.5 text-gray-400 hover:text-[#6C63FF] rounded-lg hover:bg-[#6C63FF]/10 transition-colors"
                        title="영수증 보기">
                        <Receipt size={15} />
                      </a>
                    )}
                    <button
                      onClick={() => handleUnpay(item)}
                      className="p-1.5 text-gray-400 hover:text-orange-500 rounded-lg hover:bg-orange-50 transition-colors"
                      title="납부완료 취소"
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
