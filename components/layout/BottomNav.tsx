'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, List, CreditCard, AlertTriangle, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

const TABS = [
  { href: '/', icon: Home, label: '홈' },
  { href: '/items', icon: List, label: '항목' },
  { href: '/cards', icon: CreditCard, label: '카드' },
  { href: '/expiry', icon: AlertTriangle, label: '만료' },
  { href: '/settings', icon: Settings, label: '설정' },
]

interface Props {
  className?: string
}

export function BottomNav({ className }: Props) {
  const pathname = usePathname()

  return (
    <nav className={cn('fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-40 pb-safe', className)}>
      <div className="flex items-center">
        {TABS.map(tab => {
          const Icon = tab.icon
          const active = pathname === tab.href
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                'flex-1 flex flex-col items-center gap-1 py-3 transition-colors',
                active ? 'text-[#6C63FF]' : 'text-gray-400'
              )}
            >
              <Icon size={20} />
              <span className="text-[10px]">{tab.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
