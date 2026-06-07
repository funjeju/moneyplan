'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, CheckCheck, AlertTriangle, RefreshCw, CreditCard, Sparkles } from 'lucide-react'

const TYPE_META = {
  expiry:            { icon: <AlertTriangle size={16} />, color: 'text-orange-500' },
  renewal:           { icon: <RefreshCw size={16} />, color: 'text-blue-500' },
  payment:           { icon: <CreditCard size={16} />, color: 'text-[#6C63FF]' },
  trial_end:         { icon: <Sparkles size={16} />, color: 'text-pink-500' },
  benefit_threshold: { icon: <CreditCard size={16} />, color: 'text-green-500' },
} as const

const DEMO_NOTIFICATIONS = [
  { id: 'n1', type: 'expiry'   as const, message: '자동차세 납부 기한이 지났습니다. 가산세 부과 전 빠른 납부를 권장해요.', isRead: false, sentAt: new Date(Date.now() - 2*60*60*1000), itemId: 'd22' },
  { id: 'n2', type: 'expiry'   as const, message: '코웨이 정수기 렌탈 의무기간이 8일 후 종료됩니다. 재약정 또는 해지를 결정하세요.', isRead: false, sentAt: new Date(Date.now() - 5*60*60*1000), itemId: 'd17' },
  { id: 'n3', type: 'expiry'   as const, message: '현대해상 자동차보험이 22일 후 만기됩니다. 지금 타사 보험료를 비교해보세요.', isRead: false, sentAt: new Date(Date.now() - 1*24*60*60*1000), itemId: 'd11' },
  { id: 'n4', type: 'payment'  as const, message: 'SKT 휴대폰 요금제 납부일(20일)이 5일 남았습니다.', isRead: true,  sentAt: new Date(Date.now() - 2*24*60*60*1000), itemId: 'd2' },
  { id: 'n5', type: 'renewal'  as const, message: 'SKT 휴대폰 요금제 약정이 45일 후 만료됩니다. 번호이동 혜택을 확인해보세요.', isRead: true,  sentAt: new Date(Date.now() - 3*24*60*60*1000), itemId: 'd2' },
  { id: 'n6', type: 'benefit_threshold' as const, message: '신한 Mr.Life 카드 이번달 실적이 목표의 67%입니다. 통신비 할인 혜택까지 월 32,900원 남았어요.', isRead: true,  sentAt: new Date(Date.now() - 5*24*60*60*1000), itemId: undefined },
  { id: 'n7', type: 'payment'  as const, message: '월세 납부일(1일)이 내일입니다. 임대인 계좌로 850,000원을 이체하세요.', isRead: true,  sentAt: new Date(Date.now() - 7*24*60*60*1000), itemId: 'd20' },
  { id: 'n8', type: 'trial_end' as const, message: '넷플릭스 구독 갱신일이 7일 후입니다. 자동 결제 예정입니다.', isRead: true,  sentAt: new Date(Date.now() - 10*24*60*60*1000), itemId: 'd4' },
]

function fmtAgo(date: Date): string {
  const diff = Date.now() - date.getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return '방금 전'
  if (m < 60) return `${m}분 전`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}시간 전`
  return `${Math.floor(h / 24)}일 전`
}

export function DemoNotificationsPage() {
  const router = useRouter()
  const [notifications, setNotifications] = useState(DEMO_NOTIFICATIONS)

  const unreadCount = notifications.filter(n => !n.isRead).length

  const markAll = () => setNotifications(ns => ns.map(n => ({ ...n, isRead: true })))
  const markOne = (id: string) => setNotifications(ns => ns.map(n => n.id === id ? { ...n, isRead: true } : n))

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">알림</h1>
          {unreadCount > 0 && <p className="text-sm text-gray-400 mt-0.5">읽지 않은 알림 {unreadCount}개</p>}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAll}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <CheckCheck size={13} /> 모두 읽음
          </button>
        )}
      </div>

      <div className="space-y-2">
        {notifications.map(n => {
          const meta = TYPE_META[n.type]
          return (
            <div
              key={n.id}
              onClick={() => {
                markOne(n.id)
                if (n.itemId) router.push(`/demo/items/${n.itemId}`)
              }}
              className={`flex items-start gap-3 p-4 rounded-2xl cursor-pointer transition-colors ${
                n.isRead ? 'bg-white border border-gray-100' : 'bg-[#6C63FF]/5 border border-[#6C63FF]/20'
              }`}
            >
              <div className={`mt-0.5 ${meta.color}`}>{meta.icon}</div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${n.isRead ? 'text-gray-600' : 'font-medium text-gray-800'}`}>{n.message}</p>
                <p className="text-xs text-gray-400 mt-0.5">{fmtAgo(n.sentAt)}</p>
              </div>
              {!n.isRead && <div className="w-2 h-2 bg-[#6C63FF] rounded-full mt-1.5 flex-shrink-0" />}
            </div>
          )
        })}
      </div>

      <div className="mt-8 bg-white rounded-2xl border border-gray-100 p-5 space-y-2">
        <h2 className="text-sm font-bold text-gray-700">Life Capsule 알림 기능</h2>
        <p className="text-xs text-gray-400 leading-relaxed">
          납부일 3일·7일 전, 만료일 7일·30일·60일 전 자동 푸시 알림을 받을 수 있습니다.
          통신 약정 만료, 렌탈 의무기간 종료, 보험 갱신일, 구독 자동결제, 카드 혜택 달성 알림을 지원합니다.
        </p>
      </div>
    </div>
  )
}
