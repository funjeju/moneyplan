'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/hooks/useAuth'
import * as notifDB from '@/lib/firestore/notifications'
import { Bell, CheckCheck, AlertTriangle, RefreshCw, CreditCard, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { NotificationRecord } from '@/lib/types'
import { useRouter } from 'next/navigation'

const TYPE_META: Record<NotificationRecord['type'], { icon: React.ReactNode; color: string }> = {
  expiry: { icon: <AlertTriangle size={16} />, color: 'text-orange-500' },
  renewal: { icon: <RefreshCw size={16} />, color: 'text-blue-500' },
  payment: { icon: <CreditCard size={16} />, color: 'text-[#6C63FF]' },
  trial_end: { icon: <Sparkles size={16} />, color: 'text-pink-500' },
  benefit_threshold: { icon: <CreditCard size={16} />, color: 'text-green-500' },
}

function fmtAgo(ts: any): string {
  const date = ts?.toDate ? ts.toDate() : new Date(ts)
  const diff = Date.now() - date.getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return '방금 전'
  if (m < 60) return `${m}분 전`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}시간 전`
  const d = Math.floor(h / 24)
  return `${d}일 전`
}

export default function NotificationsPage() {
  const { user } = useAuth()
  const qc = useQueryClient()
  const router = useRouter()

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications', user?.uid],
    queryFn: () => notifDB.getNotifications(user!.uid),
    enabled: !!user,
  })

  const markAllMutation = useMutation({
    mutationFn: () => notifDB.markAllAsRead(user!.uid),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications', user?.uid] }),
  })

  const markOneMutation = useMutation({
    mutationFn: (id: string) => notifDB.markAsRead(user!.uid, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications', user?.uid] }),
  })

  const unreadCount = notifications.filter(n => !n.isRead).length

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">알림</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-gray-400 mt-0.5">읽지 않은 알림 {unreadCount}개</p>
          )}
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={() => markAllMutation.mutate()}>
            <CheckCheck size={14} className="mr-1" /> 모두 읽음
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Bell size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">알림이 없어요</p>
          <p className="text-xs mt-1">만료·납부 임박 시 자동으로 알려드려요</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map(n => {
            const meta = TYPE_META[n.type]
            return (
              <div
                key={n.id}
                onClick={() => {
                  if (!n.isRead) markOneMutation.mutate(n.id)
                  if (n.itemId) router.push(`/items/${n.itemId}`)
                }}
                className={`flex items-start gap-3 p-4 rounded-2xl cursor-pointer transition-colors ${
                  n.isRead ? 'bg-white border border-gray-100' : 'bg-[#6C63FF]/5 border border-[#6C63FF]/20'
                }`}
              >
                <div className={`mt-0.5 ${meta?.color ?? 'text-gray-400'}`}>
                  {meta?.icon ?? <Bell size={16} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${n.isRead ? 'text-gray-600' : 'font-medium text-gray-800'}`}>
                    {n.message}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{fmtAgo(n.sentAt)}</p>
                </div>
                {!n.isRead && (
                  <div className="w-2 h-2 bg-[#6C63FF] rounded-full mt-1.5 flex-shrink-0" />
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
