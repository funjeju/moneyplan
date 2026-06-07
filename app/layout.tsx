import type { Metadata, Viewport } from 'next'
import { Providers } from '@/components/Providers'
import { InstallBanner } from '@/components/pwa/InstallBanner'
import './globals.css'

export const metadata: Metadata = {
  title: 'Life Capsule',
  description: '생활 지출·구독·계약·보험을 한 캡슐에 담다',
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
