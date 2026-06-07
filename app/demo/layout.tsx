'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { DemoSidebar } from '@/components/demo/DemoSidebar'
import { DemoBottomNav } from '@/components/demo/DemoBottomNav'
import { ArrowRight, Sparkles, Lock } from 'lucide-react'

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  return (
    <div className="flex min-h-screen bg-[#F8F9FC]">
      <DemoSidebar className="hidden lg:flex" />

      <div className="flex-1 lg:ml-64 flex flex-col">
        {/* 체험 모드 배너 */}
        <div className="sticky top-0 z-50 bg-[#6C63FF] text-white text-xs flex items-center justify-between px-4 py-2.5 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="bg-white/20 rounded-full px-2 py-0.5 font-semibold text-[10px]">체험 모드</span>
            <span className="opacity-90 hidden sm:inline">샘플 데이터입니다 — 실제 데이터와 다릅니다</span>
            <span className="opacity-90 sm:hidden">샘플 데이터</span>
          </div>
          <button
            onClick={() => router.push('/signup')}
            className="flex items-center gap-1 bg-white text-[#6C63FF] rounded-full px-3 py-1 text-[10px] font-bold hover:bg-white/90 transition-colors flex-shrink-0"
          >
            무료 시작 <ArrowRight size={10} />
          </button>
        </div>

        {/* 메인 콘텐츠 */}
        <main className="flex-1 pb-20 lg:pb-6">
          {children}
        </main>

        {/* AI 입력창 자리 (잠금 상태) */}
        <div className="fixed bottom-16 lg:bottom-6 left-0 right-0 lg:left-64 z-30 px-4 pointer-events-none">
          <div className="max-w-2xl mx-auto">
            <div
              onClick={() => router.push('/signup')}
              className="bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-lg flex items-center gap-3 cursor-pointer pointer-events-auto hover:border-[#6C63FF]/40 transition-colors"
            >
              <div className="w-7 h-7 bg-[#6C63FF]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Sparkles size={14} className="text-[#6C63FF]" />
              </div>
              <span className="text-sm text-gray-400 flex-1">AI에게 생활비 물어보기... (로그인 필요)</span>
              <Lock size={13} className="text-gray-300 flex-shrink-0" />
            </div>
          </div>
        </div>
      </div>

      <DemoBottomNav className="lg:hidden" />
    </div>
  )
}
