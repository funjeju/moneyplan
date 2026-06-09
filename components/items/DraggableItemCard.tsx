'use client'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { ItemCard } from './ItemCard'
import type { ResponsibilityItem } from '@/lib/types'

interface Props {
  item: ResponsibilityItem
  onClick?: () => void
}

export function DraggableItemCard({ item, onClick }: Props) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: item.id,
    data: { item },
  })

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 50 : undefined,
  }

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <ItemCard item={item} onClick={isDragging ? undefined : onClick} />
    </div>
  )
}
