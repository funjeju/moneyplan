import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { CreditCard } from '@/lib/types'

const cardsRef = (userId: string) => collection(db, `users/${userId}/cards`)
const cardRef = (userId: string, cardId: string) => doc(db, `users/${userId}/cards/${cardId}`)

export async function getCards(userId: string): Promise<CreditCard[]> {
  const snapshot = await getDocs(cardsRef(userId))
  return snapshot.docs
    .map(d => ({ id: d.id, ...d.data() } as CreditCard))
    .sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0))
}

export async function addCard(
  userId: string,
  data: Omit<CreditCard, 'id' | 'userId' | 'createdAt'>
): Promise<string> {
  const clean = Object.fromEntries(
    Object.entries({ ...data, userId, isActive: true, createdAt: Timestamp.now() })
      .filter(([, v]) => v !== undefined)
  )
  const ref = await addDoc(cardsRef(userId), clean)
  return ref.id
}

export async function updateCard(
  userId: string,
  cardId: string,
  data: Partial<CreditCard>
): Promise<void> {
  await updateDoc(cardRef(userId, cardId), data)
}

export async function deleteCard(userId: string, cardId: string): Promise<void> {
  await deleteDoc(cardRef(userId, cardId))
}
