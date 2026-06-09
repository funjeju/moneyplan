'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { Sparkles, Camera, Plus, MessageCircle, X, Send } from 'lucide-react'
import { useAIParse } from '@/hooks/useAIParse'
import { ParseResultPreview } from './ParseResultPreview'
import { AIChatPanel } from './AIChatPanel'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ItemForm } from '@/components/items/ItemForm'
import { useItems } from '@/hooks/useItems'

export function AIInputBar() {
  const [input, setInput] = useState('')
  const [attachments, setAttachments] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [showPreview, setShowPreview] = useState(false)
  const [showManualForm, setShowManualForm] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const { parseMixed, isLoading, result, error, reset } = useAIParse()
  const { addItem } = useItems()

  const addFiles = useCallback((files: File[]) => {
    if (!files.length) return
    setAttachments(prev => [...prev, ...files])
    files.forEach(f => {
      const url = URL.createObjectURL(f)
      setPreviews(prev => [...prev, url])
    })
  }, [])

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const imageFiles = Array.from(e.clipboardData?.items ?? [])
        .filter(item => item.type.startsWith('image/'))
        .map(item => item.getAsFile())
        .filter((f): f is File => f !== null)
      if (imageFiles.length) addFiles(imageFiles)
    }
    window.addEventListener('paste', handlePaste)
    return () => window.removeEventListener('paste', handlePaste)
  }, [addFiles])

  const handleFileAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    addFiles(Array.from(e.target.files ?? []))
    e.target.value = ''
  }

  const removeAttachment = (idx: number) => {
    URL.revokeObjectURL(previews[idx])
    setAttachments(prev => prev.filter((_, i) => i !== idx))
    setPreviews(prev => prev.filter((_, i) => i !== idx))
  }

  const canSend = !isLoading && (input.trim().length > 0 || attachments.length > 0)

  const handleSend = async () => {
    if (!canSend) return
    const res = await parseMixed({ text: input.trim() || undefined, files: attachments })
    if (res) setShowPreview(true)
  }

  const handleReparse = async (followUpAnswer: string) => {
    if (!result) return
    const questions = result.followUpQuestions ?? []
    const combined = [
      input.trim() ? `[원본 요청]\n${input.trim()}` : '',
      questions.length > 0 ? `[AI 질문]\n${questions.join('\n')}` : '',
      `[사용자 답변 - 이 답변을 반영해 최종 결과를 확정하세요. 추가 질문 없이 followUpQuestions는 빈 배열로 반환하세요]\n${followUpAnswer}`,
    ].filter(Boolean).join('\n\n')
    const res = await parseMixed({ text: combined, files: attachments })
    if (res) setShowPreview(true)
  }

  const handleConfirm = () => {
    setShowPreview(false)
    reset()
    setInput('')
    attachments.forEach((_, i) => URL.revokeObjectURL(previews[i]))
    setAttachments([])
    setPreviews([])
  }

  const handleClose = () => {
    setShowPreview(false)
    reset()
  }

  return (
    <>
      {showChat && <AIChatPanel onClose={() => setShowChat(false)} />}

      <div className="fixed bottom-16 lg:bottom-0 left-0 right-0 lg:left-64 z-30 bg-white border-t border-gray-100 p-3">
        {showPreview && result && (
          <ParseResultPreview
            result={result}
            sourceImages={attachments}
            onConfirm={handleConfirm}
            onClose={handleClose}
            onReparse={handleReparse}
          />
        )}

        {/* 첨부 썸네일 row */}
        {previews.length > 0 && (
          <div className="flex gap-2 mb-2 flex-wrap">
            {previews.map((url, i) => (
              <div key={i} className="relative w-14 h-14 rounded-xl overflow-hidden border border-gray-200 flex-shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="w-full h-full object-cover" />
                <button
                  onClick={() => removeAttachment(i)}
                  className="absolute top-0.5 right-0.5 w-4 h-4 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-black/80"
                >
                  <X size={9} />
                </button>
              </div>
            ))}
          </div>
        )}

        {isLoading && (
          <div className="flex items-center gap-2 mb-2 text-sm text-gray-400">
            <Sparkles size={14} className="text-[#6C63FF] animate-pulse" />
            AI가 분석 중입니다...
          </div>
        )}

        {error && (
          <div className="flex items-start gap-2 mb-2 p-2.5 bg-red-50 rounded-xl text-xs text-red-600">
            <span className="flex-1 break-all">{error}</span>
            <button onClick={() => reset()} className="text-red-400 hover:text-red-600 flex-shrink-0"><X size={12} /></button>
          </div>
        )}

        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 bg-gray-50 rounded-full px-4 py-2.5">
            <Sparkles size={16} className="text-[#6C63FF] flex-shrink-0" />
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder={attachments.length > 0 ? '부연설명을 추가하세요 (선택)' : '무엇을 도와드릴까요? (예: SKT 55,000원 매월 15일)'}
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
            />
            <button
              onClick={() => fileRef.current?.click()}
              className="p-1 text-gray-400 hover:text-[#6C63FF] transition-colors"
              title="이미지 첨부"
            >
              <Camera size={16} />
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileAdd}
            />
            {canSend && (
              <button
                onClick={handleSend}
                className="p-1 text-[#6C63FF] hover:text-[#5A52E8] transition-colors"
              >
                <Send size={16} />
              </button>
            )}
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
