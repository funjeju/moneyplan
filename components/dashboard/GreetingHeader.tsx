'use client'

interface Props {
  userName: string
  urgentCount: number
}

export function GreetingHeader({ userName, urgentCount }: Props) {
  const hour = new Date().getHours()
  const greeting = hour < 12 ? '좋은 아침이에요' : hour < 18 ? '안녕하세요' : '좋은 저녁이에요'

  const statusMsg = urgentCount > 0
    ? `⚠️ ${urgentCount}건이 긴급 처리가 필요해요`
    : '✅ 오늘은 긴급한 항목이 없어요'

  return (
    <div>
      <h1 className="text-xl font-semibold">
        {greeting}{userName ? `, ${userName}님` : ''} 👋
      </h1>
      <p className="text-sm text-gray-500 mt-1">{statusMsg}</p>
    </div>
  )
}
