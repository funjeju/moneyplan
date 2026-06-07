import type { Metadata } from 'next'
import { DemoChat } from '@/components/demo/DemoChat'

export const metadata: Metadata = {
  title: 'AI 챗봇 체험 — 생활비 AI 비서 | Life Capsule',
  description:
    'Life Capsule AI 비서 체험. 이번 달 총 지출, 만료 임박 항목, 절약 방법, 카드 혜택 추천 등 생활비 관련 무엇이든 자연어로 물어보세요. Gemini 2.5 Flash 기반 AI.',
}

export default function DemoChatPage() {
  return <DemoChat />
}
