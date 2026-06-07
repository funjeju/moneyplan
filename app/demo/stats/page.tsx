import type { Metadata } from 'next'
import { DemoStatsPage } from '@/components/demo/DemoStatsPage'

export const metadata: Metadata = {
  title: '지출 분석 체험 — 카테고리별 월 생활비 통계 | Life Capsule',
  description:
    '카테고리별 월 지출 분석, 구독·보험·통신비 비율 차트, TOP 5 지출 항목, 자동이체·AI파싱 통계를 확인하는 생활비 분석 체험판.',
}

export default function DemoStatsRoute() {
  return <DemoStatsPage />
}
