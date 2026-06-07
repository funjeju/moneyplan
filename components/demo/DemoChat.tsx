'use client'
import { useState, useRef, useEffect } from 'react'
import { DEMO_ITEMS } from '@/lib/demo-data'
import { fmtMoney, toMonthlyAmount, getDaysUntilExpiry } from '@/lib/utils'
import { CATEGORY_META } from '@/lib/utils/category'
import { Send, Sparkles, Lock } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { DemoSignupCta } from './DemoSignupCta'

interface Msg { role: 'user' | 'assistant'; content: string }

const QUICK_QUESTIONS = [
  '이번달 총 지출이 얼마야?',
  '만료 임박한 항목 알려줘',
  '구독 서비스 정리해줘',
  '가장 비싼 항목 TOP 3',
  '절약할 수 있는 방법은?',
  '자동결제 항목 목록 보여줘',
]

function buildAnswer(q: string): string {
  const active = DEMO_ITEMS.filter(i => i.status === 'active')
  const monthly = active.reduce((s, i) => s + toMonthlyAmount(i), 0)

  if (q.includes('총 지출') || q.includes('얼마')) {
    const byCat = Object.entries(CATEGORY_META)
      .map(([slug, meta]) => {
        const total = active.filter(i => i.category === slug).reduce((s, i) => s + toMonthlyAmount(i), 0)
        return { label: meta.label, total }
      })
      .filter(x => x.total > 0)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)
    return `이번 달 예상 총 지출은 **${fmtMoney(monthly)}**이에요.\n\n📊 카테고리별 주요 지출:\n${byCat.map(x => `• ${x.label}: ${fmtMoney(x.total)}`).join('\n')}\n\n가장 큰 비중은 ${byCat[0].label}(${fmtMoney(byCat[0].total)})이에요.`
  }

  if (q.includes('만료') || q.includes('임박')) {
    const urgent = DEMO_ITEMS
      .map(i => ({ item: i, days: getDaysUntilExpiry(i) }))
      .filter(({ days }) => days !== null && days <= 60)
      .sort((a, b) => (a.days ?? 0) - (b.days ?? 0))
      .slice(0, 4)
    if (urgent.length === 0) return '현재 60일 이내 만료 예정 항목이 없어요! ✅'
    return `⚠️ 만료 임박 항목 ${urgent.length}건:\n\n${urgent.map(({ item, days }) =>
      `🔴 **${item.name}** — ${days !== null && days < 0 ? '이미 만료됨' : `${days}일 후 만료`}\n   ${item.provider ?? ''} ${item.memo ? `(${item.memo.slice(0, 30)}...)` : ''}`
    ).join('\n\n')}`
  }

  if (q.includes('구독') || q.includes('정리')) {
    const subs = active.filter(i => i.category === 'subscription')
    const total = subs.reduce((s, i) => s + toMonthlyAmount(i), 0)
    return `구독 서비스 ${subs.length}개, 월 합계 **${fmtMoney(total)}**:\n\n${subs.map(i => `• **${i.name}** (${i.provider}) — ${fmtMoney(toMonthlyAmount(i))}/월`).join('\n')}\n\n💡 **절약 제안:**\n• 티빙과 넷플릭스 콘텐츠가 겹칩니다 → 티빙 해지 시 **월 10,900원** 절약\n• Notion Pro는 무료 플랜으로 충분할 수 있어요 → **월 16,000원** 절약 가능`
  }

  if (q.includes('TOP') || q.includes('비싼') || q.includes('top')) {
    const top3 = [...active].sort((a, b) => toMonthlyAmount(b) - toMonthlyAmount(a)).slice(0, 3)
    return `💰 월 환산 지출 TOP 3:\n\n${top3.map((i, idx) =>
      `${idx + 1}. **${i.name}** — ${fmtMoney(toMonthlyAmount(i))}/월\n   ${CATEGORY_META[i.category].label} · ${i.provider ?? ''}`
    ).join('\n\n')}`
  }

  if (q.includes('절약') || q.includes('방법')) {
    return `📉 지출 분석 기반 절약 방법:\n\n1. **구독 정리** — 티빙 + Notion Pro 해지 시 월 **26,900원** 절약\n2. **통신비 최적화** — SKT 약정 만료 후 번호이동 시 월 **15,000원~** 절약\n3. **보험료 연납** — 실손·암보험 연납 전환 시 연간 **5% 할인**\n4. **자동차보험 다이렉트** — 만기 전 타사 비교로 최대 **10~20만원** 절약\n5. **렌탈 해지** — 코웨이 의무기간 종료 후 해지 시 월 **32,000원** 절약\n\n월 최대 절약 가능액: **약 31,000원** (연간 37만원)`
  }

  if (q.includes('자동결제') || q.includes('자동이체')) {
    const auto = active.filter(i => i.isAutoPayment)
    const total = auto.reduce((s, i) => s + toMonthlyAmount(i), 0)
    return `🔄 자동결제 항목 ${auto.length}개, 월 합계 **${fmtMoney(total)}**:\n\n${auto.slice(0, 6).map(i => `• ${i.name} — ${fmtMoney(toMonthlyAmount(i))}/월 (${i.paymentMethod ?? '자동이체'})`).join('\n')}${auto.length > 6 ? `\n... 외 ${auto.length - 6}개` : ''}`
  }

  return `죄송해요, 질문을 더 구체적으로 해주시면 정확한 답변을 드릴 수 있어요 😊\n\n제가 도움드릴 수 있는 것들:\n• 이번 달 총 지출 계산\n• 만료 임박 항목 확인\n• 구독 서비스 정리 제안\n• 지출 TOP 항목 분석\n• 절약 방법 추천`
}

export function DemoChat() {
  const router = useRouter()
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      role: 'assistant',
      content: `안녕하세요! Life Capsule AI 비서예요 😊\n\n현재 **${DEMO_ITEMS.filter(i => i.status === 'active').length}개** 활성 항목을 파악하고 있어요.\n이번 달 예상 지출은 **${fmtMoney(DEMO_ITEMS.filter(i => i.status === 'active').reduce((s, i) => s + toMonthlyAmount(i), 0))}**입니다.\n\n무엇이든 물어보세요!`,
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgs])

  const send = async (q: string) => {
    if (!q.trim() || loading) return
    setMsgs(prev => [...prev, { role: 'user', content: q }])
    setInput('')
    setLoading(true)
    await new Promise(r => setTimeout(r, 600))
    setMsgs(prev => [...prev, { role: 'assistant', content: buildAnswer(q) }])
    setLoading(false)
  }

  return (
    <div className="max-w-lg mx-auto flex flex-col h-[calc(100vh-8rem)]">
      {/* 헤더 */}
      <div className="px-4 py-4 bg-white border-b border-gray-100 flex items-center gap-3">
        <div className="w-9 h-9 bg-[#6C63FF] rounded-xl flex items-center justify-center">
          <Sparkles size={16} className="text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold">AI 생활비 비서</p>
          <p className="text-xs text-gray-400">Gemini 2.5 Flash 기반 · {DEMO_ITEMS.length}개 항목 분석 중</p>
        </div>
      </div>

      {/* 메시지 */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-[#F8F9FC]">
        {msgs.map((msg, i) => {
          const isUser = msg.role === 'user'
          const lines = msg.content.split('\n').map((l, j) => {
            const html = l.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            return <p key={j} dangerouslySetInnerHTML={{ __html: html }} className="text-sm leading-relaxed" />
          })
          return (
            <div key={i} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${isUser ? 'bg-[#6C63FF] text-white rounded-br-sm' : 'bg-white border border-gray-100 shadow-sm text-gray-800 rounded-bl-sm'}`}>
                {lines}
              </div>
            </div>
          )
        })}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
              <div className="flex gap-1">
                {[0,1,2].map(i => <span key={i} className="w-1.5 h-1.5 bg-[#6C63FF] rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />)}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* 빠른 질문 */}
      <div className="px-4 py-2 bg-white border-t border-gray-50">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {QUICK_QUESTIONS.map(q => (
            <button
              key={q}
              onClick={() => send(q)}
              className="flex-shrink-0 text-xs bg-[#6C63FF]/10 text-[#6C63FF] px-3 py-1.5 rounded-full hover:bg-[#6C63FF]/20 transition-colors font-medium"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* 입력창 */}
      <div className="px-4 py-3 bg-white border-t border-gray-100 flex gap-2 items-center">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send(input)}
          placeholder="생활비 관련 무엇이든 물어보세요..."
          className="flex-1 bg-gray-50 rounded-full px-4 py-2.5 text-sm outline-none focus:bg-gray-100 transition-colors"
        />
        <button
          onClick={() => send(input)}
          disabled={!input.trim() || loading}
          className="w-10 h-10 bg-[#6C63FF] rounded-full flex items-center justify-center flex-shrink-0 disabled:opacity-40 hover:bg-[#5A52E8] transition-colors"
        >
          <Send size={14} className="text-white" />
        </button>
      </div>

      {/* 회원가입 유도 */}
      <div className="px-4 pb-4 bg-white">
        <button
          onClick={() => router.push('/signup')}
          className="w-full flex items-center justify-center gap-2 py-2.5 border border-[#6C63FF]/30 rounded-xl text-xs text-[#6C63FF] font-medium hover:bg-[#6C63FF]/5 transition-colors"
        >
          <Lock size={12} />
          회원가입하면 내 실제 데이터로 AI와 대화할 수 있어요
        </button>
      </div>

      {/* SEO */}
      <div className="px-4 pb-4 bg-white">
        <p className="text-[10px] text-gray-300 text-center leading-relaxed">
          Life Capsule AI 비서 · Gemini 2.5 Flash 기반 · 구독·보험·통신비·렌탈·세금 생활비 자연어 분석
        </p>
      </div>
    </div>
  )
}
