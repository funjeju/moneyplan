'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { usePushNotification } from '@/hooks/usePushNotification'
import { Button } from '@/components/ui/button'
import { registerServiceWorker } from '@/lib/push'
import {
  Bell, BellOff, Download, CheckCircle2, XCircle,
  Smartphone, LogOut, User, ChevronRight, Info
} from 'lucide-react'

function isStandalone() {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(display-mode: standalone)').matches
}

export default function SettingsPage() {
  const { user, logout } = useAuth()
  const { status, isSubscribed, enable, disable, sendTest } = usePushNotification()
  const [installed, setInstalled] = useState(false)
  const [notifyDays, setNotifyDays] = useState<number[]>([7, 30])
  const [enabling, setEnabling] = useState(false)

  useEffect(() => {
    setInstalled(isStandalone())
    registerServiceWorker()
  }, [])

  const handleTogglePush = async () => {
    setEnabling(true)
    if (isSubscribed) {
      await disable()
    } else {
      const ok = await enable()
      if (!ok && status === 'denied') {
        alert('알림이 차단되어 있어요. 브라우저 설정에서 알림을 허용해주세요.')
      }
    }
    setEnabling(false)
  }

  const toggleDay = (day: number) => {
    setNotifyDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day].sort((a, b) => a - b)
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
      <h1 className="text-xl font-semibold mb-6">설정</h1>

      {/* 계정 */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-[#6C63FF]/10 rounded-full flex items-center justify-center">
            <User size={18} className="text-[#6C63FF]" />
          </div>
          <div className="flex-1">
            <p className="font-medium">{user?.displayName || '이름 없음'}</p>
            <p className="text-sm text-gray-400">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* 앱 설치 */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">앱 설치</p>
        </div>
        <div className="px-5 py-4">
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${installed ? 'bg-green-100' : 'bg-[#6C63FF]/10'}`}>
              <Smartphone size={18} className={installed ? 'text-green-500' : 'text-[#6C63FF]'} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">홈화면에 추가</p>
              {installed ? (
                <div className="flex items-center gap-1.5 mt-1">
                  <CheckCircle2 size={13} className="text-green-500" />
                  <p className="text-xs text-green-500">앱으로 설치됨</p>
                </div>
              ) : (
                <p className="text-xs text-gray-400 mt-1">앱을 설치하면 알림을 받을 수 있어요</p>
              )}
            </div>
          </div>

          {!installed && (
            <div className="mt-4 p-3 bg-[#6C63FF]/5 rounded-xl space-y-2">
              <p className="text-xs font-medium text-[#6C63FF]">📱 홈화면 추가 방법</p>
              <div className="space-y-1.5 text-xs text-gray-500">
                <div className="flex items-start gap-2">
                  <span className="font-bold text-[#6C63FF] flex-shrink-0">Android</span>
                  <span>Chrome 주소창 오른쪽 메뉴 → "홈 화면에 추가"</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-[#6C63FF] flex-shrink-0">iPhone</span>
                  <span>Safari 하단 공유버튼 → "홈 화면에 추가"</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 푸시 알림 */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">알림 설정</p>
        </div>

        <div className="px-5 py-4 border-b border-gray-50">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isSubscribed ? 'bg-green-100' : 'bg-gray-100'}`}>
              {isSubscribed
                ? <Bell size={18} className="text-green-500" />
                : <BellOff size={18} className="text-gray-400" />
              }
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">푸시 알림</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {status === 'unsupported' ? '이 브라우저는 푸시 알림을 지원하지 않아요'
                  : status === 'denied' ? '알림이 차단되어 있어요 — 브라우저 설정에서 허용하세요'
                  : isSubscribed ? '납부일·만료일 알림을 받고 있어요'
                  : '알림을 켜면 납부일·만료일을 미리 알려드려요'}
              </p>
            </div>
            {status !== 'unsupported' && status !== 'denied' && (
              <button
                onClick={handleTogglePush}
                disabled={enabling}
                className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ${isSubscribed ? 'bg-[#6C63FF]' : 'bg-gray-200'}`}
              >
                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${isSubscribed ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            )}
          </div>
        </div>

        {/* 알림 시점 설정 */}
        {isSubscribed && (
          <div className="px-5 py-4 border-b border-gray-50">
            <p className="text-sm font-medium mb-3">알림 시점</p>
            <div className="flex gap-2 flex-wrap">
              {[3, 7, 14, 30, 60].map(day => (
                <button
                  key={day}
                  onClick={() => toggleDay(day)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    notifyDays.includes(day)
                      ? 'bg-[#6C63FF] text-white border-[#6C63FF]'
                      : 'bg-white text-gray-600 border-gray-200'
                  }`}
                >
                  {day}일 전
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-2">납부일·만료일 N일 전에 알림을 보내드려요</p>
          </div>
        )}

        {/* 테스트 알림 */}
        {isSubscribed && (
          <div className="px-5 py-4">
            <button
              onClick={async () => {
                const result = await sendTest()
                if (result.sent > 0) {
                  alert('테스트 알림을 발송했어요!')
                } else {
                  // 브라우저 직접 알림으로 폴백
                  if (Notification.permission === 'granted') {
                    new Notification('Life Capsule 테스트 알림 ✦', {
                      body: '알림이 정상적으로 작동하고 있어요!',
                      icon: '/icons/icon-192x192.png',
                    })
                  }
                }
              }}
              className="text-sm text-[#6C63FF] hover:underline flex items-center gap-1"
            >
              테스트 알림 보내기 →
            </button>
          </div>
        )}
      </div>

      {/* 앱 정보 */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">앱 정보</p>
        </div>
        <div className="px-5 py-3 flex items-center justify-between">
          <p className="text-sm text-gray-600">버전</p>
          <p className="text-sm text-gray-400">1.0.0</p>
        </div>
        <div className="px-5 py-3 flex items-center justify-between border-t border-gray-50">
          <p className="text-sm text-gray-600">AI</p>
          <p className="text-sm text-gray-400">Gemini 2.5 Flash</p>
        </div>
      </div>

      {/* 개발자 문의 */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">개발자 문의</p>
        </div>
        <div className="px-5 py-4">
          <p className="text-sm text-gray-600 mb-1">버그 신고 · 기능 요청 · 문의</p>
          <a
            href="mailto:naggu1999@gmail.com"
            className="text-sm text-[#6C63FF] font-medium hover:underline"
          >
            naggu1999@gmail.com
          </a>
          <p className="text-xs text-gray-400 mt-2">피드백은 앱 개선에 큰 도움이 됩니다 🙏</p>
        </div>
      </div>

      {/* 로그아웃 */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <button
          onClick={logout}
          className="w-full px-5 py-4 flex items-center gap-3 text-red-500 hover:bg-red-50 transition-colors"
        >
          <LogOut size={18} />
          <span className="text-sm font-medium">로그아웃</span>
        </button>
      </div>
    </div>
  )
}
