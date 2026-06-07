'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { DemoPreviewModal } from '@/components/demo/DemoPreviewModal'
import { DEMO_ITEMS, DEMO_CARDS, DEMO_CHAT } from '@/lib/demo-data'
import { CATEGORY_META } from '@/lib/utils/category'
import { fmtMoney, toMonthlyAmount, getDaysUntilExpiry, getDaysUntilPayment } from '@/lib/utils'
import {
  Bell, CreditCard, BarChart3, Sparkles, AlertTriangle,
  ChevronRight, Shield, RefreshCw, Send, Check,
} from 'lucide-react'
import * as Icons from 'lucide-react'

const MONTHLY_TOTAL = DEMO_ITEMS
  .filter(i => i.status === 'active')
  .reduce((s, i) => s + toMonthlyAmount(i), 0)

const URGENT = DEMO_ITEMS.filter(i => {
  const d = getDaysUntilExpiry(i)
  return d !== null && d <= 30
})

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
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${daysExpiry < 0 ? 'bg-red-100 text-red-600' : daysExpiry <= 14 ? 'bg-orange-100 text-orange-600' : 'bg-yellow-100 text-yellow-600'}`}>
              {daysExpiry < 0 ? '만료됨' : `만료 ${daysExpiry}일`}
            </span>
          )}
          {item.dayOfMonth && (
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${daysPayment <= 3 ? 'bg-red-100 text-red-600' : daysPayment <= 7 ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-500'}`}>
              {daysPayment}일 후 납부
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

function DemoChatBubble({ msg, delay }: { msg: { role: string; content: string }; delay: number }) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay)
    return () => clearTimeout(t)
  }, [delay])

  const isUser = msg.role === 'user'
  const lines = msg.content.split('\n').map((l, i) => {
    const bold = l.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    return <p key={i} dangerouslySetInnerHTML={{ __html: bold }} className="text-sm leading-relaxed" />
  })

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} transition-all duration-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
      <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${isUser ? 'bg-[#6C63FF] text-white rounded-br-sm' : 'bg-gray-100 text-gray-800 rounded-bl-sm'}`}>
        {lines}
      </div>
    </div>
  )
}

export function LandingPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'dashboard' | 'items' | 'chat'>('dashboard')
  const [showPreview, setShowPreview] = useState(false)
  const chatRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (activeTab === 'chat') {
      setTimeout(() => chatRef.current?.scrollTo({ top: 9999, behavior: 'smooth' }), 800)
    }
  }, [activeTab])

  return (
    <div className="min-h-screen bg-[#F8F9FC]">
      <DemoPreviewModal open={showPreview} onClose={() => setShowPreview(false)} />
      {/* 헤더 */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <img src="/icons/icon-96x96.png" alt="Life Capsule" className="w-8 h-8 rounded-xl" />
          <span className="font-semibold text-sm">Life Capsule</span>
        </div>
        <div className="flex gap-2">
          <button onClick={() => router.push('/login')} className="text-sm px-3 py-1.5 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors">
            로그인
          </button>
          <button onClick={() => router.push('/signup')} className="text-sm px-4 py-1.5 rounded-lg bg-[#6C63FF] text-white hover:bg-[#5A52E8] transition-colors font-medium">
            시작하기
          </button>
        </div>
      </header>

      {/* 히어로 */}
      <section className="px-4 pt-12 pb-8 text-center max-w-lg mx-auto">
        <div className="inline-flex items-center gap-1.5 bg-[#6C63FF]/10 text-[#6C63FF] text-xs font-medium px-3 py-1.5 rounded-full mb-5">
          <Sparkles size={12} /> AI 생활비 관리 플랫폼
        </div>
        <h1 className="text-3xl font-bold leading-tight mb-3">
          흩어진 생활비를<br />
          <span className="text-[#6C63FF]">하나의 캡슐</span>에 담다
        </h1>
        <p className="text-gray-500 text-sm leading-relaxed mb-8">
          구독, 보험, 통신비, 렌탈, 세금까지<br />
          AI가 자동으로 파악하고 납부·만료일을 알려드려요
        </p>
        <div className="flex flex-col gap-3 items-center">
          <div className="flex gap-3">
            <button onClick={() => router.push('/signup')} className="px-6 py-3 bg-[#6C63FF] text-white rounded-2xl font-semibold text-sm hover:bg-[#5A52E8] transition-colors shadow-lg shadow-[#6C63FF]/30">
              무료로 시작하기
            </button>
            <button onClick={() => router.push('/login')} className="px-6 py-3 bg-white text-gray-700 rounded-2xl font-semibold text-sm border border-gray-200 hover:bg-gray-50 transition-colors">
              로그인
            </button>
          </div>
          <button
            onClick={() => router.push('/demo')}
            className="flex items-center gap-2 px-5 py-2.5 bg-amber-50 text-amber-700 rounded-2xl font-semibold text-sm border border-amber-200 hover:bg-amber-100 transition-colors"
          >
            <span>✦</span> 로그인 없이 무료 체험
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-3">👇 아래에서 실제 화면을 미리 볼 수 있어요</p>
      </section>

      {/* 특징 3개 */}
      <section className="px-4 max-w-lg mx-auto mb-8">
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: Sparkles, label: 'AI 자동 파싱', desc: '문자 한 줄로 항목 등록' },
            { icon: Bell, label: '만료 알림', desc: '납부·해지 미리 알림' },
            { icon: BarChart3, label: '지출 분석', desc: '카테고리별 월 통계' },
          ].map(({ icon: Icon, label, desc }) => (
            <div key={label} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center">
              <div className="w-9 h-9 bg-[#6C63FF]/10 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Icon size={16} className="text-[#6C63FF]" />
              </div>
              <p className="text-xs font-semibold">{label}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 샘플 화면 탭 */}
      <section className="px-4 max-w-lg mx-auto mb-8">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#6C63FF] bg-[#6C63FF]/10 px-2 py-0.5 rounded-full">SAMPLE</span>
            <p className="text-sm font-semibold">실제 화면 미리보기</p>
          </div>
          <button
            onClick={() => setShowPreview(true)}
            className="text-xs text-[#6C63FF] bg-[#6C63FF]/10 px-3 py-1.5 rounded-full font-medium hover:bg-[#6C63FF]/20 transition-colors"
          >
            빠른 미리보기 ↗
          </button>
        </div>
        <p className="text-xs text-gray-400 mb-4">샘플 데이터로 구성된 화면입니다</p>

        {/* 탭 */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-4">
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

        {/* 대시보드 탭 */}
        {activeTab === 'dashboard' && (
          <div className="space-y-3">
            {/* 인사 */}
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
              <p className="text-xs text-gray-400">안녕하세요 👋</p>
              <p className="text-base font-semibold mt-0.5">이번달 예상 지출</p>
              <p className="text-3xl font-bold text-[#6C63FF] tabular-nums mt-1">{fmtMoney(MONTHLY_TOTAL)}</p>
              <p className="text-xs text-gray-400 mt-1">활성 항목 {DEMO_ITEMS.filter(i=>i.status==='active').length}개 기준</p>
            </div>

            {/* 긴급 배너 */}
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle size={15} className="text-red-500" />
                <span className="text-sm font-semibold text-red-600">즉시 처리 필요</span>
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

            {/* 카테고리 그리드 */}
            <div className="grid grid-cols-3 gap-2">
              {(['telecom','subscription','insurance','utility','housing','rental','tax','vehicle','finance','business','other'] as const).map(slug => {
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
          </div>
        )}

        {/* 항목 목록 탭 */}
        {activeTab === 'items' && (
          <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-0.5">
            {DEMO_ITEMS.map(item => (
              <DemoItemCard key={item.id} item={item} />
            ))}
          </div>
        )}

        {/* AI 챗봇 탭 */}
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
              {DEMO_CHAT.map((msg, i) => (
                <DemoChatBubble key={i} msg={msg} delay={i * 400} />
              ))}
            </div>
            <div className="px-3 py-3 border-t border-gray-100 flex gap-2">
              <div className="flex-1 bg-gray-50 rounded-full px-4 py-2 text-sm text-gray-400">
                로그인 후 이용 가능해요
              </div>
              <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center">
                <Send size={14} className="text-gray-300" />
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 카드 혜택 미리보기 */}
      <section className="px-4 max-w-lg mx-auto mb-8">
        <p className="text-sm font-semibold mb-3 flex items-center gap-2">
          <CreditCard size={15} className="text-[#6C63FF]" /> 카드 혜택 달성률
        </p>
        <div className="space-y-3">
          {DEMO_CARDS.map(card => (
            <div key={card.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-3 text-white text-sm font-medium" style={{ background: `linear-gradient(135deg, ${card.color}, ${card.color}99)` }}>
                {card.issuer} {card.name}
              </div>
              <div className="p-3 space-y-2">
                {card.benefits.map(b => (
                  <div key={b.id}>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-gray-500">{b.description}</span>
                      <span className="text-xs font-medium text-orange-500">67%</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full">
                      <div className="h-full bg-[#6C63FF] rounded-full" style={{ width: '67%' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SEO 텍스트 섹션 */}
      <section className="px-4 max-w-lg mx-auto mb-8">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
          <h2 className="text-base font-bold text-gray-800">Life Capsule — AI 생활비 관리 앱</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Life Capsule은 구독 관리, 보험료 관리, 통신비 절약, 렌탈 비용 추적, 세금 납부 알림을 한 곳에서 해결하는 AI 기반 생활비 관리 플랫폼입니다. 넷플릭스·유튜브·애플 등 OTT 자동 갱신 구독부터 실손보험·자동차보험 만료일, 코웨이 정수기 의무기간, 월세·관리비 납부일까지 모두 관리할 수 있어요.
          </p>
          <div className="grid grid-cols-2 gap-3 text-xs text-gray-500">
            {[
              ['📱 통신비 절약', 'SKT·KT·LG U+ 요금제 약정 만료 알림, 번호이동 타이밍 관리'],
              ['🎬 구독 관리', '넷플릭스·유튜브·티빙·웨이브 등 OTT 구독 비용 한눈에 파악'],
              ['🛡️ 보험료 관리', '실손·암보험·치아보험·자동차보험 만기·갱신 일정 추적'],
              ['🏠 렌탈 비용', '정수기·공기청정기·안마의자 렌탈 의무기간 만료 알림'],
              ['💡 공과금 자동화', '전기요금·도시가스·아파트 관리비 납부일 자동 등록'],
              ['💼 세금 일정', '자동차세·재산세·종합소득세 납부기한 미리 알림'],
              ['🚗 차량 관리', '자동차보험 갱신, 하이패스 충전, 차량 리스 비용 관리'],
              ['💳 카드 혜택', '신한·삼성·KB·현대카드 혜택 달성률 및 최적 카드 추천'],
            ].map(([title, desc]) => (
              <div key={title} className="space-y-0.5">
                <p className="font-semibold text-gray-700">{title}</p>
                <p className="leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 leading-relaxed">
            AI 영수증 분석, 문자 자동 파싱, 카드 청구서 OCR 인식으로 항목을 자동 등록합니다. 납부일 7일 전·30일 전 푸시 알림으로 연체를 예방하고, 월별·카테고리별 지출 통계로 불필요한 구독을 정리하세요.
          </p>
        </div>
      </section>

      {/* CTA 하단 */}
      <section className="px-4 max-w-lg mx-auto pb-16">
        <div className="bg-gradient-to-br from-[#6C63FF] to-[#9B93FF] rounded-3xl p-8 text-white text-center">
          <img src="/icons/icon-96x96.png" alt="" className="w-14 h-14 rounded-2xl mx-auto mb-4" />
          <h2 className="text-lg font-bold mb-2">지금 바로 시작해보세요</h2>
          <p className="text-sm opacity-80 mb-6">내 생활비를 한 눈에 파악하는 데<br />5분도 걸리지 않아요</p>
          <button
            onClick={() => router.push('/signup')}
            className="w-full py-3 bg-white text-[#6C63FF] rounded-2xl font-bold text-sm hover:bg-white/90 transition-colors"
          >
            무료로 시작하기 →
          </button>
          <button
            onClick={() => router.push('/login')}
            className="w-full py-2 text-white/70 text-sm mt-1 hover:text-white transition-colors"
          >
            이미 계정이 있어요
          </button>
          <button
            onClick={() => router.push('/demo')}
            className="w-full py-2 text-white/60 text-xs hover:text-white/80 transition-colors"
          >
            ✦ 로그인 없이 무료 체험해보기
          </button>
        </div>
      </section>
    </div>
  )
}
