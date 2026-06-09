import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from '@/lib/firebase'

export async function uploadParseImages(userId: string, files: File[]): Promise<string[]> {
  return Promise.all(
    files.map(async (file) => {
      const ext = file.name.split('.').pop() ?? 'jpg'
      const path = `users/${userId}/parse-images/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const storageRef = ref(storage, path)
      await uploadBytes(storageRef, file)
      return getDownloadURL(storageRef)
    })
  )
}
