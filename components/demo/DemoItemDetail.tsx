'use client'
import { useRouter } from 'next/navigation'
import type { ResponsibilityItem } from '@/lib/types'
import { DEMO_ITEMS } from '@/lib/demo-data'
import { CATEGORY_META } from '@/lib/utils/category'
import { fmtMoney, fmtDate, getDaysUntilPayment, getDaysUntilExpiry } from '@/lib/utils'
import { CategoryBadge } from '@/components/shared/CategoryBadge'
import { ArrowLeft, Pencil, Trash2, Lock } from 'lucide-react'
import * as Icons from 'lucide-react'
import Link from 'next/link'

const CYCLE_LABELS: Record<string, string> = {
  monthly: '매월', bimonthly: '2개월마다', quarterly: '분기별',
  semiannual: '반기별', yearly: '매년', once: '일회성',
}

function DetailRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null
  return (
    <div className="flex justify-between py-2.5 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-400">{label}</span>
      <span className="text-sm font-medium text-right max-w-[60%]">{value}</span>
    </div>
  )
}

interface Props {
  item: Omit<ResponsibilityItem, 'contractEndDate' | 'createdAt' | 'updatedAt' | 'contractStartDate'> & {
    contractEndDate?: string | null
    contractStartDate?: string | null
    createdAt?: string | null
    updatedAt?: string | null
  }
}

export function DemoItemDetail({ item }: Props) {
  const router = useRouter()
  const meta = CATEGORY_META[item.category]
  const IconComponent = (Icons as any)[meta.icon] ?? Icons.MoreHorizontal

  // contractEndDate가 ISO 문자열로 직렬화돼서 넘어옴
  const endDateObj = item.contractEndDate ? new Date(item.contractEndDate) : null
  const fakeItem = {
    ...item,
    contractEndDate: endDateObj ? { toDate: () => endDateObj } as any : undefined,
  }

  const daysUntilPayment = getDaysUntilPayment(fakeItem as any)
  const daysUntilExpiry = getDaysUntilExpiry(fakeItem as any)

  const relatedItems = DEMO_ITEMS
    .filter(i => i.category === item.category && i.id !== item.id)
    .slice(0, 4)

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="p-1.5 rounded-xl hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-semibold flex-1">항목 상세</h1>
        <Link
          href="/signup"
          className="flex items-center gap-1 text-xs px-3 py-1.5 border border-gray-200 rounded-xl text-gray-400 hover:bg-gray-50 transition-colors"
        >
          <Lock size={11} /> <Pencil size={11} /> 편집
        </Link>
        <Link
          href="/signup"
          className="flex items-center gap-1 text-xs px-2.5 py-1.5 border border-red-200 rounded-xl text-red-300 hover:bg-red-50 transition-colors"
        >
          <Lock size={11} /> <Trash2 size={11} />
        </Link>
      </div>

      {/* 항목 헤더 카드 */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm mb-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: meta.color }}>
            <IconComponent size={22} style={{ color: meta.textColor }} />
          </div>
          <div className="flex-1">
            <h2 className="text-base font-semibold">{item.name}</h2>
            {item.provider && <p className="text-sm text-gray-400">{item.provider}</p>}
          </div>
          <CategoryBadge category={item.category} />
        </div>

        <div className="flex items-end justify-between">
          <div>
            <p className="text-2xl font-bold tabular-nums">{fmtMoney(item.amount)}</p>
            <p className="text-sm text-gray-400">{CYCLE_LABELS[item.cycle] ?? item.cycle}</p>
          </div>
          <div className="text-right">
            {item.dayOfMonth && (
              <p className="text-sm text-gray-500">매{item.cycle === 'yearly' ? '년' : '월'} <span className="font-semibold text-gray-800">{item.dayOfMonth}일</span></p>
            )}
            {daysUntilPayment !== null && (
              <p className={`text-xs mt-0.5 font-medium ${daysUntilPayment <= 3 ? 'text-red-500' : daysUntilPayment <= 7 ? 'text-orange-500' : 'text-gray-400'}`}>
                {daysUntilPayment === 0 ? '오늘 납부' : `${daysUntilPayment}일 후 납부`}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 계약 정보 */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm mb-4">
        <h3 className="text-sm font-semibold text-gray-500 mb-2">계약 정보</h3>
        <DetailRow label="명의자" value={item.owner} />
        <DetailRow label="결제 수단" value={item.paymentMethod} />
        <DetailRow
          label="계약 만료"
          value={endDateObj
            ? `${endDateObj.toLocaleDateString('ko-KR')}${daysUntilExpiry !== null ? ` (${daysUntilExpiry < 0 ? '만료됨' : `${daysUntilExpiry}일 남음`})` : ''}`
            : item.autoRenews ? '자동 갱신' : null}
        />
        <DetailRow label="자동 갱신" value={item.autoRenews ? '자동 갱신' : '수동 갱신'} />
      </div>

      {/* 기타 정보 */}
      {item.memo && (
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm mb-4">
          <h3 className="text-sm font-semibold text-gray-500 mb-2">기타 정보</h3>
          <DetailRow label="메모" value={item.memo} />
        </div>
      )}

      {/* AI 파싱 */}
      {item.aiParsed && (
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-4">
          <Icons.Sparkles size={12} />
          <span>AI가 파싱한 항목 (신뢰도 {Math.round(((item as any).aiConfidence ?? 0) * 100)}%)</span>
        </div>
      )}

      {/* 같은 카테고리 항목 */}
      {relatedItems.length > 0 && (
        <div className="mb-4">
          <p className="text-sm font-semibold mb-2.5">같은 카테고리 항목</p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {relatedItems.map(related => {
              const rMeta = CATEGORY_META[related.category]
              return (
                <Link
                  key={related.id}
                  href={`/demo/items/${related.id}`}
                  className="flex-shrink-0 bg-white rounded-xl border border-gray-100 p-3 min-w-[140px] hover:shadow-sm transition-shadow"
                >
                  <p className="text-xs font-medium truncate">{related.name}</p>
                  <p className="text-xs text-gray-400 truncate">{related.provider}</p>
                  <p className="text-sm font-bold tabular-nums mt-1">{fmtMoney(related.amount)}</p>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* 가입 CTA */}
      <div className="bg-gradient-to-r from-[#6C63FF] to-[#9B93FF] rounded-2xl p-5 text-white text-center">
        <p className="text-sm font-bold mb-1">내 항목을 직접 편집·삭제하려면?</p>
        <p className="text-xs opacity-80 mb-4">무료 회원가입 후 실제 생활비를 등록하고 관리하세요</p>
        <Link
          href="/signup"
          className="inline-flex items-center gap-1.5 bg-white text-[#6C63FF] rounded-xl px-5 py-2.5 text-xs font-bold hover:bg-white/90 transition-colors"
        >
          무료로 시작하기 →
        </Link>
      </div>
    </div>
  )
}
