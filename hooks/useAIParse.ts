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
        ? await Promise.all(files.map(async (f) => ({ data: await fileToBase64(f), mimeType: f.type || 'image/jpeg' })))
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
