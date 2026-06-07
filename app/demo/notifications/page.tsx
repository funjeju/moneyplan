import type { Metadata } from 'next'
import { DemoNotificationsPage } from '@/components/demo/DemoNotificationsPage'

export const metadata: Metadata = {
  title: '알림 체험 | Life Capsule',
  description: '납부일·만료일 N일 전 자동 푸시 알림. 구독 자동갱신, 보험 만기, 렌탈 의무기간 종료 알림을 놓치지 마세요.',
}

export default function DemoNotificationsRoute() {
  return <DemoNotificationsPage />
}
