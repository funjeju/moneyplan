import { NextRequest, NextResponse } from 'next/server'
import cardsData from '@/cards/cards_parsed.json'

const ISSUERS = [
  '신한카드', '삼성카드', '현대카드', 'KB국민카드', '롯데카드',
  '우리카드', '하나카드', 'BC카드', 'NH농협카드', 'IBK기업은행',
  '씨티카드', '카카오뱅크', '토스뱅크', 'iM뱅크', '수협은행',
  '광주은행', '제주은행', '전북은행',
]

function detectIssuer(cardName: string): string {
  for (const issuer of ISSUERS) {
    if (cardName.includes(issuer)) return issuer
  }
  if (cardName.includes('BC') || cardName.includes('바로카드')) return 'BC카드'
  if (cardName.includes('현대백화점')) return '현대카드'
  return '기타'
}

function cleanCardName(cardName: string): string {
  let name = cardName
  for (const issuer of ISSUERS) {
    name = name.replace(new RegExp(issuer + '$'), '').trim()
  }
  return name || cardName
}

interface RawCard {
  카드명: string
  주요혜택: string
  연회비_및_전월실적: string
  상세혜택: Array<{ 항목: string; 내용: string }>
}

// GET /api/cards/search?issuer=신한카드&q=검색어
export async function GET(req: NextRequest) {
  const issuer = req.nextUrl.searchParams.get('issuer') ?? ''
  const q = req.nextUrl.searchParams.get('q')?.toLowerCase() ?? ''

  // 발급사 목록 반환
  if (req.nextUrl.searchParams.get('issuers') === '1') {
    const counts: Record<string, number> = {}
    for (const card of cardsData as RawCard[]) {
      const i = detectIssuer(card.카드명)
      counts[i] = (counts[i] ?? 0) + 1
    }
    const list = ISSUERS.filter(i => counts[i]).map(i => ({ issuer: i, count: counts[i] }))
    if (counts['기타']) list.push({ issuer: '기타', count: counts['기타'] })
    return NextResponse.json(list)
  }

  let results = cardsData as RawCard[]

  if (issuer) {
    results = results.filter(c => detectIssuer(c.카드명) === issuer)
  }

  if (q) {
    results = results.filter(c =>
      c.카드명.toLowerCase().includes(q) ||
      c.주요혜택.toLowerCase().includes(q) ||
      c.상세혜택.some(b => b.항목.toLowerCase().includes(q) || b.내용.toLowerCase().includes(q))
    )
  }

  return NextResponse.json(
    results.slice(0, 30).map(c => ({
      name: c.카드명,
      cleanName: cleanCardName(c.카드명),
      issuer: detectIssuer(c.카드명),
      topBenefit: c.주요혜택,
      annualFeeAndRequirement: c.연회비_및_전월실적,
      benefits: c.상세혜택,
    }))
  )
}
