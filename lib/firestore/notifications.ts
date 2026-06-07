import {
  collection, doc, getDocs, updateDoc,
  query, orderBy, where, Timestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { NotificationRecord } from '@/lib/types'

const notifRef = (userId: string) => collection(db, `users/${userId}/notifications`)

export async function getNotifications(userId: string): Promise<NotificationRecord[]> {
  const q = query(notifRef(userId), orderBy('sentAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as NotificationRecord))
}

export async function getUnreadCount(userId: string): Promise<number> {
  const q = query(notifRef(userId), where('isRead', '==', false))
  const snap = await getDocs(q)
  return snap.size
}

export async function markAsRead(userId: string, notifId: string): Promise<void> {
  await updateDoc(doc(db, `users/${userId}/notifications/${notifId}`), { isRead: true })
}

export async function markAllAsRead(userId: string): Promise<void> {
  const notifs = await getNotifications(userId)
  const unread = notifs.filter(n => !n.isRead)
  await Promise.all(unread.map(n => markAsRead(userId, n.id)))
}
