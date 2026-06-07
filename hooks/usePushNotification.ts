'use client'
import { useState, useEffect } from 'react'
import {
  registerServiceWorker,
  requestPushPermission,
  subscribePush,
  unsubscribePush,
  getPushSubscription,
} from '@/lib/push'
import { getAuthInstance } from '@/lib/firebase'

export type PushStatus = 'unsupported' | 'denied' | 'granted' | 'default' | 'loading'

async function getIdToken(): Promise<string | null> {
  try {
    const user = getAuthInstance().currentUser
    return user ? await user.getIdToken() : null
  } catch {
    return null
  }
}

export function usePushNotification() {
  const [status, setStatus] = useState<PushStatus>('loading')
  const [isSubscribed, setIsSubscribed] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!('Notification' in window)) { setStatus('unsupported'); return }
    setStatus(Notification.permission as PushStatus)
    getPushSubscription().then(sub => setIsSubscribed(!!sub))
  }, [])

  const enable = async () => {
    const permission = await requestPushPermission()
    setStatus(permission)
    if (permission !== 'granted') return false

    const reg = await registerServiceWorker()
    if (!reg) return false

    const sub = await subscribePush(reg)
    if (!sub) return false

    setIsSubscribed(true)
    const idToken = await getIdToken()
    await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscription: sub, idToken }),
    }).catch(() => {})
    return true
  }

  const disable = async () => {
    const sub = await getPushSubscription()
    if (sub) {
      await fetch('/api/push/subscribe', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: sub.endpoint }),
      }).catch(() => {})
    }
    const reg = await navigator.serviceWorker?.ready
    if (reg) await unsubscribePush(reg)
    setIsSubscribed(false)
  }

  const sendTest = async () => {
    const idToken = await getIdToken()
    const res = await fetch('/api/push/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    })
    return res.json()
  }

  return { status, isSubscribed, enable, disable, sendTest }
}
