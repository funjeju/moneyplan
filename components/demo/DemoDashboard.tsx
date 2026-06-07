'use client'
import Link from 'next/link'
import { DEMO_ITEMS, DEMO_CARDS } from '@/lib/demo-data'
import { CATEGORY_META } from '@/lib/utils/category'
import { fmtMoney, toMonthlyAmount, getDaysUntilExpiry, getDaysUntilPayment } from '@/lib/utils'
import { AlertTriangle, ChevronRight, Sparkles, TrendingDown, Bell } from 'lucide-react'
import * as Icons from 'lucide-react'
import { DemoSignupCta } from './DemoSignupCta'

const active = DEMO_ITEMS.filter(i => i.status === 'active')
const MONTHLY = active.reduce((s, i) => s + toMonthlyAmount(i), 0)

const URGENT = DEMO_ITEMS
  .map(i => ({ item: i, days: getDaysUntilExpiry(i) }))
  .filter(({ days }) => days !== null && days <= 30)
  .sort((a, b) => (a.days ?? 0) - (b.days ?? 0))

const CATEGORIES = Object.keys(CATEGORY_META) as (keyof typeof CATEGORY_META)[]

export function DemoDashboard() {
  return (
    <div className="max-w-lg mx-auto px-4 py-5 space-y-4">
      {/* 헤더 인사 */}
      <div className="bg-gradient-to-br from-[#6C63FF] to-[#9B93FF] rounded-3xl p-5 text-white">
        <p className="text-sm opacity-80 mb-0.5">이번 달 예상 생활비</p>
        <p className="text-4xl font-bold tabular-nums">{fmtMoney(MONTHLY)}</p>
        <div className="flex items-center gap-3 mt-3 text-xs opacity-80">
          <span>활성 항목 {active.length}개</span>
          <span>·</span>
          <span>카테고리 {new Set(active.map(i => i.category)).size}개</span>
          <span>·</span>
          <span className="flex items-center gap-1"><Bell size={11} /> {URGENT.length}개 알림</span>
        </div>
      </div>

      {/* 긴급 처리 필요 */}
      {URGENT.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={15} className="text-red-500" />
            <span className="text-sm font-semibold text-red-600">즉시 처리 필요 {URGENT.length}건</span>
          </div>
          <div className="space-y-2">
            {URGENT.map(({ item, days }) => (
              <Link
                key={item.id}
                href={`/demo/items/${item.id}`}
                className="flex items-center justify-between hover:bg-red-100/50 -mx-2 px-2 py-1.5 rounded-xl transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-gray-800">{item.name}</p>
                  <p className="text-xs text-gray-400">{item.provider}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-semibold ${days !== null && days < 0 ? 'text-red-500' : days !== null && days <= 7 ? 'text-orange-500' : 'text-yellow-600'}`}>
                    {days !== null && days < 0 ? '만료됨' : days !== null && days === 0 ? '오늘 만료' : `${days}일 후 만료`}
                  </span>
                  <ChevronRight size={14} className="text-gray-300" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* AI 절약 제안 */}
      <div className="bg-[#6C63FF]/5 border border-[#6C63FF]/20 rounded-2xl p-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-[#6C63FF] rounded-xl flex items-center justify-center flex-shrink-0">
            <Sparkles size={14} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-[#6C63FF] mb-1">AI 절약 제안</p>
            <p className="text-xs text-gray-600 leading-relaxed">
              구독 서비스 9개 분석 결과 — <strong>티빙(10,900원)</strong>과 넷플릭스 콘텐츠가 겹칩니다.
              해지 시 <strong>연간 130,800원 절약</strong> 가능해요.
            </p>
            <div className="flex items-center gap-1 mt-2">
              <TrendingDown size={12} className="text-green-500" />
              <span className="text-xs text-green-600 font-medium">월 최대 25,800원 절약 가능</span>
            </div>
          </div>
        </div>
      </div>

      {/* 카테고리별 지출 요약 */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold">카테고리별 지출</p>
          <Link href="/demo/stats" className="text-xs text-[#6C63FF] hover:underline">전체 분석 →</Link>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          {CATEGORIES.map(slug => {
            const meta = CATEGORY_META[slug]
            const items = DEMO_ITEMS.filter(i => i.category === slug && i.status === 'active')
            if (items.length === 0) return null
            const total = items.reduce((s, i) => s + toMonthlyAmount(i), 0)
            const IconComp = (Icons as any)[meta.icon] ?? Icons.MoreHorizontal
            return (
              <Link
                key={slug}
                href={`/demo/items?category=${slug}`}
                className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: meta.color }}>
                  <IconComp size={17} style={{ color: meta.textColor }} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-400 truncate">{meta.label}</p>
                  <p className="text-sm font-semibold tabular-nums">{fmtMoney(total)}</p>
                  <p className="text-[10px] text-gray-300">{items.length}개 항목</p>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* 납부 예정 */}
      <div>
        <p className="text-sm font-semibold mb-3">이번 주 납부 예정</p>
        <div className="space-y-2">
          {DEMO_ITEMS
            .filter(i => i.status === 'active' && i.dayOfMonth)
            .map(i => ({ item: i, days: getDaysUntilPayment(i) }))
            .filter(({ days }) => days <= 7)
            .sort((a, b) => a.days - b.days)
            .slice(0, 5)
            .map(({ item, days }) => {
              const meta = CATEGORY_META[item.category]
              const IconComp = (Icons as any)[meta.icon] ?? Icons.MoreHorizontal
              return (
                <Link
                  key={item.id}
                  href={`/demo/items/${item.id}`}
                  className="bg-white rounded-xl px-4 py-3 border border-gray-100 flex items-center gap-3 hover:shadow-sm transition-shadow"
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: meta.color }}>
                    <IconComp size={14} style={{ color: meta.textColor }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.name}</p>
                    <p className="text-xs text-gray-400">{item.provider}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-semibold tabular-nums">{fmtMoney(item.amount)}</p>
                    <p className={`text-[10px] font-medium ${days === 0 ? 'text-red-500' : days <= 3 ? 'text-orange-500' : 'text-gray-400'}`}>
                      {days === 0 ? '오늘 납부' : `${days}일 후`}
                    </p>
                  </div>
                </Link>
              )
            })}
        </div>
      </div>

      <DemoSignupCta
        title="내 생활비를 실제로 관리해보세요"
        desc="무료 회원가입 후 항목을 직접 추가하고 AI 분석을 받아보세요"
      />

      {/* SEO 설명 텍스트 */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
        <h2 className="text-sm font-bold text-gray-700">Life Capsule 대시보드 기능 안내</h2>
        <p className="text-xs text-gray-500 leading-relaxed">
          Life Capsule 대시보드에서는 이번 달 예상 생활비 합계, 카테고리별 지출 현황, 납부 임박 항목, 만료 예정 계약을 한눈에 파악할 수 있습니다.
          구독 서비스 자동 갱신 항목, 보험료 납부일, 렌탈 의무기간 종료일이 자동으로 계산되어 표시됩니다.
        </p>
        <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
          <div>✓ 이번 달 예상 총 지출</div>
          <div>✓ 카테고리별 지출 분류</div>
          <div>✓ 만료·납부 임박 알림</div>
          <div>✓ AI 절약 제안</div>
          <div>✓ 이번 주 납부 예정 목록</div>
          <div>✓ 카드 혜택 달성률</div>
        </div>
      </div>
    </div>
  )
}
