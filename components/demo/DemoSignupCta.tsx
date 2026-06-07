'use client'
import { useRouter } from 'next/navigation'
import { ArrowRight } from 'lucide-react'

interface Props {
  title?: string
  desc?: string
}

export function DemoSignupCta({
  title = '지금 바로 내 생활비를 관리하세요',
  desc = '무료로 시작하고 AI가 내 지출을 분석해드립니다',
}: Props) {
  const router = useRouter()
  return (
    <div className="bg-gradient-to-r from-[#6C63FF] to-[#9B93FF] rounded-2xl p-5 text-white text-center">
      <p className="text-sm font-bold mb-1">{title}</p>
      <p className="text-xs opacity-80 mb-4">{desc}</p>
      <div className="flex gap-2 justify-center">
        <button
          onClick={() => router.push('/signup')}
          className="flex items-center gap-1.5 bg-white text-[#6C63FF] rounded-xl px-4 py-2.5 text-xs font-bold hover:bg-white/90 transition-colors"
        >
          무료로 시작하기 <ArrowRight size={12} />
        </button>
        <button
          onClick={() => router.push('/login')}
          className="border border-white/40 text-white rounded-xl px-4 py-2.5 text-xs font-medium hover:bg-white/10 transition-colors"
        >
          로그인
        </button>
      </div>
    </div>
  )
}
