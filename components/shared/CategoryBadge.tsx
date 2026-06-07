import { CATEGORY_META } from '@/lib/utils/category'
import type { CategorySlug } from '@/lib/types'

interface Props {
  category: CategorySlug
  size?: 'sm' | 'md'
}

export function CategoryBadge({ category, size = 'md' }: Props) {
  const meta = CATEGORY_META[category]
  if (!meta) return null

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${
        size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-xs'
      }`}
      style={{ background: meta.color, color: meta.textColor }}
    >
      {meta.label}
    </span>
  )
}
