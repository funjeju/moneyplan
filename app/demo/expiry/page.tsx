import type { Metadata } from 'next'
import { DemoExpiryPage } from '@/components/demo/DemoExpiryPage'

export const metadata: Metadata = {
  title: '해지·만료 관리 체험 | Life Capsule',
  description: '약정 만료·자동갱신 임박 항목 관리. 통신 약정, 렌탈 의무기간, 보험 갱신일, 구독 자동결제를 놓치지 마세요.',
}

export default function DemoExpiryRoute() {
  return <DemoExpiryPage />
}
