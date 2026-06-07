'use client'
import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useCards } from '@/hooks/useCards'
import { useItems } from '@/hooks/useItems'
import { calculateBenefitAchievement, getTotalExpectedSavings } from '@/lib/utils/card'
import { fmtMoney } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { CardForm } from '@/components/cards/CardForm'
import { CardDetail } from '@/components/cards/CardDetail'

export default function CardsPage() {
  const { cards, addCard } = useCards()
  const { items } = useItems()
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null)

  const totalSavings = getTotalExpectedSavings(cards, items)
  const selectedCard = cards.find(c => c.id === selectedCardId)

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">카드 관리</h1>
          {totalSavings > 0 && (
            <p className="text-sm text-green-500 mt-0.5">
              이번달 예상 혜택: {fmtMoney(totalSavings)}
            </p>
          )}
        </div>
        <Button onClick={() => setShowAddForm(true)} size="sm" className="bg-[#6C63FF] hover:bg-[#5A52E8]">
          <Plus size={14} className="mr-1" /> 카드 추가
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map(card => {
          const achievements = calculateBenefitAchievement(card, items)
          const topRate = Math.max(...achievements.map(a => a.rate), 0)

          return (
            <button
              key={card.id}
              onClick={() => setSelectedCardId(card.id)}
              className="text-left rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              <div
                className="p-4 text-white"
                style={{ background: `linear-gradient(135deg, ${card.color ?? '#1A1D29'}, ${card.color ?? '#1A1D29'}bb)` }}
              >
                <p className="text-xs opacity-70">{card.issuer}</p>
                <p className="text-sm font-semibold mt-1">{card.name}</p>
              </div>
              <div className="bg-white p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">혜택 달성률</span>
                  <span className={`text-xs font-semibold ${topRate >= 1 ? 'text-green-500' : 'text-orange-500'}`}>
                    {Math.round(topRate * 100)}%
                  </span>
                </div>
              </div>
            </button>
          )
        })}

        {cards.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-400">
            <div className="text-4xl mb-3">💳</div>
            <p className="text-sm">등록된 카드가 없어요</p>
            <p className="text-xs mt-1">카드를 등록하면 혜택 달성률을 계산해드려요</p>
          </div>
        )}
      </div>

      <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>카드 추가</DialogTitle></DialogHeader>
          <CardForm
            onSave={data => { addCard(data); setShowAddForm(false) }}
            onCancel={() => setShowAddForm(false)}
          />
        </DialogContent>
      </Dialog>

      {selectedCard && (
        <Dialog open={!!selectedCardId} onOpenChange={() => setSelectedCardId(null)}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{selectedCard.name}</DialogTitle></DialogHeader>
            <CardDetail card={selectedCard} allItems={items} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
