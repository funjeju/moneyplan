import type { Metadata } from 'next'
import { DEMO_ITEMS } from '@/lib/demo-data'
import { DemoItemDetail } from '@/components/demo/DemoItemDetail'
import { notFound } from 'next/navigation'
import { CATEGORY_META } from '@/lib/utils/category'

interface Props { params: Promise<{ id: string }> }

export async function generateStaticParams() {
  return DEMO_ITEMS.map(i => ({ id: i.id }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const item = DEMO_ITEMS.find(i => i.id === id)
  if (!item) return {}
  const meta = CATEGORY_META[item.category]
  return {
    title: `${item.name} 상세 — ${meta.label} 관리 체험 | Life Capsule`,
    description: `${item.provider ? item.provider + ' · ' : ''}${meta.label} ${item.name} — 납부일, 만료일, AI 분석, 카드 혜택 달성률까지 한눈에 확인하는 생활비 관리 체험판. ${item.memo ?? ''}`,
  }
}

function serializeItem(item: (typeof DEMO_ITEMS)[0]) {
  return {
    ...item,
    contractEndDate: item.contractEndDate
      ? item.contractEndDate.toDate().toISOString()
      : null,
    createdAt: item.createdAt?.toDate().toISOString() ?? null,
    updatedAt: item.updatedAt?.toDate().toISOString() ?? null,
  }
}

export default async function DemoItemDetailPage({ params }: Props) {
  const { id } = await params
  const item = DEMO_ITEMS.find(i => i.id === id)
  if (!item) notFound()
  return <DemoItemDetail item={serializeItem(item) as any} />
}
