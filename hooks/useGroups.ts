import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/hooks/useAuth'
import * as groupsDB from '@/lib/firestore/groups'
import type { ItemGroup, CategorySlug } from '@/lib/types'

export function useGroups() {
  const { user } = useAuth()
  const qc = useQueryClient()

  const query = useQuery({
    queryKey: ['groups', user?.uid],
    queryFn: () => groupsDB.getGroups(user!.uid),
    enabled: !!user,
    staleTime: 30_000,
  })

  const addMutation = useMutation({
    mutationFn: (data: { name: string; category: CategorySlug; provider?: string; memo?: string }) =>
      groupsDB.addGroup(user!.uid, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['groups', user?.uid] }),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Pick<ItemGroup, 'name' | 'category' | 'provider' | 'memo'>> }) =>
      groupsDB.updateGroup(user!.uid, id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['groups', user?.uid] })
      qc.invalidateQueries({ queryKey: ['group', id] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => groupsDB.deleteGroup(user!.uid, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['groups', user?.uid] }),
  })

  return {
    groups: query.data ?? [],
    isLoading: query.isLoading,
    addGroup: addMutation.mutateAsync,
    updateGroup: updateMutation.mutate,
    deleteGroup: deleteMutation.mutate,
  }
}
