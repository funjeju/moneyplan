import { NextRequest, NextResponse } from 'next/server'
import cardsData from '@/cards/cards_parsed.json'

interface RawCard {
  카드명: string
  주요혜택: string
  연회비_및_전월실적: string
  상세혜택: Array<{ 항목: string; 내용: string }>
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.toLowerCase() ?? ''
  if (!q || q.length < 1) return NextResponse.json([])

  const results = (cardsData as RawCard[])
    .filter(c => c.카드명.toLowerCase().includes(q))
    .slice(0, 10)
    .map(c => ({
      name: c.카드명,
      topBenefit: c.주요혜택,
      annualFeeAndRequirement: c.연회비_및_전월실적,
      benefits: c.상세혜택,
    }))

  return NextResponse.json(results)
}
