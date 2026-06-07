import { useState } from 'react'
import type { ParseResponse } from '@/lib/types'

export function useAIParse() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<ParseResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const parseText = async (text: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/ai/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'text', content: text }),
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

  const parseImage = async (file: File) => {
    setIsLoading(true)
    setError(null)
    try {
      const base64 = await fileToBase64(file)
      const res = await fetch('/api/ai/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'image', content: base64 }),
      })
      const data: ParseResponse = await res.json()
      setResult(data)
      return data
    } catch {
      setError('이미지 분석 중 오류가 발생했습니다.')
      return null
    } finally {
      setIsLoading(false)
    }
  }

  return { parseText, parseImage, isLoading, result, error, reset: () => setResult(null) }
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      resolve(result.split(',')[1])
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
