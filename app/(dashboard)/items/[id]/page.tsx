'use client'
import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/hooks/useAuth'
import { useItems } from '@/hooks/useItems'
import * as itemsDB from '@/lib/firestore/items'
import { CATEGORY_META } from '@/lib/utils/category'
import { fmtMoney, fmtDate, getDaysUntilPayment, getDaysUntilExpiry } from '@/lib/utils'
import { CategoryBadge } from '@/components/shared/CategoryBadge'
import { ItemForm } from '@/components/items/ItemForm'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Pencil, Trash2, CheckCircle2, Upload } from 'lucide-react'
import * as Icons from 'lucide-react'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from '@/lib/firebase'
import { useCards } from '@/hooks/useCards'
import type { ResponsibilityItem } from '@/lib/types'

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

export default function ItemDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { user } = useAuth()
  const { updateItem, deleteItem } = useItems()
  const { cards } = useCards()
  const [showEdit, setShowEdit] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [showPaidDialog, setShowPaidDialog] = useState(false)
  const [paidDate, setPaidDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [paidMethod, setPaidMethod] = useState<'card' | 'cash' | 'other'>('card')
  const [paidCardId, setPaidCardId] = useState('')
  const [cashReceipt, setCashReceipt] = useState(false)
  const [otherMethod, setOtherMethod] = useState('')
  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  const [savingPaid, setSavingPaid] = useState(false)

  const { data: item, isLoading } = useQuery<ResponsibilityItem>({
    queryKey: ['item', id],
    queryFn: async () => {
      const items = await itemsDB.getItems(user!.uid)
      const found = items.find(i => i.id === id)
      if (!found) throw new Error('Item not found')
      return found
    },
    enabled: !!user && !!id,
  })

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        <div className="h-8 w-32 bg-gray-100 rounded animate-pulse" />
        <div className="h-40 bg-gray-100 rounded-2xl animate-pulse" />
        <div className="h-60 bg-gray-100 rounded-2xl animate-pulse" />
      </div>
    )
  }

  if (!item) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 text-center py-20 text-gray-400">
        <p>항목을 찾을 수 없어요</p>
        <Button variant="outline" onClick={() => router.back()} className="mt-4">돌아가기</Button>
      </div>
    )
  }

  const meta = CATEGORY_META[item.category]
  const IconComponent = (Icons as any)[meta.icon] ?? Icons.MoreHorizontal
  const daysUntilPayment = getDaysUntilPayment(item)
  const daysUntilExpiry = getDaysUntilExpiry(item)

  const handleDelete = () => {
    deleteItem(item.id)
    router.back()
  }

  const handleMarkPaid = async () => {
    setSavingPaid(true)
    try {
      let receiptUrl: string | undefined
      if (receiptFile && user) {
        const storageRef = ref(storage, `users/${user.uid}/receipts/${Date.now()}-${receiptFile.name}`)
        await uploadBytes(storageRef, receiptFile)
        receiptUrl = await getDownloadURL(storageRef)
      }
      const paidCard = cards.find(c => c.id === paidCardId)
      const paidPaymentMethod =
        paidMethod === 'card' ? (paidCard?.name ?? item.paymentMethod ?? '') :
        paidMethod === 'cash' ? `현금${cashReceipt ? ' (현금영수증 처리)' : ''}` :
        otherMethod || '기타'

      updateItem({
        id: item.id,
        data: {
          status: 'paid',
          paidAt: new Date(paidDate) as any,
          paymentMethod: paidPaymentMethod,
          ...(paidMethod === 'card' && paidCardId ? { paymentCardId: paidCardId } : {}),
          ...(receiptUrl ? { receiptUrl } : {}),
        },
      })
      setShowPaidDialog(false)
      router.back()
    } finally {
      setSavingPaid(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="p-1.5 rounded-xl hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-semibold flex-1">항목 상세</h1>
        {item.cycle === 'once' && item.status !== 'paid' && (
          <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white" onClick={() => setShowPaidDialog(true)}>
            <CheckCircle2 size={14} className="mr-1" /> 납부완료
          </Button>
        )}
        {item.status === 'paid' && (
          <span className="text-xs bg-green-50 text-green-600 border border-green-200 px-2 py-1 rounded-lg font-medium">✅ 납부완료</span>
        )}
        <Button variant="outline" size="sm" onClick={() => setShowEdit(true)}>
          <Pencil size={14} className="mr-1" /> 편집
        </Button>
        <Button variant="outline" size="sm" className="text-red-500 border-red-200 hover:bg-red-50" onClick={() => setConfirmDelete(true)}>
          <Trash2 size={14} />
        </Button>
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
            <p className={`text-2xl font-bold tabular-nums ${item.amount < 0 ? 'text-blue-500' : ''}`}>
              {fmtMoney(item.amount, item.currency)}
            </p>
            <p className="text-sm text-gray-400">{CYCLE_LABELS[item.cycle]}</p>
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

      {/* 상세 정보 */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm mb-4">
        <h3 className="text-sm font-semibold text-gray-500 mb-2">계약 정보</h3>
        <DetailRow label="명의자" value={item.owner} />
        <DetailRow label="결제 수단" value={item.paymentMethod} />
        <DetailRow label="계좌/카드번호" value={item.accountNumber} />
        <DetailRow label="계약 시작" value={fmtDate(item.contractStartDate)} />
        <DetailRow label="계약 만료" value={item.contractEndDate ? `${fmtDate(item.contractEndDate)}${daysUntilExpiry !== null ? ` (${daysUntilExpiry < 0 ? '만료됨' : `${daysUntilExpiry}일 남음`})` : ''}` : null} />
        <DetailRow label="자동 갱신" value={item.autoRenews ? '자동 갱신' : '수동 갱신'} />
        <DetailRow label="최소 의무 기간" value={item.minimumContractMonths ? `${item.minimumContractMonths}개월` : null} />
        {item.discountAmount && (
          <DetailRow label="할인 금액" value={`${fmtMoney(item.discountAmount)} (${item.discountReason || '할인'})`} />
        )}
      </div>

      {(item.providerUrl || item.providerPhone || item.memo) && (
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm mb-4">
          <h3 className="text-sm font-semibold text-gray-500 mb-2">기타 정보</h3>
          <DetailRow label="공급업체 URL" value={item.providerUrl} />
          <DetailRow label="고객센터" value={item.providerPhone} />
          <DetailRow label="메모" value={item.memo} />
        </div>
      )}

      {/* 원본 이미지 */}
      {item.sourceImageUrls && item.sourceImageUrls.length > 0 && (
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm mb-4">
          <h3 className="text-sm font-semibold text-gray-500 mb-3">원본 이미지</h3>
          <div className="flex flex-wrap gap-2">
            {item.sourceImageUrls.map((url, i) => (
              <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={`원본 이미지 ${i + 1}`}
                  className="h-40 w-auto rounded-xl border border-gray-200 object-contain hover:opacity-80 transition-opacity"
                />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* AI 파싱 정보 */}
      {item.aiParsed && (
        <div className="flex items-center gap-2 text-xs text-gray-400 mt-2">
          <Icons.Sparkles size={12} />
          <span>AI가 파싱한 항목 (신뢰도 {Math.round((item.aiConfidence ?? 0) * 100)}%)</span>
        </div>
      )}

      {/* 편집 다이얼로그 */}
      <Dialog open={showEdit} onOpenChange={setShowEdit}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>항목 편집</DialogTitle></DialogHeader>
          <ItemForm
            initialData={item}
            onSave={data => {
              updateItem({ id: item.id, data })
              setShowEdit(false)
            }}
            onCancel={() => setShowEdit(false)}
          />
        </DialogContent>
      </Dialog>

      {/* 납부완료 다이얼로그 */}
      <Dialog open={showPaidDialog} onOpenChange={setShowPaidDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>납부 완료 처리</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">납부일 *</label>
              <input
                type="date"
                value={paidDate}
                onChange={e => setPaidDate(e.target.value)}
                className="w-full rounded-md border border-input px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-2 block">납부 수단</label>
              <div className="flex gap-2 mb-3">
                {(['card', 'cash', 'other'] as const).map(m => (
                  <button
                    key={m}
                    onClick={() => setPaidMethod(m)}
                    className={`flex-1 py-1.5 rounded-lg text-sm border transition-colors ${paidMethod === m ? 'bg-[#6C63FF] text-white border-[#6C63FF]' : 'border-gray-200 text-gray-500 hover:border-[#6C63FF]/40'}`}
                  >
                    {m === 'card' ? '카드' : m === 'cash' ? '현금' : '기타'}
                  </button>
                ))}
              </div>
              {paidMethod === 'card' && (
                cards.length > 0 ? (
                  <Select value={paidCardId || '__none__'} onValueChange={v => setPaidCardId(v === '__none__' ? '' : (v ?? ''))}>
                    <SelectTrigger>
                      <SelectValue>
                        {paidCardId
                          ? (() => { const c = cards.find(x => x.id === paidCardId); return c ? `${c.name}${c.last4Digits ? ` (${c.last4Digits})` : ''}` : '카드 선택' })()
                          : '카드 선택'}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">카드 선택 안함</SelectItem>
                      {cards.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.name}{c.last4Digits ? ` (${c.last4Digits})` : ''}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <input
                    type="text"
                    placeholder="카드명 입력"
                    className="w-full rounded-md border border-input px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                    value={otherMethod}
                    onChange={e => setOtherMethod(e.target.value)}
                  />
                )
              )}
              {paidMethod === 'cash' && (
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={cashReceipt} onChange={e => setCashReceipt(e.target.checked)} className="rounded" />
                  현금영수증 처리
                </label>
              )}
              {paidMethod === 'other' && (
                <input
                  type="text"
                  placeholder="납부 수단 직접 입력"
                  className="w-full rounded-md border border-input px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                  value={otherMethod}
                  onChange={e => setOtherMethod(e.target.value)}
                />
              )}
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">납부 영수증 (선택)</label>
              <label className="flex items-center gap-2 cursor-pointer w-full rounded-md border border-dashed border-gray-300 px-3 py-3 hover:border-[#6C63FF] hover:bg-[#6C63FF]/5 transition-colors">
                <Upload size={15} className="text-gray-400 flex-shrink-0" />
                <span className="text-sm text-gray-400 truncate">
                  {receiptFile ? receiptFile.name : '이미지 또는 PDF 첨부'}
                </span>
                <input type="file" accept="image/*,application/pdf" className="hidden"
                  onChange={e => setReceiptFile(e.target.files?.[0] ?? null)} />
              </label>
              {receiptFile && (
                <button onClick={() => setReceiptFile(null)} className="text-xs text-red-400 mt-1 hover:underline">제거</button>
              )}
            </div>
            <p className="text-xs text-gray-400">납부완료 처리된 항목은 납부완료 메뉴로 이동합니다.</p>
          </div>
          <div className="flex gap-2 mt-2">
            <Button variant="outline" className="flex-1" onClick={() => setShowPaidDialog(false)}>취소</Button>
            <Button className="flex-1 bg-green-500 hover:bg-green-600" onClick={handleMarkPaid} disabled={savingPaid}>
              {savingPaid ? '처리 중...' : '완료 처리'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 삭제 확인 다이얼로그 */}
      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>항목 삭제</DialogTitle></DialogHeader>
          <p className="text-sm text-gray-600 py-2">
            <strong>{item.name}</strong>을 삭제하시겠어요?<br />
            삭제된 항목은 보관함으로 이동합니다.
          </p>
          <div className="flex gap-2 mt-2">
            <Button variant="outline" className="flex-1" onClick={() => setConfirmDelete(false)}>취소</Button>
            <Button className="flex-1 bg-red-500 hover:bg-red-600" onClick={handleDelete}>삭제</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
