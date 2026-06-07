import type { Metadata } from 'next'
import { DemoStats } from '@/components/demo/DemoStats'

export const metadata: Metadata = {
  title: '지출 분석 체험 — 카테고리별 월 생활비 통계 | Life Capsule',
  description:
    '카테고리별 월 지출 분석, 구독·보험·통신비 비율 차트, TOP 5 지출 항목, 월별 지출 추이를 확인하는 AI 생활비 분석 체험판. 불필요한 구독을 찾아 매달 절약하세요.',
}

export default function DemoStatsPage() {
  return <DemoStats />
}
