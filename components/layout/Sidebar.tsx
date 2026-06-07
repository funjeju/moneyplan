'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home, List, CreditCard, AlertTriangle, Settings, Bell, BarChart3,
  Smartphone, Zap, Shield, Play, Settings as SettingsIcon,
  Receipt, Car, Building, Landmark, Briefcase,
  MoreHorizontal, ChevronDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { useQuery } from '@tanstack/react-query'
import * as notifDB from '@/lib/firestore/notifications'
import { useState } from 'react'

const NAV_ITEMS = [
  { href: '/', icon: Home, label: '홈' },
  { href: '/items', icon: List, label: '전체 항목' },
  { href: '/cards', icon: CreditCard, label: '카드 관리' },
  { href: '/expiry', icon: AlertTriangle, label: '해지·만료' },
  { href: '/stats', icon: BarChart3, label: '지출 분석' },
  { href: '/notifications', icon: Bell, label: '알림' },
  { href: '/settings', icon: Settings, label: '설정' },
]

const CATEGORY_LINKS = [
  { href: '/categories/telecom', icon: Smartphone, label: '통신' },
  { href: '/categories/utility', icon: Zap, label: '공과금' },
  { href: '/categories/insurance', icon: Shield, label: '보험' },
  { href: '/categories/subscription', icon: Play, label: '구독' },
  { href: '/categories/rental', icon: SettingsIcon, label: '렌탈' },
  { href: '/categories/tax', icon: Receipt, label: '세금' },
  { href: '/categories/vehicle', icon: Car, label: '차량' },
  { href: '/categories/housing', icon: Building, label: '주거' },
  { href: '/categories/finance', icon: Landmark, label: '금융' },
  { href: '/categories/business', icon: Briefcase, label: '사업' },
  { href: '/categories/other', icon: MoreHorizontal, label: '기타' },
]

interface Props {
  className?: string
}

export function Sidebar({ className }: Props) {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const [showCategories, setShowCategories] = useState(true)

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['notifications-unread', user?.uid],
    queryFn: () => notifDB.getUnreadCount(user!.uid),
    enabled: !!user,
    staleTime: 60_000,
    refetchInterval: 120_000,
  })

  return (
    <aside className={cn('w-64 flex flex-col h-screen fixed top-0 left-0 bg-white border-r border-gray-100 z-40', className)}>
      {/* 로고 */}
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-[#6C63FF] rounded-xl flex items-center justify-center">
            <span className="text-white text-sm">✦</span>
          </div>
          <div>
            <p className="text-sm font-semibold">Life OS</p>
            <p className="text-xs text-gray-400">생활 책임 관리</p>
          </div>
        </div>
      </div>

      {/* 네비게이션 */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
        {NAV_ITEMS.slice(0, 2).map(item => (
          <NavLink key={item.href} item={item} active={pathname === item.href} badge={item.href === '/notifications' ? unreadCount : 0} />
        ))}

        {/* 카테고리 섹션 */}
        <button
          onClick={() => setShowCategories(!showCategories)}
          className="w-full flex items-center justify-between px-3 py-2 text-xs text-gray-400 hover:text-gray-600 mt-2"
        >
          <span>카테고리</span>
          <ChevronDown size={12} className={cn('transition-transform', showCategories ? '' : '-rotate-90')} />
        </button>

        {showCategories && CATEGORY_LINKS.map(item => (
          <NavLink key={item.href} item={item} active={pathname === item.href} small />
        ))}

        <div className="pt-2 mt-2 border-t border-gray-100">
          {NAV_ITEMS.slice(2).map(item => (
            <NavLink key={item.href} item={item} active={pathname === item.href} badge={item.href === '/notifications' ? unreadCount : 0} />
          ))}
        </div>
      </nav>

      {/* 유저 정보 */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-xs text-gray-600">{user?.displayName?.[0] ?? '?'}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium truncate">{user?.displayName ?? user?.email}</p>
          </div>
          <button onClick={logout} className="text-xs text-gray-400 hover:text-gray-600">
            로그아웃
          </button>
        </div>
      </div>
    </aside>
  )
}

function NavLink({ item, active, small, badge = 0 }: {
  item: { href: string; icon: any; label: string }
  active: boolean
  small?: boolean
  badge?: number
}) {
  const Icon = item.icon
  return (
    <Link
      href={item.href}
      className={cn(
        'flex items-center gap-2.5 rounded-xl transition-colors',
        small ? 'px-3 py-1.5' : 'px-3 py-2',
        active ? 'bg-[#6C63FF]/10 text-[#6C63FF]' : 'text-gray-600 hover:bg-gray-50'
      )}
    >
      <div className="relative">
        <Icon size={small ? 14 : 16} />
        {badge > 0 && (
          <span className="absolute -top-1 -right-1.5 w-3.5 h-3.5 bg-red-500 text-white text-[8px] rounded-full flex items-center justify-center font-bold">
            {badge > 9 ? '9+' : badge}
          </span>
        )}
      </div>
      <span className={small ? 'text-xs' : 'text-sm'}>{item.label}</span>
    </Link>
  )
}
