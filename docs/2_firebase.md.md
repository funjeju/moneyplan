# Life Responsibility OS — firebase.md
> Firebase 초기화, Firestore CRUD, 스토리지, 인증 구현 가이드

---

## 1. Firebase 프로젝트 설정

```bash
# 1. Firebase 프로젝트 생성
#    https://console.firebase.google.com → 새 프로젝트

# 2. 다음 서비스 활성화
#    - Firestore Database (native mode)
#    - Authentication (Google + Email 공급자)
#    - Storage
#    - Functions (알림 크론용)

# 3. 패키지 설치
npm install firebase firebase-admin
```

---

## 2. 클라이언트 초기화 (`lib/firebase.ts`)

```typescript
import { initializeApp, getApps } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]

export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)
export const googleProvider = new GoogleAuthProvider()
```

---

## 3. Admin SDK 초기화 (`lib/firebase-admin.ts`)

```typescript
// API 라우트, 크론에서 사용
import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getAuth } from 'firebase-admin/auth'

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  })
}

export const adminFirestore = getFirestore()
export const adminAuth = getAuth()
```

---

## 4. Firestore CRUD 구현 (`lib/firestore/items.ts`)

```typescript
import {
  collection, doc, getDocs, addDoc, updateDoc, deleteDoc,
  query, where, orderBy, onSnapshot, Timestamp,
  type QueryConstraint,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { ResponsibilityItem } from '@/lib/types'

// 컬렉션 경로
const itemsRef = (userId: string) => collection(db, `users/${userId}/items`)
const itemRef = (userId: string, itemId: string) => doc(db, `users/${userId}/items/${itemId}`)

// ─── 읽기 ───────────────────────────────────────────────

/** 전체 항목 조회 */
export async function getItems(userId: string): Promise<ResponsibilityItem[]> {
  const q = query(itemsRef(userId), where('isArchived', '==', false), orderBy('updatedAt', 'desc'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as ResponsibilityItem))
}

/** 카테고리별 항목 조회 */
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

/** 실시간 구독 (메인 대시보드용) */
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

/** 90일 내 만료 항목 조회 */
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

// ─── 쓰기 ───────────────────────────────────────────────

/** 항목 추가 */
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

/** 여러 항목 일괄 추가 (AI 파싱 결과) */
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

/** 항목 수정 */
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

/** 항목 삭제 (소프트 삭제) */
export async function archiveItem(userId: string, itemId: string): Promise<void> {
  await updateDoc(itemRef(userId, itemId), {
    isArchived: true,
    status: 'cancelled',
    updatedAt: Timestamp.now(),
  })
}

/** 항목 영구 삭제 */
export async function deleteItem(userId: string, itemId: string): Promise<void> {
  await deleteDoc(itemRef(userId, itemId))
}
```

---

## 5. 카드 CRUD (`lib/firestore/cards.ts`)

```typescript
import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { CreditCard } from '@/lib/types'

const cardsRef = (userId: string) => collection(db, `users/${userId}/cards`)
const cardRef = (userId: string, cardId: string) => doc(db, `users/${userId}/cards/${cardId}`)

export async function getCards(userId: string): Promise<CreditCard[]> {
  const q = query(cardsRef(userId), orderBy('isPrimary', 'desc'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as CreditCard))
}

export async function addCard(userId: string, data: Omit<CreditCard, 'id' | 'userId' | 'createdAt'>): Promise<string> {
  const ref = await addDoc(cardsRef(userId), {
    ...data,
    userId,
    isActive: true,
    createdAt: new Date(),
  })
  return ref.id
}

export async function updateCard(userId: string, cardId: string, data: Partial<CreditCard>): Promise<void> {
  await updateDoc(cardRef(userId, cardId), data)
}

export async function deleteCard(userId: string, cardId: string): Promise<void> {
  await deleteDoc(cardRef(userId, cardId))
}
```

---

## 6. Storage (파일 첨부) (`lib/firestore/storage.ts`)

```typescript
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage'
import { storage } from '@/lib/firebase'
import type { Attachment } from '@/lib/types'

/** 파일 업로드 (진행률 콜백 포함) */
export function uploadAttachment(
  userId: string,
  itemId: string,
  file: File,
  onProgress?: (progress: number) => void
): Promise<Attachment> {
  return new Promise((resolve, reject) => {
    const ext = file.name.split('.').pop()
    const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
    const storageRef = ref(storage, `users/${userId}/items/${itemId}/${fileName}`)

    const task = uploadBytesResumable(storageRef, file)

    task.on(
      'state_changed',
      snapshot => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        onProgress?.(progress)
      },
      reject,
      async () => {
        const url = await getDownloadURL(task.snapshot.ref)
        resolve({
          id: fileName,
          name: file.name,
          url,
          type: inferAttachmentType(file.name),
          uploadedAt: new Date() as any,
        })
      }
    )
  })
}

/** 파일 삭제 */
export async function deleteAttachment(url: string): Promise<void> {
  const storageRef = ref(storage, url)
  await deleteObject(storageRef)
}

function inferAttachmentType(filename: string): Attachment['type'] {
  const name = filename.toLowerCase()
  if (name.includes('계약') || name.includes('contract')) return 'contract'
  if (name.includes('영수증') || name.includes('receipt')) return 'receipt'
  if (name.includes('고지') || name.includes('invoice')) return 'invoice'
  if (name.includes('증권') || name.includes('certificate')) return 'certificate'
  return 'other'
}
```

---

## 7. React Query 훅 (`hooks/useItems.ts`)

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/hooks/useAuth'
import * as itemsDB from '@/lib/firestore/items'
import type { ResponsibilityItem } from '@/lib/types'

export function useItems(category?: string) {
  const { user } = useAuth()
  const qc = useQueryClient()

  const query = useQuery({
    queryKey: ['items', user?.uid, category],
    queryFn: () => category
      ? itemsDB.getItemsByCategory(user!.uid, category)
      : itemsDB.getItems(user!.uid),
    enabled: !!user,
    staleTime: 30_000,
  })

  const addMutation = useMutation({
    mutationFn: (data: Partial<ResponsibilityItem>) =>
      itemsDB.addItem(user!.uid, data as any),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['items', user?.uid] }),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ResponsibilityItem> }) =>
      itemsDB.updateItem(user!.uid, id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['items', user?.uid] }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => itemsDB.archiveItem(user!.uid, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['items', user?.uid] }),
  })

  const addItems = async (dataList: Partial<ResponsibilityItem>[]) => {
    await itemsDB.addItems(user!.uid, dataList)
    qc.invalidateQueries({ queryKey: ['items', user?.uid] })
  }

  return {
    items: query.data ?? [],
    isLoading: query.isLoading,
    addItem: addMutation.mutate,
    updateItem: updateMutation.mutate,
    deleteItem: deleteMutation.mutate,
    addItems,
  }
}

export function useExpiringItems() {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['items', user?.uid, 'expiring'],
    queryFn: () => itemsDB.getExpiringItems(user!.uid),
    enabled: !!user,
    staleTime: 60_000,
  })
}
```

---

## 8. Firestore 인덱스 설정 (`firestore.indexes.json`)

```json
{
  "indexes": [
    {
      "collectionGroup": "items",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "isArchived", "order": "ASCENDING" },
        { "fieldPath": "category", "order": "ASCENDING" },
        { "fieldPath": "updatedAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "items",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "isArchived", "order": "ASCENDING" },
        { "fieldPath": "contractEndDate", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "items",
      "queryScope": "COLLECTION_GROUP",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "contractEndDate", "order": "ASCENDING" }
      ]
    }
  ]
}
```

---

## 9. 보안 규칙 (`firestore.rules`)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // 사용자 본인만 접근 가능
    function isOwner(userId) {
      return request.auth != null && request.auth.uid == userId;
    }

    // 유효한 카테고리 확인
    function validCategory(cat) {
      return cat in ['telecom','utility','insurance','subscription','rental',
                     'tax','penalty','vehicle','housing','finance','business','other'];
    }

    match /users/{userId} {
      allow read, write: if isOwner(userId);

      match /items/{itemId} {
        allow read: if isOwner(userId);
        allow create: if isOwner(userId)
          && request.resource.data.name is string
          && request.resource.data.name.size() > 0
          && validCategory(request.resource.data.category)
          && request.resource.data.amount is number;
        allow update: if isOwner(userId);
        allow delete: if isOwner(userId);
      }

      match /cards/{cardId} {
        allow read, write: if isOwner(userId);
      }

      match /notifications/{notifId} {
        allow read, write: if isOwner(userId);
      }
    }
  }
}
```

---

## 10. 배포 체크리스트

```bash
# Firebase 배포
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
firebase deploy --only storage

# Vercel 환경 변수 설정 (Vercel Dashboard에서)
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
FIREBASE_ADMIN_PRIVATE_KEY
FIREBASE_ADMIN_CLIENT_EMAIL
ANTHROPIC_API_KEY
CRON_SECRET

# vercel.json (크론 설정)
{
  "crons": [
    {
      "path": "/api/cron/notify",
      "schedule": "0 9 * * *"
    }
  ]
}
```
