import type { ResponsibilityItem, CreditCard } from '@/lib/types'
import { Timestamp } from 'firebase/firestore'

function ts(daysFromNow: number) {
  return { toDate: () => new Date(Date.now() + daysFromNow * 86400000) } as any
}

export const DEMO_ITEMS: ResponsibilityItem[] = [
  {
    id: 'd1', userId: 'demo', name: 'KT 인터넷+TV', category: 'telecom',
    provider: 'KT', amount: 44000, cycle: 'monthly', dayOfMonth: 15,
    paymentMethod: '신한카드', owner: '본인', isAutoPayment: true,
    autoRenews: true, contractEndDate: ts(180), status: 'active',
    isArchived: false, aiParsed: false,
    createdAt: ts(-30), updatedAt: ts(-1),
  },
  {
    id: 'd2', userId: 'demo', name: 'SKT 휴대폰', category: 'telecom',
    provider: 'SKT', amount: 62000, cycle: 'monthly', dayOfMonth: 20,
    paymentMethod: 'KB카드', owner: '배우자', isAutoPayment: true,
    autoRenews: false, contractEndDate: ts(45), status: 'active',
    isArchived: false, aiParsed: true, aiConfidence: 0.95,
    createdAt: ts(-60), updatedAt: ts(-2),
    memo: '약정 만료 후 해지 예정',
  },
  {
    id: 'd3', userId: 'demo', name: '넷플릭스', category: 'subscription',
    provider: '넷플릭스', amount: 17000, cycle: 'monthly', dayOfMonth: 5,
    paymentMethod: '삼성카드', isAutoPayment: true,
    autoRenews: true, status: 'active',
    isArchived: false, aiParsed: true, aiConfidence: 0.98,
    createdAt: ts(-90), updatedAt: ts(-3),
  },
  {
    id: 'd4', userId: 'demo', name: '유튜브 프리미엄', category: 'subscription',
    provider: 'Google', amount: 14900, cycle: 'monthly', dayOfMonth: 12,
    paymentMethod: '신한카드', isAutoPayment: true,
    autoRenews: true, status: 'active',
    isArchived: false, aiParsed: false,
    createdAt: ts(-45), updatedAt: ts(-1),
  },
  {
    id: 'd5', userId: 'demo', name: '실손보험', category: 'insurance',
    provider: '삼성생명', amount: 89000, cycle: 'monthly', dayOfMonth: 25,
    paymentMethod: '자동이체', owner: '본인', isAutoPayment: true,
    autoRenews: true, status: 'active',
    isArchived: false, aiParsed: false,
    createdAt: ts(-365), updatedAt: ts(-7),
  },
  {
    id: 'd6', userId: 'demo', name: '자동차보험', category: 'insurance',
    provider: '현대해상', amount: 680000, cycle: 'yearly', dayOfMonth: 3,
    paymentMethod: 'KB카드', owner: '본인', isAutoPayment: false,
    autoRenews: false, contractEndDate: ts(22), status: 'active',
    isArchived: false, aiParsed: false,
    createdAt: ts(-343), updatedAt: ts(-10),
    memo: '만기 전 타사 비교 필요',
  },
  {
    id: 'd7', userId: 'demo', name: '정수기 렌탈', category: 'rental',
    provider: '코웨이', amount: 32000, cycle: 'monthly', dayOfMonth: 10,
    paymentMethod: '자동이체', isAutoPayment: true,
    autoRenews: true, contractEndDate: ts(8), status: 'active',
    isArchived: false, aiParsed: true, aiConfidence: 0.9,
    createdAt: ts(-700), updatedAt: ts(-5),
    memo: '의무사용기간 종료 임박',
  },
  {
    id: 'd8', userId: 'demo', name: '전기세', category: 'utility',
    provider: '한국전력', amount: 65000, cycle: 'bimonthly', dayOfMonth: 15,
    paymentMethod: '자동이체', isAutoPayment: true,
    autoRenews: true, status: 'active',
    isArchived: false, aiParsed: false,
    createdAt: ts(-200), updatedAt: ts(-14),
  },
  {
    id: 'd9', userId: 'demo', name: '도시가스', category: 'utility',
    provider: '서울도시가스', amount: 38000, cycle: 'monthly', dayOfMonth: 20,
    paymentMethod: '자동이체', isAutoPayment: true,
    autoRenews: true, status: 'active',
    isArchived: false, aiParsed: false,
    createdAt: ts(-150), updatedAt: ts(-7),
  },
  {
    id: 'd10', userId: 'demo', name: '월세', category: 'housing',
    provider: '임대인', amount: 850000, cycle: 'monthly', dayOfMonth: 1,
    paymentMethod: '계좌이체', isAutoPayment: false,
    autoRenews: true, contractEndDate: ts(120), status: 'active',
    isArchived: false, aiParsed: false,
    createdAt: ts(-240), updatedAt: ts(-30),
  },
  {
    id: 'd11', userId: 'demo', name: '자동차세', category: 'tax',
    provider: '서울시', amount: 260000, cycle: 'yearly', dayOfMonth: 16,
    isAutoPayment: false, autoRenews: true,
    contractEndDate: ts(-5), status: 'expired',
    isArchived: false, aiParsed: false,
    createdAt: ts(-30), updatedAt: ts(-5),
    memo: '6월 납부 기한 지남',
  },
  {
    id: 'd12', userId: 'demo', name: 'Adobe Creative Cloud', category: 'subscription',
    provider: 'Adobe', amount: 26400, cycle: 'monthly', dayOfMonth: 28,
    paymentMethod: '신한카드', isAutoPayment: true,
    autoRenews: true, status: 'active',
    isArchived: false, aiParsed: true, aiConfidence: 0.92,
    createdAt: ts(-180), updatedAt: ts(-20),
  },
]

export const DEMO_CARDS: CreditCard[] = [
  {
    id: 'c1', userId: 'demo', name: 'Mr.Life', issuer: '신한카드',
    cardType: 'credit', last4Digits: '1234', color: '#0046FF',
    isPrimary: true, isActive: true,
    benefits: [
      {
        id: 'b1', description: '통신비 10% 할인', conditionType: 'min_spend',
        conditionAmount: 300000, discountRate: 10, isActive: true,
      },
      {
        id: 'b2', description: '넷플릭스·OTT 월 5,000원 할인', conditionType: 'min_spend',
        conditionAmount: 300000, discountAmount: 5000, isActive: true,
      },
    ],
    createdAt: ts(-300),
  },
  {
    id: 'c2', userId: 'demo', name: 'iD SELECT', issuer: '삼성카드',
    cardType: 'credit', last4Digits: '5678', color: '#1428A0',
    isPrimary: false, isActive: true,
    benefits: [
      {
        id: 'b3', description: '생활편의 5% 할인', conditionType: 'min_spend',
        conditionAmount: 400000, discountRate: 5, isActive: true,
      },
    ],
    createdAt: ts(-180),
  },
]

export const DEMO_CHAT = [
  { role: 'assistant', content: '안녕하세요! 생활 지출 관리를 도와드릴게요 😊' },
  { role: 'user', content: '이번달 총 지출이 얼마야?' },
  {
    role: 'assistant',
    content: '이번달 예상 지출은 약 **1,398,300원**이에요.\n\n주요 항목:\n• 주거비(월세) 850,000원\n• 보험료 89,000원\n• 통신비 106,000원\n• 구독서비스 58,300원\n\n전월 대비 구독료가 14,900원 증가했어요 (유튜브 프리미엄 추가).',
  },
  { role: 'user', content: '곧 만료되는 항목 있어?' },
  {
    role: 'assistant',
    content: '⚠️ 주의가 필요한 항목 3개가 있어요!\n\n🔴 **자동차세** — 5일 전 납부기한 지남\n🟠 **코웨이 정수기** — 8일 후 의무기간 종료\n🟡 **SKT 휴대폰** — 45일 후 약정 만료\n\n자동차세는 지금 바로 납부하셔야 가산금이 붙어요!',
  },
]
