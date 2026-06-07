import type { ResponsibilityItem, CreditCard } from '@/lib/types'

function ts(daysFromNow: number) {
  return { toDate: () => new Date(Date.now() + daysFromNow * 86400000) } as any
}

export const DEMO_ITEMS: ResponsibilityItem[] = [
  // ── 통신 ──
  {
    id: 'd1', userId: 'demo', name: 'KT 인터넷+TV 결합', category: 'telecom',
    provider: 'KT', amount: 44000, cycle: 'monthly', dayOfMonth: 15,
    paymentMethod: '신한카드', owner: '본인', isAutoPayment: true,
    autoRenews: true, contractEndDate: ts(180), status: 'active',
    isArchived: false, aiParsed: false,
    memo: '인터넷+IPTV 결합할인 적용 중',
    createdAt: ts(-30), updatedAt: ts(-1),
  },
  {
    id: 'd2', userId: 'demo', name: 'SKT 휴대폰 요금제', category: 'telecom',
    provider: 'SKT', amount: 62000, cycle: 'monthly', dayOfMonth: 20,
    paymentMethod: 'KB카드', owner: '배우자', isAutoPayment: true,
    autoRenews: false, contractEndDate: ts(45), status: 'active',
    isArchived: false, aiParsed: true, aiConfidence: 0.95,
    memo: '5G 스탠다드 요금제, 약정 만료 후 번호이동 검토',
    createdAt: ts(-300), updatedAt: ts(-2),
  },
  {
    id: 'd3', userId: 'demo', name: 'LG U+ 자녀 휴대폰', category: 'telecom',
    provider: 'LG U+', amount: 33000, cycle: 'monthly', dayOfMonth: 20,
    paymentMethod: '자동이체', owner: '자녀', isAutoPayment: true,
    autoRenews: true, contractEndDate: ts(300), status: 'active',
    isArchived: false, aiParsed: false,
    memo: '청소년 요금제 적용',
    createdAt: ts(-200), updatedAt: ts(-5),
  },

  // ── 구독 ──
  {
    id: 'd4', userId: 'demo', name: '넷플릭스 스탠다드', category: 'subscription',
    provider: '넷플릭스', amount: 17000, cycle: 'monthly', dayOfMonth: 5,
    paymentMethod: '삼성카드', isAutoPayment: true,
    autoRenews: true, status: 'active',
    isArchived: false, aiParsed: true, aiConfidence: 0.98,
    memo: '가족 공유 계정 — 4인 사용 중',
    createdAt: ts(-90), updatedAt: ts(-3),
  },
  {
    id: 'd5', userId: 'demo', name: '유튜브 프리미엄', category: 'subscription',
    provider: 'Google', amount: 14900, cycle: 'monthly', dayOfMonth: 12,
    paymentMethod: '신한카드', isAutoPayment: true,
    autoRenews: true, status: 'active',
    isArchived: false, aiParsed: false,
    memo: '광고 없이 유튜브, 유튜브 뮤직 포함',
    createdAt: ts(-45), updatedAt: ts(-1),
  },
  {
    id: 'd6', userId: 'demo', name: 'Adobe Creative Cloud', category: 'subscription',
    provider: 'Adobe', amount: 26400, cycle: 'monthly', dayOfMonth: 28,
    paymentMethod: '신한카드', isAutoPayment: true,
    autoRenews: true, status: 'active',
    isArchived: false, aiParsed: true, aiConfidence: 0.92,
    memo: 'Photoshop, Illustrator, Premiere Pro 포함 전체 앱',
    createdAt: ts(-180), updatedAt: ts(-20),
  },
  {
    id: 'd7', userId: 'demo', name: '티빙 스탠다드', category: 'subscription',
    provider: '티빙', amount: 10900, cycle: 'monthly', dayOfMonth: 18,
    paymentMethod: 'KB카드', isAutoPayment: true,
    autoRenews: true, status: 'active',
    isArchived: false, aiParsed: true, aiConfidence: 0.96,
    createdAt: ts(-60), updatedAt: ts(-10),
  },
  {
    id: 'd8', userId: 'demo', name: 'ChatGPT Plus', category: 'subscription',
    provider: 'OpenAI', amount: 27000, cycle: 'monthly', dayOfMonth: 3,
    paymentMethod: '신한카드', isAutoPayment: true,
    autoRenews: true, status: 'active',
    isArchived: false, aiParsed: false,
    memo: 'GPT-4o 무제한 사용, 달러 결제 환율 변동 있음',
    createdAt: ts(-120), updatedAt: ts(-4),
  },
  {
    id: 'd9', userId: 'demo', name: 'Notion Pro', category: 'subscription',
    provider: 'Notion', amount: 16000, cycle: 'monthly', dayOfMonth: 7,
    paymentMethod: '신한카드', isAutoPayment: true,
    autoRenews: true, status: 'active',
    isArchived: false, aiParsed: false,
    createdAt: ts(-200), updatedAt: ts(-15),
  },

  // ── 보험 ──
  {
    id: 'd10', userId: 'demo', name: '실손의료보험', category: 'insurance',
    provider: '삼성생명', amount: 89000, cycle: 'monthly', dayOfMonth: 25,
    paymentMethod: '자동이체', owner: '본인', isAutoPayment: true,
    autoRenews: true, status: 'active',
    isArchived: false, aiParsed: false,
    memo: '4세대 실손 — 연간 최대 5,000만원 보장',
    createdAt: ts(-1200), updatedAt: ts(-30),
  },
  {
    id: 'd11', userId: 'demo', name: '자동차보험', category: 'insurance',
    provider: '현대해상', amount: 680000, cycle: 'yearly', dayOfMonth: 3,
    paymentMethod: 'KB카드', owner: '본인', isAutoPayment: false,
    autoRenews: false, contractEndDate: ts(22), status: 'active',
    isArchived: false, aiParsed: false,
    memo: '만기 전 타사 비교 필수 — 다이렉트 보험 검토 중',
    createdAt: ts(-343), updatedAt: ts(-10),
  },
  {
    id: 'd12', userId: 'demo', name: '암보험', category: 'insurance',
    provider: '한화생명', amount: 45000, cycle: 'monthly', dayOfMonth: 15,
    paymentMethod: '자동이체', owner: '본인', isAutoPayment: true,
    autoRenews: true, status: 'active',
    isArchived: false, aiParsed: false,
    memo: '진단비 3,000만원, 20년 납 갱신형',
    createdAt: ts(-730), updatedAt: ts(-60),
  },
  {
    id: 'd13', userId: 'demo', name: '치아보험', category: 'insurance',
    provider: '메리츠화재', amount: 28000, cycle: 'monthly', dayOfMonth: 25,
    paymentMethod: '자동이체', owner: '배우자', isAutoPayment: true,
    autoRenews: true, status: 'active',
    isArchived: false, aiParsed: true, aiConfidence: 0.88,
    memo: '임플란트·크라운 보장, 연간 최대 200만원',
    createdAt: ts(-365), updatedAt: ts(-20),
  },

  // ── 공과금 ──
  {
    id: 'd14', userId: 'demo', name: '전기요금', category: 'utility',
    provider: '한국전력(KEPCO)', amount: 65000, cycle: 'bimonthly', dayOfMonth: 15,
    paymentMethod: '자동이체', isAutoPayment: true,
    autoRenews: true, status: 'active',
    isArchived: false, aiParsed: false,
    memo: '2개월마다 부과 — 여름철 냉방비 급등 주의',
    createdAt: ts(-200), updatedAt: ts(-14),
  },
  {
    id: 'd15', userId: 'demo', name: '도시가스', category: 'utility',
    provider: '서울도시가스', amount: 38000, cycle: 'monthly', dayOfMonth: 20,
    paymentMethod: '자동이체', isAutoPayment: true,
    autoRenews: true, status: 'active',
    isArchived: false, aiParsed: false,
    memo: '겨울철 난방비 최대 12만원까지 증가',
    createdAt: ts(-150), updatedAt: ts(-7),
  },
  {
    id: 'd16', userId: 'demo', name: '아파트 관리비', category: 'utility',
    provider: '아파트 관리사무소', amount: 180000, cycle: 'monthly', dayOfMonth: 25,
    paymentMethod: '자동이체', isAutoPayment: true,
    autoRenews: true, status: 'active',
    isArchived: false, aiParsed: false,
    memo: '장기수선충당금 포함 — 주차비 별도',
    createdAt: ts(-500), updatedAt: ts(-25),
  },

  // ── 렌탈 ──
  {
    id: 'd17', userId: 'demo', name: '코웨이 정수기 렌탈', category: 'rental',
    provider: '코웨이', amount: 32000, cycle: 'monthly', dayOfMonth: 10,
    paymentMethod: '자동이체', isAutoPayment: true,
    autoRenews: true, contractEndDate: ts(8), status: 'active',
    isArchived: false, aiParsed: true, aiConfidence: 0.9,
    memo: '의무사용기간 5년 종료 임박 — 해지 또는 재약정 결정 필요',
    createdAt: ts(-1800), updatedAt: ts(-5),
  },
  {
    id: 'd18', userId: 'demo', name: '청호나이스 공기청정기', category: 'rental',
    provider: '청호나이스', amount: 28000, cycle: 'monthly', dayOfMonth: 15,
    paymentMethod: '자동이체', isAutoPayment: true,
    autoRenews: true, contractEndDate: ts(200), status: 'active',
    isArchived: false, aiParsed: false,
    memo: '침실용 — PM2.5 초미세먼지 필터 분기 교체',
    createdAt: ts(-600), updatedAt: ts(-30),
  },
  {
    id: 'd19', userId: 'demo', name: '현대캐피탈 자동차 리스', category: 'rental',
    provider: '현대캐피탈', amount: 420000, cycle: 'monthly', dayOfMonth: 5,
    paymentMethod: '자동이체', owner: '본인', isAutoPayment: true,
    autoRenews: false, contractEndDate: ts(365), status: 'active',
    isArchived: false, aiParsed: false,
    memo: '아반떼 CN7 운용리스 — 잔존가치 45%',
    createdAt: ts(-730), updatedAt: ts(-30),
  },

  // ── 주거 ──
  {
    id: 'd20', userId: 'demo', name: '월세', category: 'housing',
    provider: '임대인', amount: 850000, cycle: 'monthly', dayOfMonth: 1,
    paymentMethod: '계좌이체', isAutoPayment: false,
    autoRenews: true, contractEndDate: ts(120), status: 'active',
    isArchived: false, aiParsed: false,
    memo: '서울 마포구 — 계약 만료 전 재계약 협의 예정',
    createdAt: ts(-240), updatedAt: ts(-30),
  },
  {
    id: 'd21', userId: 'demo', name: '전세 대출 이자', category: 'housing',
    provider: '국민은행', amount: 320000, cycle: 'monthly', dayOfMonth: 10,
    paymentMethod: '자동이체', isAutoPayment: true,
    autoRenews: true, status: 'active',
    isArchived: false, aiParsed: false,
    memo: '전세자금대출 1.6억 — 연 2.4% 고정금리',
    createdAt: ts(-730), updatedAt: ts(-30),
  },

  // ── 세금 ──
  {
    id: 'd22', userId: 'demo', name: '자동차세', category: 'tax',
    provider: '서울시', amount: 260000, cycle: 'yearly', dayOfMonth: 16,
    isAutoPayment: false, autoRenews: true,
    contractEndDate: ts(-5), status: 'expired',
    isArchived: false, aiParsed: false,
    memo: '6월 납부기한 경과 — 가산세 3% 부과 예정',
    createdAt: ts(-30), updatedAt: ts(-5),
  },
  {
    id: 'd23', userId: 'demo', name: '재산세 (1기분)', category: 'tax',
    provider: '서울시', amount: 180000, cycle: 'yearly', dayOfMonth: 31,
    isAutoPayment: false, autoRenews: true,
    status: 'active', isArchived: false, aiParsed: false,
    memo: '7월 납부 예정 — 위택스 간편 납부 가능',
    createdAt: ts(-10), updatedAt: ts(-1),
  },

  // ── 차량 ──
  {
    id: 'd24', userId: 'demo', name: '자동차보험 (차량)', category: 'vehicle',
    provider: '삼성화재', amount: 520000, cycle: 'yearly', dayOfMonth: 20,
    paymentMethod: 'KB카드', owner: '배우자', isAutoPayment: false,
    autoRenews: false, contractEndDate: ts(75), status: 'active',
    isArchived: false, aiParsed: false,
    memo: '배우자 차량 다이렉트 보험 — 무사고 5년 할인 적용',
    createdAt: ts(-290), updatedAt: ts(-14),
  },
  {
    id: 'd25', userId: 'demo', name: '하이패스 충전', category: 'vehicle',
    provider: '한국도로공사', amount: 30000, cycle: 'monthly', dayOfMonth: 1,
    paymentMethod: '자동이체', isAutoPayment: true,
    autoRenews: true, status: 'active',
    isArchived: false, aiParsed: false,
    memo: '월 30,000원 자동 충전 설정',
    createdAt: ts(-400), updatedAt: ts(-30),
  },

  // ── 금융 ──
  {
    id: 'd26', userId: 'demo', name: '신용카드 연회비 (신한 Mr.Life)', category: 'finance',
    provider: '신한카드', amount: 15000, cycle: 'yearly', dayOfMonth: 7,
    paymentMethod: '자동청구', isAutoPayment: true,
    autoRenews: true, status: 'active',
    isArchived: false, aiParsed: false,
    memo: '통신비·OTT 할인 혜택으로 연회비 이상 절약',
    createdAt: ts(-400), updatedAt: ts(-30),
  },
  {
    id: 'd27', userId: 'demo', name: '마이너스통장 이자', category: 'finance',
    provider: '우리은행', amount: 22000, cycle: 'monthly', dayOfMonth: 15,
    paymentMethod: '자동이체', isAutoPayment: true,
    autoRenews: true, status: 'active',
    isArchived: false, aiParsed: false,
    memo: '한도 500만원 — 연 5.2% 변동금리',
    createdAt: ts(-90), updatedAt: ts(-10),
  },

  // ── 사업 ──
  {
    id: 'd28', userId: 'demo', name: 'AWS 서버 비용', category: 'business',
    provider: 'Amazon Web Services', amount: 85000, cycle: 'monthly', dayOfMonth: 1,
    paymentMethod: '법인카드', isAutoPayment: true,
    autoRenews: true, status: 'active',
    isArchived: false, aiParsed: false,
    memo: 'EC2 t3.small + RDS — 트래픽 증가 시 자동 과금 주의',
    createdAt: ts(-365), updatedAt: ts(-1),
  },
  {
    id: 'd29', userId: 'demo', name: '도메인 연장비', category: 'business',
    provider: 'Namecheap', amount: 18000, cycle: 'yearly', dayOfMonth: 22,
    paymentMethod: '신한카드', isAutoPayment: false,
    autoRenews: false, contractEndDate: ts(55), status: 'active',
    isArchived: false, aiParsed: false,
    memo: 'lifecapsule.kr — 만료 전 반드시 갱신',
    createdAt: ts(-310), updatedAt: ts(-3),
  },

  // ── 기타 ──
  {
    id: 'd30', userId: 'demo', name: '헬스장 월 회원권', category: 'other',
    provider: 'GX 피트니스', amount: 55000, cycle: 'monthly', dayOfMonth: 1,
    paymentMethod: '현금', isAutoPayment: false,
    autoRenews: true, status: 'active',
    isArchived: false, aiParsed: false,
    memo: '월 정기권 — 연간 결제 시 10% 할인 가능',
    createdAt: ts(-60), updatedAt: ts(-30),
  },
]

export const DEMO_CARDS: CreditCard[] = [
  {
    id: 'c1', userId: 'demo', name: 'Mr.Life', issuer: '신한카드',
    cardType: 'credit', last4Digits: '1234', color: '#0046FF',
    isPrimary: true, isActive: true,
    benefits: [
      {
        id: 'b1', description: '통신비 10% 청구할인 (월 최대 1만원)',
        conditionType: 'min_spend', conditionAmount: 300000,
        discountRate: 10, isActive: true,
      },
      {
        id: 'b2', description: 'OTT·스트리밍 월 5,000원 할인',
        conditionType: 'min_spend', conditionAmount: 300000,
        discountAmount: 5000, isActive: true,
      },
      {
        id: 'b3', description: '마트·편의점 5% 청구할인',
        conditionType: 'min_spend', conditionAmount: 300000,
        discountRate: 5, isActive: true,
      },
    ],
    createdAt: ts(-300),
  },
  {
    id: 'c2', userId: 'demo', name: 'iD SELECT ALL', issuer: '삼성카드',
    cardType: 'credit', last4Digits: '5678', color: '#1428A0',
    isPrimary: false, isActive: true,
    benefits: [
      {
        id: 'b4', description: '선택 영역 5% 할인 (생활/디지털/교통 택1)',
        conditionType: 'min_spend', conditionAmount: 400000,
        discountRate: 5, isActive: true,
      },
      {
        id: 'b5', description: '디지털콘텐츠·멤버십 50% 할인 (월 1만원 한도)',
        conditionType: 'min_spend', conditionAmount: 400000,
        discountRate: 50, discountCap: 10000, isActive: true,
      },
    ],
    createdAt: ts(-180),
  },
  {
    id: 'c3', userId: 'demo', name: 'My WE:SH', issuer: '우리카드',
    cardType: 'credit', last4Digits: '9012', color: '#005BAC',
    isPrimary: false, isActive: true,
    benefits: [
      {
        id: 'b6', description: '온라인 쇼핑 10% 청구할인',
        conditionType: 'min_spend', conditionAmount: 300000,
        discountRate: 10, isActive: true,
      },
    ],
    createdAt: ts(-90),
  },
]

export const DEMO_CHAT = [
  { role: 'assistant', content: '안녕하세요! Life Capsule AI 비서예요 😊\n생활비 관련 무엇이든 물어보세요.' },
  { role: 'user', content: '이번달 총 지출이 얼마야?' },
  {
    role: 'assistant',
    content: '이번달 예상 지출은 약 **2,156,200원**이에요.\n\n📊 카테고리별 현황:\n• 주거비(월세+대출이자) 1,170,000원\n• 보험료 162,000원\n• 통신비 139,000원\n• 구독서비스 112,200원\n• 렌탈 480,000원\n• 공과금 283,000원\n\n구독 서비스만 월 11만원이에요. 정리 한번 해볼까요?',
  },
  { role: 'user', content: '구독 중에 안 쓰는 거 있을 것 같아' },
  {
    role: 'assistant',
    content: '등록된 구독 9개를 분석해봤어요 🔍\n\n⚠️ **확인 필요:**\n• **티빙** (10,900원) — 넷플릭스와 겹치는 콘텐츠 많음\n• **Notion Pro** (16,000원) — 무료 플랜으로도 충분할 수 있어요\n\n✅ **계속 유지 추천:**\n• ChatGPT Plus — 업무 활용도 높음\n• Adobe CC — 크리에이티브 작업 필수\n\n티빙 해지 시 **월 10,900원, 연 130,800원** 절약돼요!',
  },
  { role: 'user', content: '곧 만료되는 항목 알려줘' },
  {
    role: 'assistant',
    content: '⚠️ 주의가 필요한 항목이에요!\n\n🔴 **자동차세** — 5일 전 납부기한 지남 → 가산세 부과 예정\n🟠 **코웨이 정수기** — 8일 후 의무기간 종료 → 해지/재약정 결정 필요\n🟡 **자동차보험 (현대해상)** — 22일 후 만기 → 타사 비교 추천\n🟡 **도메인 연장** — 55일 후 만료 → 갱신 미리 해두세요\n\n자동차세는 지금 바로 위택스에서 납부하세요!',
  },
]
