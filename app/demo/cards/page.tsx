import type { Metadata } from 'next'
import { DemoCardsPage } from '@/components/demo/DemoCardsPage'

export const metadata: Metadata = {
  title: '카드 혜택 관리 체험 | Life Capsule',
  description: '신한·삼성·KB·현대카드 혜택 달성률 자동 계산. 1,100개 카드 데이터베이스로 내 생활비에 맞는 최적 카드를 추천해드립니다.',
}

export default function DemoCardsRoute() {
  return <DemoCardsPage />
}
