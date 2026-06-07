'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home, List, BarChart3, Bell, Settings,
  Smartphone, Zap, Shield, Play, Settings as SettingsIcon,
  Receipt, Car, Building, Landmark, Briefcase, MoreHorizontal, ChevronDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'

const NAV_ITEMS = [
  { href: '/demo', icon: Home, label: '홈' },
  { href: '/demo/items', icon: List, label: '전체 항목' },
  { href: '/demo/stats', icon: BarChart3, label: '지출 분석' },
  { href: '/demo/chat', icon: Bell, label: 'AI 챗봇' },
]

const CATEGORY_LINKS = [
  { href: '/demo/items?category=telecom', icon: Smartphone, label: '통신' },
  { href: '/demo/items?category=utility', icon: Zap, label: '공과금' },
  { href: '/demo/items?category=insurance', icon: Shield, label: '보험' },
  { href: '/demo/items?category=subscription', icon: Play, label: '구독' },
  { href: '/demo/items?category=rental', icon: SettingsIcon, label: '렌탈' },
  { href: '/demo/items?category=tax', icon: Receipt, label: '세금' },
  { href: '/demo/items?category=vehicle', icon: Car, label: '차량' },
  { href: '/demo/items?category=housing', icon: Building, label: '주거' },
  { href: '/demo/items?category=finance', icon: Landmark, label: '금융' },
  { href: '/demo/items?category=business', icon: Briefcase, label: '사업' },
  { href: '/demo/items?category=other', icon: MoreHorizontal, label: '기타' },
]

export function DemoSidebar({ className }: { className?: string }) {
  const pathname = usePathname()
  const [showCategories, setShowCategories] = useState(true)

  return (
    <aside className={cn('w-64 flex flex-col h-screen fixed top-0 left-0 bg-white border-r border-gray-100 z-40', className)}>
      {/* 로고 */}
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <img src="/icons/icon-96x96.png" alt="Life Capsule" className="w-9 h-9 rounded-xl object-cover" />
          <div>
            <p className="text-sm font-semibold">Life Capsule</p>
            <p className="text-xs text-gray-400">생활 책임 관리</p>
          </div>
        </div>
      </div>

      {/* 네비 */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
        {NAV_ITEMS.slice(0, 2).map(item => (
          <NavLink key={item.href} item={item} active={pathname === item.href} />
        ))}

        <button
          onClick={() => setShowCategories(!showCategories)}
          className="w-full flex items-center justify-between px-3 py-2 text-xs text-gray-400 hover:text-gray-600 mt-2"
        >
          <span>카테고리</span>
          <ChevronDown size={12} className={cn('transition-transform', showCategories ? '' : '-rotate-90')} />
        </button>

        {showCategories && CATEGORY_LINKS.map(item => (
          <NavLink key={item.href} item={item} active={pathname.includes(item.href.split('?')[1] ?? '__')} small />
        ))}

        <div className="pt-2 mt-2 border-t border-gray-100">
          {NAV_ITEMS.slice(2).map(item => (
            <NavLink key={item.href} item={item} active={pathname === item.href} />
          ))}
        </div>
      </nav>

      {/* 체험 유저 */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-[#6C63FF]/10 rounded-full flex items-center justify-center">
            <span className="text-xs text-[#6C63FF] font-bold">체</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium">체험 계정</p>
            <p className="text-[10px] text-gray-400">샘플 데이터</p>
          </div>
          <Link href="/signup" className="text-xs text-[#6C63FF] hover:underline font-medium">
            가입
          </Link>
        </div>
      </div>
    </aside>
  )
}

function NavLink({ item, active, small }: {
  item: { href: string; icon: any; label: string }
  active: boolean
  small?: boolean
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
      <Icon size={small ? 14 : 16} />
      <span className={small ? 'text-xs' : 'text-sm'}>{item.label}</span>
    </Link>
  )
}
