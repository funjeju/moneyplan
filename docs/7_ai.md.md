# Life Responsibility OS — ai.md
> Claude API 연동 구현 가이드 (파싱 + 채팅 + 분석)

---

## 1. 전체 AI 아키텍처

```
입력 채널
├── 텍스트 입력  → /api/ai/parse  → Claude Text API  → 구조화 JSON
├── 이미지 업로드 → /api/ai/parse  → Claude Vision   → 구조화 JSON
└── AI 채팅      → /api/ai/chat   → Claude Chat API  → 응답 + 액션

파싱 결과 흐름:
Claude API → ParseResponse → 미리보기 UI → 사용자 확인 → Firestore 저장
```

---

## 2. API 라우트 구현

### 2.1 텍스트·이미지 파싱 (`/api/ai/parse/route.ts`)

```typescript
import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic()

const PARSE_SYSTEM_PROMPT = `당신은 생활 재정 책임 관리 앱의 AI 파싱 엔진입니다.
사용자 입력에서 정기 지출, 계약, 구독, 보험, 세금 등의 항목을 추출합니다.

카테고리 분류 기준:
- telecom: 휴대폰, 인터넷, IPTV, 알뜰폰, 통신 관련
- utility: 전기, 수도, 도시가스, 관리비, 주차료
- insurance: 실손, 건강, 암, 치아, 운전자, 자동차보험, 화재, 생명
- subscription: OTT(넷플릭스/유튜브/티빙), 음악, 클라우드, AI, 소프트웨어
- rental: 정수기, 공기청정기, 비데, 안마의자, 렌터카
- tax: 재산세, 자동차세, 종합소득세, 부가세, 주민세
- penalty: 주정차, 속도위반, 신호위반, 과태료
- vehicle: 자동차보험, 자동차세, 정기검사, 하이패스
- housing: 월세, 전세대출이자, 관리비, 장기수선충당금
- finance: 대출이자, 카드연회비
- business: 도메인, 서버, 클라우드, SaaS, 임대료
- other: 위 카테고리에 해당하지 않는 것

응답 형식: 순수 JSON만. 마크다운, 설명 텍스트 없이.
{
  "items": [
    {
      "name": "항목명",
      "category": "카테고리 슬러그",
      "provider": "공급업체명 또는 null",
      "amount": 숫자 또는 null,
      "cycle": "monthly|bimonthly|quarterly|semiannual|yearly|once",
      "dayOfMonth": 숫자 또는 null,
      "contractEndDate": "YYYY-MM-DD 또는 null",
      "autoRenews": true|false|null,
      "paymentMethod": "카드/수단명 또는 null",
      "owner": "명의자 또는 null",
      "memo": "추가 정보 또는 null"
    }
  ],
  "confidence": 0.0~1.0,
  "missingFields": [["항목0의 누락 필드들"], ["항목1의 누락 필드들"]],
  "followUpQuestions": ["후속 질문1", "후속 질문2"]
}`

export async function POST(req: NextRequest) {
  const { type, content } = await req.json()

  const messages: Anthropic.MessageParam[] = type === 'image'
    ? [{
        role: 'user',
        content: [
          {
            type: 'image',
            source: { type: 'base64', media_type: 'image/jpeg', data: content },
          },
          {
            type: 'text',
            text: '이 이미지에서 정기 지출/계약 항목을 추출해주세요.',
          },
        ],
      }]
    : [{
        role: 'user',
        content: `다음 텍스트에서 정기 지출/계약 항목들을 추출해주세요:\n\n${content}`,
      }]

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    system: PARSE_SYSTEM_PROMPT,
    messages,
  })

  const raw = response.content
    .filter(b => b.type === 'text')
    .map(b => b.text)
    .join('')
    .replace(/```json|```/g, '')
    .trim()

  const parsed = JSON.parse(raw)
  return NextResponse.json(parsed)
}
```

---

### 2.2 AI 채팅 (`/api/ai/chat/route.ts`)

```typescript
import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic()

function buildChatSystemPrompt(userContext: UserContext): string {
  return `당신은 Life Responsibility OS의 AI 생활 비서입니다.
사용자의 생활 계약, 구독, 보험, 세금 등을 관리하는 앱의 어시스턴트입니다.

현재 사용자 데이터 요약:
- 총 ${userContext.totalItems}개 항목 등록
- 이번달 예상 지출: ${userContext.monthlyTotal.toLocaleString()}원
- 7일 내 납부 예정: ${userContext.urgentPayments}건
- 90일 내 만료 예정: ${userContext.expiringItems}건

등록된 항목 목록:
${userContext.items.map(i =>
  `- ${i.name} (${i.category}): ${i.amount.toLocaleString()}원/${i.cycle}, 납부일: 매월 ${i.dayOfMonth}일${i.contractEndDate ? `, 만료: ${i.contractEndDate}` : ''}`
).join('\n')}

등록된 카드:
${userContext.cards.map(c =>
  `- ${c.name}: 이번달 실적 ${c.monthlySpend?.toLocaleString() || 0}원`
).join('\n')}

응답 원칙:
1. 친근하고 간결하게 답변
2. 항목 추가/수정이 필요하면 action 필드에 명시
3. 복잡한 데이터는 구조화해서 제시
4. 절약 팁은 구체적인 금액으로

응답 JSON 형식:
{
  "message": "사용자에게 보여줄 텍스트",
  "action": null | {
    "type": "add_item" | "edit_item" | "delete_item" | "navigate" | "set_reminder",
    "payload": { ... }
  },
  "relatedItems": ["관련 항목 ID 배열"] | null
}`
}

export async function POST(req: NextRequest) {
  const { messages, userContext } = await req.json()

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1000,
    system: buildChatSystemPrompt(userContext),
    messages,
  })

  const raw = response.content
    .filter(b => b.type === 'text')
    .map(b => b.text)
    .join('')
    .replace(/```json|```/g, '')
    .trim()

  const parsed = JSON.parse(raw)
  return NextResponse.json(parsed)
}
```

---

## 3. 프론트엔드 AI 훅

### `hooks/useAIParse.ts`

```typescript
import { useState } from 'react'
import type { ParseResponse } from '@/lib/types'

export function useAIParse() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<ParseResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const parseText = async (text: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/ai/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'text', content: text }),
      })
      const data: ParseResponse = await res.json()
      setResult(data)
      return data
    } catch {
      setError('AI 분석 중 오류가 발생했습니다.')
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const parseImage = async (file: File) => {
    setIsLoading(true)
    setError(null)
    try {
      const base64 = await fileToBase64(file)
      const res = await fetch('/api/ai/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'image', content: base64 }),
      })
      const data: ParseResponse = await res.json()
      setResult(data)
      return data
    } catch {
      setError('이미지 분석 중 오류가 발생했습니다.')
      return null
    } finally {
      setIsLoading(false)
    }
  }

  return { parseText, parseImage, isLoading, result, error, reset: () => setResult(null) }
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      resolve(result.split(',')[1]) // base64 데이터만
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
```

---

## 4. AI 입력 컴포넌트 (`components/ai/AIInputBar.tsx`)

```tsx
'use client'
import { useState, useRef } from 'react'
import { Sparkles, Camera, Mic, X, Check } from 'lucide-react'
import { useAIParse } from '@/hooks/useAIParse'
import { ParseResultPreview } from './ParseResultPreview'

export function AIInputBar() {
  const [input, setInput] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const { parseText, parseImage, isLoading, result, reset } = useAIParse()

  const handleSubmit = async () => {
    if (!input.trim()) return
    const res = await parseText(input)
    if (res) setShowPreview(true)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const res = await parseImage(file)
    if (res) setShowPreview(true)
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-border p-4 pb-safe">
      {/* 파싱 결과 미리보기 */}
      {showPreview && result && (
        <ParseResultPreview
          result={result}
          onConfirm={() => { setShowPreview(false); reset(); setInput('') }}
          onClose={() => { setShowPreview(false); reset() }}
        />
      )}

      {/* 로딩 인디케이터 */}
      {isLoading && (
        <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
          <Sparkles size={14} className="text-primary animate-pulse" />
          AI가 분석 중입니다...
        </div>
      )}

      {/* 입력 바 */}
      <div className="flex items-center gap-2 bg-surface-secondary rounded-full px-4 py-2.5">
        <Sparkles size={16} className="text-primary flex-shrink-0" />
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          placeholder="무엇을 도와드릴까요? (예: SKT 약정 언제 끝나?)"
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
        <button onClick={() => fileRef.current?.click()} className="p-1 text-muted-foreground hover:text-foreground">
          <Camera size={16} />
        </button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
      </div>
    </div>
  )
}
```

---

## 5. 파싱 결과 미리보기 (`components/ai/ParseResultPreview.tsx`)

```tsx
'use client'
import { useState } from 'react'
import { Check, X, Edit2 } from 'lucide-react'
import { CategoryBadge } from '@/components/shared/CategoryBadge'
import { useItems } from '@/hooks/useItems'
import type { ParseResponse } from '@/lib/types'

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
    <div className="mb-4 bg-white border border-border rounded-2xl shadow-card overflow-hidden animate-in">
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <p className="text-sm font-medium">
          {result.items.length}개 항목 발견
          <span className="text-muted-foreground font-normal ml-1">
            (신뢰도 {Math.round(result.confidence * 100)}%)
          </span>
        </p>
        <button onClick={onClose}><X size={16} /></button>
      </div>

      {/* 후속 질문 (있으면) */}
      {result.followUpQuestions.length > 0 && (
        <div className="mx-4 mb-3 p-3 bg-primary/5 rounded-xl">
          <p className="text-xs text-primary font-medium mb-1">💡 추가 정보</p>
          {result.followUpQuestions.map((q, i) => (
            <p key={i} className="text-xs text-muted-foreground">{q}</p>
          ))}
        </div>
      )}

      {/* 항목 목록 */}
      <div className="divide-y divide-border">
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
              <p className="text-xs text-muted-foreground">
                {item.amount ? `${item.amount.toLocaleString()}원` : '금액 미확인'}
                {item.cycle ? ` · ${CYCLE_LABELS[item.cycle]}` : ''}
                {item.dayOfMonth ? ` ${item.dayOfMonth}일` : ''}
              </p>
              {result.missingFields[i]?.length > 0 && (
                <p className="text-xs text-warning mt-0.5">
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
          className="flex-1 flex items-center justify-center gap-1.5 bg-primary text-white rounded-full py-2.5 text-sm font-medium disabled:opacity-50"
        >
          <Check size={14} />
          선택 항목 추가 ({selected.filter(Boolean).length}개)
        </button>
      </div>
    </div>
  )
}

const CYCLE_LABELS: Record<string, string> = {
  monthly: '매월', bimonthly: '2개월', quarterly: '분기',
  semiannual: '반기', yearly: '매년', once: '일회',
}
```

---

## 6. 절약 분석 AI 쿼리

```typescript
// lib/ai/analysis.ts
export async function getOptimizationSuggestions(
  items: ResponsibilityItem[],
  cards: CreditCard[]
): Promise<OptimizationSuggestion[]> {
  const prompt = `
사용자의 정기 지출 목록을 분석하고 절약 방법을 제안하세요.

지출 목록:
${JSON.stringify(items.map(i => ({
  name: i.name, category: i.category, amount: i.amount,
  cycle: i.cycle, provider: i.provider,
  contractEndDate: i.contractEndDate,
})))}

카드 혜택:
${JSON.stringify(cards.map(c => ({
  name: c.name, benefits: c.benefits
})))}

다음 유형의 절약 방법을 찾아주세요:
1. 중복 구독 (같은 카테고리, 비슷한 서비스)
2. 약정 종료 후 재약정 절약 가능 항목
3. 카드 혜택 미활용 (결제 카드 변경으로 혜택 달성 가능)
4. 자동갱신 주의 (곧 자동갱신되는 불필요할 수 있는 서비스)

JSON 배열로만 응답:
[{
  "type": "duplicate|renegotiate|card_optimization|auto_renewal_warning",
  "itemIds": ["관련 항목 ID들"],
  "title": "제안 제목",
  "description": "구체적인 절약 방법",
  "estimatedMonthlySavings": 숫자(원),
  "actionUrl": "관련 링크 또는 null",
  "priority": "high|medium|low"
}]
`

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    messages: [{ role: 'user', content: prompt }],
  })

  const raw = response.content[0].type === 'text' ? response.content[0].text : ''
  return JSON.parse(raw.replace(/```json|```/g, '').trim())
}
```

---

## 7. 크론 알림 (`/api/cron/notify/route.ts`)

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { adminFirestore } from '@/lib/firebase-admin'

// vercel.json에 등록:
// { "crons": [{ "path": "/api/cron/notify", "schedule": "0 9 * * *" }] }

export async function GET(req: NextRequest) {
  // 크론 시크릿 검증
  if (req.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const today = new Date()
  const in7 = new Date(today); in7.setDate(in7.getDate() + 7)
  const in30 = new Date(today); in30.setDate(in30.getDate() + 30)
  const in90 = new Date(today); in90.setDate(in90.getDate() + 90)

  // 모든 사용자의 만료 임박 항목 조회
  const itemsSnapshot = await adminFirestore
    .collectionGroup('items')
    .where('status', '==', 'active')
    .where('contractEndDate', '<=', in90)
    .where('contractEndDate', '>=', today)
    .get()

  const notifications: NotificationRecord[] = []

  itemsSnapshot.docs.forEach(doc => {
    const item = doc.data() as ResponsibilityItem
    const endDate = item.contractEndDate?.toDate()
    if (!endDate) return

    const daysUntil = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    const thresholds = [7, 30, 90]
    const matched = thresholds.find(t => daysUntil <= t)
    if (!matched) return

    notifications.push({
      userId: item.userId,
      itemId: item.id,
      type: item.autoRenews ? 'renewal' : 'expiry',
      message: item.autoRenews
        ? `⚠️ ${item.name}이(가) ${daysUntil}일 후 자동갱신됩니다`
        : `📋 ${item.name} 약정이 ${daysUntil}일 후 종료됩니다`,
      daysUntil,
    })
  })

  // 알림 저장 (중복 방지 포함)
  const batch = adminFirestore.batch()
  notifications.forEach(n => {
    const ref = adminFirestore
      .collection(`users/${n.userId}/notifications`)
      .doc(`${n.itemId}_${n.daysUntil}d_${today.toISOString().slice(0, 10)}`)
    batch.set(ref, { ...n, isRead: false, sentAt: new Date() }, { merge: true })
  })
  await batch.commit()

  return NextResponse.json({ processed: notifications.length })
}
```
