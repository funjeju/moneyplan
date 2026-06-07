import type { Metadata } from 'next'
import { DemoDashboard } from '@/components/demo/DemoDashboard'

export const metadata: Metadata = {
  title: '대시보드 체험 — AI 생활비 관리 앱 | Life Capsule',
  description:
    'Life Capsule 대시보드 무료 체험. 이번 달 예상 생활비, 구독·보험·통신비·렌탈·세금 카테고리별 지출 요약, 납부·만료 임박 항목 알림을 실시간으로 확인하세요.',
}

export default function DemoDashboardPage() {
  return <DemoDashboard />
}
