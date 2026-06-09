'use client'
import { useState, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/hooks/useAuth'
import { useItems } from '@/hooks/useItems'
import { useGroups } from '@/hooks/useGroups'
import * as groupsDB from '@/lib/firestore/groups'
import * as itemsDB from '@/lib/firestore/items'
import { CATEGORY_META } from '@/lib/utils/category'
import { fmtMoney, toMonthlyAmount } from '@/lib/utils'
import { CategoryBadge } from '@/components/shared/CategoryBadge'
import { ItemCard } from '@/components/items/ItemCard'
import { GroupItemForm } from '@/components/items/GroupItemForm'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Plus, Pencil, Trash2 } from 'lucide-react'
import * as Icons from 'lucide-react'
import type { ItemGroup, ResponsibilityItem, CategorySlug } from '@/lib/types'
import { CATEGORY_META as CM } from '@/lib/utils/category'
import { updateDoc, doc, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export default function GroupDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { user } = useAuth()
  const { updateItem, deleteItem } = useItems()
  const { updateGroup, deleteGroup } = useGroups()
  const qc = useQueryClient()

  const [showAddItem, setShowAddItem] = useState(false)
  const [showEditGroup, setShowEditGroup] = useState(false)
  const [confirmDeleteGroup, setConfirmDeleteGroup] = useState(false)
  const [editGroupName, setEditGroupName] = useState('')
  const [editGroupProvider, setEditGroupProvider] = useState('')

  const { data: group, isLoading: groupLoading } = useQuery<ItemGroup>({
    queryKey: ['group', id],
    queryFn: () => groupsDB.getGroups(user!.uid).then(gs => {
      const found = gs.find(g => g.id === id)
      if (!found) throw new Error('Group not found')
      return found
    }),
    enabled: !!user && !!id,
  })

  const { data: allItems = [], isLoading: itemsLoading } = useQuery<ResponsibilityItem[]>({
    queryKey: ['items', user?.uid],
    queryFn: () => itemsDB.getItems(user!.uid),
    enabled: !!user,
    staleTime: 30_000,
  })

  const items = useMemo(() => allItems.filter(i => i.groupId === id), [allItems, id])
  const total = useMemo(() => items.reduce((sum, i) => sum + toMonthlyAmount(i), 0), [items])

  const handleAddItem = async (data: Partial<ResponsibilityItem>) => {
    await itemsDB.addItem(user!.uid, {
      name: data.name ?? '미입력',
      category: data.category ?? group!.category,
      amount: data.amount ?? 0,
      cycle: data.cycle ?? 'monthly',
      isAutoPayment: data.isAutoPayment ?? false,
      autoRenews: data.autoRenews ?? false,
      provider: data.provider ?? group!.provider ?? '',
      groupId: id,
      aiParsed: false,
      ...data,
    } as any)
    qc.invalidateQueries({ queryKey: ['items', user?.uid] })
    setShowAddItem(false)
  }

  const handleDeleteGroup = async () => {
    // 그룹 내 항목들의 groupId 제거
    await Promise.all(
      items.map(item =>
        updateDoc(doc(db, `users/${user!.uid}/items/${item.id}`), {
          groupId: null,
          updatedAt: Timestamp.now(),
        })
      )
    )
    deleteGroup(id)
    qc.invalidateQueries({ queryKey: ['items', user?.uid] })
    router.back()
  }

  const handleSaveGroupEdit = () => {
    updateGroup({ id, data: { name: editGroupName, provider: editGroupProvider } })
    setShowEditGroup(false)
  }

  if (groupLoading || itemsLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        <div className="h-8 w-32 bg-gray-100 rounded animate-pulse" />
        <div className="h-32 bg-gray-100 rounded-2xl animate-pulse" />
      </div>
    )
  }

  if (!group) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 text-center py-20 text-gray-400">
        <p>그룹을 찾을 수 없어요</p>
        <Button variant="outline" onClick={() => router.back()} className="mt-4">돌아가기</Button>
      </div>
    )
  }

  const meta = CATEGORY_META[group.category]
  const IconComponent = (Icons as any)[meta?.icon] ?? Icons.Package

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="p-1.5 rounded-xl hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-semibold flex-1">그룹 상세</h1>
        <Button variant="outline" size="sm" onClick={() => {
          setEditGroupName(group.name)
          setEditGroupProvider(group.provider ?? '')
          setShowEditGroup(true)
        }}>
          <Pencil size={14} className="mr-1" /> 편집
        </Button>
        <Button variant="outline" size="sm" className="text-red-500 border-red-200 hover:bg-red-50"
          onClick={() => setConfirmDeleteGroup(true)}>
          <Trash2 size={14} />
        </Button>
      </div>

      {/* 그룹 헤더 카드 */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm mb-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: meta?.color }}>
            <IconComponent size={22} style={{ color: meta?.textColor }} />
          </div>
          <div className="flex-1">
            <h2 className="text-base font-semibold">{group.name}</h2>
            {group.provider && <p className="text-sm text-gray-400">{group.provider}</p>}
          </div>
          <CategoryBadge category={group.category} />
        </div>
        <div className="flex items-end justify-between">
          <div>
            <p className={`text-2xl font-bold tabular-nums ${total < 0 ? 'text-blue-500' : ''}`}>
              {fmtMoney(total)}
            </p>
            <p className="text-sm text-gray-400">월 합계 · {items.length}개 항목</p>
          </div>
          <Button size="sm" className="bg-[#6C63FF] hover:bg-[#5A52E8]" onClick={() => setShowAddItem(true)}>
            <Plus size={14} className="mr-1" /> 항목 추가
          </Button>
        </div>
      </div>

      {/* 항목 목록 */}
      {items.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-sm">항목을 추가해보세요</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(item => (
            <div key={item.id} className="relative">
              <div className="absolute -top-2 left-3 z-10">
                <span className="text-[10px] bg-[#6C63FF]/10 text-[#6C63FF] px-2 py-0.5 rounded-full font-medium">
                  {group.name}
                </span>
              </div>
              <ItemCard
                item={item}
                onClick={() => router.push(`/items/${item.id}`)}
              />
            </div>
          ))}
        </div>
      )}

      {/* 항목 추가 다이얼로그 */}
      <Dialog open={showAddItem} onOpenChange={setShowAddItem}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>항목 추가</DialogTitle>
            <p className="text-xs text-gray-400 mt-0.5">{group.name} 그룹에 종속</p>
          </DialogHeader>
          <GroupItemForm
            groupCategory={group.category}
            groupProvider={group.provider}
            onSave={handleAddItem}
            onCancel={() => setShowAddItem(false)}
          />
        </DialogContent>
      </Dialog>

      {/* 그룹 편집 다이얼로그 */}
      <Dialog open={showEditGroup} onOpenChange={setShowEditGroup}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>그룹 편집</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">그룹명</label>
              <input
                className="w-full rounded-md border border-input px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                value={editGroupName}
                onChange={e => setEditGroupName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">공급업체</label>
              <input
                className="w-full rounded-md border border-input px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                value={editGroupProvider}
                onChange={e => setEditGroupProvider(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-2 mt-2">
            <Button variant="outline" className="flex-1" onClick={() => setShowEditGroup(false)}>취소</Button>
            <Button className="flex-1" onClick={handleSaveGroupEdit} disabled={!editGroupName}>저장</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 그룹 삭제 확인 */}
      <Dialog open={confirmDeleteGroup} onOpenChange={setConfirmDeleteGroup}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>그룹 삭제</DialogTitle></DialogHeader>
          <p className="text-sm text-gray-600 py-2">
            <strong>{group.name}</strong> 그룹을 삭제하시겠어요?<br />
            그룹 내 항목들은 삭제되지 않고 개별 항목으로 남습니다.
          </p>
          <div className="flex gap-2 mt-2">
            <Button variant="outline" className="flex-1" onClick={() => setConfirmDeleteGroup(false)}>취소</Button>
            <Button className="flex-1 bg-red-500 hover:bg-red-600" onClick={handleDeleteGroup}>삭제</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
