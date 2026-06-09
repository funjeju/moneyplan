'use client'
import { useState } from 'react'
import { X, Check, Pencil } from 'lucide-react'
import { CategoryBadge } from '@/components/shared/CategoryBadge'
import { useItems } from '@/hooks/useItems'
import { useGroups } from '@/hooks/useGroups'
import { useAuth } from '@/hooks/useAuth'
import { uploadParseImages } from '@/lib/storage/uploadParseImages'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ItemForm } from '@/components/items/ItemForm'
import type { ParseResponse, ParsedItem, ResponsibilityItem } from '@/lib/types'

const CYCLE_LABELS: Record<string, string> = {
  monthly: '매월', bimonthly: '2개월', quarterly: '분기',
  semiannual: '반기', yearly: '매년', once: '일회',
}

interface Props {
  result: ParseResponse
  sourceImages?: File[]
  originalText?: string
  onConfirm: () => void
  onClose: () => void
  onReparse?: (followUpAnswer: string) => Promise<void>
}

export function ParseResultPreview({ result, sourceImages, onConfirm, onClose, onReparse }: Props) {
  const { addItems } = useItems()
  const { addGroup } = useGroups()
  const { user } = useAuth()
  const items = result.items ?? []
  const followUpQuestions = result.followUpQuestions ?? []

  const [selected, setSelected] = useState<boolean[]>(items.map(() => true))
  const [drafts, setDrafts] = useState<ParsedItem[]>(items)
  const [editingIdx, setEditingIdx] = useState<number | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [followUpAnswer, setFollowUpAnswer] = useState('')
  const [reparsing, setReparsing] = useState(false)

  if (items.length === 0) {
    return (
      <div className="mb-4 bg-white border border-gray-200 rounded-2xl shadow-lg p-4 flex items-center justify-between">
        <p className="text-sm text-gray-500">인식된 항목이 없습니다. 부연설명을 추가해 다시 시도해보세요.</p>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 ml-3">
          <X size={16} />
        </button>
      </div>
    )
  }

  const handleAddSelected = async () => {
    setSaving(true)
    setSaveError(null)
    try {
      let sourceImageUrls: string[] | undefined
      if (sourceImages?.length && user) {
        sourceImageUrls = await uploadParseImages(user.uid, sourceImages)
      }
      const selectedDrafts = drafts.filter((_, i) => selected[i])

      // groupName 기준으로 그룹 생성 후 groupId 매핑
      const groupNameToId: Record<string, string> = {}
      for (const item of selectedDrafts) {
        const gName = (item as any).groupName
        if (gName && !groupNameToId[gName] && user) {
          const gId = await addGroup({
            name: gName,
            category: item.category ?? 'other',
            provider: item.provider ?? undefined,
          })
          groupNameToId[gName] = gId
        }
      }

      const toAdd = selectedDrafts.map(item => {
        const gName = (item as any).groupName
        const base = { ...item }
        delete (base as any).groupName
        if (gName && groupNameToId[gName]) base.groupId = groupNameToId[gName]
        if (sourceImageUrls) base.sourceImageUrls = sourceImageUrls
        return base
      })
      await addItems(toAdd)
      onConfirm()
    } catch (e: any) {
      setSaveError(e?.message ?? '저장 중 오류가 발생했습니다.')
    } finally {
      setSaving(false)
    }
  }

  const handleReparse = async () => {
    if (!onReparse || !followUpAnswer.trim()) return
    setReparsing(true)
    try {
      await onReparse(followUpAnswer.trim())
      setFollowUpAnswer('')
    } finally {
      setReparsing(false)
    }
  }

  const handleSaveEdit = (idx: number, data: Partial<ResponsibilityItem>) => {
    const next = [...drafts]
    next[idx] = { ...drafts[idx], ...data }
    setDrafts(next)
    setEditingIdx(null)
  }

  return (
    <>
      <div className="mb-4 bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden">
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <p className="text-sm font-medium">
            {items.length}개 항목 발견
            <span className="text-gray-400 font-normal ml-1">
              (신뢰도 {Math.round((result.confidence ?? 0) * 100)}%)
            </span>
          </p>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={16} />
          </button>
        </div>

        {followUpQuestions.length > 0 && (
          <div className="mx-4 mb-3 p-3 bg-[#6C63FF]/5 rounded-xl space-y-2">
            <p className="text-xs text-[#6C63FF] font-medium">💡 AI 추가 질문</p>
            {followUpQuestions.map((q, i) => (
              <p key={i} className="text-xs text-gray-600">{q}</p>
            ))}
            {onReparse && (
              <div className="flex gap-2 mt-2">
                <input
                  type="text"
                  value={followUpAnswer}
                  onChange={e => setFollowUpAnswer(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && followUpAnswer.trim() && !reparsing) handleReparse()
                  }}
                  placeholder="답변을 입력하세요..."
                  className="flex-1 text-xs bg-white border border-[#6C63FF]/30 rounded-lg px-3 py-2 outline-none focus:border-[#6C63FF]"
                />
                <button
                  onClick={handleReparse}
                  disabled={!followUpAnswer.trim() || reparsing}
                  className="flex-shrink-0 text-xs px-3 py-2 bg-[#6C63FF] text-white rounded-lg disabled:opacity-50 hover:bg-[#5A52E8] transition-colors"
                >
                  {reparsing ? '분석 중...' : '재분석'}
                </button>
              </div>
            )}
          </div>
        )}

        <div className="divide-y divide-gray-100">
          {drafts.map((item, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3">
              <input
                type="checkbox"
                checked={selected[i]}
                onChange={e => {
                  const next = [...selected]
                  next[i] = e.target.checked
                  setSelected(next)
                }}
                className="rounded"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm font-medium truncate">{item.name || '미확인 항목'}</span>
                  {item.category && <CategoryBadge category={item.category} size="sm" />}
                </div>
                <p className="text-xs text-gray-400">
                  {item.amount ? `${item.amount.toLocaleString()}원` : '금액 미확인'}
                  {item.cycle ? ` · ${CYCLE_LABELS[item.cycle]}` : ''}
                  {item.dayOfMonth ? ` ${item.dayOfMonth}일` : ''}
                </p>
                {(result.missingFields?.[i]?.length ?? 0) > 0 && (
                  <p className="text-xs text-orange-500 mt-0.5">
                    미확인: {result.missingFields[i].join(', ')}
                  </p>
                )}
              </div>
              <button
                onClick={() => setEditingIdx(i)}
                className="p-1.5 text-gray-400 hover:text-[#6C63FF] rounded-lg hover:bg-[#6C63FF]/10 flex-shrink-0"
                title="수정"
              >
                <Pencil size={14} />
              </button>
            </div>
          ))}
        </div>

        {saveError && (
          <div className="mx-4 mb-2 p-2.5 bg-red-50 rounded-xl text-xs text-red-600 break-all">
            저장 실패: {saveError}
          </div>
        )}

        <div className="flex gap-2 p-4">
          <button
            onClick={handleAddSelected}
            disabled={!selected.some(Boolean) || saving}
            className="flex-1 flex items-center justify-center gap-1.5 bg-[#6C63FF] text-white rounded-full py-2.5 text-sm font-medium disabled:opacity-50 hover:bg-[#5A52E8] transition-colors"
          >
            <Check size={14} />
            {saving ? '저장 중...' : `선택 항목 추가 (${selected.filter(Boolean).length}개)`}
          </button>
        </div>
      </div>

      {editingIdx !== null && (
        <Dialog open onOpenChange={() => setEditingIdx(null)}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>항목 수정</DialogTitle>
            </DialogHeader>
            <ItemForm
              initialData={drafts[editingIdx]}
              onSave={(data) => handleSaveEdit(editingIdx, data)}
              onCancel={() => setEditingIdx(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
