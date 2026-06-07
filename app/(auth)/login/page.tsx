'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function LoginPage() {
  const { signInWithGoogle, signInWithEmail } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  async function handleGoogle() {
    setIsLoading(true)
    setError('')
    try {
      await signInWithGoogle()
      router.replace('/')
    } catch {
      setError('Google 로그인에 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleEmail() {
    if (!email || !password) return
    setIsLoading(true)
    setError('')
    try {
      await signInWithEmail(email, password)
      router.replace('/')
    } catch {
      setError('이메일 또는 비밀번호를 확인해주세요.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F9FC] px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl p-8 shadow-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-[#6C63FF] rounded-2xl flex items-center justify-center mx-auto mb-3">
            <span className="text-white text-xl">✦</span>
          </div>
          <h1 className="text-xl font-semibold">Life Responsibility OS</h1>
          <p className="text-sm text-gray-400 mt-1">생활 책임 관리 플랫폼</p>
        </div>

        <Button
          variant="outline"
          className="w-full mb-4 gap-2"
          onClick={handleGoogle}
          disabled={isLoading}
        >
          <GoogleIcon />
          Google로 계속하기
        </Button>

        <div className="flex items-center gap-3 mb-4">
          <hr className="flex-1 border-gray-200" />
          <span className="text-xs text-gray-400">또는</span>
          <hr className="flex-1 border-gray-200" />
        </div>

        <div className="space-y-3">
          <Input
            type="email"
            placeholder="이메일"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <Input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleEmail()}
          />
          {error && <p className="text-xs text-red-500">{error}</p>}
          <Button className="w-full bg-[#6C63FF] hover:bg-[#5A52E8]" onClick={handleEmail} disabled={isLoading}>
            {isLoading ? '로그인 중...' : '로그인'}
          </Button>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          계정이 없으신가요?{' '}
          <a href="/signup" className="text-[#6C63FF] hover:underline">회원가입</a>
        </p>
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M15.68 8.18c0-.57-.05-1.11-.14-1.64H8v3.1h4.3a3.67 3.67 0 01-1.6 2.41v2h2.58c1.51-1.39 2.4-3.44 2.4-5.87z" fill="#4285F4"/>
      <path d="M8 16c2.16 0 3.97-.72 5.3-1.94l-2.59-2a4.8 4.8 0 01-2.71.75 4.79 4.79 0 01-4.5-3.32H.83v2.07A8 8 0 008 16z" fill="#34A853"/>
      <path d="M3.5 9.49A4.83 4.83 0 013.25 8c0-.52.09-1.02.25-1.49V4.44H.83A8.01 8.01 0 000 8c0 1.29.31 2.51.83 3.56l2.67-2.07z" fill="#FBBC05"/>
      <path d="M8 3.19c1.22 0 2.31.42 3.17 1.24l2.37-2.37A8 8 0 00.83 4.44L3.5 6.51A4.79 4.79 0 018 3.19z" fill="#EA4335"/>
    </svg>
  )
}
