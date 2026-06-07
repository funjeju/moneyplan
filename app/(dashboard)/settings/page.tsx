'use client'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'

export default function SettingsPage() {
  const { user, logout } = useAuth()

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-xl font-semibold mb-6">설정</h1>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <p className="text-xs text-gray-400 mb-1">계정</p>
          <p className="font-medium">{user?.displayName || '이름 없음'}</p>
          <p className="text-sm text-gray-400">{user?.email}</p>
        </div>
        <div className="p-5">
          <Button variant="outline" onClick={logout} className="text-red-500 border-red-200 hover:bg-red-50">
            로그아웃
          </Button>
        </div>
      </div>
    </div>
  )
}
