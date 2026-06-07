import { Sidebar } from '@/components/layout/Sidebar'
import { BottomNav } from '@/components/layout/BottomNav'
import { AIInputBar } from '@/components/ai/AIInputBar'
import { AuthGuard } from '@/components/auth/AuthGuard'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-[#F8F9FC]">
        <Sidebar className="hidden lg:flex" />
        <main className="flex-1 lg:ml-64 pb-36 lg:pb-20">
          {children}
        </main>
        <BottomNav className="lg:hidden" />
        <AIInputBar />
      </div>
    </AuthGuard>
  )
}
