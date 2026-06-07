'use client'
import { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { DEMO_ITEMS } from '@/lib/demo-data'
import { getDaysUntilExpiry } from '@/lib/utils'
import { ItemCard } from '@/components/items/ItemCard'
import { AlertTriangle, Clock, Calendar, RefreshCw, SkipBack } from 'lucide-react'
import type { ResponsibilityItem } from '@/lib/types'

function ExpirySection({ icon, title, subtitle, items, emptyMsg, onItemClick }: {
  icon: React.ReactNode; title: string; subtitle: string
  items: ResponsibilityItem[]; emptyMsg?: string; onItemClick?: (id: string) => void
}) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <div>
          <h2 className="text-sm font-semibold">{title}</h2>
          <p className="text-xs text-gray-400">{subtitle}</p>
        </div>
        {items.length > 0 && (
          <span className="ml-auto text-xs bg-gray-100 px-2 py-0.5 rounded-full">{items.length}건</span>
        )}
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">{emptyMsg}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {items.map(item => <ItemCard key={item.id} item={item} onClick={() => onItemClick?.(item.id)} />)}
        </div>
      )}
    </section>
  )
}

export function DemoExpiryPage() {
  const router = useRouter()

  const groups = useMemo(() => {
    const withExpiry = DEMO_ITEMS.filter(i => i.contractEndDate)
    const days = (i: ResponsibilityItem) => getDaysUntilExpiry(i) ?? Infinity
    return {
      critical: withExpiry.filter(i => { const d = days(i); return d >= 0 && d <= 7 }),
      warning:  withExpiry.filter(i => { const d = days(i); return d > 7 && d <= 30 }),
      notice:   withExpiry.filter(i => { const d = days(i); return d > 30 && d <= 90 }),
      autoRenew: withExpiry.filter(i => i.autoRenews && days(i) <= 90 && days(i) >= 0),
      expired:  withExpiry.filter(i => days(i) < 0),
    }
  }, [])

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-8">
      <div>
        <h1 className="text-xl font-semibold">해지·만료 관리</h1>
        <p className="text-sm text-gray-400 mt-1">약정 종료 및 자동갱신 예정 항목을 관리하세요</p>
      </div>

      <ExpirySection
        icon={<AlertTriangle size={18} className="text-red-500" />}
        title="즉시 처리 필요" subtitle="7일 이내 만료"
        items={groups.critical} emptyMsg="긴급 처리 항목이 없어요 ✅"
        onItemClick={id => router.push(`/demo/items/${id}`)}
      />
      <ExpirySection
        icon={<Clock size={18} className="text-orange-500" />}
        title="이번달 처리 예정" subtitle="30일 이내 만료"
        items={groups.warning} emptyMsg="이번달 만료 항목이 없어요"
        onItemClick={id => router.push(`/demo/items/${id}`)}
      />
      <ExpirySection
        icon={<Calendar size={18} className="text-[#6C63FF]" />}
        title="3개월 이내" subtitle="90일 이내 만료"
        items={groups.notice} emptyMsg="3개월 내 만료 항목이 없어요"
        onItemClick={id => router.push(`/demo/items/${id}`)}
      />
      {groups.autoRenew.length > 0 && (
        <ExpirySection
          icon={<RefreshCw size={18} className="text-orange-400" />}
          title="⚠️ 자동갱신 주의" subtitle="해지 원하면 미리 신청하세요"
          items={groups.autoRenew}
          onItemClick={id => router.push(`/demo/items/${id}`)}
        />
      )}
      {groups.expired.length > 0 && (
        <ExpirySection
          icon={<SkipBack size={18} className="text-gray-400" />}
          title="이미 만료됨" subtitle="처리 또는 보관이 필요한 항목"
          items={groups.expired}
          onItemClick={id => router.push(`/demo/items/${id}`)}
        />
      )}
    </div>
  )
}
