import type { Metadata } from 'next'
import { DemoCategoryPage } from '@/components/demo/DemoCategoryPage'
import { CATEGORY_META } from '@/lib/utils/category'
import type { CategorySlug } from '@/lib/types'
import { notFound } from 'next/navigation'

interface Props { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return Object.keys(CATEGORY_META).map(slug => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const meta = CATEGORY_META[slug as CategorySlug]
  if (!meta) return {}
  return {
    title: `${meta.label} 관리 체험 | Life Capsule`,
    description: `${meta.label} 항목 관리 체험판. 납부일·만료일·자동결제 여부를 한눈에 확인하세요.`,
  }
}

export default async function DemoCategoryRoute({ params }: Props) {
  const { slug } = await params
  if (!CATEGORY_META[slug as CategorySlug]) notFound()
  return <DemoCategoryPage slug={slug as CategorySlug} />
}
