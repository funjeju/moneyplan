import { useState } from 'react'
import type { ParseResponse } from '@/lib/types'

export function useAIParse() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<ParseResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const parseMixed = async ({ text, files }: { text?: string; files?: File[] }) => {
    setIsLoading(true)
    setError(null)
    try {
      const images = files?.length
        ? await Promise.all(files.map(async (f) => ({ data: await fileToBase64(f), mimeType: 'image/jpeg' })))
        : []
      const res = await fetch('/api/ai/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, images }),
      })
      const data: ParseResponse = await res.json()
      setResult(data)
      return data
    } catch {
      setError('AI 분석 중 오류가 발생했습니다.')
      return null
    } finally {
      setIsLoading(false)
    }
  }

  // 하위 호환
  const parseText = (text: string) => parseMixed({ text })
  const parseImage = (file: File) => parseMixed({ files: [file] })

  return { parseText, parseImage, parseMixed, isLoading, result, error, reset: () => setResult(null) }
}

// 최대 1024px로 리사이즈 + JPEG 0.85 품질로 압축 → Vercel payload 한계(4.5MB) 대응
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      const MAX = 1024
      let { width, height } = img
      if (width > MAX || height > MAX) {
        if (width > height) { height = Math.round(height * MAX / width); width = MAX }
        else { width = Math.round(width * MAX / height); height = MAX }
      }
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, width, height)
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85)
      resolve(dataUrl.split(',')[1])
    }
    img.onerror = reject
    img.src = url
  })
}
