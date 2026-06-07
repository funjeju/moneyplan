interface Props {
  days: number
  type: 'payment' | 'expiry'
}

export function DayBadge({ days, type }: Props) {
  if (type === 'payment') {
    if (days <= 0) return <span className="text-xs font-medium text-red-500 bg-red-50 px-2 py-0.5 rounded-full">오늘</span>
    if (days <= 3) return <span className="text-xs font-medium text-red-500 bg-red-50 px-2 py-0.5 rounded-full">⚡ D-{days}</span>
    if (days <= 7) return <span className="text-xs font-medium text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full">⚡ {days}일 후</span>
    if (days <= 14) return <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">{days}일 후</span>
    return <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{days}일 후</span>
  }

  // expiry
  if (days < 0) return <span className="text-xs font-medium text-red-500">만료됨</span>
  if (days <= 30) return <span className="text-xs font-medium text-orange-500">{days}일 후</span>
  return <span className="text-xs text-gray-400">{days}일 후</span>
}
