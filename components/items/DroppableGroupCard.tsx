'use client'
import { useDroppable } from '@dnd-kit/core'
import { GroupCard } from './GroupCard'
import type { ItemGroup, ResponsibilityItem } from '@/lib/types'

interface Props {
  group: ItemGroup
  items: ResponsibilityItem[]
  onClick?: () => void
}

export function DroppableGroupCard({ group, items, onClick }: Props) {
  const { setNodeRef, isOver } = useDroppable({
    id: `group-${group.id}`,
    data: { groupId: group.id },
  })

  return (
    <div
      ref={setNodeRef}
      className={`rounded-2xl transition-all ${isOver ? 'ring-2 ring-[#6C63FF] ring-offset-2 scale-[1.02]' : ''}`}
    >
      {isOver && (
        <div className="text-center text-xs text-[#6C63FF] font-medium mb-1 animate-pulse">
          여기에 놓으면 그룹에 추가됩니다
        </div>
      )}
      <GroupCard group={group} items={items} onClick={onClick} />
    </div>
  )
}
