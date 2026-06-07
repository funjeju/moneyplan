'use client'
import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { CreditCard, CardBenefit } from '@/lib/types'

const CARD_ISSUERS = [
  '신한카드', '삼성카드', '현대카드', 'KB국민카드',
  '롯데카드', '우리카드', '하나카드', 'BC카드',
  'NH농협카드', 'IBK기업은행', '씨티카드', '카카오뱅크',
]

const CARD_COLORS = [
  '#1A1D29', '#6C63FF', '#32C48D', '#FF6B6B',
  '#FFB84D', '#4A90D9', '#8B5CF6', '#EC4899',
]

interface Props {
  initialData?: Partial<CreditCard>
  onSave: (data: Omit<CreditCard, 'id' | 'userId' | 'createdAt'>) => void
  onCancel: () => void
}

export function CardForm({ initialData, onSave, onCancel }: Props) {
  const [name, setName] = useState(initialData?.name ?? '')
  const [issuer, setIssuer] = useState(initialData?.issuer ?? '')
  const [cardType, setCardType] = useState<'credit' | 'debit'>(
    (initialData?.cardType === 'prepaid' ? 'credit' : initialData?.cardType) ?? 'credit'
  )
  const [last4, setLast4] = useState(initialData?.last4Digits ?? '')
  const [color, setColor] = useState(initialData?.color ?? CARD_COLORS[0])
  const [isPrimary, setIsPrimary] = useState(initialData?.isPrimary ?? false)
  const [benefits, setBenefits] = useState<Partial<CardBenefit>[]>(initialData?.benefits ?? [])

  const addBenefit = () => {
    setBenefits(prev => [...prev, {
      id: Date.now().toString(),
      description: '',
      conditionType: 'min_spend',
      conditionAmount: 300000,
      discountAmount: 10000,
      isActive: true,
    }])
  }

  const updateBenefit = (index: number, field: string, value: any) => {
    setBenefits(prev => prev.map((b, i) => i === index ? { ...b, [field]: value } : b))
  }

  const removeBenefit = (index: number) => {
    setBenefits(prev => prev.filter((_, i) => i !== index))
  }

  const handleSave = () => {
    if (!name || !issuer) return
    onSave({
      name, issuer, cardType,
      last4Digits: last4,
      color,
      isPrimary,
      isActive: true,
      benefits: benefits.filter(b => b.description) as CardBenefit[],
    })
  }

  return (
    <div className="space-y-5">
      <div
        className="rounded-2xl p-5 text-white shadow-lg"
        style={{ background: `linear-gradient(135deg, ${color}, ${color}bb)` }}
      >
        <div className="text-sm opacity-80 mb-8">{issuer || '카드사'}</div>
        <div className="text-lg font-semibold">{name || '카드명'}</div>
        {last4 && <div className="text-sm opacity-70 mt-1">•••• •••• •••• {last4}</div>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-400 mb-1 block">카드명 *</label>
          <Input value={name} onChange={e => setName(e.target.value)} placeholder="Deep Dream 카드" />
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1 block">발급사 *</label>
          <Select value={issuer} onValueChange={(v) => v && setIssuer(v)}>
            <SelectTrigger><SelectValue placeholder="카드사 선택" /></SelectTrigger>
            <SelectContent>
              {CARD_ISSUERS.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1 block">카드 종류</label>
          <Select value={cardType} onValueChange={(v) => v && setCardType(v as 'credit' | 'debit')}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="credit">신용카드</SelectItem>
              <SelectItem value="debit">체크카드</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1 block">끝 4자리</label>
          <Input value={last4} onChange={e => setLast4(e.target.value)} maxLength={4} placeholder="1234" />
        </div>
      </div>

      <div>
        <label className="text-xs text-gray-400 mb-2 block">카드 색상</label>
        <div className="flex gap-2">
          {CARD_COLORS.map(c => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`w-8 h-8 rounded-full border-2 transition-transform ${color === c ? 'border-gray-800 scale-110' : 'border-transparent'}`}
              style={{ background: c }}
            />
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium">카드 혜택</label>
          <Button variant="outline" size="sm" onClick={addBenefit}>
            <Plus size={14} className="mr-1" /> 혜택 추가
          </Button>
        </div>

        <div className="space-y-3">
          {benefits.map((benefit, i) => (
            <div key={benefit.id ?? i} className="p-3 border border-gray-200 rounded-xl space-y-2.5">
              <div className="flex items-center gap-2">
                <Input
                  value={benefit.description ?? ''}
                  onChange={e => updateBenefit(i, 'description', e.target.value)}
                  placeholder="예: 통신비 10,000원 할인"
                  className="flex-1 text-sm"
                />
                <button onClick={() => removeBenefit(i)} className="text-gray-400 hover:text-red-500 p-1">
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">월 실적 조건 (원)</label>
                  <Input
                    type="number"
                    value={benefit.conditionAmount ?? ''}
                    onChange={e => updateBenefit(i, 'conditionAmount', Number(e.target.value))}
                    placeholder="300000"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">할인 금액 (원)</label>
                  <Input
                    type="number"
                    value={benefit.discountAmount ?? ''}
                    onChange={e => updateBenefit(i, 'discountAmount', Number(e.target.value))}
                    placeholder="10000"
                  />
                </div>
              </div>
            </div>
          ))}
          {benefits.length === 0 && (
            <p className="text-xs text-gray-400 text-center py-4 border border-dashed border-gray-200 rounded-xl">
              혜택을 추가하면 달성률을 자동으로 계산합니다
            </p>
          )}
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <Button variant="outline" onClick={onCancel} className="flex-1">취소</Button>
        <Button onClick={handleSave} className="flex-1 bg-[#6C63FF] hover:bg-[#5A52E8]" disabled={!name || !issuer}>
          저장
        </Button>
      </div>
    </div>
  )
}
