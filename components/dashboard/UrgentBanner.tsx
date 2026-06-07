'use client'
import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'
import { getDaysUntilExpiry } from '@/lib/utils'
import type { ResponsibilityItem } from '@/lib/types'

interface Props {
  items: ResponsibilityItem[]
}

export function UrgentBanner({ items }: Props) {
  const first = items[0]
  if (!first) return null
  const days = getDaysUntilExpiry(first)

  return (
    <Link href="/expiry">
      <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3 hover:bg-red-100 transition-colors">
        <AlertTriangle size={18} className="text-red-500 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-red-700">
            {first.name}이(가) {days !== null ? `${days}일 후` : ''} {first.autoRenews ? '자동갱신' : '만료'}됩니다
          </p>
          {items.length > 1 && (
            <p className="text-xs text-red-500 mt-0.5">외 {items.length - 1}건 더 확인하기 →</p>
          )}
        </div>
      </div>
    </Link>
  )
}
