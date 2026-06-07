'use client'
import { useAuth } from '@/hooks/useAuth'
import { LandingPage } from '@/components/landing/LandingPage'

interface Props {
  children: React.ReactNode
}

export function AuthGuard({ children }: Props) {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FC]">
        <div className="w-8 h-8 rounded-full border-2 border-[#6C63FF] border-t-transparent animate-spin" />
      </div>
    )
  }

  if (!user) return <LandingPage />

  return <>{children}</>
}
