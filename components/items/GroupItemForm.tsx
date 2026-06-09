'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { ResponsibilityItem, CategorySlug, PaymentCycle } from '@/lib/types'

interface Props {
  groupCategory: CategorySlug
  groupCycle?: PaymentCycle
  groupDayOfMonth?: number
  groupProvider?: string
  groupPaymentMethod?: string
  onSave: (data: Partial<ResponsibilityItem>) => void
  onCancel: () => void
}

export function GroupItemForm({
  groupCategory,
  groupCycle = 'monthly',
  groupDayOfMonth,
  groupProvider,
  groupPaymentMethod,
  onSave,
  onCancel,
}: Props) {
  const [name, setName] = useState('')
  const [isNegative, setIsNegative] = useState(false)
  const [amountStr, setAmountStr] = useState('')
  const [memo, setMemo] = useState('')

  const handleSave = () => {
    if (!name || !amountStr) return
    const abs = Math.abs(Number(amountStr))
    onSave({
      name,
      category: groupCategory,
      cycle: groupCycle,
      dayOfMonth: groupDayOfMonth,
      provider: groupProvider,
      paymentMethod: groupPaymentMethod,
      amount: isNegative ? -abs : abs,
      memo: memo || undefined,
      status: 'active',
      aiParsed: false,
    })
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs text-gray-500 mb-1 block">항목명 *</label>
        <Input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="예: SKT 통신 할인, 결합 할인 등"
          autoFocus
        />
      </div>

      <div>
        <label className="text-xs text-gray-500 mb-1 block">금액 *</label>
        <div className="flex gap-2">
          <div className="flex rounded-lg border border-input overflow-hidden flex-shrink-0">
            <button
              type="button"
              onClick={() => setIsNegative(false)}
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                !isNegative ? 'bg-gray-800 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'
              }`}
            >
              + 추가
            </button>
            <button
              type="button"
              onClick={() => setIsNegative(true)}
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                isNegative ? 'bg-blue-500 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'
              }`}
            >
              − 할인
            </button>
          </div>
          <Input
            type="number"
            value={amountStr}
            onChange={e => setAmountStr(e.target.value)}
            placeholder="금액 입력"
            className="flex-1"
          />
        </div>
        {amountStr && (
          <p className={`text-xs mt-1 ${isNegative ? 'text-blue-500' : 'text-gray-500'}`}>
            {isNegative ? `−${Number(amountStr).toLocaleString()}원 (할인/감면)` : `+${Number(amountStr).toLocaleString()}원`}
          </p>
        )}
      </div>

      <div>
        <label className="text-xs text-gray-500 mb-1 block">메모</label>
        <textarea
          value={memo}
          onChange={e => setMemo(e.target.value)}
          placeholder="할인 조건, 비고 등"
          rows={2}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div className="flex gap-2 pt-1">
        <Button variant="outline" onClick={onCancel} className="flex-1">취소</Button>
        <Button onClick={handleSave} className="flex-1" disabled={!name || !amountStr}>
          저장
        </Button>
      </div>
    </div>
  )
}
