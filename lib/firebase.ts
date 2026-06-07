import { initializeApp, getApps, type FirebaseApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, type Auth } from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'
import { getStorage, type FirebaseStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

let app: FirebaseApp
let _auth: Auth
let _db: Firestore
let _storage: FirebaseStorage
let _googleProvider: GoogleAuthProvider

function getApp() {
  if (!app) {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
  }
  return app
}

export function getAuthInstance() {
  if (!_auth) _auth = getAuth(getApp())
  return _auth
}

export function getDbInstance() {
  if (!_db) _db = getFirestore(getApp())
  return _db
}

export function getStorageInstance() {
  if (!_storage) _storage = getStorage(getApp())
  return _storage
}

export function getGoogleProvider() {
  if (!_googleProvider) _googleProvider = new GoogleAuthProvider()
  return _googleProvider
}

// Legacy exports for backward compat — only use on client
export const auth = typeof window !== 'undefined' ? getAuthInstance() : ({} as Auth)
export const db = typeof window !== 'undefined' ? getDbInstance() : ({} as Firestore)
export const storage = typeof window !== 'undefined' ? getStorageInstance() : ({} as FirebaseStorage)
export const googleProvider = typeof window !== 'undefined' ? getGoogleProvider() : new GoogleAuthProvider()
