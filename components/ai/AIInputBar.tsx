'use client'
import { useState, useRef } from 'react'
import { Sparkles, Camera, Plus, MessageCircle } from 'lucide-react'
import { useAIParse } from '@/hooks/useAIParse'
import { ParseResultPreview } from './ParseResultPreview'
import { AIChatPanel } from './AIChatPanel'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ItemForm } from '@/components/items/ItemForm'
import { useItems } from '@/hooks/useItems'

export function AIInputBar() {
  const [input, setInput] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const [showManualForm, setShowManualForm] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const { parseText, parseImage, isLoading, result, reset } = useAIParse()
  const { addItem } = useItems()

  const handleSubmit = async () => {
    if (!input.trim()) return
    const res = await parseText(input)
    if (res) setShowPreview(true)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const res = await parseImage(file)
    if (res) setShowPreview(true)
    e.target.value = ''
  }

  return (
    <>
      {showChat && <AIChatPanel onClose={() => setShowChat(false)} />}

      <div className="fixed bottom-16 lg:bottom-0 left-0 right-0 lg:left-64 z-30 bg-white border-t border-gray-100 p-3">
        {showPreview && result && (
          <ParseResultPreview
            result={result}
            onConfirm={() => { setShowPreview(false); reset(); setInput('') }}
            onClose={() => { setShowPreview(false); reset() }}
          />
        )}

        {isLoading && (
          <div className="flex items-center gap-2 mb-2 text-sm text-gray-400">
            <Sparkles size={14} className="text-[#6C63FF] animate-pulse" />
            AI가 분석 중입니다...
          </div>
        )}

        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 bg-gray-50 rounded-full px-4 py-2.5">
            <Sparkles size={16} className="text-[#6C63FF] flex-shrink-0" />
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              placeholder="무엇을 도와드릴까요? (예: SKT 55,000원 매월 15일)"
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
            />
            <button
              onClick={() => fileRef.current?.click()}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              <Camera size={16} />
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
          </div>
          <button
            onClick={() => setShowChat(prev => !prev)}
            className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors border ${
              showChat ? 'bg-[#6C63FF] text-white border-[#6C63FF]' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
            }`}
          >
            <MessageCircle size={17} />
          </button>
          <button
            onClick={() => setShowManualForm(true)}
            className="w-10 h-10 bg-[#6C63FF] rounded-full flex items-center justify-center text-white flex-shrink-0 hover:bg-[#5A52E8] transition-colors"
          >
            <Plus size={18} />
          </button>
        </div>
      </div>

      <Dialog open={showManualForm} onOpenChange={setShowManualForm}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>항목 수동 추가</DialogTitle>
          </DialogHeader>
          <ItemForm
            onSave={data => { addItem(data as any); setShowManualForm(false) }}
            onCancel={() => setShowManualForm(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
