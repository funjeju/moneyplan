'use client'
import { useState, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { DEMO_ITEMS } from '@/lib/demo-data'
import { ItemCard } from '@/components/items/ItemCard'
import { getDaysUntilPayment, toMonthlyAmount } from '@/lib/utils'
import { CATEGORY_META } from '@/lib/utils/category'
import { Plus, Search, X, Lock } from 'lucide-react'
import type { CategorySlug } from '@/lib/types'

const SORT_OPTIONS = [
  { value: 'payment', label: '납부일 임박순' },
  { value: 'amount', label: '금액 높은순' },
  { value: 'recent', label: '최근 추가순' },
  { value: 'name', label: '이름순' },
]

export function DemoItemsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialCat = (searchParams.get('category') ?? '') as CategorySlug | ''

  const [sort, setSort] = useState('payment')
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState<CategorySlug | ''>(initialCat)

  const categories = useMemo(() => {
    const used = new Set(DEMO_ITEMS.map(i => i.category))
    return Array.from(used).map(slug => ({ slug, label: CATEGORY_META[slug]?.label ?? slug }))
  }, [])

  const filtered = useMemo(() => {
    let list = [...DEMO_ITEMS]
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(i =>
        i.name.toLowerCase().includes(q) ||
        (i.provider ?? '').toLowerCase().includes(q) ||
        (i.memo ?? '').toLowerCase().includes(q)
      )
    }
    if (filterCategory) list = list.filter(i => i.category === filterCategory)
    list.sort((a, b) => {
      if (sort === 'payment') return getDaysUntilPayment(a) - getDaysUntilPayment(b)
      if (sort === 'amount') return b.amount - a.amount
      if (sort === 'name') return a.name.localeCompare(b.name, 'ko')
      return 0
    })
    return list
  }, [search, filterCategory, sort])

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-semibold">전체 항목</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {filtered.length !== DEMO_ITEMS.length
              ? `${filtered.length} / ${DEMO_ITEMS.length}개`
              : `${DEMO_ITEMS.length}개`}
          </p>
        </div>
        <button
          onClick={() => router.push('/signup')}
          className="flex items-center gap-1.5 text-xs px-3 py-2 bg-[#6C63FF] text-white rounded-xl hover:bg-[#5A52E8] transition-colors"
        >
          <Plus size={13} /> 추가하려면 가입
        </button>
      </div>

      {/* 검색 */}
      <div className="relative mb-3">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="항목명, 공급업체, 메모 검색"
          className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2.5 pl-9 pr-9 text-sm outline-none focus:border-[#6C63FF]/30 focus:bg-white transition-colors placeholder:text-gray-400"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            <X size={14} />
          </button>
        )}
      </div>

      {/* 카테고리 필터 */}
      <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
        <button
          onClick={() => setFilterCategory('')}
          className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-full transition-colors ${
            !filterCategory ? 'bg-[#6C63FF] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          전체
        </button>
        {categories.map(cat => (
          <button
            key={cat.slug}
            onClick={() => setFilterCategory(cat.slug === filterCategory ? '' : cat.slug as CategorySlug)}
            className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-full transition-colors ${
              filterCategory === cat.slug
                ? 'bg-[#6C63FF] text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* 정렬 */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {SORT_OPTIONS.map(opt => (
          <button
            key={opt.value}
            onClick={() => setSort(opt.value)}
            className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-full transition-colors ${
              sort === opt.value
                ? 'bg-gray-800 text-white'
                : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-4xl mb-3">🔍</div>
          <p className="text-sm">검색 결과가 없어요</p>
          <button
            onClick={() => { setSearch(''); setFilterCategory('') }}
            className="text-xs text-[#6C63FF] mt-2 hover:underline"
          >
            필터 초기화
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map(item => (
            <ItemCard
              key={item.id}
              item={item}
              onClick={() => router.push(`/demo/items/${item.id}`)}
            />
          ))}
        </div>
      )}

      {/* SEO */}
      <div className="mt-8 bg-white rounded-2xl border border-gray-100 p-5 space-y-2">
        <h2 className="text-sm font-bold text-gray-700">생활비 항목 관리</h2>
        <p className="text-xs text-gray-400 leading-relaxed">
          구독(넷플릭스·유튜브·티빙·Adobe·ChatGPT), 통신비(SKT·KT·LG U+), 보험(실손·암·치아·자동차),
          렌탈(코웨이·청호나이스·리스), 공과금(전기·가스·관리비), 세금(자동차세·재산세),
          주거(월세·전세대출), 사업비(서버·도메인) 등 모든 생활비를 카테고리별로 관리하세요.
        </p>
      </div>
    </div>
  )
}
