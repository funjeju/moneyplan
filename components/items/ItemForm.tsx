'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CATEGORY_META } from '@/lib/utils/category'
import { useGroups } from '@/hooks/useGroups'
import { useCards } from '@/hooks/useCards'
import type { ResponsibilityItem, CategorySlug, PaymentCycle } from '@/lib/types'

const CURRENCY_OPTIONS = [
  { value: 'KRW', label: '₩ 원 (KRW)' },
  { value: 'USD', label: '$ 달러 (USD)' },
  { value: 'EUR', label: '€ 유로 (EUR)' },
  { value: 'JPY', label: '¥ 엔 (JPY)' },
  { value: 'GBP', label: '£ 파운드 (GBP)' },
  { value: 'CNY', label: '¥ 위안 (CNY)' },
]

interface Props {
  initialData?: Partial<ResponsibilityItem>
  onSave: (data: Partial<ResponsibilityItem>) => void
  onCancel: () => void
}

const CYCLE_OPTIONS: { value: PaymentCycle; label: string }[] = [
  { value: 'monthly', label: '매월' },
  { value: 'bimonthly', label: '2개월' },
  { value: 'quarterly', label: '분기(3개월)' },
  { value: 'semiannual', label: '반기(6개월)' },
  { value: 'yearly', label: '매년' },
  { value: 'once', label: '일회성' },
]

export function ItemForm({ initialData, onSave, onCancel }: Props) {
  const { groups } = useGroups()
  const { cards } = useCards()
  const [name, setName] = useState(initialData?.name ?? '')
  const [category, setCategory] = useState<CategorySlug>(initialData?.category ?? 'subscription')
  const [groupId, setGroupId] = useState<string>(initialData?.groupId ?? '')
  const [currency, setCurrency] = useState<string>(initialData?.currency ?? 'KRW')
  const [amount, setAmount] = useState(initialData?.amount?.toString() ?? '')
  const [cycle, setCycle] = useState<PaymentCycle>(initialData?.cycle ?? 'monthly')
  const [dayOfMonth, setDayOfMonth] = useState(initialData?.dayOfMonth?.toString() ?? '')
  const [provider, setProvider] = useState(initialData?.provider ?? '')
  const [paymentCardId, setPaymentCardId] = useState<string>(initialData?.paymentCardId ?? '')
  const [paymentMethod, setPaymentMethod] = useState(initialData?.paymentMethod ?? '')
  const [contractEndDate, setContractEndDate] = useState('')
  const [autoRenews, setAutoRenews] = useState(initialData?.autoRenews ?? false)
  const [isAutoPayment, setIsAutoPayment] = useState(initialData?.isAutoPayment ?? false)
  const [memo, setMemo] = useState(initialData?.memo ?? '')
  const [owner, setOwner] = useState(initialData?.owner ?? '')

  const handleSave = () => {
    if (!name || !amount) return
    const data: Partial<ResponsibilityItem> = {
      name,
      category,
      amount: Number(amount),
      currency: currency !== 'KRW' ? (currency as any) : undefined,
      cycle,
      provider,
      paymentCardId: paymentCardId || undefined,
      paymentMethod: paymentCardId
        ? (cards.find(c => c.id === paymentCardId)?.name ?? paymentMethod ?? undefined)
        : (paymentMethod || undefined),
      dayOfMonth: dayOfMonth ? Number(dayOfMonth) : undefined,
      autoRenews,
      isAutoPayment,
      memo: memo || undefined,
      owner: owner || undefined,
      status: 'active',
      aiParsed: false,
    }
    if (contractEndDate) {
      data.contractEndDate = new Date(contractEndDate) as any
    }
    if (groupId) data.groupId = groupId
    else data.groupId = undefined
    onSave(data)
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs text-gray-500 mb-1 block">항목명 *</label>
        <Input value={name} onChange={e => setName(e.target.value)} placeholder="넷플릭스, KT 인터넷 등" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-500 mb-1 block">카테고리 *</label>
          <Select value={category} onValueChange={(v) => v && setCategory(v as CategorySlug)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(CATEGORY_META).map(([slug, meta]) => (
                <SelectItem key={slug} value={slug}>{meta.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">결제 주기 *</label>
          <Select value={cycle} onValueChange={(v) => v && setCycle(v as PaymentCycle)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CYCLE_OPTIONS.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-500 mb-1 block">금액 *</label>
          <div className="flex gap-1">
            <Select value={currency} onValueChange={v => v && setCurrency(v)}>
              <SelectTrigger className="w-[90px] flex-shrink-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCY_OPTIONS.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="29900"
              className="flex-1"
            />
          </div>
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">납부일 (매월 N일)</label>
          <Input
            type="number"
            min={1}
            max={31}
            value={dayOfMonth}
            onChange={e => setDayOfMonth(e.target.value)}
            placeholder="25"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-500 mb-1 block">공급업체</label>
          <Input value={provider} onChange={e => setProvider(e.target.value)} placeholder="KT, 넷플릭스 등" />
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">결제 수단</label>
          {cards.length > 0 ? (
            <Select value={paymentCardId || '__manual__'} onValueChange={v => {
              if (!v || v === '__manual__') { setPaymentCardId('') }
              else { setPaymentCardId(v); setPaymentMethod('') }
            }}>
              <SelectTrigger>
                <SelectValue placeholder="카드 선택" />
              </SelectTrigger>
              <SelectContent>
                {cards.map(c => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name} {c.last4Digits ? `(${c.last4Digits})` : ''}
                  </SelectItem>
                ))}
                <SelectItem value="__manual__">직접 입력</SelectItem>
              </SelectContent>
            </Select>
          ) : null}
          {(cards.length === 0 || paymentCardId === '') && (
            <Input
              value={paymentMethod}
              onChange={e => setPaymentMethod(e.target.value)}
              placeholder="신한카드, 현대카드 등"
              className={cards.length > 0 ? 'mt-1' : ''}
            />
          )}
        </div>
      </div>

      <div>
        <label className="text-xs text-gray-500 mb-1 block">약정/계약 종료일</label>
        <Input
          type="date"
          value={contractEndDate}
          onChange={e => setContractEndDate(e.target.value)}
        />
      </div>

      <div>
        <label className="text-xs text-gray-500 mb-1 block">명의자</label>
        <Input value={owner} onChange={e => setOwner(e.target.value)} placeholder="홍길동" />
      </div>

      {groups.length > 0 && (
        <div>
          <label className="text-xs text-gray-500 mb-1 block">그룹</label>
          <Select value={groupId || '__none__'} onValueChange={v => setGroupId(v === '__none__' ? '' : (v ?? ''))}>
            <SelectTrigger>
              <SelectValue placeholder="그룹 없음" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">그룹 없음</SelectItem>
              {groups.map(g => (
                <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div>
        <label className="text-xs text-gray-500 mb-1 block">메모</label>
        <textarea
          value={memo}
          onChange={e => setMemo(e.target.value)}
          placeholder="할인 내역, 계약 조건 등 자유 메모"
          rows={3}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div className="flex gap-4">
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={autoRenews}
            onChange={e => setAutoRenews(e.target.checked)}
            className="rounded"
          />
          자동갱신
        </label>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={isAutoPayment}
            onChange={e => setIsAutoPayment(e.target.checked)}
            className="rounded"
          />
          자동이체
        </label>
      </div>

      <div className="flex gap-2 pt-2">
        <Button variant="outline" onClick={onCancel} className="flex-1">취소</Button>
        <Button onClick={handleSave} className="flex-1" disabled={!name || !amount}>
          저장
        </Button>
      </div>
    </div>
  )
}
