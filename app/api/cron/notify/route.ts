import { NextRequest, NextResponse } from 'next/server'
import { getAdminFirestore } from '@/lib/firebase-admin'
import type { ResponsibilityItem } from '@/lib/types'

export async function GET(req: NextRequest) {
  if (req.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const today = new Date()
  const in90 = new Date(today)
  in90.setDate(in90.getDate() + 90)

  const itemsSnapshot = await getAdminFirestore()
    .collectionGroup('items')
    .where('status', '==', 'active')
    .where('contractEndDate', '<=', in90)
    .where('contractEndDate', '>=', today)
    .get()

  const notifications: any[] = []

  itemsSnapshot.docs.forEach(doc => {
    const item = doc.data() as ResponsibilityItem
    const endDate = (item.contractEndDate as any)?.toDate?.()
    if (!endDate) return

    const daysUntil = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    const thresholds = [7, 30, 90]
    const matched = thresholds.find(t => daysUntil <= t)
    if (!matched) return

    notifications.push({
      userId: item.userId,
      itemId: item.id,
      type: item.autoRenews ? 'renewal' : 'expiry',
      message: item.autoRenews
        ? `⚠️ ${item.name}이(가) ${daysUntil}일 후 자동갱신됩니다`
        : `📋 ${item.name} 약정이 ${daysUntil}일 후 종료됩니다`,
      daysUntil,
    })
  })

  const batch = getAdminFirestore().batch()
  notifications.forEach(n => {
    const ref = getAdminFirestore()
      .collection(`users/${n.userId}/notifications`)
      .doc(`${n.itemId}_${n.daysUntil}d_${today.toISOString().slice(0, 10)}`)
    batch.set(ref, { ...n, isRead: false, sentAt: new Date() }, { merge: true })
  })
  await batch.commit()

  return NextResponse.json({ processed: notifications.length })
}
