'use client'
import { useState, useEffect } from 'react'
import { X, Download, Bell } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function InstallBanner() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    // 이미 설치된 경우
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
      return
    }

    const dismissed = localStorage.getItem('pwa-banner-dismissed')
    if (dismissed) { setDismissed(true); return }

    const handler = (e: Event) => {
      e.preventDefault()
      setInstallPrompt(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  if (isInstalled || dismissed || !installPrompt) return null

  const handleInstall = async () => {
    if (!installPrompt) return
    await installPrompt.prompt()
    const { outcome } = await installPrompt.userChoice
    if (outcome === 'accepted') setIsInstalled(true)
    setInstallPrompt(null)
  }

  const handleDismiss = () => {
    localStorage.setItem('pwa-banner-dismissed', '1')
    setDismissed(true)
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-[#6C63FF] text-white px-4 py-3 flex items-center gap-3 shadow-lg">
      <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
        <span className="text-lg">✦</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold">홈화면에 추가하세요</p>
        <p className="text-xs opacity-80 mt-0.5">앱 설치 시 납부·만료 알림을 받을 수 있어요</p>
      </div>
      <button
        onClick={handleInstall}
        className="flex-shrink-0 bg-white text-[#6C63FF] text-xs font-bold px-3 py-1.5 rounded-full hover:bg-white/90 transition-colors flex items-center gap-1"
      >
        <Download size={12} /> 설치
      </button>
      <button onClick={handleDismiss} className="text-white/60 hover:text-white p-1 flex-shrink-0">
        <X size={16} />
      </button>
    </div>
  )
}
