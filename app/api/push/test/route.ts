import { NextRequest, NextResponse } from 'next/server'
import { getAdminFirestore, getAdminAuth } from '@/lib/firebase-admin'
import { sendPush } from '@/lib/webpush'

export async function POST(req: NextRequest) {
  try {
    const { idToken } = await req.json().catch(() => ({}))
    let userId = 'anonymous'
    if (idToken) {
      try {
        const decoded = await getAdminAuth().verifyIdToken(idToken)
        userId = decoded.uid
      } catch {}
    }

    const db = getAdminFirestore()
    const snap = await db.collection('push_subscriptions')
      .where('userId', '==', userId).get()

    if (snap.empty) {
      return NextResponse.json({ ok: false, message: '등록된 구독 없음' })
    }

    const results = await Promise.all(
      snap.docs.map(d => sendPush(d.data().subscription, {
        title: 'Life Capsule 테스트 알림 ✦',
        body: '알림이 정상적으로 작동하고 있어요!',
        url: '/',
        tag: 'test',
      }))
    )

    return NextResponse.json({ ok: true, sent: results.filter(r => r === true).length })
  } catch (err) {
    console.error('push test error:', err)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
