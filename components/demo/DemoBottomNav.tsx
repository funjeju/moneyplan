'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, List, BarChart3, MessageCircle, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

const TABS = [
  { href: '/demo', icon: Home, label: '홈' },
  { href: '/demo/items', icon: List, label: '항목' },
  { href: '/demo/stats', icon: BarChart3, label: '분석' },
  { href: '/demo/chat', icon: MessageCircle, label: 'AI챗봇' },
]

export function DemoBottomNav({ className }: { className?: string }) {
  const pathname = usePathname()

  return (
    <nav className={cn('fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-40 pb-safe', className)}>
      <div className="flex items-center">
        {TABS.map(tab => {
          const Icon = tab.icon
          const active = pathname === tab.href || (tab.href !== '/demo' && pathname.startsWith(tab.href))
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                'flex-1 flex flex-col items-center gap-1 py-3 transition-colors',
                active ? 'text-[#6C63FF]' : 'text-gray-400'
              )}
            >
              <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
              <span className="text-[10px]">{tab.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
