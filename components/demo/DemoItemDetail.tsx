'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { ResponsibilityItem } from '@/lib/types'
import { DEMO_CARDS } from '@/lib/demo-data'
import { CATEGORY_META } from '@/lib/utils/category'
import { fmtMoney, toMonthlyAmount, getDaysUntilExpiry, getDaysUntilPayment } from '@/lib/utils'
import {
  ArrowLeft, Calendar, CreditCard, User, RefreshCw,
  AlertTriangle, CheckCircle2, Clock, FileText, Sparkles,
} from 'lucide-react'
import * as Icons from 'lucide-react'
import { DemoSignupCta } from './DemoSignupCta'

interface Props { item: ResponsibilityItem }

const CYCLE_LABEL: Record<string, string> = {
  monthly: '매월', bimonthly: '2개월마다', quarterly: '분기', yearly: '매년', once: '일시납',
}

export function DemoItemDetail({ item }: Props) {
  const router = useRouter()
  const meta = CATEGORY_META[item.category]
  const IconComp = (Icons as any)[meta.icon] ?? Icons.MoreHorizontal
  const daysExpiry = getDaysUntilExpiry(item)
  const daysPayment = getDaysUntilPayment(item)
  const monthlyAmt = toMonthlyAmount(item)

  const statusBadge =
    item.status === 'expired'
      ? { label: '만료됨', cls: 'bg-red-100 text-red-600' }
      : daysExpiry !== null && daysExpiry <= 14
      ? { label: `만료 ${daysExpiry}일`, cls: 'bg-orange-100 text-orange-600' }
      : daysExpiry !== null && daysExpiry <= 60
      ? { label: `만료 ${daysExpiry}일`, cls: 'bg-yellow-50 text-yellow-600' }
      : { label: '활성', cls: 'bg-green-100 text-green-600' }

  return (
    <div className="max-w-lg mx-auto px-4 py-5 space-y-4">
      {/* 뒤로가기 */}
      <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors -ml-1">
        <ArrowLeft size={16} /> 항목 목록
      </button>

      {/* 헤더 카드 */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: meta.color }}>
              <IconComp size={22} style={{ color: meta.textColor }} />
            </div>
            <div>
              <p className="text-base font-bold">{item.name}</p>
              <p className="text-sm text-gray-400">{item.provider ?? '—'}</p>
            </div>
          </div>
          <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${statusBadge.cls}`}>
            {statusBadge.label}
          </span>
        </div>

        {/* 금액 */}
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-3xl font-bold tabular-nums">{fmtMoney(item.amount)}</span>
          <span className="text-sm text-gray-400">{CYCLE_LABEL[item.cycle] ?? item.cycle}</span>
        </div>
        {item.cycle !== 'monthly' && (
          <p className="text-xs text-gray-400">월 환산 약 {fmtMoney(monthlyAmt)}</p>
        )}
      </div>

      {/* 상세 정보 */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
        {[
          {
            icon: Calendar,
            label: '납부일',
            value: item.dayOfMonth
              ? `매월 ${item.dayOfMonth}일 (${daysPayment === 0 ? '오늘' : `${daysPayment}일 후`})`
              : '—',
            urgent: daysPayment <= 3,
          },
          {
            icon: Clock,
            label: '만료일',
            value: item.contractEndDate
              ? `${item.contractEndDate.toDate().toLocaleDateString('ko-KR')} (${daysExpiry !== null && daysExpiry < 0 ? '만료됨' : `${daysExpiry}일 후`})`
              : item.autoRenews ? '자동 갱신' : '—',
            urgent: daysExpiry !== null && daysExpiry <= 14,
          },
          {
            icon: RefreshCw,
            label: '결제 방식',
            value: `${item.paymentMethod ?? '—'} ${item.isAutoPayment ? '(자동결제)' : '(수동결제)'}`,
          },
          { icon: User, label: '담당자', value: item.owner ?? '본인' },
          {
            icon: item.aiParsed ? Sparkles : FileText,
            label: 'AI 분석',
            value: item.aiParsed
              ? `AI 파싱 완료 (신뢰도 ${Math.round((item.aiConfidence ?? 0.9) * 100)}%)`
              : '직접 입력',
          },
        ].map(({ icon: Icon, label, value, urgent }) => (
          <div key={label} className="flex items-center gap-3 px-4 py-3">
            <Icon size={15} className={urgent ? 'text-orange-500' : 'text-gray-400'} />
            <span className="text-xs text-gray-400 w-16 flex-shrink-0">{label}</span>
            <span className={`text-sm font-medium flex-1 ${urgent ? 'text-orange-600' : 'text-gray-700'}`}>{value}</span>
          </div>
        ))}
      </div>

      {/* 메모 */}
      {item.memo && (
        <div className="bg-[#6C63FF]/5 rounded-2xl p-4">
          <p className="text-xs font-semibold text-[#6C63FF] mb-1.5">메모</p>
          <p className="text-sm text-gray-600 leading-relaxed">{item.memo}</p>
        </div>
      )}

      {/* AI 관리 제안 */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 bg-[#6C63FF] rounded-lg flex items-center justify-center">
            <Sparkles size={13} className="text-white" />
          </div>
          <p className="text-sm font-semibold">AI 관리 제안</p>
        </div>
        {item.category === 'subscription' && (
          <p className="text-xs text-gray-500 leading-relaxed">
            이 구독 서비스의 월 비용은 {fmtMoney(monthlyAmt)}입니다. 비슷한 카테고리의 다른 구독과 중복 여부를 확인해보세요.
            {item.autoRenews && ' 자동 갱신이 활성화되어 있어 해지하지 않으면 계속 청구됩니다.'}
          </p>
        )}
        {item.category === 'insurance' && (
          <p className="text-xs text-gray-500 leading-relaxed">
            보험료를 연납으로 전환하면 보통 5~10% 할인이 적용됩니다. 갱신 시점에 타사 상품과 보험료·보장 범위를 비교해보세요.
          </p>
        )}
        {item.category === 'telecom' && (
          <p className="text-xs text-gray-500 leading-relaxed">
            약정 만료 후 번호이동 시 신규가입 혜택으로 최대 20~30만원 단말 지원금을 받을 수 있습니다. 만료일을 꼭 확인하세요.
          </p>
        )}
        {item.category === 'rental' && (
          <p className="text-xs text-gray-500 leading-relaxed">
            렌탈 의무기간 종료 후 재계약 없이 소유권을 취득하거나 해지할 수 있습니다. 만료 전 반드시 고객센터에 확인하세요.
          </p>
        )}
        {item.category === 'tax' && (
          <p className="text-xs text-gray-500 leading-relaxed">
            세금은 납부기한을 넘기면 3%의 가산세가 부과됩니다. 위택스(wetax.go.kr) 또는 이택스에서 온라인 납부하세요.
          </p>
        )}
        {!['subscription','insurance','telecom','rental','tax'].includes(item.category) && (
          <p className="text-xs text-gray-500 leading-relaxed">
            이 항목의 납부일을 확인하고 자동이체를 설정하면 연체 없이 관리할 수 있습니다.
            Life Capsule AI에게 질문하면 더 자세한 절약 방법을 알려드려요.
          </p>
        )}
      </div>

      {/* 관련 카드 혜택 */}
      {DEMO_CARDS.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <CreditCard size={15} className="text-[#6C63FF]" />
            <p className="text-sm font-semibold">카드 혜택 활용</p>
          </div>
          <div className="space-y-2">
            {DEMO_CARDS.slice(0, 2).map(card => (
              <div key={card.id} className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-xl">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0" style={{ background: card.color }}>
                  {card.issuer.slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium">{card.issuer} {card.name}</p>
                  <p className="text-[10px] text-gray-400 truncate">{card.benefits[0]?.description}</p>
                </div>
                <span className="text-[10px] text-[#6C63FF] font-medium flex-shrink-0">혜택 적용 가능</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 같은 카테고리 다른 항목 */}
      <div>
        <p className="text-sm font-semibold mb-2.5">같은 카테고리 항목</p>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {require('@/lib/demo-data').DEMO_ITEMS
            .filter((i: ResponsibilityItem) => i.category === item.category && i.id !== item.id)
            .slice(0, 4)
            .map((related: ResponsibilityItem) => (
              <Link
                key={related.id}
                href={`/demo/items/${related.id}`}
                className="flex-shrink-0 bg-white rounded-xl border border-gray-100 p-3 min-w-[140px] hover:shadow-sm transition-shadow"
              >
                <p className="text-xs font-medium truncate">{related.name}</p>
                <p className="text-xs text-gray-400 truncate">{related.provider}</p>
                <p className="text-sm font-bold tabular-nums mt-1">{fmtMoney(related.amount)}</p>
              </Link>
            ))}
        </div>
      </div>

      <DemoSignupCta
        title="이 항목을 내 계정에 추가하세요"
        desc="AI가 비슷한 항목을 자동으로 찾아 등록해드려요"
      />
    </div>
  )
}
