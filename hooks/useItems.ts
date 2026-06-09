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
    onError: (err: any) => {
      console.error('[addItem error]', err?.message ?? err)
      alert('항목 저장 실패: ' + (err?.message ?? String(err)))
    },
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
