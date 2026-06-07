'use client'
import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { DEMO_ITEMS } from '@/lib/demo-data'
import { CATEGORY_META } from '@/lib/utils/category'
import { fmtMoney, getDaysUntilExpiry, getDaysUntilPayment } from '@/lib/utils'
import { Search, X, ChevronRight } from 'lucide-react'
import * as Icons from 'lucide-react'
import { DemoSignupCta } from './DemoSignupCta'

const ALL_CATS = Object.keys(CATEGORY_META) as (keyof typeof CATEGORY_META)[]

export function DemoItemList() {
  const searchParams = useSearchParams()
  const initialCat = searchParams.get('category') as (keyof typeof CATEGORY_META) | null
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(initialCat)

  const filtered = useMemo(() => {
    let list = [...DEMO_ITEMS]
    if (activeCategory) list = list.filter(i => i.category === activeCategory)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(i =>
        i.name.toLowerCase().includes(q) ||
        (i.provider ?? '').toLowerCase().includes(q) ||
        (i.memo ?? '').toLowerCase().includes(q)
      )
    }
    return list
  }, [activeCategory, search])

  const catCounts = useMemo(
    () => Object.fromEntries(ALL_CATS.map(c => [c, DEMO_ITEMS.filter(i => i.category === c).length])),
    []
  )

  return (
    <div className="max-w-lg mx-auto px-4 py-5 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold">항목 목록</h1>
        <span className="text-xs text-gray-400">총 {filtered.length}개</span>
      </div>

      {/* 검색 */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="항목명, 서비스명 검색..."
          className="w-full pl-9 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-[#6C63FF] transition-colors"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
            <X size={14} className="text-gray-400" />
          </button>
        )}
      </div>

      {/* 카테고리 필터 */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setActiveCategory(null)}
          className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap font-medium transition-colors flex-shrink-0 ${!activeCategory ? 'bg-[#6C63FF] text-white' : 'bg-white border border-gray-200 text-gray-500'}`}
        >
          전체 {DEMO_ITEMS.length}
        </button>
        {ALL_CATS.filter(c => catCounts[c] > 0).map(c => {
          const meta = CATEGORY_META[c]
          return (
            <button
              key={c}
              onClick={() => setActiveCategory(activeCategory === c ? null : c)}
              className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap font-medium transition-colors flex-shrink-0 ${activeCategory === c ? 'bg-[#6C63FF] text-white' : 'bg-white border border-gray-200 text-gray-500'}`}
            >
              {meta.label} {catCounts[c]}
            </button>
          )
        })}
      </div>

      {/* 항목 목록 */}
      <div className="space-y-2.5">
        {filtered.length === 0 && (
          <div className="text-center py-10 text-sm text-gray-400">검색 결과가 없어요</div>
        )}
        {filtered.map(item => {
          const meta = CATEGORY_META[item.category]
          const IconComp = (Icons as any)[meta.icon] ?? Icons.MoreHorizontal
          const daysExpiry = getDaysUntilExpiry(item)
          const daysPayment = getDaysUntilPayment(item)
          return (
            <Link
              key={item.id}
              href={`/demo/items/${item.id}`}
              className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow block"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: meta.color }}>
                    <IconComp size={17} style={{ color: meta.textColor }} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{item.name}</p>
                    <p className="text-xs text-gray-400">{item.provider}{item.owner ? ` · ${item.owner}` : ''}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: meta.color, color: meta.textColor }}>
                    {meta.label}
                  </span>
                  <ChevronRight size={14} className="text-gray-300" />
                </div>
              </div>
              <div className="flex items-center justify-between pt-2.5 border-t border-gray-50">
                <div>
                  <span className="text-base font-bold tabular-nums">{fmtMoney(item.amount)}</span>
                  <span className="text-xs text-gray-400 ml-1">
                    {item.cycle === 'monthly' ? '/ 월' : item.cycle === 'yearly' ? '/ 년' : item.cycle === 'bimonthly' ? '/ 2개월' : ''}
                  </span>
                </div>
                <div className="flex gap-1.5">
                  {item.isAutoPayment && (
                    <span className="text-[10px] bg-blue-50 text-blue-500 px-1.5 py-0.5 rounded-full">자동결제</span>
                  )}
                  {daysExpiry !== null && daysExpiry <= 60 && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${daysExpiry < 0 ? 'bg-red-100 text-red-600' : daysExpiry <= 14 ? 'bg-orange-100 text-orange-600' : 'bg-yellow-50 text-yellow-600'}`}>
                      {daysExpiry < 0 ? '만료됨' : `만료 ${daysExpiry}일`}
                    </span>
                  )}
                  {item.dayOfMonth && daysPayment <= 7 && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${daysPayment <= 3 ? 'bg-red-100 text-red-600' : 'bg-orange-50 text-orange-500'}`}>
                      {daysPayment === 0 ? '오늘 납부' : `${daysPayment}일 후 납부`}
                    </span>
                  )}
                </div>
              </div>
              {item.memo && (
                <p className="text-xs text-gray-400 mt-2 leading-relaxed truncate">{item.memo}</p>
              )}
            </Link>
          )
        })}
      </div>

      <DemoSignupCta
        title="항목을 직접 추가하고 관리해보세요"
        desc="AI가 문자·영수증을 읽어 자동으로 항목을 등록해드려요"
      />

      {/* SEO */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-2">
        <h2 className="text-sm font-bold text-gray-700">생활비 항목 관리란?</h2>
        <p className="text-xs text-gray-500 leading-relaxed">
          Life Capsule 항목 목록에는 구독 서비스(넷플릭스·유튜브·티빙·Adobe·ChatGPT), 통신비(SKT·KT·LG U+), 보험료(실손·암·치아·자동차보험),
          렌탈(코웨이·청호나이스·자동차 리스), 공과금(전기·가스·관리비), 세금(자동차세·재산세), 주거비(월세·전세대출), 사업비(서버·도메인)까지
          모든 생활비를 카테고리별로 등록하고 관리할 수 있습니다.
        </p>
        <p className="text-xs text-gray-500 leading-relaxed">
          각 항목에는 납부일·만료일 자동 계산, 자동결제 여부, 담당자, 메모, 카드 혜택 연동이 제공됩니다.
          만료 N일 전 푸시 알림으로 약정 만료·보험 갱신·렌탈 해지 시점을 놓치지 마세요.
        </p>
      </div>
    </div>
  )
}
