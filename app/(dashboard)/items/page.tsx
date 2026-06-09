'use client'
import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useItems } from '@/hooks/useItems'
import { useGroups } from '@/hooks/useGroups'
import { ItemCard } from '@/components/items/ItemCard'
import { GroupCard } from '@/components/items/GroupCard'
import { ItemForm } from '@/components/items/ItemForm'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Plus, Search, X, FolderPlus } from 'lucide-react'
import { getDaysUntilPayment, toMonthlyAmount } from '@/lib/utils'
import { CATEGORY_META } from '@/lib/utils/category'
import type { CategorySlug } from '@/lib/types'
import { CATEGORY_META as CM } from '@/lib/utils/category'

const SORT_OPTIONS = [
  { value: 'payment', label: '납부일 임박순' },
  { value: 'amount', label: '금액 높은순' },
  { value: 'recent', label: '최근 추가순' },
  { value: 'name', label: '이름순' },
]

export default function ItemsPage() {
  const router = useRouter()
  const { items, isLoading: itemsLoading, addItem } = useItems()
  const { groups, isLoading: groupsLoading, addGroup } = useGroups()
  const [sort, setSort] = useState('payment')
  const [showForm, setShowForm] = useState(false)
  const [showNewGroup, setShowNewGroup] = useState(false)
  const [newGroupName, setNewGroupName] = useState('')
  const [newGroupCategory, setNewGroupCategory] = useState<CategorySlug>('telecom')
  const [newGroupProvider, setNewGroupProvider] = useState('')
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState<CategorySlug | ''>('')

  const isLoading = itemsLoading || groupsLoading

  // 그룹 항목 / 개별 항목 분리
  const groupedItems = useMemo(() => {
    const map: Record<string, typeof items> = {}
    items.forEach(item => {
      if (item.groupId) {
        if (!map[item.groupId]) map[item.groupId] = []
        map[item.groupId].push(item)
      }
    })
    return map
  }, [items])

  const ungroupedItems = useMemo(() => items.filter(i => !i.groupId), [items])

  const categories = useMemo(() => {
    const used = new Set(items.map(i => i.category))
    return Array.from(used).map(slug => ({ slug, label: CATEGORY_META[slug]?.label ?? slug }))
  }, [items])

  const filteredUngrouped = useMemo(() => {
    let list = [...ungroupedItems]
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(i =>
        i.name.toLowerCase().includes(q) ||
        i.provider?.toLowerCase().includes(q) ||
        i.memo?.toLowerCase().includes(q)
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
  }, [ungroupedItems, search, filterCategory, sort])

  const filteredGroups = useMemo(() => {
    return groups.filter(g => {
      const gItems = groupedItems[g.id] ?? []
      if (filterCategory && g.category !== filterCategory) return false
      if (search) {
        const q = search.toLowerCase()
        return (
          g.name.toLowerCase().includes(q) ||
          g.provider?.toLowerCase().includes(q) ||
          gItems.some(i => i.name.toLowerCase().includes(q))
        )
      }
      return true
    })
  }, [groups, groupedItems, search, filterCategory])

  const totalCount = filteredGroups.length + filteredUngrouped.length

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-semibold">전체 항목</h1>
          <p className="text-sm text-gray-400 mt-0.5">{totalCount}개</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowNewGroup(true)}>
            <FolderPlus size={14} className="mr-1" /> 그룹
          </Button>
          <Button onClick={() => setShowForm(true)} size="sm" className="bg-[#6C63FF] hover:bg-[#5A52E8]">
            <Plus size={14} className="mr-1" /> 추가
          </Button>
        </div>
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
          <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <X size={14} />
          </button>
        )}
      </div>

      {/* 카테고리 필터 */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
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
            onClick={() => setFilterCategory(cat.slug === filterCategory ? '' : cat.slug)}
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

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl h-32 animate-pulse" />
          ))}
        </div>
      ) : totalCount === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-4xl mb-3">{search || filterCategory ? '🔍' : '📭'}</div>
          <p className="text-sm">
            {search || filterCategory ? '검색 결과가 없어요' : '등록된 항목이 없어요'}
          </p>
          {(search || filterCategory) && (
            <button
              onClick={() => { setSearch(''); setFilterCategory('') }}
              className="text-xs text-[#6C63FF] mt-2 hover:underline"
            >
              필터 초기화
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredGroups.map(group => (
            <GroupCard
              key={group.id}
              group={group}
              items={groupedItems[group.id] ?? []}
              onClick={() => router.push(`/groups/${group.id}`)}
            />
          ))}
          {filteredUngrouped.map(item => (
            <ItemCard key={item.id} item={item} onClick={() => router.push(`/items/${item.id}`)} />
          ))}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>항목 추가</DialogTitle></DialogHeader>
          <ItemForm
            onSave={data => { addItem(data as any); setShowForm(false) }}
            onCancel={() => setShowForm(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showNewGroup} onOpenChange={setShowNewGroup}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>그룹 만들기</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">그룹명 *</label>
              <input
                className="w-full rounded-md border border-input px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                placeholder="예: SKT 통신 패키지"
                value={newGroupName}
                onChange={e => setNewGroupName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">카테고리 *</label>
              <select
                className="w-full rounded-md border border-input px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                value={newGroupCategory}
                onChange={e => setNewGroupCategory(e.target.value as CategorySlug)}
              >
                {Object.entries(CM).map(([slug, meta]) => (
                  <option key={slug} value={slug}>{meta.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">공급업체</label>
              <input
                className="w-full rounded-md border border-input px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                placeholder="예: SK텔레콤"
                value={newGroupProvider}
                onChange={e => setNewGroupProvider(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-2 mt-2">
            <Button variant="outline" className="flex-1" onClick={() => setShowNewGroup(false)}>취소</Button>
            <Button
              className="flex-1"
              disabled={!newGroupName}
              onClick={async () => {
                await groups && addGroup({ name: newGroupName, category: newGroupCategory, provider: newGroupProvider || undefined })
                setNewGroupName(''); setNewGroupProvider(''); setShowNewGroup(false)
              }}
            >
              만들기
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
