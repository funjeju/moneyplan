'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function SignupPage() {
  const { signUpWithEmail, signInWithGoogle } = useAuth()
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  async function handleSignup() {
    if (!name || !email || !password) return
    if (password.length < 6) { setError('비밀번호는 6자 이상이어야 합니다.'); return }
    setIsLoading(true)
    setError('')
    try {
      await signUpWithEmail(email, password, name)
      router.replace('/')
    } catch {
      setError('이미 사용 중인 이메일이거나 입력 오류입니다.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F9FC] px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl p-8 shadow-md">
        <div className="text-center mb-8">
          <h1 className="text-xl font-semibold">회원가입</h1>
          <p className="text-sm text-gray-400 mt-1">Life Capsule</p>
        </div>

        <Button variant="outline" className="w-full mb-4 gap-2" onClick={async () => {
          await signInWithGoogle(); router.replace('/')
        }}>
          Google로 시작하기
        </Button>

        <div className="flex items-center gap-3 mb-4">
          <hr className="flex-1 border-gray-200" />
          <span className="text-xs text-gray-400">또는</span>
          <hr className="flex-1 border-gray-200" />
        </div>

        <div className="space-y-3">
          <Input placeholder="이름" value={name} onChange={e => setName(e.target.value)} />
          <Input type="email" placeholder="이메일" value={email} onChange={e => setEmail(e.target.value)} />
          <Input type="password" placeholder="비밀번호 (6자 이상)" value={password} onChange={e => setPassword(e.target.value)} />
          {error && <p className="text-xs text-red-500">{error}</p>}
          <Button className="w-full bg-[#6C63FF] hover:bg-[#5A52E8]" onClick={handleSignup} disabled={isLoading}>
            {isLoading ? '가입 중...' : '시작하기'}
          </Button>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          이미 계정이 있으신가요?{' '}
          <a href="/login" className="text-[#6C63FF] hover:underline">로그인</a>
        </p>
      </div>
    </div>
  )
}
