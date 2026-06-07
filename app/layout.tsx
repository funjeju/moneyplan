import type { Metadata, Viewport } from 'next'
import { Providers } from '@/components/Providers'
import { InstallBanner } from '@/components/pwa/InstallBanner'
import { LandingJsonLd } from '@/components/landing/LandingJsonLd'
import './globals.css'

const APP_URL = 'https://lifecapsule.app'

export const metadata: Metadata = {
  title: {
    default: 'Life Capsule — AI 생활비 관리 앱',
    template: '%s | Life Capsule',
  },
  description:
    '구독·보험·통신비·렌탈·세금·공과금까지 — AI가 자동으로 파악하고 납부·만료일을 미리 알려주는 생활비 관리 플랫폼. 넷플릭스·유튜브 구독 관리, 실손보험 만기 알림, 코웨이 렌탈 의무기간 추적, 자동차세 납부 알림 모두 한 곳에.',
  keywords: [
    '생활비 관리', '구독 관리', '보험료 관리', '통신비 절약', '렌탈 비용 관리',
    '자동 갱신 알림', '약정 만료 알림', '납부일 알림', '월 지출 관리',
    '넷플릭스 구독 관리', '유튜브 프리미엄', 'OTT 구독', '실손보험 만기',
    '자동차보험 갱신', '코웨이 렌탈', '정수기 의무기간', '자동차세 납부',
    '재산세 납부', '아파트 관리비', 'AI 가계부', '생활비 앱', 'PWA 앱',
  ],
  authors: [{ name: 'Life Capsule', url: APP_URL }],
  creator: 'Life Capsule',
  metadataBase: new URL(APP_URL),
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: APP_URL,
    siteName: 'Life Capsule',
    title: 'Life Capsule — AI 생활비 관리 앱',
    description: '구독·보험·통신비·렌탈·세금을 한 곳에서. AI가 자동 파악하고 만료·납부일 미리 알림.',
    images: [{ url: '/icons/icon-512x512.png', width: 512, height: 512, alt: 'Life Capsule' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Life Capsule — AI 생활비 관리 앱',
    description: '구독·보험·통신비·렌탈·세금을 한 곳에서. AI가 자동 파악하고 만료·납부일 미리 알림.',
    images: ['/icons/icon-512x512.png'],
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Life Capsule',
  },
  icons: {
    icon: [
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
}

export const viewport: Viewport = {
  themeColor: '#6C63FF',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css"
        />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Life Capsule" />
        <LandingJsonLd />
      </head>
      <body className="antialiased bg-[#F8F9FC]" style={{ fontFamily: "'Pretendard', 'Inter', -apple-system, sans-serif" }}>
        <Providers>
          <InstallBanner />
          {children}
        </Providers>
      </body>
    </html>
  )
}
