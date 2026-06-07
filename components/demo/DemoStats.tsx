'use client'
import { DEMO_ITEMS } from '@/lib/demo-data'
import { CATEGORY_META } from '@/lib/utils/category'
import { fmtMoney, toMonthlyAmount } from '@/lib/utils'
import { TrendingDown, TrendingUp, Minus } from 'lucide-react'
import * as Icons from 'lucide-react'
import { DemoSignupCta } from './DemoSignupCta'

const active = DEMO_ITEMS.filter(i => i.status === 'active')
const MONTHLY = active.reduce((s, i) => s + toMonthlyAmount(i), 0)

const BY_CAT = Object.entries(CATEGORY_META)
  .map(([slug, meta]) => {
    const items = active.filter(i => i.category === slug)
    const total = items.reduce((s, i) => s + toMonthlyAmount(i), 0)
    return { slug, meta, items, total }
  })
  .filter(x => x.total > 0)
  .sort((a, b) => b.total - a.total)

const TOP5 = [...active]
  .sort((a, b) => toMonthlyAmount(b) - toMonthlyAmount(a))
  .slice(0, 5)

// 가짜 월별 데이터 (6개월)
const MONTHS = ['1월', '2월', '3월', '4월', '5월', '6월']
const MONTH_DATA = [2050000, 2120000, 1980000, 2200000, 2090000, MONTHLY]
const maxMonth = Math.max(...MONTH_DATA)

export function DemoStats() {
  return (
    <div className="max-w-lg mx-auto px-4 py-5 space-y-5">
      <h1 className="text-lg font-bold">지출 분석</h1>

      {/* 이번달 요약 */}
      <div className="bg-gradient-to-br from-[#6C63FF] to-[#9B93FF] rounded-3xl p-5 text-white">
        <p className="text-sm opacity-80 mb-1">이번 달 예상 총 지출</p>
        <p className="text-4xl font-bold tabular-nums">{fmtMoney(MONTHLY)}</p>
        <div className="flex items-center gap-1.5 mt-2">
          <TrendingDown size={13} className="text-green-300" />
          <span className="text-xs text-green-200">지난달 대비 110,000원 절약</span>
        </div>
      </div>

      {/* 카테고리 비율 */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h2 className="text-sm font-bold mb-4">카테고리별 지출 비율</h2>
        <div className="space-y-3">
          {BY_CAT.map(({ slug, meta, total }) => {
            const pct = Math.round((total / MONTHLY) * 100)
            const IconComp = (Icons as any)[meta.icon] ?? Icons.MoreHorizontal
            return (
              <div key={slug}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: meta.color }}>
                      <IconComp size={11} style={{ color: meta.textColor }} />
                    </div>
                    <span className="text-xs font-medium text-gray-700">{meta.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold tabular-nums">{fmtMoney(total)}</span>
                    <span className="text-xs text-gray-400 w-8 text-right">{pct}%</span>
                  </div>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${pct}%`, background: meta.textColor !== '#fff' ? meta.textColor : '#6C63FF' }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 월별 추이 */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h2 className="text-sm font-bold mb-4">월별 지출 추이 (6개월)</h2>
        <div className="flex items-end gap-2 h-36">
          {MONTH_DATA.map((v, i) => {
            const h = Math.round((v / maxMonth) * 100)
            const isLast = i === MONTH_DATA.length - 1
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[9px] text-gray-400 tabular-nums">
                  {(v / 10000).toFixed(0)}만
                </span>
                <div
                  className={`w-full rounded-t-lg transition-all duration-500 ${isLast ? 'bg-[#6C63FF]' : 'bg-[#6C63FF]/20'}`}
                  style={{ height: `${h}%` }}
                />
                <span className="text-[9px] text-gray-400">{MONTHS[i]}</span>
              </div>
            )
          })}
        </div>
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50 text-xs">
          <span className="text-gray-400">6개월 평균</span>
          <span className="font-bold tabular-nums">
            {fmtMoney(Math.round(MONTH_DATA.reduce((s, v) => s + v, 0) / MONTH_DATA.length))}
          </span>
        </div>
      </div>

      {/* TOP 5 지출 항목 */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h2 className="text-sm font-bold mb-4">TOP 5 지출 항목</h2>
        <div className="space-y-3">
          {TOP5.map((item, idx) => {
            const meta = CATEGORY_META[item.category]
            const amt = toMonthlyAmount(item)
            const IconComp = (Icons as any)[meta.icon] ?? Icons.MoreHorizontal
            return (
              <div key={item.id} className="flex items-center gap-3">
                <span className="text-sm font-bold text-gray-300 w-5 flex-shrink-0">{idx + 1}</span>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: meta.color }}>
                  <IconComp size={14} style={{ color: meta.textColor }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.name}</p>
                  <p className="text-[10px] text-gray-400">{meta.label} · {item.provider}</p>
                </div>
                <p className="text-sm font-bold tabular-nums flex-shrink-0">{fmtMoney(amt)}<span className="text-[10px] text-gray-400 font-normal">/월</span></p>
              </div>
            )
          })}
        </div>
      </div>

      {/* 절약 포인트 */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
        <p className="text-sm font-bold text-amber-700 mb-3">💡 절약 포인트</p>
        <div className="space-y-2.5">
          {[
            { title: '구독 서비스 정리', desc: '티빙 + 넷플릭스 중복 → 월 10,900원 절약 가능', saving: 10900 },
            { title: '통신비 최적화', desc: 'SKT 약정 만료 → 번호이동 시 월 최대 15,000원 절약', saving: 15000 },
            { title: '보험료 연납 전환', desc: '실손보험 연납 전환 시 연간 약 5% 할인', saving: 5340 },
          ].map(({ title, desc, saving }) => (
            <div key={title} className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <p className="text-xs font-semibold text-gray-700">{title}</p>
                <p className="text-[11px] text-gray-500 mt-0.5">{desc}</p>
              </div>
              <span className="text-xs font-bold text-green-600 flex-shrink-0">-{fmtMoney(saving)}</span>
            </div>
          ))}
          <div className="pt-2 border-t border-amber-200 flex justify-between items-center">
            <span className="text-xs font-bold text-amber-700">월 최대 절약 가능액</span>
            <span className="text-sm font-bold text-green-600">-{fmtMoney(31240)}</span>
          </div>
        </div>
      </div>

      <DemoSignupCta
        title="내 실제 지출을 분석해보세요"
        desc="항목을 등록하면 AI가 즉시 절약 포인트를 찾아드려요"
      />

      {/* SEO */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-2">
        <h2 className="text-sm font-bold text-gray-700">생활비 지출 분석 기능</h2>
        <p className="text-xs text-gray-500 leading-relaxed">
          Life Capsule 지출 분석 화면에서는 카테고리별 월 지출 비율, 6개월 지출 추이 그래프, TOP 5 지출 항목, 절약 가능 포인트를 자동으로 계산해 보여줍니다.
          구독·보험·통신비·렌탈·세금·공과금 등 모든 생활비 카테고리를 분석하여 불필요한 지출을 찾아드립니다.
        </p>
      </div>
    </div>
  )
}
