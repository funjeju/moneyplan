'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Home, List, BarChart3, MessageCircle, ArrowRight } from 'lucide-react'

const NAV = [
  { href: '/demo', icon: Home, label: '대시보드' },
  { href: '/demo/items', icon: List, label: '항목' },
  { href: '/demo/stats', icon: BarChart3, label: '분석' },
  { href: '/demo/chat', icon: MessageCircle, label: 'AI 챗봇' },
]

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  return (
    <div className="min-h-screen bg-[#F8F9FC] flex flex-col">
      {/* 체험 모드 배너 */}
      <div className="sticky top-0 z-50 bg-[#6C63FF] text-white text-xs flex items-center justify-between px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="bg-white/20 rounded-full px-2 py-0.5 font-semibold text-[10px]">체험 모드</span>
          <span className="opacity-90">샘플 데이터입니다 — 실제 데이터와 다릅니다</span>
        </div>
        <button
          onClick={() => router.push('/signup')}
          className="flex items-center gap-1 bg-white text-[#6C63FF] rounded-full px-3 py-1 text-[10px] font-bold hover:bg-white/90 transition-colors"
        >
          무료 시작 <ArrowRight size={10} />
        </button>
      </div>

      {/* 콘텐츠 */}
      <main className="flex-1 pb-20">
        {children}
      </main>

      {/* 하단 네비게이션 */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100 flex">
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== '/demo' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors ${active ? 'text-[#6C63FF]' : 'text-gray-400'}`}
            >
              <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
