'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, List, CheckCircle2, XCircle, Bell, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/hooks/useAuth'
import * as notifDB from '@/lib/firestore/notifications'

const TABS = [
  { href: '/', icon: Home, label: '홈' },
  { href: '/items', icon: List, label: '항목' },
  { href: '/paid', icon: CheckCircle2, label: '납부완료' },
  { href: '/cancelled', icon: XCircle, label: '중단' },
  { href: '/notifications', icon: Bell, label: '알림' },
  { href: '/settings', icon: Settings, label: '설정' },
]

interface Props {
  className?: string
}

export function BottomNav({ className }: Props) {
  const pathname = usePathname()
  const { user } = useAuth()

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['notifications-unread', user?.uid],
    queryFn: () => notifDB.getUnreadCount(user!.uid),
    enabled: !!user,
    staleTime: 60_000,
    refetchInterval: 120_000,
  })

  return (
    <nav className={cn('fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-40 pb-safe', className)}>
      <div className="flex items-center">
        {TABS.map(tab => {
          const Icon = tab.icon
          const active = pathname === tab.href
          const showBadge = tab.href === '/notifications' && unreadCount > 0
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                'flex-1 flex flex-col items-center gap-1 py-3 transition-colors relative',
                active ? 'text-[#6C63FF]' : 'text-gray-400'
              )}
            >
              <div className="relative">
                <Icon size={20} />
                {showBadge && (
                  <span className="absolute -top-1 -right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] rounded-full flex items-center justify-center font-bold">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </div>
              <span className="text-[10px]">{tab.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
