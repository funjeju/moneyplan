import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextRequest, NextResponse } from 'next/server'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!)
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

function buildSystemPrompt(userContext: any): string {
  return `당신은 Life Capsule의 AI 생활 비서입니다.
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

응답 형식: 순수 JSON만. 코드블록 없이 JSON만 출력.
{
  "message": "사용자에게 보여줄 텍스트",
  "action": null,
  "relatedItems": null
}`
}

export async function POST(req: NextRequest) {
  try {
    const { messages, userContext } = await req.json()

    const systemPrompt = buildSystemPrompt(userContext)
    const history = (messages as Array<{ role: string; content: string }>).slice(0, -1)
    const lastMessage = messages[messages.length - 1]

    const chat = model.startChat({
      history: [
        { role: 'user', parts: [{ text: systemPrompt }] },
        { role: 'model', parts: [{ text: '네, 이해했습니다. 사용자 질문에 JSON 형식으로 답변하겠습니다.' }] },
        ...history.map((m: { role: string; content: string }) => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }],
        })),
      ],
    })

    const result = await chat.sendMessage(lastMessage.content)
    const raw = result.response.text().replace(/```json|```/g, '').trim()

    const parsed = JSON.parse(raw)
    return NextResponse.json(parsed)
  } catch (err) {
    console.error('AI chat error:', err)
    return NextResponse.json({ error: 'AI 오류' }, { status: 500 })
  }
}
