export function LandingJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Life Capsule',
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Any',
    description:
      '구독·보험·통신비·렌탈·세금·공과금을 AI로 자동 파악하고 납부·만료일을 미리 알려주는 생활비 관리 PWA 앱',
    url: 'https://lifecapsule.app',
    inLanguage: 'ko',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'KRW',
    },
    featureList: [
      'AI 자동 파싱 — 문자·영수증으로 항목 자동 등록',
      '구독 관리 — 넷플릭스, 유튜브, 티빙, OTT 자동 갱신 추적',
      '보험료 관리 — 실손·암보험·자동차보험 만기 알림',
      '통신비 절약 — SKT·KT·LG U+ 약정 만료 알림',
      '렌탈 비용 — 코웨이·청호나이스 의무기간 추적',
      '세금 알림 — 자동차세·재산세·종합소득세 납부기한',
      '카드 혜택 최적화 — 1,100개 카드 혜택 분석',
      '푸시 알림 — 납부·만료 N일 전 모바일 알림',
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
