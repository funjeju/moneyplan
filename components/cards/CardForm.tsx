'use client'
import { useState, useEffect } from 'react'
import { Plus, Trash2, Search, ChevronLeft, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { CreditCard, CardBenefit } from '@/lib/types'

const CARD_COLORS = [
  '#1A1D29', '#6C63FF', '#32C48D', '#FF6B6B',
  '#FFB84D', '#4A90D9', '#8B5CF6', '#EC4899',
]

const ISSUER_COLORS: Record<string, string> = {
  '신한카드': '#0046FF', '삼성카드': '#1428A0', '현대카드': '#000000',
  'KB국민카드': '#FFBC00', '롯데카드': '#ED1C24', '우리카드': '#005BAC',
  '하나카드': '#009B6E', 'BC카드': '#E60012', 'NH농협카드': '#009944',
  'IBK기업은행': '#006AB3', '씨티카드': '#003B6F', '카카오뱅크': '#FAE100',
  '토스뱅크': '#0064FF',
}

interface SearchResult {
  name: string
  cleanName: string
  issuer: string
  topBenefit: string
  annualFeeAndRequirement: string
  benefits: Array<{ 항목: string; 내용: string }>
}

interface IssuerItem {
  issuer: string
  count: number
}

type Step = 'issuer' | 'card' | 'detail'

interface Props {
  initialData?: Partial<CreditCard>
  onSave: (data: Omit<CreditCard, 'id' | 'userId' | 'createdAt'>) => void
  onCancel: () => void
}

export function CardForm({ initialData, onSave, onCancel }: Props) {
  const isEdit = !!initialData?.name

  // 폼 상태
  const [name, setName] = useState(initialData?.name ?? '')
  const [issuer, setIssuer] = useState(initialData?.issuer ?? '')
  const [cardType, setCardType] = useState<'credit' | 'debit'>(
    (initialData?.cardType === 'prepaid' ? 'credit' : initialData?.cardType) ?? 'credit'
  )
  const [last4, setLast4] = useState(initialData?.last4Digits ?? '')
  const [color, setColor] = useState(initialData?.color ?? CARD_COLORS[0])
  const [isPrimary, setIsPrimary] = useState(initialData?.isPrimary ?? false)
  const [benefits, setBenefits] = useState<Partial<CardBenefit>[]>(initialData?.benefits ?? [])

  // 검색 UI 상태
  const [step, setStep] = useState<Step>(isEdit ? 'detail' : 'issuer')
  const [issuers, setIssuers] = useState<IssuerItem[]>([])
  const [selectedIssuer, setSelectedIssuer] = useState('')
  const [cardList, setCardList] = useState<SearchResult[]>([])
  const [cardSearch, setCardSearch] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // 발급사 목록 로드
  useEffect(() => {
    if (step !== 'issuer') return
    fetch('/api/cards/search?issuers=1')
      .then(r => r.json())
      .then(setIssuers)
  }, [step])

  // 카드사 선택 시 카드 목록 로드
  const selectIssuer = async (issuerName: string) => {
    setSelectedIssuer(issuerName)
    setIsLoading(true)
    try {
      const res = await fetch(`/api/cards/search?issuer=${encodeURIComponent(issuerName)}`)
      const data: SearchResult[] = await res.json()
      setCardList(data)
      setStep('card')
    } finally {
      setIsLoading(false)
    }
  }

  // 카드 검색 (키워드)
  const handleCardSearch = async (q: string) => {
    setCardSearch(q)
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (selectedIssuer) params.set('issuer', selectedIssuer)
      if (q) params.set('q', q)
      const res = await fetch(`/api/cards/search?${params}`)
      const data: SearchResult[] = await res.json()
      setCardList(data)
    } finally {
      setIsLoading(false)
    }
  }

  // 카드 선택 → 혜택 자동완성
  const selectCard = (card: SearchResult) => {
    setName(card.cleanName)
    setIssuer(card.issuer)
    const issuerColor = ISSUER_COLORS[card.issuer]
    if (issuerColor) setColor(issuerColor)

    const newBenefits: Partial<CardBenefit>[] = card.benefits.map((b, i) => {
      const discountMatch = b.내용.match(/(\d+)%/)
      const amountMatch = b.내용.match(/([0-9,]+)원/)
      const condMatch = card.annualFeeAndRequirement.match(/([0-9,]+)만?원\s*이상/)
      const rawCond = condMatch ? condMatch[1].replace(',', '') : '30'
      const condAmount = card.annualFeeAndRequirement.includes('만원')
        ? parseInt(rawCond) * 10000
        : parseInt(rawCond)

      return {
        id: Date.now().toString() + i,
        description: `${b.항목}: ${b.내용}`,
        conditionType: 'min_spend' as const,
        conditionAmount: isNaN(condAmount) ? 300000 : condAmount,
        discountRate: discountMatch ? parseInt(discountMatch[1]) : undefined,
        discountAmount: amountMatch && !discountMatch ? parseInt(amountMatch[1].replace(',', '')) : undefined,
        isActive: true,
      }
    })
    setBenefits(newBenefits)
    setStep('detail')
  }

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

  // ── Step 1: 카드사 선택 ──
  if (step === 'issuer') {
    return (
      <div>
        <p className="text-sm text-gray-500 mb-4">카드사를 선택하세요</p>
        {issuers.length === 0 ? (
          <div className="grid grid-cols-3 gap-2">
            {[...Array(9)].map((_, i) => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {issuers.map(({ issuer: name, count }) => (
              <button
                key={name}
                onClick={() => selectIssuer(name)}
                className="flex flex-col items-center justify-center gap-1 p-3 rounded-xl border border-gray-100 hover:border-[#6C63FF]/40 hover:bg-[#6C63FF]/5 transition-all"
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold"
                  style={{ background: ISSUER_COLORS[name] ?? '#888' }}
                >
                  {name.replace('카드', '').replace('은행', '').slice(0, 2)}
                </div>
                <span className="text-xs font-medium text-center leading-tight">{name}</span>
                <span className="text-[10px] text-gray-400">{count}종</span>
              </button>
            ))}
          </div>
        )}
        <Button variant="outline" onClick={onCancel} className="w-full mt-4">취소</Button>
      </div>
    )
  }

  // ── Step 2: 카드 목록/검색 ──
  if (step === 'card') {
    const filtered = cardSearch
      ? cardList
      : cardList

    return (
      <div>
        <div className="flex items-center gap-2 mb-4">
          <button onClick={() => setStep('issuer')} className="p-1.5 rounded-lg hover:bg-gray-100">
            <ChevronLeft size={18} />
          </button>
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
            style={{ background: ISSUER_COLORS[selectedIssuer] ?? '#888' }}
          >
            {selectedIssuer.replace('카드', '').replace('은행', '').slice(0, 2)}
          </div>
          <span className="text-sm font-semibold">{selectedIssuer}</span>
          <span className="text-xs text-gray-400 ml-auto">{cardList.length}종</span>
        </div>

        <div className="relative mb-3">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={cardSearch}
            onChange={e => handleCardSearch(e.target.value)}
            placeholder="카드명, 혜택 키워드 검색 (예: 통신비, OTT)"
            className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2.5 pl-9 pr-4 text-sm outline-none focus:border-[#6C63FF]/40 placeholder:text-gray-400"
          />
        </div>

        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
          {isLoading ? (
            [...Array(5)].map((_, i) => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)
          ) : filtered.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">검색 결과가 없어요</p>
          ) : (
            filtered.map((card, i) => (
              <button
                key={i}
                onClick={() => selectCard(card)}
                className="w-full text-left p-3 rounded-xl border border-gray-100 hover:border-[#6C63FF]/30 hover:bg-[#6C63FF]/5 transition-all"
              >
                <p className="text-sm font-medium">{card.cleanName}</p>
                <p className="text-xs text-[#6C63FF] mt-0.5">{card.topBenefit}</p>
                <p className="text-xs text-gray-400 mt-0.5 truncate">{card.annualFeeAndRequirement}</p>
              </button>
            ))
          )}
        </div>
        <Button variant="outline" onClick={() => setStep('issuer')} className="w-full mt-3">카드사 다시 선택</Button>
      </div>
    )
  }

  // ── Step 3: 카드 상세 정보 입력 ──
  return (
    <div className="space-y-5">
      {/* 카드 미리보기 */}
      <div
        className="rounded-2xl p-5 text-white shadow-lg min-h-[100px]"
        style={{ background: `linear-gradient(135deg, ${color}, ${color}99)` }}
      >
        <div className="text-sm opacity-80 mb-5">{issuer}</div>
        <div className="text-lg font-semibold">{name}</div>
        {last4 && <div className="text-sm opacity-70 mt-1">•••• •••• •••• {last4}</div>}
      </div>

      {!isEdit && (
        <button
          onClick={() => setStep('card')}
          className="flex items-center gap-1.5 text-xs text-[#6C63FF] hover:underline"
        >
          <ChevronLeft size={13} /> 다른 카드 선택
        </button>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-400 mb-1 block">카드명</label>
          <Input value={name} onChange={e => setName(e.target.value)} />
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
        <div className="flex gap-2 flex-wrap">
          {CARD_COLORS.map(c => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`w-8 h-8 rounded-full border-2 transition-transform flex items-center justify-center ${color === c ? 'border-gray-800 scale-110' : 'border-transparent'}`}
              style={{ background: c }}
            >
              {color === c && <Check size={12} className="text-white" />}
            </button>
          ))}
        </div>
      </div>

      {/* 혜택 */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-sm font-medium">카드 혜택</span>
            {benefits.length > 0 && (
              <span className="text-xs text-[#6C63FF] ml-2">{benefits.length}개</span>
            )}
          </div>
          <Button variant="outline" size="sm" onClick={addBenefit}>
            <Plus size={14} className="mr-1" /> 추가
          </Button>
        </div>
        <div className="space-y-3">
          {benefits.map((benefit, i) => (
            <div key={benefit.id ?? i} className="p-3 border border-gray-200 rounded-xl space-y-2">
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
                  <label className="text-xs text-gray-400 mb-1 block">전월실적 조건 (원)</label>
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
              혜택 없음 — 직접 추가하거나 카드 재선택 시 자동완성
            </p>
          )}
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input type="checkbox" checked={isPrimary} onChange={e => setIsPrimary(e.target.checked)} className="rounded" />
        주 사용 카드로 설정
      </label>

      <div className="flex gap-2 pt-2">
        <Button variant="outline" onClick={onCancel} className="flex-1">취소</Button>
        <Button onClick={handleSave} className="flex-1 bg-[#6C63FF] hover:bg-[#5A52E8]" disabled={!name || !issuer}>
          저장
        </Button>
      </div>
    </div>
  )
}
