import {
  collection, doc, getDocs, addDoc, updateDoc, deleteDoc,
  query, where, orderBy, onSnapshot, Timestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { ResponsibilityItem } from '@/lib/types'

const itemsRef = (userId: string) => collection(db, `users/${userId}/items`)
const itemRef = (userId: string, itemId: string) => doc(db, `users/${userId}/items/${itemId}`)

export async function getItems(userId: string): Promise<ResponsibilityItem[]> {
  const q = query(itemsRef(userId), where('isArchived', '==', false), orderBy('updatedAt', 'desc'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as ResponsibilityItem))
}

export async function getItemsByCategory(
  userId: string,
  category: string
): Promise<ResponsibilityItem[]> {
  const q = query(
    itemsRef(userId),
    where('category', '==', category),
    where('isArchived', '==', false),
    orderBy('updatedAt', 'desc')
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as ResponsibilityItem))
}

export function subscribeItems(
  userId: string,
  callback: (items: ResponsibilityItem[]) => void
): () => void {
  const q = query(
    itemsRef(userId),
    where('isArchived', '==', false),
    orderBy('updatedAt', 'desc')
  )
  return onSnapshot(q, snapshot => {
    callback(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as ResponsibilityItem)))
  })
}

export async function getExpiringItems(userId: string): Promise<ResponsibilityItem[]> {
  const now = Timestamp.now()
  const in90 = Timestamp.fromDate(new Date(Date.now() + 90 * 24 * 60 * 60 * 1000))
  const q = query(
    itemsRef(userId),
    where('contractEndDate', '>=', now),
    where('contractEndDate', '<=', in90),
    orderBy('contractEndDate', 'asc')
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as ResponsibilityItem))
}

export async function addItem(
  userId: string,
  data: Omit<ResponsibilityItem, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const now = Timestamp.now()
  const ref = await addDoc(itemsRef(userId), {
    ...data,
    userId,
    status: data.status ?? 'active',
    isArchived: false,
    aiParsed: data.aiParsed ?? false,
    createdAt: now,
    updatedAt: now,
  })
  return ref.id
}

export async function addItems(
  userId: string,
  dataList: Partial<ResponsibilityItem>[]
): Promise<string[]> {
  const ids = await Promise.all(
    dataList.map(data =>
      addItem(userId, {
        name: data.name ?? '미입력',
        category: data.category ?? 'other',
        amount: data.amount ?? 0,
        cycle: data.cycle ?? 'monthly',
        isAutoPayment: data.isAutoPayment ?? false,
        autoRenews: data.autoRenews ?? false,
        provider: data.provider ?? '',
        aiParsed: true,
        ...data,
      } as any)
    )
  )
  return ids
}

export async function updateItem(
  userId: string,
  itemId: string,
  data: Partial<ResponsibilityItem>
): Promise<void> {
  await updateDoc(itemRef(userId, itemId), {
    ...data,
    updatedAt: Timestamp.now(),
  })
}

export async function archiveItem(userId: string, itemId: string): Promise<void> {
  await updateDoc(itemRef(userId, itemId), {
    isArchived: true,
    status: 'cancelled',
    updatedAt: Timestamp.now(),
  })
}

export async function deleteItem(userId: string, itemId: string): Promise<void> {
  await deleteDoc(itemRef(userId, itemId))
}
