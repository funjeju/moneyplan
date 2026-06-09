# Life Responsibility OS — cards.md
> 신용카드 등록, 혜택 달성률, 절약 시뮬레이션 구현 가이드

---

## 1. 기능 개요

이 모듈이 다루는 것:
- 신용카드/체크카드 등록 및 혜택 정보 입력
- 등록된 항목 기준으로 이번달 카드 실적 자동 계산
- 혜택별 달성률 및 예상 할인액 실시간 표시
- 절약 시뮬레이션 ("이 항목을 이 카드로 바꾸면 혜택 달성")

이 모듈이 다루지 않는 것:
- 실제 카드사 API 연동 (마이데이터)
- 실제 결제 내역 조회
- 포인트 잔액 조회

**전제:** 모든 실적은 사용자가 등록한 항목(ResponsibilityItem)의 `paymentCardId`를 기준으로 계산한다.

---

## 2. 카드 등록 폼 (`components/cards/CardForm.tsx`)

```tsx
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
  const [cardType, setCardType] = useState<'credit' | 'debit'>(initialData?.cardType ?? 'credit')
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
      {/* 카드 미리보기 */}
      <div
        className="rounded-2xl p-5 text-white shadow-lg"
        style={{ background: `linear-gradient(135deg, ${color}, ${color}bb)` }}
      >
        <div className="text-sm opacity-80 mb-8">{issuer || '카드사'}</div>
        <div className="text-lg font-semibold">{name || '카드명'}</div>
        {last4 && <div className="text-sm opacity-70 mt-1">•••• •••• •••• {last4}</div>}
      </div>

      {/* 기본 정보 */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">카드명 *</label>
          <Input value={name} onChange={e => setName(e.target.value)} placeholder="Deep Dream 카드" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">발급사 *</label>
          <Select value={issuer} onValueChange={setIssuer}>
            <SelectTrigger><SelectValue placeholder="카드사 선택" /></SelectTrigger>
            <SelectContent>
              {CARD_ISSUERS.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">카드 종류</label>
          <Select value={cardType} onValueChange={(v: any) => setCardType(v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="credit">신용카드</SelectItem>
              <SelectItem value="debit">체크카드</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">끝 4자리</label>
          <Input value={last4} onChange={e => setLast4(e.target.value)} maxLength={4} placeholder="1234" />
        </div>
      </div>

      {/* 카드 색상 */}
      <div>
        <label className="text-xs text-muted-foreground mb-2 block">카드 색상</label>
        <div className="flex gap-2">
          {CARD_COLORS.map(c => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`w-8 h-8 rounded-full border-2 transition-transform ${color === c ? 'border-foreground scale-110' : 'border-transparent'}`}
              style={{ background: c }}
            />
          ))}
        </div>
      </div>

      {/* 혜택 추가 */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium">카드 혜택</label>
          <Button variant="outline" size="sm" onClick={addBenefit}>
            <Plus size={14} className="mr-1" /> 혜택 추가
          </Button>
        </div>

        <div className="space-y-3">
          {benefits.map((benefit, i) => (
            <BenefitRow
              key={benefit.id}
              benefit={benefit}
              onChange={(field, value) => updateBenefit(i, field, value)}
              onRemove={() => removeBenefit(i)}
            />
          ))}
          {benefits.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-4 border border-dashed border-border rounded-xl">
              혜택을 추가하면 달성률을 자동으로 계산합니다
            </p>
          )}
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <Button variant="outline" onClick={onCancel} className="flex-1">취소</Button>
        <Button onClick={handleSave} className="flex-1">저장</Button>
      </div>
    </div>
  )
}

function BenefitRow({ benefit, onChange, onRemove }: {
  benefit: Partial<CardBenefit>
  onChange: (field: string, value: any) => void
  onRemove: () => void
}) {
  return (
    <div className="p-3 border border-border rounded-xl space-y-2.5">
      <div className="flex items-center gap-2">
        <Input
          value={benefit.description ?? ''}
          onChange={e => onChange('description', e.target.value)}
          placeholder="예: 통신비 10,000원 할인"
          className="flex-1 text-sm"
        />
        <button onClick={onRemove} className="text-muted-foreground hover:text-danger p-1">
          <Trash2 size={14} />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">월 실적 조건 (원)</label>
          <Input
            type="number"
            value={benefit.conditionAmount ?? ''}
            onChange={e => onChange('conditionAmount', Number(e.target.value))}
            placeholder="300000"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">할인 금액 (원)</label>
          <Input
            type="number"
            value={benefit.discountAmount ?? ''}
            onChange={e => onChange('discountAmount', Number(e.target.value))}
            placeholder="10000"
          />
        </div>
      </div>
    </div>
  )
}
```

---

## 3. 카드 상세 대시보드 (`components/cards/CardDetail.tsx`)

```tsx
'use client'
import { useMemo } from 'react'
import { Progress } from '@/components/ui/progress'
import { Check, AlertCircle, ArrowRight } from 'lucide-react'
import { calculateBenefitAchievement } from '@/lib/utils/card'
import { toMonthlyAmount, fmtMoney } from '@/lib/utils'
import { ItemCard } from '@/components/items/ItemCard'
import type { CreditCard, ResponsibilityItem } from '@/lib/types'

interface Props {
  card: CreditCard
  allItems: ResponsibilityItem[]
}

export function CardDetail({ card, allItems }: Props) {
  const cardItems = useMemo(
    () => allItems.filter(i => i.paymentCardId === card.id && i.status === 'active'),
    [allItems, card.id]
  )

  const monthlyTotal = useMemo(
    () => cardItems.reduce((sum, i) => sum + toMonthlyAmount(i), 0),
    [cardItems]
  )

  const achievements = useMemo(
    () => calculateBenefitAchievement(card, allItems),
    [card, allItems]
  )

  // 절약 시뮬레이션: 다른 카드 항목을 이 카드로 옮겼을 때
  const simulations = useMemo(() => {
    if (achievements.every(a => a.isAchieved)) return []
    const unachieved = achievements.filter(a => !a.isAchieved)
    const otherItems = allItems.filter(
      i => i.paymentCardId !== card.id && i.status === 'active'
    )

    return unachieved.flatMap(ach => {
      const needed = ach.remaining
      const candidates = otherItems
        .map(item => ({ item, monthly: toMonthlyAmount(item) }))
        .filter(c => c.monthly > 0)
        .sort((a, b) => Math.abs(a.monthly - needed) - Math.abs(b.monthly - needed))
        .slice(0, 2)

      return candidates.map(c => ({
        benefit: ach.description,
        item: c.item,
        newMonthly: monthlyTotal + c.monthly,
        gain: ach.estimatedDiscount,
      }))
    })
  }, [achievements, allItems, card.id, monthlyTotal])

  return (
    <div className="space-y-6">
      {/* 카드 시각화 */}
      <div
        className="rounded-2xl p-6 text-white shadow-lg aspect-[1.586/1]"
        style={{ background: `linear-gradient(135deg, ${card.color ?? '#1A1D29'}, ${card.color ?? '#1A1D29'}bb)` }}
      >
        <div className="flex flex-col h-full justify-between">
          <div className="text-sm opacity-70">{card.issuer}</div>
          <div>
            <div className="text-lg font-semibold">{card.name}</div>
            {card.last4Digits && (
              <div className="text-sm opacity-60 mt-1">•••• •••• •••• {card.last4Digits}</div>
            )}
          </div>
        </div>
      </div>

      {/* 이번달 실적 */}
      <div className="bg-white rounded-2xl p-4 border border-border shadow-card">
        <h3 className="text-sm font-semibold mb-3">이번달 실적</h3>
        <div className="text-2xl font-bold tabular-nums mb-1">
          {fmtMoney(monthlyTotal)}
        </div>
        <p className="text-xs text-muted-foreground mb-4">{cardItems.length}개 항목 기준 (등록 항목 합산)</p>

        {/* 혜택별 달성률 */}
        {achievements.length > 0 ? (
          <div className="space-y-3">
            {achievements.map(ach => (
              <div key={ach.benefitId}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    {ach.isAchieved
                      ? <Check size={13} className="text-success" />
                      : <AlertCircle size={13} className="text-warning" />}
                    <span className="text-xs font-medium">{ach.description}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {Math.round(ach.rate * 100)}%
                  </span>
                </div>
                <Progress value={Math.min(ach.rate * 100, 100)} className="h-1.5" />
                {!ach.isAchieved && ach.remaining > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {fmtMoney(ach.remaining)} 더 쓰면 {fmtMoney(ach.estimatedDiscount)} 할인 달성
                  </p>
                )}
                {ach.isAchieved && (
                  <p className="text-xs text-success mt-1">
                    ✅ {fmtMoney(ach.estimatedDiscount)} 할인 예정
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">등록된 혜택 조건이 없습니다</p>
        )}
      </div>

      {/* 절약 시뮬레이션 */}
      {simulations.length > 0 && (
        <div className="bg-primary/5 rounded-2xl p-4 border border-primary/20">
          <h3 className="text-sm font-semibold text-primary mb-3">💡 절약 시뮬레이션</h3>
          <div className="space-y-2.5">
            {simulations.map((sim, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <ArrowRight size={14} className="text-primary mt-0.5 flex-shrink-0" />
                <p className="text-xs">
                  <span className="font-medium">{sim.item.name}</span>을 이 카드로 변경하면
                  <br />
                  실적 {fmtMoney(sim.newMonthly)} 달성 →
                  <span className="text-primary font-medium"> {sim.benefit}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 이 카드로 결제 중인 항목 */}
      <div>
        <h3 className="text-sm font-semibold mb-3">
          결제 중인 항목 ({cardItems.length}개)
        </h3>
        {cardItems.length > 0 ? (
          <div className="space-y-2">
            {cardItems.map(item => (
              <div key={item.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <span className="text-sm">{item.name}</span>
                <span className="text-sm font-medium tabular-nums">{fmtMoney(toMonthlyAmount(item))}/월</span>
              </div>
            ))}
            <div className="flex items-center justify-between pt-2 font-semibold">
              <span className="text-sm">합계</span>
              <span className="text-sm tabular-nums text-primary">{fmtMoney(monthlyTotal)}/월</span>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            이 카드로 결제 중인 항목이 없어요
          </p>
        )}
      </div>
    </div>
  )
}
```

---

## 4. 카드 혜택 달성 계산 유틸 (`lib/utils/card.ts`)

```typescript
import { toMonthlyAmount } from '@/lib/utils'
import type { CreditCard, ResponsibilityItem, CardBenefit } from '@/lib/types'

export interface BenefitAchievement {
  benefitId: string
  description: string
  required: number
  achieved: number
  rate: number
  estimatedDiscount: number
  remaining: number
  isAchieved: boolean
}

export function calculateBenefitAchievement(
  card: CreditCard,
  items: ResponsibilityItem[]
): BenefitAchievement[] {
  const cardItems = items.filter(i => i.paymentCardId === card.id && i.status === 'active')
  const monthlyTotal = cardItems.reduce((sum, i) => sum + toMonthlyAmount(i), 0)

  return card.benefits
    .filter(b => b.isActive)
    .map(benefit => {
      // 카테고리 조건이 있으면 해당 카테고리 항목만 계산
      const relevantItems = benefit.applicableCategories?.length
        ? cardItems.filter(i => benefit.applicableCategories!.includes(i.category as any))
        : cardItems

      const achieved = relevantItems.reduce((sum, i) => sum + toMonthlyAmount(i), 0)
      const required = benefit.conditionAmount ?? 0
      const rate = required > 0 ? Math.min(achieved / required, 1) : 1

      const estimatedDiscount = rate >= 1
        ? benefit.discountAmount ?? Math.min(
            Math.floor(achieved * (benefit.discountRate ?? 0)),
            benefit.discountCap ?? Infinity
          )
        : 0

      return {
        benefitId: benefit.id,
        description: benefit.description,
        required,
        achieved,
        rate,
        estimatedDiscount,
        remaining: Math.max(0, required - achieved),
        isAchieved: rate >= 1,
      }
    })
}

/** 전체 카드의 이달 예상 절약액 합산 */
export function getTotalExpectedSavings(
  cards: CreditCard[],
  items: ResponsibilityItem[]
): number {
  return cards.reduce((total, card) => {
    const achievements = calculateBenefitAchievement(card, items)
    const cardSavings = achievements.reduce((s, a) => s + a.estimatedDiscount, 0)
    return total + cardSavings
  }, 0)
}
```

---

## 5. 카드 목록 페이지 (`app/(dashboard)/cards/page.tsx`)

```tsx
'use client'
import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useCards } from '@/hooks/useCards'
import { useItems } from '@/hooks/useItems'
import { calculateBenefitAchievement, getTotalExpectedSavings } from '@/lib/utils/card'
import { fmtMoney } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { CardForm } from '@/components/cards/CardForm'
import { CardDetail } from '@/components/cards/CardDetail'

export default function CardsPage() {
  const { cards, addCard } = useCards()
  const { items } = useItems()
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null)

  const totalSavings = getTotalExpectedSavings(cards, items)
  const selectedCard = cards.find(c => c.id === selectedCardId)

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">카드 관리</h1>
          {totalSavings > 0 && (
            <p className="text-sm text-success mt-0.5">
              이번달 예상 혜택: {fmtMoney(totalSavings)}
            </p>
          )}
        </div>
        <Button onClick={() => setShowAddForm(true)} size="sm">
          <Plus size={14} className="mr-1" /> 카드 추가
        </Button>
      </div>

      {/* 카드 그리드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map(card => {
          const achievements = calculateBenefitAchievement(card, items)
          const topRate = Math.max(...achievements.map(a => a.rate), 0)

          return (
            <button
              key={card.id}
              onClick={() => setSelectedCardId(card.id)}
              className="text-left rounded-2xl overflow-hidden border border-border shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all"
            >
              {/* 미니 카드 */}
              <div
                className="p-4 text-white"
                style={{ background: `linear-gradient(135deg, ${card.color ?? '#1A1D29'}, ${card.color ?? '#1A1D29'}bb)` }}
              >
                <p className="text-xs opacity-70">{card.issuer}</p>
                <p className="text-sm font-semibold mt-1">{card.name}</p>
              </div>
              {/* 실적 요약 */}
              <div className="bg-white p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">혜택 달성률</span>
                  <span className={`text-xs font-semibold ${topRate >= 1 ? 'text-success' : 'text-warning'}`}>
                    {Math.round(topRate * 100)}%
                  </span>
                </div>
              </div>
            </button>
          )
        })}

        {cards.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            <div className="text-4xl mb-3">💳</div>
            <p className="text-sm">등록된 카드가 없어요</p>
            <p className="text-xs mt-1">카드를 등록하면 혜택 달성률을 계산해드려요</p>
          </div>
        )}
      </div>

      {/* 카드 추가 다이얼로그 */}
      <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>카드 추가</DialogTitle></DialogHeader>
          <CardForm
            onSave={data => { addCard(data); setShowAddForm(false) }}
            onCancel={() => setShowAddForm(false)}
          />
        </DialogContent>
      </Dialog>

      {/* 카드 상세 사이드 패널 */}
      {selectedCard && (
        <Dialog open={!!selectedCardId} onOpenChange={() => setSelectedCardId(null)}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{selectedCard.name}</DialogTitle></DialogHeader>
            <CardDetail card={selectedCard} allItems={items} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
```
