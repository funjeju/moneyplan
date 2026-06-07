import { NextRequest, NextResponse } from 'next/server'
import { getAdminFirestore, getAdminAuth } from '@/lib/firebase-admin'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { subscription, idToken } = body

    let userId = 'anonymous'
    if (idToken) {
      try {
        const decoded = await getAdminAuth().verifyIdToken(idToken)
        userId = decoded.uid
      } catch {}
    }

    const db = getAdminFirestore()
    // 기존 구독 업데이트 or 신규 저장
    const existing = await db.collection('push_subscriptions')
      .where('endpoint', '==', subscription.endpoint).get()

    if (existing.empty) {
      await db.collection('push_subscriptions').add({
        userId,
        endpoint: subscription.endpoint,
        subscription,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    } else {
      await existing.docs[0].ref.update({ userId, subscription, updatedAt: new Date() })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('push subscribe error:', err)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { endpoint } = await req.json()
    const db = getAdminFirestore()
    const snap = await db.collection('push_subscriptions')
      .where('endpoint', '==', endpoint).get()
    await Promise.all(snap.docs.map(d => d.ref.delete()))
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
