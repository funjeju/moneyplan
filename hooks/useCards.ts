import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/hooks/useAuth'
import * as cardsDB from '@/lib/firestore/cards'
import type { CreditCard } from '@/lib/types'

export function useCards() {
  const { user } = useAuth()
  const qc = useQueryClient()

  const query = useQuery({
    queryKey: ['cards', user?.uid],
    queryFn: () => cardsDB.getCards(user!.uid),
    enabled: !!user,
    staleTime: 60_000,
  })

  const addMutation = useMutation({
    mutationFn: (data: Omit<CreditCard, 'id' | 'userId' | 'createdAt'>) =>
      cardsDB.addCard(user!.uid, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cards', user?.uid] }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => cardsDB.deleteCard(user!.uid, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cards', user?.uid] }),
  })

  return {
    cards: query.data ?? [],
    isLoading: query.isLoading,
    addCard: addMutation.mutate,
    deleteCard: deleteMutation.mutate,
  }
}
