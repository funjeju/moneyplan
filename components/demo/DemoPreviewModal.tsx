'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { X, Maximize2 } from 'lucide-react'
import { DEMO_ITEMS, DEMO_CARDS, DEMO_CHAT } from '@/lib/demo-data'
import { CATEGORY_META } from '@/lib/utils/category'
import { fmtMoney, toMonthlyAmount, getDaysUntilExpiry, getDaysUntilPayment } from '@/lib/utils'
import { AlertTriangle, Sparkles, Send } from 'lucide-react'
import * as Icons from 'lucide-react'

const MONTHLY_TOTAL = DEMO_ITEMS.filter(i => i.status === 'active').reduce((s, i) => s + toMonthlyAmount(i), 0)
const URGENT = DEMO_ITEMS.filter(i => { const d = getDaysUntilExpiry(i); return d !== null && d <= 30 })

function DemoItemCard({ item }: { item: (typeof DEMO_ITEMS)[0] }) {
  const meta = CATEGORY_META[item.category]
  const IconComp = (Icons as any)[meta.icon] ?? Icons.MoreHorizontal
  const daysExpiry = getDaysUntilExpiry(item)
  const daysPayment = getDaysUntilPayment(item)
  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: meta.color }}>
            <IconComp size={16} style={{ color: meta.textColor }} />
          </div>
          <div>
            <p className="text-sm font-medium">{item.name}</p>
            <p className="text-xs text-gray-400">{item.provider}{item.owner ? ` · ${item.owner}` : ''}</p>
          </div>
        </div>
        <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: meta.color, color: meta.textColor }}>
          {meta.label}
        </span>
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-gray-50">
        <span className="text-sm font-semibold tabular-nums">{fmtMoney(item.amount)}</span>
        <div className="flex gap-1.5">
          {daysExpiry !== null && daysExpiry <= 60 && (
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${daysExpiry < 0 ? 'bg-red-100 text-red-600' : daysExpiry <= 14 ? 'bg-orange-100 text-orange-600' : 'bg-yellow-50 text-yellow-600'}`}>
              {daysExpiry < 0 ? '만료됨' : `만료 ${daysExpiry}일`}
            </span>
          )}
          {item.dayOfMonth && (
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${daysPayment <= 3 ? 'bg-red-100 text-red-600' : daysPayment <= 7 ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-500'}`}>
              {daysPayment}일 후
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

function ChatBubble({ msg, delay }: { msg: { role: string; content: string }; delay: number }) {
  const [visible, setVisible] = useState(false)
  useEffect(() => { const t = setTimeout(() => setVisible(true), delay); return () => clearTimeout(t) }, [delay])
  const isUser = msg.role === 'user'
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} transition-all duration-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
      <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${isUser ? 'bg-[#6C63FF] text-white rounded-br-sm' : 'bg-gray-100 text-gray-800 rounded-bl-sm'}`}>
        {msg.content.split('\n').map((l, i) => (
          <p key={i} dangerouslySetInnerHTML={{ __html: l.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} className="text-sm leading-relaxed" />
        ))}
      </div>
    </div>
  )
}

interface Props {
  open: boolean
  onClose: () => void
}

export function DemoPreviewModal({ open, onClose }: Props) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'dashboard' | 'items' | 'chat'>('dashboard')
  const chatRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (activeTab === 'chat') setTimeout(() => chatRef.current?.scrollTo({ top: 9999, behavior: 'smooth' }), 800)
  }, [activeTab])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-[#F8F9FC] rounded-t-3xl sm:rounded-3xl w-full sm:max-w-lg max-h-[92vh] flex flex-col overflow-hidden shadow-2xl">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-5 py-4 bg-white border-b border-gray-100">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#6C63FF] bg-[#6C63FF]/10 px-2 py-0.5 rounded-full">SAMPLE</span>
            <p className="text-sm font-semibold">화면 미리보기</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { onClose(); router.push('/demo') }}
              className="flex items-center gap-1.5 text-xs bg-[#6C63FF] text-white px-3 py-1.5 rounded-lg hover:bg-[#5A52E8] transition-colors"
            >
              <Maximize2 size={11} /> 전체 체험
            </button>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* 탭 */}
        <div className="flex gap-1 bg-gray-100 p-1 mx-4 mt-4 rounded-xl">
          {([['dashboard', '대시보드'], ['items', '항목 목록'], ['chat', 'AI 챗봇']] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex-1 text-xs py-2 rounded-lg font-medium transition-colors ${activeTab === key ? 'bg-white text-[#6C63FF] shadow-sm' : 'text-gray-500'}`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* 콘텐츠 */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {activeTab === 'dashboard' && (
            <>
              <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                <p className="text-xs text-gray-400">안녕하세요 👋</p>
                <p className="text-base font-semibold mt-0.5">이번달 예상 지출</p>
                <p className="text-3xl font-bold text-[#6C63FF] tabular-nums mt-1">{fmtMoney(MONTHLY_TOTAL)}</p>
                <p className="text-xs text-gray-400 mt-1">활성 항목 {DEMO_ITEMS.filter(i=>i.status==='active').length}개 기준</p>
              </div>
              {URGENT.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle size={15} className="text-red-500" />
                    <span className="text-sm font-semibold text-red-600">즉시 처리 필요 {URGENT.length}건</span>
                  </div>
                  {URGENT.slice(0, 2).map(item => {
                    const d = getDaysUntilExpiry(item)
                    return (
                      <div key={item.id} className="flex items-center justify-between py-1.5">
                        <span className="text-sm text-gray-700">{item.name}</span>
                        <span className={`text-xs font-medium ${d !== null && d < 0 ? 'text-red-500' : 'text-orange-500'}`}>
                          {d !== null && d < 0 ? '만료됨' : `${d}일 후 만료`}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
              <div className="grid grid-cols-3 gap-2">
                {(['telecom','subscription','insurance','utility','housing','rental'] as const).map(slug => {
                  const meta = CATEGORY_META[slug]
                  const items = DEMO_ITEMS.filter(i => i.category === slug && i.status === 'active')
                  const total = items.reduce((s, i) => s + toMonthlyAmount(i), 0)
                  const IconComp = (Icons as any)[meta.icon] ?? Icons.MoreHorizontal
                  return (
                    <div key={slug} className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center mb-2" style={{ background: meta.color }}>
                        <IconComp size={13} style={{ color: meta.textColor }} />
                      </div>
                      <p className="text-[10px] text-gray-400">{meta.label}</p>
                      <p className="text-xs font-semibold tabular-nums">{total > 0 ? fmtMoney(total) : '-'}</p>
                    </div>
                  )
                })}
              </div>
            </>
          )}

          {activeTab === 'items' && (
            <div className="space-y-2.5">
              {DEMO_ITEMS.slice(0, 10).map(item => <DemoItemCard key={item.id} item={item} />)}
            </div>
          )}

          {activeTab === 'chat' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex items-center gap-2.5 px-4 py-3 bg-[#6C63FF]/5 border-b border-gray-100">
                <div className="w-7 h-7 bg-[#6C63FF] rounded-full flex items-center justify-center">
                  <Sparkles size={13} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold">AI 비서</p>
                  <p className="text-xs text-gray-400">내 항목 {DEMO_ITEMS.length}개 파악 중</p>
                </div>
              </div>
              <div ref={chatRef} className="p-4 space-y-3 max-h-72 overflow-y-auto">
                {DEMO_CHAT.map((msg, i) => <ChatBubble key={i} msg={msg} delay={i * 300} />)}
              </div>
              <div className="px-3 py-3 border-t border-gray-100 flex gap-2">
                <div className="flex-1 bg-gray-50 rounded-full px-4 py-2 text-sm text-gray-400">로그인 후 이용 가능해요</div>
                <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center">
                  <Send size={14} className="text-gray-300" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 하단 CTA */}
        <div className="px-4 py-4 bg-white border-t border-gray-100 flex gap-2">
          <button onClick={() => { onClose(); router.push('/demo') }} className="flex-1 py-2.5 bg-[#6C63FF] text-white rounded-xl text-sm font-semibold hover:bg-[#5A52E8] transition-colors">
            전체 화면으로 체험하기
          </button>
          <button onClick={() => { onClose(); router.push('/signup') }} className="flex-1 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors">
            무료 회원가입
          </button>
        </div>
      </div>
    </div>
  )
}
