# Life Responsibility OS — auth.md
> Firebase 인증 구현 가이드 (AuthContext + useAuth + AuthGuard)

---

## 1. 개요

이 파일이 다루는 것:
- Firebase Auth 초기화 및 Google / Email 로그인
- AuthContext — 전역 인증 상태 공급자
- useAuth 훅 — 컴포넌트에서 인증 상태 접근
- AuthGuard — 미인증 사용자 리디렉션
- Firestore 사용자 문서 자동 생성 (최초 로그인 시)

이 파일이 다루지 않는 것:
- Firebase 프로젝트 설정 (→ firebase.md 참조)
- 소셜 로그인 추가 확장 (카카오, 네이버 등)

---

## 2. AuthContext (`contexts/AuthContext.tsx`)

```tsx
'use client'
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
} from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db, googleProvider } from '@/lib/firebase'

// ─── 타입 ────────────────────────────────────────────────

interface AuthContextValue {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  signInWithGoogle: () => Promise<void>
  signInWithEmail: (email: string, password: string) => Promise<void>
  signUpWithEmail: (email: string, password: string, displayName: string) => Promise<void>
  logout: () => Promise<void>
}

// ─── Context ─────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null)

// ─── Provider ────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Firebase Auth 상태 구독
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)
      setIsLoading(false)
    })
    return unsubscribe
  }, [])

  // Firestore 사용자 문서 생성 (최초 로그인 시에만)
  async function ensureUserDoc(firebaseUser: User) {
    const ref = doc(db, 'users', firebaseUser.uid)
    const snap = await getDoc(ref)
    if (!snap.exists()) {
      await setDoc(ref, {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName ?? '',
        photoURL: firebaseUser.photoURL ?? null,
        settings: {
          notifyDaysBefore: [7, 30, 90],
          currency: 'KRW',
          timezone: 'Asia/Seoul',
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    }
  }

  // Google 로그인
  async function signInWithGoogle() {
    const result = await signInWithPopup(auth, googleProvider)
    await ensureUserDoc(result.user)
    setUser(result.user)
  }

  // 이메일 로그인
  async function signInWithEmail(email: string, password: string) {
    const result = await signInWithEmailAndPassword(auth, email, password)
    setUser(result.user)
  }

  // 이메일 회원가입
  async function signUpWithEmail(email: string, password: string, displayName: string) {
    const result = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(result.user, { displayName })
    await ensureUserDoc(result.user)
    setUser(result.user)
  }

  // 로그아웃
  async function logout() {
    await signOut(auth)
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// ─── 내부 훅 (AuthContext.tsx에서만 export) ───────────────

export function useAuthContext() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider')
  return ctx
}
```

---

## 3. useAuth 훅 (`hooks/useAuth.ts`)

```typescript
// pages.md의 모든 컴포넌트가 이 훅을 import한다
export { useAuthContext as useAuth } from '@/contexts/AuthContext'
```

> **주의:** `hooks/useAuth.ts`는 re-export 래퍼만 담는다.
> 컴포넌트는 항상 `import { useAuth } from '@/hooks/useAuth'`로 접근한다.

---

## 4. AuthGuard (`components/auth/AuthGuard.tsx`)

```tsx
'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

interface Props {
  children: React.ReactNode
}

export function AuthGuard({ children }: Props) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login')
    }
  }, [user, isLoading, router])

  // 인증 확인 중: 빈 화면 (레이아웃 깜빡임 방지)
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-secondary">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    )
  }

  // 미인증: 리디렉션 중이므로 아무것도 렌더하지 않음
  if (!user) return null

  return <>{children}</>
}
```

---

## 5. 로그인 페이지 (`app/(auth)/login/page.tsx`)

```tsx
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
    <div className="min-h-screen flex items-center justify-center bg-surface-secondary px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl p-8 shadow-card">
        {/* 로고 */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-3">
            <span className="text-white text-xl">✦</span>
          </div>
          <h1 className="text-xl font-semibold">Life Responsibility OS</h1>
          <p className="text-sm text-muted-foreground mt-1">생활 책임 관리 플랫폼</p>
        </div>

        {/* Google 로그인 */}
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
          <hr className="flex-1 border-border" />
          <span className="text-xs text-muted-foreground">또는</span>
          <hr className="flex-1 border-border" />
        </div>

        {/* 이메일 로그인 */}
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
          {error && <p className="text-xs text-danger">{error}</p>}
          <Button className="w-full" onClick={handleEmail} disabled={isLoading}>
            {isLoading ? '로그인 중...' : '로그인'}
          </Button>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          계정이 없으신가요?{' '}
          <a href="/signup" className="text-primary hover:underline">회원가입</a>
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
```

---

## 6. 회원가입 페이지 (`app/(auth)/signup/page.tsx`)

```tsx
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
    <div className="min-h-screen flex items-center justify-center bg-surface-secondary px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl p-8 shadow-card">
        <div className="text-center mb-8">
          <h1 className="text-xl font-semibold">회원가입</h1>
          <p className="text-sm text-muted-foreground mt-1">Life Responsibility OS</p>
        </div>

        <Button variant="outline" className="w-full mb-4 gap-2" onClick={async () => {
          await signInWithGoogle(); router.replace('/')
        }}>
          Google로 시작하기
        </Button>

        <div className="flex items-center gap-3 mb-4">
          <hr className="flex-1 border-border" />
          <span className="text-xs text-muted-foreground">또는</span>
          <hr className="flex-1 border-border" />
        </div>

        <div className="space-y-3">
          <Input placeholder="이름" value={name} onChange={e => setName(e.target.value)} />
          <Input type="email" placeholder="이메일" value={email} onChange={e => setEmail(e.target.value)} />
          <Input type="password" placeholder="비밀번호 (6자 이상)" value={password} onChange={e => setPassword(e.target.value)} />
          {error && <p className="text-xs text-danger">{error}</p>}
          <Button className="w-full" onClick={handleSignup} disabled={isLoading}>
            {isLoading ? '가입 중...' : '시작하기'}
          </Button>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          이미 계정이 있으신가요?{' '}
          <a href="/login" className="text-primary hover:underline">로그인</a>
        </p>
      </div>
    </div>
  )
}
```

---

## 7. (auth) 레이아웃 (`app/(auth)/layout.tsx`)

```tsx
// 인증 페이지는 대시보드 레이아웃(사이드바 등) 없이 렌더
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
```

---

## 8. 체크리스트

```
Firebase Console 설정:
 □ Authentication → 로그인 방법 → Google 공급자 활성화
 □ Authentication → 로그인 방법 → 이메일/비밀번호 공급자 활성화
 □ Authentication → 승인된 도메인에 Vercel 배포 도메인 추가

구현 검증:
 □ Google 로그인 → Firestore users/{uid} 문서 자동 생성 확인
 □ 미인증 상태에서 /categories 접근 → /login 리디렉션 확인
 □ 로그인 후 / 리디렉션 확인
 □ 새로고침 후 인증 상태 유지 확인 (onAuthStateChanged 동작)
```
