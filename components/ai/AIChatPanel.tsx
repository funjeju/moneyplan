'use client'
import { useState, useRef, useEffect } from 'react'
import { X, Send, Sparkles, ChevronDown } from 'lucide-react'
import { useItems } from '@/hooks/useItems'
import { useAuth } from '@/hooks/useAuth'
import { toMonthlyAmount, getDaysUntilPayment, getDaysUntilExpiry } from '@/lib/utils'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface Props {
  onClose: () => void
}

export function AIChatPanel({ onClose }: Props) {
  const { user } = useAuth()
  const { items } = useItems()
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: '안녕하세요! 생활 지출 관리를 도와드릴게요. 무엇이든 물어보세요 😊',
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const buildUserContext = () => {
    const activeItems = items.filter(i => i.status === 'active')
    return {
      totalItems: activeItems.length,
      monthlyTotal: activeItems.reduce((s, i) => s + toMonthlyAmount(i), 0),
      urgentPayments: activeItems.filter(i => getDaysUntilPayment(i) <= 7).length,
      expiringItems: items.filter(i => {
        const d = getDaysUntilExpiry(i)
        return d !== null && d <= 90
      }).length,
      items: activeItems.slice(0, 20).map(i => ({
        name: i.name,
        category: i.category,
        amount: i.amount,
        cycle: i.cycle,
        dayOfMonth: i.dayOfMonth,
        contractEndDate: i.contractEndDate,
      })),
    }
  }

  const sendMessage = async () => {
    const text = input.trim()
    if (!text || isLoading) return

    const newMessages: Message[] = [...messages, { role: 'user', content: text }]
    setMessages(newMessages)
    setInput('')
    setIsLoading(true)

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          userContext: buildUserContext(),
        }),
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.message ?? '죄송해요, 오류가 발생했어요.' }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: '네트워크 오류가 발생했어요. 다시 시도해주세요.' }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed bottom-16 lg:bottom-0 right-0 lg:right-4 z-50 w-full lg:w-96 flex flex-col bg-white border border-gray-200 rounded-t-2xl lg:rounded-2xl shadow-2xl overflow-hidden"
      style={{ height: '70vh', maxHeight: '520px' }}>
      {/* 헤더 */}
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-gray-100 bg-[#6C63FF]/5">
        <div className="w-7 h-7 bg-[#6C63FF] rounded-full flex items-center justify-center">
          <Sparkles size={14} className="text-white" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold">AI 비서</p>
          <p className="text-xs text-gray-400">항목 {items.length}개 파악 중</p>
        </div>
        <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
          <ChevronDown size={18} />
        </button>
      </div>

      {/* 메시지 목록 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
              msg.role === 'user'
                ? 'bg-[#6C63FF] text-white rounded-br-sm'
                : 'bg-gray-100 text-gray-800 rounded-bl-sm'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-2.5">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* 빠른 질문 */}
      {messages.length === 1 && (
        <div className="px-4 pb-2 flex gap-2 flex-wrap">
          {['이번달 총 지출 알려줘', '만료 임박 항목 있어?', '가장 비싼 항목은?'].map(q => (
            <button
              key={q}
              onClick={() => { setInput(q); }}
              className="text-xs bg-[#6C63FF]/10 text-[#6C63FF] px-3 py-1.5 rounded-full hover:bg-[#6C63FF]/20 transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* 입력창 */}
      <div className="px-3 py-3 border-t border-gray-100 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          placeholder="질문하세요..."
          className="flex-1 bg-gray-50 rounded-full px-4 py-2 text-sm outline-none placeholder:text-gray-400"
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim() || isLoading}
          className="w-9 h-9 bg-[#6C63FF] rounded-full flex items-center justify-center text-white disabled:opacity-40 hover:bg-[#5A52E8] transition-colors flex-shrink-0"
        >
          <Send size={15} />
        </button>
      </div>
    </div>
  )
}
