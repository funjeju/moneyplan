import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { ItemGroup, CategorySlug } from '@/lib/types'

const groupsRef = (userId: string) => collection(db, `users/${userId}/groups`)
const groupRef = (userId: string, groupId: string) => doc(db, `users/${userId}/groups/${groupId}`)

export async function getGroups(userId: string): Promise<ItemGroup[]> {
  const snapshot = await getDocs(groupsRef(userId))
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as ItemGroup))
}

export async function addGroup(
  userId: string,
  data: { name: string; category: CategorySlug; provider?: string; memo?: string }
): Promise<string> {
  const now = Timestamp.now()
  const ref = await addDoc(groupsRef(userId), { ...data, userId, createdAt: now, updatedAt: now })
  return ref.id
}

export async function updateGroup(
  userId: string,
  groupId: string,
  data: Partial<Pick<ItemGroup, 'name' | 'category' | 'provider' | 'memo'>>
): Promise<void> {
  await updateDoc(groupRef(userId, groupId), { ...data, updatedAt: Timestamp.now() })
}

export async function deleteGroup(userId: string, groupId: string): Promise<void> {
  await deleteDoc(groupRef(userId, groupId))
}
