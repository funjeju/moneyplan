import type { Metadata } from 'next'
import { DemoItemsPage } from '@/components/demo/DemoItemsPage'

export const metadata: Metadata = {
  title: '항목 목록 체험 — 구독·보험·통신비·렌탈 관리 | Life Capsule',
  description:
    '내 모든 생활비 항목을 한눈에. 넷플릭스·유튜브·티빙 구독, 실손보험·자동차보험, SKT·KT 통신비, 코웨이 정수기 렌탈, 전기·가스 공과금까지 카테고리별로 정리된 항목 목록을 체험해보세요.',
}

export default function DemoItemsRoute() {
  return <DemoItemsPage />
}
