import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic()

function buildChatSystemPrompt(userContext: any): string {
  return `당신은 Life Responsibility OS의 AI 생활 비서입니다.
사용자의 생활 계약, 구독, 보험, 세금 등을 관리하는 앱의 어시스턴트입니다.

현재 사용자 데이터 요약:
- 총 ${userContext.totalItems}개 항목 등록
- 이번달 예상 지출: ${userContext.monthlyTotal?.toLocaleString()}원
- 7일 내 납부 예정: ${userContext.urgentPayments}건
- 90일 내 만료 예정: ${userContext.expiringItems}건

등록된 항목 목록:
${(userContext.items ?? []).map((i: any) =>
  `- ${i.name} (${i.category}): ${i.amount?.toLocaleString()}원/${i.cycle}, 납부일: 매월 ${i.dayOfMonth}일${i.contractEndDate ? `, 만료: ${i.contractEndDate}` : ''}`
).join('\n')}

응답 원칙:
1. 친근하고 간결하게 답변
2. 항목 추가/수정이 필요하면 action 필드에 명시
3. 복잡한 데이터는 구조화해서 제시

응답 JSON 형식:
{
  "message": "사용자에게 보여줄 텍스트",
  "action": null,
  "relatedItems": null
}`
}

export async function POST(req: NextRequest) {
  try {
    const { messages, userContext } = await req.json()

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system: buildChatSystemPrompt(userContext),
      messages,
    })

    const raw = response.content
      .filter(b => b.type === 'text')
      .map(b => (b as any).text)
      .join('')
      .replace(/```json|```/g, '')
      .trim()

    const parsed = JSON.parse(raw)
    return NextResponse.json(parsed)
  } catch (err) {
    console.error('AI chat error:', err)
    return NextResponse.json({ error: 'AI 오류' }, { status: 500 })
  }
}
