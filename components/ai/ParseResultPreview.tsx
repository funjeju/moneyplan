'use client'
import { useState } from 'react'
import { X, Check } from 'lucide-react'
import { CategoryBadge } from '@/components/shared/CategoryBadge'
import { useItems } from '@/hooks/useItems'
import type { ParseResponse } from '@/lib/types'

const CYCLE_LABELS: Record<string, string> = {
  monthly: '매월', bimonthly: '2개월', quarterly: '분기',
  semiannual: '반기', yearly: '매년', once: '일회',
}

interface Props {
  result: ParseResponse
  onConfirm: () => void
  onClose: () => void
}

export function ParseResultPreview({ result, onConfirm, onClose }: Props) {
  const { addItems } = useItems()
  const [selected, setSelected] = useState<boolean[]>(result.items.map(() => true))

  const handleAddSelected = async () => {
    const toAdd = result.items.filter((_, i) => selected[i])
    await addItems(toAdd)
    onConfirm()
  }

  return (
    <div className="mb-4 bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden">
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <p className="text-sm font-medium">
          {result.items.length}개 항목 발견
          <span className="text-gray-400 font-normal ml-1">
            (신뢰도 {Math.round(result.confidence * 100)}%)
          </span>
        </p>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X size={16} />
        </button>
      </div>

      {result.followUpQuestions.length > 0 && (
        <div className="mx-4 mb-3 p-3 bg-[#6C63FF]/5 rounded-xl">
          <p className="text-xs text-[#6C63FF] font-medium mb-1">💡 추가 정보</p>
          {result.followUpQuestions.map((q, i) => (
            <p key={i} className="text-xs text-gray-500">{q}</p>
          ))}
        </div>
      )}

      <div className="divide-y divide-gray-100">
        {result.items.map((item, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3">
            <input
              type="checkbox"
              checked={selected[i]}
              onChange={e => {
                const next = [...selected]
                next[i] = e.target.checked
                setSelected(next)
              }}
              className="rounded"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-sm font-medium truncate">{item.name || '미확인 항목'}</span>
                {item.category && <CategoryBadge category={item.category} size="sm" />}
              </div>
              <p className="text-xs text-gray-400">
                {item.amount ? `${item.amount.toLocaleString()}원` : '금액 미확인'}
                {item.cycle ? ` · ${CYCLE_LABELS[item.cycle]}` : ''}
                {item.dayOfMonth ? ` ${item.dayOfMonth}일` : ''}
              </p>
              {result.missingFields[i]?.length > 0 && (
                <p className="text-xs text-orange-500 mt-0.5">
                  미확인: {result.missingFields[i].join(', ')}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2 p-4">
        <button
          onClick={handleAddSelected}
          disabled={!selected.some(Boolean)}
          className="flex-1 flex items-center justify-center gap-1.5 bg-[#6C63FF] text-white rounded-full py-2.5 text-sm font-medium disabled:opacity-50 hover:bg-[#5A52E8] transition-colors"
        >
          <Check size={14} />
          선택 항목 추가 ({selected.filter(Boolean).length}개)
        </button>
      </div>
    </div>
  )
}
