'use client'
import { useState } from 'react'
import { useItems } from '@/hooks/useItems'
import { ItemCard } from '@/components/items/ItemCard'
import { ItemForm } from '@/components/items/ItemForm'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { getDaysUntilPayment } from '@/lib/utils'

const SORT_OPTIONS = [
  { value: 'payment', label: '납부일 임박순' },
  { value: 'amount', label: '금액 높은순' },
  { value: 'recent', label: '최근 추가순' },
]

export default function ItemsPage() {
  const { items, isLoading, addItem } = useItems()
  const [sort, setSort] = useState('payment')
  const [showForm, setShowForm] = useState(false)

  const sorted = [...items].sort((a, b) => {
    if (sort === 'payment') return getDaysUntilPayment(a) - getDaysUntilPayment(b)
    if (sort === 'amount') return b.amount - a.amount
    return 0
  })

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">전체 항목</h1>
          <p className="text-sm text-gray-400 mt-0.5">{items.length}개 항목</p>
        </div>
        <Button onClick={() => setShowForm(true)} size="sm" className="bg-[#6C63FF] hover:bg-[#5A52E8]">
          <Plus size={14} className="mr-1" /> 추가
        </Button>
      </div>

      {/* 정렬 탭 */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {SORT_OPTIONS.map(opt => (
          <button
            key={opt.value}
            onClick={() => setSort(opt.value)}
            className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-full transition-colors ${
              sort === opt.value
                ? 'bg-[#6C63FF] text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
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
      ) : sorted.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-4xl mb-3">📭</div>
          <p className="text-sm">등록된 항목이 없어요</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {sorted.map(item => (
            <ItemCard key={item.id} item={item} />
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
    </div>
  )
}
